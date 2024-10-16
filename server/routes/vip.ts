import { sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const maxAge = 24 * 3600 - 1
  // Increase counter cookie by 1
  setCookie(event, 'vip', 'true', {
    maxAge
  })
  setCookie(event, 'vip-expires', `${maxAge}`, {
    maxAge
  })
  // Redirect on the server. Uses a 302 (not 307) by default.
  return sendRedirect(event, '/', 307)
})
