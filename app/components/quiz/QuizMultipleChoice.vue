<script setup lang="ts">
import type { MarkdownDocument } from 'comark'
import type { RenderedOption } from '~~/quiz/lib/render'

/**
 * The options of a multiple-choice question as a radiogroup: full-width rows with a roving tabindex.
 * Up and Down move, Home and End jump, Space or Enter selects. After grading, `marks` puts an icon
 * on the chosen and the correct option, and the note for a wrong pick shows under it.
 */
const props = defineProps<{
  options: RenderedOption[]
  modelValue?: string
  labelledby?: string
  marks?: {
    chosen?: string
    correct?: string
    notes?: Record<string, MarkdownDocument>
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [optionId: string]
}>()

const LETTERS = 'ABCDEFGHIJ'
const interactive = computed(() => !props.marks)
const focused = ref<string>()
const tabStop = computed(() => focused.value ?? props.modelValue ?? props.options[0]?.id)
const rows = useTemplateRef<HTMLElement[]>('rows')

function focusOption(id: string) {
  focused.value = id
  rows.value?.find(el => el.dataset.option === id)?.focus()
}

function select(id: string) {
  if (!interactive.value) {
    return
  }
  focused.value = id
  emit('update:modelValue', id)
}

function onKeydown(event: KeyboardEvent, id: string) {
  if (!interactive.value) {
    return
  }
  const ids = props.options.map(o => o.id)
  const at = ids.indexOf(id)
  let target: string | undefined
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      target = ids[Math.min(at + 1, ids.length - 1)]
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      target = ids[Math.max(at - 1, 0)]
      break
    case 'Home':
      target = ids[0]
      break
    case 'End':
      target = ids[ids.length - 1]
      break
    case ' ':
    case 'Enter':
      event.preventDefault()
      select(id)
      return
    default:
      return
  }
  event.preventDefault()
  if (target) {
    focusOption(target)
  }
}

function markOf(id: string): 'correct' | 'wrong' | 'missed' | undefined {
  const marks = props.marks
  if (!marks) {
    return undefined
  }
  if (marks.chosen === id) {
    return marks.correct === id ? 'correct' : 'wrong'
  }
  return marks.correct === id ? 'missed' : undefined
}

function rowClass(id: string) {
  const mark = markOf(id)
  if (mark === 'correct' || mark === 'missed') {
    return 'border-success bg-success/10'
  }
  if (mark === 'wrong') {
    return 'border-error bg-error/10'
  }
  if (!interactive.value) {
    return 'border-default opacity-75'
  }
  return props.modelValue === id
    ? 'border-primary bg-primary/10 cursor-pointer'
    : 'border-default hover:border-accented hover:bg-elevated/50 cursor-pointer'
}

const MARK_ICONS = {
  correct: 'i-heroicons-check-circle-solid',
  missed: 'i-heroicons-check-circle',
  wrong: 'i-heroicons-x-circle-solid'
} as const

const MARK_LABELS = {
  correct: 'Your answer, correct',
  missed: 'The correct answer',
  wrong: 'Your answer, wrong'
} as const
</script>

<template>
  <div
    role="radiogroup"
    :aria-labelledby="labelledby"
    class="flex flex-col gap-2"
  >
    <div
      v-for="(option, i) in options"
      :key="option.id"
      ref="rows"
      :data-option="option.id"
      role="radio"
      :aria-checked="modelValue === option.id"
      :aria-disabled="interactive ? undefined : true"
      :tabindex="interactive ? (option.id === tabStop ? 0 : -1) : undefined"
      class="rounded-lg border px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :class="rowClass(option.id)"
      @click="select(option.id)"
      @keydown="onKeydown($event, option.id)"
      @focus="focused = option.id"
    >
      <div class="flex items-start gap-3">
        <span
          class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
          :class="modelValue === option.id || markOf(option.id) ? 'border-current' : 'border-accented text-muted'"
          aria-hidden="true"
        >{{ LETTERS[i] }}</span>
        <div class="min-w-0 flex-1 [&_code]:break-words">
          <MarkdownDocument :value="option.text" />
        </div>
        <span
          v-if="markOf(option.id)"
          class="sr-only"
        >{{ MARK_LABELS[markOf(option.id)!] }}</span>
        <UIcon
          v-if="markOf(option.id)"
          :name="MARK_ICONS[markOf(option.id)!]"
          class="mt-0.5 size-5 shrink-0"
          :class="markOf(option.id) === 'wrong' ? 'text-error' : 'text-success'"
          aria-hidden="true"
        />
      </div>
      <div
        v-if="markOf(option.id) === 'wrong' && marks?.notes?.[option.id]"
        class="mt-2 pl-9 text-sm text-muted [&_p]:my-0"
      >
        <MarkdownDocument :value="marks.notes[option.id]!" />
      </div>
    </div>
  </div>
</template>
