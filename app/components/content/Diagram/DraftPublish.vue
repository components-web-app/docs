<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="The draft and published versions of one component: editors change the draft, visitors read the published version, and publishing copies the draft over it"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-5">
      <div class="grid grid-cols-[1fr_auto_1fr] gap-x-1.5 sm:gap-x-4">
        <!-- Actors -->
        <div class="flex flex-col items-center text-center">
          <span class="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">Editor</span>
          <span class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">signed in, with publish rights</span>
        </div>
        <div />
        <div class="flex flex-col items-center text-center">
          <span class="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200">Visitors</span>
          <span class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">anonymous</span>
        </div>

        <!-- Down arrows -->
        <div class="flex flex-col items-center py-2">
          <span class="text-[11px] text-slate-600 dark:text-slate-300 text-center">reads and edits</span>
          <DiagramArrowIcon class="w-5 h-5 rotate-90 text-slate-500 dark:text-slate-400" />
        </div>
        <div />
        <div class="flex flex-col items-center py-2">
          <span class="text-[11px] text-slate-600 dark:text-slate-300 text-center">reads</span>
          <DiagramArrowIcon class="w-5 h-5 rotate-90 text-slate-500 dark:text-slate-400" />
        </div>

        <!-- The twins -->
        <div class="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3">
          <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-amber-700 dark:text-amber-300">
            Draft
          </div>
          <ul class="mt-1.5 space-y-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
            <li><code class="font-mono">publishedAt</code>: none, or a future time</li>
            <li>a copy, made by the first edit to the published version</li>
          </ul>
        </div>
        <div class="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
          <span class="text-[10px] sm:text-[11px] font-semibold">Publish</span>
          <DiagramArrowIcon class="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div class="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-3">
          <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-emerald-700 dark:text-emerald-300">
            Published
          </div>
          <ul class="mt-1.5 space-y-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
            <li>what the live site shows</li>
            <li>keeps its IRI when a draft is published</li>
          </ul>
        </div>
      </div>

      <!-- Publish -->
      <div class="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
        <p class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
          <span class="font-semibold">Publish</span> sets <code class="font-mono">publishedAt</code> to <code class="font-mono">"now"</code>, or a scheduled time arrives. The draft's fields are copied over the published version, and the draft is removed.
        </p>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { DiagramArrowIcon } from '~/utils/diagram-parts'
</script>
