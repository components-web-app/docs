<script setup lang="ts">
const { data } = await useAsyncData('landing', () => {
  return Promise.all([
    queryContent('/_partials/get-started').findOne(),
    queryContent('/').findOne()
  ])
})
const [getStarted, page] = data.value

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

    <ULandingSection align="left">
      <template #title>
        Creating components<br><span class="text-primary-400">is simple</span>
      </template>
      <template #description>
        ...
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
      <div class="w-full flex flex-col items-center justify-center">
        <div class="flex flex-col space-y-6">
          <div class="flex space-x-4">
            <div class="relative hidden flex-col justify-between pt-[20px] pb-[135px] md:flex">
              <svg
                width="2"
                height="295"
                viewBox="0 0 2 295"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="absolute left-4 top-2 h-full z-[-1]"
              >
                <path
                  d="M1 0L1 153"
                  stroke="#334155"
                  stroke-dasharray="4 4"
                />
                <path
                  d="M1 142L1 295"
                  stroke="#334155"
                  stroke-dasharray="4 4"
                />
              </svg>

              <div
                class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2"
              >
                1
              </div>
              <div
                class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2"
              >
                2
              </div>
            </div>
            <div class="prose">
              <ContentRenderer :value="getStarted" />
            </div>
          </div>
        </div>
      </div>
    </ULandingSection>

    <ULandingSection align="right">
      <template #title>
        Supercharge your<br><span class="text-primary-400">business</span>
      </template>
      <template #description>
        <p>Agencies, developers and website admin</p>
        <p>Built with teamwork in mind</p>
        <p>Why improvement on website builder</p>
        <p>Targeted landing pages</p>
      </template>
      <template #links>
        <UButton
          to="/built-for-business"
          icon="i-ph-lightning-duotone"
          size="xl"
        >
          Discover more
        </UButton>
      </template>
      <div class="">
        Left
      </div>
    </ULandingSection>

    <ULandingSection align="left">
      <template #title>
        Built on the<br><span class="text-primary-400">shoulders of giants</span>
      </template>
      <template #description>
        ...
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
      <div>
        <NuxtImg
          src="/images/api-platform-nuxt-cwa.png"
          alt="API Platform and Nuxt into the CWA"
          loading="lazy"
        />
      </div>
    </ULandingSection>

    <ULandingSection align="right">
      <template #title>
        Hello<br><span class="text-primary-400">World</span>
      </template>
      <template #description>
        ...
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
      <div>
        Left
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
          title="With thanks to our sponsors"
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
