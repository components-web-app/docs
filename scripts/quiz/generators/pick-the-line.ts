/**
 * Pick-the-line questions from the line-target catalogue and real docs code blocks.
 * quiz/DESIGN.md section 6. A block qualifies when `match` hits exactly one line and the block has
 * at least 4 non-blank lines.
 */
import type { LineTarget } from '../../../quiz/schema.ts'
import type { DocsPage } from '../lib/docs.ts'
import { blockQualifies, isComment, matchingLines, normaliseLang, stripTrailingComment, visitBlocks, windowFor, type GeneratedDraft } from './common.ts'
import { readMoreSource } from './sources.ts'

export function generatePickTheLine(targets: LineTarget[], pages: Map<string, DocsPage>): GeneratedDraft[] {
  const out: GeneratedDraft[] = []
  const visits = visitBlocks(pages)
  for (const entry of targets) {
    if (entry.status !== 'live') continue
    const pattern = new RegExp(entry.match)
    let made = 0
    for (const v of visits) {
      if (made >= entry.limit) break
      if (!blockQualifies(entry, v)) continue
      const hits = matchingLines(v.block.display, pattern)
      if (hits.length !== 1) continue
      if (isComment(v.block.display.split('\n')[hits[0]])) continue
      const win = windowFor(v.block.display, hits[0])
      if (!win || win.lines.filter(l => l.trim() !== '').length < 4) continue
      const lang = normaliseLang(v.block.lang)
      // "Read more" goes to the section that states the fact first, then to where the code came from.
      const block = readMoreSource(v, true)
      const rule = entry.readMore && readMoreSource(entry.readMore, false, pages)
      const sources = rule && !(rule.page === v.page.path && rule.anchor === v.section.anchor) ? [rule, block] : [block]
      out.push({
        ref: entry.id,
        page: v.page.path,
        anchor: v.section.anchor,
        block: v.block.index,
        question: {
          level: entry.level,
          area: entry.area,
          tags: entry.tags,
          type: 'pick-the-line',
          family: entry.family ?? `target:${entry.id}`,
          prompt: entry.prompt,
          // Comments at the end of lines go: they often say what the line does.
          code: { lang: lang as never, text: win.lines.map(l => stripTrailingComment(l, lang)).join('\n') },
          answer: { lines: [win.answer], explanation: entry.explanation },
          sources,
          generator: { name: 'pick-the-line', ref: entry.id }
        }
      })
      made++
    }
  }
  return out
}
