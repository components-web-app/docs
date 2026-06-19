import { queryCollectionSearchSections } from '@nuxt/content/server'
import { queryCollection } from '@nuxt/content/server'
import { setResponseHeader } from 'h3'

const SITE_URL = 'https://cwa.rocks'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const [docs, sections] = await Promise.all([
    queryCollection(event, 'docs')
      .select('title', 'description', 'path')
      .order('path', 'ASC')
      .all(),
    queryCollectionSearchSections(event, 'docs'),
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
