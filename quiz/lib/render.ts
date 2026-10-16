/**
 * Turns a question's markdown and code into what the quiz UI draws: Comark trees for the prompt,
 * options and explanation, and Shiki tokens per code line (github-light and github-dark).
 *
 * The prerender routes call it, and a future exam server can call the same functions, so every
 * client gets the same shape whatever served it. The UI depends on the types here, not on how they
 * were made. The browser never loads Shiki or a markdown parser.
 *
 * Runtime only (it imports Comark and Shiki). The bank scripts don't need it.
 */
import type { MarkdownDocument } from 'comark'
import { parseMarkdown } from '@comark/nuxt/parse'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from '@shikijs/langs/bash'
import css from '@shikijs/langs/css'
import html from '@shikijs/langs/html'
import ini from '@shikijs/langs/ini'
import javascript from '@shikijs/langs/javascript'
import json from '@shikijs/langs/json'
import php from '@shikijs/langs/php'
import typescript from '@shikijs/langs/typescript'
import vue from '@shikijs/langs/vue'
import yaml from '@shikijs/langs/yaml'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'
import type { AnswerKey, AreaFilter, Level, QuestionDisplay, QuizConfig } from '../schema'

// ---------------------------------------------------------------------------
// Output types (the UI's contract)
// ---------------------------------------------------------------------------

/** One run of same-coloured text. `style` holds the light colour and `--shiki-dark`. */
export type RenderedToken = { text: string, style?: string }

export type RenderedCode = {
  lang: string
  /** One entry per line of the source, in order. A blank line is an empty array. */
  lines: RenderedToken[][]
}

export type RenderedOption = { id: string, text: MarkdownDocument }

/** The rendered parts of a question. Every other field of the input is passed through unchanged. */
export type RenderedBody = {
  prompt: MarkdownDocument
  options?: RenderedOption[]
  code?: RenderedCode
}

/** A rendered `PublicQuestion`, `ExamItem` or `QuestionDisplay`. */
export type Rendered<T extends QuestionDisplay> = Omit<T, 'prompt' | 'options' | 'code'> & RenderedBody

/** What a question component takes: the display fields only, never an id or a family. */
export type RenderedDisplay = Rendered<QuestionDisplay>

/**
 * The answer key plus its rendered explanation. Grading reads `key` (the shared `AnswerKey`), so a
 * server grader and the local one call the same `gradeAgainstKey()`. The UI shows `explanation` and
 * `optionNotes`.
 */
export type RenderedKey = {
  key: AnswerKey
  explanation: MarkdownDocument
  optionNotes?: Record<string, MarkdownDocument>
}

/** The rendered parts of a key, as a grader hands them to the UI. */
export type RenderedFeedback = Omit<RenderedKey, 'key'>

/** `/api/quiz/config.json`: the parsed config plus the number of live families per level and topic. */
export type QuizManifest = {
  config: QuizConfig
  counts: Record<Level, Record<AreaFilter, number>>
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const SHIKI_LANGS: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  vue: 'vue',
  php: 'php',
  yaml: 'yaml',
  json: 'json',
  bash: 'bash',
  shell: 'bash',
  ini: 'ini',
  css: 'css',
  html: 'html'
}

let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    langs: [bash, css, html, ini, javascript, json, php, typescript, vue, yaml],
    themes: [githubLight, githubDark],
    engine: createJavaScriptRegexEngine()
  })
  return highlighter
}

function styleString(style: Record<string, string> | undefined): string | undefined {
  if (!style) {
    return undefined
  }
  const parts = Object.entries(style).map(([k, v]) => `${k}:${v}`)
  return parts.length ? parts.join(';') : undefined
}

/** Tokenises code per line. Adjacent tokens with the same style are merged to keep the JSON small. */
export async function renderCode(code: { lang: string, text: string }): Promise<RenderedCode> {
  const source = code.text.replace(/\r\n?/g, '\n')
  const lang = SHIKI_LANGS[code.lang]
  if (!lang) {
    return { lang: code.lang, lines: source.split('\n').map(line => line ? [{ text: line }] : []) }
  }
  const shiki = await getHighlighter()
  const { tokens } = shiki.codeToTokens(source, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' }
  })
  const lines = tokens.map((line) => {
    const out: RenderedToken[] = []
    for (const token of line) {
      const style = styleString(token.htmlStyle as Record<string, string> | undefined)
      const last = out[out.length - 1]
      if (last && last.style === style) {
        last.text += token.content
      } else {
        out.push(style ? { text: token.content, style } : { text: token.content })
      }
    }
    return out
  })
  return { lang: code.lang, lines }
}

/** Block markdown (a prompt or an explanation). */
export function renderMarkdown(markdown: string): Promise<MarkdownDocument> {
  return parseMarkdown(markdown)
}

/**
 * Inline markdown for a short label, such as an option. A single paragraph is unwrapped, so the
 * text can sit inside a button-like control.
 */
export async function renderInline(markdown: string): Promise<MarkdownDocument> {
  const tree = await parseMarkdown(markdown)
  const nodes = tree.nodes as unknown[]
  const only = nodes.length === 1 ? nodes[0] : undefined
  if (Array.isArray(only) && only[0] === 'p') {
    return { ...tree, nodes: only.slice(2) as typeof tree.nodes }
  }
  return tree
}

/** Renders a question's prompt, options and code. Works on `PublicQuestion` and `ExamItem` alike. */
export async function renderQuestion<T extends QuestionDisplay>(question: T): Promise<Rendered<T>> {
  const { prompt, options, code, ...rest } = question
  const [renderedPrompt, renderedOptions, renderedCode] = await Promise.all([
    renderMarkdown(prompt),
    options ? Promise.all(options.map(async o => ({ id: o.id, text: await renderInline(o.text) }))) : undefined,
    code ? renderCode(code) : undefined
  ])
  return {
    ...rest,
    prompt: renderedPrompt,
    ...(renderedOptions ? { options: renderedOptions } : {}),
    ...(renderedCode ? { code: renderedCode } : {})
  } as Rendered<T>
}

/** Renders a key's explanation and option notes. The key itself is kept as it is, for grading. */
export async function renderKey(key: AnswerKey): Promise<RenderedKey> {
  const explanation = await renderMarkdown(key.explanation)
  if (!key.optionNotes) {
    return { key, explanation }
  }
  const notes = await Promise.all(Object.entries(key.optionNotes).map(async ([id, note]) => [id, await renderMarkdown(note)] as const))
  return { key, explanation, optionNotes: Object.fromEntries(notes) }
}
