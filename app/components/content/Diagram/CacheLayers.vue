<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="Cache layers from the browser to the API, with requests going in and purges coming back"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-4">
      <div class="flex flex-col">
        <template
          v-for="(layer, i) in layers"
          :key="layer.title"
        >
          <!-- Connector -->
          <div
            v-if="i > 0"
            class="flex items-center justify-center gap-4 py-1.5"
          >
            <div class="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <DiagramArrowIcon class="w-5 h-5 rotate-90" />
              <span class="text-[10px] font-semibold">{{ layer.inLabel ?? 'miss' }}</span>
            </div>
            <div
              class="flex items-center gap-1 text-amber-600 dark:text-amber-400"
              :class="layer.purgeIn ? '' : 'invisible'"
            >
              <DiagramArrowIcon class="w-5 h-5 -rotate-90" />
              <span class="text-[10px] font-semibold">purge</span>
            </div>
          </div>

          <!-- Layer -->
          <div
            class="flex-1 min-w-0 rounded-xl border p-3"
            :class="[layer.box, layer.optional ? 'border-dashed border-2' : '']"
          >
            <div
              class="text-[11px] font-bold tracking-[0.08em] uppercase"
              :class="layer.titleClass"
            >
              {{ layer.title }}
            </div>
            <div
              v-if="layer.optional"
              class="text-[10px] text-slate-500 dark:text-slate-400"
            >
              optional
            </div>
            <template v-if="layer.split">
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div
                  v-for="part in layer.split"
                  :key="part.title"
                  class="rounded-lg border px-2 py-1.5"
                  :class="part.box"
                >
                  <div
                    class="text-xs font-semibold"
                    :class="part.titleClass"
                  >
                    {{ part.title }}
                  </div>
                  <p class="mt-0.5 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                    {{ part.text }}
                  </p>
                </div>
              </div>
            </template>
            <p
              v-else
              class="mt-1 text-[11px] sm:text-xs leading-snug text-slate-600 dark:text-slate-300"
            >
              {{ layer.text }}
            </p>
          </div>
        </template>
      </div>

      <!-- Legend -->
      <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
        <span class="flex items-start gap-1.5"><span class="w-4 shrink-0 mt-[0.45rem] border-t-2 border-blue-500" />a request, which Cloudflare and Souin pass on only on a miss</span>
        <span class="flex items-start gap-1.5"><span class="w-4 shrink-0 mt-[0.45rem] border-t-2 border-amber-500" />a purge: the API sends tags to Souin, which forwards them to Cloudflare</span>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { DiagramArrowIcon } from '~/utils/diagram-parts'

interface Part { title: string, text: string, box: string, titleClass: string }
interface Layer {
  title: string
  text?: string
  split?: Part[]
  optional?: boolean
  /** The label on the request arrow into this layer. */
  inLabel?: string
  /** A purge arrives at the layer before this one through this connector. */
  purgeIn?: boolean
  box: string
  titleClass: string
}

const slate = {
  box: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60',
  titleClass: 'text-slate-600 dark:text-slate-300'
}
const blue = {
  box: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50',
  titleClass: 'text-blue-700 dark:text-blue-300'
}
const stone = {
  box: 'border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/70',
  titleClass: 'text-stone-700 dark:text-stone-200'
}

const layers: Layer[] = [
  {
    title: 'Browser',
    text: 'Service worker: the cwa-api cache, read only when offline',
    ...slate
  },
  {
    title: 'Cloudflare',
    text: 'Edge cache, only with Option B',
    optional: true,
    inLabel: 'request',
    purgeIn: false,
    box: 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900',
    titleClass: 'text-slate-600 dark:text-slate-300'
  },
  {
    title: 'Caddy + Souin',
    text: 'In the php container: page HTML and /_api responses',
    purgeIn: true,
    ...slate
  },
  {
    title: 'Origin',
    purgeIn: true,
    split: [
      { title: 'Nuxt (SSR)', text: 'Renders a page miss from the API\'s data, and tags it with every IRI it used', ...blue },
      { title: 'API (Symfony)', text: 'Answers an /_api miss, sets Cache-Control and tags, purges tags on a write', ...stone }
    ],
    ...slate
  }
]
</script>
