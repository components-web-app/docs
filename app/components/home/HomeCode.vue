<script setup lang="ts">
import BuildComponentFrontEndScreenshot from '~/components/home/BuildComponentFrontEndScreenshot.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = await useAsyncData<any>('home', () => queryCollection('pages').path('/').first())

const selectedFrontEnd = ref(page.value?.code?.frontEnd?.tabs?.[0])
function onFrontEndChange(index: number) {
  selectedFrontEnd.value = page.value?.code?.frontEnd?.tabs?.[index]
}

const currentCodeBlock = computed(() => {
  return (key: string) => key === 'back-end' ? page.value?.code?.backEnd?.code : selectedFrontEnd.value?.code
})
</script>

<template>
  <div class="bg-primary/5 dark:bg-feature/65">
    <UPageSection
      align="center"
      :ui="{ container: 'gap-6 sm:gap-y-10 flex flex-col' }"
    >
      <template #title>
        Simply build individual UI components;<br><span class="text-primary-400">we do the rest</span>
      </template>

      <UTabs
        :items="page?.code?.tabs"
        class="w-full"
      >
        <template #content="{ item }">
          <UPageSection
            align="left"
            :ui="{ wrapper: 'py-0 sm:py-10', container: 'gap-16 sm:gap-y-24 flex flex-col grid lg:grid-cols-2 lg:items-start' }"
          >
            <template #description>
              <div v-if="item.key === 'front-end'">
                <div class="px-4 md:px-0">
                  <BuildComponentFrontEndScreenshot :highlight="selectedFrontEnd?.key" />
                </div>
                <UTabs
                  :items="page?.code?.frontEnd?.tabs"
                  class="mb-6 -mx-5 sm:mx-0"
                  @update:model-value="onFrontEndChange"
                />
              </div>
              <div
                class="font-semibold"
              >
                <MDC :value="item.key === 'back-end' ? page?.code?.backEnd?.description : selectedFrontEnd?.description" />
                <div class="text-primary opacity-60 flex justify-center items-center space-x-6 mt-10">
                  <template v-if="item.key === 'back-end'">
                    <div>
                      <SvgoLandingLogoApiPlatform
                        :font-controlled="false"
                        class="h-3 md:h-5"
                      />
                    </div>
                    <div>
                      <SvgoLandingLogoSymfony
                        :font-controlled="false"
                        class="h-6 md:h-8"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <div>
                      <SvgoLandingLogoNuxt
                        :font-controlled="false"
                        class="h-5 md:h-7"
                      />
                    </div>
                    <div>
                      <SvgoLandingLogoVuejs
                        :font-controlled="false"
                        class="h-7 md:h-9"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </template>
            <div
              class="flex justify-center max-w-full overflow-hidden"
            >
              <MDC
                class="prose prose-primary dark:prose-invert nowrap overflow-auto w-full max-w-full"
                :value="currentCodeBlock(item.key)"
              />
            </div>
          </UPageSection>
        </template>
      </UTabs>
    </UPageSection>
  </div>
</template>

<style lang="postcss">
.nowrap pre {
  white-space: pre;
}
</style>
