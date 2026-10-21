<script setup lang="ts">
import { AREAS, LEVELS, QUIZ_SETS, quizLengthFor, setConfigFor, WHATS_NEW, type AreaFilter, type Level, type QuizSet } from '~~/quiz/core'
import { newSeed, SEED_PATTERN } from '~~/quiz/lib/select'
import type { QuizChoice } from '~/composables/useQuiz'

/**
 * /quiz/play?level=advanced&topic=all&seed=k3j9x2ab, or level=whats-new for the latest releases
 *
 * The URL holds the level, topic and seed only, never answers or a score, so it is the share link.
 * The page is a prerendered shell: everything that depends on the query runs after mount, so the
 * HTML and the first client render always match.
 */
const { data: manifest } = await useQuizManifest()

useSeoMeta({
  title: 'Quiz',
  description: 'A short CWA quiz.',
  robots: 'noindex'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { recordOutcome, wasStarted, markStarted } = useQuizProgress()

const source = createStaticQuizSource()
const graders = new Map<QuizSet, ReturnType<typeof createLocalGrader>>()
function graderFor(level: QuizSet) {
  let grader = graders.get(level)
  if (!grader) {
    grader = createLocalGrader(level)
    graders.set(level, grader)
  }
  return grader
}

// The grader is chosen per level; the quiz always grades through whichever is current.
const currentLevel = ref<QuizSet>('beginner')
const quiz = useQuiz(source, { grade: answer => graderFor(currentLevel.value).grade(answer) })

const mounted = ref(false)
const invalidLevel = ref(false)
const passRecorded = ref(false)
/** False when this browser answered this exact quiz before, such as after a reload. */
const firstAttempt = ref(true)
const quizKey = (s: { level: QuizSet, topic: AreaFilter, seed: string }) => `${s.level}|${s.topic}|${s.seed}`

const settings = computed(() => quiz.settings.value)
const levelConfig = computed(() => manifest.value && settings.value ? setConfigFor(manifest.value.config, settings.value.level) : undefined)
// The area the current question is about. Its finer tags stay hidden until it's answered: they can give the answer away.
const questionArea = computed(() => {
  const area = quiz.current.value?.area
  return area ? manifest.value?.config.areas.find(a => a.id === area)?.label ?? area : undefined
})
const topicLabel = computed(() => {
  const topic = settings.value?.topic
  return !topic || topic === 'all' ? 'Everything' : manifest.value?.config.areas.find(a => a.id === topic)?.label ?? topic
})
const nextLevel = computed<Level | undefined>(() => {
  const level = settings.value?.level
  // What's new has no next level.
  return level && level !== WHATS_NEW ? LEVELS[LEVELS.indexOf(level) + 1] : undefined
})

function readQuery() {
  const level = String(route.query.level ?? '')
  const topic = String(route.query.topic ?? 'all')
  const seed = String(route.query.seed ?? '')
  return {
    level: (QUIZ_SETS as readonly string[]).includes(level) ? level as QuizSet : undefined,
    // What's new is one short quiz across every topic.
    topic: (level !== WHATS_NEW && (topic === 'all' || (AREAS as readonly string[]).includes(topic)) ? topic : 'all') as AreaFilter,
    seed: SEED_PATTERN.test(seed) ? seed : undefined
  }
}

async function startFromQuery() {
  const { level, topic, seed } = readQuery()
  if (!level) {
    invalidLevel.value = true
    return
  }
  invalidLevel.value = false
  if (!seed) {
    // A missing or invalid seed gets a new one; the watcher below starts the quiz.
    await router.replace({ query: { ...route.query, level, topic, seed: newSeed() } })
    return
  }
  passRecorded.value = false
  firstAttempt.value = !wasStarted(quizKey({ level, topic, seed }))
  currentLevel.value = level
  await quiz.start({ level, topic, seed, length: manifest.value ? quizLengthFor(manifest.value.config, level) : 10 })
  focusQuestion()
}

onMounted(() => {
  mounted.value = true
  startFromQuery()
})

watch(() => route.fullPath, () => {
  if (mounted.value && route.path === '/quiz/play') {
    startFromQuery()
  }
})

// Focus follows the quiz, so keyboard and screen reader users land on what changed.
const promptHeading = useTemplateRef<HTMLElement>('promptHeading')
const feedback = useTemplateRef<{ focus: () => void }>('feedback')
const result = useTemplateRef<{ focus: () => void }>('result')

function focusQuestion() {
  nextTick(() => promptHeading.value?.focus())
}

const selectedOption = computed({
  get: () => quiz.choice.value && 'optionId' in quiz.choice.value ? quiz.choice.value.optionId : undefined,
  set: (optionId?: string) => optionId && quiz.choose({ optionId })
})
const selectedOptions = computed({
  get: () => quiz.choice.value && 'optionIds' in quiz.choice.value ? quiz.choice.value.optionIds : [],
  set: (optionIds: string[]) => quiz.choose({ optionIds })
})
const selectedLine = computed({
  get: () => quiz.choice.value && 'line' in quiz.choice.value ? quiz.choice.value.line : undefined,
  set: (line?: number) => line && quiz.choose({ line })
})

async function check() {
  await quiz.check()
  if (quiz.records.value.length === 1 && settings.value) {
    markStarted(quizKey(settings.value))
  }
  if (quiz.phase.value === 'answered') {
    nextTick(() => feedback.value?.focus())
  }
}

function next() {
  quiz.next()
  if (quiz.phase.value === 'question') {
    focusQuestion()
  }
}

const summary = computed(() => summariseQuiz(quiz.records.value))

watch(quiz.phase, (phase) => {
  const s = settings.value
  const level = levelConfig.value
  if (phase !== 'result' || !s || !level) {
    return
  }
  const sum = summary.value
  passRecorded.value = recordOutcome({
    level: s.level,
    topic: s.topic,
    score: sum.correct,
    total: sum.graded,
    reachedPassMark: sum.graded > 0 && sum.share >= level.passMark,
    counts: firstAttempt.value && s.topic === 'all' && quiz.shortBy.value === 0 && sum.ungraded === 0
  })
  nextTick(() => result.value?.focus())
})

/** What the chosen answer was, for marking the question after grading. */
function chosenOption(choice: QuizChoice) {
  return 'optionId' in choice ? choice.optionId : undefined
}
function chosenOptions(choice: QuizChoice) {
  return 'optionIds' in choice ? choice.optionIds : []
}
function chosenLine(choice: QuizChoice) {
  return 'line' in choice ? choice.line : undefined
}

const record = computed(() => quiz.currentRecord.value)
const correct = computed(() => record.value?.result.key?.correct)

const optionMarks = computed(() => {
  const r = record.value
  if (!r) {
    return undefined
  }
  return {
    chosen: chosenOption(r.choice),
    correct: correct.value && 'optionId' in correct.value ? correct.value.optionId : undefined,
    notes: r.result.feedback?.optionNotes
  }
})

const manyMarks = computed(() => {
  const r = record.value
  if (!r) {
    return undefined
  }
  return {
    chosen: chosenOptions(r.choice),
    correct: correct.value && 'optionIds' in correct.value ? correct.value.optionIds : [],
    notes: r.result.feedback?.optionNotes
  }
})

const lineMarks = computed(() => {
  const r = record.value
  if (!r) {
    return undefined
  }
  return {
    chosen: chosenLine(r.choice),
    correct: correct.value && 'lines' in correct.value ? correct.value.lines : [],
    fix: r.result.key?.fix,
    mistake: r.question.type === 'spot-the-mistake'
  }
})

const TYPE_HINTS = {
  'multiple-choice': 'Choose one answer.',
  'select-many': 'Choose every answer that\'s right. It counts only if you choose all of them and nothing else.',
  'pick-the-line': 'Click a line, or use the arrow keys and Space.',
  'spot-the-mistake': 'Click the wrong line, or use the arrow keys and Space.'
} as const

function restart(level?: Level) {
  const s = settings.value
  if (!s) {
    return
  }
  router.push({ query: { level: level ?? s.level, topic: level ? 'all' : s.topic, seed: newSeed() } })
}

async function share() {
  const url = window.location.href
  const text = settings.value?.level === WHATS_NEW ? 'Try this CWA quiz on what\'s new' : `Try this CWA quiz: ${levelConfig.value?.title ?? ''} level`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'CWA quiz', text, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast.add({ title: 'Link copied', description: 'Anyone with the link gets the same questions.', icon: 'i-heroicons-clipboard-document-check' })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return
    }
    toast.add({ title: 'Couldn\'t share', description: url, color: 'warning' })
  }
}
</script>

<template>
  <UContainer class="max-w-3xl py-8 sm:py-12">
    <!-- Prerendered and first client render: nothing depends on the query yet -->
    <div
      v-if="!mounted || quiz.phase.value === 'loading'"
      class="flex flex-col gap-4"
      aria-busy="true"
    >
      <USkeleton class="h-4 w-1/3" />
      <USkeleton class="h-8 w-full" />
      <USkeleton class="h-40 w-full" />
      <span class="sr-only">Loading the quiz</span>
    </div>

    <UAlert
      v-else-if="invalidLevel"
      title="Pick a level first"
      description="This link doesn't name a quiz level."
      color="warning"
      variant="subtle"
      icon="i-heroicons-exclamation-triangle"
      :actions="[{ label: 'Choose a level', to: '/quiz' }]"
    />

    <UAlert
      v-else-if="quiz.phase.value === 'error'"
      title="The quiz couldn't load"
      :description="quiz.error.value"
      color="error"
      variant="subtle"
      icon="i-heroicons-exclamation-circle"
      :actions="[{ label: 'Try again', onClick: () => startFromQuery() }, { label: 'All levels', to: '/quiz', variant: 'ghost' }]"
    />

    <UAlert
      v-else-if="quiz.phase.value === 'empty'"
      title="No questions here yet"
      description="There are no questions for this level and topic so far."
      color="neutral"
      variant="subtle"
      icon="i-heroicons-inbox"
      :actions="[{ label: 'Choose another', to: '/quiz' }]"
    />

    <QuizResult
      v-else-if="quiz.phase.value === 'result' && manifest && levelConfig && settings"
      ref="result"
      :config="manifest.config"
      :level="levelConfig"
      :topic="settings.topic"
      :summary="summary"
      :short-by="quiz.shortBy.value"
      :pass-recorded="passRecorded"
      :first-attempt="firstAttempt"
      :records="quiz.records.value"
      :has-next-level="!!nextLevel"
      @again="restart()"
      @next-level="restart(nextLevel)"
      @share="share"
    />

    <div
      v-else-if="quiz.current.value"
      class="flex flex-col gap-6"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
          <UBadge
            :label="levelConfig?.title"
            variant="subtle"
          />
          <span>{{ topicLabel }}</span>
          <div class="ml-auto flex gap-1">
            <UButton
              label="Share"
              icon="i-heroicons-share"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="share"
            />
            <UButton
              label="Quit"
              to="/quiz"
              icon="i-heroicons-x-mark"
              size="xs"
              color="neutral"
              variant="ghost"
            />
          </div>
        </div>
        <QuizProgress
          :index="quiz.index.value"
          :total="quiz.questions.value.length"
          :answered="quiz.records.value.length"
        />
        <p
          v-if="quiz.shortBy.value > 0 && quiz.index.value === 0"
          class="text-sm text-muted"
        >
          {{ quiz.questions.value.length === 1 ? 'There is only 1 question' : `There are only ${quiz.questions.value.length} questions` }} for this level and topic so far.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <UBadge
          v-if="questionArea"
          :label="questionArea"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-heroicons-tag"
          class="self-start"
        />
        <div
          id="quiz-prompt"
          ref="promptHeading"
          tabindex="-1"
          class="text-lg font-semibold text-highlighted outline-none sm:text-xl [&_p]:my-0"
        >
          <MarkdownDocument :value="quiz.current.value.prompt" />
        </div>
        <p class="-mt-2 text-sm text-muted">
          {{ TYPE_HINTS[quiz.current.value.type] }}
        </p>

        <template v-if="quiz.current.value.type === 'multiple-choice'">
          <QuizCodeLines
            v-if="quiz.current.value.code"
            :code="quiz.current.value.code"
          />
          <QuizMultipleChoice
            v-if="quiz.current.value.options"
            v-model="selectedOption"
            :options="quiz.current.value.options"
            labelledby="quiz-prompt"
            :marks="optionMarks"
          />
        </template>
        <template v-else-if="quiz.current.value.type === 'select-many'">
          <QuizCodeLines
            v-if="quiz.current.value.code"
            :code="quiz.current.value.code"
          />
          <QuizSelectMany
            v-if="quiz.current.value.options"
            v-model="selectedOptions"
            :options="quiz.current.value.options"
            labelledby="quiz-prompt"
            :marks="manyMarks"
          />
        </template>
        <QuizCodeLines
          v-else-if="quiz.current.value.code"
          v-model="selectedLine"
          :code="quiz.current.value.code"
          selectable
          labelledby="quiz-prompt"
          :marks="lineMarks"
        />
      </div>

      <QuizFeedback
        v-if="record"
        ref="feedback"
        :result="record.result"
      />

      <div class="flex justify-end gap-3">
        <UButton
          v-if="quiz.phase.value === 'question'"
          label="Check answer"
          size="lg"
          :disabled="!quiz.choice.value || ('optionIds' in quiz.choice.value && !quiz.choice.value.optionIds.length)"
          :loading="quiz.grading.value"
          @click="check"
        />
        <UButton
          v-else
          :label="quiz.isLast.value ? 'See your result' : 'Next question'"
          size="lg"
          trailing-icon="i-heroicons-arrow-right"
          @click="next"
        />
      </div>
    </div>
  </UContainer>
</template>
