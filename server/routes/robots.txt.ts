import { setResponseHeader } from 'h3'

/**
 * /robots.txt: allow everything and point crawlers at the sitemap. Prerendered.
 * Only the current version's copy, at the site's root, is the one crawlers read. A version
 * that isn't current (shared/docs-versions.ts) has no sitemap: its pages carry `noindex`,
 * and crawlers must still be allowed to read them to see it.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const { siteUrl, indexed } = docsSite(event)
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    ...(indexed ? [`Sitemap: ${siteUrl}/sitemap.xml`, ''] : [])
  ].join('\n')
})
