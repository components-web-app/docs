import { setResponseHeader } from 'h3'

const SITE_URL = 'https://cwa.rocks'

/** /robots.txt: allow everything and point crawlers at the sitemap. Prerendered. */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ''
  ].join('\n')
})
