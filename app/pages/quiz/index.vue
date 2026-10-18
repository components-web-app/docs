<script setup lang="ts">
import { LEVELS, WHATS_NEW, type AreaFilter, type Level } from '~~/quiz/core'
import { newSeed } from '~~/quiz/lib/select'

const { data: manifest } = await useQuizManifest()
if (!manifest.value) {
  throw createError({ statusCode: 500, statusMessage: 'The quiz could not be loaded', fatal: true })
}

const title = 'Quiz'
const description = 'How well do you know CWA? Pick a level and answer up to ten short questions about layouts, components, the Nuxt module, the API and deploying. Every answer explains itself and links to the docs.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs.satori', {
  title: 'How well do you know CWA?',
  description
})

const { progress, rememberChoice } = useQuizProgress()

const level = ref<Level>('beginner')
const topic = ref<AreaFilter>('all')

onMounted(() => {
  const last = progress.value.last
  if (last && last.level !== WHATS_NEW) {
    level.value = last.level
    topic.value = last.topic
  } else {
    // First visit: the first level that has questions yet.
    level.value = LEVELS.find(l => manifest.value?.counts[l]?.all) ?? 'beginner'
  }
})

const levels = computed(() => manifest.value?.config.levels ?? [])
const counts = computed(() => manifest.value?.counts[level.value])
const poolSize = computed(() => counts.value?.[topic.value] ?? 0)
const minTopicFamilies = computed(() => manifest.value?.config.minTopicFamilies ?? 8)
const someTopicsClosed = computed(() => manifest.value?.config.areas.some(a => (counts.value?.[a.id] ?? 0) < minTopicFamilies.value))

// A topic that isn't offered at the chosen level falls back to Everything.
watch(counts, (c) => {
  if (c && topic.value !== 'all' && (c[topic.value] ?? 0) < minTopicFamilies.value) {
    topic.value = 'all'
  }
})

// The level cards are one radiogroup with a roving tabindex.
const group = useTemplateRef<HTMLElement>('group')

function onCardKeydown(event: KeyboardEvent, id: Level) {
  const ids = levels.value.map(l => l.id)
  const at = ids.indexOf(id)
  let target: Level | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    target = ids[(at + 1) % ids.length]
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    target = ids[(at - 1 + ids.length) % ids.length]
  } else if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    level.value = id
    return
  }
  if (target) {
    event.preventDefault()
    level.value = target
    group.value?.querySelector<HTMLElement>(`[data-level="${target}"]`)?.focus()
  }
}

function start() {
  rememberChoice(level.value, topic.value)
  return navigateTo({ path: '/quiz/play', query: { level: level.value, topic: topic.value, seed: newSeed() } })
}

// What's new: questions from every level on the latest releases. Offered once it has enough families
// that two quizzes don't repeat each other.
const whatsNew = computed(() => manifest.value?.config.whatsNew)
const whatsNewFamilies = computed(() => manifest.value?.counts[WHATS_NEW]?.all ?? 0)
const whatsNewOpen = computed(() => !!whatsNew.value && whatsNewFamilies.value >= whatsNew.value.minFamilies)
const isDev = import.meta.dev

function startWhatsNew() {
  return navigateTo({ path: '/quiz/play', query: { level: WHATS_NEW, topic: 'all', seed: newSeed() } })
}

const QUESTION_TYPES = [
  { icon: 'i-heroicons-list-bullet', title: 'Multiple choice', text: 'One right answer, and wrong ones that sound right.' },
  { icon: 'i-heroicons-check-badge', title: 'Choose every right answer', text: 'More than one is right. Tick all of them, and only them.' },
  { icon: 'i-heroicons-cursor-arrow-rays', title: 'Pick the line', text: 'Real code from the docs. Click the line that does the job.' },
  { icon: 'i-heroicons-bug-ant', title: 'Spot the mistake', text: 'One line is wrong in a way the docs warn about. Find it.' }
]
</script>

<template>
  <UContainer class="max-w-5xl">
    <UPageHero
      title="How well do you know CWA?"
      description="Up to ten short questions, drawn at random from a bank, so each quiz is different. Every answer explains itself and links to the docs. Expert questions come straight from the source code."
      :ui="{ container: 'py-12 sm:py-16 lg:py-20' }"
    >
      <template #headline>
        <UBadge
          label="Quiz"
          variant="subtle"
          icon="i-heroicons-academic-cap"
        />
      </template>
    </UPageHero>

    <div class="grid gap-3 pb-10 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="type in QUESTION_TYPES"
        :key="type.title"
        class="flex gap-3 rounded-lg border border-default p-4"
      >
        <UIcon
          :name="type.icon"
          class="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div>
          <p class="font-semibold text-highlighted">
            {{ type.title }}
          </p>
          <p class="text-sm text-muted">
            {{ type.text }}
          </p>
        </div>
      </div>
    </div>

    <section
      aria-labelledby="quiz-level-heading"
      class="flex flex-col gap-4 pb-8"
    >
      <h2
        id="quiz-level-heading"
        class="text-xl font-semibold text-highlighted"
      >
        Pick a level
      </h2>
      <div
        ref="group"
        role="radiogroup"
        aria-labelledby="quiz-level-heading"
        class="grid gap-4 sm:grid-cols-2"
      >
        <QuizLevelCard
          v-for="item in levels"
          :key="item.id"
          :data-level="item.id"
          role="radio"
          :aria-checked="level === item.id"
          :tabindex="level === item.id ? 0 : -1"
          :level="item"
          :count="manifest?.counts[item.id]?.all ?? 0"
          :selected="level === item.id"
          :passed="progress.passed.includes(item.id)"
          :best="progress.best[item.id]"
          @click="level = item.id"
          @keydown="onCardKeydown($event, item.id)"
        />
      </div>
    </section>

    <section class="flex flex-col gap-6 pb-20">
      <QuizTopicFilter
        v-if="manifest"
        v-model="topic"
        :areas="manifest.config.areas"
        :counts="counts"
        :min="minTopicFamilies"
      />
      <p
        v-if="someTopicsClosed"
        class="-mt-4 text-sm text-muted"
      >
        A topic opens once it has {{ minTopicFamilies }} questions at the level, so its quiz doesn't repeat itself.
      </p>
      <div class="flex flex-wrap items-center gap-4">
        <UButton
          label="Start the quiz"
          size="xl"
          trailing-icon="i-heroicons-arrow-right"
          :disabled="!poolSize"
          @click="start"
        />
        <p
          v-if="!poolSize"
          class="text-sm text-muted"
        >
          No questions for this level and topic yet.
        </p>
      </div>
    </section>

    <section
      v-if="whatsNew && (whatsNewOpen || isDev)"
      aria-labelledby="quiz-whats-new-heading"
      class="-mt-8 pb-20"
    >
      <div class="flex flex-col gap-4 rounded-lg border border-primary/40 bg-primary/5 p-5 sm:flex-row sm:items-center">
        <UIcon
          name="i-heroicons-sparkles"
          class="size-8 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div class="flex-1">
          <h2
            id="quiz-whats-new-heading"
            class="text-lg font-semibold text-highlighted"
          >
            {{ whatsNew.title }}
          </h2>
          <p class="text-sm text-muted">
            {{ whatsNew.blurb }}
          </p>
          <p
            v-if="isDev"
            class="mt-1 text-xs text-dimmed"
          >
            {{ whatsNewFamilies }} questions in the bank (shown from {{ whatsNew.minFamilies }})
          </p>
        </div>
        <UButton
          label="Start What's new"
          size="lg"
          color="neutral"
          variant="outline"
          trailing-icon="i-heroicons-arrow-right"
          :disabled="!whatsNewFamilies"
          @click="startWhatsNew"
        />
      </div>
    </section>
  </UContainer>
</template>
