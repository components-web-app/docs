/** One retrievable passage: a docs section, or part of one when the section is long. */
export interface ChatChunk {
  /** The page's title. */
  page: string
  /** The section's heading, or empty for the page's own introduction. */
  section: string
  /** The site path, with the section's anchor (`/api/components/component-groups#ordering`). */
  url: string
  /** Plain text of the passage. */
  text: string
  /** Precomputed term counts (see encodeTerms); computed on load when absent. */
  terms?: string
}

/** The retrieval corpus, prerendered to /api/chat-index.json at build time. */
export interface ChatIndex {
  generatedAt: string
  chunks: ChatChunk[]
  /** CWA's terms, one per line with a short definition, from Core Concepts › Glossary. */
  glossary?: string
}

/** A docs page the answer may cite. */
export interface ChatSource {
  /** `Page › Section`, the link text the answer uses. */
  title: string
  url: string
}

/** One turn as the widget sends it. */
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/** The NDJSON events /api/chat streams back, one per line. */
export type ChatEvent
  = | { type: 'sources', sources: ChatSource[] }
    | { type: 'delta', text: string }
    | { type: 'searching', query: string }
    /** The text so far was a preamble to a search: clear it, the answer follows. */
    | { type: 'discard' }
    | { type: 'done' }
    | { type: 'error', message: string }
