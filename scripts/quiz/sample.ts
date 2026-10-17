/**
 * pnpm quiz:sample --level <level|whats-new> [--topic <area|all>] [--seed <seed>] [--at <repo@version,…>] [--answers | --key-only] [--json]
 *
 * Prints the quiz the page gives for this level (or What's new), topic and seed, with no answers: only what
 * `splitQuestion()` puts in a PublicQuestion. `--answers` adds the answer key as a separate list
 * after the quiz; `--key-only` prints only the key. The same seed lists the same ids as the browser.
 *
 * `--at cwa-nuxt-module@2.0.0-alpha.17,api-components-bundle@2.0.0-alpha.22` previews an exam for
 * those versions: the pool is the questions that hold for them (`appliesAt()`), retired ones included.
 * The site has no such quiz yet.
 */
import { appliesAt, AREAS, isWhatsNew, QUIZ_SETS, quizLengthFor, REPOS, splitQuestion, whatsNewWindow, WHATS_NEW, type AreaFilter, type QuizSet, type Repo } from '../../quiz/schema.ts'
import { newSeed, selectQuestions, shuffleOptions, SEED_PATTERN } from '../../quiz/lib/select.ts'
import { loadBank, loadConfig } from './lib/bank.ts'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}
const flag = (name: string) => process.argv.includes(`--${name}`)

const level = arg('level') as QuizSet
const topic = (arg('topic') ?? 'all') as AreaFilter
const seed = arg('seed') ?? newSeed()
const at: Partial<Record<Repo, string>> = {}
for (const pair of (arg('at') ?? '').split(',').filter(Boolean)) {
  const [repo, version] = pair.split('@')
  if (!(repo in REPOS) || !version) {
    console.error(`--at takes repo@version pairs, repos: ${Object.keys(REPOS).join(', ')}`)
    process.exit(1)
  }
  at[repo as Repo] = version
}
if (!QUIZ_SETS.includes(level) || !(topic === 'all' || AREAS.includes(topic)) || !SEED_PATTERN.test(seed)) {
  console.error(`Usage: pnpm quiz:sample --level <${QUIZ_SETS.join('|')}> [--topic <all|${AREAS.join('|')}>] [--seed <4-16 a-z0-9>] [--at <repo@version,…>] [--answers | --key-only] [--json]`)
  process.exit(1)
}

const config = loadConfig()
const { questions } = loadBank()
const versioned = Object.keys(at).length > 0
const live = questions.map(lq => lq.question).filter(q => versioned ? q.status !== 'draft' && appliesAt(q, at) : q.status === 'live')
const window = whatsNewWindow(live, config.whatsNew.releases)
const split = live.filter(q => level !== WHATS_NEW || isWhatsNew(q, window)).map(q => splitQuestion(q))
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

console.log(`# ${level} · ${topic}${versioned ? ` · at ${arg('at')}` : ''} · seed ${seed} · ${shown.length} questions from a pool of ${selection.poolSize}${selection.shortBy ? ` (short by ${selection.shortBy})` : ''}`)
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
    if (key.why) console.log(`   Why: ${key.why.replace(/\n/g, ' ')}`)
    console.log(`   ${key.links.map(l => l.to).join('  ')}`)
  })
}
