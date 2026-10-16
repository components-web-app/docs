import { renderKey, type RenderedKey } from '../../../../quiz/lib/render'

/**
 * /api/quiz/keys/<level>.json: the answer keys for a level, with explanations as Comark trees.
 * Only the local grader (app/composables/useQuizGrader.ts) fetches it. An exam keeps keys on a
 * server instead. Prerendered for each level (nuxt.config.ts).
 */
export default defineEventHandler(async (event): Promise<RenderedKey[]> => {
  const level = levelParam(getRouterParam(event, 'level'))
  const { keys } = await loadLevel(level)
  return Promise.all(keys.map(k => renderKey(k)))
})
