<script setup lang="ts">
import type { AreaFilter, Link, QuizConfig, SetConfig } from '~~/quiz/schema'
import type { QuizRecord, QuizSummary } from '~/composables/useQuiz'

/**
 * The end of a quiz: score, rank title, pass or not, tags answered well, reading for the tags of
 * wrong answers, and a list of the answers with a link for each. Ungraded answers are left out of the
 * score and said so. An exam mode would leave out the answer list.
 */
const props = defineProps<{
  config: QuizConfig
  /** A level, or What's new. */
  level: SetConfig
  topic: AreaFilter
  summary: QuizSummary
  shortBy: number
  /** The pass was stored (a full quiz on Everything, every answer graded). */
  passRecorded: boolean
  /** False when this browser had answered this exact quiz before. */
  firstAttempt: boolean
  hasNextLevel: boolean
  records: QuizRecord[]
}>()

const emit = defineEmits<{
  again: []
  nextLevel: []
  share: []
}>()

const heading = useTemplateRef<HTMLElement>('heading')
defineExpose({ focus: () => heading.value?.focus() })

const percent = computed(() => Math.round(props.summary.share * 100))
const reached = computed(() => props.summary.graded > 0 && props.summary.share >= props.level.passMark)

const rank = computed(() => {
  const ranks = [...props.level.ranks].sort((a, b) => b.min - a.min)
  return ranks.find(r => props.summary.share >= r.min)?.title ?? ranks[ranks.length - 1]?.title
})

const tagLabel = (id: string) => props.config.tags.find(t => t.id === id)?.label ?? id

const readNext = computed<Link[]>(() => props.summary.weakTags
  .map(id => props.config.tags.find(t => t.id === id))
  .filter(t => !!t)
  .slice(0, 4)
  .map(t => ({ label: t.label, to: t.read.anchor ? `${t.read.page}#${t.read.anchor}` : t.read.page })))

/** Why a pass at this mark isn't stored as a pass of the level. */
const notCountedReason = computed(() => {
  if (!reached.value || props.passRecorded) {
    return undefined
  }
  if (!props.firstAttempt) {
    return 'A pass counts towards the level only on your first try at a quiz. Start a new one to count it.'
  }
  if (props.topic !== 'all') {
    return 'A pass counts towards the level only on Everything.'
  }
  if (props.shortBy > 0) {
    return 'A pass counts towards the level only on a full-length quiz.'
  }
  if (props.summary.ungraded > 0) {
    return 'A pass counts towards the level only when every answer is scored.'
  }
  return undefined
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="rounded-xl border border-default bg-elevated/40 p-6 text-center">
      <p class="text-sm font-medium uppercase tracking-wide text-muted">
        {{ level.title }} result
      </p>
      <h1
        ref="heading"
        tabindex="-1"
        class="mt-2 text-3xl font-bold text-highlighted outline-none sm:text-4xl"
      >
        {{ rank }}
      </h1>
      <p class="mt-3 text-5xl font-bold tabular-nums text-primary">
        {{ summary.correct }}<span class="text-2xl text-muted">/{{ summary.graded }}</span>
      </p>
      <p class="mt-1 text-sm text-muted">
        {{ percent }}% · pass mark {{ Math.round(level.passMark * 100) }}%
      </p>
      <div class="mt-4 flex justify-center">
        <UBadge
          v-if="reached"
          :label="passRecorded ? `${level.title} passed` : 'Pass mark reached'"
          color="success"
          variant="subtle"
          size="lg"
          icon="i-heroicons-check-badge-solid"
        />
        <UBadge
          v-else
          label="Not passed yet"
          color="neutral"
          variant="subtle"
          size="lg"
          icon="i-heroicons-arrow-trending-up"
        />
      </div>
      <p
        v-if="notCountedReason"
        class="mt-3 text-sm text-muted"
      >
        {{ notCountedReason }}
      </p>
      <p
        v-if="summary.ungraded"
        class="mt-3 text-sm text-warning"
      >
        {{ summary.ungraded }} {{ summary.ungraded === 1 ? 'answer wasn\'t' : 'answers weren\'t' }} scored, because
        {{ summary.ungraded === 1 ? 'its question' : 'their questions' }} changed while you were taking the quiz.
      </p>
    </div>

    <div
      v-if="summary.strongTags.length"
      class="flex flex-col gap-2"
    >
      <h2 class="font-semibold text-highlighted">
        You know these well
      </h2>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in summary.strongTags"
          :key="tag"
          :label="tagLabel(tag)"
          color="success"
          variant="soft"
        />
      </div>
    </div>

    <div
      v-if="readNext.length"
      class="flex flex-col gap-2"
    >
      <h2 class="font-semibold text-highlighted">
        Read next
      </h2>
      <ul class="flex flex-col items-start gap-1">
        <li
          v-for="link in readNext"
          :key="link.to"
        >
          <QuizReadLink :link="link" />
        </li>
      </ul>
    </div>

    <details
      v-if="records.length"
      class="group rounded-lg border border-default"
    >
      <summary class="flex cursor-pointer items-center gap-2 p-4 font-semibold text-highlighted">
        <UIcon
          name="i-heroicons-chevron-right"
          class="size-4 transition-transform group-open:rotate-90"
          aria-hidden="true"
        />
        Your answers
      </summary>
      <ol class="flex flex-col divide-y divide-default border-t border-default">
        <li
          v-for="(record, i) in records"
          :key="i"
          class="flex gap-3 p-4"
        >
          <UIcon
            :name="record.result.status === 'ungraded' ? 'i-heroicons-arrow-path' : record.result.correct ? 'i-heroicons-check-circle-solid' : 'i-heroicons-x-circle-solid'"
            class="mt-0.5 size-5 shrink-0"
            :class="record.result.status === 'ungraded' ? 'text-warning' : record.result.correct ? 'text-success' : 'text-error'"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <span class="sr-only">{{ record.result.status === 'ungraded' ? 'Not scored' : record.result.correct ? 'Correct' : 'Wrong' }}:</span>
            <div class="text-default [&_p]:my-0">
              <MarkdownDocument :value="record.question.prompt" />
            </div>
            <QuizReadLink
              v-if="record.result.key?.links?.[0]"
              :link="record.result.key.links[0]"
            />
          </div>
        </li>
      </ol>
    </details>

    <div class="flex flex-wrap gap-3">
      <UButton
        v-if="hasNextLevel && reached"
        label="Try the next level"
        icon="i-heroicons-arrow-up-circle"
        size="lg"
        @click="emit('nextLevel')"
      />
      <UButton
        :label="level.id === 'whats-new' ? 'Try another' : 'Try this level again'"
        icon="i-heroicons-arrow-path"
        size="lg"
        :color="hasNextLevel && reached ? 'neutral' : 'primary'"
        :variant="hasNextLevel && reached ? 'outline' : 'solid'"
        @click="emit('again')"
      />
      <UButton
        v-if="hasNextLevel && !reached"
        label="Try the next level"
        icon="i-heroicons-arrow-up-circle"
        size="lg"
        color="neutral"
        variant="outline"
        @click="emit('nextLevel')"
      />
      <UButton
        label="Share this quiz"
        icon="i-heroicons-share"
        size="lg"
        color="neutral"
        variant="ghost"
        @click="emit('share')"
      />
      <UButton
        label="All levels"
        to="/quiz"
        icon="i-heroicons-squares-2x2"
        size="lg"
        color="neutral"
        variant="ghost"
      />
    </div>
  </section>
</template>
