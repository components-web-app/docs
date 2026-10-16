/**
 * The quiz's shared data contract. Both the runtime (app/, server/) and the bank
 * pipeline (scripts/quiz/) import this file, and nothing else in quiz/ except
 * quiz/lib/*. See quiz/DESIGN.md for why each field exists.
 *
 * Plain zod v3, no Nuxt imports, erasable TypeScript only, so Node can run it
 * directly (type stripping) and Vite/Nitro can bundle it.
 */
import { z } from 'zod'
import { AREAS, LEVELS, REPOS, STATUSES, VERSION_PATTERN, type AnswerKey, type Link, type PublicQuestion, type Repo } from './core.ts'

// The vocabulary, the client-side types and the grader live in core.ts, which has no zod in it, so
// the quiz pages can import them without shipping zod to the browser. Everything is re-exported here.
export * from './core.ts'

const REPO_IDS = Object.keys(REPOS) as [Repo, ...Repo[]]

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

/** Lower case words joined by `.` or `-`, e.g. `nuxt.admin.is-editing`. Names the topic, never the answer. Never reused. */
export const QuestionId = z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'lower-case words joined by . or -').max(120)

/** `sha256:` plus the first 16 hex characters. Made by quiz/lib/hash.ts. */
export const ShortHash = z.string().regex(/^sha256:[0-9a-f]{16}$/)

const Sha = z.string().regex(/^[0-9a-f]{40}$/, 'a full 40-character commit SHA')

/** A docs URL path as the site serves it: no numeric prefixes, no trailing slash. */
const DocsPath = z.string().regex(/^\/[a-z0-9/-]*$/).refine(p => p === '/' || !p.endsWith('/'), 'no trailing slash')

/** Inline markdown: backticks, **bold**, _em_ and [links](/path). Rendered at prerender time. */
const InlineMarkdown = z.string().min(1).max(600)

export const LinkSchema = z.object({
  label: z.string().min(1),
  to: z.string().min(1)
}).strict()

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

/** A section of a docs page. The check script recomputes `sectionHash` from content/. */
export const DocsSourceSchema = z.object({
  kind: z.literal('docs'),
  page: DocsPath,
  /** Heading id exactly as the site renders it (the MDC parser's id), without `#`. */
  anchor: z.string().regex(/^[a-z0-9_-]+$/),
  sectionHash: ShortHash,
  /** For code questions: which fenced block in the section, counting from 0. */
  block: z.number().int().min(0).optional(),
  /** Hash of that block's display text (annotations stripped). */
  blockHash: ShortHash.optional()
}).strict().refine(s => (s.block === undefined) === (s.blockHash === undefined), 'block and blockHash go together')
export type DocsSource = z.infer<typeof DocsSourceSchema>

/** Lines of a source file at a pinned commit. The check compares them with the repo's tracked branch. */
export const CodeSourceSchema = z.object({
  kind: z.literal('code'),
  repo: z.enum(REPO_IDS),
  path: z.string().regex(/^[^/].*[^/]$/, 'repo-relative path'),
  /** First and last line, 1-based, inclusive. */
  lines: z.tuple([z.number().int().min(1), z.number().int().min(1)]).refine(([a, b]) => a <= b, 'first line <= last line'),
  commit: Sha,
  linesHash: ShortHash
}).strict()
export type CodeSource = z.infer<typeof CodeSourceSchema>

export const SourceSchema = z.union([DocsSourceSchema, CodeSourceSchema])
export type Source = z.infer<typeof SourceSchema>

// ---------------------------------------------------------------------------
// Question
// ---------------------------------------------------------------------------

const OptionSchema = z.object({
  /** Stable within the question (`a`, `b`, ...). The display order is shuffled, the id is not. */
  id: z.string().regex(/^[a-z]$/),
  text: InlineMarkdown
}).strict()

const CodeSchema = z.object({
  lang: z.enum(['ts', 'js', 'vue', 'php', 'yaml', 'json', 'bash', 'shell', 'ini', 'css', 'html', 'text']),
  /** The exact lines shown, no `[!code]` annotations. Line numbers in answers count from 1. */
  text: z.string().min(1).refine(t => t.split('\n').length >= 3 && t.split('\n').length <= 30, '3 to 30 lines')
}).strict()

/** Records how a generated question was made, so `quiz:generate` can keep its id stable. */
const GeneratorSchema = z.object({
  name: z.enum(['spot-the-mistake', 'pick-the-line', 'glossary']),
  /** The catalogue entry (mistake id, line-target id or glossary term) it was built from. */
  ref: z.string().min(1)
}).strict()

const CalibrationSchema = z.object({
  /** The question version the values were fitted on. A version bump makes them stale. */
  version: z.number().int().min(1).optional(),
  /** The model they came from. Values from different models can't be compared. */
  model: z.enum(['rasch', '2pl', '3pl']).optional(),
  /** IRT difficulty (b), from response data. */
  difficulty: z.number().optional(),
  /** IRT discrimination (a). */
  discrimination: z.number().optional(),
  /** Number of responses the values came from. */
  responses: z.number().int().min(0).optional(),
  calibratedAt: z.string().optional(),
  /** 3PL guessing (c), 0 to 1. */
  guessing: z.number().min(0).max(1).optional()
}).strict().refine(c => Object.keys(c).length === 0 || c.version !== undefined, 'calibration values need the version they were fitted on')

const ExposureSchema = z.object({
  /** Sampling weight, default 1. Lower it to show an over-exposed question less often. */
  weight: z.number().positive().max(10).optional(),
  /** Exam mode only: the most often a question may be shown, as a share of sittings. */
  maxRate: z.number().min(0).max(1).optional()
}).strict()

const ExplanationSchema = z.string().min(1).max(500)

/**
 * One sentence on when the fact matters in practice: the bug it explains, the decision it informs.
 * Shown under the explanation as "Why it matters". Never shown before the answer, since it can give
 * the answer away.
 */
const WhySchema = z.string().min(1).max(300)

/** A release of one repo. Stored without a leading `v`. */
const VersionRefSchema = z.object({
  repo: z.enum(REPO_IDS),
  version: z.string().regex(VERSION_PATTERN).refine(v => !v.startsWith('v'), 'no leading v'),
  /** The change is on the repo's tracked branch after `version`, not yet released. */
  unreleased: z.boolean().optional()
}).strict()

const oneRefPerRepo = (refs: { repo?: string }[] | undefined) => !refs || new Set(refs.map(r => r.repo)).size === refs.length

const BaseQuestion = z.object({
  /** Never changes after the question is first live. */
  id: QuestionId,
  /** Starts at 1. Goes up whenever the meaning, the code or the correct answer changes. */
  version: z.number().int().min(1),
  status: z.enum(STATUSES),
  retired: z.object({ reason: z.string().min(1), replacedBy: QuestionId.optional() }).strict().optional(),
  level: z.enum(LEVELS),
  area: z.enum(AREAS),
  /** Tags from quiz/config.yml. The first tag drives "read next" on the result screen. */
  tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(4),
  /** Author's estimate, 1 (easy) to 5 (hard), within the level. Replaced by calibration later. */
  difficulty: z.number().int().min(1).max(5).optional(),
  calibration: CalibrationSchema.optional(),
  exposure: ExposureSchema.optional(),
  /**
   * Expert only (required there): how well the docs cover this behaviour. The brief asks that most
   * expert questions be `undocumented` or `light`; `quiz:check` reports the share.
   */
  docsCoverage: z.enum(['undocumented', 'light', 'documented']).optional(),
  /** Questions in one family are variants of each other. A quiz shows at most one per family. */
  family: z.string().regex(/^[a-z0-9:._/#-]+$/).optional(),
  prompt: InlineMarkdown,
  /** Required for hand-written questions from intermediate up (`quiz:check`). Generated ones copy their catalogue entry's. */
  why: WhySchema.optional(),
  /**
   * The release that brought in the behaviour tested, one per repo involved. A question with `since`
   * in the newest releases is in the What's new quiz; an exam for given versions uses it too.
   */
  since: z.array(VersionRefSchema).min(1).max(3).refine(oneRefPerRepo, 'one entry per repo').optional(),
  /** The first release where the answer no longer holds. Set it when retiring a question for a change. */
  until: z.array(VersionRefSchema.omit({ unreleased: true })).min(1).max(3).refine(oneRefPerRepo, 'one entry per repo').optional(),
  sources: z.array(SourceSchema).min(1).max(3),
  generator: GeneratorSchema.optional(),
  author: z.string().optional(),
  /** The person who checked the question, and the version they checked. A version bump makes it stale. */
  reviewed: z.object({ by: z.string().min(1), version: z.number().int().min(1) }).strict().optional(),
  /**
   * Optional Angoff rating, 0 to 1: the chance a candidate just good enough for the level gets it
   * right. The basis for exam pass marks before there is response data.
   */
  cutRating: z.number().min(0).max(1).optional()
})

export const MultipleChoiceSchema = BaseQuestion.extend({
  type: z.literal('multiple-choice'),
  options: z.array(OptionSchema).min(3).max(5),
  /** Optional snippet shown above the options. */
  code: CodeSchema.optional(),
  answer: z.object({
    correct: z.string().regex(/^[a-z]$/),
    explanation: ExplanationSchema,
    /** A short note per wrong option, shown when the reader picks it. */
    optionNotes: z.record(z.string().regex(/^[a-z]$/), z.string().max(300)).optional(),
    links: z.array(LinkSchema).max(3).optional()
  }).strict()
}).strict()

export const PickTheLineSchema = BaseQuestion.extend({
  type: z.literal('pick-the-line'),
  code: CodeSchema,
  answer: z.object({
    /** Every line that counts as correct (a statement can span lines). */
    lines: z.array(z.number().int().min(1)).min(1).max(3),
    explanation: ExplanationSchema,
    links: z.array(LinkSchema).max(3).optional()
  }).strict()
}).strict()

export const SpotTheMistakeSchema = BaseQuestion.extend({
  type: z.literal('spot-the-mistake'),
  code: CodeSchema,
  answer: z.object({
    /** The one wrong line. */
    line: z.number().int().min(1),
    /** What the line should say. Shown after answering. */
    fix: z.string().min(1),
    explanation: ExplanationSchema,
    links: z.array(LinkSchema).max(3).optional()
  }).strict()
}).strict()

export const QuestionSchema = z.discriminatedUnion('type', [MultipleChoiceSchema, PickTheLineSchema, SpotTheMistakeSchema])
  .superRefine((q, ctx) => {
    if (q.status === 'retired' && !q.retired) {
      ctx.addIssue({ code: 'custom', path: ['retired'], message: 'a retired question needs retired.reason' })
    }
    if (q.type === 'multiple-choice') {
      const ids = q.options.map(o => o.id)
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'duplicate option id' })
      }
      if (!ids.includes(q.answer.correct)) {
        ctx.addIssue({ code: 'custom', path: ['answer', 'correct'], message: `"${q.answer.correct}" is not one of the options` })
      }
      for (const id of Object.keys(q.answer.optionNotes ?? {})) {
        if (!ids.includes(id) || id === q.answer.correct) {
          ctx.addIssue({ code: 'custom', path: ['answer', 'optionNotes', id], message: 'notes are for wrong options only' })
        }
      }
    }
    if (q.type !== 'multiple-choice') {
      const lineCount = q.code.text.split('\n').length
      const answerLines = q.type === 'pick-the-line' ? q.answer.lines : [q.answer.line]
      for (const line of answerLines) {
        if (line > lineCount) {
          ctx.addIssue({ code: 'custom', path: ['answer'], message: `line ${line} is past the end of the code (${lineCount} lines)` })
        } else if (q.code.text.split('\n')[line - 1].trim() === '') {
          ctx.addIssue({ code: 'custom', path: ['answer'], message: `line ${line} is blank` })
        }
      }
    }
    if (q.level === 'expert' && !q.sources.some(s => s.kind === 'code')) {
      ctx.addIssue({ code: 'custom', path: ['sources'], message: 'an expert question cites at least one source file' })
    }
    if (q.calibration?.version !== undefined && q.calibration.version !== q.version) {
      ctx.addIssue({ code: 'custom', path: ['calibration', 'version'], message: `calibrated on version ${q.calibration.version}, but the question is version ${q.version}` })
    }
    if (q.level === 'expert' && !q.docsCoverage) {
      ctx.addIssue({ code: 'custom', path: ['docsCoverage'], message: 'an expert question says how well the docs cover it' })
    }
  })
export type Question = z.infer<typeof QuestionSchema>

/** One bank file: quiz/bank/**\/*.yml holds `questions: [...]`. */
export const BankFileSchema = z.object({ questions: z.array(QuestionSchema) }).strict()

// ---------------------------------------------------------------------------
// Catalogues (bank pipeline input, edited by people)
// ---------------------------------------------------------------------------

const CatalogueBase = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(STATUSES),
  level: z.enum(LEVELS),
  area: z.enum(AREAS),
  tags: z.array(z.string()).min(1).max(4),
  langs: z.array(CodeSchema.shape.lang).min(1),
  /** JavaScript regex source. It must match exactly one line of a block for the block to qualify. */
  match: z.string().min(1),
  /** Only use blocks on these docs pages (prefix match). Empty means anywhere. */
  pages: z.array(z.string()).optional(),
  /**
   * Blocks never to use, as `/page#anchor/block`. For example a block that shows the wrong way on
   * purpose, which would make a broken spot-the-mistake or teach the wrong line.
   */
  exclude: z.array(z.string().regex(/^\/[a-z0-9/-]*#[a-z0-9_-]+\/\d+$/)).optional(),
  explanation: ExplanationSchema,
  /** Copied to every question made from the entry. */
  why: WhySchema,
  /** Where "Read more" goes, in place of the block's own section. */
  readMore: z.object({ page: DocsPath, anchor: z.string() }).strict().optional(),
  /** At most this many questions from this entry. */
  limit: z.number().int().min(1).max(20).default(6),
  /**
   * The family its questions join, when another entry or a hand-written question tests the same fact.
   * Defaults to `mistake:<id>` or `target:<id>`.
   */
  family: z.string().regex(/^[a-z0-9:._/#-]+$/).optional()
})

/** quiz/catalogue/mistakes.yml */
export const MistakeSchema = CatalogueBase.extend({
  title: z.string().min(1),
  /** Replacement for the matched text ($1 etc. allowed). Must change the line. */
  replace: z.string(),
  prompt: InlineMarkdown.default('One line in this code is wrong. Click it.')
}).strict()
export type Mistake = z.infer<typeof MistakeSchema>
export const MistakeCatalogueSchema = z.object({ mistakes: z.array(MistakeSchema) }).strict()

/** quiz/catalogue/line-targets.yml */
export const LineTargetSchema = CatalogueBase.extend({
  prompt: InlineMarkdown
}).strict()
export type LineTarget = z.infer<typeof LineTargetSchema>
export const LineTargetCatalogueSchema = z.object({ targets: z.array(LineTargetSchema) }).strict()

// ---------------------------------------------------------------------------
// quiz/config.yml
// ---------------------------------------------------------------------------

export const QuizConfigSchema = z.object({
  quizLength: z.number().int().min(3).max(30),
  /**
   * A topic needs at least this many live families at a level before the start page offers it.
   * Below that a topic quiz is a few questions that repeat on every try.
   */
  minTopicFamilies: z.number().int().min(1).max(30).default(8),
  levels: z.array(z.object({
    id: z.enum(LEVELS),
    title: z.string(),
    blurb: z.string(),
    /** Overrides `quizLength` for this level, for a level whose bank is still small. */
    quizLength: z.number().int().min(3).max(30).optional(),
    /** Share of questions needed to pass, 0 to 1. v1 shows it; exam placement uses it. */
    passMark: z.number().min(0).max(1),
    /** Fun titles for the result screen, by minimum score share. */
    ranks: z.array(z.object({ min: z.number().min(0).max(1), title: z.string() }).strict()).min(1)
  }).strict()).length(LEVELS.length),
  /** The What's new quiz: questions from every level whose `since` is one of a repo's newest releases. */
  whatsNew: z.object({
    title: z.string(),
    blurb: z.string(),
    /** How many of each repo's newest releases count as new. */
    releases: z.number().int().min(1).max(10),
    /** The start page offers the quiz once it has this many families. */
    minFamilies: z.number().int().min(1).max(30),
    quizLength: z.number().int().min(3).max(30).optional(),
    passMark: z.number().min(0).max(1),
    ranks: z.array(z.object({ min: z.number().min(0).max(1), title: z.string() }).strict()).min(1)
  }).strict(),
  areas: z.array(z.object({ id: z.enum(AREAS), label: z.string() }).strict()),
  tags: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    label: z.string(),
    /** Suggested reading when the reader gets this tag wrong. */
    read: z.object({ page: DocsPath, anchor: z.string().optional() }).strict()
  }).strict())
}).strict()
export type QuizConfig = z.infer<typeof QuizConfigSchema>

// ---------------------------------------------------------------------------
// Pure helpers both sides use
// ---------------------------------------------------------------------------

/** `/nuxt-module/module-setup#install`, or the GitHub URL pinned to the commit with a line range. */
export function sourceLink(source: Source): Link {
  if (source.kind === 'docs') {
    return { label: 'Read more in the docs', to: `${source.page}#${source.anchor}` }
  }
  const [from, to] = source.lines
  return {
    label: `${source.path} (lines ${from}–${to})`,
    to: `https://github.com/${REPOS[source.repo].github}/blob/${source.commit}/${source.path}#L${from}-L${to}`
  }
}

/** Splits an authored question into what the client may see and the answer key. */
export function splitQuestion(q: Question): { question: PublicQuestion, key: AnswerKey } {
  const question: PublicQuestion = {
    id: q.id,
    version: q.version,
    level: q.level,
    area: q.area,
    tags: q.tags,
    type: q.type,
    prompt: q.prompt,
    ...(q.family ? { family: q.family } : {}),
    ...(q.exposure?.weight ? { weight: q.exposure.weight } : {}),
    // Copied field by field: the Nuxt app type-checks this file without strictNullChecks, where zod
    // infers every property as optional.
    ...(q.type === 'multiple-choice' ? { options: q.options.map(o => ({ id: o.id, text: o.text })) } : {}),
    ...(q.code ? { code: { lang: q.code.lang, text: q.code.text } } : {})
  }
  const links: Link[] = [...q.sources.map(sourceLink), ...(q.answer.links ?? []).map(l => ({ label: l.label, to: l.to }))]
  const base = { id: q.id, version: q.version, type: q.type, explanation: q.answer.explanation, ...(q.why ? { why: q.why } : {}), links, tags: [...q.tags] }
  let key: AnswerKey
  if (q.type === 'multiple-choice') {
    key = { ...base, correct: { optionId: q.answer.correct }, ...(q.answer.optionNotes ? { optionNotes: q.answer.optionNotes } : {}) }
  } else if (q.type === 'pick-the-line') {
    key = { ...base, correct: { lines: q.answer.lines } }
  } else {
    key = { ...base, correct: { lines: [q.answer.line] }, fix: q.answer.fix }
  }
  return { question, key }
}
