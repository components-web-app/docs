import type { AreaFilter, Level } from '~~/quiz/core'

/**
 * What the quiz remembers in this browser, under one key. Nothing is sent anywhere.
 * Every read and write is in try/catch: with storage blocked, the quiz works and remembers nothing.
 */
const STORAGE_KEY = 'cwa-quiz:v1'

export type QuizBest = { score: number, total: number, at: string }

export type QuizProgress = {
  best: Partial<Record<Level, QuizBest>>
  /** Levels passed on a full quiz on "Everything" with every answer graded. */
  passed: Level[]
  last?: { level: Level, topic: AreaFilter }
  /**
   * Quizzes (`level|topic|seed`) answered at least once, newest last. A pass counts only on the first
   * attempt at a quiz, so reloading a quiz after seeing its answers can't record one.
   */
  started: string[]
}

/** How many started quizzes to remember. */
const STARTED_LIMIT = 200

function empty(): QuizProgress {
  return { best: {}, passed: [], started: [] }
}

function read(): QuizProgress {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!raw) {
      return empty()
    }
    const parsed = JSON.parse(raw) as Partial<QuizProgress>
    return {
      best: parsed.best && typeof parsed.best === 'object' ? parsed.best : {},
      passed: Array.isArray(parsed.passed) ? parsed.passed : [],
      started: Array.isArray(parsed.started) ? parsed.started.filter(k => typeof k === 'string') : [],
      ...(parsed.last ? { last: parsed.last } : {})
    }
  } catch {
    return empty()
  }
}

function write(progress: QuizProgress) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage is blocked or full: the quiz still works, it just won't remember.
  }
}

export type QuizOutcome = {
  level: Level
  topic: AreaFilter
  score: number
  total: number
  /** The level's pass mark was reached on the graded answers. */
  reachedPassMark: boolean
  /** A first attempt at a full quiz on Everything with every answer graded. Only then does a pass count. */
  counts: boolean
}

/**
 * Empty on the server and until mounted, so the prerendered HTML and the first client render match.
 */
export function useQuizProgress() {
  const progress = useState<QuizProgress>('quiz-progress', empty)

  onMounted(() => {
    progress.value = read()
  })

  function remember(update: (current: QuizProgress) => void) {
    const next = read()
    update(next)
    write(next)
    progress.value = next
  }

  function rememberChoice(level: Level, topic: AreaFilter) {
    remember((p) => {
      p.last = { level, topic }
    })
  }

  /** Whether this quiz was answered before, in this browser. Read it before the first answer. */
  function wasStarted(quiz: string): boolean {
    return read().started.includes(quiz)
  }

  /** Remembers that this quiz has been answered at least once. */
  function markStarted(quiz: string) {
    remember((p) => {
      if (!p.started.includes(quiz)) {
        p.started = [...p.started, quiz].slice(-STARTED_LIMIT)
      }
    })
  }

  /** Stores the best score and, when the outcome counts, the pass. Returns whether the pass was recorded. */
  function recordOutcome(outcome: QuizOutcome): boolean {
    const passed = outcome.counts && outcome.reachedPassMark
    remember((p) => {
      p.last = { level: outcome.level, topic: outcome.topic }
      if (outcome.counts && outcome.total > 0) {
        const best = p.best[outcome.level]
        if (!best || outcome.score / outcome.total > best.score / best.total) {
          p.best[outcome.level] = { score: outcome.score, total: outcome.total, at: new Date().toISOString() }
        }
      }
      if (passed && !p.passed.includes(outcome.level)) {
        p.passed.push(outcome.level)
      }
    })
    return passed
  }

  return { progress, rememberChoice, recordOutcome, wasStarted, markStarted }
}
