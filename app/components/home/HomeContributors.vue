<script lang="ts" setup>
const { format } = Intl.NumberFormat('en', { notation: 'compact' })

const { data: stats } = await useFetch('/api/stats.json', {
  transform: ({ stargazers, contributors }) => ({ stargazers, contributors })
})

const orderedContributors = computed(() => {
  if (!stats.value?.contributors) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.values(stats.value.contributors).sort((a: any, b: any) => (b.contributions - a.contributions))
})

const { data: page } = useNuxtData<any>('home')
</script>

<template>
  <UPageSection :ui="{ container: 'flex flex-col lg:grid py-24 sm:py-32 lg:py-32 gap-8 sm:gap-16' }">
    <UPageCTA
      orientation="horizontal"
      variant="naked"
      :ui="{
        container: 'p-0 gap-8 sm:gap-16 sm:px-0 lg:px-0',
        title: 'text-center lg:text-left lg:text-5xl',
        description: 'mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 lg:gap-16',
        links: '-ml-3 justify-center lg:justify-start flex-wrap gap-y-3'
      }"
    >
      <template #title>
        <span v-html="page?.contributors?.title" />
      </template>

      <template #description>
        <NuxtLink
          class="text-center lg:text-left group"
          to="https://github.com/components-web-app"
          target="_blank"
        >
          <p
            v-if="stats"
            class="text-5xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400"
          >
            {{ format(stats.stargazers) }}
          </p>
          <p>GitHub stars</p>
        </NuxtLink>
        <NuxtLink
          class="text-center lg:text-left group"
          to="https://github.com/components-web-app"
          target="_blank"
        >
          <p
            v-if="stats"
            class="text-5xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400"
          >
            {{ format(orderedContributors.length) }}
          </p>
          <p>contributors</p>
        </NuxtLink>
      </template>

      <template #links>
        <HomeContributorButton
          v-for="user in page?.contributors?.users"
          :key="user.username"
          :user="user"
        />
      </template>

      <div
        v-if="stats"
        class="p-5 overflow-hidden flex items-center justify-center"
      >
        <div class="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-8">
          <NuxtLink
            v-for="(contributor, index) in orderedContributors"
            :key="`contrib-${index}`"
            :to="contributor.link"
            target="_blank"
            :title="contributor.username"
            class="block lg:hover:scale-110 transition"
          >
            <UAvatar
              :src="contributor.image"
              :alt="contributor.username"
              class="size-20"
            />
          </NuxtLink>
        </div>
      </div>
    </UPageCTA>
  </UPageSection>
</template>
