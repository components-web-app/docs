/**
 * Helpers the code generators share: visiting each docs code block once, picking a window around
 * a line, and the checks a window must pass. Everything here is deterministic.
 */
import type { LineTarget, Mistake, Question } from '../../../quiz/schema.ts'
import { dedent, type CodeBlock, type DocsPage, type Section } from '../lib/docs.ts'

export const LANG_ALIASES: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  sh: 'bash',
  zsh: 'bash',
  console: 'shell',
  yml: 'yaml',
  env: 'ini',
  dotenv: 'ini',
  txt: 'text',
  plaintext: 'text'
}

export function normaliseLang(lang: string): string {
  const l = lang.toLowerCase()
  return LANG_ALIASES[l] ?? l
}

export type BlockVisit = { page: DocsPage, section: Section, block: CodeBlock }

/**
 * Every code block once, in file order, with the deepest section that holds it (so "Read more" goes
 * to the most specific heading).
 */
export function visitBlocks(pages: Map<string, DocsPage>): BlockVisit[] {
  const out: BlockVisit[] = []
  for (const page of [...pages.values()].sort((a, b) => a.file.localeCompare(b.file))) {
    const byLine = new Map<number, BlockVisit>()
    for (const section of page.sections) {
      for (const block of section.blocks) {
        const seen = byLine.get(block.line)
        if (!seen || section.depth > seen.section.depth) byLine.set(block.line, { page, section, block })
      }
    }
    out.push(...[...byLine.values()].sort((a, b) => a.block.line - b.block.line))
  }
  return out
}

export function blockQualifies(entry: Mistake | LineTarget, v: BlockVisit): boolean {
  if (!entry.langs.includes(normaliseLang(v.block.lang) as never)) return false
  if (entry.pages?.length && !entry.pages.some(p => v.page.path === p || v.page.path.startsWith(p + '/'))) return false
  if (entry.exclude?.includes(`${v.page.path}#${v.section.anchor}/${v.block.index}`)) return false
  return true
}

/** A whole-line comment in any of the languages the docs use. PHP attributes (`#[...]`) are code. */
export function isComment(line: string): boolean {
  const t = line.trim()
  return /^(\/\/|\/\*|\*|<!--)/.test(t) || (/^#/.test(t) && !/^#\[/.test(t))
}

const HASH_COMMENT_LANGS = new Set(['yaml', 'bash', 'shell', 'ini'])

/**
 * Removes a comment at the end of a line of code, outside quotes: `//` (or `#` in YAML and shell)
 * after whitespace, or a trailing `<!-- … -->`. A docs comment often says what the line does, which
 * gives a pick-the-line or spot-the-mistake answer away. Whole-line comments and trailing whitespace
 * are left alone, apart from the trailing whitespace a removed comment leaves.
 */
export function stripTrailingComment(line: string, lang: string): string {
  if (isComment(line)) return line
  const hash = HASH_COMMENT_LANGS.has(normaliseLang(lang))
  let quote = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = ''
      continue
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      quote = ch
      continue
    }
    if (i === 0 || !/\s/.test(line[i - 1])) continue
    const rest = line.slice(i)
    if (rest.startsWith('//') || rest.startsWith('<!--') || (hash && ch === '#' && rest[1] !== '[')) {
      const code = line.slice(0, i).trimEnd()
      return code.trim() ? code : line
    }
  }
  return line
}

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

/**
 * True when (), [] and {} balance in the code, ignoring quoted strings and line comments.
 * A trimmed window that leaves a bracket open looks like a second mistake.
 */
export function bracketsBalance(code: string): boolean {
  const stack: string[] = []
  for (const rawLine of code.split('\n')) {
    if (isComment(rawLine)) continue
    let quote = ''
    for (let i = 0; i < rawLine.length; i++) {
      const ch = rawLine[i]
      if (quote) {
        if (ch === '\\') i++
        else if (ch === quote) quote = ''
        continue
      }
      if (ch === '\'' || ch === '"' || ch === '`') {
        quote = ch
        continue
      }
      if (ch === '/' && rawLine[i + 1] === '/') break
      if (ch === '(' || ch === '[' || ch === '{') stack.push(ch)
      else if (ch in PAIRS) {
        if (stack.pop() !== PAIRS[ch]) return false
      }
    }
  }
  return stack.length === 0
}

export type Window = { lines: string[], answer: number }

/**
 * The shown code for a block and the 1-based answer line in it. A block of up to 30 lines is shown
 * whole. A longer one gets a window of 20 lines (down to 12) around the line. Windows whose first and
 * last lines sit at the block's outer indentation and whose brackets balance are tried first, so the
 * cut doesn't leave something that looks like a second mistake. Leading and trailing blank lines are
 * trimmed; the common indentation is removed.
 */
export function windowFor(display: string, lineIndex: number): Window | undefined {
  const all = display.split('\n')
  const trim = (from: number, to: number): [number, number] => {
    while (from < lineIndex && all[from].trim() === '') from++
    while (to - 1 > lineIndex && all[to - 1].trim() === '') to--
    return [from, to]
  }
  if (all.length <= 30) {
    const [from, to] = trim(0, all.length)
    const lines = dedent(all.slice(from, to))
    return lines.length < 3 ? undefined : { lines, answer: lineIndex - from + 1 }
  }
  const indentOf = (l: string) => /^\s*/.exec(l)![0].length
  const outer = Math.min(...all.filter(l => l.trim() !== '').map(indentOf))
  const candidates: [number, number][] = []
  for (const size of [20, 18, 16, 14, 12]) {
    const centred = Math.min(Math.max(0, lineIndex - Math.floor(size / 2)), all.length - size)
    for (let shift = 0; shift < size; shift++) {
      for (const from of shift === 0 ? [centred] : [centred - shift, centred + shift]) {
        if (from < 0 || from + size > all.length || from > lineIndex || from + size <= lineIndex) continue
        candidates.push(trim(from, from + size))
      }
    }
  }
  const clean = ([from, to]: [number, number]) => indentOf(all[from]) === outer && indentOf(all[to - 1]) === outer
  const balanced = ([from, to]: [number, number]) => bracketsBalance(all.slice(from, to).join('\n'))
  const pick = candidates.find(c => clean(c) && balanced(c)) ?? candidates.find(balanced)
  if (!pick) return undefined
  const lines = dedent(all.slice(pick[0], pick[1]))
  return lines.length < 3 ? undefined : { lines, answer: lineIndex - pick[0] + 1 }
}

/** Lines of `display` the regex hits, as 0-based indexes. */
export function matchingLines(display: string, pattern: RegExp): number[] {
  return display.split('\n').flatMap((line, i) => (pattern.test(line) ? [i] : []))
}

export type GeneratedDraft = {
  ref: string
  page: string
  anchor: string
  block: number
  question: Omit<Question, 'id' | 'version' | 'status'>
}
