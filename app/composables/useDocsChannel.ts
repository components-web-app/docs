import {
  DOCS_CHANNELS,
  DEFAULT_CHANNEL_ID,
  SITE_ORIGIN,
  channelPrefix,
  currentChannel,
  findChannel,
  liveChannels,
  type DocsChannel
} from '#shared/docs-versions'

/** What a version publishes at <prefix>/api/docs-version.json (server/api/docs-version.json.get.ts). */
export interface DocsVersionManifest {
  channel: string
  channels: DocsChannel[]
  paths: string[]
}

// Same-origin paths that already include a version's prefix: don't add this build's base URL
const fetchRaw = <T>(url: string) => $fetch<T>(url, { baseURL: '/', timeout: 3000 })

/**
 * The documentation version this build documents, and the others. Every version is on the
 * same origin under its own path prefix. The channel list starts as the one built in; on a
 * version that isn't current it's refreshed from the current one, so an older version
 * learns about versions cut after it.
 */
export function useDocsChannel() {
  const config = useRuntimeConfig()
  const channelId = (config.public.docsVersion as string) || DEFAULT_CHANNEL_ID

  const channels = useState<DocsChannel[]>('docs-channels', () => DOCS_CHANNELS)
  const channel = computed(() => findChannel(channelId, channels.value) ?? findChannel(channelId) ?? DOCS_CHANNELS[0]!)
  const current = computed(() => currentChannel(channels.value))
  // Only the current version is indexed by search engines. Worked out from the list built in,
  // like the prefix, so neither changes after hydration.
  const indexed = currentChannel().id === channelId
  /** This version's absolute URL base, such as `https://cwa.rocks/edge` (no trailing slash). */
  const siteUrl = `${SITE_ORIGIN}${channelPrefix(findChannel(channelId) ?? DOCS_CHANNELS[0]!)}`
  const switchable = computed(() => liveChannels(channels.value))

  /** The path prefix of another version: '' for the current one, `/edge`, `/2.0`... */
  function prefixOf(target: DocsChannel) {
    return channelPrefix(target, channels.value)
  }

  /** Fetch the channel list from the current version, once, in the browser. */
  async function refreshChannels() {
    if (import.meta.server || indexed) {
      return
    }
    const refreshed = useState<boolean>('docs-channels-refreshed', () => false)
    if (refreshed.value) {
      return
    }
    refreshed.value = true
    try {
      const manifest = await fetchRaw<DocsVersionManifest>('/api/docs-version.json')
      if (Array.isArray(manifest?.channels) && manifest.channels.some(c => c.id === channelId)) {
        channels.value = manifest.channels
      }
    } catch {
      // the current version is unreachable or older than versioning: keep the list built in
    }
  }

  /**
   * The URL of `path` (without any prefix) in another version: the same page when that
   * version has it, otherwise its Getting Started. Falls back to the same page when the
   * version can't be asked.
   */
  async function urlOn(target: DocsChannel, path: string, hash = '') {
    const prefix = prefixOf(target)
    const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
    try {
      const manifest = await fetchRaw<DocsVersionManifest>(`${prefix}/api/docs-version.json`)
      if (Array.isArray(manifest?.paths) && !manifest.paths.includes(clean)) {
        return `${prefix}/getting-started`
      }
    } catch {
      // keep the same page
    }
    return `${prefix}${clean === '/' && prefix ? '/' : clean}${hash}`
  }

  return { channel, channels, current, indexed, siteUrl, switchable, prefixOf, refreshChannels, urlOn }
}
