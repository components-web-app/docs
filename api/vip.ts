export const config = { runtime: 'edge' }

export default function handler(): Response {
  // Shows the VIP sign-up on the site for a day after a /vip link
  const maxAge = 24 * 3600 - 1

  const headers = new Headers({ Location: '/' })
  headers.append('Set-Cookie', `vip=true; Max-Age=${maxAge}; Path=/; SameSite=Lax`)

  return new Response(null, { status: 307, headers })
}
