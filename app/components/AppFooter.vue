<script setup lang="ts">
const { footer } = useAppConfig()

defineProps<{
  isVip?: boolean
  links?: { label?: string, icon?: string, to: string, target?: string }[]
}>()
</script>

<template>
  <UFooter>
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
  <div
    v-if="isVip"
    class="h-28"
  >
&nbsp;
  </div>
</template>
