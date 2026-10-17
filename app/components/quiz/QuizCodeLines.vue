<script setup lang="ts">
import type { RenderedCode } from '~~/quiz/lib/render'

/**
 * A code block drawn one row per line, with line numbers. When `selectable`, the block is a
 * radiogroup and each non-blank line a radio with a roving tabindex: Up and Down move, Home and End
 * jump, Space or Enter selects. Only the block scrolls sideways, never the page.
 *
 * After grading, `marks` puts an icon (not only a colour) on the chosen and the correct lines, and
 * `fix` shows what the wrong line should say, under it.
 */
const props = defineProps<{
  code: RenderedCode
  selectable?: boolean
  /** The selected line, 1-based. */
  modelValue?: number
  /** The id of the element that labels the group (the prompt). */
  labelledby?: string
  marks?: {
    chosen?: number
    correct: number[]
    /** Spot-the-mistake: what the wrong line should say. */
    fix?: string
    /** Spot-the-mistake: `correct` is the wrong line, so it is marked as the mistake, not in green. */
    mistake?: boolean
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [line: number]
}>()

const lines = computed(() => props.code.lines.map((tokens, i) => {
  const text = tokens.map(t => t.text).join('')
  return { number: i + 1, tokens, text, blank: text.trim() === '' }
}))

const choosable = computed(() => lines.value.filter(l => !l.blank).map(l => l.number))
const interactive = computed(() => props.selectable && !props.marks)

const focused = ref<number>()
const tabStop = computed(() => {
  if (props.modelValue && choosable.value.includes(props.modelValue)) {
    return focused.value ?? props.modelValue
  }
  return focused.value ?? choosable.value[0]
})

const rows = useTemplateRef<HTMLElement[]>('rows')

function focusLine(line: number) {
  focused.value = line
  rows.value?.find(el => Number(el.dataset.line) === line)?.focus()
}

function select(line: number) {
  if (!interactive.value || !choosable.value.includes(line)) {
    return
  }
  focused.value = line
  emit('update:modelValue', line)
}

function onKeydown(event: KeyboardEvent, line: number) {
  if (!interactive.value) {
    return
  }
  const list = choosable.value
  const at = list.indexOf(line)
  let target: number | undefined
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      target = list[Math.min(at + 1, list.length - 1)]
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      target = list[Math.max(at - 1, 0)]
      break
    case 'Home':
      target = list[0]
      break
    case 'End':
      target = list[list.length - 1]
      break
    case ' ':
    case 'Enter':
      event.preventDefault()
      select(line)
      return
    default:
      return
  }
  event.preventDefault()
  if (target !== undefined) {
    focusLine(target)
  }
}

function markOf(line: number): 'correct' | 'wrong' | 'missed' | undefined {
  const marks = props.marks
  if (!marks) {
    return undefined
  }
  const isCorrect = marks.correct.includes(line)
  if (marks.chosen === line) {
    return isCorrect ? 'correct' : 'wrong'
  }
  return isCorrect ? 'missed' : undefined
}

function rowClass(line: { number: number, blank: boolean }) {
  const mark = markOf(line.number)
  if ((mark === 'correct' || mark === 'missed') && props.marks?.mistake) {
    return 'bg-warning/10 ring-1 ring-inset ring-warning/50'
  }
  if (mark === 'correct' || mark === 'missed') {
    return 'bg-success/10 ring-1 ring-inset ring-success/50'
  }
  if (mark === 'wrong') {
    return 'bg-error/10 ring-1 ring-inset ring-error/50'
  }
  if (interactive.value && !line.blank) {
    return props.modelValue === line.number
      ? 'bg-primary/15 ring-1 ring-inset ring-primary cursor-pointer'
      : 'hover:bg-elevated cursor-pointer'
  }
  return ''
}

const MARK_ICONS = {
  correct: 'i-heroicons-check-circle-solid',
  missed: 'i-heroicons-check-circle',
  wrong: 'i-heroicons-x-circle-solid'
} as const

const MARK_LABELS = {
  correct: 'your answer, correct',
  missed: 'the correct line',
  wrong: 'your answer, wrong'
} as const

const MISTAKE_LABELS = {
  correct: 'your answer, correct: the line with the mistake',
  missed: 'the line with the mistake',
  wrong: 'your answer, wrong'
} as const

function markIcon(line: number) {
  const mark = markOf(line)
  if (!mark) {
    return undefined
  }
  return props.marks?.mistake && mark === 'missed' ? 'i-heroicons-bug-ant' : MARK_ICONS[mark]
}

function markLabel(line: number) {
  const mark = markOf(line)
  if (!mark) {
    return ''
  }
  return ` (${(props.marks?.mistake ? MISTAKE_LABELS : MARK_LABELS)[mark]})`
}

function iconClass(line: number) {
  const mark = markOf(line)
  if (mark === 'wrong') {
    return 'text-error'
  }
  return props.marks?.mistake ? 'text-warning' : 'text-success'
}
</script>

<template>
  <div class="rounded-md border border-default bg-muted overflow-x-auto">
    <div
      :role="selectable ? 'radiogroup' : undefined"
      :aria-labelledby="selectable ? labelledby : undefined"
      class="min-w-max py-2 font-mono text-sm leading-6"
    >
      <template
        v-for="line in lines"
        :key="line.number"
      >
        <div
          ref="rows"
          :data-line="line.number"
          :role="selectable && !line.blank ? 'radio' : undefined"
          :aria-checked="selectable && !line.blank ? modelValue === line.number : undefined"
          :aria-disabled="selectable && !line.blank && !interactive ? true : undefined"
          :aria-label="selectable && !line.blank ? `Line ${line.number}: ${line.text.trim()}${markLabel(line.number)}` : undefined"
          :tabindex="interactive && !line.blank ? (line.number === tabStop ? 0 : -1) : undefined"
          class="flex items-stretch pr-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          :class="rowClass(line)"
          @click="select(line.number)"
          @keydown="onKeydown($event, line.number)"
          @focus="focused = line.number"
        >
          <span
            class="w-10 shrink-0 select-none pr-2 text-right text-dimmed"
            aria-hidden="true"
          >{{ line.number }}</span>
          <span
            class="flex w-6 shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <UIcon
              v-if="markIcon(line.number)"
              :name="markIcon(line.number)!"
              class="size-4"
              :class="iconClass(line.number)"
            />
          </span>
          <code
            class="shiki whitespace-pre"
            :aria-hidden="selectable && !line.blank ? true : undefined"
          ><span
            v-for="(token, t) in line.tokens"
            :key="t"
            :style="token.style"
          >{{ token.text }}</span></code>
        </div>
        <div
          v-if="marks?.fix && marks.correct.includes(line.number)"
          class="flex items-start gap-2 border-y border-success/30 bg-success/5 py-1 pl-16 pr-4 font-sans text-sm"
        >
          <span class="font-semibold text-success">Should be:</span>
          <code class="whitespace-pre font-mono">{{ marks.fix.trim() }}</code>
        </div>
      </template>
    </div>
  </div>
</template>
