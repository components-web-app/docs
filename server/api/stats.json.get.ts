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
  if (!process.env.NUXT_GITHUB_TOKEN) {
    return []
  }

  const octokit = new Octokit({ auth: process.env.NUXT_GITHUB_TOKEN })
  const owner = 'components-web-app'
  const repos = ['components-web-app', 'api-components-bundle', 'cwa-nuxt-module', 'docs']
  const allContributors: Contributors = {}

  const getContributors = async (repo: string) => {
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    const repoContributors = contributors
      .filter(contributor => contributor.login)
      .filter(contributor => contributor.type === 'User')
      .filter(contributor => !isUserABot(contributor))

    for (const repoContributor of repoContributors) {
      const username = repoContributor.login || 'unknown'
      if (!allContributors[username]) {
        allContributors[username] = {
          username,
          link: repoContributor.html_url,
          image: repoContributor.avatar_url,
          contributions: repoContributor.contributions
        }
      } else {
        allContributors[username].contributions += repoContributor.contributions
      }
    }
  }

  for (const repo of repos) {
    await getContributors(repo)
  }

  return allContributors
}, {
  maxAge: 60 * 60
})
