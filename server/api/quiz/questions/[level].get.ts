import type { PublicQuestion } from '../../../../quiz/schema'
import { renderQuestion, type Rendered } from '../../../../quiz/lib/render'

/**
 * /api/quiz/questions/<level>.json: the level's live questions with no answers in them, prompt and
 * options as Comark trees and code as Shiki tokens. Prerendered for each level (nuxt.config.ts).
 */
export default defineEventHandler(async (event): Promise<Rendered<PublicQuestion>[]> => {
  const level = levelParam(getRouterParam(event, 'level'))
  const { questions } = await loadLevel(level)
  return Promise.all(questions.map(q => renderQuestion(q)))
})
