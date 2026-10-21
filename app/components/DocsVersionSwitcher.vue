<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { DocsChannel } from '#shared/docs-versions'

/**
 * Switches between documentation versions (shared/docs-versions.ts). Each version is its own
 * deployment, so a switch is a full page load on another origin, on the same page when that
 * version has it. Hidden while only one version is live.
 */
withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md'
  block?: boolean
}>(), { size: 'sm', block: false })

const route = useRoute()
const { channel, switchable, originOf, refreshChannels, urlOn } = useDocsChannel()

onMounted(refreshChannels)

function describe(target: DocsChannel) {
  if (target.kind === 'edge') {
    return 'Unreleased: the development branches'
  }
  return `Template ${target.sources.template}`
}

async function go(event: Event, target: DocsChannel) {
  if (target.id === channel.value.id) {
    return
  }
  // The item is a link to the same path; ask the version whether it has the page first
  event.preventDefault()
  window.location.href = await urlOn(target, route.path, route.hash)
}

const items = computed<DropdownMenuItem[]>(() => switchable.value.map(target => ({
  label: target.label,
  description: describe(target),
  icon: target.id === channel.value.id ? 'i-heroicons-check' : 'i-heroicons-book-open',
  to: target.id === channel.value.id ? undefined : `${originOf(target)}${route.path}`,
  external: true,
  onSelect: (event: Event) => go(event, target)
})))
</script>

<template>
  <div v-if="switchable.length > 1">
    <UDropdownMenu
      :items="items"
      :content="{ align: 'start' }"
      :ui="{ content: 'min-w-64' }"
    >
      <UButton
        :label="channel.label"
        :size="size"
        :block="block"
        color="neutral"
        variant="outline"
        trailing-icon="i-heroicons-chevron-down-20-solid"
        :aria-label="`Documentation version: ${channel.label}. Switch version`"
      />
    </UDropdownMenu>
  </div>
</template>
