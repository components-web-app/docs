import { queryCollection } from '@nuxt/content/server'
import { createError, getRouterParam } from 'h3'
import { parse } from '@comark/nuxt/parse'
import highlight from '@comark/nuxt/plugins/highlight'
import { transformerNotationFocus, transformerNotationHighlight } from '@shikijs/transformers'
import bash from '@shikijs/langs/bash'
import json from '@shikijs/langs/json'
import php from '@shikijs/langs/php'
import ts from '@shikijs/langs/typescript'
import vue from '@shikijs/langs/vue'
import yaml from '@shikijs/langs/yaml'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'

/**
 * Highlights the code snippets in a marketing page (content/*.yml) on the server.
 *
 * The home and about pages used to highlight their snippets in the browser, which
 * shipped Shiki and its grammars to every visitor and left the blocks out of the
 * prerendered HTML (they popped in after hydration). This route parses each snippet
 * with Comark + Shiki at prerender time and returns the parsed trees, keyed by the
 * snippet's trimmed markdown. The page renders them with <ComarkRenderer>, so the
 * browser never loads Shiki.
 *
 * URL: /api/highlighted-code/<page>.json, where <page> is `index` for `/` or the
 * page's path without the leading slash. Each page is prerendered (nuxt.config.ts).
 */

const baseOptions = {
  registerDefaultLanguages: false,
  languages: [bash, json, php, ts, vue, yaml],
  registerDefaultThemes: false,
  themes: { light: githubLight, dark: githubDark }
}

// Transformers switch Comark to a slower path that changes the <pre> classes, so only
// use them for snippets that contain `// [!code focus]` or `// [!code highlight]`.
const plainPlugin = highlight(baseOptions)
const notationPlugin = highlight({
  ...baseOptions,
  transformers: [transformerNotationFocus(), transformerNotationHighlight()]
})

function collectCode(value: unknown, found: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach(item => collectCode(item, found))
    return
  }
  if (!value || typeof value !== 'object') {
    return
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'code' && typeof child === 'string' && child.includes('```')) {
      found.add(child.trim())
    } else {
      collectCode(child, found)
    }
  }
}

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file') || ''
  const name = file.replace(/\.json$/, '')
  if (!/^[a-z0-9-]+$/.test(name)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const page = await queryCollection(event, 'pages')
    .path(name === 'index' ? '/' : `/${name}`)
    .first()
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const snippets = new Set<string>()
  collectCode(page, snippets)

  const trees: Record<string, unknown> = {}
  for (const markdown of snippets) {
    const plugin = markdown.includes('[!code') ? notationPlugin : plainPlugin
    trees[markdown] = await parse(markdown, { plugins: [plugin] })
  }
  return trees
})
