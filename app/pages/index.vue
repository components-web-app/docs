<script setup lang="ts">
import BuildComponentFrontEndScreenshot from '~/components/home/BuildComponentFrontEndScreenshot.vue'

const { data } = await useAsyncData('landing', () => {
  return Promise.all([
    queryContent('/').findOne(),
    queryContent('/_partials/back-end').findOne(),
    queryContent('/_partials/front-end-page').findOne(),
    queryContent('/_partials/front-end-component').findOne(),
    queryContent('/_partials/front-end-admin').findOne()
  ])
})
const [page, backEnd, frontEndPage, frontEndComponent, frontEndAdmin] = data.value

useSeoMeta({
  titleTemplate: '',
  title: page.title,
  ogTitle: page.title,
  description: page.description,
  ogDescription: page.description
})

const { format } = Intl.NumberFormat('en', { notation: 'compact' })

const { data: stats } = await useFetch('/api/stats.json', {
  transform: ({ stargazers, contributors }) => ({ stargazers, contributors })
})

const orderedContributors = computed(() => {
  return Object.values(stats.value.contributors).sort((a, b) => (b.contributions - a.contributions))
})

const videoModalOpen = ref(false)

const codeTabItems = [
  {
    key: 'back-end',
    label: '1. Back End'
  },
  {
    key: 'front-end',
    label: '2. Front End'
  }
]

type HighlightFrontEndType = 'component' | 'admin' | 'page'
const selectedFrontEnd = ref<HighlightFrontEndType>('page')

const frontEndItems: {
  key: HighlightFrontEndType
  label: string
}[] = [{ key: 'page', label: 'Page' }, { key: 'component', label: 'Component' }, { key: 'admin', label: 'Admin' }]

function onFrontEndChange(index) {
  selectedFrontEnd.value = frontEndItems[index].key
}
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

      <template #description>
        <MDC :value="page.hero.description" />
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

    <ULandingSection
      align="center"
      :ui="{ container: 'gap-6 sm:gap-y-10 flex flex-col' }"
    >
      <template #title>
        Simply build individual UI components;<br><span class="text-primary-400">we do the rest</span>
      </template>
      <UTabs
        :items="codeTabItems"
        class="w-full"
        :ui="{ list: { height: 'h-16', tab: { size: 'text-lg', height: 'h-12', padding: 'px-6', font: 'font-semibold', active: 'text-gray-900 dark:text-white', inactive: 'text-gray-500 dark:text-gray-400' } } }"
      >
        <template #item="{ item }">
          <div
            v-if="item.key === 'back-end'"
            class="flex justify-center"
          >
            <div class="prose">
              <ContentRenderer :value="backEnd" />
            </div>
          </div>
          <div
            v-else
          >
            <div class="flex justify-center">
              <div class="max-w-xl pt-6">
                <BuildComponentFrontEndScreenshot :highlight="selectedFrontEnd" />
                <UTabs
                  :items="frontEndItems"
                  class="w-full"
                  :ui="{ list: { height: 'h-10', background: 'bg-primary-100 dark:bg-primary-800', marker: { background: 'bg-primary dark:bg-primary-900' }, tab: { size: 'text-base', height: 'h-8', padding: 'px-6', font: 'font-semibold', active: 'text-gray-900 dark:text-white', inactive: 'text-gray-500 dark:text-gray-400' } } }"
                  @change="onFrontEndChange"
                />
                <div class="prose">
                  <ContentRenderer :value="selectedFrontEnd === 'page' ? frontEndPage : (selectedFrontEnd === 'component' ? frontEndComponent : frontEndAdmin)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </ULandingSection>

    <ULandingSection
      v-for="(section, index) in page.benefits.sections"
      :key="index"
      v-bind="section"
      class="!pt-0"
    >
      <template #title>
        <span v-html="section.title" />
      </template>
      IMAGE
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

    <UContainer class="pb-20">
      <div class="flex justify-center">
        <ULandingLogos
          title="Special thanks to our sponsors"
          align="center"
        >
          <div class="px-4">
            <SvgoLogoSwa
              class="opacity-50 h-12"
              alt="Sponsored by Silverback Web Apps"
              :font-controlled="false"
            />
          </div>
          <div class="px-4">
            <SvgoLogoUbc
              class="opacity-50 h-12"
              alt="Sponsored by Unlocking Behaviour Change"
              :font-controlled="false"
            />
          </div>
          <div class="px-4">
            <SvgoLogoNuxtUi
              class="opacity-50 h-10"
              alt="Sponsored by Nuxt UI Pro"
              :font-controlled="false"
            />
          </div>
        </ULandingLogos>
      </div>
    </UContainer>
  </div>
</template>

<style scoped lang="postcss">
.prose {
  @apply text-white;

  :where(code) {
    @apply text-gray-200;
  }

  :where(pre):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
    @apply !bg-gray-800;
  }

  @media (min-width: 640px) {
    :where(.prose > :last-child):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
      min-width: 450px;
    }
  }
}

video[poster] {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
