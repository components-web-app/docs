<script setup lang="ts">
import BuildComponentFrontEndScreenshot from '~/components/home/BuildComponentFrontEndScreenshot.vue'

const { data } = await useAsyncData('landing', () => {
  return Promise.all([
    queryContent('/_partials/back-end').findOne(),
    queryContent('/_partials/front-end-page').findOne(),
    queryContent('/_partials/front-end-component').findOne(),
    queryContent('/_partials/front-end-admin').findOne()
  ])
})

const [backEnd, frontEndPage, frontEndComponent, frontEndAdmin] = data.value

const codeTabItems = [
  {
    key: 'back-end',
    label: '1. Back End'
  },
  {
    key: 'front-end',
    label: '2. Front End'
  }
]

type HighlightFrontEndType = 'component' | 'admin' | 'page'
const selectedFrontEnd = ref<HighlightFrontEndType>('page')

const frontEndItems: {
  key: HighlightFrontEndType
  label: string
}[] = [{ key: 'page', label: 'Page' }, { key: 'component', label: 'Component' }, { key: 'admin', label: 'Admin' }]

function onFrontEndChange(index) {
  selectedFrontEnd.value = frontEndItems[index].key
}
</script>

<template>
  <div class="bg-slate-800/10 mb-24">
    <ULandingSection
      align="center"
      :ui="{ container: 'gap-6 sm:gap-y-10 flex flex-col' }"
    >
      <template #title>
        Simply build individual UI components;<br><span class="text-primary-400">we do the rest</span>
      </template>
      <UTabs
        :items="codeTabItems"
        class="w-full"
        :ui="{ list: { height: 'h-16', tab: { size: 'text-lg', height: 'h-12', padding: 'px-6', font: 'font-semibold', active: 'text-gray-900 dark:text-white', inactive: 'text-gray-500 dark:text-gray-400' } } }"
      >
        <template #item="{ item }">
          <ULandingSection
            align="left"
            :ui="{}"
          >
            <template #description>
              <div v-if="item.key === 'front-end'">
                <BuildComponentFrontEndScreenshot :highlight="selectedFrontEnd" />
                <UTabs
                  :items="frontEndItems"
                  class="w-full"
                  :ui="{ list: { height: 'h-10', background: 'bg-primary-100 dark:bg-primary-800', marker: { background: 'bg-white dark:bg-primary-900' }, tab: { size: 'text-base', height: 'h-8', padding: 'px-6', font: 'font-semibold', active: 'text-gray-900 dark:text-white', inactive: 'text-gray-500 dark:text-gray-400' } } }"
                  @change="onFrontEndChange"
                />
              </div>
              Description goes here
            </template>
            <div
              v-if="item.key === 'back-end'"
              class="flex justify-center"
            >
              <div class="prose">
                <ContentRenderer :value="backEnd" />
              </div>
            </div>
            <div
              v-else
            >
              <div class="prose">
                <ContentRenderer :value="selectedFrontEnd === 'page' ? frontEndPage : (selectedFrontEnd === 'component' ? frontEndComponent : frontEndAdmin)" />
              </div>
            </div>
          </ULandingSection>
        </template>
      </UTabs>
    </ULandingSection>
  </div>
</template>
