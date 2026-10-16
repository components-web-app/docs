import { AREAS, LEVELS, type AreaFilter, type Level } from '../../../quiz/schema'
import type { QuizManifest } from '../../../quiz/lib/render'

/**
 * /api/quiz/config.json: quiz/config.yml, validated, plus how many live families each level and
 * topic has (the start page shows them). A quiz shows at most one question per family, so the family
 * count is the most questions a quiz there can have. Prerendered (nuxt.config.ts).
 */
export default defineEventHandler(async (): Promise<QuizManifest> => {
  const [config, bank] = await Promise.all([loadQuizConfig(), loadQuizBank()])
  const live = bank.filter(q => q.status === 'live')
  const counts = Object.fromEntries(LEVELS.map((level) => {
    const atLevel = live.filter(q => q.level === level)
    const families = (qs: typeof atLevel) => new Set(qs.map(q => q.family ?? `q:${q.id}`)).size
    const byArea = Object.fromEntries(AREAS.map(area => [area, families(atLevel.filter(q => q.area === area))]))
    return [level, { all: families(atLevel), ...byArea }]
  })) as Record<Level, Record<AreaFilter, number>>
  return { config, counts }
})
