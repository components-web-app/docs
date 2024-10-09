<script setup lang="ts">
const { data: page } = await useAsyncData('built-for-business', () => queryContent('/built-for-business').findOne())

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
          <template #description>
            <MDC :value="page.hero.description" />
          </template>
          <div class="flex justify-center">
            <NuxtImg
              src="https://picsum.photos/id/180/640/360"
              class="w-full max-w-[640px] rounded-md shadow-xl ring-1 ring-gray-300 dark:ring-gray-700"
              width="640"
              height="360"
            />
          </div>
        </UPageHero>
      </UContainer>
    </div>
    <UContainer>
      <UPage>
        <UPageBody>
          <UPageGrid>
            <UPageCard
              v-for="(item, index) of page.pageCards.items"
              :key="index"
              v-bind="item"
            />
          </UPageGrid>
        </UPageBody>
      </UPage>
    </UContainer>
  </div>
</template>

<style scoped lang="postcss">
</style>
