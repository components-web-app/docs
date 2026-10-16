/**
 * The zod-free half of the quiz contract: the vocabulary, what a client sees, and the grading
 * boundary. The quiz pages import values from here, so zod stays out of the browser. quiz/schema.ts
 * re-exports all of it, so scripts and the server can import everything from one place.
 *
 * Erasable TypeScript only, no imports, so Node can run it directly and Vite/Nitro can bundle it.
 */

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const
export type Level = typeof LEVELS[number]

/** The topic filter on the start page. `all` is "Everything" and is not stored on questions. */
export const AREAS = ['core-concepts', 'api', 'nuxt-module', 'deployment'] as const
export type Area = typeof AREAS[number]
export type AreaFilter = Area | 'all'

export const QUESTION_TYPES = ['multiple-choice', 'pick-the-line', 'spot-the-mistake'] as const
export type QuestionType = typeof QUESTION_TYPES[number]

export const STATUSES = ['draft', 'live', 'retired'] as const
export type Status = typeof STATUSES[number]

/** The three public source repos. Expert questions may only cite these. */
export const REPOS = {
  'api-components-bundle': { github: 'components-web-app/api-components-bundle', track: 'main' },
  'cwa-nuxt-module': { github: 'components-web-app/cwa-nuxt-module', track: 'dev' },
  'components-web-app': { github: 'components-web-app/components-web-app', track: 'main' }
} as const
export type Repo = keyof typeof REPOS

/** How many questions a quiz at this level has: the level's own `quizLength`, else the global one. */
export function quizLengthFor(config: { quizLength?: number, levels?: { id?: string, quizLength?: number }[] }, level: string): number {
  // Optional fields: the Nuxt app type-checks without strictNullChecks, where zod's output is all optional.
  return config.levels?.find(l => l.id === level)?.quizLength ?? config.quizLength ?? 10
}

/** A read-more link. Validated by `LinkSchema` in schema.ts. */
export type Link = { label: string, to: string }

// ---------------------------------------------------------------------------
// What the client sees, and the grading boundary
// ---------------------------------------------------------------------------

/**
 * A question with no answer in it. This is all a quiz (or a future exam) client receives.
 * `promptHtml`-style rendering is the server route's choice; the fields here are the contract.
 */
export type PublicQuestion = {
  id: string
  version: number
  level: Level
  area: Area
  tags: string[]
  type: QuestionType
  prompt: string
  family?: string
  /** Sampling weight (exposure.weight), default 1. */
  weight?: number
  options?: { id: string, text: string }[]
  code?: { lang: string, text: string }
}

/** The answer key for one question. v1 ships it to the browser; exam mode keeps it on a server. */
export type AnswerKey = {
  id: string
  version: number
  type: QuestionType
  correct: { optionId: string } | { lines: number[] }
  fix?: string
  explanation: string
  optionNotes?: Record<string, string>
  /** Read-more links: the sources first (docs anchor or pinned GitHub lines), then answer.links. */
  links: Link[]
  /** The question's tags. On the key side, so the result screen can use them without the client holding them. */
  tags: string[]
}

/**
 * The fields a question UI may read. Both `PublicQuestion` (v1) and `ExamItem` (exam) have them.
 * UI components take this type, so they never read `id` or `family` for display.
 */
export type QuestionDisplay = Omit<PublicQuestion, 'id' | 'version' | 'family' | 'tags' | 'weight'>

/**
 * What a future exam client receives: an opaque per-sitting token in place of the id, and nothing
 * that names the fact tested. The server maps the token to `(id, version, option map)`. Not built in v1.
 */
export type ExamItem = QuestionDisplay & { token: string }

/**
 * A choice as the UI sends it. `ref` is opaque to the UI: in v1 the static source makes it from the
 * question's id and version; an exam server would issue a per-sitting token. Only the grader reads it.
 */
export type QuizResponse
  = | { ref: string, optionId: string }
    | { ref: string, line: number }

/**
 * An answer resolved to a question and version, which `gradeAgainstKey()` takes. A grader builds it
 * from a `QuizResponse`. An exam server takes `questionId` and `version` from its own token map,
 * never from the request.
 */
export type QuizAnswer
  = | { questionId: string, version: number, optionId: string }
    | { questionId: string, version: number, line: number }

export type GradeResult = {
  questionId: string
  /**
   * `ungraded` when the answer was given to a different version than the key's (a deploy landed
   * mid-quiz, or a cached file). An ungraded answer is left out of the score, neither right nor wrong.
   */
  status: 'graded' | 'ungraded'
  /** `null` exactly when `status` is `ungraded`. */
  correct: boolean | null
  /** v1 always sends it. An exam grader may hold it back until the sitting ends. */
  key?: Omit<AnswerKey, 'id' | 'version' | 'type'>
}

/** The single boundary the UI grades through. v1: local, from the answers file. Exam: a server call. */
export interface QuizGrader {
  grade(response: QuizResponse): Promise<GradeResult>
}

/**
 * Grades one answer against its key. The local grader and a future server grader both call this.
 *
 * `answer.version` must be the version the server served, never a value the client sent: an answer
 * to another version is ungraded, so trusting the client would let a candidate skip questions.
 * A wrong answer shape (an option for a code question) grades as wrong here; an exam server should
 * reject it with a 400 before calling this.
 */
export function gradeAgainstKey(answer: QuizAnswer, key: AnswerKey): GradeResult {
  const { id: _id, version: _version, type: _type, ...rest } = key
  if (answer.version !== key.version) {
    return { questionId: key.id, status: 'ungraded', correct: null, key: rest }
  }
  let correct = false
  if ('optionId' in answer && 'optionId' in key.correct) {
    correct = answer.optionId === key.correct.optionId
  } else if ('line' in answer && 'lines' in key.correct) {
    correct = key.correct.lines.includes(answer.line)
  }
  return { questionId: key.id, status: 'graded', correct, key: rest }
}
