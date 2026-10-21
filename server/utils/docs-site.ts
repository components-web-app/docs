import type { H3Event } from 'h3'
import { DOCS_CHANNELS, DEFAULT_CHANNEL_ID, channelOrigin, findChannel, liveChannels, primaryChannel } from '#shared/docs-versions'

/**
 * The documentation version this build documents (shared/docs-versions.ts): its channel,
 * the origin it's served from, and whether search engines should index it.
 */
export function docsSite(event: H3Event) {
  const id = (useRuntimeConfig(event).public.docsChannel as string) || DEFAULT_CHANNEL_ID
  const channel = findChannel(id) ?? DOCS_CHANNELS[0]!
  const { template, bundle, module } = channel.sources
  return {
    channel,
    origin: channelOrigin(channel),
    indexed: primaryChannel().id === channel.id,
    // One line for llms.txt and llms-full.txt, only once there's more than one version
    versionLine: liveChannels().length > 1
      ? `> Documentation version: ${channel.label} (template ${template}, api-components-bundle ${bundle}, @cwa/nuxt ${module}).`
      : undefined
  }
}
