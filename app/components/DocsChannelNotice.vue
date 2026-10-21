<script setup lang="ts">
/**
 * A one-line notice on docs pages of a version that isn't the latest release
 * (shared/docs-versions.ts): edge describes unreleased changes, an archived version is old.
 * Shown only once a latest deployment exists. Dismissing it is remembered in this browser.
 */
const route = useRoute()
const { channel, latest, originOf, urlOn } = useDocsChannel()

const shown = computed(() => !!latest.value && channel.value.kind !== 'latest')
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

const latestHref = computed(() => latest.value ? `${originOf(latest.value)}${route.path}` : '#')

async function goToLatest(event: MouseEvent) {
  if (!latest.value || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
    return
  }
  event.preventDefault()
  window.location.href = await urlOn(latest.value, route.path, route.hash)
}
</script>

<template>
  <UAlert
    v-if="shown && open && latest"
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
        You're reading the docs for CWA {{ channel.label }}, an older release.
      </template>
      For the latest release, read the <a
        :href="latestHref"
        class="underline"
        @click="goToLatest"
      >{{ latest.label }} docs</a>.
    </template>
  </UAlert>
</template>
