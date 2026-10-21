/**
 * The chat assistant's retrieval corpus, prerendered at build time and fetched by the
 * /api/chat edge function. Every docs section, the standalone pages (Why CWA, Privacy)
 * and the marketing pages (content/*.yml), split into passages of a few hundred words.
 */
import { queryCollection, queryCollectionSearchSections } from '@nuxt/content/server'
import type { ChatChunk, ChatIndex } from '#shared/chat/types'
import { encodeTerms, termsOf } from '#shared/chat/retrieval'

/** Passages longer than this are split, so one long section can't fill the context alone. */
const MAX_CHUNK_CHARS = 1800

interface SearchSection {
  id: string
  title: string
  titles: string[]
  content: string
}

/** Splits text at sentence ends into pieces of at most `max` characters. */
function splitText(text: string, max = MAX_CHUNK_CHARS): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean ? [clean] : []
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [clean]
  const pieces: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > max) {
      pieces.push(current.trim())
      current = ''
    }
    // A single sentence longer than the limit (a code block, a table) is cut hard.
    for (let start = 0; start < sentence.length; start += max) {
      const part = sentence.slice(start, start + max)
      if (current.length + part.length > max) {
        pieces.push(current.trim())
        current = ''
      }
      current += part
    }
  }
  if (current.trim()) pieces.push(current.trim())
  return pieces
}

function sectionChunks(sections: SearchSection[]): ChatChunk[] {
  const chunks: ChatChunk[] = []
  for (const section of sections) {
    const isPageIntro = !section.id.includes('#')
    const page = isPageIntro ? section.title : (section.titles[0] ?? section.title)
    const heading = isPageIntro ? '' : section.title
    for (const text of splitText(section.content ?? '')) {
      chunks.push({ page, section: heading, url: section.id, text })
    }
  }
  return chunks
}

export default defineEventHandler(async (event): Promise<ChatIndex> => {
  const [docs, standalone, marketing] = await Promise.all([
    queryCollectionSearchSections(event, 'docs') as Promise<SearchSection[]>,
    queryCollectionSearchSections(event, 'standalone') as Promise<SearchSection[]>,
    queryCollection(event, 'pages').order('path', 'ASC').all()
  ])

  const chunks = [...sectionChunks(docs), ...sectionChunks(standalone)]

  for (const page of marketing) {
    const record = page as unknown as Record<string, unknown>
    const lines = marketingPageToText(record).filter(Boolean)
    const text = [typeof record.description === 'string' ? record.description : '', ...lines.map(line => line.replace(/^### /, ''))].join(' ')
    for (const piece of splitText(text)) {
      chunks.push({ page: String(page.title ?? page.path), section: '', url: page.path, text: piece })
    }
  }

  for (const chunk of chunks) chunk.terms = encodeTerms(termsOf(chunk).terms)

  return { generatedAt: new Date().toISOString(), chunks }
})
