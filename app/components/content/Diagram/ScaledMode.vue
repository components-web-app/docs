<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="The default API with one php pod holding its own cache and Mercure hub, beside scaled mode with two or three php pods sharing one Redis cache and one Mercure hub pod"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Default -->
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-4 flex flex-col">
        <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">
          Default
        </div>
        <div class="text-xs text-slate-600 dark:text-slate-300">
          one php pod
        </div>

        <div class="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
          API Service
        </div>
        <div class="flex justify-center py-1 text-slate-400 dark:text-slate-500">
          <DiagramArrowIcon class="w-5 h-5 rotate-90" />
        </div>

        <div class="rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/70 p-2.5">
          <div class="text-xs font-semibold text-stone-800 dark:text-stone-100">
            php pod
          </div>
          <div class="mt-2 grid gap-2">
            <div :class="part">
              Souin cache, in this pod's memory
            </div>
            <div :class="part">
              Mercure hub, in this pod
            </div>
          </div>
        </div>

        <p class="mt-3 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
          A node upgrade, eviction or restart is an API outage until the pod comes back.
        </p>
      </div>

      <!-- Scaled -->
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-4 flex flex-col">
        <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-violet-600 dark:text-violet-300">
          Scaled mode
        </div>
        <div class="text-xs text-slate-600 dark:text-slate-300">
          2 to 3 php pods by default
        </div>

        <div class="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
          API Service
        </div>
        <div class="flex justify-center py-1 text-slate-400 dark:text-slate-500">
          <DiagramArrowIcon class="w-5 h-5 rotate-90" />
        </div>

        <div class="rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 p-2.5">
          <div class="flex flex-wrap items-baseline justify-between gap-x-2">
            <span class="text-[11px] font-semibold text-violet-700 dark:text-violet-300">PodDisruptionBudget</span>
            <code class="font-mono text-[10.5px] text-violet-700 dark:text-violet-300">maxUnavailable: 1</code>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-1.5">
            <div
              v-for="n in 3"
              :key="n"
              class="rounded-lg border-2 px-1.5 py-2 text-center text-[11px] font-semibold"
              :class="n < 3
                ? 'border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/70 text-stone-800 dark:text-stone-100'
                : 'border-dashed border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400'"
            >
              php pod
              <div
                class="text-[10px] font-normal"
                :class="n < 3 ? 'text-stone-600 dark:text-stone-300' : ''"
              >
                {{ n < 3 ? 'Souin, cache in Redis' : 'when the HPA adds it' }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-around py-1 text-slate-400 dark:text-slate-500">
          <div class="flex flex-col items-center">
            <DiagramArrowIcon class="w-5 h-5 rotate-90" /><span class="text-[10px]">cache</span>
          </div>
          <div class="flex flex-col items-center">
            <DiagramArrowIcon class="w-5 h-5 rotate-90" /><span class="text-[10px]">publish</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-2 py-1.5">
            <div class="text-xs font-semibold text-rose-800 dark:text-rose-200">
              Redis
            </div>
            <p class="text-[10.5px] leading-snug text-rose-700 dark:text-rose-300">
              one shared cache per release, <code class="font-mono">256Mi</code>
            </p>
          </div>
          <div class="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-2 py-1.5">
            <div class="text-xs font-semibold text-blue-800 dark:text-blue-200">
              Mercure hub pod
            </div>
            <p class="text-[10.5px] leading-snug text-blue-700 dark:text-blue-300">
              php publishes here, and forwards browsers' subscriptions
            </p>
          </div>
        </div>

        <p class="mt-3 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
          Losing one php pod is not an outage. Redis and the hub are one pod each.
        </p>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { DiagramArrowIcon } from '~/utils/diagram-parts'

const part = 'rounded-md border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900/60 px-2 py-1 text-[11px] text-stone-700 dark:text-stone-200'
</script>
