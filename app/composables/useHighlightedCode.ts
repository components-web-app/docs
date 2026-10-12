import type { ComarkTree } from 'comark'

/**
 * Fetches the server-highlighted code snippets for a marketing page
 * (see server/api/highlighted-code/[file].get.ts), keyed by trimmed markdown.
 *
 * Await it in the page or section component, then render each snippet with <CodeBlock>.
 * `getCachedData` always reuses the payload, so a remount (for example a tab switch)
 * never fetches again.
 */
export function useHighlightedCode(page: 'index' | 'about') {
  const key = `highlighted-code-${page}`
  return useFetch<Record<string, ComarkTree>>(`/api/highlighted-code/${page}.json`, {
    key,
    default: () => ({}),
    getCachedData: (cacheKey, nuxtApp) => nuxtApp.payload.data[cacheKey] ?? nuxtApp.static.data[cacheKey]
  })
}
