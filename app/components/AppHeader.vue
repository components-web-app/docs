<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const navigation = inject<NavItem[]>('navigation', [])

const { header } = useAppConfig()
</script>

<template>
  <UHeader>
    <template #logo>
      <div
        v-if="header?.logo?.dark || header?.logo?.light"
        class="flex items-center"
      >
        <UColorModeImage v-bind="{ class: 'h-6 w-auto', ...header?.logo }" />
        <UBadge
          label="Docs"
          variant="subtle"
          class="mb-0.5 ml-4"
        />
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
      v-if="header?.search"
      #center
    >
      <UContentSearchButton class="hidden lg:flex" />
    </template>

    <template #right>
      <UContentSearchButton
        v-if="header?.search"
        :label="null"
        class="lg:hidden"
      />

      <UColorModeButton v-if="header?.colorMode" />

      <template v-if="header?.links">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'gray', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" />
    </template>
  </UHeader>
</template>
