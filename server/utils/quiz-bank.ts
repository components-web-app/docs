import { parse } from 'yaml'
import { BankFileSchema, isWhatsNew, QUIZ_SETS, QuizConfigSchema, splitQuestion, whatsNewWindow, WHATS_NEW, type AnswerKey, type PublicQuestion, type Question, type QuizConfig, type QuizSet } from '../../quiz/schema'

/**
 * Reads the quiz bank from quiz/ (a Nitro server asset, see nuxt.config.ts) at prerender time.
 *
 * Every bank file is validated with the shared schema. An invalid file throws, which fails the
 * prerender and so the build: a broken question never reaches the site. Stale questions are still
 * served; staleness is `pnpm quiz:check`'s job, and a docs edit must never block a deploy.
 */

const storage = () => useStorage('assets:quiz')

async function readText(key: string): Promise<string> {
  const value = await storage().getItemRaw(key)
  if (typeof value === 'string') {
    return value
  }
  if (value instanceof Uint8Array) {
    return new TextDecoder().decode(value)
  }
  throw new Error(`quiz: could not read ${key}`)
}

let configCache: Promise<QuizConfig> | undefined
let bankCache: Promise<Question[]> | undefined

export function loadQuizConfig(): Promise<QuizConfig> {
  configCache ??= (async () => {
    const result = QuizConfigSchema.safeParse(parse(await readText('config.yml')))
    if (!result.success) {
      throw new Error(`quiz/config.yml is invalid:\n${result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`)
    }
    return result.data
  })()
  return configCache
}

/** Every question in quiz/bank/**, validated. Ids must be unique across files. */
export function loadQuizBank(): Promise<Question[]> {
  bankCache ??= (async () => {
    const config = await loadQuizConfig()
    const tagIds = new Set(config.tags.map(t => t.id))
    const keys = (await storage().getKeys('bank')).filter(k => k.endsWith('.yml')).sort()
    const questions: Question[] = []
    const seen = new Map<string, string>()
    const errors: string[] = []
    for (const key of keys) {
      const file = key.replace(/:/g, '/')
      const result = BankFileSchema.safeParse(parse(await readText(key)))
      if (!result.success) {
        errors.push(...result.error.issues.map(i => `${file}: ${i.path.join('.')}: ${i.message}`))
        continue
      }
      for (const q of result.data.questions) {
        const other = seen.get(q.id)
        if (other) {
          errors.push(`${file}: duplicate id ${q.id} (also in ${other})`)
        }
        seen.set(q.id, file)
        for (const tag of q.tags) {
          if (!tagIds.has(tag)) {
            errors.push(`${file}: ${q.id}: tag "${tag}" is not in quiz/config.yml`)
          }
        }
        questions.push(q)
      }
    }
    if (errors.length) {
      throw new Error(`The quiz bank is invalid:\n${errors.map(e => `  ${e}`).join('\n')}`)
    }
    return questions
  })()
  return bankCache
}

/** The live questions in a set: one level, or What's new (every level, newest releases only). */
export async function liveInSet(set: QuizSet): Promise<Question[]> {
  const live = (await loadQuizBank()).filter(q => q.status === 'live')
  if (set !== WHATS_NEW) {
    return live.filter(q => q.level === set)
  }
  const window = whatsNewWindow(live, (await loadQuizConfig()).whatsNew.releases)
  return live.filter(q => isWhatsNew(q, window))
}

/** Live questions in a set, split into what the client sees and the answer keys. */
export async function loadSet(set: QuizSet): Promise<{ questions: PublicQuestion[], keys: AnswerKey[] }> {
  const split = (await liveInSet(set)).map(splitQuestion)
  return { questions: split.map(s => s.question), keys: split.map(s => s.key) }
}

/** `beginner.json` → `beginner`, `whats-new.json` → `whats-new`, or a 404. */
export function setParam(param: string | undefined): QuizSet {
  const set = (param || '').replace(/\.json$/, '')
  if (!(QUIZ_SETS as readonly string[]).includes(set)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return set as QuizSet
}
