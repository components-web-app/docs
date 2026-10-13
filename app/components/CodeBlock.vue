<script setup lang="ts">
import type { MarkdownDocument } from 'comark'

// Renders a code snippet that the server already highlighted (useHighlightedCode).
// If the tree is missing, it falls back to plain, unhighlighted markdown so the code
// still shows.
const props = defineProps<{
  code?: string
  trees?: Record<string, MarkdownDocument> | null
}>()

const tree = computed(() => props.code ? props.trees?.[props.code.trim()] : undefined)
</script>

<template>
  <MarkdownDocument
    v-if="tree"
    :value="tree"
  />
  <Markdown
    v-else-if="code"
    :value="code"
  />
</template>
