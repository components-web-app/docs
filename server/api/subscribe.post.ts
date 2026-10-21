import { $fetch, FetchError } from 'ofetch'
import { createError, getRequestIP, readBody } from 'h3'

// The dev server's sign-up; the deployed site uses api/subscribe.ts (a Vercel edge function): keep the two in step.

const LIST_ID = '327773dd8a410771ee31db166e8b0f50'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 200

/**
 * At most 5 sign-ups per IP address in 10 minutes. The count is kept in this server instance's
 * memory, so it slows down a script hitting one instance; it isn't a limit across every instance.
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const attempts = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (attempts.get(ip) ?? []).filter(time => now - time < WINDOW_MS)
  recent.push(now)
  attempts.set(ip, recent)
  if (attempts.size > 10000) {
    attempts.clear()
  }
  return recent.length > MAX_PER_WINDOW
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (rateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many sign-ups from your connection. Please try again in a few minutes.' })
  }

  const body = await readBody<{ emailAddress?: unknown, consentToTrack?: unknown }>(event)
  const emailAddress = typeof body?.emailAddress === 'string' ? body.emailAddress.trim() : ''
  if (!emailAddress || emailAddress.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(emailAddress)) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address.' })
  }

  const config = useRuntimeConfig()
  const Authorization = 'Basic ' + Buffer.from(config.campaignMonitor.apiKey).toString('base64')

  try {
    await $fetch(`https://api.createsend.com/api/v3.3/subscribers/${LIST_ID}.json`, {
      method: 'POST',
      body: {
        EmailAddress: emailAddress,
        Resubscribe: true,
        // Campaign Monitor records opens and clicks only for subscribers who agreed to it
        ConsentToTrack: body?.consentToTrack === true ? 'Yes' : 'No'
      },
      headers: { Authorization }
    })
  } catch (error) {
    const code = error instanceof FetchError ? error.data?.Code : undefined
    console.error('Campaign Monitor sign-up failed', code ?? (error instanceof Error ? error.message : error))
    // Campaign Monitor's code 1 is an invalid email address; anything else is on our side
    if (code === 1) {
      throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address.' })
    }
    throw createError({ statusCode: 502, statusMessage: 'We couldn\'t sign you up just now. Please try again later.' })
  }

  return { subscribed: true }
})
