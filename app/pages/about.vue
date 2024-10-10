<script setup lang="ts">
const { data: page } = await useAsyncData('about', () => queryContent('/about').findOne())

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})
</script>

<template>
  <div>
    <div class="bg-primary/5">
      <UContainer>
        <UPageHero
          v-bind="page.hero"
        >
          <template #title>
            <MDC
              v-if="page.hero.title"
              :value="page.hero.title"
            />
          </template>
          <template #description>
            <MDC
              v-if="page.hero.description"
              :value="page.hero.description"
            />
          </template>
          <div class="flex justify-center">
            <div class="w-full max-w-[840px] rounded-md shadow-xl ring-1 ring-gray-300 dark:ring-gray-700 overflow-hidden">
              <div style="padding:56.25% 0 0 0;position:relative;">
                <iframe
                  src="https://player.vimeo.com/video/1010679128?badge=0&amp;autopause=0&amp;player_id=0"
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
          <UPageHero v-bind="page.cta">
            <template #title>
              <MDC
                v-if="page.cta.title"
                :value="page.cta.title"
              />
            </template>
            <template #description>
              <MDC
                v-if="page.cta.description"
                :value="page.cta.description"
              />
            </template>
          </UPageHero>

          <UPageGrid :ui="{ wrapper: 'xl:grid-cols-2' }">
            <UPageCard
              v-for="(item, index) of page.pageCards.items"
              :key="index"
              v-bind="item"
            />
          </UPageGrid>

          <ULandingSection
            v-for="(section, index) of page.sections"
            :key="index"
            v-bind="section"
          >
            <template #title>
              <MDC
                v-if="section.title"
                :value="section.title"
              />
            </template>

            <template #description>
              <MDC
                v-if="section.description"
                :value="section.description"
              />
            </template>

            <template #component>
              <Component
                v-bind="section.component"
                :is="section.component.is"
                :font-controlled="false"
                filled
                class="w-full max-h-96"
              />
            </template>

            <template #image>
              <NuxtImg
                width="448"
                height="448"
                v-bind="section.image"
                class="w-full max-w-md"
              />
            </template>

            <template #code>
              <MDC
                :value="section.code"
                tag="pre"
                class="prose prose-primary dark:prose-invert max-w-none"
              />
            </template>

            <template #grid>
              <div class="flex justify-center">
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
          </ULandingSection>
        </UPageBody>
      </UPage>
    </UContainer>
    <div class="bg-primary/5">
      <ULandingSection
        :title="page.faq.title"
        :description="page.faq.description"
      >
        <ULandingFAQ
          :items="page.faq.items"
          multiple
        >
          <template #item="{ item }">
            <MDC
              :value="item.content"
              class="prose prose-primary dark:prose-invert max-w-none text-gray-500 dark:text-gray-400"
            />
          </template>
        </ULandingFAQ>
      </ULandingSection>
    </div>
  </div>
</template>

<style lang="postcss">
html.dark .shiki code {
  width: 100%;
}
html pre[class*=language-] code .highlighted {
  background-color: rgba(255,255,255,0.1);
  transition: background-color .5s;
  margin: 0 -24px;
  padding: 0 24px;
  width: calc(100% + 48px);
  display: inline-block
}
html pre[class*=language-].has-focused .line:not(.focus) {
  transition: filter .35s, opacity .35s;
}
html pre[class*=language-]:not(:hover).has-focused .line:not(.focused) {
  filter: blur(.095rem);
  opacity: .7;
}
</style>
