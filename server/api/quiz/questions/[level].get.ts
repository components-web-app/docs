import type { PublicQuestion } from '../../../../quiz/schema'
import { renderQuestion, type Rendered } from '../../../../quiz/lib/render'

/**
 * /api/quiz/questions/<level>.json (or whats-new.json): the set's live questions with no answers in them, prompt and
 * options as Comark trees and code as Shiki tokens. Prerendered for each level (nuxt.config.ts).
 */
export default defineEventHandler(async (event): Promise<Rendered<PublicQuestion>[]> => {
  const set = setParam(getRouterParam(event, 'level'))
  const { questions } = await loadSet(set)
  return Promise.all(questions.map(q => renderQuestion(q)))
})
