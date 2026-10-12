// GitHub releases of the three CWA packages, newest first, for the Releases page.
// Prerendered at build time; the page refreshes the list from GitHub in the browser,
// so a new release appears without a docs deploy.
import { fetchCwaReleases } from '../../app/utils/releases'

export default defineEventHandler(async () => {
  const token = process.env.NUXT_GITHUB_TOKEN
  try {
    return await fetchCwaReleases(token)
  } catch {
    // A bad or expired token gets a 401: try again without one (public data, lower rate limit).
    if (token) {
      try {
        return await fetchCwaReleases()
      } catch {
        // fall through
      }
    }
    return []
  }
})
