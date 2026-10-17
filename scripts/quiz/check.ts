/**
 * pnpm quiz:check [--strict] [--drift-warn] [--fetch] [--quiet]
 *
 * Every check in quiz/DESIGN.md section 9. Errors exit 1; --strict makes warnings errors too.
 * --drift-warn keeps drift as a warning under --strict: source lines that moved or changed on a
 * repo's tracked branch, and a new release after an unreleased `since`. Those come from the other
 * repos, not from the pull request, so CI reports them without failing.
 * In GitHub Actions, drift also shows as a warning annotation.
 * Reports are printed and never fail. Needs no network unless a source repo has no local clone.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compareVersions, isWhatsNew, REPOS, whatsNewWindow, type Question, type Repo, type Source } from '../../quiz/schema.ts'
import { readAllPages, dedent, locateRun, ROOT, type DocsPage } from './lib/docs.ts'
import { fetchRepo, findMoved, linesHash, readAt, releaseTags, sliceLines, trackedHead } from './lib/source.ts'
import { fingerprint, loadBank, loadConfig, loadLock, LOCK_FILE, rel, type LoadedQuestion } from './lib/bank.ts'
import { bracketsBalance, endsOnOpenTag, stripTrailingComment } from './generators/common.ts'

const args = new Set(process.argv.slice(2))
const STRICT = args.has('--strict')
const QUIET = args.has('--quiet')
const DRIFT_WARN = args.has('--drift-warn')

type Severity = 'error' | 'warning'
const findings: { severity: Severity, id: string, file: string, message: string, drift?: boolean }[] = []
const report: string[] = []

function add(severity: Severity, lq: { file: string, question?: { id: string } } | { file: string, id: string }, message: string, drift = false) {
  const id = 'id' in lq ? lq.id : lq.question?.id ?? '-'
  findings.push({ severity, id, file: lq.file, message, ...(drift ? { drift } : {}) })
}

/** A warning caused by another repo moving on, not by the bank. */
const drift = (lq: LoadedQuestion, message: string) => add('warning', lq, message, true)

export const RETIRE_REASONS = ['stale-source', 'ambiguous', 'wrong', 'too-easy', 'poor-stats', 'over-exposed', 'leaked', 'superseded'] as const

// ---------------------------------------------------------------------------
// Docs provenance
// ---------------------------------------------------------------------------

function checkDocsSource(lq: LoadedQuestion, s: Extract<Source, { kind: 'docs' }>, n: number, pages: Map<string, DocsPage>) {
  const q = lq.question
  const page = pages.get(s.page)
  if (!page) return add('error', lq, `sources[${n}]: no docs page at ${s.page}`)
  if (page.error) return add('error', lq, `sources[${n}]: ${s.page} can't be parsed into sections (${page.error})`)
  const section = page.sections.find(x => x.anchor === s.anchor)
  if (!section) return add('error', lq, `sources[${n}]: ${s.page} has no heading #${s.anchor}`)
  if (section.hash !== s.sectionHash) add('warning', lq, `stale: ${s.page}#${s.anchor} changed (sectionHash ${s.sectionHash} is now ${section.hash}). Review the question, then \`pnpm quiz:stamp ${q.id}\``)
  if (s.block === undefined) return
  const block = section.blocks[s.block]
  if (!block) return add('error', lq, `sources[${n}]: ${s.page}#${s.anchor} has no code block ${s.block} (it has ${section.blocks.length})`)
  if (block.hash !== s.blockHash) add('warning', lq, `stale: code block ${s.block} of ${s.page}#${s.anchor} changed (blockHash ${s.blockHash} is now ${block.hash})`)
  // Only the first source with a block holds the shown code.
  if (n !== q.sources.findIndex(x => x.kind === 'docs' && x.block !== undefined)) return
  if (!q.code) return
  checkShownCode(lq, block.display, `${s.page}#${s.anchor} block ${s.block}`, block.display)
}

/**
 * The shown code must be a contiguous run of the source; spot-the-mistake differs in exactly the
 * answer line. Comments at the end of a line may be left out (they often give the answer away).
 */
function checkShownCode(lq: LoadedQuestion, sourceText: string, where: string, wholeSource: string) {
  const q = lq.question
  if (!q.code) return
  const lang = q.code.lang
  const norm = (line: string) => stripTrailingComment(line, lang).trimEnd()
  if (endsOnOpenTag(q.code.text.split('\n'))) {
    add('warning', lq, 'the shown code ends on a tag it never closes, which looks unfinished. End the window earlier')
  }
  if (q.type === 'spot-the-mistake') {
    const exact = locateRun(sourceText, q.code.text, false, norm)
    if (exact) return add('error', lq, `the code is identical to ${where}: no line is wrong`)
    const run = locateRun(sourceText, q.code.text, true, norm)
    if (!run) return add('error', lq, `the code isn't ${where} with exactly one line changed`)
    if (run.diffLine !== q.answer.line) add('error', lq, `the changed line is ${run.diffLine}, but answer.line is ${q.answer.line}`)
    if (run.original !== norm(q.answer.fix)) add('error', lq, `answer.fix isn't the original line. The source says: ${run.original}`)
    const restored = q.code.text.split('\n')
    restored[q.answer.line - 1] = q.answer.fix
    if (!bracketsBalance(restored.join('\n')) && bracketsBalance(wholeSource)) {
      add('warning', lq, 'the shown lines leave a bracket open, which can look like a second mistake. Review the window')
    }
  } else if (!locateRun(sourceText, q.code.text, false, norm)) {
    add('error', lq, `the code isn't a contiguous run of ${where}`)
  }
}

// ---------------------------------------------------------------------------
// Pinned source (expert)
// ---------------------------------------------------------------------------

async function checkCodeSource(lq: LoadedQuestion, s: Extract<Source, { kind: 'code' }>, n: number) {
  const q = lq.question
  const [from, to] = s.lines
  const pinned = await readAt(s.repo, s.commit, s.path)
  if (pinned === undefined) return add('warning', lq, `unverifiable: can't read ${s.repo}/${s.path} at ${s.commit.slice(0, 8)} (no clone, no network). Set CWA_${s.repo === 'api-components-bundle' ? 'BUNDLE' : s.repo === 'cwa-nuxt-module' ? 'MODULE' : 'TEMPLATE'}_DIR`)
  const total = pinned.split('\n').length
  if (to > total) return add('error', lq, `sources[${n}]: ${s.path} has ${total} lines at ${s.commit.slice(0, 8)}, not ${to}`)
  const hash = linesHash(pinned, from, to)
  if (hash !== s.linesHash) return add('error', lq, `sources[${n}]: ${s.path} lines ${from}-${to} at ${s.commit.slice(0, 8)} don't match linesHash (they hash to ${hash})`)
  const wanted = sliceLines(pinned, from, to)
  if (q.code && n === q.sources.findIndex(x => x.kind === 'code') && !q.sources.some(x => x.kind === 'docs' && x.block !== undefined)) {
    const shown = dedent(wanted).join('\n')
    checkShownCode(lq, shown, `${s.path} lines ${from}-${to}`, shown)
  }
  const head = trackedHead(s.repo)
  const headRef = head ?? `origin/${REPOS[s.repo].track}`
  if (head === s.commit) return
  const current = await readAt(s.repo, headRef, s.path)
  if (current === undefined) return drift(lq, `stale: ${s.path} no longer exists on ${REPOS[s.repo].track}, or can't be read`)
  if (linesHash(current, from, to) === s.linesHash) return
  const moved = findMoved(current, wanted)
  if (moved) drift(lq, `stale: ${s.path} lines ${from}-${to} moved to L${moved[0]}-L${moved[1]} on ${REPOS[s.repo].track}. \`pnpm quiz:stamp ${q.id}\` re-pins it`)
  else drift(lq, `stale: ${s.path} lines ${from}-${to} changed on ${REPOS[s.repo].track}. Review the question against the new code`)
}

// ---------------------------------------------------------------------------
// Fairness (section 3, "Writing fair questions")
// ---------------------------------------------------------------------------

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const plainText = (md: string) => md.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '')

function checkFairness(lq: LoadedQuestion) {
  const q = lq.question
  if (/\b(not|except)\b/i.test(plainText(q.prompt).replace(/`[^`]*`/g, ''))) {
    add('warning', lq, 'the prompt has "not" or "except". Ask the question the positive way round')
  }
  if (q.type === 'multiple-choice') {
    for (const o of q.options) {
      if (/\b(all|none) of the above\b/i.test(o.text)) add('error', lq, `option ${o.id} is "${o.text}". Write a real option`)
    }
    // Code options keep their punctuation: `a(b)` and `a, b` are different code.
    const norm = q.options.map(o => (/^`[^`]+`$/.test(o.text.trim()) ? o.text.replace(/\s+/g, '') : plainText(o.text).toLowerCase().replace(/[^a-z0-9]/g, '')))
    if (new Set(norm).size !== norm.length) add('error', lq, 'two options differ only in punctuation or case')
    const correct = q.options.find(o => o.id === q.answer.correct)!
    const others = q.options.filter(o => o !== correct).map(o => plainText(o.text).length)
    const m = median(others)
    const own = plainText(correct.text).length
    // A retired question is never shown, so its option lengths don't matter.
    if (q.status === 'retired') {
      // nothing
    } else if (own > 1.5 * m) {
      add('warning', lq, `the correct option is ${own} characters, over 1.5× the others' median (${m}). Balance the option lengths`)
    } else if (own > 1.2 * Math.max(...others)) {
      add('warning', lq, `the correct option is ${own} characters, over 1.2× the longest wrong one (${Math.max(...others)}). A test-wise reader picks the longest; lengthen a wrong option`)
    }
  } else {
    const lines = q.code.text.split('\n')
    const answers = q.type === 'pick-the-line' ? q.answer.lines : [q.answer.line]
    for (const a of answers) {
      const text = lines[a - 1].trim()
      const twins = lines.flatMap((l, i) => (l.trim() === text && !answers.includes(i + 1) ? [i + 1] : []))
      if (twins.length) add('error', lq, `line ${a} also appears as line ${twins.join(', ')}, so the answer is ambiguous`)
    }
  }
  if (q.status === 'retired' && q.retired && !RETIRE_REASONS.some(r => q.retired!.reason.startsWith(r))) {
    add('error', lq, `retired.reason must start with one of: ${RETIRE_REASONS.join(', ')}`)
  }
  if (q.calibration?.version !== undefined && q.calibration.version !== q.version) {
    add('error', lq, `calibration is for version ${q.calibration.version}, but the question is version ${q.version}`)
  }
}

/** Markdown links to docs pages in the prompt, options and answer must resolve. */
function checkLinks(lq: LoadedQuestion, pages: Map<string, DocsPage>) {
  const q = lq.question
  const texts = [q.prompt, q.answer.explanation, ...(q.why ? [q.why] : []), ...(q.type === 'multiple-choice' ? q.options.map(o => o.text) : []), ...Object.values((q.answer as { optionNotes?: Record<string, string> }).optionNotes ?? {})]
  const targets = [...texts.flatMap(t => [...t.matchAll(/\]\((\/[^)\s]*)\)/g)].map(m => m[1])), ...(q.answer.links ?? []).map(l => l.to).filter(to => to.startsWith('/'))]
  for (const t of texts) {
    if (/\]\(#/.test(t)) add('error', lq, 'a link starts with `#`. Write the page path too: the quiz is on another page')
  }
  for (const to of targets) {
    const [path, anchor] = to.split('#')
    const page = pages.get(path)
    if (!page) {
      if (!['/quiz'].includes(path)) add('error', lq, `link to ${to}: no such docs page`)
      continue
    }
    if (anchor && !page.sections.some(s => s.anchor === anchor)) add('error', lq, `link to ${to}: ${path} has no heading #${anchor}`)
  }
}

/**
 * Loose words for CWA records. The glossary terms are component group and component position. Vue's
 * slots (`<slot />`, "default slot", "named slot") are fine.
 */
const LOOSE_TERMS: { pattern: RegExp, use: string }[] = [
  { pattern: /\bregions?\b/i, use: 'component group' },
  { pattern: /(?<!\b(?:default|named|scoped|vue's|vue|layout's)\s)\bslots?\b(?!\s*(?:prop|content))/i, use: 'component position, or say Vue\'s slot' }
]

function checkTerms(lq: LoadedQuestion) {
  const q = lq.question
  if (q.status !== 'live') return
  const texts: [string, string | undefined][] = [
    ['prompt', q.prompt],
    ['why', q.why],
    ['explanation', q.answer.explanation],
    ...(q.type === 'multiple-choice' ? q.options.map(o => [`option ${o.id}`, o.text] as [string, string]) : []),
    ...Object.entries((q.answer as { optionNotes?: Record<string, string> }).optionNotes ?? {}).map(([id, n]) => [`note ${id}`, n] as [string, string])
  ]
  for (const [where, text] of texts) {
    if (!text) continue
    const prose = plainText(text.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']'))
    for (const t of LOOSE_TERMS) {
      const m = prose.match(t.pattern)
      if (m) add('warning', lq, `${where} says "${m[0]}". Use the glossary term: ${t.use} (quiz/README.md, "Use CWA's terms")`)
    }
  }
}

/** Levels whose hand-written questions must say why the fact matters. */
const WHY_LEVELS = new Set(['intermediate', 'advanced', 'expert'])

function checkWhy(lq: LoadedQuestion) {
  const q = lq.question
  if (q.status === 'live' && !q.generator && !q.why && WHY_LEVELS.has(q.level)) {
    add('error', lq, `a hand-written ${q.level} question needs \`why\`: one sentence on when the fact matters in practice`)
  }
}

/** `since` and `until` name real releases, and an unreleased change is resolved once it ships. */
function checkVersions(lq: LoadedQuestion) {
  const q = lq.question
  for (const [field, refs] of [['since', q.since], ['until', q.until]] as const) {
    for (const r of refs ?? []) {
      const tags = releaseTags(r.repo as Repo)
      if (!tags) continue
      const released = tags.some(t => compareVersions(t, r.version) === 0)
      if (!released) {
        add('error', lq, `${field}: ${r.repo} has no release ${r.version}`)
        continue
      }
      if (field === 'since' && 'unreleased' in r && r.unreleased) {
        const later = tags.filter(t => compareVersions(t, r.version) > 0).sort(compareVersions)
        if (later.length) drift(lq, `since: ${r.repo} has released ${later[0]} since ${r.version}. If the change is in it, set version: ${later[0].replace(/^v/, '')} and drop unreleased`)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const config = loadConfig()
  const tagIds = new Set(config.tags.map(t => t.id))
  const pages = await readAllPages()
  for (const page of pages.values()) {
    if (page.error) report.push(`note: ${page.path} can't be split into sections: ${page.error}`)
  }
  const { questions, issues } = loadBank()
  for (const issue of issues) add('error', { file: issue.file, id: issue.id ?? '-' }, issue.message)

  if (args.has('--fetch')) for (const repo of Object.keys(REPOS) as (keyof typeof REPOS)[]) fetchRepo(repo)

  // Duplicate ids across every bank file.
  const seen = new Map<string, string>()
  for (const lq of questions) {
    const other = seen.get(lq.question.id)
    if (other) add('error', lq, `duplicate id, also in ${other}`)
    else seen.set(lq.question.id, lq.file)
  }

  for (const lq of questions) {
    const q = lq.question
    for (const tag of q.tags) if (!tagIds.has(tag)) add('error', lq, `tag "${tag}" isn't in quiz/config.yml`)
    // A retired question is frozen and never shown: its sources may drift without a warning.
    if (q.status !== 'retired') for (const [n, s] of q.sources.entries()) {
      if (s.kind === 'docs') checkDocsSource(lq, s, n, pages)
      else await checkCodeSource(lq, s, n)
    }
    checkFairness(lq)
    checkLinks(lq, pages)
    checkTerms(lq)
    checkWhy(lq)
    checkVersions(lq)
  }

  // The lock file: live ids never vanish, versions never go down, a changed meaning bumps the version.
  const lock = loadLock()
  const byId = new Map(questions.map(lq => [lq.question.id, lq]))
  if (!existsSync(LOCK_FILE)) {
    add('warning', { file: rel(LOCK_FILE), id: '-' }, 'no lock file. Run `pnpm quiz:lock` and commit quiz/bank.lock.json with the bank')
  } else {
    // Every published id must be in the lock, so the pull request that adds or changes a question
    // also updates the lock, and its diff shows the version history.
    for (const lq of questions) {
      const q = lq.question
      if (q.status === 'draft') continue
      const entry = lock.questions[q.id]
      if (!entry) add('warning', lq, `${q.status} but not in quiz/bank.lock.json. Run \`pnpm quiz:lock\``)
      else if (!entry.versions[String(q.version)]) add('warning', lq, `version ${q.version} isn't in quiz/bank.lock.json. Run \`pnpm quiz:lock\``)
      else if (entry.status !== q.status) add('warning', lq, `the lock says ${entry.status}. Run \`pnpm quiz:lock\``)
    }
  }
  for (const [id, entry] of Object.entries(lock.questions)) {
    const lq = byId.get(id)
    if (!lq) {
      add('error', { file: rel(LOCK_FILE), id }, 'locked but missing from the bank. Retire questions, never delete them')
      continue
    }
    const q = lq.question
    if (q.version < entry.version) add('error', lq, `version went down: the lock has ${entry.version}, the bank ${q.version}`)
    const locked = entry.versions[String(q.version)]
    if (locked && locked.fingerprint !== fingerprint(q)) {
      add('error', lq, `the prompt, options, code or answer changed but version is still ${q.version}. Bump the version`)
    }
  }

  printReports(questions, config.levels.map(l => l.id), config.whatsNew)

  const isError = (f: typeof findings[number]) => f.severity === 'error' || (STRICT && !(DRIFT_WARN && f.drift))
  const errors = findings.filter(isError)
  const warnings = findings.filter(f => !isError(f))
  for (const f of [...findings].sort((a, b) => a.file.localeCompare(b.file) || a.id.localeCompare(b.id))) {
    const label = isError(f) ? 'ERROR' : 'warn '
    console.log(`${label} ${f.id} (${f.file}): ${f.message}`)
    if (process.env.GITHUB_ACTIONS && f.drift && !isError(f)) console.log(`::warning file=${f.file},title=Quiz source drift (${f.id})::${f.message}`)
  }
  console.log(`\n${questions.length} questions checked: ${errors.length} errors, ${warnings.length} warnings${STRICT ? ' (--strict)' : ''}`)
  if (errors.length) process.exitCode = 1
}

function printReports(questions: LoadedQuestion[], levels: string[], whatsNew: { releases: number, minFamilies: number }) {
  const live = questions.filter(lq => lq.question.status === 'live').map(lq => lq.question)
  const lines: string[] = [...report]

  const window = whatsNewWindow(live, whatsNew.releases)
  const fresh = live.filter(q => isWhatsNew(q, window))
  const freshFamilies = new Set(fresh.map(q => q.family ?? `q:${q.id}`)).size
  lines.push(`What's new: ${fresh.length} questions in ${freshFamilies} families, on ${[...window].map(([repo, v]) => `${repo} ${[...v].join(', ')}`).join('; ') || 'no releases yet'}`)
  if (freshFamilies < whatsNew.minFamilies) findings.push({ severity: 'warning', id: '-', file: 'quiz/config.yml', message: `What's new has ${freshFamilies} families, under minFamilies (${whatsNew.minFamilies}), so the start page hides it. Write questions on the latest releases` })

  lines.push('Live questions per level and type:')
  for (const level of levels) {
    const atLevel = live.filter(q => q.level === level)
    const byType = ['multiple-choice', 'pick-the-line', 'spot-the-mistake'].map(t => `${t} ${atLevel.filter(q => q.type === t).length}`)
    lines.push(`  ${level.padEnd(13)} ${String(atLevel.length).padStart(3)}  (${byType.join(', ')})`)
  }

  const expert = live.filter(q => q.level === 'expert')
  if (expert.length) {
    const light = expert.filter(q => q.docsCoverage === 'undocumented' || q.docsCoverage === 'light').length
    lines.push(`Expert questions on behaviour the docs cover lightly or not at all: ${light} of ${expert.length} (${Math.round(100 * light / expert.length)}%)`)
  }

  lines.push('Correct option ids (multiple choice), per level:')
  for (const level of levels) {
    const counts: Record<string, number> = {}
    for (const q of live) if (q.level === level && q.type === 'multiple-choice') counts[q.answer.correct] = (counts[q.answer.correct] ?? 0) + 1
    lines.push(`  ${level.padEnd(13)} ${Object.keys(counts).sort().map(k => `${k} ${counts[k]}`).join(', ') || '-'}`)
  }

  lines.push('Multiple choice where the correct option is the single longest (chance is about 25%; keep it under 35%):')
  for (const level of levels) {
    const mc = live.filter(q => q.level === level && q.type === 'multiple-choice')
    const longest = mc.filter((q) => {
      if (q.type !== 'multiple-choice') return false
      const len = (t: string) => plainText(t).length
      const own = len(q.options.find(o => o.id === q.answer.correct)!.text)
      return q.options.every(o => o.id === q.answer.correct || len(o.text) < own)
    }).length
    const share = mc.length ? longest / mc.length : 0
    lines.push(`  ${level.padEnd(13)} ${longest} of ${mc.length} (${Math.round(100 * share)}%)`)
    if (mc.length >= 10 && share > 0.35) findings.push({ severity: 'warning', id: '-', file: `level ${level}`, message: `the correct option is the single longest in ${Math.round(100 * share)}% of multiple-choice questions. Lengthen wrong options` })
  }

  lines.push(`Live families per level (target 60), and per area (target 10):`)
  for (const level of levels) {
    const atLevel = live.filter(q => q.level === level)
    const fam = (qs: Question[]) => new Set(qs.map(q => q.family ?? `q:${q.id}`)).size
    const areas = [...new Set(atLevel.map(q => q.area))].sort().map(a => `${a} ${fam(atLevel.filter(q => q.area === a))}`)
    lines.push(`  ${level.padEnd(13)} ${String(fam(atLevel)).padStart(3)}  (${areas.join(', ')})`)
  }

  const unreviewed = live.filter(q => !q.reviewed || q.reviewed.by === q.author || q.reviewed.version !== q.version)
  lines.push(`Live questions without a current review by someone other than the author: ${unreviewed.length} of ${live.length} (an exam bank needs 0)`)

  // A stale build serves a different bank from the one sample.ts and the seed links describe.
  const built = join(ROOT, '.output/public/api/quiz/questions')
  if (existsSync(built)) {
    const stale: string[] = []
    for (const level of levels) {
      const file = join(built, `${level}.json`)
      const count = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as unknown[]).length : 0
      const want = live.filter(q => q.level === level).length
      if (count !== want) stale.push(`${level} ${count} built, ${want} in the bank`)
    }
    lines.push(stale.length ? `The build in .output is out of date (${stale.join('; ')}). Run \`pnpm generate\` before testing the site.` : 'The build in .output matches the bank.')
  }

  if (!QUIET) console.log(lines.join('\n') + '\n')
}

await main()
