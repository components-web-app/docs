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

export default cachedEventHandler(async () => {
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
      p1pchenk0: {
        username: 'p1pchenk0',
        link: 'https://github.com/p1pchenk0',
        image: 'https://avatars.githubusercontent.com/u/7996276?v=4',
        contributions: 2
      }
    },
    stargazers: 0
  }

  if (!process.env.NUXT_GITHUB_TOKEN) {
    return allStats
  }

  const octokit = new Octokit({ auth: process.env.NUXT_GITHUB_TOKEN })
  const owner = 'components-web-app'
  const repos = ['components-web-app', 'api-components-bundle', 'cwa-nuxt-module', 'docs']

  const getContributors = async (repo: string) => {
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo
    })

    const repoContributors = contributors
      .filter(contributor => contributor.login)
      .filter(contributor => contributor.type === 'User')
      .filter(contributor => !isUserABot(contributor))

    for (const repoContributor of repoContributors) {
      const username = repoContributor.login || 'unknown'
      if (!allStats.contributors[username]) {
        allStats.contributors[username] = {
          username,
          link: repoContributor.html_url,
          image: repoContributor.avatar_url,
          contributions: repoContributor.contributions
        }
      } else {
        allStats.contributors[username].contributions += repoContributor.contributions
      }
    }
  }

  const getStargazers = async (repo: string) => {
    const { data: stargazers } = await octokit.rest.activity.listStargazersForRepo({
      owner,
      repo
    })
    allStats.stargazers += stargazers.length
  }

  const promises: Promise<void>[] = []
  for (const repo of repos) {
    promises.push(getContributors(repo))
    promises.push(getStargazers(repo))
  }
  await Promise.all(promises)

  return allStats
}, {
  maxAge: 60 * 60
})
