<script setup lang="ts">
import type { QuizConfig } from '~~/quiz/schema'
import type { QuizBest } from '~/composables/useQuizProgress'

/** One level on the start page. The page makes the cards a radiogroup; this only draws one. */
const props = defineProps<{
  level: QuizConfig['levels'][number]
  /** Live questions at this level for the chosen topic. */
  count: number
  selected: boolean
  passed: boolean
  best?: QuizBest
}>()

const LEVEL_ICONS: Record<string, string> = {
  beginner: 'i-heroicons-sparkles',
  intermediate: 'i-heroicons-puzzle-piece',
  advanced: 'i-heroicons-rocket-launch',
  expert: 'i-heroicons-cpu-chip'
}

const passMark = computed(() => `${Math.round(props.level.passMark * 100)}%`)
</script>

<template>
  <div
    class="group relative flex h-full flex-col gap-3 rounded-xl border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
    :class="selected ? 'border-primary bg-primary/10' : 'border-default bg-default hover:border-accented hover:bg-elevated/50 cursor-pointer'"
  >
    <div class="flex items-start justify-between gap-2">
      <span
        class="flex size-10 items-center justify-center rounded-lg"
        :class="selected ? 'bg-primary text-inverted' : 'bg-elevated text-primary'"
        aria-hidden="true"
      >
        <UIcon
          :name="LEVEL_ICONS[level.id] || 'i-heroicons-academic-cap'"
          class="size-6"
        />
      </span>
      <UBadge
        v-if="passed"
        label="Passed"
        color="success"
        variant="subtle"
        icon="i-heroicons-check-badge-solid"
      />
    </div>
    <div>
      <h3 class="text-lg font-semibold text-highlighted">
        {{ level.title }}
      </h3>
      <p class="mt-1 text-sm text-muted">
        {{ level.blurb }}
      </p>
    </div>
    <p class="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-dimmed">
      <span>Pass mark {{ passMark }}</span>
      <span>{{ count }} {{ count === 1 ? 'question' : 'questions' }} in the bank</span>
      <span v-if="best">Best {{ best.score }}/{{ best.total }}</span>
    </p>
  </div>
</template>
