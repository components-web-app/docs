/**
 * Loads and validates the bank, the catalogues, the config and the lock file.
 * Extra bank directories (a private exam bank, say) can be added with QUIZ_BANK_DIRS, separated by ':'.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse, stringify } from 'yaml'
import { z } from 'zod'
import {
  BankFileSchema,
  LineTargetCatalogueSchema,
  MistakeCatalogueSchema,
  QuestionSchema,
  QuizConfigSchema,
  type LineTarget,
  type Mistake,
  type Question,
  type QuizConfig
} from '../../../quiz/schema.ts'
import { shortHash } from '../../../quiz/lib/hash.ts'
import { ROOT } from './docs.ts'

export const QUIZ_DIR = join(ROOT, 'quiz')
export const BANK_DIR = join(QUIZ_DIR, 'bank')
/** QUIZ_LOCK_FILE points elsewhere, for a private bank or a dry run. */
export const LOCK_FILE = process.env.QUIZ_LOCK_FILE || join(QUIZ_DIR, 'bank.lock.json')

export type LoadedQuestion = { question: Question, file: string }
export type LoadIssue = { file: string, id?: string, message: string }

function listYaml(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listYaml(full))
    else if (/\.ya?ml$/.test(entry.name)) out.push(full)
  }
  return out.sort()
}

export function rel(file: string): string {
  return relative(ROOT, file)
}

export function bankDirs(): string[] {
  const extra = (process.env.QUIZ_BANK_DIRS ?? '').split(':').filter(Boolean)
  return [BANK_DIR, ...extra]
}

/**
 * Every question in every bank file. A file that fails `BankFileSchema` is reported question by
 * question, so one bad question doesn't hide the others.
 */
export function loadBank(): { questions: LoadedQuestion[], issues: LoadIssue[] } {
  const questions: LoadedQuestion[] = []
  const issues: LoadIssue[] = []
  for (const dir of bankDirs()) {
    for (const file of listYaml(dir)) {
      let data: unknown
      try {
        data = parse(readFileSync(file, 'utf8'))
      } catch (e) {
        issues.push({ file: rel(file), message: `YAML error: ${(e as Error).message}` })
        continue
      }
      const whole = BankFileSchema.safeParse(data)
      if (whole.success) {
        for (const question of whole.data.questions) questions.push({ question, file: rel(file) })
        continue
      }
      const list = (data as { questions?: unknown[] })?.questions
      if (!Array.isArray(list)) {
        issues.push({ file: rel(file), message: 'a bank file holds one key, `questions`, with a list' })
        continue
      }
      list.forEach((item, n) => {
        const one = QuestionSchema.safeParse(item)
        const id = (item as { id?: string })?.id
        if (one.success) questions.push({ question: one.data, file: rel(file) })
        else for (const issue of one.error.issues) issues.push({ file: rel(file), id: id ?? `#${n}`, message: `${issue.path.join('.') || '(question)'}: ${issue.message}` })
      })
    }
  }
  return { questions, issues }
}

function readYaml<T>(file: string, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(parse(readFileSync(file, 'utf8')))
  if (!parsed.success) {
    const lines = parsed.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`${rel(file)} is invalid:\n${lines}`)
  }
  return parsed.data
}

export function loadConfig(): QuizConfig {
  return readYaml(join(QUIZ_DIR, 'config.yml'), QuizConfigSchema)
}

export function loadMistakes(): Mistake[] {
  const file = join(QUIZ_DIR, 'catalogue', 'mistakes.yml')
  return existsSync(file) ? readYaml(file, MistakeCatalogueSchema).mistakes : []
}

export function loadLineTargets(): LineTarget[] {
  const file = join(QUIZ_DIR, 'catalogue', 'line-targets.yml')
  return existsSync(file) ? readYaml(file, LineTargetCatalogueSchema).targets : []
}

// ---------------------------------------------------------------------------
// Fingerprints and the lock file
// ---------------------------------------------------------------------------

/** Canonical JSON: keys sorted, so the fingerprint doesn't depend on YAML key order. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/**
 * What a version means: type, prompt, options, code and the answer itself. Explanations, tags,
 * difficulty and level can change without a version bump (quiz/DESIGN.md section 9).
 */
export function fingerprint(q: Question): string {
  const a = q.answer as Record<string, unknown>
  return shortHash(canonical({
    type: q.type,
    prompt: q.prompt,
    options: q.type === 'multiple-choice' ? q.options : undefined,
    code: q.code,
    answer: { correct: a.correct, lines: a.lines, line: a.line, fix: a.fix }
  }))
}

export const LockSchema = z.object({
  /** One entry per id. `versions` keeps every version ever locked, with the docs commit it was locked at. */
  questions: z.record(z.string(), z.object({
    status: z.enum(['live', 'retired']),
    version: z.number().int().min(1),
    versions: z.record(z.string(), z.object({ fingerprint: z.string(), docsCommit: z.string() }).strict())
  }).strict())
}).strict()
export type Lock = z.infer<typeof LockSchema>

export function loadLock(): Lock {
  if (!existsSync(LOCK_FILE)) return { questions: {} }
  return LockSchema.parse(JSON.parse(readFileSync(LOCK_FILE, 'utf8')))
}

export function writeLock(lock: Lock) {
  const sorted: Lock = { questions: Object.fromEntries(Object.entries(lock.questions).sort(([a], [b]) => a.localeCompare(b))) }
  writeFileSync(LOCK_FILE, JSON.stringify(sorted, null, 2) + '\n')
}

// ---------------------------------------------------------------------------
// Writing YAML the way people write it
// ---------------------------------------------------------------------------

export function toYaml(header: string, questions: unknown[]): string {
  const body = stringify({ questions }, { lineWidth: 110, blockQuote: 'literal', defaultStringType: 'PLAIN', aliasDuplicateObjects: false })
  return header.trim() + '\n\n' + body
}
