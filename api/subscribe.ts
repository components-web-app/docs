export const config = { runtime: 'edge' }

const LIST_ID = '327773dd8a410771ee31db166e8b0f50'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const apiKey = process.env.NUXT_CAMPAIGN_MONITOR_API_KEY ?? ''
  const authorization = 'Basic ' + btoa(apiKey)

  const { emailAddress } = await request.json()

  const response = await fetch(`https://api.createsend.com/api/v3.3/subscribers/${LIST_ID}.json`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      EmailAddress: emailAddress,
      Resubscribe: true,
      ConsentToTrack: 'Yes'
    })
  })

  const data = await response.json().catch(() => null)
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  })
}
