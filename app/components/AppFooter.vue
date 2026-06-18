<script setup lang="ts">
const { footer } = useAppConfig()

const props = defineProps<{
  isVip?: boolean
  links?: { label?: string, icon?: string, to: string, target?: string }[]
}>()

const footerClass = computed(() => {
  return props.isVip ? 'pb-20' : ''
})
</script>

<template>
  <UFooter :class="footerClass">
    <template #left>
      {{ footer.credits }}
    </template>

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
