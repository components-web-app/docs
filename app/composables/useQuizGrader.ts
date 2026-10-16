import { gradeAgainstKey, type GradeResult, type QuizGrader, type QuizResponse, type QuizSet } from '~~/quiz/core'
import type { RenderedFeedback, RenderedKey } from '~~/quiz/lib/render'
import { parseLocalRef } from './useQuizBank'

/** A grade plus the rendered explanation the UI shows. `feedback` may be held back by an exam grader. */
export type QuizGradeResult = GradeResult & { feedback?: RenderedFeedback }

/** The grader the UI talks to: the shared `QuizGrader`, returning rendered feedback too. */
export interface QuizFeedbackGrader extends QuizGrader {
  grade(response: QuizResponse): Promise<QuizGradeResult>
}

/**
 * v1's grader. The only code that fetches /api/quiz/keys/*. It starts the fetch when created, so
 * the keys arrive with the questions and feedback is instant.
 *
 * An exam swaps this for a grader that posts the response to a server, which maps the token to a
 * question and version and calls the same `gradeAgainstKey()`. Nothing else in the UI changes.
 */
export function createLocalGrader(level: QuizSet): QuizFeedbackGrader {
  const keys = $fetch<RenderedKey[]>(`/api/quiz/keys/${level}.json`)
    .then(list => new Map(list.map(k => [k.key.id, k])))
  // Avoid an unhandled rejection before the first grade; grade() rethrows it.
  keys.catch(() => {})

  return {
    async grade(response) {
      const { questionId, version } = parseLocalRef(response.ref)
      const entry = (await keys).get(questionId)
      if (!entry) {
        // The question isn't in the keys file (a deploy removed it mid-quiz): neither right nor wrong.
        return { questionId, status: 'ungraded', correct: null }
      }
      const answer = 'optionId' in response
        ? { questionId, version, optionId: response.optionId }
        : { questionId, version, line: response.line }
      const result = gradeAgainstKey(answer, entry.key)
      return { ...result, feedback: { explanation: entry.explanation, ...(entry.why ? { why: entry.why } : {}), ...(entry.optionNotes ? { optionNotes: entry.optionNotes } : {}) } }
    }
  }
}
