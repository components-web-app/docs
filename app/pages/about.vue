<script setup lang="ts">
const { data: page } = await useAsyncData('about', () => queryContent('/about').findOne())

useSeoMeta({
  titleTemplate: '',
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
        <NuxtImg
          src="https://picsum.photos/id/366/640/360"
          class="w-full max-w-[640px] rounded-md shadow-xl ring-1 ring-gray-300 dark:ring-gray-700"
          width="640"
          height="360"
        />
      </div>
    </UPageHero>
    <UPage>
      <UPageBody />
    </UPage>
  </UContainer>
</template>

<style scoped lang="postcss">
</style>
