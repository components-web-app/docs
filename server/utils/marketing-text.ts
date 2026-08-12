/**
 * Flattens the marketing YAML pages (content/*.yml — the `pages` collection) into
 * plain prose for /llms.txt and /llms-full.txt.
 *
 * These pages are structured data, not markdown: the copy lives in nested keys like
 * `hero.description` and `features.items[].description`, interleaved with presentation
 * keys (icons, colours, image paths) that are noise to a language model. This walks the
 * tree, keeps the prose, drops the presentation, and strips the inline HTML the YAML
 * uses for styling (`<span class="...">`, `<br>`).
 */

/** Keys whose values are presentation or routing, never prose. */
const SKIP_KEYS = new Set([
  'icon', 'trailingIcon', 'leadingIcon', 'trailing', 'leading',
  'to', 'target', 'rel', 'href',
  // Note: `image`/`img` are deliberately NOT skipped — they wrap `{ src, alt }`,
  // and the `alt` text is real descriptive copy. `src` below drops the path.
  'src', 'avatar', 'srcset', 'width', 'height', 'loading',
  'color', 'size', 'variant', 'orientation', 'align', 'class', 'ui', 'id',
  'spotlight', 'navigation', 'reverse', 'external',
])

/** Keys that introduce a new labelled block rather than a bare paragraph. */
const HEADING_KEYS = new Set(['title', 'name', 'label', 'question'])

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'",
}

export function cleanText(input: string, preserveNewlines = false): string {
  let text = input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, m => ENTITIES[m] ?? m)
  text = preserveNewlines ? text : text.replace(/\s+/g, ' ')
  return text.trim()
}

/**
 * Walks a marketing page body and returns its prose as lines.
 * `seen` suppresses exact repeats — hero copy often restates the page description.
 */
export function extractProse(value: unknown, seen = new Set<string>(), out: string[] = []): string[] {
  if (typeof value === 'string') {
    const text = cleanText(value)
    if (text && !seen.has(text)) {
      seen.add(text)
      out.push(text)
    }
    return out
  }

  if (Array.isArray(value)) {
    for (const item of value) extractProse(item, seen, out)
    return out
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_KEYS.has(key)) continue

      if (typeof child === 'string') {
        // `code` holds fenced snippets — keep their line breaks intact.
        const text = cleanText(child, key === 'code')
        if (!text || seen.has(text)) continue
        seen.add(text)
        out.push(HEADING_KEYS.has(key) ? `### ${text}` : text)
        continue
      }

      extractProse(child, seen, out)
    }
  }

  return out
}

/** Fields the `pages` collection carries that are metadata, not page body. */
const PAGE_META_KEYS = new Set(['title', 'description', 'path', 'id', 'stem', 'extension', 'meta', 'seo', 'body', 'navigation'])

export function marketingPageToText(page: Record<string, unknown>): string[] {
  const seen = new Set<string>()
  const lines: string[] = []

  const title = typeof page.title === 'string' ? cleanText(page.title) : ''
  const description = typeof page.description === 'string' ? cleanText(page.description) : ''
  if (title) seen.add(title)
  if (description) seen.add(description)

  const body = Object.fromEntries(
    Object.entries(page).filter(([key]) => !PAGE_META_KEYS.has(key)),
  )

  for (const line of extractProse(body, seen)) lines.push(line, '')
  return lines
}
