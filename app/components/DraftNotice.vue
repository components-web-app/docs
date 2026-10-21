<script setup lang="ts">
// A banner on the /draft/ pages: what the draft is, and links to the live pages it would replace.
defineProps<{
  current: string
  currentLabel: string
  also?: string
  alsoLabel?: string
}>()
</script>

<template>
  <div class="border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-sm">
    <UIcon
      name="i-heroicons-pencil-square"
      class="mr-1 size-4 align-[-3px] text-warning"
    />
    Draft for review, not linked from the site. Compare with the live
    <NuxtLink
      :to="current"
      class="font-medium underline"
    >{{ currentLabel }}</NuxtLink><template v-if="also">
      and
      <NuxtLink
        :to="also"
        class="font-medium underline"
      >{{ alsoLabel }}</NuxtLink>
    </template> pages.
  </div>
</template>
