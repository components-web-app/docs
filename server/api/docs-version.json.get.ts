import { queryCollection } from '@nuxt/content/server'
import { DOCS_CHANNELS, DEFAULT_CHANNEL_ID } from '#shared/docs-versions'

// Pages that aren't in a content collection
const APP_PAGES = ['/', '/about', '/built-for-business', '/quiz', '/quiz/play']

/**
 * /api/docs-version.json: which documentation version this deployment is, the channel list
 * built into it, and every page path it has. Prerendered. Other versions' switchers read it
 * (cross-origin, so vercel.json sends Access-Control-Allow-Origin) to keep the reader on the
 * same page when it exists here, and older versions read the channel list from the primary site.
 */
export default defineEventHandler(async (event) => {
  const [docs, standalone, pages] = await Promise.all([
    queryCollection(event, 'docs').select('path').all(),
    queryCollection(event, 'standalone').select('path').all(),
    queryCollection(event, 'pages').select('path').all()
  ])
  const paths = [...new Set([...APP_PAGES, ...[...docs, ...standalone, ...pages].map(item => item.path)]
    .filter(Boolean)
    .map(path => path.length > 1 ? path.replace(/\/+$/, '') : path))]
    .sort()

  return {
    channel: (useRuntimeConfig(event).public.docsChannel as string) || DEFAULT_CHANNEL_ID,
    channels: DOCS_CHANNELS,
    paths
  }
})
