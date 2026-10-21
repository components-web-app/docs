<script setup lang="ts">
/**
 * The docs chat assistant (docs #1): a floating "Ask AI" button that opens a side panel.
 * It sits bottom right, away from the header's search, colour switch and menu, and moves
 * up when the VIP button is there. It isn't shown on the quiz.
 */
import { CHAT_QUESTION_MAX, CHAT_QUESTIONS_PER_CONVERSATION, keepKnownLinks } from '~/composables/useDocsChat'

const props = defineProps<{
  /** The VIP button takes the bottom-right corner; sit above it. */
  isVip?: boolean
}>()

const route = useRoute()
const { open, messages, status, unavailable, atLimit, busy, ask, stop, reset } = useDocsChat()
const { open: searchOpen } = useContentSearch()

const input = ref('')
const log = ref<HTMLElement>()
const turnstileBox = ref<HTMLElement>()
const turnstile = useTurnstile(turnstileBox)

const hidden = computed(() => route.path.startsWith('/quiz'))

const suggestions = [
  'Is CWA a good fit for a small business website?',
  'How do editors change content on a page?',
  'How do I add a new component type?'
]

const promptStatus = computed(() => status.value === 'error' ? 'ready' : status.value)

function submit() {
  const question = input.value
  if (!question.trim() || busy.value) return
  input.value = ''
  ask(question, turnstile.token)
}

function openSearch() {
  open.value = false
  searchOpen.value = true
}

// Follow internal links in answers without a full page load, so the conversation survives.
function onLogClick(event: MouseEvent) {
  const anchor = (event.target as HTMLElement).closest('a')
  const href = anchor?.getAttribute('href')
  if (!href?.startsWith('/') || event.metaKey || event.ctrlKey || event.shiftKey) return
  event.preventDefault()
  navigateTo(href)
}

// On a phone the panel covers the page, so close it once a link has been followed.
watch(() => route.fullPath, () => {
  if (open.value && window.matchMedia('(max-width: 639px)').matches) open.value = false
})

// Keep the latest text in view while it streams.
watch(() => messages.value.map(message => message.content.length).join(), () => {
  nextTick(() => {
    const element = log.value
    if (!element) return
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 160) element.scrollTop = element.scrollHeight
  })
})
watch(() => messages.value.length, () => nextTick(() => {
  if (log.value) log.value.scrollTop = log.value.scrollHeight
}))
</script>

<template>
  <div v-if="!hidden">
    <div
      class="fixed right-4 z-40 sm:right-5"
      :class="props.isVip ? 'bottom-28' : 'bottom-4 sm:bottom-5'"
    >
      <UButton
        icon="i-heroicons-chat-bubble-left-right"
        label="Ask AI"
        size="lg"
        class="rounded-full shadow-lg"
        aria-haspopup="dialog"
        :aria-expanded="open"
        @click="open = true"
      />
    </div>

    <USlideover
      v-model:open="open"
      title="Ask the CWA assistant"
      description="AI answers drawn from these docs. They can be wrong, so check the linked pages."
      :ui="{ content: 'sm:max-w-md', body: 'flex flex-col p-0 sm:p-0 overflow-hidden', header: 'items-start' }"
    >
      <template #actions>
        <UButton
          v-if="messages.length"
          icon="i-heroicons-arrow-path"
          color="neutral"
          variant="ghost"
          size="sm"
          label="New"
          aria-label="Start a new conversation"
          class="me-8 shrink-0"
          @click="reset"
        />
      </template>

      <template #body>
        <div
          ref="log"
          role="log"
          aria-live="polite"
          :aria-busy="busy"
          aria-label="Conversation"
          class="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-5"
          @click="onLogClick"
        >
          <div
            v-if="!messages.length"
            class="space-y-4 text-sm text-muted"
          >
            <p>
              Ask about building a site with CWA, or whether it suits your project. Answers come only from these docs, with links to the pages they used.
            </p>
            <div class="flex flex-col items-start gap-2">
              <UButton
                v-for="suggestion in suggestions"
                :key="suggestion"
                :label="suggestion"
                color="neutral"
                variant="outline"
                size="sm"
                class="text-left"
                :disabled="unavailable"
                @click="ask(suggestion, turnstile.token)"
              />
            </div>
          </div>

          <article
            v-for="message in messages"
            :key="message.id"
            :aria-label="message.role === 'user' ? 'Your question' : 'Answer'"
            :class="message.role === 'user' ? 'flex justify-end' : ''"
          >
            <p
              v-if="message.role === 'user'"
              class="max-w-[85%] rounded-lg bg-elevated px-3 py-2 text-sm whitespace-pre-wrap break-words"
            >
              {{ message.content }}
            </p>

            <div
              v-else
              class="text-sm"
            >
              <div
                v-if="message.content"
                class="prose prose-sm prose-primary dark:prose-invert max-w-none break-words [&_p]:my-2 [&_p]:leading-6 [&_li]:leading-6 [&_pre]:text-xs"
              >
                <Markdown :value="keepKnownLinks(message.content, message.sources)" />
              </div>
              <p
                v-else-if="!message.error"
                class="flex items-center gap-2 text-muted"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="size-4 animate-spin"
                  aria-hidden="true"
                />
                Reading the docs…
              </p>

              <UAlert
                v-if="message.error"
                :title="message.error"
                color="warning"
                variant="subtle"
                icon="i-heroicons-exclamation-triangle"
                class="mt-2"
                :actions="message.limited ? [{ label: 'Search the docs', color: 'neutral', variant: 'outline', onClick: openSearch }] : undefined"
              />

              <details
                v-if="message.sources?.length && (message.content || !busy)"
                class="mt-2 text-xs text-muted"
              >
                <summary class="cursor-pointer select-none">
                  Pages searched ({{ message.sources.length }})
                </summary>
                <ul class="mt-1 space-y-1 pl-4 list-disc">
                  <li
                    v-for="source in message.sources"
                    :key="source.url"
                  >
                    <NuxtLink
                      :to="source.url"
                      class="text-primary hover:underline"
                    >
                      {{ source.title }}
                    </NuxtLink>
                  </li>
                </ul>
              </details>
            </div>
          </article>

          <UAlert
            v-if="atLimit && !busy"
            title="That's the most questions for one conversation."
            description="Start a new one to keep going."
            color="neutral"
            variant="subtle"
            :actions="[{ label: 'New conversation', onClick: reset }]"
          />
        </div>

        <div class="border-t border-default px-4 py-3 sm:px-6">
          <!-- Cloudflare Turnstile: invisible unless Cloudflare wants a click -->
          <div
            v-if="turnstile.enabled"
            ref="turnstileBox"
            class="empty:hidden"
          />
          <p
            v-if="unavailable"
            class="text-sm text-muted"
          >
            The assistant is not available right now.
            <UButton
              label="Search the docs"
              variant="link"
              class="p-0"
              @click="openSearch"
            />
          </p>
          <UChatPrompt
            v-else
            v-model="input"
            placeholder="Ask a question about CWA…"
            :maxlength="CHAT_QUESTION_MAX"
            :maxrows="6"
            :disabled="atLimit"
            variant="subtle"
            aria-label="Your question"
            @submit="submit"
          >
            <UChatPromptSubmit
              :status="promptStatus"
              :disabled="!input.trim() || atLimit"
              @stop="stop"
            />
          </UChatPrompt>
          <p class="mt-2 text-xs text-muted">
            Your question and matching docs text go to Anthropic to write the answer; this site stores nothing.
            <NuxtLink
              to="/privacy#the-docs-chat-assistant"
              class="underline"
              @click="open = false"
            >Privacy › The docs chat assistant</NuxtLink>.
            <span v-if="!atLimit"> Up to {{ CHAT_QUESTIONS_PER_CONVERSATION }} questions per conversation.</span>
          </p>
        </div>
      </template>
    </USlideover>
  </div>
</template>
