export const config = { runtime: 'edge' }

export default function handler(): Response {
  const maxAge = 24 * 3600 - 1
  const expiresAt = Date.now() + maxAge * 1000

  const headers = new Headers({ Location: '/' })
  headers.append('Set-Cookie', `vip=true; Max-Age=${maxAge}; Path=/; SameSite=Lax`)
  headers.append('Set-Cookie', `vip-expires=${expiresAt}; Max-Age=${maxAge}; Path=/; SameSite=Lax`)

  return new Response(null, { status: 307, headers })
}
