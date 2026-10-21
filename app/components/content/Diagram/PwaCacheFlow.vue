<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="Where a public response is stored and where a private, no-store response is dropped, from the API back to the browser"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-5">
      <!-- Column headings -->
      <div class="grid grid-cols-2 sm:grid-cols-[9rem_1fr_1fr] gap-2 mb-2">
        <div class="hidden sm:block" />
        <div class="text-[11px] font-bold tracking-[0.06em] uppercase text-emerald-700 dark:text-emerald-300">
          Public response
        </div>
        <div class="text-[11px] font-bold tracking-[0.06em] uppercase text-rose-700 dark:text-rose-300">
          Signed-in response
        </div>
      </div>

      <template
        v-for="(tier, i) in tiers"
        :key="tier.name"
      >
        <div
          v-if="i > 0"
          class="flex items-center justify-center gap-2 py-1 text-slate-400 dark:text-slate-500"
        >
          <DiagramArrowIcon class="w-4 h-4 rotate-90" />
          <span class="text-[10px]">request</span>
          <span class="mx-1 text-slate-300 dark:text-slate-700">·</span>
          <span class="text-[10px]">response</span>
          <DiagramArrowIcon class="w-4 h-4 -rotate-90" />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-[9rem_1fr_1fr] gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2">
          <div class="col-span-2 sm:col-span-1 sm:self-center">
            <div class="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {{ tier.name }}
            </div>
            <div
              v-if="tier.sub"
              class="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400"
            >
              {{ tier.sub }}
            </div>
          </div>
          <div
            v-for="(cell, j) in tier.cells"
            :key="j"
            class="flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] leading-snug"
            :class="cellClass[cell.kind]"
          >
            <component
              :is="cell.kind === 'stored' ? DiagramCheckIcon : cell.kind === 'sent' ? DiagramArrowIcon : DiagramCrossIcon"
              class="w-3.5 h-3.5 shrink-0 mt-px"
              :class="cell.kind === 'sent' ? '-rotate-90' : ''"
            />
            <span>
              <DiagramCodeText
                :text="cell.text"
                code-class="font-mono text-[10.5px] whitespace-nowrap"
              />
            </span>
          </div>
        </div>
      </template>

      <p class="mt-3 text-[11px] text-slate-600 dark:text-slate-300">
        <span class="font-semibold">Offline:</span> <code class="font-mono">NetworkFirst</code> falls back to the <code class="font-mono">cwa-api</code> cache, which only ever holds public responses.
      </p>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { DiagramArrowIcon, DiagramCheckIcon, DiagramCodeText, DiagramCrossIcon } from '~/utils/diagram-parts'

type Kind = 'stored' | 'dropped' | 'sent' | 'shown'
// `Backticks` mark code.
interface Cell { kind: Kind, text: string }
interface Tier { name: string, sub?: string, cells: [Cell, Cell] }

const cellClass: Record<Kind, string> = {
  stored: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100',
  dropped: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100',
  shown: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200',
  sent: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
}

const tiers: Tier[] = [
  {
    name: 'Browser',
    sub: 'HTTP cache',
    cells: [
      { kind: 'shown', text: 'Shown, not kept: `max-age=0`' },
      { kind: 'shown', text: 'Shown, not kept' }
    ]
  },
  {
    name: 'Service worker',
    sub: 'NetworkFirst, cwa-api cache',
    cells: [
      { kind: 'stored', text: 'Stored: `cacheWillUpdate` returns the response' },
      { kind: 'dropped', text: 'Dropped: `cacheWillUpdate` returns null' }
    ]
  },
  {
    name: 'Souin',
    sub: 'shared edge cache',
    cells: [
      { kind: 'stored', text: 'Stored for `s-maxage`, purged when the resource is saved' },
      { kind: 'dropped', text: 'Never stored' }
    ]
  },
  {
    name: 'API',
    cells: [
      { kind: 'sent', text: '`s-maxage` set, `max-age=0`' },
      { kind: 'sent', text: 'An editor\'s draft view: `private, no-store`' }
    ]
  }
]
</script>
