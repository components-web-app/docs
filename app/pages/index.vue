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
        :links="page?.features?.links"
        :ui="{ wrapper: 'py-16 sm:py-20 mb-20 sm:mb-24' }"
      >
        <template
          v-if="page?.features?.title"
          #title
        >
          <MDC :value="page?.features?.title" />
        </template>
        <UPageGrid class="grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
          <UPageFeature
            v-for="(item, index) of page?.features?.items"
            :key="index"
            v-bind="item"
          />
        </UPageGrid>
      </UPageSection>
    </div>

    <UPageSection
      v-for="(section, index) in page?.benefits?.sections"
      :key="index"
      v-bind="section"
      class="!pt-0"
      :ui="{ base: `order-last ${section.align === 'left' ? 'lg:order-first' : ''}` }"
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
