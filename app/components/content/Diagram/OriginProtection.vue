<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="A request through ingress-nginx and Caddy: tracking parameters stripped, the query allowlist, the Souin cache, and the rate limit counting only misses"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-5">
      <div class="mx-auto max-w-xl">
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
          Visitor
        </div>
        <Down />

        <div class="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 px-3 py-2">
          <div class="flex flex-wrap items-baseline gap-x-2">
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-100">ingress-nginx</span>
            <span class="text-[10.5px] text-slate-500 dark:text-slate-400">Kubernetes, optional limit</span>
          </div>
          <p class="text-[11px] leading-snug text-slate-600 dark:text-slate-300">
            <code class="font-mono [overflow-wrap:anywhere]">CWA_CI_INGRESS_RATE_LIMIT_RPS</code> counts every request, cache hits included
          </p>
        </div>
        <Down />

        <div class="rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900/60 p-2.5">
          <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 dark:text-stone-300">
            Caddy in the php container
          </div>

          <div
            :class="step"
            class="mt-2"
          >
            <div :class="stepTitle">
              1. Tracking parameters stripped
            </div>
            <p :class="stepText">
              <code class="font-mono">utm_*</code>, <code class="font-mono">gclid</code>, <code class="font-mono">fbclid</code> and the rest, on every path but <code class="font-mono">/_nuxt/*</code>
            </p>
          </div>
          <Down small />
          <div :class="step">
            <div :class="stepTitle">
              2. Query allowlist
            </div>
            <p :class="stepText">
              Pages keep only <code class="font-mono">CACHE_QUERY_ALLOWLIST</code> (<code class="font-mono">page search order</code>). <code class="font-mono">/_api</code> keeps every parameter
            </p>
          </div>
          <Down small />
          <div class="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5">
            <div class="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              3. Souin cache
            </div>
            <p class="text-[11px] leading-snug text-emerald-700 dark:text-emerald-300">
              A hit is served here, never counted or refused
            </p>
          </div>
          <div class="flex items-center justify-center gap-1 py-1 text-slate-500 dark:text-slate-400">
            <DiagramArrowIcon class="w-4 h-4 rotate-90" />
            <span class="text-[10.5px] font-semibold">miss</span>
          </div>
          <div class="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5">
            <div class="text-xs font-semibold text-amber-800 dark:text-amber-200">
              4. Rate limit on misses
            </div>
            <p class="text-[11px] leading-snug text-amber-700 dark:text-amber-300">
              3,000 a minute per visitor, then <code class="font-mono">429</code> with <code class="font-mono">Retry-After</code>. Private addresses are never limited
            </p>
          </div>
        </div>
        <Down />

        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5">
            <div class="text-xs font-semibold text-blue-800 dark:text-blue-200">
              Nuxt
            </div>
            <p class="text-[11px] leading-snug text-blue-700 dark:text-blue-300">
              renders a page that missed
            </p>
          </div>
          <div class="rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/70 px-2.5 py-1.5">
            <div class="text-xs font-semibold text-stone-800 dark:text-stone-100">
              php
            </div>
            <p class="text-[11px] leading-snug text-stone-600 dark:text-stone-300">
              answers <code class="font-mono">/_api</code> with 4 workers. In production, a request that waits 5s for one gets a <code class="font-mono">503</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { DiagramArrowIcon } from '~/utils/diagram-parts'

const step = 'rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5'
const stepTitle = 'text-xs font-semibold text-stone-800 dark:text-stone-100'
const stepText = 'text-[11px] leading-snug text-stone-600 dark:text-stone-300'

const Down = {
  props: { small: Boolean },
  setup(props: { small: boolean }) {
    return () => h('div', { class: ['flex justify-center text-slate-400 dark:text-slate-500', props.small ? 'py-0.5' : 'py-1'] }, [
      h(DiagramArrowIcon, { class: [props.small ? 'w-4 h-4' : 'w-5 h-5', 'rotate-90'] })
    ])
  }
}
</script>
