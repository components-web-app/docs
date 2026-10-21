export const config = { runtime: 'edge' }

// The deployed sign-up. server/api/subscribe.post.ts is the same for `pnpm dev`: keep the two in step.
const LIST_ID = '327773dd8a410771ee31db166e8b0f50'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 200

/**
 * At most 5 sign-ups per IP address in 10 minutes. The count is kept in this edge instance's
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

function error(status: number, statusMessage: string): Response {
  return new Response(JSON.stringify({ statusCode: status, statusMessage }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return error(405, 'Method Not Allowed')
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return error(429, 'Too many sign-ups from your connection. Please try again in a few minutes.')
  }

  const body = await request.json().catch(() => null) as { emailAddress?: unknown, consentToTrack?: unknown } | null
  const emailAddress = typeof body?.emailAddress === 'string' ? body.emailAddress.trim() : ''
  if (!emailAddress || emailAddress.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(emailAddress)) {
    return error(400, 'Please enter a valid email address.')
  }

  const apiKey = process.env.NUXT_CAMPAIGN_MONITOR_API_KEY ?? ''
  const response = await fetch(`https://api.createsend.com/api/v3.3/subscribers/${LIST_ID}.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(apiKey),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      EmailAddress: emailAddress,
      Resubscribe: true,
      // Campaign Monitor records opens and clicks only for subscribers who agreed to it
      ConsentToTrack: body?.consentToTrack === true ? 'Yes' : 'No'
    })
  }).catch(() => null)

  if (!response?.ok) {
    const data = await response?.json().catch(() => null) as { Code?: number } | null
    console.error('Campaign Monitor sign-up failed', response?.status, data?.Code)
    // Campaign Monitor's code 1 is an invalid email address; anything else is on our side
    if (data?.Code === 1) {
      return error(400, 'Please enter a valid email address.')
    }
    return error(502, 'We couldn\'t sign you up just now. Please try again later.')
  }

  return new Response(JSON.stringify({ subscribed: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
