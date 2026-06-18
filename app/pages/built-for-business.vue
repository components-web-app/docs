<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = await useAsyncData<any>('built-for-business', () => queryCollection('pages').path('/built-for-business').first())

useSeoMeta({
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
    <div class="bg-primary/5 dark:bg-feature/65">
      <UPageHero
        orientation="horizontal"
        :title="page?.hero?.title"
        :description="page?.hero?.description"
        :links="page?.hero?.links"
      >
        <template #title>
          <span v-html="page?.hero?.title" />
        </template>
        <template #description>
          <span v-html="page?.hero?.description" />
        </template>
        <div class="flex justify-center">
          <NuxtImg
            src="/images/business/business-hero.svg"
            class="w-full max-w-85"
            width="640"
            height="640"
          />
        </div>
      </UPageHero>
    </div>
    <UContainer>
      <UPage>
        <UPageBody>
          <UPageGrid :ui="{ base: 'relative grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8' }">
            <UPageCard
              v-for="(item, index) of page?.pageCards?.items"
              :key="index"
              v-bind="item"
            />
          </UPageGrid>

          <UPageCTA
            class="mt-8 bg-primary/5 dark:bg-feature/65"
            :ui="{ container: 'px-6 py-20 sm:px-16 sm:py-28 flex flex-col gap-10 sm:gap-y-14' }"
          >
            <template #title>
              <span v-html="page?.businessSizes?.title" />
            </template>
            <template #description>
              <span v-html="page?.businessSizes?.description" />
            </template>
            <UPageGrid :ui="{ base: 'relative grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8' }">
              <UPageCard
                v-for="(item, index) of page?.businessSizes?.cards"
                :key="index"
                v-bind="item"
              />
            </UPageGrid>
          </UPageCTA>

          <UPageHero>
            <template #title>
              <div class="flex justify-center mb-4">
                <SvgoBusinessTeamwork
                  :font-controlled="false"
                  filled
                  class="h-24"
                />
              </div>
              <div class="flex justify-center">
                <span v-html="page?.teamwork?.title" />
              </div>
            </template>
            <template #description>
              <div
                class="max-w-4xl"
                v-html="page?.teamwork?.description"
              />
            </template>
          </UPageHero>

          <div>
            <UContainer class="max-w-4xl">
              <div class="h-[18px] w-0.5 bg-gray-200 dark:bg-gray-800 inset-x-0 rounded-t-full" />

              <div
                v-for="(item, index) in page?.timeline"
                :key="`timeline-${index}`"
                class="relative py-3 min-h-[24px] flex items-center justify-center"
              >
                <div class="h-full w-0.5 bg-gray-200 dark:bg-gray-800 absolute top-0 inset-x-0 -ml-[1px] flex-shrink-0" />

                <div
                  class="flex items-start gap-8 relative w-full translate-x-0 -ml-2 mt-14"
                >
                  <div
                    class="h-8 w-8 -ml-3 -mt-1 bg-primary-400 dark:bg-primary-400 rounded-full z-[1] ring-2 ring-gray-300 dark:ring-gray-600 flex-shrink-0 flex justify-center items-center text-black font-bold"
                  >
                    {{ Number(index) + 1 }}
                  </div>
                  <div>
                    <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4 -mt-2">
                      <span v-html="item.title" />
                    </h2>
                    <div
                      class="prose prose-primary dark:prose-invert max-w-none"
                      v-html="item.description"
                    />
                    <UPageGrid
                      v-if="item.features"
                      :ui="{ base: 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-8' }"
                    >
                      <UPageCard
                        v-for="(feature, featureIndex) of item.features"
                        :key="`feature-${index}-${featureIndex}`"
                        v-bind="feature"
                      />
                    </UPageGrid>
                  </div>
                </div>
              </div>

              <div class="h-[46px] w-0.5 bg-gray-200 dark:bg-gray-800 inset-x-0 rounded-b-full" />
              <div class="h-8 w-8 -ml-3.5 -mt-1 bg-primary-400 rounded-full ring-2 ring-gray-300 dark:ring-gray-600 flex justify-center items-center text-black font-bold">
                <UIcon
                  name="i-heroicons-rocket-launch-solid"
                  class="w-5 h-5 z-10"
                />
              </div>
            </UContainer>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
    <div class="bg-primary/5 dark:bg-feature/65">
      <UPageSection
        :title="page?.faq?.title"
        :description="page?.faq?.description"
        :ui="{ title: 'text-3xl sm:text-4xl', description: 'text-base sm:text-lg mt-4' }"
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
              class="prose prose-primary dark:prose-invert max-w-none text-gray-500 dark:text-gray-400"
              v-html="item.content"
            />
          </template>
        </UAccordion>
      </UPageSection>
    </div>
  </div>
</template>

<style scoped lang="postcss">
</style>
