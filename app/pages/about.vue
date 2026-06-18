<script setup lang="ts">
import highlight from '@comark/nuxt/plugins/highlight'
import { transformerNotationFocus, transformerNotationHighlight } from '@shikijs/transformers'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = await useAsyncData<any>('about', () => queryCollection('pages').path('/about').first())

const highlightPlugin = highlight({
  themes: { light: githubLight, dark: githubDark },
  transformers: [transformerNotationFocus(), transformerNotationHighlight()]
})

useSeoMeta({
  title: page.value?.title,
  ogTitle: page.value?.title,
  description: page.value?.description,
  ogDescription: page.value?.description
})

const props = defineProps<{
  isVip: boolean
}>()

const vimeoUrl = computed(() => {
  return props.isVip ? 'https://player.vimeo.com/video/1008157540?badge=0&amp;autopause=0&amp;player_id=0' : 'https://player.vimeo.com/video/1010679128?badge=0&amp;autopause=0&amp;player_id=0'
})

const title = computed(() => {
  return props.isVip ? page.value?.hero?.title?.vip : page.value?.hero?.title?.default
})

const heroProps = computed(() => {
  const { title: _t, ...rest } = page.value?.hero || {}
  return rest
})

function mapFeatures(features: any[]) {
  return features?.map((f: any) => ({ ...f, title: f.name })) ?? []
}

definePageMeta({
  scrollToTop: true
})
</script>

<template>
  <div>
    <div class="bg-primary/5 dark:bg-feature/65">
      <UContainer>
        <UPageHero
          v-bind="heroProps"
        >
          <template #title>
            <span
              v-if="title"
              v-html="title"
            />
          </template>
          <template #description>
            <span
              v-if="page?.hero?.description"
              v-html="page.hero.description"
            />
          </template>
          <div class="flex justify-center">
            <div class="w-full max-w-[840px] rounded-md shadow-xl ring-1 ring-gray-300 dark:ring-gray-700 overflow-hidden">
              <div style="padding:56.25% 0 0 0;position:relative;">
                <iframe
                  :src="vimeoUrl"
                  frameborder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;"
                  title="CWA Overview"
                />
              </div>
            </div>
          </div>
        </UPageHero>
      </UContainer>
    </div>
    <UContainer>
      <UPage>
        <UPageBody>
          <UPageHero
            v-bind="page?.cta"
          >
            <template #title>
              <div>
                <UIcon
                  v-if="page?.cta?.icon"
                  :name="page?.cta?.icon"
                  class="ml-1 size-10 pointer-events-none text-primary"
                />
              </div>
              <span
                v-if="page?.cta?.title"
                v-html="page.cta.title"
              />
            </template>
            <template #description>
              <div
                v-if="page?.cta?.description"
                class="max-w-4xl"
                v-html="page.cta.description"
              />
            </template>
          </UPageHero>

          <UPageGrid :ui="{ base: 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8' }">
            <UPageCard
              v-for="(item, index) of page?.pageCards?.items"
              :key="index"
              v-bind="item"
            />
          </UPageGrid>

          <UPageSection
            v-for="(section, index) of page?.sections"
            :key="index"
            orientation="horizontal"
            :reverse="section.align === 'right'"
            :features="mapFeatures(section.features)"
            :ui="{
              container: 'flex flex-col lg:grid py-8 sm:py-12 lg:py-12 gap-8 sm:gap-16',
              wrapper: section.imageFirstMobile && section.align === 'left' ? 'order-last lg:order-none' : ''
            }"
          >
            <template #title>
              <span
                v-if="section.title"
                v-html="section.title"
              />
            </template>

            <template #description>
              <span
                v-if="section.description"
                v-html="section.description"
              />
            </template>

            <template #default>
              <Component
                v-bind="section.component"
                :is="section.component.is"
                v-if="section.slot === 'component' && section.component"
                :font-controlled="false"
                filled
                class="w-full max-h-96"
              />
              <div
                v-else-if="section.slot === 'image' && section.image"
                class="flex justify-center"
              >
                <NuxtImg
                  width="448"
                  height="448"
                  v-bind="section.image"
                  class="w-full max-w-md"
                />
              </div>
              <ClientOnly v-else-if="section.slot === 'code' && section.code">
                <Comark
                  :plugins="[highlightPlugin]"
                  class="prose prose-primary dark:prose-invert max-w-none"
                >
                  {{ section.code }}
                </Comark>
              </ClientOnly>
              <div
                v-else-if="section.slot === 'grid' && section.iconGrid"
                class="flex justify-center"
              >
                <div class="grid grid-cols-3 gap-8 md:gap-12 w-full max-w-md">
                  <NuxtLink
                    v-for="(item, gridIndex) in section.iconGrid"
                    :key="`grid-${gridIndex}-${item.name}`"
                    :title="item"
                    class="block lg:hover:scale-110 transition aspect-[1/1] opacity-90 hover:opacity-100"
                  >
                    <div
                      class="rounded-xl bg-slate-100 w-full h-full p-4 ring-1 ring-gray-300 dark:ring-gray-700"
                    >
                      <UIcon
                        :name="item.icon"
                        :title="item.name"
                        class="w-full h-full"
                        :class="item.class"
                      />
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </template>
          </UPageSection>
        </UPageBody>
      </UPage>
    </UContainer>
    <div class="bg-primary/5 dark:bg-feature/65">
      <UPageSection
        :title="page?.faq?.title"
        :description="page?.faq?.description"
        :ui="{ container: 'flex flex-col lg:grid py-8 sm:py-12 lg:py-12 gap-8 sm:gap-16' }"
      >
        <UAccordion
          :items="page?.faq?.items"
          type="multiple"
          :ui="{
            trigger: 'text-lg py-6 font-medium',
            label: 'text-gray-900 dark:text-white'
          }"
        >
          <template #content="{ item }">
            <div
              class="prose prose-primary dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 pb-6"
              v-html="item.content"
            />
          </template>
        </UAccordion>
      </UPageSection>
    </div>
  </div>
</template>

<style lang="postcss">
html.dark .shiki code {
  width: 100%;
}
html .shiki code .highlighted {
  background-color: rgba(255,255,255,0.1);
  transition: background-color .5s;
  margin: 0 -24px;
  padding: 0 24px;
  width: calc(100% + 48px);
  display: inline-block;
}
html .shiki.has-focused .line:not(.focused) {
  transition: filter .35s, opacity .35s;
}
html .shiki:not(:hover).has-focused .line:not(.focused) {
  filter: blur(.095rem);
  opacity: .7;
}
</style>
