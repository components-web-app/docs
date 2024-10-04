<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryContent('/').findOne())

useSeoMeta({
  titleTemplate: '',
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})

const { format } = Intl.NumberFormat('en', { notation: 'compact' })

const providers = []

const { data: stats } = await useFetch('/api/stats.json', {
  transform: ({ stargazers, contributors }) => ({ stargazers, contributors })
})

const orderedContributors = computed(() => {
  return Object.values(stats.value.contributors).sort((a, b) => (b.contributions - a.contributions))
})

const videoModalOpen = ref(false)
</script>

<template>
  <div>
    <ULandingHero
      v-if="page.hero"
      v-bind="page.hero"
    >
      <template #headline>
        <UBadge
          v-if="page.hero.headline"
          variant="subtle"
          size="lg"
          class="relative rounded-full font-semibold"
        >
          <NuxtLink
            :to="page.hero.headline.to"
            target="_blank"
            class="focus:outline-none"
            tabindex="-1"
          >
            <span
              class="absolute inset-0"
              aria-hidden="true"
            />
          </NuxtLink>

          {{ page.hero.headline.label }}

          <UIcon
            v-if="page.hero.headline.icon"
            :name="page.hero.headline.icon"
            class="ml-1 w-4 h-4 pointer-events-none"
          />
        </UBadge>
      </template>

      <template #title>
        <MDC :value="page.hero.title" />
      </template>

      <MDC
        :value="page.hero.code"
        class="prose prose-primary dark:prose-invert mx-auto"
      />

      <template #links>
        <UButton
          color="primary"
          label="Get Started"
          icon="i-ph-rocket-launch-duotone"
          to="/getting-started/installation"
          size="xl"
        />
        <UButton
          size="xl"
          color="white"
          icon="i-ph-video-duotone"
          label="What is the CWA?"
          @click="videoModalOpen = true"
        />
      </template>

      <UModal
        v-model="videoModalOpen"
        :ui="{ width: 'sm:max-w-[560px]' }"
      >
        <div>
          <div style="padding:56.25% 0 0 0;position:relative;">
            <iframe
              src="https://player.vimeo.com/video/1010679128?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
              style="position:absolute;top:0;left:0;width:100%;height:100%;"
              title="CWA Overview"
            />
          </div>
        </div>
      </UModal>
    </ULandingHero>

    <ULandingSection
      :links="page.features.links"
    >
      <template
        v-if="page.features.title"
        #title
      >
        <span v-html="page.features?.title" />
      </template>
      <UPageGrid>
        <ULandingCard
          v-for="(item, index) of page.features.items"
          :key="index"
          v-bind="item"
        />
      </UPageGrid>
    </ULandingSection>

    <ULandingSection align="left">
      <template #title>
        Choose your<br><span class="text-primary-400">favorite provider</span>
      </template>
      <template #description>
        Nuxt Image supports multiple providers for high performance.<br>
        Providers are integrations between Nuxt Image and third-party image transformation services. Each provider is
        responsible for generating correct URLs for that image transformation service. Nuxt Image can also be configured
        to work with any external image transformation service.
      </template>
      <template #links>
        <UButton
          to="/getting-started"
          icon="i-ph-rocket-launch-duotone"
          size="xl"
        >
          Get Started
        </UButton>
      </template>
      <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
        <NuxtLink
          v-for="(provider, index) in providers"
          :key="index"
          :to="`/providers/${provider}`"
          :title="provider"
          class="block lg:hover:scale-110 transition"
        >
          <NuxtImg
            :src="`/providers/${provider}.svg`"
            :alt="provider"
            width="64"
            height="64"
            class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl"
            loading="lazy"
          />
        </NuxtLink>
      </div>
    </ULandingSection>

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
            to="https://github.com/nuxt/ui"
            target="_blank"
          >
            <p
              v-if="stats"
              class="text-5xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400"
            >
              {{ format(stats.stargazers) }}+
            </p>
            <p>GitHub stars</p>
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

    <UContainer class="pb-20">
      <div class="flex justify-center">
        <ULandingLogos
          title="With thanks to our sponsors"
          align="center"
          :config="{ images: 'mx-auto mt-10 flex flex-wrap items-center justify-between gap-8' }"
        >
          <UIcon
            name="i-simple-icons-github"
            class="w-10 h-10 flex-shrink-0"
          />
          <UIcon
            name="i-simple-icons-discord"
            class="w-10 h-10 flex-shrink-0"
          />
          <UIcon
            name="i-simple-icons-discord"
            class="w-10 h-10 flex-shrink-0"
          />
          <UIcon
            name="i-simple-icons-discord"
            class="w-10 h-10 flex-shrink-0"
          />
          <UIcon
            name="i-simple-icons-discord"
            class="w-10 h-10 flex-shrink-0"
          />
          <UIcon
            name="i-simple-icons-discord"
            class="w-10 h-10 flex-shrink-0"
          />
        </ULandingLogos>
      </div>
    </UContainer>
  </div>
</template>
