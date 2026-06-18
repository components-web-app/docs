<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

const EXPANDED_ON_DESKTOP = ['/getting-started', '/guides', '/core-concepts']

const mappedNavigation = computed<ContentNavigationItem[]>(() => {
  return navigation?.value?.map(item => {
    const alwaysOpenOnDesktop = EXPANDED_ON_DESKTOP.some(p => item.path?.startsWith(p))
    if (isDesktop.value && alwaysOpenOnDesktop) {
      return item
    }
    return { ...item, defaultOpen: false }
  }) ?? []
})
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <template #top>
            <UContentSearchButton size="md" :collapsed="false" />
          </template>
          <UContentNavigation :key="String(isDesktop)" :navigation="mappedNavigation" />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
