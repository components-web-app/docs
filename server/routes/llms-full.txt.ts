import { queryCollectionSearchSections } from '@nuxt/content/server'
import { queryCollection } from '@nuxt/content/server'
import { setResponseHeader } from 'h3'

const SITE_URL = 'https://cwa.rocks'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const [docs, sections, marketing] = await Promise.all([
    queryCollection(event, 'docs')
      .select('title', 'description', 'path')
      .order('path', 'ASC')
      .all(),
    queryCollectionSearchSections(event, 'docs'),
    // Marketing/landing pages (content/*.yml) — structured YAML, not markdown, so
    // they carry the "what is CWA and who is it for" copy the docs never state.
    queryCollection(event, 'pages').order('path', 'ASC').all(),
  ])

  // Build a map of path → sections for ordered output
  const sectionsByPath: Record<string, typeof sections> = {}
  for (const section of sections) {
    const path = (section as any).id?.split('#')[0] ?? ''
    if (!sectionsByPath[path]) sectionsByPath[path] = []
    sectionsByPath[path].push(section)
  }

  const lines: string[] = [
    '# CWA (Components Web App) — Full Documentation',
    '',
    '> Generated automatically from https://cwa.rocks',
    '> For a structured index see /llms.txt',
    '',
    '---',
    '',
  ]

  // Product/overview pages first — they answer "what is this and is it for me?",
  // which the reference docs assume you already know.
  for (const page of marketing) {
    const body = marketingPageToText(page as Record<string, unknown>)
    if (!body.length) continue

    lines.push(`# ${page.title}`)
    if (page.description) lines.push(`> ${page.description}`)
    lines.push(`URL: ${SITE_URL}${page.path}`, '')
    lines.push(...body)
    lines.push('---', '')
  }

  for (const doc of docs) {
    lines.push(`# ${doc.title}`)
    if (doc.description) lines.push(`> ${doc.description}`)
    lines.push(`URL: ${SITE_URL}${doc.path}`, '')

    const pageSections = sectionsByPath[doc.path ?? ''] ?? []
    for (const section of pageSections) {
      const heading = (section as any).titles?.length
        ? [...(section as any).titles, section.title].filter(Boolean).join(' > ')
        : section.title
      if (heading) lines.push(`## ${heading}`, '')
      if ((section as any).content) lines.push((section as any).content, '')
    }

    lines.push('---', '')
  }

  return lines.join('\n')
})
