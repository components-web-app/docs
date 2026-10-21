import { setResponseHeader } from 'h3'

/**
 * /robots.txt: allow everything and point crawlers at the sitemap. Prerendered.
 * A documentation version that isn't the primary one (shared/docs-versions.ts) has no
 * sitemap: its pages carry `noindex`, and crawlers must still be allowed to read them to see it.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const { origin, indexed } = docsSite(event)
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    ...(indexed ? [`Sitemap: ${origin}/sitemap.xml`, ''] : [])
  ].join('\n')
})
