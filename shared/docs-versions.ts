/**
 * The documentation versions ("channels"). This file is the single source: nuxt.config.ts,
 * the app (version switcher, notices, canonical URLs) and the server routes (sitemap,
 * robots.txt, llms.txt, /api/docs-version.json) all read it. See VERSIONS.md.
 *
 * Every version is served from cwa.rocks, and the path says which one: the current release
 * line at the root (`/getting-started/...`), edge under `/edge/...`, older release lines
 * under `/2.0/...`. Each channel is one git branch, built on its own with its prefix as
 * `app.baseURL`. The current release's build sends the other prefixes on to the other
 * builds (Vercel rewrites, nuxt.config.ts).
 *
 * A build documents one channel: NUXT_PUBLIC_DOCS_CHANNEL names it, otherwise the branch
 * Vercel builds (VERCEL_GIT_COMMIT_REF) is matched against `branch`, otherwise it's edge.
 *
 * Keep this list the same on every live branch: change it on `main` and carry the change
 * to the others. Older versions also read the list from the current one at run time, so a
 * version cut after them still appears in their switcher.
 */

export type DocsChannelKind = 'edge' | 'release'

export interface DocsChannel {
  /** Stable id, also the path prefix when the channel isn't current: `edge`, `2.0`, `2.1`... */
  id: string
  kind: DocsChannelKind
  /** Shown in the switcher. Change it (not the id) as a line moves from alpha to beta to 2.0.0. */
  label: string
  /** The docs git branch the channel is built from: `main` for edge, the line (`2.0`) otherwise. */
  branch: string
  /**
   * A public URL of this channel's own deployment, without a trailing slash. The current
   * release's build rewrites `/<id>/...` to it. Not needed for the current release line.
   */
  origin?: string
  /** False until a deployment exists. Channels that aren't live are left out everywhere. */
  live: boolean
  /** What the channel documents. */
  sources: {
    template: string
    bundle: string
    module: string
  }
}

/** The site's origin. Every version is served here. */
export const SITE_ORIGIN = 'https://cwa.rocks'

export const DOCS_CHANNELS: DocsChannel[] = [
  {
    id: 'edge',
    kind: 'edge',
    label: 'Edge',
    branch: 'main',
    // The edge Vercel project's production URL (VERSIONS.md › What Vercel needs)
    origin: 'https://cwa-docs-edge.vercel.app',
    live: true,
    sources: {
      template: 'main',
      bundle: 'main',
      module: 'dev'
    }
  },
  {
    id: '2.0',
    kind: 'release',
    label: '2.0.0-alpha.45',
    branch: '2.0',
    // Set to true once the `2.0` branch is deployed as the site (VERSIONS.md › Turning on the 2.0 line).
    live: false,
    sources: {
      template: '2.0.0-alpha.45',
      bundle: '2.0.0-alpha.34',
      module: '2.0.0-alpha.25'
    }
  }
]

export const DEFAULT_CHANNEL_ID = 'edge'

export function findChannel(id: string | undefined | null, channels: DocsChannel[] = DOCS_CHANNELS): DocsChannel | undefined {
  return channels.find(channel => channel.id === id)
}

function compareLines(a: string, b: string) {
  const [aMajor = 0, aMinor = 0] = a.split('.').map(Number)
  const [bMajor = 0, bMinor = 0] = b.split('.').map(Number)
  return aMajor - bMajor || aMinor - bMinor
}

/**
 * The current version: the newest live release line, or edge while there's none. It's
 * served at the root of cwa.rocks and it's the only version search engines index.
 */
export function currentChannel(channels: DocsChannel[] = DOCS_CHANNELS): DocsChannel {
  const releases = channels.filter(channel => channel.kind === 'release' && channel.live)
  releases.sort((a, b) => compareLines(b.id, a.id))
  return releases[0] ?? channels.find(channel => channel.kind === 'edge')!
}

/** The path prefix a channel is served under: '' for the current version, `/<id>` otherwise. */
export function channelPrefix(channel: DocsChannel, channels: DocsChannel[] = DOCS_CHANNELS): string {
  return currentChannel(channels).id === channel.id ? '' : `/${channel.id}`
}

/** Channels to offer in the switcher: edge, then release lines newest first. */
export function liveChannels(channels: DocsChannel[] = DOCS_CHANNELS): DocsChannel[] {
  return channels
    .filter(channel => channel.live)
    .sort((a, b) => a.kind === b.kind ? compareLines(b.id, a.id) : (a.kind === 'edge' ? -1 : 1))
}

/**
 * Which channel a build documents. An explicit id wins and must exist; then the git branch;
 * then edge. Used by nuxt.config.ts at build time.
 */
export function resolveChannelId(explicit?: string, gitBranch?: string): string {
  if (explicit) {
    if (!findChannel(explicit)) {
      throw new Error(`NUXT_PUBLIC_DOCS_CHANNEL="${explicit}" isn't a channel in shared/docs-versions.ts (${DOCS_CHANNELS.map(c => c.id).join(', ')})`)
    }
    return explicit
  }
  return DOCS_CHANNELS.find(channel => channel.branch === gitBranch)?.id ?? DEFAULT_CHANNEL_ID
}

/**
 * Vercel routes the current version's build adds: each other live version's prefix is sent
 * on to that version's own deployment, which is built with the prefix as its base URL.
 */
export function versionRewrites(channelId: string, channels: DocsChannel[] = DOCS_CHANNELS) {
  if (currentChannel(channels).id !== channelId) {
    return []
  }
  return channels
    .filter(channel => channel.live && channel.id !== channelId)
    .map((channel) => {
      if (!channel.origin) {
        throw new Error(`Channel "${channel.id}" is live but has no origin in shared/docs-versions.ts, so /${channel.id}/ can't be served`)
      }
      const prefix = channelPrefix(channel, channels).replace(/\./g, '\\.')
      return { src: `^${prefix}(/.*)?$`, dest: `${channel.origin.replace(/\/+$/, '')}${channelPrefix(channel, channels)}$1` }
    })
}
