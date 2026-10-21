<script setup lang="ts">
/**
 * A one-line notice on docs pages of a version that isn't the current release
 * (shared/docs-versions.ts): edge describes unreleased changes, an older line is old. There
 * is none while edge is the only version. Dismissing it is remembered in this browser.
 */
const route = useRoute()
const { channel, current, prefixOf, urlOn } = useDocsChannel()

const shown = computed(() => channel.value.id !== current.value.id)
const storageKey = computed(() => `cwa-docs-channel-notice-dismissed:${channel.value.id}`)
const open = ref(true)

onMounted(() => {
  try {
    if (localStorage.getItem(storageKey.value) === '1') {
      open.value = false
    }
  } catch {
    // storage unavailable: keep showing the notice
  }
})

function dismiss(isOpen: boolean) {
  if (isOpen) {
    return
  }
  open.value = false
  try {
    localStorage.setItem(storageKey.value, '1')
  } catch {
    // storage unavailable: the notice comes back on the next page load
  }
}

// A plain link: the current version is another build, so the router can't navigate to it
const currentHref = computed(() => `${prefixOf(current.value)}${route.path}`)

async function goToCurrent(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
    return
  }
  event.preventDefault()
  window.location.href = await urlOn(current.value, route.path, route.hash)
}
</script>

<template>
  <UAlert
    v-if="shown && open"
    :icon="channel.kind === 'edge' ? 'i-heroicons-code-bracket' : 'i-heroicons-clock'"
    color="info"
    variant="subtle"
    close
    :ui="{ root: 'py-2 px-3', title: 'text-sm font-normal', icon: 'size-4' }"
    @update:open="dismiss"
  >
    <template #title>
      <template v-if="channel.kind === 'edge'">
        You're reading the edge docs: they describe unreleased changes on the development branches.
      </template>
      <template v-else>
        You're reading the docs for an older version, CWA {{ channel.label }}.
      </template>
      For the current release, read the <a
        :href="currentHref"
        class="underline"
        @click="goToCurrent"
      >{{ current.label }} docs</a>.
    </template>
  </UAlert>
</template>
