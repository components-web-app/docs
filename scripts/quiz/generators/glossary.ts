/**
 * Multiple choice from the glossary page: "Which term means: <first sentence>?". The other options
 * are terms from the same `##` group, chosen by hash so they never change between runs.
 * quiz/DESIGN.md section 6.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'
import { AREAS, LEVELS } from '../../../quiz/schema.ts'
import { hash53 } from '../../../quiz/lib/select.ts'
import type { DocsPage } from '../lib/docs.ts'
import { QUIZ_DIR } from '../lib/bank.ts'
import type { GeneratedDraft } from './common.ts'

export const GLOSSARY_PAGE = '/core-concepts/glossary'

const TermSettings = z.object({
  level: z.enum(LEVELS).optional(),
  area: z.enum(AREAS).optional(),
  tags: z.array(z.string()).min(1).max(4).optional(),
  /** Leave the term out, for example when its definition gives it away. Say why in a comment. */
  exclude: z.boolean().optional(),
  /** Share a family with a hand-written question on the same fact, so a quiz never shows both. */
  family: z.string().regex(/^[a-z0-9:._/#-]+$/).optional(),
  /** "Why it matters" for the term's question. Optional: a definition is often its own reason. */
  why: z.string().min(1).max(300).optional()
}).strict()

export const GlossaryCatalogueSchema = z.object({
  defaults: z.object({ level: z.enum(LEVELS), area: z.enum(AREAS), tags: z.array(z.string()).min(1).max(4) }).strict(),
  /** Keyed by the term exactly as its `###` heading reads, backticks included. */
  terms: z.record(z.string(), TermSettings).default({})
}).strict()

export function loadGlossaryCatalogue() {
  const file = join(QUIZ_DIR, 'catalogue', 'glossary.yml')
  if (!existsSync(file)) return undefined
  return GlossaryCatalogueSchema.parse(parse(readFileSync(file, 'utf8')))
}

/** The first sentence of a definition: up to the first `. ` outside backticks and link targets. */
export function firstSentence(text: string): string {
  let inCode = false
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '`') inCode = !inCode
    else if (!inCode && (ch === '(' || ch === '[')) depth++
    else if (!inCode && (ch === ')' || ch === ']')) depth = Math.max(0, depth - 1)
    else if (!inCode && depth === 0 && ch === '.' && (i === text.length - 1 || text[i + 1] === ' ')) return text.slice(0, i + 1)
  }
  return text
}

const plain = (term: string) => term.replace(/`/g, '').toLowerCase()

export function generateGlossary(pages: Map<string, DocsPage>): GeneratedDraft[] {
  const catalogue = loadGlossaryCatalogue()
  const page = pages.get(GLOSSARY_PAGE)
  if (!catalogue || !page) return []
  const out: GeneratedDraft[] = []
  const groups = page.sections.filter(s => s.depth === 2)
  for (const group of groups) {
    const terms = page.sections.filter(s => s.depth === 3 && s.start > group.start && s.end <= group.end)
    if (terms.length < 4) continue
    for (const term of terms) {
      const settings = { ...catalogue.defaults, ...catalogue.terms[term.title] }
      if (settings.exclude) continue
      const body = term.markdown.split('\n').slice(1).join(' ').replace(/\s+/g, ' ').trim()
        // Links within the glossary page become absolute, since the quiz isn't on that page.
        .replace(/\]\(#/g, `](${page.path}#`)
      const definition = firstSentence(body)
      if (definition.toLowerCase().includes(plain(term.title))) continue
      // The other options are the terms closest in length, so the answer isn't the longest by a margin.
      const len = (t: { title: string }) => plain(t.title).length
      const others = terms
        // A term named in the definition, or inside the answer's own name, would be a second right answer.
        .filter(t => t !== term && !catalogue.terms[t.title]?.exclude)
        .filter(t => !definition.toLowerCase().includes(plain(t.title)) && !plain(term.title).includes(plain(t.title)))
        .sort((a, b) => Math.abs(len(a) - len(term)) - Math.abs(len(b) - len(term)) || hash53(`${term.title}|${a.title}`) - hash53(`${term.title}|${b.title}`))
        .slice(0, 3)
      if (others.length < 3) continue
      const lengths = others.map(len).sort((a, b) => a - b)
      if (len(term) > 1.5 * lengths[1]) continue
      // Option ids follow a hashed order, so the right answer's id is spread over a to d.
      const ordered = [term, ...others].sort((a, b) => hash53(`order|${term.title}|${a.title}`) - hash53(`order|${term.title}|${b.title}`))
      const options = ordered.map((t, n) => ({ id: 'abcd'[n], text: t.title }))
      const correct = options[ordered.indexOf(term)].id
      out.push({
        ref: term.anchor,
        page: page.path,
        anchor: term.anchor,
        block: -1,
        question: {
          level: settings.level,
          area: settings.area,
          tags: settings.tags,
          type: 'multiple-choice',
          family: settings.family ?? `term:${term.anchor}`,
          prompt: `Which term does this describe? “${definition}”`,
          ...(settings.why ? { why: settings.why } : {}),
          options,
          answer: { correct, explanation: body.length > 500 ? firstSentence(body) : body },
          sources: [{ kind: 'docs', page: page.path, anchor: term.anchor, sectionHash: term.hash }],
          generator: { name: 'glossary', ref: term.anchor }
        }
      })
    }
  }
  return out
}
