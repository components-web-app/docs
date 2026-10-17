import { AREAS, QUIZ_SETS, type AreaFilter, type QuizSet } from '../../../quiz/schema'
import type { QuizManifest } from '../../../quiz/lib/render'

/**
 * /api/quiz/config.json: quiz/config.yml, validated, plus how many live families each level (and
 * What's new) has, per topic. The start page uses them to offer or close a level, topic or What's new. A quiz shows at most one question per family, so the family
 * count is the most questions a quiz there can have. Prerendered (nuxt.config.ts).
 */
export default defineEventHandler(async (): Promise<QuizManifest> => {
  const config = await loadQuizConfig()
  const counts = Object.fromEntries(await Promise.all(QUIZ_SETS.map(async (set) => {
    const inSet = await liveInSet(set)
    const families = (qs: typeof inSet) => new Set(qs.map(q => q.family ?? `q:${q.id}`)).size
    const byArea = Object.fromEntries(AREAS.map(area => [area, families(inSet.filter(q => q.area === area))]))
    return [set, { all: families(inSet), ...byArea }]
  }))) as Record<QuizSet, Record<AreaFilter, number>>
  return { config, counts }
})
