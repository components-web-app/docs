/**
 * Provenance hashes. Node only (node:crypto); the runtime never hashes.
 * Section extraction lives in scripts/quiz/lib/docs.ts; this file only normalises and hashes,
 * so every script hashes the same way.
 */
import { createHash } from 'node:crypto'

/** `[!code focus]`, `[!code highlight]` etc. as a trailing `//` or `#` comment. */
const CODE_ANNOTATION = /\s*(?:\/\/|#)\s*\[!code [^\]]+\]\s*$/

/** LF line ends, no trailing spaces, at most one blank line in a row, trimmed. */
export function normaliseText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** A code block as the quiz shows it: annotations removed, trailing spaces removed, indentation kept. */
export function displayCode(code: string): string {
  return code
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(CODE_ANNOTATION, '').replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
}

export function shortHash(text: string): string {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16)}`
}

/** Hash of a docs section's raw markdown (heading line included). */
export function sectionHash(sectionMarkdown: string): string {
  return shortHash(normaliseText(sectionMarkdown))
}

/** Hash of a code block's display text. */
export function blockHash(code: string): string {
  return shortHash(displayCode(code))
}

/** Hash of source lines `from`..`to` (1-based, inclusive) of a file's text. */
export function linesHash(fileText: string, from: number, to: number): string {
  const lines = fileText.replace(/\r\n?/g, '\n').split('\n').slice(from - 1, to)
  return shortHash(lines.map(line => line.replace(/\s+$/, '')).join('\n'))
}
