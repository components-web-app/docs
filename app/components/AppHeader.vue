<script setup lang="ts">
// import type { NavItem } from '@nuxt/content'

// const navigation = inject<NavItem[]>('navigation', [])
import type { HeaderLink } from '#ui-pro/types'

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

defineProps<{
  links: HeaderLink[]
}>()

const { header } = useAppConfig()

provide('navigation', navigation)
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <div
        v-if="header?.logo?.dark || header?.logo?.light"
        class="flex items-center"
      >
        <UColorModeImage v-bind="{ class: 'h-6 w-auto', ...header?.logo }" />
      </div>
      <template v-else>
        CWA <UBadge
          label="Docs"
          variant="subtle"
          class="mb-0.5"
        />
      </template>
    </template>

    <template
      v-if="!['/', '/about', '/built-for-business'].includes($route.path)"
      #panel
    >
      <LazyUContentSearchButton
        size="md"
        class="mb-4 w-full"
      />
      <LazyUNavigationTree
        :links="mapContentNavigation(navigation!)"
        default-open
        :multiple="false"
      />
    </template>

    <template #right>
      <UContentSearchButton
        v-if="header?.search"
        :label="null"
        class="lg:hidden"
      />

      <UColorModeToggle v-if="header?.colorMode" />

      <div v-if="header?.links" class="pl-3 ml-1 border-l border-black/30 dark:border-white/30">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'gray', variant: 'ghost', ...link }"
        />
      </div>

      <div class="text-center pl-3 py-1.5 ml-1 border-l border-black/30 dark:border-white/30">
        <NuxtLink to="https://silverbackwebapps.com" target="_blank">
          <SvgoLogoSwa :font-controlled="false" class="h-6" />
        </NuxtLink>
      </div>
    </template>
  </UHeader>
</template>
