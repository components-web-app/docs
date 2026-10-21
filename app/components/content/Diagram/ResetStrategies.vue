<template>
  <figure
    class="not-prose my-8"
    aria-label="Bar chart of milliseconds per scenario for four ways to reset the database"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-5">
      <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">
        Reset time, ms per scenario
      </div>
      <dl class="mt-3 space-y-3">
        <div
          v-for="row in rows"
          :key="row.label"
        >
          <dt class="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200">
            <DiagramCodeText
              :text="row.label"
              code-class="font-mono text-[10.5px] sm:text-[11px]"
            />
          </dt>
          <dd class="mt-1 flex items-center gap-2">
            <span
              class="h-4 rounded-sm shrink-0"
              :class="row.bar"
              :style="{ width: `max(3px, calc((100% - 3.5rem) * ${row.ms / max}))` }"
            />
            <span class="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100">{{ row.ms.toLocaleString('en-GB') }}</span>
          </dd>
        </div>
      </dl>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { DiagramCodeText } from '~/utils/diagram-parts'

// The figures from the table above it on the page: one CWA-based project's Behat suite.
const rows = [
  { label: '`dropSchema` + `createSchema` (the template)', ms: 756, bar: 'bg-slate-400 dark:bg-slate-500' },
  { label: 'One `TRUNCATE … RESTART IDENTITY CASCADE`', ms: 185, bar: 'bg-slate-400 dark:bg-slate-500' },
  { label: '`ORMPurger` in `PURGE_MODE_TRUNCATE`', ms: 6193, bar: 'bg-rose-500 dark:bg-rose-400' },
  { label: '`ORMPurger` in `PURGE_MODE_DELETE`, plus a sequence reset', ms: 22, bar: 'bg-emerald-500 dark:bg-emerald-400' }
]
const max = Math.max(...rows.map(r => r.ms))
</script>
