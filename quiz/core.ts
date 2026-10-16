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

/**
 * The quiz across levels on the latest releases. It sits beside the levels: the start page offers it
 * on its own, and a play link uses it as `level=whats-new`.
 */
export const WHATS_NEW = 'whats-new' as const

/** Every quiz a play link can name: one per level, and What's new. */
export const QUIZ_SETS = [...LEVELS, WHATS_NEW] as const
export type QuizSet = typeof QUIZ_SETS[number]

/** What the start page, the play page and the result screen need to know about one quiz set. */
export type SetConfig = {
  id: QuizSet
  title: string
  blurb: string
  quizLength?: number
  passMark: number
  ranks: { min: number, title: string }[]
}

type ConfigLike = {
  quizLength?: number
  levels?: { id?: string, title?: string, blurb?: string, quizLength?: number, passMark?: number, ranks?: { min?: number, title?: string }[] }[]
  whatsNew?: { title?: string, blurb?: string, quizLength?: number, passMark?: number, ranks?: { min?: number, title?: string }[] }
}

/** The config for a level or for What's new, in one shape. */
export function setConfigFor(config: ConfigLike, set: QuizSet): SetConfig | undefined {
  // Optional fields: the Nuxt app type-checks without strictNullChecks, where zod's output is all optional.
  const entry = set === WHATS_NEW ? config.whatsNew : config.levels?.find(l => l.id === set)
  if (!entry) {
    return undefined
  }
  return {
    id: set,
    title: entry.title ?? set,
    blurb: entry.blurb ?? '',
    ...(entry.quizLength ? { quizLength: entry.quizLength } : {}),
    passMark: entry.passMark ?? 0.7,
    ranks: (entry.ranks ?? []).map(r => ({ min: r.min ?? 0, title: r.title ?? '' }))
  }
}

/** How many questions a quiz in this set has: the set's own `quizLength`, else the global one. */
export function quizLengthFor(config: ConfigLike, set: string): number {
  const own = set === WHATS_NEW ? config.whatsNew?.quizLength : config.levels?.find(l => l.id === set)?.quizLength
  return own ?? config.quizLength ?? 10
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

/**
 * A release of one repo, as `since` and `until` on a question name it. `unreleased: true` means the
 * change is on the repo's tracked branch after `version`, not yet in a release.
 */
export type VersionRef = { repo: Repo, version: string, unreleased?: boolean }

/** `2.0.0-alpha.22` or `v2.0.0-alpha.22`. */
export const VERSION_PATTERN = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/

/**
 * Compares two semver versions, pre-releases included (`2.0.0-alpha.9` < `2.0.0-alpha.10` <
 * `2.0.0`). A leading `v` is ignored. Negative, zero or positive, like a sort comparator.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) => {
    const [core, pre] = v.replace(/^v/, '').split(/-(.*)/s)
    return { core: core.split('.').map(Number), pre: pre ? pre.split('.') : [] }
  }
  const x = parse(a)
  const y = parse(b)
  for (let i = 0; i < 3; i++) {
    const d = (x.core[i] ?? 0) - (y.core[i] ?? 0)
    if (d) return d
  }
  // A release sorts after its pre-releases.
  if (!x.pre.length || !y.pre.length) return (x.pre.length ? -1 : 0) - (y.pre.length ? -1 : 0)
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i]
    const q = y.pre[i]
    if (p === undefined) return -1
    if (q === undefined) return 1
    const pn = /^\d+$/.test(p)
    const qn = /^\d+$/.test(q)
    if (pn && qn) {
      const d = Number(p) - Number(q)
      if (d) return d
    } else if (pn !== qn) {
      return pn ? -1 : 1
    } else if (p !== q) {
      return p < q ? -1 : 1
    }
  }
  return 0
}

/** Orders `since` entries: an unreleased change sorts just after the release it follows. */
function compareRefs(a: LooseRef, b: LooseRef): number {
  return compareVersions(a.version ?? '0.0.0', b.version ?? '0.0.0') || Number(!!a.unreleased) - Number(!!b.unreleased)
}

const refKey = (r: LooseRef) => `${(r.version ?? '').replace(/^v/, '')}${r.unreleased ? '+' : ''}`

// Optional fields: the Nuxt app type-checks without strictNullChecks, where zod's output is all optional.
type LooseRef = { repo?: Repo, version?: string, unreleased?: boolean }
type Versioned = { status?: string, since?: LooseRef[], until?: LooseRef[] }

/**
 * Whether a question holds for a set of installed versions, such as an exam for
 * `{ 'cwa-nuxt-module': '2.0.0-alpha.17' }`. A repo left out of `at` doesn't restrict anything.
 * `since` is the first version with the behaviour (an unreleased one counts only past its version),
 * and `until` the first version without it.
 */
export function appliesAt(q: Versioned, at: Partial<Record<Repo, string>>): boolean {
  for (const s of q.since ?? []) {
    const installed = s.repo && s.version ? at[s.repo] : undefined
    if (installed === undefined) continue
    const d = compareVersions(installed, s.version!)
    if (d < 0 || (d === 0 && s.unreleased)) return false
  }
  for (const u of q.until ?? []) {
    const installed = u.repo && u.version ? at[u.repo] : undefined
    if (installed !== undefined && compareVersions(installed, u.version!) >= 0) return false
  }
  return true
}

/**
 * The What's new window: for each repo, the newest `releases` versions that live questions name in
 * `since`. It comes from the bank alone, so writing questions for a new release moves the window on
 * with no config change.
 */
export function whatsNewWindow(questions: Versioned[], releases: number): Map<Repo, Set<string>> {
  const byRepo = new Map<Repo, Map<string, LooseRef>>()
  for (const q of questions) {
    if (q.status !== undefined && q.status !== 'live') continue
    for (const s of q.since ?? []) {
      if (!s.repo || !s.version) continue
      const refs = byRepo.get(s.repo) ?? new Map<string, LooseRef>()
      refs.set(refKey(s), s)
      byRepo.set(s.repo, refs)
    }
  }
  const window = new Map<Repo, Set<string>>()
  for (const [repo, refs] of byRepo) {
    const newest = [...refs.values()].sort((a, b) => compareRefs(b, a)).slice(0, releases)
    window.set(repo, new Set(newest.map(refKey)))
  }
  return window
}

/** Whether a question is about a change in the What's new window. */
export function isWhatsNew(q: Versioned, window: Map<Repo, Set<string>>): boolean {
  return (q.since ?? []).some(s => !!s.repo && !!window.get(s.repo)?.has(refKey(s)))
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
  /** One sentence on when this matters in practice, shown under the explanation. */
  why?: string
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
