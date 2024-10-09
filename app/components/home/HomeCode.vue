<script setup lang="ts">
import BuildComponentFrontEndScreenshot from '~/components/home/BuildComponentFrontEndScreenshot.vue'

const { data: page } = await useAsyncData('home', () => queryContent('/').findOne())

const codeTabsUI = {
  list: {
    height: 'h-16',
    tab: {
      size: 'text-lg',
      height: 'h-12',
      padding: 'px-6',
      font: 'font-semibold',
      active: 'text-gray-900 dark:text-white',
      inactive: 'text-gray-500 dark:text-gray-400'
    }
  }
}

const frontEndTabsUI = {
  list: {
    height: 'h-10',
    background: 'bg-primary-100 dark:bg-primary-800',
    marker: {
      background: 'bg-white dark:bg-gray-900/70'
    },
    tab: {
      size: 'text-base',
      height: 'h-8',
      padding: 'px-6',
      font: 'font-semibold',
      active: 'text-gray-900 dark:text-white',
      inactive: 'text-gray-500 dark:text-gray-400'
    }
  }
}

const selectedFrontEnd = ref(page.value.code.frontEnd.tabs[0])
function onFrontEndChange(index: number) {
  selectedFrontEnd.value = page.value.code.frontEnd.tabs[index]
}

const currentCodeBlock = computed(() => {
  return (key: string) => key === 'back-end' ? page.value.code.backEnd.code : selectedFrontEnd.value.code
})
</script>

<template>
  <div class="bg-primary/5">
    <ULandingSection
      align="center"
      :ui="{ container: 'gap-6 sm:gap-y-10 flex flex-col' }"
    >
      <template #title>
        Simply build individual UI components;<br><span class="text-primary-400">we do the rest</span>
      </template>

      <UTabs
        :items="page.code.tabs"
        class="w-full"
        :ui="codeTabsUI"
      >
        <template #item="{ item }">
          <ULandingSection
            align="left"
            :ui="{ wrapper: 'py-8 sm:py-10', container: 'gap-16 sm:gap-y-24 flex flex-col grid lg:grid-cols-2 lg:items-start' }"
          >
            <template #description>
              <div v-if="item.key === 'front-end'">
                <BuildComponentFrontEndScreenshot :highlight="selectedFrontEnd.key" />
                <UTabs
                  :items="page.code.frontEnd.tabs"
                  class="w-full mb-6"
                  :ui="frontEndTabsUI"
                  @change="onFrontEndChange"
                />
              </div>
              <div
                class="font-semibold"
              >
                <MDC :value="item.key === 'back-end' ? page.code.backEnd.description : selectedFrontEnd.description" />
                <div class="text-primary opacity-40 flex justify-center items-center space-x-6 mt-10">
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
                class="prose nowrap prose-primary dark:prose-invert overflow-auto w-full max-w-full"
                :value="currentCodeBlock(item.key)"
              />
            </div>
          </ULandingSection>
        </template>
      </UTabs>
    </ULandingSection>
  </div>
</template>

<style lang="postcss">
.prose.nowrap pre {
  white-space: pre;
}
</style>
