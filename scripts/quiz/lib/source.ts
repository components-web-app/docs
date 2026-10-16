/**
 * Reads source files of the three public repos at a commit. Local clones first (never the working
 * tree, since a clone may be on another branch), then raw GitHub. See quiz/DESIGN.md section 5.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { REPOS, type Repo } from '../../../quiz/schema.ts'
import { linesHash } from '../../../quiz/lib/hash.ts'
import { ROOT } from './docs.ts'

const DIR_ENV: Record<Repo, [string, string]> = {
  'api-components-bundle': ['CWA_BUNDLE_DIR', '../api-components-bundle'],
  'cwa-nuxt-module': ['CWA_MODULE_DIR', '../cwa-nuxt-3-module'],
  'components-web-app': ['CWA_TEMPLATE_DIR', '../components-web-app']
}

export function repoDir(repo: Repo): string | undefined {
  const [env, fallback] = DIR_ENV[repo]
  const dir = resolve(ROOT, process.env[env] || fallback)
  return existsSync(join(dir, '.git')) ? dir : undefined
}

function git(dir: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return undefined
  }
}

const fetched = new Set<Repo>()

/** `git fetch` the tracked branch once per run (only with --fetch). */
export function fetchRepo(repo: Repo) {
  const dir = repoDir(repo)
  if (!dir || fetched.has(repo)) return
  fetched.add(repo)
  git(dir, ['fetch', '--quiet', 'origin', REPOS[repo].track])
}

/** Full SHA of the tracked branch's head, from the local clone. */
export function trackedHead(repo: Repo): string | undefined {
  const dir = repoDir(repo)
  return dir ? git(dir, ['rev-parse', `origin/${REPOS[repo].track}`])?.trim() : undefined
}

const fileCache = new Map<string, string | undefined>()

/** A file's text at `ref` (a SHA or `origin/<track>`), or undefined when it can't be read. */
export async function readAt(repo: Repo, ref: string, path: string): Promise<string | undefined> {
  const cacheKey = `${repo}|${ref}|${path}`
  if (fileCache.has(cacheKey)) return fileCache.get(cacheKey)
  let text: string | undefined
  const dir = repoDir(repo)
  if (dir) {
    text = git(dir, ['show', `${ref}:${path}`])
  }
  if (text === undefined && process.env.QUIZ_OFFLINE !== '1') {
    const rawRef = ref.startsWith('origin/') ? ref.slice('origin/'.length) : ref
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${REPOS[repo].github}/${rawRef}/${path}`)
      if (res.ok) text = await res.text()
    } catch {
      // No network: the caller reports the question as unverifiable.
    }
  }
  fileCache.set(cacheKey, text)
  return text
}

export function sliceLines(text: string, from: number, to: number): string[] {
  return text.replace(/\r\n?/g, '\n').split('\n').slice(from - 1, to).map(l => l.replace(/\s+$/, ''))
}

/** Where the same run of lines sits in `text` now, if it moved. Returns the new [from, to]. */
export function findMoved(text: string, wanted: string[]): [number, number] | undefined {
  const all = text.replace(/\r\n?/g, '\n').split('\n').map(l => l.replace(/\s+$/, ''))
  for (let i = 0; i + wanted.length <= all.length; i++) {
    let same = true
    for (let k = 0; k < wanted.length && same; k++) same = all[i + k] === wanted[k]
    if (same) return [i + 1, i + wanted.length]
  }
  return undefined
}

export { linesHash }
