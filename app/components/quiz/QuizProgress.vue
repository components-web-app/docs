<script setup lang="ts">
const props = defineProps<{
  /** 0-based index of the current question. */
  index: number
  total: number
  /** Questions answered so far. */
  answered: number
}>()

const value = computed(() => props.total ? Math.round((props.answered / props.total) * 100) : 0)
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="shrink-0 text-sm font-medium text-muted tabular-nums">
      Question {{ index + 1 }} of {{ total }}
    </span>
    <UProgress
      :model-value="value"
      size="sm"
      class="flex-1"
      :aria-label="`${answered} of ${total} answered`"
    />
  </div>
</template>
