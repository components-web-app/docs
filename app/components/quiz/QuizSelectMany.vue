<script setup lang="ts">
import type { MarkdownDocument } from 'comark'
import type { RenderedOption } from '~~/quiz/lib/render'

/**
 * The options of a select-many question as a group of checkboxes: full-width rows with a roving
 * tabindex. Up and Down move, Home and End jump, Space or Enter ticks or unticks. After grading,
 * `marks` shows every option as right, wrong or missed, and the note for an option the reader got
 * wrong (a wrong one ticked, or a right one left out) shows under it.
 */
const props = defineProps<{
  options: RenderedOption[]
  modelValue?: string[]
  labelledby?: string
  marks?: {
    chosen: string[]
    correct: string[]
    notes?: Record<string, MarkdownDocument>
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [optionIds: string[]]
}>()

const LETTERS = 'ABCDEFGHIJ'
const interactive = computed(() => !props.marks)
const ticked = computed(() => new Set(props.marks?.chosen ?? props.modelValue ?? []))
const focused = ref<string>()
const tabStop = computed(() => focused.value ?? props.options[0]?.id)
const rows = useTemplateRef<HTMLElement[]>('rows')

function focusOption(id: string) {
  focused.value = id
  rows.value?.find(el => el.dataset.option === id)?.focus()
}

function toggle(id: string) {
  if (!interactive.value) {
    return
  }
  focused.value = id
  const next = new Set(props.modelValue ?? [])
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  // Keep the options' order, so the answer doesn't depend on the order they were ticked in.
  emit('update:modelValue', props.options.map(o => o.id).filter(o => next.has(o)))
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
      toggle(id)
      return
    default:
      return
  }
  event.preventDefault()
  if (target) {
    focusOption(target)
  }
}

function markOf(id: string): 'correct' | 'wrong' | 'missed' | 'left' | undefined {
  const marks = props.marks
  if (!marks) {
    return undefined
  }
  const right = marks.correct.includes(id)
  if (marks.chosen.includes(id)) {
    return right ? 'correct' : 'wrong'
  }
  return right ? 'missed' : 'left'
}

function rowClass(id: string) {
  const mark = markOf(id)
  if (mark === 'correct') {
    return 'border-success bg-success/10'
  }
  if (mark === 'missed') {
    return 'border-success border-dashed bg-success/5'
  }
  if (mark === 'wrong') {
    return 'border-error bg-error/10'
  }
  if (!interactive.value) {
    return 'border-default opacity-75'
  }
  return ticked.value.has(id)
    ? 'border-primary bg-primary/10 cursor-pointer'
    : 'border-default hover:border-accented hover:bg-elevated/50 cursor-pointer'
}

const MARK_ICONS = {
  correct: 'i-heroicons-check-circle-solid',
  missed: 'i-heroicons-check-circle',
  wrong: 'i-heroicons-x-circle-solid'
} as const

const MARK_LABELS = {
  correct: 'You chose this, and it is right',
  missed: 'Right, and you left it out',
  wrong: 'You chose this, and it is wrong',
  left: 'Wrong, and you left it out'
} as const

const showNote = (id: string) => {
  const mark = markOf(id)
  return (mark === 'wrong' || mark === 'missed') && !!props.marks?.notes?.[id]
}
</script>

<template>
  <div
    role="group"
    :aria-labelledby="labelledby"
    class="flex flex-col gap-2"
  >
    <div
      v-for="(option, i) in options"
      :key="option.id"
      ref="rows"
      :data-option="option.id"
      role="checkbox"
      :aria-checked="ticked.has(option.id)"
      :aria-disabled="interactive ? undefined : true"
      :tabindex="interactive ? (option.id === tabStop ? 0 : -1) : undefined"
      class="rounded-lg border px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :class="rowClass(option.id)"
      @click="toggle(option.id)"
      @keydown="onKeydown($event, option.id)"
      @focus="focused = option.id"
    >
      <div class="flex items-start gap-3">
        <span
          class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold"
          :class="ticked.has(option.id) ? 'border-current bg-current/10' : 'border-accented text-muted'"
          aria-hidden="true"
        >
          <UIcon
            v-if="ticked.has(option.id)"
            name="i-heroicons-check-20-solid"
            class="size-4"
          />
          <template v-else>{{ LETTERS[i] }}</template>
        </span>
        <div class="min-w-0 flex-1 [&_code]:break-words">
          <MarkdownDocument :value="option.text" />
        </div>
        <span
          v-if="markOf(option.id)"
          class="sr-only"
        >{{ MARK_LABELS[markOf(option.id)!] }}</span>
        <UIcon
          v-if="markOf(option.id) && markOf(option.id) !== 'left'"
          :name="MARK_ICONS[markOf(option.id) as keyof typeof MARK_ICONS]"
          class="mt-0.5 size-5 shrink-0"
          :class="markOf(option.id) === 'wrong' ? 'text-error' : 'text-success'"
          aria-hidden="true"
        />
      </div>
      <div
        v-if="showNote(option.id)"
        class="mt-2 pl-9 text-sm text-muted [&_p]:my-0"
      >
        <MarkdownDocument :value="marks!.notes![option.id]!" />
      </div>
    </div>
  </div>
</template>
