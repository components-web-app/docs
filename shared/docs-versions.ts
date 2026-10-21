/**
 * The documentation versions ("channels"). This file is the single source: nuxt.config.ts,
 * the app (version switcher, notices, canonical URLs) and the server routes (sitemap,
 * robots.txt, llms.txt, /api/docs-version.json) all read it. See VERSIONS.md.
 *
 * Each channel is one git branch of this repo, deployed on its own. A build documents one
 * channel: NUXT_PUBLIC_DOCS_CHANNEL names it, otherwise the branch Vercel builds
 * (VERCEL_GIT_COMMIT_REF) is matched against `branch`, otherwise it's edge.
 *
 * Keep this list the same on every live branch: change it on `main` and carry the change to
 * the others. Older branches also read the list from the primary site at run time, so a
 * version cut after them still appears in their switcher.
 */

export type DocsChannelKind = 'edge' | 'latest' | 'archive'

export interface DocsChannel {
  /** Stable id, used in NUXT_PUBLIC_DOCS_CHANNEL: `edge`, `latest`, later `2.0`, `2.1`... */
  id: string
  kind: DocsChannelKind
  /** Shown in the switcher. Change it (not the id) when latest moves to a beta or to 2.0.0. */
  label: string
  /** The docs git branch the channel is built from. */
  branch: string
  /** Where the channel is deployed once it isn't the primary site (no trailing slash). */
  url: string
  /** False until a deployment exists. Channels that aren't live are left out of the switcher. */
  live: boolean
  /** What the channel documents. */
  sources: {
    template: string
    bundle: string
    module: string
  }
}

/** The production origin. The primary channel is served here. */
export const PRIMARY_ORIGIN = 'https://cwa.rocks'

export const DOCS_CHANNELS: DocsChannel[] = [
  {
    id: 'latest',
    kind: 'latest',
    label: '2.0.0-alpha.45',
    branch: 'latest',
    url: PRIMARY_ORIGIN,
    // Set to true once the `latest` branch is deployed to cwa.rocks (VERSIONS.md › Turning latest on).
    live: false,
    sources: {
      template: '2.0.0-alpha.45',
      bundle: '2.0.0-alpha.34',
      module: '2.0.0-alpha.25'
    }
  },
  {
    id: 'edge',
    kind: 'edge',
    label: 'Edge',
    branch: 'main',
    url: 'https://edge.cwa.rocks',
    live: true,
    sources: {
      template: 'main',
      bundle: 'main',
      module: 'dev'
    }
  }
]

export const DEFAULT_CHANNEL_ID = 'edge'

export function findChannel(id: string | undefined | null): DocsChannel | undefined {
  return DOCS_CHANNELS.find(channel => channel.id === id)
}

/**
 * The channel served at PRIMARY_ORIGIN and indexed by search engines: latest once it's
 * live, edge until then (so production keeps today's behaviour).
 */
export function primaryChannel(channels: DocsChannel[] = DOCS_CHANNELS): DocsChannel {
  return channels.find(channel => channel.kind === 'latest' && channel.live)
    ?? channels.find(channel => channel.kind === 'edge')!
}

/** The origin a channel is served from, without a trailing slash. */
export function channelOrigin(channel: DocsChannel, channels: DocsChannel[] = DOCS_CHANNELS): string {
  return primaryChannel(channels).id === channel.id ? PRIMARY_ORIGIN : channel.url.replace(/\/+$/, '')
}

/** Channels to offer in the switcher, newest first: edge, latest, then older versions. */
export function liveChannels(channels: DocsChannel[] = DOCS_CHANNELS): DocsChannel[] {
  const order: Record<DocsChannelKind, number> = { edge: 0, latest: 1, archive: 2 }
  return channels
    .filter(channel => channel.live)
    .sort((a, b) => order[a.kind] - order[b.kind])
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
