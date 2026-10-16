/**
 * Spot-the-mistake questions from the mistake catalogue and real docs code blocks.
 * quiz/DESIGN.md section 6. No randomness: blocks are visited in file order.
 */
import type { Mistake } from '../../../quiz/schema.ts'
import type { DocsPage } from '../lib/docs.ts'
import { blockQualifies, isComment, matchingLines, normaliseLang, stripTrailingComment, visitBlocks, windowFor, type GeneratedDraft } from './common.ts'
import { readMoreSource } from './sources.ts'

export function generateSpotTheMistake(mistakes: Mistake[], pages: Map<string, DocsPage>): GeneratedDraft[] {
  const out: GeneratedDraft[] = []
  const visits = visitBlocks(pages)
  for (const entry of mistakes) {
    if (entry.status !== 'live') continue
    const pattern = new RegExp(entry.match)
    let made = 0
    for (const v of visits) {
      if (made >= entry.limit) break
      if (!blockQualifies(entry, v)) continue
      const hits = matchingLines(v.block.display, pattern)
      if (hits.length !== 1) continue
      const original = v.block.display.split('\n')[hits[0]]
      if (isComment(original)) continue
      const changed = original.replace(pattern, entry.replace)
      if (changed === original) continue
      const win = windowFor(v.block.display, hits[0])
      if (!win) continue
      const lang = normaliseLang(v.block.lang)
      // Comments at the end of lines go: they often say what the line does.
      const lines = win.lines.map(l => stripTrailingComment(l, lang))
      const fix = lines[win.answer - 1]
      const indent = fix.length - fix.trimStart().length
      lines[win.answer - 1] = fix.slice(0, indent) + stripTrailingComment(changed, lang).trimStart()
      if (lines[win.answer - 1] === fix) continue
      // "Read more" goes to the section that states the rule first, then to where the code came from.
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
          type: 'spot-the-mistake',
          family: entry.family ?? `mistake:${entry.id}`,
          prompt: entry.prompt,
          why: entry.why,
          code: { lang: lang as never, text: lines.join('\n') },
          answer: { line: win.answer, fix, explanation: entry.explanation },
          sources,
          generator: { name: 'spot-the-mistake', ref: entry.id }
        }
      })
      made++
    }
  }
  return out
}
