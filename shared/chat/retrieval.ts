/**
 * Lexical (BM25) retrieval over the docs, for the chat assistant.
 *
 * No embeddings service: the corpus is our own docs, whose questions mostly name the
 * things they're about (a composable, an attribute, a variable), so term matching works.
 * The index is built in memory from /api/chat-index.json the first time an edge isolate
 * needs it; tokenising the whole corpus takes a few tens of milliseconds.
 *
 * Runs on Vercel's edge runtime and in Nitro, so it uses no Node APIs.
 */
import type { ChatChunk, ChatSource } from './types'

const STOPWORDS = new Set(`a about above after again all also am an and any are as at be because been before
being below between both but by can could did do does doing done down during each else ever few for from
further get gets got had has have having he her here hers him his how i if in into is it its itself just
let lets like make makes me might more most much must my need no nor not now of off on once only or other
our ours out over own per please same shall she should so some such than that the their theirs them then
there these they this those through to too under until up us use used uses using very want was way we were
what when where which while who whom why will with would yes you your yours cwa`.split(/\s+/))

/** Splits `useCwaComponent` into `use cwa component`, keeping digits with their word. */
function splitCamel(word: string): string[] {
  return word.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').split(' ')
}

/** A light English stemmer: enough that "components" finds "component" and "caching" finds "cache". */
export function stem(word: string): string {
  if (word.length <= 4 || /\d/.test(word)) return word
  let w = word
  if (w.endsWith('ies')) w = w.slice(0, -3) + 'y'
  else if (w.endsWith('ing') && w.length > 6) w = w.slice(0, -3)
  else if (w.endsWith('ed') && w.length > 5) w = w.slice(0, -2)
  else if (/(ss|x|ch|sh)es$/.test(w)) w = w.slice(0, -2)
  else if (w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1)
  // "cache", "cached" and "caching" all become "cach"
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1)
  return w
}

/**
 * Lowercased, stemmed terms. Identifiers count both whole and in parts, so a question
 * that says "use cwa component" and one that says "useCwaComponent" both match.
 */
export function tokenize(text: string): string[] {
  const out: string[] = []
  for (const raw of text.split(/[^A-Za-z0-9_]+/)) {
    if (!raw) continue
    const parts = raw.split('_').flatMap(splitCamel).filter(Boolean)
    const words = parts.length > 1 ? [raw, ...parts] : [raw]
    for (const word of words) {
      const lower = word.toLowerCase()
      if (lower.length < 2 || STOPWORDS.has(lower)) continue
      out.push(stem(lower))
    }
  }
  return out
}

interface IndexedChunk {
  chunk: ChatChunk
  terms: Map<string, number>
  length: number
}

export interface Retriever {
  search: (query: string, options?: SearchOptions) => ChatChunk[]
  size: number
}

export interface SearchOptions {
  /** Stop adding passages once their text passes this many characters (about 4 per token). */
  maxChars?: number
  /** At most this many passages. */
  limit?: number
  /** At most this many passages from one page, so one long page can't crowd out the rest. */
  perPage?: number
  /** Passages already sent, left out so a follow-up search brings new ones. */
  exclude?: Set<string>
}

/** Heading words count three times: a section titled "Page Caching" is about page caching. */
const HEADING_WEIGHT = 3
const K1 = 1.2
const B = 0.75

/** A passage's weighted term counts and length, as BM25 needs them. */
export function termsOf(chunk: Pick<ChatChunk, 'page' | 'section' | 'text'>): { terms: Map<string, number>, length: number } {
  const terms = new Map<string, number>()
  const headingTerms = tokenize(`${chunk.page} ${chunk.section}`)
  const bodyTerms = tokenize(chunk.text)
  for (const term of headingTerms) terms.set(term, (terms.get(term) ?? 0) + HEADING_WEIGHT)
  for (const term of bodyTerms) terms.set(term, (terms.get(term) ?? 0) + 1)
  return { terms, length: headingTerms.length * HEADING_WEIGHT + bodyTerms.length }
}

/**
 * Term counts as a compact string (`page*3 cach purg*2`), stored in the index at build
 * time so an edge instance doesn't spend a few hundred milliseconds tokenising on start.
 */
export function encodeTerms(terms: Map<string, number>): string {
  return [...terms].map(([term, count]) => count > 1 ? `${term}*${count}` : term).join(' ')
}

function decodeTerms(encoded: string): { terms: Map<string, number>, length: number } {
  const terms = new Map<string, number>()
  let length = 0
  for (const entry of encoded.split(' ')) {
    if (!entry) continue
    const star = entry.lastIndexOf('*')
    const count = star > 0 ? Number(entry.slice(star + 1)) : 1
    terms.set(star > 0 ? entry.slice(0, star) : entry, count)
    length += count
  }
  return { terms, length }
}

export function createRetriever(chunks: ChatChunk[]): Retriever {
  const indexed: IndexedChunk[] = []
  const documentFrequency = new Map<string, number>()
  let totalLength = 0

  for (const chunk of chunks) {
    const { terms, length } = chunk.terms === undefined ? termsOf(chunk) : decodeTerms(chunk.terms)
    for (const term of terms.keys()) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)
    indexed.push({ chunk, terms, length })
    totalLength += length
  }

  const count = indexed.length
  const averageLength = count ? totalLength / count : 1

  function idf(term: string): number {
    const df = documentFrequency.get(term) ?? 0
    return Math.log(1 + (count - df + 0.5) / (df + 0.5))
  }

  function search(query: string, options: SearchOptions = {}): ChatChunk[] {
    const { maxChars = 30_000, limit = 12, perPage = 3, exclude } = options
    const queryTerms = [...new Set(tokenize(query))]
    if (!queryTerms.length) return []

    const weights = queryTerms.map(term => [term, idf(term)] as const).filter(([, weight]) => weight > 0)
    const scored: { item: IndexedChunk, score: number }[] = []
    for (const item of indexed) {
      let score = 0
      for (const [term, weight] of weights) {
        const tf = item.terms.get(term)
        if (!tf) continue
        score += weight * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * item.length / averageLength))
      }
      if (score > 0) scored.push({ item, score })
    }
    scored.sort((a, b) => b.score - a.score)

    const picked: ChatChunk[] = []
    const perPageCount = new Map<string, number>()
    let chars = 0
    for (const { item } of scored) {
      if (picked.length >= limit) break
      if (exclude?.has(chunkKey(item.chunk))) continue
      const pagePath = item.chunk.url.split('#')[0]!
      const used = perPageCount.get(pagePath) ?? 0
      if (used >= perPage) continue
      if (chars + item.chunk.text.length > maxChars && picked.length) continue
      picked.push(item.chunk)
      perPageCount.set(pagePath, used + 1)
      chars += item.chunk.text.length
    }
    return picked
  }

  return { search, size: count }
}

/** Identifies a passage across searches: its url plus where its text starts. */
export function chunkKey(chunk: Pick<ChatChunk, 'url' | 'text'>): string {
  return `${chunk.url}\n${chunk.text.slice(0, 80)}`
}

/** The link text an answer uses for a passage: `Page › Section`, or the page title alone. */
export function sourceTitle(chunk: Pick<ChatChunk, 'page' | 'section'>): string {
  return chunk.section && chunk.section !== chunk.page ? `${chunk.page} › ${chunk.section}` : chunk.page
}

/** The distinct links among the passages, in the order retrieved. */
export function sourcesOf(chunks: ChatChunk[]): ChatSource[] {
  const seen = new Set<string>()
  const sources: ChatSource[] = []
  for (const chunk of chunks) {
    if (seen.has(chunk.url)) continue
    seen.add(chunk.url)
    sources.push({ title: sourceTitle(chunk), url: chunk.url })
  }
  return sources
}
