<script setup lang="ts">
import type { FooterLink } from '#ui-pro/types'

const { footer } = useAppConfig()

defineProps<{
  links: FooterLink[]
}>()

const { isVip } = useVip()

const footerClass = computed(() => {
  return isVip.value ? 'pb-20' : ''
})
</script>

<template>
  <UFooter :links="links">
    <template #left>
      {{ footer.credits }}
    </template>

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'gray', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
  <UFooter>
    <template #center>
      <div
        class="text-xs text-gray-500 dark:text-gray-400 text-center"
        :class="footerClass"
      >
        With thanks to
        <NuxtLink
          to="https://ui.nuxt.com/pro"
          target="_blank"
          class="hover:text-gray-600 dark:hover:text-gray-300 font-semibold"
        >
          Nuxt UI Pro
        </NuxtLink> for sponsoring our OSS project
      </div>
    </template>
  </UFooter>
</template>
