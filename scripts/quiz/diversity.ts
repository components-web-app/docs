/**
 * pnpm quiz:diversity [--seeds 100]
 *
 * How much two quizzes overlap (quiz/DESIGN.md section 7). For each level on "Everything", draws N
 * seeds and compares every pair: the max and mean number of shared questions, the pairs sharing
 * more than half, and the same measured in families (two variants of one fact count as shared).
 * Also reports live families per level and area against the targets (60 per level, 10 per area),
 * and any family that appears in more than 40% of quizzes.
 * Prints a WARN line for every level that breaks the "no more than half" rule, so the gap shows in
 * CI. Fails only when a level with 120+ live questions breaks it (quiz/DESIGN.md section 7).
 */
import { LEVELS, quizLengthFor, splitQuestion, type PublicQuestion } from '../../quiz/schema.ts'
import { selectQuestions } from '../../quiz/lib/select.ts'
import { loadBank, loadConfig } from './lib/bank.ts'

const i = process.argv.indexOf('--seeds')
const seeds = i === -1 ? 100 : Number(process.argv[i + 1])
const config = loadConfig()
const live = loadBank().questions.filter(lq => lq.question.status === 'live').map(lq => splitQuestion(lq.question).question)
const familyOf = (q: PublicQuestion) => q.family ?? `q:${q.id}`

let failed = false
for (const level of LEVELS) {
  const pool = live.filter(q => q.level === level)
  const families = new Set(pool.map(familyOf))
  const areas = [...new Set(pool.map(q => q.area))].sort()
  const perArea = areas.map((a) => {
    const n = new Set(pool.filter(q => q.area === a).map(familyOf)).size
    return `${a} ${n}${n < 10 ? ' (below 10)' : ''}`
  })
  console.log(`${level}: ${pool.length} live questions, ${families.size} families${families.size < 60 ? ' (target 60)' : ''}`)
  console.log(`  families per area: ${perArea.join(', ') || '-'}`)
  if (pool.length === 0) continue
  const length = quizLengthFor(config, level)

  const quizzes = Array.from({ length: seeds }, (_, s) => {
    const picked = selectQuestions(pool, { seed: `d${s.toString(36).padStart(5, '0')}`, level, area: 'all', count: length }).questions
    return { ids: new Set(picked.map(q => q.id)), fams: new Set(picked.map(familyOf)), size: picked.length }
  })
  const seen = new Map<string, number>()
  for (const quiz of quizzes) for (const f of quiz.fams) seen.set(f, (seen.get(f) ?? 0) + 1)
  const hot = [...seen.entries()].filter(([, n]) => n / seeds > 0.4).sort((a, b) => b[1] - a[1])
  if (hot.length) {
    console.log(`  WARN families in more than 40% of quizzes: ${hot.map(([f, n]) => `${f} ${Math.round(100 * n / seeds)}%`).join(', ')}`)
  }
  const half = Math.floor(length / 2)
  let pairs = 0
  let max = 0
  let sum = 0
  let over = 0
  let famMax = 0
  let famSum = 0
  let famOver = 0
  for (let a = 0; a < quizzes.length; a++) {
    for (let b = a + 1; b < quizzes.length; b++) {
      const shared = [...quizzes[a].ids].filter(id => quizzes[b].ids.has(id)).length
      const sharedFam = [...quizzes[a].fams].filter(f => quizzes[b].fams.has(f)).length
      pairs++
      sum += shared
      famSum += sharedFam
      max = Math.max(max, shared)
      famMax = Math.max(famMax, sharedFam)
      if (shared > half) over++
      if (sharedFam > half) famOver++
    }
  }
  console.log(`  questions: max overlap ${max}, mean ${(sum / pairs).toFixed(2)}, pairs sharing more than ${half}: ${over} of ${pairs}`)
  console.log(`  families:  max overlap ${famMax}, mean ${(famSum / pairs).toFixed(2)}, pairs sharing more than ${half}: ${famOver} of ${pairs}`)
  if (pool.length >= 120 && over > 0) {
    console.log(`  FAIL: ${level} has ${pool.length} live questions but ${over} pairs share more than half`)
    failed = true
  } else if (famOver > 0) {
    console.log(`  WARN: ${famOver} of ${pairs} pairs share more than ${half} families. The bank is below the size where this fails (120 live questions)`)
  }
}
if (failed) process.exitCode = 1
