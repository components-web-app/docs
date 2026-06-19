<template>
  <div class="my-8 not-prose overflow-x-auto">
    <svg
      viewBox="0 0 660 230"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full max-w-2xl mx-auto block"
      aria-label="CWA architecture diagram"
    >
      <defs>
        <marker id="arch-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" :fill="col.arrow" />
        </marker>
      </defs>

      <!-- Outer: Your Project -->
      <rect x="4" y="4" width="652" height="222" rx="10"
        fill="none" :stroke="col.outerBorder" stroke-width="1.5" stroke-dasharray="6 3" />
      <text x="330" y="22" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" font-weight="600"
        :fill="col.outerLabel">Your Project</text>

      <!-- Backend box -->
      <rect x="20" y="32" width="264" height="186" rx="7"
        :fill="col.stoneFill" :stroke="col.stoneStroke" stroke-width="1.5" />
      <text x="152" y="95" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="14" font-weight="700"
        :fill="col.stoneText">Backend</text>
      <text x="152" y="116" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" :fill="col.stoneSubtext">Your entities &amp; PageData</text>
      <text x="152" y="134" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" :fill="col.stoneSubtext">+ API Components Bundle</text>
      <text x="152" y="152" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" :fill="col.stoneSubtext">+ API Platform / Symfony</text>

      <!-- Arrow -->
      <line x1="288" y1="125" x2="372" y2="125"
        :stroke="col.arrow" stroke-width="1.5" marker-end="url(#arch-arrow)" />
      <text x="330" y="115" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="11" :fill="col.arrowLabel">REST + Mercure</text>

      <!-- Frontend box -->
      <rect x="376" y="32" width="264" height="186" rx="7"
        :fill="col.blueFill" :stroke="col.blueStroke" stroke-width="1.5" />
      <text x="508" y="95" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="14" font-weight="700"
        :fill="col.blueText">Frontend</text>
      <text x="508" y="116" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" :fill="col.blueSubtext">Your Vue UI templates</text>
      <text x="508" y="134" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" :fill="col.blueSubtext">+ @cwa/nuxt module</text>
      <text x="508" y="152" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="12" :fill="col.blueSubtext">+ Nuxt / Vue / Pinia</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const dark = ref(false)

onMounted(() => {
  dark.value = colorMode.value === 'dark'
})
watch(() => colorMode.value, v => { dark.value = v === 'dark' })

const col = computed(() => dark.value ? {
  outerBorder: '#57534e',
  outerLabel:  '#a8a29e',
  stoneFill:   '#292524',
  stoneStroke: '#78716c',
  stoneText:   '#f5f5f4',
  stoneSubtext:'#d6d3d1',
  blueFill:    '#1e3a8a',
  blueStroke:  '#3b82f6',
  blueText:    '#dbeafe',
  blueSubtext: '#bfdbfe',
  arrow:       '#9ca3af',
  arrowLabel:  '#9ca3af',
} : {
  outerBorder: '#9ca3af',
  outerLabel:  '#4b5563',
  stoneFill:   '#d6d3d1',
  stoneStroke: '#78716c',
  stoneText:   '#1c1917',
  stoneSubtext:'#44403c',
  blueFill:    '#bfdbfe',
  blueStroke:  '#60a5fa',
  blueText:    '#1e3a8a',
  blueSubtext: '#1d4ed8',
  arrow:       '#4b5563',
  arrowLabel:  '#4b5563',
})
</script>
