<script setup lang="ts">
import type { QuizGradeResult } from '~/composables/useQuizGrader'

/** Shown after each answer: right, wrong or not scored, the explanation, why it matters, and where to read more. */
const props = defineProps<{
  result: QuizGradeResult
}>()

const heading = useTemplateRef<HTMLElement>('heading')
defineExpose({ focus: () => heading.value?.focus() })

const state = computed(() => {
  if (props.result.status === 'ungraded') {
    return { title: 'Not scored', icon: 'i-heroicons-arrow-path', class: 'text-warning', box: 'border-warning/40 bg-warning/5' }
  }
  return props.result.correct
    ? { title: 'Correct', icon: 'i-heroicons-check-circle-solid', class: 'text-success', box: 'border-success/40 bg-success/5' }
    : { title: 'Not quite', icon: 'i-heroicons-x-circle-solid', class: 'text-error', box: 'border-error/40 bg-error/5' }
})
</script>

<template>
  <section
    class="rounded-lg border p-4"
    :class="state.box"
    aria-live="polite"
  >
    <h2
      ref="heading"
      tabindex="-1"
      class="flex items-center gap-2 text-lg font-semibold outline-none"
      :class="state.class"
    >
      <UIcon
        :name="state.icon"
        class="size-6"
        aria-hidden="true"
      />
      {{ state.title }}
    </h2>
    <p
      v-if="result.status === 'ungraded'"
      class="mt-2 text-sm text-muted"
    >
      This question changed while you were taking the quiz, so it isn't counted either way.
    </p>
    <div
      v-if="result.feedback"
      class="mt-2 text-default [&_p]:my-2"
    >
      <MarkdownDocument :value="result.feedback.explanation" />
    </div>
    <div
      v-if="result.feedback?.why"
      class="mt-3 flex gap-2 rounded-md bg-elevated/60 p-3 text-default"
    >
      <UIcon
        name="i-heroicons-light-bulb"
        class="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div class="[&_p]:my-0">
        <p class="font-semibold text-highlighted">
          Why it matters
        </p>
        <MarkdownDocument :value="result.feedback.why" />
      </div>
    </div>
    <ul
      v-if="result.key?.links?.length"
      class="mt-3 flex flex-col items-start gap-1"
    >
      <li
        v-for="(link, i) in result.key.links"
        :key="i"
      >
        <QuizReadLink :link="link" />
      </li>
    </ul>
  </section>
</template>
