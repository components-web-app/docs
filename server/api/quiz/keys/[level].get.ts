import { renderKey, type RenderedKey } from '../../../../quiz/lib/render'

/**
 * /api/quiz/keys/<level>.json (or whats-new.json): the answer keys for a set, with explanations as Comark trees.
 * Only the local grader (app/composables/useQuizGrader.ts) fetches it. An exam keeps keys on a
 * server instead. Prerendered for each level (nuxt.config.ts).
 */
export default defineEventHandler(async (event): Promise<RenderedKey[]> => {
  const set = setParam(getRouterParam(event, 'level'))
  const { keys } = await loadSet(set)
  return Promise.all(keys.map(k => renderKey(k)))
})
