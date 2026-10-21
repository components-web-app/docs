import {
  DOCS_CHANNELS,
  DEFAULT_CHANNEL_ID,
  PRIMARY_ORIGIN,
  channelOrigin,
  findChannel,
  liveChannels,
  primaryChannel,
  type DocsChannel
} from '#shared/docs-versions'

/** What a deployment publishes at /api/docs-version.json (server/api/docs-version.json.get.ts). */
export interface DocsVersionManifest {
  channel: string
  channels: DocsChannel[]
  paths: string[]
}

/**
 * The documentation version this build documents, and the others. The channel list starts
 * as the one built in; on a version that isn't the primary site, it's refreshed from the
 * primary site, so an older version learns about versions cut after it.
 */
export function useDocsChannel() {
  const config = useRuntimeConfig()
  const channelId = (config.public.docsChannel as string) || DEFAULT_CHANNEL_ID

  const channels = useState<DocsChannel[]>('docs-channels', () => DOCS_CHANNELS)
  const channel = computed(() => findChannel(channelId) ?? channels.value.find(c => c.id === channelId) ?? DOCS_CHANNELS[0]!)
  const primary = computed(() => primaryChannel(channels.value))
  // Only the primary channel is indexed by search engines
  const indexed = computed(() => primary.value.id === channel.value.id)
  // Origins are worked out from the list built in, so canonical URLs never change after hydration
  const origin = channelOrigin(findChannel(channelId) ?? DOCS_CHANNELS[0]!)
  const switchable = computed(() => liveChannels(channels.value))
  const latest = computed(() => channels.value.find(c => c.kind === 'latest' && c.live))

  function originOf(target: DocsChannel) {
    return channelOrigin(target, channels.value)
  }

  /** Fetch the channel list from the primary site, once, in the browser. */
  async function refreshChannels() {
    if (import.meta.server || indexed.value) {
      return
    }
    const refreshed = useState<boolean>('docs-channels-refreshed', () => false)
    if (refreshed.value) {
      return
    }
    refreshed.value = true
    try {
      const manifest = await $fetch<DocsVersionManifest>(`${PRIMARY_ORIGIN}/api/docs-version.json`, { timeout: 3000 })
      if (Array.isArray(manifest?.channels) && manifest.channels.some(c => c.id === channelId)) {
        channels.value = manifest.channels
      }
    } catch {
      // the primary site is unreachable or older than versioning: keep the list built in
    }
  }

  /**
   * The URL of `path` on another channel: the same path when that channel has the page,
   * otherwise its docs home. Falls back to the same path when the channel can't be asked.
   */
  async function urlOn(target: DocsChannel, path: string, hash = '') {
    const base = originOf(target)
    try {
      const manifest = await $fetch<DocsVersionManifest>(`${base}/api/docs-version.json`, { timeout: 3000 })
      const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
      if (Array.isArray(manifest?.paths) && !manifest.paths.includes(clean)) {
        return `${base}/getting-started`
      }
    } catch {
      // keep the same path
    }
    return `${base}${path}${hash}`
  }

  return { channel, channels, primary, indexed, origin, switchable, latest, originOf, refreshChannels, urlOn }
}
