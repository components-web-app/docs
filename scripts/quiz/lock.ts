/**
 * pnpm quiz:lock
 *
 * Records every live and retired id with its version, fingerprint and the docs commit it was locked
 * at, in quiz/bank.lock.json. Run when a pull request's questions are approved. Refuses to lock a
 * question whose meaning changed without a version bump. Drafts are never locked.
 */
import { execFileSync } from 'node:child_process'
import { ROOT } from './lib/docs.ts'
import { fingerprint, loadBank, loadLock, LOCK_FILE, writeLock } from './lib/bank.ts'

function docsCommit(): string {
  try {
    const sha = execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const dirty = execFileSync('git', ['-C', ROOT, 'status', '--porcelain', '--', 'content'], { encoding: 'utf8' }).trim()
    if (dirty) console.warn('content/ has uncommitted changes: commit them first, so the locked docs commit holds the text these hashes came from.')
    return dirty ? `${sha}+dirty` : sha
  } catch {
    return 'unknown'
  }
}

const { questions, issues } = loadBank()
if (issues.length) {
  console.error('The bank has schema errors. Run `pnpm quiz:check` first.')
  process.exit(1)
}

const lock = loadLock()
const commit = docsCommit()
let added = 0
let failed = 0
for (const { question: q, file } of questions) {
  if (q.status === 'draft') continue
  const fp = fingerprint(q)
  const entry = lock.questions[q.id] ?? { status: q.status, version: q.version, versions: {} }
  const locked = entry.versions[String(q.version)]
  if (q.version < entry.version) {
    console.error(`${q.id} (${file}): version went down from ${entry.version} to ${q.version}`)
    failed++
    continue
  }
  if (locked && locked.fingerprint !== fp) {
    console.error(`${q.id} (${file}): its meaning changed but it is still version ${q.version}. Bump the version`)
    failed++
    continue
  }
  if (!locked) {
    entry.versions[String(q.version)] = { fingerprint: fp, docsCommit: commit }
    added++
  }
  entry.status = q.status
  entry.version = q.version
  lock.questions[q.id] = entry
}

if (failed) {
  console.error(`${failed} questions can't be locked. Nothing written.`)
  process.exit(1)
}
writeLock(lock)
console.log(`${LOCK_FILE}: ${Object.keys(lock.questions).length} ids, ${added} new versions locked at ${commit.slice(0, 12)}.`)
