export type CwaReleasePart = 'bundle' | 'module' | 'template'

export type CwaRelease = {
  part: CwaReleasePart
  tag: string
  name: string
  publishedAt: string
  url: string
  body: string
}

export const CWA_RELEASE_REPOS: { part: CwaReleasePart, repo: string, label: string }[] = [
  { part: 'bundle', repo: 'api-components-bundle', label: 'API bundle' },
  { part: 'module', repo: 'cwa-nuxt-module', label: 'Nuxt module' },
  { part: 'template', repo: 'components-web-app', label: 'Template' }
]

type GitHubRelease = {
  tag_name: string
  name: string | null
  published_at: string | null
  html_url: string
  body: string | null
  draft: boolean
}

/** Every published release of the three repositories, newest first. Throws if any request fails. */
export async function fetchCwaReleases(token?: string): Promise<CwaRelease[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const lists = await Promise.all(CWA_RELEASE_REPOS.map(async ({ part, repo }) => {
    const releases = await $fetch<GitHubRelease[]>(`https://api.github.com/repos/components-web-app/${repo}/releases?per_page=100`, { headers })
    return releases
      .filter(release => !release.draft && release.published_at)
      .map(release => ({
        part,
        tag: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: release.published_at as string,
        url: release.html_url,
        body: release.body || ''
      }))
  }))
  return lists.flat().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
