<script setup lang="ts">
import type { CwaRelease, CwaReleasePart } from '~/utils/releases'
import { CWA_RELEASE_REPOS, fetchCwaReleases } from '~/utils/releases'

// The newest few releases of all three packages, with their notes from GitHub.
// The list is prerendered, then refreshed from GitHub in the browser so new releases show without a deploy.
const PAGE_SIZE = 5

const { data } = await useFetch<CwaRelease[]>('/api/releases.json', { default: () => [] })
const releases = ref<CwaRelease[]>(data.value || [])

onMounted(async () => {
  try {
    releases.value = await fetchCwaReleases()
  } catch {
    // GitHub unreachable or rate limited: keep the prerendered list
  }
})

const filter = ref<CwaReleasePart | 'all'>('all')
const shown = ref(PAGE_SIZE)
watch(filter, () => {
  shown.value = PAGE_SIZE
})

const filterItems = [
  { label: 'All', value: 'all' },
  ...CWA_RELEASE_REPOS.map(({ part, label }) => ({ label, value: part }))
]

const labels = Object.fromEntries(CWA_RELEASE_REPOS.map(({ part, label }) => [part, label])) as Record<CwaReleasePart, string>
const colors: Record<CwaReleasePart, 'primary' | 'info' | 'success'> = { bundle: 'info', module: 'success', template: 'primary' }

const filtered = computed(() => filter.value === 'all' ? releases.value : releases.value.filter(release => release.part === filter.value))
const visible = computed(() => filtered.value.slice(0, shown.value))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div class="not-prose space-y-6">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="item in filterItems"
        :key="item.value"
        :label="item.label"
        size="sm"
        :color="filter === item.value ? 'primary' : 'neutral'"
        :variant="filter === item.value ? 'solid' : 'subtle'"
        @click="filter = item.value as CwaReleasePart | 'all'"
      />
    </div>

    <p
      v-if="!filtered.length"
      class="text-sm text-muted"
    >
      The release list couldn't be loaded. See the releases on GitHub:
      <template
        v-for="(repo, index) in CWA_RELEASE_REPOS"
        :key="repo.repo"
      >
        <ULink
          :to="`https://github.com/components-web-app/${repo.repo}/releases`"
          target="_blank"
          class="underline"
        >{{ repo.label }}</ULink>{{ index < CWA_RELEASE_REPOS.length - 1 ? ', ' : '.' }}
      </template>
    </p>

    <article
      v-for="release in visible"
      :key="`${release.part}-${release.tag}`"
      class="rounded-lg border border-default p-4 sm:p-6"
    >
      <header class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <UBadge
          :label="labels[release.part]"
          :color="colors[release.part]"
          variant="subtle"
        />
        <h3 class="text-lg font-semibold">
          <ULink
            :to="release.url"
            target="_blank"
          >
            {{ release.name }}
          </ULink>
        </h3>
        <time
          :datetime="release.publishedAt"
          class="text-sm text-muted"
        >{{ formatDate(release.publishedAt) }}</time>
      </header>
      <div class="prose prose-sm prose-primary dark:prose-invert max-w-none break-words">
        <Comark v-if="release.body">{{ release.body }}</Comark>
        <p v-else>
          No notes for this release.
        </p>
      </div>
    </article>

    <div
      v-if="filtered.length > shown"
      class="flex justify-center"
    >
      <UButton
        label="Show more"
        color="neutral"
        variant="subtle"
        icon="i-heroicons-chevron-down"
        @click="shown += PAGE_SIZE"
      />
    </div>
  </div>
</template>
