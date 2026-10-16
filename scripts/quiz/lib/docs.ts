/**
 * Reads content/: maps files to URLs, finds sections, anchors and code blocks, and hashes them.
 * Anchors come from the site's own markdown parser (@nuxtjs/mdc), never from a slugger of our own.
 * See quiz/DESIGN.md section 4.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { blockHash, displayCode, sectionHash } from '../../../quiz/lib/hash.ts'

export const ROOT = new URL('../../../', import.meta.url).pathname
export const CONTENT_DIR = join(ROOT, 'content')

export type CodeBlock = {
  /** Index within the section, from 0, counting blocks in child sections and components. */
  index: number
  lang: string
  /** Raw block text between the fences, fence indentation removed. */
  raw: string
  /** `displayCode(raw)`: annotations and trailing spaces removed. */
  display: string
  hash: string
  /** 1-based line of the opening fence in the file. */
  line: number
}

export type Section = {
  anchor: string
  depth: number
  title: string
  /** 1-based line numbers of the heading and the section's last line. */
  start: number
  end: number
  markdown: string
  hash: string
  blocks: CodeBlock[]
}

export type DocsPage = {
  file: string
  path: string
  title: string
  sections: Section[]
  /** Set when the raw headings and the parser's headings don't pair up. */
  error?: string
}

/** `content/5.nuxt-module/01.module-setup.md` → `/nuxt-module/module-setup`. */
export function urlFromFile(file: string): string {
  const rel = relative(CONTENT_DIR, file).split(sep)
  const parts = rel.map(seg => seg.replace(/\.md$/, '').replace(/^\d+\./, ''))
  if (parts[parts.length - 1] === 'index') parts.pop()
  return '/' + parts.join('/')
}

function listMarkdown(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === CONTENT_DIR && entry.name === 'standalone') continue
      out.push(...listMarkdown(full))
    } else if (entry.name.endsWith('.md')) {
      out.push(full)
    }
  }
  return out.sort()
}

const FENCE = /^(\s*)(`{3,}|~{3,})(.*)$/

type RawHeading = { line: number, depth: number, title: string }
type RawBlock = Omit<CodeBlock, 'index' | 'hash'>

/** Headings and fenced blocks of a markdown file, skipping front matter and headings inside fences. */
function scan(lines: string[]): { headings: RawHeading[], blocks: RawBlock[], bodyStart: number } {
  let i = 0
  if (lines[0]?.trim() === '---') {
    i = 1
    while (i < lines.length && lines[i].trim() !== '---') i++
    i++
  }
  const bodyStart = i
  const headings: RawHeading[] = []
  const blocks: RawBlock[] = []
  while (i < lines.length) {
    const fence = FENCE.exec(lines[i])
    if (fence) {
      const [, indent, marks, info] = fence
      const close = new RegExp(`^\\s*${marks[0] === '`' ? '`' : '~'}{${marks.length},}\\s*$`)
      const start = i
      const body: string[] = []
      i++
      while (i < lines.length && !close.test(lines[i])) {
        body.push(lines[i].startsWith(indent) ? lines[i].slice(indent.length) : lines[i].trimStart())
        i++
      }
      const raw = body.join('\n')
      blocks.push({ lang: info.trim().split(/[\s[{]/)[0] ?? '', raw, display: displayCode(raw), line: start + 1 })
      i++
      continue
    }
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(lines[i])
    if (heading) headings.push({ line: i + 1, depth: heading[1].length, title: heading[2] })
    i++
  }
  return { headings, blocks, bodyStart }
}

type ParsedNode = { type?: string, tag?: string, props?: Record<string, unknown>, children?: ParsedNode[] }

function headingIds(node: ParsedNode, out: { depth: number, id: string }[] = []) {
  if (node.tag && /^h[1-6]$/.test(node.tag) && typeof node.props?.id === 'string') {
    out.push({ depth: Number(node.tag[1]), id: node.props.id })
  }
  for (const child of node.children ?? []) headingIds(child, out)
  return out
}

export async function readPage(file: string): Promise<DocsPage> {
  const text = readFileSync(file, 'utf8').replace(/\r\n?/g, '\n')
  const lines = text.split('\n')
  const parsed = await parseMarkdown(text)
  const ids = headingIds(parsed.body as ParsedNode)
  const { headings, blocks } = scan(lines)
  const page: DocsPage = { file, path: urlFromFile(file), title: String(parsed.data?.title ?? ''), sections: [] }
  if (ids.length !== headings.length || ids.some((h, n) => h.depth !== headings[n].depth)) {
    page.error = `found ${headings.length} headings in the file but the parser gave ${ids.length} ids`
    return page
  }
  headings.forEach((h, n) => {
    let endLine = lines.length
    for (let m = n + 1; m < headings.length; m++) {
      if (headings[m].depth <= h.depth) {
        endLine = headings[m].line - 1
        break
      }
    }
    const markdown = lines.slice(h.line - 1, endLine).join('\n')
    const inSection = blocks.filter(b => b.line > h.line && b.line <= endLine)
    page.sections.push({
      anchor: ids[n].id,
      depth: h.depth,
      title: h.title,
      start: h.line,
      end: endLine,
      markdown,
      hash: sectionHash(markdown),
      blocks: inSection.map((b, index) => ({ ...b, index, hash: blockHash(b.raw) }))
    })
  })
  return page
}

let cache: Map<string, DocsPage> | undefined

/** Every docs page, keyed by URL path. Parsed once per process. */
export async function readAllPages(): Promise<Map<string, DocsPage>> {
  if (cache) return cache
  const map = new Map<string, DocsPage>()
  for (const file of listMarkdown(CONTENT_DIR)) {
    const page = await readPage(file)
    map.set(page.path, page)
  }
  cache = map
  return map
}

/** Removes the indentation every non-blank line shares. */
export function dedent(lines: string[]): string[] {
  const indents = lines.filter(l => l.trim() !== '').map(l => /^\s*/.exec(l)![0].length)
  const common = indents.length ? Math.min(...indents) : 0
  return lines.map(l => l.slice(Math.min(common, /^\s*/.exec(l)![0].length)))
}

/**
 * Where `text` sits in `block` as a contiguous run of display lines (after removing their common
 * indentation). With `allowOneDiff`, one line may differ; its index in the run is returned.
 */
export function locateRun(blockDisplay: string, text: string, allowOneDiff = false, normalise: (line: string) => string = l => l): { from: number, diffLine?: number, original?: string } | undefined {
  const want = text.split('\n').map(normalise)
  const have = blockDisplay.split('\n')
  for (let from = 0; from + want.length <= have.length; from++) {
    const run = dedent(have.slice(from, from + want.length)).map(normalise)
    const diffs: number[] = []
    for (let k = 0; k < want.length; k++) {
      if (run[k] !== want[k]) diffs.push(k)
      if (diffs.length > 1) break
    }
    if (diffs.length === 0 && !allowOneDiff) return { from }
    if (diffs.length === 1 && allowOneDiff) return { from, diffLine: diffs[0] + 1, original: run[diffs[0]] }
  }
  return undefined
}
