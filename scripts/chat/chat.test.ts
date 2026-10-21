/**
 * Tests for the chat assistant's retrieval and endpoint (docs #1).
 *
 *   pnpm test:chat
 *
 * The retrieval questions run against the real corpus, so they need it built first:
 * `pnpm generate` writes .output/public/api/chat-index.json, or point CHAT_INDEX at a
 * copy (e.g. one saved from `nuxt dev`'s /api/chat-index.json). Without it they're skipped.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createRetriever, sourcesOf, sourceTitle, stem, tokenize } from '../../shared/chat/retrieval.ts'
import { CHAT_LIMITS, handleChatRequest, rateLimited, resetRateLimits, retrievalQuery, turnstilePassed, validateTurns } from '../../shared/chat/handler.ts'
import type { ChatChunk, ChatEvent, ChatIndex } from '../../shared/chat/types.ts'

const indexPath = process.env.CHAT_INDEX || new URL('../../.output/public/api/chat-index.json', import.meta.url).pathname
const index: ChatIndex | undefined = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : undefined

describe('tokenize', () => {
  it('splits identifiers and keeps them whole', () => {
    assert.deepEqual(tokenize('useCwaComponent'), ['usecwacomponent', 'component'])
  })
  it('drops stopwords and stems plurals and -ing', () => {
    assert.deepEqual(tokenize('How do I purge the cached pages?'), ['purg', 'cach', 'page'])
    assert.equal(stem('caching'), stem('cache'))
    assert.equal(stem('components'), 'component')
    assert.equal(stem('installed'), stem('install'))
  })
})

describe('createRetriever', () => {
  const chunks: ChatChunk[] = [
    { page: 'Page Caching', section: 'Purging One Page', url: '/nuxt-module/page-caching#purging-one-page', text: 'Purge a single page from the cache.' },
    { page: 'Page Caching', section: '', url: '/nuxt-module/page-caching', text: 'Rendered pages are cached by Caddy.' },
    { page: 'Installation', section: '', url: '/getting-started/installation', text: 'Run create-cwa to start a project.' }
  ]
  const retriever = createRetriever(chunks)

  it('ranks heading matches first and skips unrelated pages', () => {
    const results = retriever.search('how do I purge one page')
    assert.equal(results[0]!.url, '/nuxt-module/page-caching#purging-one-page')
    assert.ok(!results.some(chunk => chunk.url === '/getting-started/installation'))
  })
  it('caps passages per page', () => {
    assert.equal(retriever.search('page cache', { perPage: 1 }).length, 1)
  })
  it('returns nothing for a question with no known words', () => {
    assert.deepEqual(retriever.search('zzzz qqqq'), [])
  })
  it('names sources Page › Section', () => {
    assert.equal(sourceTitle(chunks[0]!), 'Page Caching › Purging One Page')
    assert.equal(sourceTitle(chunks[1]!), 'Page Caching')
    assert.equal(sourcesOf([chunks[0]!, chunks[0]!]).length, 1)
  })
})

describe('retrieval over the docs', { skip: index ? false : `no index at ${indexPath}` }, () => {
  const retriever = createRetriever(index?.chunks ?? [])

  /** Each question must find a passage from the expected page among the first few. */
  const cases: [question: string, expectedPath: string, within: number][] = [
    ['How do I install CWA and create a new project?', '/getting-started/installation', 3],
    ['What is a component group?', '/core-concepts/', 5],
    ['How do I make a page that lists blog articles from one template?', 'dynamic-page', 3],
    ['How do I seed data with fixtures?', '/api/data-fixtures/', 3],
    ['How do I upload images on a component?', '/api/components/annotations/uploadable', 5],
    ['How does real-time updating work with Mercure?', 'real-time', 3],
    ['Should I put Cloudflare in front of my site?', '/deployment/cloudflare', 3],
    ['How do I draft changes and publish them later?', 'publish', 5],
    ['What does useCwaComponent return?', '/nuxt-module/composables/component/use-cwa-component', 3],
    ['Is CWA a good fit for a small business website?', '/built-for-business', 6]
  ]

  for (const [question, expected, within] of cases) {
    it(`"${question}" finds ${expected}`, () => {
      const results = retriever.search(question).slice(0, within)
      assert.ok(
        results.some(chunk => chunk.url.includes(expected)),
        `top ${within}: ${results.map(chunk => chunk.url).join(', ')}`
      )
    })
  }

  it('keeps the retrieved context to about 8k tokens', () => {
    const results = retriever.search('How do I deploy to Kubernetes with caching, Cloudflare and backups?', { maxChars: CHAT_LIMITS.contextChars })
    const chars = results.reduce((total, chunk) => total + chunk.text.length, 0)
    assert.ok(chars <= CHAT_LIMITS.contextChars, `${chars} characters`)
    assert.ok(results.length > 3)
  })
})

describe('validateTurns', () => {
  it('accepts alternating turns ending in a question', () => {
    assert.ok(validateTurns({ messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }] }).ok)
  })
  it('refuses long questions, bad order and long conversations', () => {
    const long = validateTurns({ messages: [{ role: 'user', content: 'x'.repeat(CHAT_LIMITS.questionChars + 1) }] })
    assert.equal(long.ok ? 0 : long.status, 413)
    assert.equal(validateTurns({ messages: [{ role: 'assistant', content: 'a' }] }).ok, false)
    assert.equal(validateTurns({ messages: [] }).ok, false)
    const turns = Array.from({ length: CHAT_LIMITS.questions * 2 + 1 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'q' }))
    const tooMany = validateTurns({ messages: turns })
    assert.equal(tooMany.ok ? 0 : tooMany.status, 429)
  })
  it('uses the previous question for follow-ups', () => {
    const query = retrievalQuery([{ role: 'user', content: 'Mercure' }, { role: 'assistant', content: 'x' }, { role: 'user', content: 'and testing?' }])
    assert.match(query, /Mercure/)
  })
})

describe('rateLimited', () => {
  it('allows a burst, then refuses until the minute passes', () => {
    resetRateLimits()
    const now = Date.now()
    for (let i = 0; i < CHAT_LIMITS.perMinute; i++) assert.equal(rateLimited('1.2.3.4', now), false)
    assert.equal(rateLimited('1.2.3.4', now), true)
    assert.equal(rateLimited('5.6.7.8', now), false)
    assert.equal(rateLimited('1.2.3.4', now + 61_000), false)
    resetRateLimits()
  })
})

describe('handleChatRequest', () => {
  let server: ReturnType<typeof createServer>
  let indexUrl = ''
  const testIndex: ChatIndex = {
    generatedAt: '',
    chunks: [{ page: 'Page Caching', section: 'Purging One Page', url: '/nuxt-module/page-caching#purging-one-page', text: 'Purge a single page from the cache.' }]
  }

  before(async () => {
    server = createServer((_, response) => {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(testIndex))
    })
    await new Promise<void>(resolve => server.listen(0, resolve))
    indexUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
  })
  after(() => server.close())

  const post = (body: unknown, headers: Record<string, string> = {}) => new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-real-ip': `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers },
    body: JSON.stringify(body)
  })

  it('says whether chat is available', async () => {
    assert.deepEqual(await (await handleChatRequest(new Request('http://localhost/api/chat'), {})).json(), { available: false })
    assert.deepEqual(await (await handleChatRequest(new Request('http://localhost/api/chat'), { mock: true })).json(), { available: true })
  })

  it('is unavailable without a key', async () => {
    const response = await handleChatRequest(post({ messages: [{ role: 'user', content: 'hi' }] }), { indexUrl })
    assert.equal(response.status, 503)
  })

  it('refuses other origins', async () => {
    const response = await handleChatRequest(post({ messages: [{ role: 'user', content: 'hi' }] }, { Origin: 'https://evil.example' }), { mock: true, indexUrl })
    assert.equal(response.status, 403)
  })

  it('streams sources, then the answer, in mock mode', async () => {
    const response = await handleChatRequest(post({ messages: [{ role: 'user', content: 'How do I purge one page?' }] }), { mock: true, indexUrl })
    assert.equal(response.status, 200)
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line) as ChatEvent)
    assert.deepEqual(events[0], { type: 'sources', sources: [{ title: 'Page Caching › Purging One Page', url: '/nuxt-module/page-caching#purging-one-page' }] })
    const answer = events.filter(event => event.type === 'delta').map(event => event.text).join('')
    assert.match(answer, /\[Page Caching › Purging One Page\]\(\/nuxt-module\/page-caching#purging-one-page\)/)
    assert.deepEqual(events[events.length - 1], { type: 'done' })
  })
})

describe('Turnstile', () => {
  let server: ReturnType<typeof createServer>
  let verifyUrl = ''
  const seen: URLSearchParams[] = []

  before(async () => {
    server = createServer((request, response) => {
      let raw = ''
      request.on('data', (chunk) => {
        raw += chunk
      })
      request.on('end', () => {
        const form = new URLSearchParams(raw)
        seen.push(form)
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(form.get('response') === 'good' ? { success: true } : { 'success': false, 'error-codes': ['invalid-input-response'] }))
      })
    })
    await new Promise<void>(resolve => server.listen(0, resolve))
    verifyUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
  })
  after(() => server.close())

  it('lets every question through when no secret is set', async () => {
    assert.equal(await turnstilePassed(undefined, '10.0.0.1', {}), true)
  })

  it('refuses a missing token without asking Cloudflare', async () => {
    const before = seen.length
    assert.equal(await turnstilePassed(undefined, '10.0.0.1', { turnstileSecret: 's', turnstileVerifyUrl: verifyUrl }), false)
    assert.equal(seen.length, before)
  })

  it('sends the secret, token and IP, and follows the answer', async () => {
    const env = { turnstileSecret: 'secret', turnstileVerifyUrl: verifyUrl }
    assert.equal(await turnstilePassed('good', '10.0.0.9', env), true)
    assert.deepEqual(Object.fromEntries(seen[seen.length - 1]!), { secret: 'secret', response: 'good', remoteip: '10.0.0.9' })
    assert.equal(await turnstilePassed('bad', '10.0.0.9', env), false)
  })

  it('answers 403 before retrieval when the token fails', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': '10.0.1.1' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], turnstileToken: 'bad' })
    })
    const response = await handleChatRequest(request, { mock: true, turnstileSecret: 's', turnstileVerifyUrl: verifyUrl, indexUrl: 'http://127.0.0.1:9/unreachable' })
    assert.equal(response.status, 403)
  })
})

describe('handleChatRequest with Claude', () => {
  let indexServer: ReturnType<typeof createServer>
  let claude: ReturnType<typeof createServer>
  let indexUrl = ''
  let apiUrl = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the request body as the fake API received it
  let received: { headers: Record<string, unknown>, body: any } | undefined
  let reply: (response: import('node:http').ServerResponse) => void

  const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

  before(async () => {
    indexServer = createServer((_, response) => response.end(JSON.stringify({
      generatedAt: '',
      chunks: [{ page: 'Page Caching', section: 'Purging One Page', url: '/nuxt-module/page-caching#purging-one-page', text: 'Purge a single page from the cache.' }]
    })))
    claude = createServer((request, response) => {
      let raw = ''
      request.on('data', part => raw += part)
      request.on('end', () => {
        received = { headers: request.headers, body: JSON.parse(raw) }
        reply(response)
      })
    })
    await new Promise<void>(resolve => indexServer.listen(0, resolve))
    await new Promise<void>(resolve => claude.listen(0, resolve))
    indexUrl = `http://127.0.0.1:${(indexServer.address() as AddressInfo).port}/`
    apiUrl = `http://127.0.0.1:${(claude.address() as AddressInfo).port}/v1/messages`
  })
  after(() => {
    indexServer.close()
    claude.close()
  })

  const ask = (messages: unknown[]) => handleChatRequest(new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-real-ip': `10.1.0.${Math.floor(Math.random() * 250)}` },
    body: JSON.stringify({ messages })
  }), { apiKey: 'test-key', apiUrl, indexUrl })

  const events = async (response: Response) => (await response.text()).trim().split('\n').map(line => JSON.parse(line) as ChatEvent)

  it('sends the question with the docs to Haiku and streams the text back', async () => {
    reply = (response) => {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      response.write(sse('message_start', { type: 'message_start', message: {} }))
      response.write(sse('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }))
      // Split one event across two writes, as a network might.
      const delta = sse('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'See [Page Caching › Purging One Page]' } })
      response.write(delta.slice(0, 30))
      response.write(delta.slice(30))
      response.write(sse('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '(/nuxt-module/page-caching#purging-one-page).' } }))
      response.write(sse('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn' } }))
      response.end(sse('message_stop', { type: 'message_stop' }))
    }
    const result = await events(await ask([
      { role: 'user', content: 'What is caching?' },
      { role: 'assistant', content: 'An earlier answer.' },
      { role: 'user', content: 'How do I purge one page?' }
    ]))

    assert.equal(received!.headers['x-api-key'], 'test-key')
    assert.equal(received!.body.model, 'claude-haiku-5-5')
    assert.equal(received!.body.stream, true)
    assert.equal(received!.body.messages.length, 3)
    assert.match(received!.body.messages[2].content, /<docs>[\s\S]*Purging One Page[\s\S]*<\/docs>\s+How do I purge one page\?$/)
    assert.equal(received!.body.messages[0].content, 'What is caching?')
    assert.match(received!.body.system, /Never compare CWA to WordPress/)

    const text = result.filter(event => event.type === 'delta').map(event => event.text).join('')
    assert.equal(text, 'See [Page Caching › Purging One Page](/nuxt-module/page-caching#purging-one-page).')
    assert.deepEqual(result[result.length - 1], { type: 'done' })
  })

  it('lets Haiku search the docs, then streams its answer', async () => {
    const bodies: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any -- request bodies as received
    reply = (response) => {
      bodies.push(received!.body)
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      if (bodies.length === 1) {
        response.write(sse('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }))
        response.write(sse('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Let me look.' } }))
        response.write(sse('content_block_start', { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', id: 'toolu_1', name: 'search_docs', input: {} } }))
        response.write(sse('content_block_delta', { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '{"query": "cache ' } }))
        response.write(sse('content_block_delta', { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: 'purge"}' } }))
        response.write(sse('message_delta', { type: 'message_delta', delta: { stop_reason: 'tool_use' } }))
      } else {
        response.write(sse('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }))
        response.write(sse('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Purge it.' } }))
        response.write(sse('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn' } }))
      }
      response.end(sse('message_stop', { type: 'message_stop' }))
    }
    const result = await events(await ask([{ role: 'user', content: 'zzz unrelated words' }]))

    assert.equal(bodies.length, 2)
    assert.equal(bodies[0].tools[0].name, 'search_docs')
    assert.deepEqual(bodies[0].tool_choice, { type: 'auto' })
    const toolUse = bodies[1].messages[1].content.find((block: { type: string }) => block.type === 'tool_use')
    assert.deepEqual(toolUse.input, { query: 'cache purge' })
    const toolResult = bodies[1].messages[2].content[0]
    assert.equal(toolResult.tool_use_id, 'toolu_1')
    assert.match(toolResult.content, /Purging One Page/)

    const types = result.map(event => event.type)
    assert.ok(types.indexOf('discard') > types.indexOf('delta'), 'the preamble is discarded')
    assert.deepEqual(result.find(event => event.type === 'searching'), { type: 'searching', query: 'cache purge' })
    const afterDiscard = result.slice(types.indexOf('discard')).filter(event => event.type === 'delta').map(event => event.text).join('')
    assert.equal(afterDiscard, 'Purge it.')
    assert.deepEqual(result[result.length - 1], { type: 'done' })
  })

  it('turns an Anthropic error into a friendly message', async () => {
    reply = (response) => {
      response.writeHead(529, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }))
    }
    const result = await events(await ask([{ role: 'user', content: 'How do I purge one page?' }]))
    const last = result[result.length - 1]!
    assert.equal(last.type, 'error')
    assert.match(last.type === 'error' ? last.message : '', /busy/)
  })
})
