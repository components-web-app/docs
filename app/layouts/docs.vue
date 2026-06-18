<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

const ALWAYS_OPEN_ON_DESKTOP = ['/getting-started', '/guides', '/core-concepts']

const topNavigation = computed<ContentNavigationItem[]>(() =>
  navigation?.value?.filter(item =>
    ALWAYS_OPEN_ON_DESKTOP.some(p => item.path?.startsWith(p))
  ) ?? []
)

const bottomNavigation = computed<ContentNavigationItem[]>(() =>
  navigation?.value?.filter(item =>
    !ALWAYS_OPEN_ON_DESKTOP.some(p => item.path?.startsWith(p))
  ) ?? []
)
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <template #top>
            <UContentSearchButton size="md" :collapsed="false" />
          </template>
          <!-- Key forces remount after SSR hydration so desktop breakpoint is applied correctly -->
          <UContentNavigation
            :key="String(isDesktop)"
            :navigation="topNavigation"
            :default-open="isDesktop ? undefined : false"
          />
          <!-- Always collapsed — defaultOpen: false propagates to sub-menus via recursive render -->
          <UContentNavigation
            :navigation="bottomNavigation"
            :default-open="false"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
