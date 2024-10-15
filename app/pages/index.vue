<script setup lang="ts">
import HomeSponsors from '~/components/home/HomeSponsors.vue'
import HomeContributors from '~/components/home/HomeContributors.vue'
import HomeCode from '~/components/home/HomeCode.vue'
import HomeHero from '~/components/home/HomeHero.vue'

const { data: page } = await useAsyncData(`home`, () => queryContent('/').findOne())

useSeoMeta({
  titleTemplate: '',
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})

definePageMeta({
  scrollToTop: true
})
</script>

<template>
  <div>
    <HomeHero />
    <div class="bg-primary/5 dark:bg-feature/65">
      <ULandingSection
        :links="page.features.links"
        :ui="{ wrapper: 'py-16 sm:py-20 mb-20 sm:mb-24' }"
      >
        <template
          v-if="page.features.title"
          #title
        >
          <MDC :value="page.features?.title" />
        </template>
        <UPageGrid :ui="{ wrapper: 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-3' }">
          <ULandingCard
            v-for="(item, index) of page.features.items"
            :key="index"
            v-bind="item"
          />
        </UPageGrid>
      </ULandingSection>
    </div>

    <ULandingSection
      v-for="(section, index) in page.benefits.sections"
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
    </ULandingSection>

    <HomeCode class="mb-24" />

    <HomeContributors />

    <HomeSponsors class="pb-20" />
  </div>
</template>
