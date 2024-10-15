<script setup lang="ts">
const { data: page } = await useAsyncData('built-for-business', () => queryContent('/built-for-business').findOne())

useSeoMeta({
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
    <div class="bg-primary/5 dark:bg-feature/65">
      <UContainer>
        <UPageHero
          v-bind="page.hero"
        >
          <template #title>
            <MDC :value="page.hero.title" />
          </template>
          <template #description>
            <MDC :value="page.hero.description" />
          </template>
          <div class="flex justify-center">
            <NuxtImg
              src="/images/business/business-hero.svg"
              class="w-full max-w-[340px]"
              width="640"
              height="640"
            />
          </div>
        </UPageHero>
      </UContainer>
    </div>
    <UContainer>
      <UPage>
        <UPageBody>
          <UPageGrid :ui="{ wrapper: 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-3' }">
            <UPageCard
              v-for="(item, index) of page.pageCards.items"
              :key="index"
              v-bind="item"
            />
          </UPageGrid>

          <ULandingCTA
            card
            :ui="{ wrapper: 'mt-8 bg-primary/5 dark:bg-feature/65', body: { base: 'flex flex-col gap-10 sm:gap-y-14', padding: 'py-20 sm:py-28 sm:px-16' } }"
          >
            <template #title>
              <MDC :value="page.businessSizes.title" />
            </template>
            <template #description>
              <MDC :value="page.businessSizes.description" />
            </template>
            <UPageGrid :ui="{ wrapper: 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-3' }">
              <UPageCard
                v-for="(item, index) of page.businessSizes.cards"
                :key="index"
                v-bind="item"
              />
            </UPageGrid>
          </ULandingCTA>

          <UPageHero
            v-bind="page.teamwork"
          >
            <template #title>
              <div class="flex justify-center mb-4">
                <SvgoBusinessTeamwork
                  :font-controlled="false"
                  filled
                  class="h-24"
                />
              </div>
              <div class="flex justify-center">
                <MDC :value="page.teamwork.title" />
              </div>
            </template>
            <template #description>
              <div class="max-w-4xl">
                <MDC :value="page.teamwork.description" />
              </div>
            </template>
          </UPageHero>

          <div>
            <UContainer :ui="{ constrained: 'max-w-4xl' }">
              <div class="h-[18px] w-0.5 bg-gray-200 dark:bg-gray-800 inset-x-0 rounded-t-full" />

              <div
                v-for="(item, index) in page.timeline"
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
                    {{ index+1 }}
                  </div>
                  <div>
                    <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4 -mt-2">
                      <MDC :value="item.title" />
                    </h2>
                    <MDC
                      class="prose prose-primary dark:prose-invert max-w-none"
                      :value="item.description"
                    />
                    <UPageGrid
                      v-if="item.features"
                      :ui="{ wrapper: 'mt-8 gap-4 xl:grid-cols-2' }"
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

<style scoped lang="postcss">
</style>
