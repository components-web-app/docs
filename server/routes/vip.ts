import { sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  // Increase counter cookie by 1
  setCookie(event, 'vip', 'true', {
    maxAge: 30 * 86400
  })
  // Redirect on the server. Uses a 302 (not 307) by default.
  return sendRedirect(event, '/', 307)
})
