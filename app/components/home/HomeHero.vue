<script lang="ts" setup>
// The WebGL background is decoration: load it in its own chunk, in the browser only.
const BackgroundParticles = defineAsyncComponent(() => import('~/components/home/BackgroundParticles.vue'))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = useNuxtData<any>('home')

// Skip the effect for visitors who ask for less motion, and on touch devices, where
// there is no pointer to follow and the simulation only costs battery. Decided after
// mount, so the chunk is never fetched for them.
const showParticles = ref(false)
onMounted(() => {
  showParticles.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !window.matchMedia('(pointer: coarse)').matches
})

// UPageHero's props only: the code block is rendered below, not passed through as an attribute.
const heroProps = computed(() => {
  const { code: _code, ...rest } = page.value?.hero || {}
  return rest
})

// The headline badge opens external links in a new tab and keeps internal links in this one.
const headlineTarget = computed(() => /^https?:\/\//.test(page.value?.hero?.headline?.to ?? '') ? '_blank' : undefined)

// Highlighted at prerender time, so the snippet is in the HTML and Shiki never ships.
const { data: highlightedCode } = await useHighlightedCode('index')
</script>

<template>
  <div class="relative overflow-hidden">
    <UPageHero
      v-if="page?.hero"
      v-bind="heroProps"
      :ui="{
        container: 'mx-auto px-4 sm:px-6 lg:px-8 lg:py-40 max-w-7xl gap-8 sm:gap-y-14 flex flex-col dark:[text-shadow:_0_1px_40px_rgb(0_0_0_/_90%)]',
        title: 'lg:text-7xl'
      }"
    >
      <template #top>
        <ClientOnly>
          <BackgroundParticles
            v-if="showParticles"
            class="absolute inset-0 -z-10 opacity-30 invert dark:invert-0"
          />
        </ClientOnly>
      </template>
      <template #headline>
        <UBadge
          v-if="page.hero.headline"
          variant="subtle"
          size="lg"
          class="relative rounded-full font-semibold"
        >
          <NuxtLink
            :to="page.hero.headline.to"
            :target="headlineTarget"
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
        <div class="flex flex-col items-center gap-3 mb-6">
          <SvgoLogo
            class="text-primary h-20"
            :font-controlled="false"
          />
          <span class="block text-sm sm:text-base font-semibold uppercase tracking-[0.3em] text-muted [text-shadow:none]">Components Web App</span>
        </div>
        <span v-html="page.hero.title" />
      </template>

      <template #description>
        <Markdown :value="page.hero.description" />
      </template>

      <template #links>
        <template v-if="page.hero.links?.length">
          <UButton
            v-for="link in page.hero.links"
            :key="link.label"
            v-bind="link"
          />
        </template>
        <UButton
          v-else
          color="primary"
          label="Get Started"
          icon="i-ph-rocket-launch-duotone"
          to="/getting-started/installation"
          size="xl"
        />
      </template>

      <CodeBlock
        :code="page.hero.code"
        :trees="highlightedCode"
        class="prose prose-primary dark:prose-invert mx-auto"
      />
    </UPageHero>
  </div>
</template>

<style scoped lang="postcss">
video[poster] {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
