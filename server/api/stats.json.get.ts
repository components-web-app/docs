import { Octokit } from '@octokit/rest'

function isUserABot(user: null | { login?: string }) {
  return user?.login?.endsWith('-bot') || user?.login?.endsWith('[bot]')
}

export type Contributor = {
  username: string
  image?: string
  link?: string
  contributions: number
}
type Contributors = {
  [username: string]: Contributor
}

// Prerendered once per build (nuxt.config.ts), so there's no runtime cache. A cachedEventHandler served a stale
// fallback from Vercel's restored build cache while the real fetch ran in the background, too late to be written.
export default defineEventHandler(async () => {
  const allStats: {
    contributors: Contributors
    stargazers: number
  } = {
    contributors: {
      lingxiankong: {
        username: 'lingxiankong',
        link: 'https://github.com/lingxiankong',
        image: 'https://avatars.githubusercontent.com/u/4410121?v=4',
        contributions: 5
      },
      darkweak: {
        username: 'darkweak',
        link: 'https://github.com/darkweak',
        image: 'https://avatars.githubusercontent.com/u/25440709?v=4',
        contributions: 3
      },
      p1pchenk0: {
        username: 'p1pchenk0',
        link: 'https://github.com/p1pchenk0',
        image: 'https://avatars.githubusercontent.com/u/7996276?v=4',
        contributions: 2
      }
    },
    stargazers: 0
  }

  const owner = 'components-web-app'
  const repos = ['components-web-app', 'api-components-bundle', 'cwa-nuxt-module', 'docs']

  // Public data, so a token is optional: it only raises GitHub's rate limit (60 requests an hour
  // per IP without one; this makes 8). An expired or invalid token gets a 401, so try again without it.
  const collect = async (octokit: Octokit) => {
    const contributors: Contributors = {}
    let stargazers = 0
    await Promise.all(repos.map(async (repo) => {
      const [{ data: repoData }, repoContributors] = await Promise.all([
        octokit.rest.repos.get({ owner, repo }),
        octokit.paginate(octokit.rest.repos.listContributors, { owner, repo, per_page: 100 })
      ])
      stargazers += repoData.stargazers_count
      for (const contributor of repoContributors) {
        if (!contributor.login || contributor.type !== 'User' || isUserABot(contributor)) {
          continue
        }
        const existing = contributors[contributor.login]
        if (existing) {
          existing.contributions += contributor.contributions
        } else {
          contributors[contributor.login] = {
            username: contributor.login,
            link: contributor.html_url,
            image: contributor.avatar_url,
            contributions: contributor.contributions
          }
        }
      }
    }))
    return { contributors, stargazers }
  }

  const token = process.env.NUXT_GITHUB_TOKEN
  for (const auth of token ? [token, undefined] : [undefined]) {
    try {
      const fetched = await collect(new Octokit({ auth }))
      // Keep the seeded contributors (people whose work isn't in the GitHub history) and add GitHub's counts.
      for (const [username, contributor] of Object.entries(fetched.contributors)) {
        const seeded = allStats.contributors[username]
        allStats.contributors[username] = seeded ? { ...contributor, contributions: contributor.contributions + seeded.contributions } : contributor
      }
      allStats.stargazers = fetched.stargazers
      console.info(`[stats] GitHub stats fetched ${auth ? 'with' : 'without'} a token`)
      break
    } catch (error) {
      // GitHub unavailable, rate limited or the token is invalid: try the next option, else keep the seeded list
      console.warn(`[stats] GitHub stats failed ${auth ? 'with' : 'without'} a token: ${(error as Error).message}`)
    }
  }

  return allStats
})
