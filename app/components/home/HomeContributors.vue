<script lang="ts" setup>
const { format } = Intl.NumberFormat('en', { notation: 'compact' })

const { data: stats } = await useFetch('/api/stats.json', {
  transform: ({ stargazers, contributors }) => ({ stargazers, contributors })
})

const orderedContributors = computed(() => {
  return Object.values(stats.value.contributors).sort((a, b) => (b.contributions - a.contributions))
})

const { data: page } = await useAsyncData(`home`, () => queryContent('/').findOne())
</script>

<template>
  <ULandingSection>
    <ULandingCTA
      align="left"
      :card="false"
      :ui="{
        body: {
          padding: '!p-0'
        },
        title: 'text-center lg:text-left lg:text-5xl',
        description: 'mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 lg:gap-16',
        links: '-ml-3 justify-center lg:justify-start flex-wrap gap-y-3'
      }"
    >
      <template #title>
        <span v-html="page.cta.title" />
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
        <UButton
          v-for="user in page.cta.users"
          :key="user.username"
          :to="user.to"
          size="md"
          color="gray"
          variant="ghost"
          target="_blank"
        >
          <UAvatar
            :alt="user.username"
            :src="`https://ipx.nuxt.com/s_80x80/gh_avatar/${user.username}`"
            :srcset="`https://ipx.nuxt.com/s_160x160/gh_avatar/${user.username} 2x`"
            width="80"
            height="80"
            size="md"
            loading="lazy"
          />

          <div class="text-left">
            <p class="font-medium">
              {{ user.name }}
            </p>
            <p class="text-gray-500 dark:text-gray-400 leading-4">
              {{ `@${user.username}` }}
            </p>
          </div>
        </UButton>
      </template>

      <div
        v-if="stats"
        class="p-5 overflow-hidden flex items-center justify-center"
      >
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-8">
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
              size="3xl"
            />
          </NuxtLink>
        </div>
      </div>
    </ULandingCTA>
  </ULandingSection>
</template>
