<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { DocsChannel } from '#shared/docs-versions'

/**
 * Switches between documentation versions (shared/docs-versions.ts). Each version is its own
 * build under its own path, so a switch is a full page load, onto the same page when that
 * version has it. Hidden while only one version is live.
 */
withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md'
  block?: boolean
}>(), { size: 'sm', block: false })

const route = useRoute()
const { channel, switchable, refreshChannels, urlOn } = useDocsChannel()

onMounted(refreshChannels)

function describe(target: DocsChannel) {
  if (target.kind === 'edge') {
    return 'Unreleased: the development branches'
  }
  return `Template ${target.sources.template}`
}

async function go(target: DocsChannel) {
  if (target.id === channel.value.id) {
    return
  }
  // Ask the version whether it has this page first
  window.location.href = await urlOn(target, route.path, route.hash)
}

const items = computed<DropdownMenuItem[]>(() => switchable.value.map(target => ({
  label: target.label,
  description: describe(target),
  type: 'checkbox' as const,
  checked: target.id === channel.value.id,
  onSelect: () => go(target)
})))
</script>

<template>
  <div v-if="switchable.length > 1">
    <UDropdownMenu
      :items="items"
      checked-icon="i-heroicons-check-20-solid"
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
