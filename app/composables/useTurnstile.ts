/**
 * Cloudflare Turnstile for the docs chat (docs #1): one token per question, checked by
 * /api/chat before anything goes to Anthropic. The widget stays invisible unless
 * Cloudflare wants the visitor to click it. Without a site key, `token()` gives undefined.
 */
interface TurnstileOptions {
  'sitekey': string
  'appearance'?: 'always' | 'execute' | 'interaction-only'
  'execution'?: 'render' | 'execute'
  'callback'?: (token: string) => void
  'error-callback'?: () => boolean
  'expired-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  execute: (widgetId: string) => void
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TOKEN_TIMEOUT_MS = 30_000

let scriptPromise: Promise<TurnstileApi> | undefined

function loadScript(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile)
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not load'))
    script.onerror = () => reject(new Error('Turnstile did not load'))
    document.head.appendChild(script)
  }).catch((error) => {
    scriptPromise = undefined
    throw error
  })
  return scriptPromise
}

export function useTurnstile(container: Ref<HTMLElement | undefined>) {
  const siteKey = useRuntimeConfig().public.turnstileSiteKey as string | undefined
  let widgetId: string | undefined
  let pending: { resolve: (token: string) => void, reject: (error: Error) => void } | undefined

  function settle(token?: string) {
    if (!pending) return
    if (token) pending.resolve(token)
    else pending.reject(new Error('Turnstile gave no token'))
    pending = undefined
  }

  /** A fresh token for one question, or undefined when Turnstile isn't configured. */
  async function token(): Promise<string | undefined> {
    if (!siteKey) return undefined
    const turnstile = await loadScript()
    if (!container.value) throw new Error('No Turnstile container')
    settle()
    return await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => settle(), TOKEN_TIMEOUT_MS)
      pending = {
        resolve: (value) => {
          clearTimeout(timer)
          resolve(value)
        },
        reject: (error) => {
          clearTimeout(timer)
          reject(error)
        }
      }
      if (widgetId === undefined) {
        widgetId = turnstile.render(container.value!, {
          'sitekey': siteKey,
          'appearance': 'interaction-only',
          'execution': 'execute',
          'callback': value => settle(value),
          'error-callback': () => {
            settle()
            return true
          },
          'expired-callback': () => {}
        })
      } else {
        turnstile.reset(widgetId)
      }
      turnstile.execute(widgetId)
    })
  }

  // The panel's content is removed when it closes, so the widget goes with it.
  onBeforeUnmount(() => {
    settle()
    if (widgetId !== undefined) window.turnstile?.remove(widgetId)
    widgetId = undefined
  })

  return { enabled: Boolean(siteKey), token }
}
