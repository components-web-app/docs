/**
 * The docs chat assistant's conversation (docs #1). It lives in the tab only: nothing
 * is saved, and each question sends the conversation so far to /api/chat, which
 * streams the answer back as NDJSON (shared/chat/types.ts › ChatEvent).
 */
import type { ChatEvent, ChatSource, ChatTurn } from '#shared/chat/types'

export const CHAT_QUESTION_MAX = 1000
export const CHAT_QUESTIONS_PER_CONVERSATION = 8

export interface DocsChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  /** Set when the answer failed or was refused; shown instead of (or after) the text. */
  error?: string
  /** The limit was hit, so the widget offers the docs search instead. */
  limited?: boolean
  /** What the assistant is searching the docs for, while it does. */
  searching?: string
}

export type DocsChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

let controller: AbortController | undefined

export function useDocsChat() {
  const open = useState('docs-chat-open', () => false)
  const messages = useState<DocsChatMessage[]>('docs-chat-messages', () => [])
  const status = useState<DocsChatStatus>('docs-chat-status', () => 'ready')
  const unavailable = useState('docs-chat-unavailable', () => false)

  const questionsAsked = computed(() => messages.value.filter(message => message.role === 'user').length)
  const atLimit = computed(() => questionsAsked.value >= CHAT_QUESTIONS_PER_CONVERSATION)
  const busy = computed(() => status.value === 'submitted' || status.value === 'streaming')

  function reset() {
    stop()
    messages.value = []
    status.value = 'ready'
  }

  function stop() {
    controller?.abort()
    controller = undefined
  }

  /** `getToken` gives a Turnstile token for this question (useTurnstile), when the site uses one. */
  async function ask(question: string, getToken?: () => Promise<string | undefined>) {
    const text = question.trim().slice(0, CHAT_QUESTION_MAX)
    if (!text || busy.value || atLimit.value) return

    // Earlier answers that failed are left out of the history the model sees.
    const history: ChatTurn[] = []
    for (const message of messages.value) {
      if (message.role === 'user') history.push({ role: 'user', content: message.content })
      else if (message.content && !message.error) history.push({ role: 'assistant', content: message.content })
      else history.pop()
    }
    history.push({ role: 'user', content: text })

    messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text })
    const answer = reactive<DocsChatMessage>({ id: crypto.randomUUID(), role: 'assistant', content: '' })
    messages.value.push(answer)
    status.value = 'submitted'
    controller = new AbortController()

    let turnstileToken: string | undefined
    try {
      turnstileToken = await getToken?.()
    } catch {
      answer.error = 'We couldn\'t confirm this question came from a person. Reload the page and try again.'
      status.value = 'error'
      controller = undefined
      return
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, turnstileToken }),
        signal: controller.signal
      })

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        if (response.status === 503) unavailable.value = true
        answer.error = body.error || 'The assistant is not available right now.'
        answer.limited = response.status === 429 || response.status === 503
        status.value = 'error'
        return
      }

      status.value = 'streaming'
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as ChatEvent
          if (event.type === 'sources') answer.sources = event.sources
          else if (event.type === 'delta') {
            answer.searching = undefined
            answer.content += event.text
          } else if (event.type === 'searching') answer.searching = event.query
          else if (event.type === 'discard') answer.content = ''
          else if (event.type === 'error') answer.error = event.message
        }
      }
      status.value = answer.error ? 'error' : 'ready'
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        status.value = 'ready'
        if (!answer.content) answer.error = 'Stopped.'
        return
      }
      answer.error = 'Could not reach the assistant. Check your connection and try again.'
      status.value = 'error'
    } finally {
      controller = undefined
    }
  }

  return { open, messages, status, unavailable, questionsAsked, atLimit, busy, ask, stop, reset }
}

/**
 * Keeps only the links the answer was allowed to use: the pages retrieved for it.
 * Any other Markdown link (a guessed URL, an outside site) is shown as plain text.
 */
export function keepKnownLinks(markdown: string, sources: ChatSource[] = []): string {
  const allowed = new Set(sources.flatMap(source => [source.url, source.url.split('#')[0]]))
  return markdown.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text: string, url: string) =>
    allowed.has(url) ? match : text
  )
}
