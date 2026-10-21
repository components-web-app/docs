<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="Sequence diagram of a request for /about-us between the browser, the Nuxt module and the API"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm px-2 sm:px-4 py-4">
      <div class="relative">
        <!-- Lifelines -->
        <div
          class="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            v-for="lane in lanes"
            :key="lane.id"
            class="absolute top-0 bottom-0 border-l border-dashed"
            :class="lane.line"
            :style="{ left: `${lane.centre}%` }"
          />
        </div>

        <!-- Lane headers -->
        <div class="relative h-9 mb-2">
          <div
            v-for="lane in lanes"
            :key="lane.id"
            class="absolute top-0 -translate-x-1/2 px-2 py-1 rounded-md border text-[11px] sm:text-xs font-semibold whitespace-nowrap"
            :class="lane.head"
            :style="{ left: `${lane.centre}%` }"
          >
            {{ lane.label }}
          </div>
        </div>

        <!-- Steps -->
        <template
          v-for="(block, i) in blocks"
          :key="i"
        >
          <div
            v-if="block.group"
            class="relative my-2 rounded-lg border border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/30 pt-5 pb-1"
          >
            <span class="absolute top-1 left-2 text-[10px] font-bold tracking-[0.08em] uppercase text-violet-600 dark:text-violet-300">{{ block.group }}</span>
            <DiagramSequenceRow
              v-for="(row, j) in block.rows"
              :key="j"
              :row="row"
            />
          </div>
          <template v-else>
            <DiagramSequenceRow
              v-for="(row, j) in block.rows"
              :key="j"
              :row="row"
            />
          </template>
        </template>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { PropType } from 'vue'

type LaneId = 'browser' | 'nuxt' | 'api'
interface Row { from: LaneId, to?: LaneId, label: string, code?: boolean }
interface Block { group?: string, rows: Row[] }

// Lane centres as a percentage of the width. The browser lane is narrower
// because only the first and last messages touch it.
const lanes: { id: LaneId, label: string, centre: number, head: string, line: string }[] = [
  {
    id: 'browser', label: 'Browser', centre: 9,
    head: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200',
    line: 'border-slate-300 dark:border-slate-600'
  },
  {
    id: 'nuxt', label: 'Nuxt module', centre: 36,
    head: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    line: 'border-blue-300 dark:border-blue-800'
  },
  {
    id: 'api', label: 'API', centre: 86,
    head: 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200',
    line: 'border-stone-300 dark:border-stone-600'
  }
]
const centre = Object.fromEntries(lanes.map(l => [l.id, l.centre])) as Record<LaneId, number>

const blocks: Block[] = [
  { rows: [{ from: 'browser', to: 'nuxt', label: 'visit /about-us', code: true }] },
  {
    group: 'In parallel',
    rows: [
      { from: 'nuxt', to: 'api', label: 'GET /_/routes//about-us', code: true },
      { from: 'nuxt', to: 'api', label: 'GET /_/resource_manifest//about-us', code: true }
    ]
  },
  {
    rows: [
      { from: 'api', to: 'nuxt', label: 'the Route, pointing to a Page (static) or a PageData record (dynamic)' },
      { from: 'api', to: 'nuxt', label: 'the manifest: every resource the page renders' }
    ]
  },
  {
    group: 'Concurrently',
    rows: [
      { from: 'nuxt', to: 'api', label: 'GET the layout, page, component groups, positions and components' },
      { from: 'nuxt', label: 'renders the layout, then the page template in its slot, then each component as its data arrives' }
    ]
  },
  { rows: [{ from: 'nuxt', to: 'browser', label: 'the rendered page' }] }
]

// One message: an arrow between two lifelines with its label above it, or a
// note on one lifeline when there is no `to`.
const DiagramSequenceRow = {
  props: { row: { type: Object as PropType<Row>, required: true } },
  setup(props: { row: Row }) {
    return () => {
      const { from, to, label, code } = props.row
      const labelClass = [
        'block leading-snug [overflow-wrap:anywhere]',
        code ? 'font-mono text-[10px] sm:text-xs text-slate-700 dark:text-slate-200' : 'text-[11px] sm:text-xs text-slate-600 dark:text-slate-300'
      ]

      if (!to) {
        // A note on one lifeline: spans from that lifeline to the right edge.
        return h('div', { class: 'relative py-1.5' }, [
          h('div', {
            class: 'relative rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/70 px-2 py-1.5',
            style: { marginLeft: `calc(${centre[from]}% - 0.5rem)` }
          }, [h('span', { class: labelClass }, label)])
        ])
      }

      const left = Math.min(centre[from], centre[to])
      const right = Math.max(centre[from], centre[to])
      const pointsRight = centre[to] > centre[from]
      // A label may run past its arrow to the right edge when the arrow ends at
      // the API lane or starts at the narrow browser lane.
      const fromBrowser = left === centre.browser
      const labelRight = right === centre.api || fromBrowser ? 0 : 100 - right
      const align = pointsRight || fromBrowser ? 'left' : 'right'

      return h('div', { class: 'relative py-1.5' }, [
        h('div', {
          class: 'px-1.5 pb-1',
          style: { marginLeft: `${left}%`, marginRight: `${labelRight}%`, textAlign: align }
        }, [h('span', { class: labelClass }, label)]),
        h('div', { class: 'relative h-2', style: { marginLeft: `${left}%`, marginRight: `${100 - right}%` } }, [
          h('div', { class: 'absolute left-0 right-0 top-1/2 border-t-2 border-slate-500 dark:border-slate-400' }),
          h('svg', {
            'viewBox': '0 0 8 8',
            'class': ['absolute top-1/2 -translate-y-1/2 w-2 h-2 fill-slate-500 dark:fill-slate-400', pointsRight ? '-right-0.5' : '-left-0.5 rotate-180'],
            'aria-hidden': 'true'
          }, [h('path', { d: 'M0 0 8 4 0 8z' })])
        ])
      ])
    }
  }
}
</script>
