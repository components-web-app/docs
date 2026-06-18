<script setup lang="ts">
import BuildComponentFrontEndScreenshot from '~/components/home/BuildComponentFrontEndScreenshot.vue'
import highlight, { getHighlighter } from '@comark/nuxt/plugins/highlight'
import { transformerNotationFocus, transformerNotationHighlight } from '@shikijs/transformers'
import php from '@shikijs/langs/php'
import vue from '@shikijs/langs/vue'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = useNuxtData<any>('home')

const highlightOptions = {
  registerDefaultLanguages: false,
  languages: [php, vue],
  registerDefaultThemes: false,
  themes: { light: githubLight, dark: githubDark },
  transformers: [transformerNotationFocus(), transformerNotationHighlight()]
}
const highlightPlugin = highlight(highlightOptions)
const highlighterReady = ref(false)

onMounted(async () => {
  await getHighlighter(highlightOptions)
  highlighterReady.value = true
})

const selectedFrontEndIndex = ref(0)
const selectedFrontEnd = computed(() => page.value?.code?.frontEnd?.tabs?.[selectedFrontEndIndex.value])

function onFrontEndChange(index: number) {
  selectedFrontEndIndex.value = index
}

const currentCodeBlock = computed(() => {
  return (key: string) => key === 'back-end' ? page.value?.code?.backEnd?.code : selectedFrontEnd.value?.code
})

const codeTabsUI = {
  list: 'h-16 p-2',
  indicator: 'h-12 inset-y-2 bg-white dark:bg-zinc-900',
  trigger: 'transition-color text-lg px-6 font-semibold text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:text-gray-800 data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400'
}

const frontEndTabsUI = {
  list: 'h-10 p-2 px-1 bg-primary-100 dark:bg-primary-800',
  indicator: 'bg-white dark:bg-zinc-900/70 h-8',
  trigger: 'text-base data-[state=inactive]:text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=inactive]:text-zinc-400 dark:data-[state=active]:text-white font-semibold'
}
</script>

<template>
  <div class="bg-primary/5 dark:bg-feature/65">
    <UPageSection
      :ui="{ container: 'py-16 sm:py-32 lg:py-32 gap-6 sm:gap-y-10 flex flex-col' }"
    >
      <template #title>
        Simply build individual UI components;<br><span class="text-primary-400">we do the rest</span>
      </template>

      <UTabs
        :items="page?.code?.tabs"
        class="w-full"
        :ui="codeTabsUI"
      >
        <template #content="{ item }">
          <UPageSection
            orientation="horizontal"
            :ui="{ container: 'sm:px-6 lg:px-6 py-0 sm:py-4 lg:py-4 gap-16 sm:gap-y-24 flex flex-col grid lg:grid-cols-2 lg:items-start' }"
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
                  :ui="frontEndTabsUI"
                />
              </div>
              <div
                class="font-semibold"
              >
                <Comark>{{ item.key === 'back-end' ? page?.code?.backEnd?.description : selectedFrontEnd?.description }}</Comark>
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
              <ClientOnly>
                <Comark
                  v-if="highlighterReady"
                  :plugins="[highlightPlugin]"
                  class="nowrap overflow-auto w-full max-w-full"
                >
                  {{ currentCodeBlock(item.key) }}
                </Comark>
              </ClientOnly>
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
