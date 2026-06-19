<template>
  <div ref="container" class="my-8 not-prose" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type Highcharts from 'highcharts'

const props = defineProps<{ options: Highcharts.Options }>()

const container = ref<HTMLElement | null>(null)
let chart: Highcharts.Chart | null = null

const ANIM = { duration: 250 }

function buildOptions(base: Highcharts.Options): Highcharts.Options {
  return {
    ...base,
    plotOptions: {
      ...base.plotOptions,
      organization: {
        ...((base.plotOptions as any)?.organization ?? {}),
        // Disable built-in state fading — we handle it ourselves
        inactiveOtherPoints: false,
        states: {
          hover: { opacity: 1, linkOpacity: 1 },
          inactive: { opacity: 1, linkOpacity: 1 },
        },
        point: {
          events: {
            mouseOver(this: any) {
              const hovered = this
              const nodes: any[] = hovered.series.nodes ?? []
              const links: any[] = hovered.series.points ?? []
              const connectedIds = new Set<string>()
              ;[...(hovered.linksFrom ?? []), ...(hovered.linksTo ?? [])].forEach((l: any) => {
                if (l.fromNode?.id) connectedIds.add(l.fromNode.id)
                if (l.toNode?.id) connectedIds.add(l.toNode.id)
              })
              nodes.forEach((node: any) => {
                const op = node === hovered ? 1 : connectedIds.has(node.id) ? 0.8 : 0.35
                node.graphic?.animate({ opacity: op }, ANIM)
                node.dataLabel?.animate({ opacity: op }, ANIM)
              })
              links.forEach((link: any) => {
                const connected = link.fromNode === hovered || link.toNode === hovered
                link.graphic?.animate({ opacity: connected ? 0.7 : 0.08 }, ANIM)
              })
            },
            mouseOut(this: any) {
              const series = this.series
              ;[...(series.nodes ?? []), ...(series.points ?? [])].forEach((p: any) => {
                p.graphic?.animate({ opacity: 1 }, ANIM)
                p.dataLabel?.animate({ opacity: 1 }, ANIM)
              })
            },
          },
        },
      },
    },
  }
}

onMounted(async () => {
  if (!container.value) return
  const { default: HC } = await import('highcharts/esm/highcharts.js')
  await import('highcharts/esm/modules/sankey.js')
  await import('highcharts/esm/modules/organization.js')
  chart = HC.chart(container.value, buildOptions(props.options))
})

onUnmounted(() => {
  chart?.destroy()
  chart = null
})
</script>
