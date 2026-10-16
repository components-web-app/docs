/**
 * pnpm quiz:sample --level <level> [--topic <area|all>] [--seed <seed>] [--answers | --key-only] [--json]
 *
 * Prints the quiz the page gives for this level, topic and seed, with no answers: only what
 * `splitQuestion()` puts in a PublicQuestion. `--answers` adds the answer key as a separate list
 * after the quiz; `--key-only` prints only the key. The same seed lists the same ids as the browser.
 */
import { AREAS, LEVELS, quizLengthFor, splitQuestion, type AreaFilter, type Level } from '../../quiz/schema.ts'
import { newSeed, selectQuestions, shuffleOptions, SEED_PATTERN } from '../../quiz/lib/select.ts'
import { loadBank, loadConfig } from './lib/bank.ts'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}
const flag = (name: string) => process.argv.includes(`--${name}`)

const level = arg('level') as Level
const topic = (arg('topic') ?? 'all') as AreaFilter
const seed = arg('seed') ?? newSeed()
if (!LEVELS.includes(level) || !(topic === 'all' || AREAS.includes(topic)) || !SEED_PATTERN.test(seed)) {
  console.error(`Usage: pnpm quiz:sample --level <${LEVELS.join('|')}> [--topic <all|${AREAS.join('|')}>] [--seed <4-16 a-z0-9>] [--answers | --key-only] [--json]`)
  process.exit(1)
}

const config = loadConfig()
const { questions } = loadBank()
const split = questions.filter(lq => lq.question.status === 'live').map(lq => splitQuestion(lq.question))
const selection = selectQuestions(split.map(s => s.question), { seed, level, area: topic, count: quizLengthFor(config, level) })
const keys = new Map(split.map(s => [s.key.id, s.key]))
const shown = selection.questions.map(q => (q.options ? { ...q, options: shuffleOptions(q.options, seed, q.id) } : q))

if (flag('json')) {
  console.log(JSON.stringify({
    level,
    topic,
    seed,
    shortBy: selection.shortBy,
    poolSize: selection.poolSize,
    ...(flag('key-only') ? {} : { questions: shown }),
    ...(flag('answers') || flag('key-only') ? { keys: shown.map(q => keys.get(q.id)) } : {})
  }, null, 2))
  process.exit(0)
}

console.log(`# ${level} · ${topic} · seed ${seed} · ${shown.length} questions from a pool of ${selection.poolSize}${selection.shortBy ? ` (short by ${selection.shortBy})` : ''}`)
console.log(`# /quiz/play?level=${level}&topic=${topic}&seed=${seed}\n`)

if (!flag('key-only')) {
  shown.forEach((q, n) => {
    console.log(`${n + 1}. [${q.type}] ${q.id} v${q.version}`)
    console.log(`   ${q.prompt.replace(/\n/g, ' ')}`)
    if (q.code) {
      q.code.text.split('\n').forEach((line, i) => console.log(`   ${String(i + 1).padStart(2)} │ ${line}`))
    }
    for (const o of q.options ?? []) console.log(`   (${o.id}) ${o.text}`)
    console.log('')
  })
}

if (flag('answers') || flag('key-only')) {
  console.log('# Answer key')
  shown.forEach((q, n) => {
    const key = keys.get(q.id)!
    const answer = 'optionId' in key.correct ? `option ${key.correct.optionId}` : `line ${key.correct.lines.join(' or ')}`
    console.log(`${n + 1}. ${q.id}: ${answer}${key.fix ? ` (should read: ${key.fix.trim()})` : ''}`)
    console.log(`   ${key.explanation.replace(/\n/g, ' ')}`)
    console.log(`   ${key.links.map(l => l.to).join('  ')}`)
  })
}
