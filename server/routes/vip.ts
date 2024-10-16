import { sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const maxAge = 24 * 3600 - 1
  const expiresAt = new Date().getTime() + maxAge * 1000
  // Increase counter cookie by 1
  setCookie(event, 'vip', 'true', {
    maxAge
  })
  setCookie(event, 'vip-expires', `${expiresAt}`, {
    maxAge
  })
  // Redirect on the server. Uses a 302 (not 307) by default.
  return sendRedirect(event, '/', 307)
})
