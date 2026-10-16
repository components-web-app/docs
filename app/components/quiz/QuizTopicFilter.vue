<script setup lang="ts">
import type { AreaFilter, QuizConfig } from '~~/quiz/schema'

/**
 * "Everything" or one area. Counts are live families for the selected level. A topic with fewer
 * than `min` families is shown but can't be chosen yet.
 */
const props = defineProps<{
  areas: QuizConfig['areas']
  counts?: Partial<Record<AreaFilter, number>>
  min: number
}>()

const topic = defineModel<AreaFilter>({ required: true })

const items = computed(() => [
  { value: 'all' as AreaFilter, label: 'Everything' },
  ...props.areas.map(a => ({ value: a.id as AreaFilter, label: a.label }))
].map(item => ({
  ...item,
  label: props.counts ? `${item.label} (${props.counts[item.value] ?? 0})` : item.label,
  disabled: props.counts ? (props.counts[item.value] ?? 0) < (item.value === 'all' ? 1 : props.min) : false
})))
</script>

<template>
  <URadioGroup
    v-model="topic"
    legend="Topic"
    :items="items"
    orientation="horizontal"
    variant="card"
    indicator="hidden"
    :ui="{ fieldset: 'flex-wrap gap-2', item: 'py-1.5 px-3' }"
  />
</template>
