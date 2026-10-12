<script setup lang="ts">
import type { ComarkTree } from 'comark'

// Renders a code snippet that the server already highlighted (useHighlightedCode).
// If the tree is missing, it falls back to plain, unhighlighted markdown so the code
// still shows.
const props = defineProps<{
  code?: string
  trees?: Record<string, ComarkTree> | null
}>()

const tree = computed(() => props.code ? props.trees?.[props.code.trim()] : undefined)
</script>

<template>
  <ComarkRenderer
    v-if="tree"
    :tree="tree"
  />
  <Comark
    v-else-if="code"
    :markdown="code"
  />
</template>
