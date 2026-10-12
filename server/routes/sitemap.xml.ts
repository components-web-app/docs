import { queryCollection } from '@nuxt/content/server'
import { setResponseHeader } from 'h3'

const SITE_URL = 'https://cwa.rocks'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * /sitemap.xml: every marketing page and every docs page. Prerendered (nuxt.config.ts),
 * so it is a static file on Vercel.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  const [docs, marketing] = await Promise.all([
    queryCollection(event, 'docs').select('path').order('path', 'ASC').all(),
    queryCollection(event, 'pages').select('path').order('path', 'ASC').all()
  ])

  const paths = [...new Set([...marketing, ...docs].map(item => item.path).filter(Boolean))]

  const urls = paths.map((path) => {
    const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
    return `  <url><loc>${escapeXml(`${SITE_URL}${clean}`)}</loc></url>`
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n')
})
