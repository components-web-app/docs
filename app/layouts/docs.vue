<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <template #top>
            <UContentSearchButton size="md" :collapsed="false" />
          </template>
          <UContentNavigation :navigation="navigation" />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
