<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

// After mount we know the real breakpoint; before mount (SSR) we assume desktop
// so the server renders the top sections open — correct for the majority of docs readers.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

// Key only changes when we need to force a remount: mobile client closing the top sections.
// Desktop: key stays 'open' (no remount, no flash).
// Mobile: key changes to 'mobile' on mount, triggering remount with defaultOpen: false.
const topNavKey = computed(() => (!mounted.value || isDesktop.value) ? 'open' : 'mobile')
const topNavDefaultOpen = computed(() => (!mounted.value || isDesktop.value) ? undefined : false)

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
          <UContentNavigation
            :key="topNavKey"
            :navigation="topNavigation"
            :default-open="topNavDefaultOpen"
          />
          <!-- defaultOpen: true uses isRouteInTree to open only the path to the current page -->
          <UContentNavigation
            :navigation="bottomNavigation"
            :default-open="true"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
