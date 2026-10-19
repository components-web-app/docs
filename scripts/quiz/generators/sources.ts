import type { DocsSource } from '../../../quiz/schema.ts'
import { sourceTitle, type DocsPage } from '../lib/docs.ts'
import type { BlockVisit } from './common.ts'

/** A docs source for a visited block (with block and blockHash), or for a `{ page, anchor }` read-more. */
export function readMoreSource(v: BlockVisit, withBlock: true): DocsSource
export function readMoreSource(ref: { page: string, anchor: string }, withBlock: false, pages: Map<string, DocsPage>): DocsSource | undefined
export function readMoreSource(v: BlockVisit | { page: string, anchor: string }, withBlock: boolean, pages?: Map<string, DocsPage>): DocsSource | undefined {
  if ('block' in v) {
    return { kind: 'docs', page: v.page.path, anchor: v.section.anchor, sectionHash: v.section.hash, title: sourceTitle(v.page, v.section), ...(withBlock ? { block: v.block.index, blockHash: v.block.hash } : {}) }
  }
  const page = pages?.get(v.page)
  const section = page?.sections.find(s => s.anchor === v.anchor)
  if (!page || !section) throw new Error(`readMore ${v.page}#${v.anchor} doesn't exist in content/`)
  return { kind: 'docs', page: v.page, anchor: v.anchor, sectionHash: section.hash, title: sourceTitle(page, section) }
}
