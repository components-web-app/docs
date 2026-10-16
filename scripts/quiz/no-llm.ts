/**
 * pnpm quiz:no-llm (run after `pnpm generate`)
 *
 * Fails if the built site, the quiz's code or the lockfile contains a known LLM SDK or endpoint
 * (quiz/DESIGN.md section 10). The quiz must work with no LLM anywhere in the loop.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ROOT } from './lib/docs.ts'

const PACKAGES = ['@anthropic-ai/', '"openai"', '\'openai\'', '/openai@', '@google/generative-ai', '@google/genai', 'groq-sdk', '@mistralai/', 'cohere-ai', '/ollama@', '"ollama"', '@ai-sdk/']
const HOSTS = ['api.anthropic.com', 'api.openai.com', 'generativelanguage.googleapis.com', 'api.groq.com', 'api.mistral.ai', 'api.cohere.ai']
/** The `ai` package, matched as a pnpm lockfile entry so words like "said" don't count. */
const AI_PACKAGE = /^\s{2}\/?ai@\d|^\s{2}'?ai@\d|\bnode_modules\/ai\//m

const TEXT = /\.(js|mjs|cjs|ts|vue|json|html|yml|yaml|txt|md)$/
const SKIP = new Set(['node_modules', '.git', '.nuxt'])

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (TEXT.test(name) && st.size < 20 * 1024 * 1024) out.push(full)
  }
  return out
}

const targets = [
  ...walk(join(ROOT, '.output', 'public')),
  ...walk(join(ROOT, 'server')),
  ...walk(join(ROOT, 'app')),
  ...walk(join(ROOT, 'quiz')).filter(f => !f.endsWith('DESIGN.md') && !f.endsWith('README.md')),
  join(ROOT, 'pnpm-lock.yaml')
].filter(existsSync)

if (!existsSync(join(ROOT, '.output', 'public'))) console.warn('No .output/public: run `pnpm generate` first to check the built site too.')

const hits: string[] = []
for (const file of targets) {
  const text = readFileSync(file, 'utf8')
  for (const needle of [...PACKAGES, ...HOSTS]) {
    if (text.includes(needle)) hits.push(`${relative(ROOT, file)}: ${needle}`)
  }
  if (file.endsWith('pnpm-lock.yaml') && AI_PACKAGE.test(text)) hits.push(`${relative(ROOT, file)}: the "ai" package`)
}

if (hits.length) {
  console.error(`Found LLM SDKs or endpoints:\n${hits.map(h => `  ${h}`).join('\n')}`)
  process.exit(1)
}
console.log(`No LLM SDKs or endpoints in ${targets.length} files.`)
