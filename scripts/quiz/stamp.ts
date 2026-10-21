/**
 * pnpm quiz:stamp <id…> | --all-stale [--fetch]
 * pnpm quiz:stamp --titles   (only the link titles, on every question: after a heading or page title changes)
 *
 * Run after a person has reviewed a question against its source. Fills in or refreshes its hashes:
 * - docs sources: `sectionHash`, `title` (the link's label, added after `sectionHash` if missing),
 *   and `blockHash` when `block` is set;
 * - code sources: `linesHash` for the pinned lines, then re-pins to the tracked branch's head
 *   (new commit, and the new line range if the same lines moved).
 * Never changes a question's text. Only the hash, commit and line-range values are rewritten, in
 * place in the file's text, so comments, quoting and layout survive byte for byte.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isMap, isScalar, isSeq, parseDocument, type YAMLMap } from 'yaml'
import { REPOS, type Repo } from '../../quiz/schema.ts'
import { readAllPages, ROOT, sourceTitle } from './lib/docs.ts'
import { fetchRepo, findMoved, linesHash, readAt, sliceLines, trackedHead } from './lib/source.ts'
import { loadBank } from './lib/bank.ts'

const argv = process.argv.slice(2)
const titlesOnly = argv.includes('--titles')
const allStale = argv.includes('--all-stale') || titlesOnly
const ids = new Set(argv.filter(a => !a.startsWith('--')))
if (!allStale && ids.size === 0) {
  console.error('Usage: pnpm quiz:stamp <id…> | --all-stale [--fetch] | --titles')
  process.exit(1)
}
if (argv.includes('--fetch')) for (const repo of Object.keys(REPOS) as Repo[]) fetchRepo(repo)

const pages = await readAllPages()
const { questions } = loadBank()
const files = new Map<string, string[]>()
for (const lq of questions) {
  if (allStale || ids.has(lq.question.id)) files.set(lq.file, [...(files.get(lq.file) ?? []), lq.question.id])
}
for (const id of ids) if (!questions.some(lq => lq.question.id === id)) console.error(`No question with id ${id}`)

type Edit = { start: number, end: number, text: string }
let edits: Edit[] = []
let source = ''

let changed = 0
for (const [file, fileIds] of files) {
  const path = join(ROOT, file)
  source = readFileSync(path, 'utf8')
  edits = []
  const doc = parseDocument(source)
  const list = doc.get('questions')
  if (!isSeq(list)) continue
  for (const item of list.items) {
    if (!isMap(item)) continue
    const id = String(item.get('id'))
    if (!fileIds.includes(id)) continue
    const sources = item.get('sources')
    if (!isSeq(sources)) continue
    for (const node of sources.items) {
      if (!isMap(node)) continue
      const docs = node.get('kind') === 'docs'
      if (titlesOnly && !docs) continue
      const note = docs ? stampDocs(node, id) : await stampCode(node, id)
      if (note) {
        console.log(`${id}: ${note}`)
        changed++
      }
    }
  }
  if (edits.length) {
    let out = source
    for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end)
    writeFileSync(path, out)
  }
}
console.log(changed ? `${changed} sources stamped.` : 'Nothing to stamp.')

/** Rewrites one value in the file's text, keeping its quoting. */
function set(node: YAMLMap, key: string, value: string | [number, number]): boolean {
  const target = node.get(key, true) as { range?: [number, number, number] } | undefined
  if (!target?.range) throw new Error(`no ${key} to stamp; add it with a placeholder such as 'sha256:0000000000000000'`)
  if (Array.isArray(value)) {
    const current = (node.get(key) as { items: unknown[] }).items.map(i => (isScalar(i) ? i.value : i))
    if (current[0] === value[0] && current[1] === value[1]) return false
    edits.push({ start: target.range[0], end: target.range[1], text: `[${value[0]}, ${value[1]}]` })
    return true
  }
  if (node.get(key) === value) return false
  const quote = /^['"]/.test(source[target.range[0]]) ? source[target.range[0]] : ''
  edits.push({ start: target.range[0], end: target.range[1], text: quoted(value, quote) })
  return true
}

/** The value in the quoting it had, escaped for it; a plain value that YAML would misread gets single quotes. */
function quoted(value: string, quote: string): string {
  if (quote === '"') return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  if (quote === '\'' || /^[\s'"&*!|>%@`#,[\]{}?:-]|: | #|\s$/.test(value)) return `'${value.replace(/'/g, "''")}'`
  return value
}

/** Sets `title`, adding it after `sectionHash` in the source's own style when it's missing. */
function setTitle(node: YAMLMap, title: string): boolean {
  if (node.has('title')) return set(node, 'title', title)
  const after = node.get('sectionHash', true) as { range?: [number, number, number] } | undefined
  if (!after?.range) return false
  const quotedTitle = quoted(title, '\'')
  if (node.flow) {
    edits.push({ start: after.range[1], end: after.range[1], text: `, title: ${quotedTitle}` })
  } else {
    const lineStart = source.lastIndexOf('\n', after.range[0]) + 1
    const indent = /^\s*/.exec(source.slice(lineStart))![0]
    edits.push({ start: after.range[1], end: after.range[1], text: `\n${indent}title: ${quotedTitle}` })
  }
  return true
}

function stampDocs(node: YAMLMap, id: string): string | undefined {
  const page = pages.get(String(node.get('page')))
  const section = page?.sections.find(s => s.anchor === node.get('anchor'))
  if (!section) {
    console.error(`${id}: ${node.get('page')}#${node.get('anchor')} doesn't exist. Fix the source by hand`)
    process.exitCode = 1
    return undefined
  }
  if (titlesOnly) return setTitle(node, sourceTitle(page!, section)) ? 'title' : undefined
  let note = set(node, 'sectionHash', section.hash) ? `${section.anchor} section hash` : ''
  if (setTitle(node, sourceTitle(page!, section))) note += `${note ? ', ' : ''}title`
  const blockIndex = node.get('block')
  if (typeof blockIndex === 'number') {
    const block = section.blocks[blockIndex]
    if (!block) {
      console.error(`${id}: ${section.anchor} has no block ${blockIndex}`)
      process.exitCode = 1
    } else if (set(node, 'blockHash', block.hash)) {
      note += `${note ? ', ' : ''}block ${blockIndex} hash`
    }
  }
  return note || undefined
}

async function stampCode(node: YAMLMap, id: string): Promise<string | undefined> {
  const repo = String(node.get('repo')) as Repo
  const path = String(node.get('path'))
  const commit = String(node.get('commit'))
  const lines = node.get('lines') as { items: { value: number }[] } | undefined
  const [from, to] = (lines?.items ?? []).map(i => (typeof i === 'number' ? i : i.value))
  const pinned = await readAt(repo, commit, path)
  if (pinned === undefined) {
    console.error(`${id}: can't read ${repo}/${path} at ${commit}`)
    process.exitCode = 1
    return undefined
  }
  const notes: string[] = []
  if (set(node, 'linesHash', linesHash(pinned, from, to))) notes.push(`lines ${from}-${to} hashed at ${commit.slice(0, 8)}`)
  const head = trackedHead(repo)
  if (!head || head === commit) return notes.join(', ') || undefined
  const current = await readAt(repo, head, path)
  const moved = current === undefined ? undefined : findMoved(current, sliceLines(pinned, from, to))
  if (!moved) {
    console.error(`${id}: ${path} lines ${from}-${to} changed on ${REPOS[repo].track}; kept the pin at ${commit.slice(0, 8)}. Rewrite the question against the new code`)
    return notes.join(', ') || undefined
  }
  set(node, 'commit', head)
  set(node, 'lines', moved)
  notes.push(`re-pinned to ${head.slice(0, 8)}${moved[0] !== from ? ` (now lines ${moved[0]}-${moved[1]})` : ''}`)
  return notes.join(', ')
}
