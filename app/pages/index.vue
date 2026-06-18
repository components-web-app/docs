<script setup lang="ts">
import HomeSponsors from '~/components/home/HomeSponsors.vue'
import HomeContributors from '~/components/home/HomeContributors.vue'
import HomeCode from '~/components/home/HomeCode.vue'
import HomeHero from '~/components/home/HomeHero.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = await useAsyncData<any>('home', () => queryCollection('pages').path('/').first())

useSeoMeta({
  titleTemplate: '',
  title: page.value?.title,
  ogTitle: page.value?.title,
  description: page.value?.description,
  ogDescription: page.value?.description
})

definePageMeta({
  scrollToTop: true
})
</script>

<template>
  <div>
    <HomeHero />
    <div class="bg-primary/5 dark:bg-feature/65">
      <UPageSection
        class="mb-20 sm:mb-24"
        :ui="{ container: 'flex flex-col lg:grid py-16 sm:py-20 lg:py-20 gap-16 sm:gap-y-24' }"
      >
        <template
          v-if="page?.features?.title"
          #title
        >
          <span v-html="page?.features?.title" />
        </template>
        <div class="flex flex-col gap-y-24">
          <UPageGrid class="grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
            <UPageCard
              v-for="(item, index) of page?.features?.items"
              :key="index"
              v-bind="item"
            />
          </UPageGrid>
          <div class="flex justify-center">
            <UButton
              v-for="link in page?.features?.links"
              :key="link.label"
              v-bind="link"
              size="xl"
            />
          </div>
        </div>
      </UPageSection>
    </div>

    <UPageSection
      v-for="(section, index) in page?.benefits?.sections"
      :key="index"
      orientation="horizontal"
      :reverse="section.align === 'left'"
      :description="section.description"
      :features="section.features?.map((f: any) => ({ ...f, title: f.name }))"
      :links="section.links"
      :ui="{ container: 'flex flex-col lg:grid pt-0 sm:pt-0 lg:pt-0 pb-32 sm:pb-32 lg:pb-32 gap-8 sm:gap-16' }"
    >
      <template #title>
        <span v-html="section.title" />
      </template>
      <div class="flex justify-center">
        <NuxtImg
          width="448"
          height="448"
          :src="section.image"
          :alt="section.title"
          class="w-full max-w-md"
        />
      </div>
    </UPageSection>

    <HomeCode class="mb-24" />

    <HomeContributors />

    <HomeSponsors class="pb-20" />
  </div>
</template>
