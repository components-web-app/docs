<script setup lang="ts">
import type { Link } from '~~/quiz/schema'

// One read-more link. A component of its own because a link with a dynamic `to` inside a v-for
// makes vue-tsc lose the loop variable (see CLAUDE.md).
const props = defineProps<{
  link: Link
}>()

const external = computed(() => /^https?:\/\//.test(props.link.to))
const github = computed(() => props.link.to.startsWith('https://github.com/'))
</script>

<template>
  <UButton
    :to="link.to"
    :target="external ? '_blank' : undefined"
    :label="link.label"
    :trailing-icon="external ? 'i-heroicons-arrow-top-right-on-square' : 'i-heroicons-arrow-right'"
    :leading-icon="github ? 'i-simple-icons-github' : 'i-heroicons-book-open'"
    color="neutral"
    variant="link"
    class="px-0 text-left"
    :ui="{ label: 'whitespace-normal [overflow-wrap:anywhere]' }"
  />
</template>
