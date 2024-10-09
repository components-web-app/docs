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
</script>

<template>
  <div>
    <HomeHero />

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
      v-for="(section, index) in page.benefits.sections"
      :key="index"
      v-bind="section"
      class="!pt-0"
    >
      <template #title>
        <span v-html="section.title" />
      </template>
      <NuxtImg
        width="448"
        height="448"
        :src="section.image"
        :alt="section.title"
        class="w-full max-w-md"
      />
    </ULandingSection>

    <HomeCode />

    <HomeContributors />

    <HomeSponsors class="pb-20" />
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
