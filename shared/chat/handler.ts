/**
 * The chat endpoint, written against the Fetch API so the same code runs as a Vercel
 * edge function (api/chat.ts) and in `nuxt dev` (server/api/chat.*.ts).
 *
 *   GET  /api/chat  → { available: boolean }
 *   POST /api/chat  { messages: ChatTurn[] } → NDJSON stream of ChatEvent
 *
 * Nothing is stored: the conversation lives in the visitor's tab and is sent whole
 * with each question.
 *
 * Claude is called with fetch rather than @anthropic-ai/sdk: the SDK's credential
 * fallbacks dynamically import node:fs and node:path, which Vercel's edge bundler
 * refuses, and this endpoint needs only one streamed Messages API call.
 */
import type { ChatChunk, ChatEvent, ChatIndex, ChatTurn } from './types'
import { chunkKey, createRetriever, sourcesOf, type Retriever } from './retrieval'
import { SYSTEM_PROMPT, buildUserMessage, excerptsOf } from './prompt'

export const CHAT_MODEL = 'claude-haiku-5-5'

/** Limits for a public, unauthenticated endpoint. */
export const CHAT_LIMITS = {
  /** Characters in one question. */
  questionChars: 1000,
  /** Questions in one conversation (the widget offers to start again after this). */
  questions: 8,
  /** Characters kept from each earlier answer when it's sent back as history. */
  answerChars: 3000,
  /** Per IP, per edge instance: requests in a minute, and in a day. */
  perMinute: 6,
  perDay: 60,
  /** About 4k tokens of docs found before the model is asked; it can search for more. */
  contextChars: 16_000,
  /** Searches the model may run itself, each adding up to about 3k tokens. */
  searches: 2,
  searchChars: 12_000,
  /** Answers are asked to stay brief; this is room for a short code example. */
  maxOutputTokens: 1200
} as const

export interface ChatEnv {
  apiKey?: string
  /** Cloudflare Turnstile's secret key. When set, every question needs a valid token. */
  turnstileSecret?: string
  /** Overrides Turnstile's siteverify URL (the tests point it at a fake server). */
  turnstileVerifyUrl?: string
  /** Answer with a canned, streamed reply instead of calling Anthropic (local testing). */
  mock?: boolean
  /** Where the retrieval index is; defaults to /api/chat-index.json on the request's origin. */
  indexUrl?: string
  /** Overrides the model, for testing. */
  model?: string
  /** Overrides the Messages API URL (the tests point it at a fake server). */
  apiUrl?: string
}

/** Reads the settings from environment variables (Vercel, or `nuxt dev`'s process.env). */
export function chatEnvFrom(env: Record<string, string | undefined>): ChatEnv {
  return {
    apiKey: env.NUXT_ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY || undefined,
    turnstileSecret: env.NUXT_TURNSTILE_SECRET_KEY || undefined,
    mock: env.NUXT_CHAT_MOCK === 'true' || env.NUXT_CHAT_MOCK === '1',
    indexUrl: env.NUXT_CHAT_INDEX_URL || undefined,
    model: env.NUXT_CHAT_MODEL || undefined
  }
}

export function chatAvailable(env: ChatEnv): boolean {
  return Boolean(env.apiKey || env.mock)
}

// ---------------------------------------------------------------------------
// Rate limit: a sliding window per IP. It lives in the edge instance's memory, so
// it only slows down one client hammering one region; a Vercel firewall rule and a
// spend limit on the Anthropic key are the real ceiling.

const hits = new Map<string, number[]>()

export function rateLimited(ip: string, now = Date.now()): boolean {
  const day = 24 * 60 * 60 * 1000
  const recent = (hits.get(ip) ?? []).filter(time => now - time < day)
  const lastMinute = recent.filter(time => now - time < 60_000).length
  if (lastMinute >= CHAT_LIMITS.perMinute || recent.length >= CHAT_LIMITS.perDay) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    // Forget the oldest clients rather than grow without bound.
    for (const key of [...hits.keys()].slice(0, 1000)) hits.delete(key)
  }
  return false
}

export function resetRateLimits(): void {
  hits.clear()
}

function clientIp(request: Request): string {
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}

// ---------------------------------------------------------------------------
// Validation

export type ValidatedTurns = { ok: true, turns: ChatTurn[] } | { ok: false, status: number, message: string }

export function validateTurns(body: unknown): ValidatedTurns {
  const messages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || !messages.length) {
    return { ok: false, status: 400, message: 'Send at least one message.' }
  }
  const turns: ChatTurn[] = []
  for (const [index, message] of messages.entries()) {
    const { role, content } = (message ?? {}) as Partial<ChatTurn>
    const expected = index % 2 === 0 ? 'user' : 'assistant'
    if (role !== expected || typeof content !== 'string') {
      return { ok: false, status: 400, message: 'Messages must alternate between question and answer, starting with a question.' }
    }
    const text = content.trim()
    if (role === 'user' && !text) return { ok: false, status: 400, message: 'The question is empty.' }
    if (role === 'user' && text.length > CHAT_LIMITS.questionChars) {
      return { ok: false, status: 413, message: `Please keep each question under ${CHAT_LIMITS.questionChars} characters.` }
    }
    turns.push({ role, content: role === 'assistant' ? text.slice(0, CHAT_LIMITS.answerChars) : text })
  }
  if (turns[turns.length - 1]!.role !== 'user') {
    return { ok: false, status: 400, message: 'The last message must be a question.' }
  }
  if (turns.filter(turn => turn.role === 'user').length > CHAT_LIMITS.questions) {
    return { ok: false, status: 429, message: 'This conversation has reached its limit. Start a new one to keep going.' }
  }
  return { ok: true, turns }
}

// ---------------------------------------------------------------------------
// Retrieval index, cached for the life of the edge instance

interface LoadedIndex {
  retriever: Retriever
  glossary: string
}

let retrieverPromise: Promise<LoadedIndex> | undefined

/**
 * Loads the index once per instance. `cookie` is the visitor's own, passed on only when the
 * index is on the request's own origin: on a preview behind Vercel Authentication, the
 * visitor's sign-in cookie is what lets the function read its own site.
 */
async function loadRetriever(url: string, cookie?: string): Promise<LoadedIndex> {
  if (!retrieverPromise) {
    retrieverPromise = fetch(url, { headers: cookie ? { cookie } : {}, redirect: 'manual' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`The chat index returned ${response.status}`)
        const index = await response.json() as ChatIndex
        return { retriever: createRetriever(index.chunks), glossary: index.glossary ?? '' }
      })
      .catch((error) => {
        retrieverPromise = undefined
        throw error
      })
  }
  return retrieverPromise
}

/** The search query: the latest question, plus the one before so "and how do I test it?" still finds its topic. */
export function retrievalQuery(turns: ChatTurn[]): string {
  const questions = turns.filter(turn => turn.role === 'user').map(turn => turn.content)
  const latest = questions[questions.length - 1] ?? ''
  const previous = questions[questions.length - 2] ?? ''
  return `${latest} ${latest} ${previous}`
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Bot check: Cloudflare Turnstile. The widget in the panel gets a token for each question,
// and it's checked here before anything is sent to Anthropic. Tokens are single use.

export const TURNSTILE_FAILED = 'We couldn\'t confirm this question came from a person. Reload the page and try again.'

export async function turnstilePassed(token: unknown, ip: string, env: ChatEnv): Promise<boolean> {
  if (!env.turnstileSecret) return true
  if (typeof token !== 'string' || !token || token.length > 2048) return false
  const form = new URLSearchParams({ secret: env.turnstileSecret, response: token })
  if (ip !== 'unknown') form.set('remoteip', ip)
  try {
    const response = await fetch(env.turnstileVerifyUrl || 'https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(5000)
    })
    const result = await response.json() as { 'success'?: boolean, 'error-codes'?: string[] }
    if (!result.success) console.warn('[chat] Turnstile refused a token', result['error-codes'])
    return result.success === true
  } catch (error) {
    console.error('[chat] could not reach Turnstile', error)
    return false
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  })
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

export async function handleChatRequest(request: Request, env: ChatEnv): Promise<Response> {
  if (request.method === 'GET') return json({ available: chatAvailable(env) })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!sameOrigin(request)) return json({ error: 'Cross-origin requests are not accepted.' }, 403)
  if (!chatAvailable(env)) return json({ error: 'The assistant is not available right now.' }, 503)

  if (rateLimited(clientIp(request))) {
    return json({ error: 'You have asked a lot of questions in a short time. Please wait a minute, or search the docs instead.' }, 429)
  }

  const raw = await request.text()
  if (raw.length > 64_000) return json({ error: 'The conversation is too long. Start a new one.' }, 413)
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: 'The request was not valid JSON.' }, 400)
  }
  const validated = validateTurns(body)
  if ('message' in validated) return json({ error: validated.message }, validated.status)
  const turns = validated.turns

  if (!await turnstilePassed((body as { turnstileToken?: unknown }).turnstileToken, clientIp(request), env)) {
    return json({ error: TURNSTILE_FAILED }, 403)
  }

  let chunks: ChatChunk[]
  let loaded: LoadedIndex
  try {
    loaded = env.indexUrl
      ? await loadRetriever(env.indexUrl)
      : await loadRetriever(new URL('/api/chat-index.json', request.url).toString(), request.headers.get('cookie') ?? undefined)
    chunks = loaded.retriever.search(retrievalQuery(turns), { maxChars: CHAT_LIMITS.contextChars })
  } catch (error) {
    console.error('[chat] could not load the index', error)
    return json({ error: 'The assistant is not available right now.' }, 503)
  }

  const sources = sourcesOf(chunks)
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      send({ type: 'sources', sources })
      try {
        if (env.mock) {
          await streamMock(turns, sources, send)
        } else {
          await streamClaude(turns, chunks, loaded, env, send, request.signal)
        }
        send({ type: 'done' })
      } catch (error) {
        console.error('[chat]', error)
        send({ type: 'error', message: errorMessage(error) })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

class AnthropicError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof AnthropicError && (error.status === 429 || error.status === 529 || error.status >= 500)) {
    return 'The assistant is busy right now. Please try again in a minute, or search the docs.'
  }
  return 'Something went wrong while answering. Please try again, or search the docs.'
}

/** Reads a server-sent event stream as `{ event, data }` pairs. */
async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<{ event: string, data: string }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n')
    let end: number
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      let event = 'message'
      const data: string[] = []
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
      }
      if (data.length) yield { event, data: data.join('\n') }
    }
    if (done) return
  }
}

const SEARCH_TOOL = {
  name: 'search_docs',
  description: 'Search the CWA documentation. Returns passages, each with its page title and url. '
    + 'Use CWA\'s own terms from the glossary (component group, page data, template page, publishable, scaled mode), '
    + 'not the visitor\'s wording. Search when the excerpts you have don\'t answer the question, or answer only part of it.',
  input_schema: {
    type: 'object',
    properties: { query: { type: 'string', description: 'A few keywords in CWA\'s terms.' } },
    required: ['query']
  }
}

interface ContentBlock {
  type: string
  text?: string
  id?: string
  name?: string
  input?: unknown
}

async function streamClaude(
  turns: ChatTurn[],
  chunks: ChatChunk[],
  loaded: LoadedIndex,
  env: ChatEnv,
  send: (event: ChatEvent) => void,
  signal: AbortSignal
): Promise<void> {
  const history = turns.slice(0, -1)
  const question = turns[turns.length - 1]!.content
  const seen = new Set(chunks.map(chunkKey))
  const found = [...chunks]

  const messages: { role: 'user' | 'assistant', content: string | unknown[] }[] = [
    ...history.map(turn => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: buildUserMessage(question, chunks, loaded.glossary) }
  ]

  for (let round = 0; ; round++) {
    // After the last allowed search the model must answer with what it has.
    const canSearch = round < CHAT_LIMITS.searches
    const { blocks, stopReason } = await claudeRound(messages, canSearch, env, send, signal)

    const toolUses = blocks.filter(block => block.type === 'tool_use')
    if (stopReason !== 'tool_use' || !toolUses.length) {
      if (stopReason === 'refusal') {
        send({ type: 'delta', text: '\n\nI can\'t help with that one. Try asking about building a site with CWA.' })
      } else if (stopReason === 'max_tokens') {
        send({ type: 'delta', text: '…\n\n(The answer was cut short. Ask me to continue, or follow the links above.)' })
      }
      return
    }

    messages.push({ role: 'assistant', content: blocks })
    const results = toolUses.map((use) => {
      const query = String((use.input as { query?: unknown })?.query ?? '').slice(0, 200)
      send({ type: 'searching', query })
      const more = query ? loaded.retriever.search(query, { maxChars: CHAT_LIMITS.searchChars, limit: 6, exclude: seen }) : []
      for (const chunk of more) {
        seen.add(chunkKey(chunk))
        found.push(chunk)
      }
      return {
        type: 'tool_result',
        tool_use_id: use.id,
        content: more.length ? excerptsOf(more) : 'No other passages matched. Answer from what you have, or say the docs don\'t cover it.'
      }
    })
    send({ type: 'sources', sources: sourcesOf(found) })
    messages.push({ role: 'user', content: results })
  }
}

/** One call to the Messages API, streaming its text to the visitor as it arrives. */
async function claudeRound(
  messages: unknown[],
  canSearch: boolean,
  env: ChatEnv,
  send: (event: ChatEvent) => void,
  signal: AbortSignal
): Promise<{ blocks: ContentBlock[], stopReason: string }> {
  const response = await fetch(env.apiUrl || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.apiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: env.model || CHAT_MODEL,
      max_tokens: CHAT_LIMITS.maxOutputTokens,
      // A docs chat wants a quick first word more than deep reasoning, and thinking
      // tokens would count against the short max_tokens.
      thinking: { type: 'disabled' },
      stream: true,
      system: SYSTEM_PROMPT,
      tools: [SEARCH_TOOL],
      tool_choice: canSearch ? { type: 'auto' } : { type: 'none' },
      messages
    })
  })

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    throw new AnthropicError(response.status, `Anthropic returned ${response.status}: ${detail.slice(0, 500)}`)
  }

  const blocks: ContentBlock[] = []
  const toolJson = new Map<number, string>()
  let stopReason = ''
  let wroteText = false
  for await (const { event, data } of readSse(response.body)) {
    const payload = JSON.parse(data)
    if (event === 'content_block_start') {
      const block = payload.content_block as ContentBlock
      blocks[payload.index] = block.type === 'text' ? { type: 'text', text: '' } : { ...block }
      // Text written before a search is a preamble ("Let me look that up"): drop it.
      if (block.type === 'tool_use' && wroteText) {
        send({ type: 'discard' })
        wroteText = false
      }
    } else if (event === 'content_block_delta' && payload.delta?.type === 'text_delta') {
      const block = blocks[payload.index]
      if (block) block.text = (block.text ?? '') + payload.delta.text
      send({ type: 'delta', text: payload.delta.text })
      wroteText = true
    } else if (event === 'content_block_delta' && payload.delta?.type === 'input_json_delta') {
      toolJson.set(payload.index, (toolJson.get(payload.index) ?? '') + payload.delta.partial_json)
    } else if (event === 'message_delta' && payload.delta?.stop_reason) {
      stopReason = payload.delta.stop_reason
    } else if (event === 'error') {
      const status = payload.error?.type === 'overloaded_error' ? 529 : 500
      throw new AnthropicError(status, `Anthropic stream error: ${data.slice(0, 500)}`)
    }
  }

  for (const [index, raw] of toolJson) {
    const block = blocks[index]
    if (!block) continue
    try {
      block.input = raw ? JSON.parse(raw) : {}
    } catch {
      block.input = {}
    }
  }
  // A tool round's text was discarded above; leave empty text blocks out of the history.
  return { blocks: blocks.filter(block => block && !(block.type === 'text' && !block.text)), stopReason }
}

/** A canned answer, streamed a few words at a time, so the widget can be tested without a key. */
async function streamMock(
  turns: ChatTurn[],
  sources: { title: string, url: string }[],
  send: (event: ChatEvent) => void
): Promise<void> {
  const question = turns[turns.length - 1]!.content
  const links = sources.slice(0, 2).map(source => `[${source.title}](${source.url})`)
  const answer = [
    `**Mock answer** (no model was called). You asked: "${question.slice(0, 120)}".`,
    '',
    'Think of a layout as a picture frame with labelled slots: editors swap the pictures without touching the frame. '
    + (links.length ? `The closest pages I found are ${links.join(' and ')}.` : 'I found no page that covers this.'),
    '',
    'A made-up link that should be shown as plain text: [Invented › Page](/not-a-real-page).'
  ].join('\n')

  for (const piece of answer.match(/\S+\s*/g) ?? []) {
    send({ type: 'delta', text: piece })
    await new Promise(resolve => setTimeout(resolve, 25))
  }
}
