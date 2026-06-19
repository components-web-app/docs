<template>
  <div ref="container" class="my-8 not-prose flex justify-center [&>svg]:max-w-full" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useColorMode } from '#imports'

const container = ref<HTMLElement | null>(null)
const colorMode = useColorMode()

const definition = `flowchart LR
  subgraph YourProject["Your Project"]
    direction LR
    subgraph Backend["Backend"]
      API["Your entities & PageData<br/>+ API Components Bundle<br/>+ API Platform / Symfony"]
    end
    subgraph Frontend["Frontend"]
      MOD["Your Vue UI templates<br/>visual shells for layouts, pages & components<br/>+ @cwa/nuxt module<br/>+ Nuxt / Vue / Pinia"]
    end
    Backend -->|"REST + Mercure"| Frontend
  end`

async function render() {
  if (!container.value) return
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: colorMode.value === 'dark' ? 'dark' : 'default',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
  })
  container.value.innerHTML = ''
  const id = `arch-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, definition)
  container.value.innerHTML = svg
}

onMounted(render)
watch(() => colorMode.value, render)
</script>
