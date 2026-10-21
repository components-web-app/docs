import { sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  // Shows the VIP sign-up on the site for a day after a /vip link
  setCookie(event, 'vip', 'true', {
    maxAge: 24 * 3600 - 1
  })
  // Redirect on the server. Uses a 302 (not 307) by default.
  return sendRedirect(event, '/', 307)
})
