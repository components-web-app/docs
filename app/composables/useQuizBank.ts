import type { AreaFilter, Level, PublicQuestion } from '~~/quiz/core'
import type { QuizManifest, Rendered, RenderedDisplay } from '~~/quiz/lib/render'
import { selectQuestions, shuffleOptions } from '~~/quiz/lib/select'

/**
 * A question as the quiz page holds it: the display fields, rendered, and an opaque `ref` the page
 * hands back to the grader. No id, family, tags or answer: the same shape an exam item would have.
 */
export type QuizItem = RenderedDisplay & { ref: string }

export type QuizSettings = {
  level: Level
  topic: AreaFilter
  seed: string
  length: number
}

export type QuizSitting = {
  items: QuizItem[]
  /** How many questions the pool was short of `length`. The page says so when this is above 0. */
  shortBy: number
}

/**
 * Where a quiz gets its questions. Selection and option order happen behind it, so the page never
 * sees the pool. v1 selects in the browser from prerendered JSON; an exam source would ask a server
 * for a sitting (or for one item at a time) and get tokens back as refs.
 */
export interface QuizSource {
  start(settings: QuizSettings): Promise<QuizSitting>
}

/** v1's ref: the question's id and version. Only v1's local grader reads it. */
export function localRef(q: Pick<PublicQuestion, 'id' | 'version'>): string {
  return `${q.id}@${q.version}`
}

/** Splits a v1 ref back into id and version. */
export function parseLocalRef(ref: string): { questionId: string, version: number } {
  const at = ref.lastIndexOf('@')
  return { questionId: ref.slice(0, at), version: Number(ref.slice(at + 1)) }
}

/** v1: the JSON prerendered by server/api/quiz/questions/[level].get.ts, selected with the seed. */
export function createStaticQuizSource(): QuizSource {
  const cache = new Map<Level, Promise<Rendered<PublicQuestion>[]>>()
  function pool(level: Level) {
    let request = cache.get(level)
    if (!request) {
      request = $fetch<Rendered<PublicQuestion>[]>(`/api/quiz/questions/${level}.json`)
      request.catch(() => cache.delete(level))
      cache.set(level, request)
    }
    return request
  }
  return {
    async start(settings) {
      const selection = selectQuestions(await pool(settings.level), {
        seed: settings.seed,
        level: settings.level,
        area: settings.topic,
        count: settings.length
      })
      // Options are shuffled per question with the same seed, so a shared link shows the same order.
      const items = selection.questions.map((q): QuizItem => ({
        ref: localRef(q),
        level: q.level,
        area: q.area,
        type: q.type,
        prompt: q.prompt,
        ...(q.options ? { options: shuffleOptions(q.options, settings.seed, q.id) } : {}),
        ...(q.code ? { code: q.code } : {})
      }))
      return { items, shortBy: selection.shortBy }
    }
  }
}

/**
 * The quiz config and per-level counts. Fetched at prerender time, so the start page's level cards
 * are in the HTML; `getCachedData` reuses the payload, so the browser doesn't fetch it again.
 */
export function useQuizManifest() {
  return useFetch<QuizManifest>('/api/quiz/config.json', {
    key: 'quiz-manifest',
    getCachedData: (cacheKey, nuxtApp) => nuxtApp.payload.data[cacheKey] ?? nuxtApp.static.data[cacheKey]
  })
}
