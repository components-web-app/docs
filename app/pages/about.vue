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
  <UContainer>
    <UPageHero
      v-bind="page.hero"
    >
      <template #description>
        <MDC :value="page.hero.description" />
      </template>
      <div class="flex justify-center">
        <div class="w-full max-w-[840px]">
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
    <UPage>
      <UPageBody />
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
    </UPage>
  </UContainer>
</template>

<style scoped lang="postcss">
</style>
