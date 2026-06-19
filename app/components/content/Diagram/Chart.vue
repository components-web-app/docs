<template>
  <div ref="container" class="my-8 flex justify-center [&>svg]:max-w-full" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useColorMode } from '#imports'

const props = defineProps<{ definition: string }>()

const container = ref<HTMLElement | null>(null)
const colorMode = useColorMode()

async function render() {
  if (!container.value) return
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: colorMode.value === 'dark' ? 'dark' : 'default',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14
  })
  container.value.innerHTML = ''
  const id = `mermaid-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, props.definition)
  container.value.innerHTML = svg
}

onMounted(render)
watch(() => colorMode.value, render)
</script>
