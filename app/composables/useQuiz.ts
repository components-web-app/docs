import type { QuizResponse } from '~~/quiz/core'
import type { QuizItem, QuizSettings, QuizSource } from './useQuizBank'
import type { QuizFeedbackGrader, QuizGradeResult } from './useQuizGrader'

export type QuizPhase = 'loading' | 'error' | 'empty' | 'question' | 'answered' | 'result'

/** The reader's choice for the current question: an option id, the ticked option ids, or a 1-based line. */
export type QuizChoice = { optionId: string } | { optionIds: string[] } | { line: number }

/** One answered question, as the result screen needs it. */
export type QuizRecord = {
  question: QuizItem
  choice: QuizChoice
  result: QuizGradeResult
}

/**
 * The quiz state machine: loading → question → answered → question … → result.
 *
 * It reads questions only through `source` and grades only through `grader`. It never sees the
 * pool, an id or a tag: each item carries an opaque `ref` that goes back to the grader, and the tags
 * for the result screen come back with the grade. An exam mode passes a server-backed source and
 * grader, and nothing here changes.
 */
export function useQuiz(source: QuizSource, grader: QuizFeedbackGrader) {
  const phase = ref<QuizPhase>('loading')
  const error = ref<string>()
  const settings = shallowRef<QuizSettings>()
  const questions = shallowRef<QuizItem[]>([])
  const shortBy = ref(0)
  const index = ref(0)
  const choice = shallowRef<QuizChoice>()
  const records = shallowRef<QuizRecord[]>([])
  const grading = ref(false)

  const current = computed(() => questions.value[index.value])
  const currentRecord = computed(() => phase.value === 'answered' ? records.value[records.value.length - 1] : undefined)
  const isLast = computed(() => index.value >= questions.value.length - 1)

  let run = 0

  async function start(next: QuizSettings) {
    const thisRun = ++run
    settings.value = next
    phase.value = 'loading'
    error.value = undefined
    index.value = 0
    choice.value = undefined
    records.value = []
    try {
      const sitting = await source.start(next)
      if (thisRun !== run) {
        return
      }
      questions.value = sitting.items
      shortBy.value = sitting.shortBy
      phase.value = questions.value.length ? 'question' : 'empty'
    } catch (e) {
      if (thisRun !== run) {
        return
      }
      error.value = e instanceof Error ? e.message : String(e)
      phase.value = 'error'
    }
  }

  function choose(next: QuizChoice) {
    if (phase.value === 'question') {
      choice.value = next
    }
  }

  async function check() {
    const q = current.value
    const picked = choice.value
    if (phase.value !== 'question' || !q || !picked || grading.value || ('optionIds' in picked && !picked.optionIds.length)) {
      return
    }
    const response: QuizResponse = 'optionId' in picked
      ? { ref: q.ref, optionId: picked.optionId }
      : 'optionIds' in picked ? { ref: q.ref, optionIds: [...picked.optionIds] } : { ref: q.ref, line: picked.line }
    const thisRun = run
    grading.value = true
    try {
      const result = await grader.grade(response)
      if (thisRun !== run) {
        return
      }
      records.value = [...records.value, { question: q, choice: picked, result }]
      phase.value = 'answered'
    } catch (e) {
      if (thisRun !== run) {
        return
      }
      error.value = e instanceof Error ? e.message : String(e)
      phase.value = 'error'
    } finally {
      grading.value = false
    }
  }

  function next() {
    if (phase.value !== 'answered') {
      return
    }
    if (isLast.value) {
      phase.value = 'result'
      return
    }
    index.value++
    choice.value = undefined
    phase.value = 'question'
  }

  return { phase, error, settings, questions, shortBy, index, current, choice, records, currentRecord, isLast, grading, start, choose, check, next }
}

export type QuizSummary = {
  graded: number
  correct: number
  ungraded: number
  share: number
  /** Tags with at least one right answer and no wrong one. */
  strongTags: string[]
  /** Tags of wrong answers, most often missed first. */
  weakTags: string[]
}

/** Scores graded answers only. An ungraded answer is neither right nor wrong. */
export function summariseQuiz(records: QuizRecord[]): QuizSummary {
  const graded = records.filter(r => r.result.status === 'graded')
  const correct = graded.filter(r => r.result.correct === true).length
  const right = new Map<string, number>()
  const wrong = new Map<string, number>()
  for (const r of graded) {
    const map = r.result.correct ? right : wrong
    for (const tag of r.result.key?.tags ?? []) {
      map.set(tag, (map.get(tag) ?? 0) + 1)
    }
  }
  return {
    graded: graded.length,
    correct,
    ungraded: records.length - graded.length,
    share: graded.length ? correct / graded.length : 0,
    strongTags: [...right.keys()].filter(t => !wrong.has(t)),
    weakTags: [...wrong.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }
}
