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
        <!--
          position:fixed takes this sidebar completely out of document flow so it
          contributes zero height to the CSS Grid row — preventing the sidebar's
          max-h from forcing UMain to be 100vh-header tall on short-content pages.

          left/width use CSS max()/min()/calc() to align exactly with the grid's
          col-span-2 area inside the UContainer at all lg+ viewport widths:
            left  = max(lg:px-8, (100vw - --ui-container) / 2 + lg:px-8)
            width = col-span-2 of grid-cols-10 with gap-8
                  = (container-content-width - 9*gap) / 10 * 2 + gap
                  = (min(100vw, --ui-container) - 4rem - 9*2rem) / 10 * 2 + 2rem
                  = (min(100vw, --ui-container) - 12rem) / 5
        -->
        <div
          class="hidden lg:flex lg:flex-col fixed top-(--ui-header-height) bottom-0 overflow-y-auto py-8 px-4 bg-default z-10"
          style="left: max(2rem, calc((100vw - var(--ui-container)) / 2 + 2rem)); width: calc((min(100vw, var(--ui-container)) - 12rem) / 5);"
        >
          <UContentSearchButton size="md" :collapsed="false" />
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
        </div>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
