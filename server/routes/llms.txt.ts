import { queryCollection } from '@nuxt/content/server'
import { setResponseHeader } from 'h3'

const SITE_URL = 'https://cwa.rocks'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const docs = await queryCollection(event, 'docs')
    .select('title', 'description', 'path')
    .order('path', 'ASC')
    .all()

  const sections: Record<string, typeof docs> = {}
  for (const doc of docs) {
    const segment = doc.path?.split('/')[1] ?? 'other'
    if (!sections[segment]) sections[segment] = []
    sections[segment].push(doc)
  }

  const sectionLabels: Record<string, string> = {
    'getting-started': 'Getting Started',
    'guides': 'Guides',
    'core-concepts': 'Core Concepts',
    'api': 'API Bundle',
    'nuxt-module': 'Nuxt Module',
    'deployment': 'Deployment',
  }

  const lines: string[] = [
    '# CWA (Components Web App)',
    '',
    '> A Symfony + Nuxt framework for building component-driven, CMS-powered web applications.',
    '> The API bundle handles routing, authentication, real-time updates, and a flexible component/page structure.',
    '> The Nuxt module provides the frontend layer with inline CMS editing, reactive resource binding, and admin tooling.',
    '',
    `Full documentation: ${SITE_URL}/getting-started`,
    `Full text for AI ingestion: ${SITE_URL}/llms-full.txt`,
    '',
  ]

  for (const [key, label] of Object.entries(sectionLabels)) {
    const pages = sections[key]
    if (!pages?.length) continue
    lines.push(`## ${label}`, '')
    for (const page of pages) {
      const desc = page.description ? `: ${page.description}` : ''
      lines.push(`- [${page.title}](${SITE_URL}${page.path})${desc}`)
    }
    lines.push('')
  }

  return lines.join('\n')
})
