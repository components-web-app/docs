<template>
  <figure
    class="not-prose my-8 select-none"
    aria-label="The first deploy: a cluster with ingress-nginx and cert-manager, DNS pointing at the ingress, a push to main deploying staging, then the manual production job"
  >
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-5">
      <div class="grid gap-4 md:grid-cols-[1fr_1.15fr]">
        <!-- The cluster -->
        <div>
          <div class="mb-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">
            Set up once
          </div>

          <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
            <div class="text-xs font-semibold text-slate-800 dark:text-slate-100">
              DNS
            </div>
            <p class="text-[11px] leading-snug text-slate-600 dark:text-slate-300">
              <code class="font-mono">KUBE_INGRESS_BASE_DOMAIN</code>, <code class="font-mono">staging.…</code> and <code class="font-mono">&lt;branch&gt;-review.…</code> point at the ingress
            </p>
          </div>
          <div class="flex justify-center py-1 text-slate-400 dark:text-slate-500">
            <DiagramArrowIcon class="w-5 h-5 rotate-90" />
          </div>

          <div class="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-2.5">
            <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-600 dark:text-slate-300">
              Your cluster
            </div>
            <div class="mt-2 grid gap-2">
              <div class="rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/70 px-2 py-1.5">
                <div class="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  ingress-nginx
                </div>
                <p class="text-[10.5px] leading-snug text-stone-600 dark:text-stone-300 [overflow-wrap:anywhere]">
                  <code class="font-mono">externalTrafficPolicy:</code> <code class="font-mono">Local</code>
                </p>
              </div>
              <div class="rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/70 px-2 py-1.5">
                <div class="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  cert-manager
                </div>
                <p class="text-[10.5px] leading-snug text-stone-600 dark:text-stone-300 [overflow-wrap:anywhere]">
                  <code class="font-mono">letsencrypt-staging</code><br><code class="font-mono">letsencrypt-prod</code>
                </p>
              </div>
            </div>
            <div class="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-2 py-1.5">
              <div class="text-xs font-semibold text-blue-800 dark:text-blue-200">
                Production's namespace
              </div>
              <p class="text-[10.5px] leading-snug text-blue-700 dark:text-blue-300">
                production, staging and canary deploy here
              </p>
            </div>
            <div class="mt-2 rounded-lg border border-dashed border-blue-200 dark:border-blue-800 px-2 py-1.5">
              <div class="text-xs font-semibold text-blue-800 dark:text-blue-200">
                A namespace per review branch
              </div>
              <p class="text-[10.5px] leading-snug text-blue-700 dark:text-blue-300">
                optional
              </p>
            </div>
          </div>
        </div>

        <!-- The pipeline -->
        <div>
          <div class="mb-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">
            Then, in order
          </div>
          <ol class="space-y-0">
            <li
              v-for="(step, i) in steps"
              :key="step.title"
              class="relative flex gap-3 pb-3 last:pb-0"
            >
              <span
                v-if="i < steps.length - 1"
                class="absolute left-[11px] top-6 bottom-0 border-l-2 border-slate-200 dark:border-slate-700"
                aria-hidden="true"
              />
              <span
                class="relative z-10 grid place-items-center w-6 h-6 shrink-0 rounded-full text-[11px] font-bold"
                :class="step.manual ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'"
              >{{ i + 1 }}</span>
              <div class="min-w-0">
                <div class="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {{ step.title }}
                  <span
                    v-if="step.manual"
                    class="ml-1 align-middle text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 px-1.5 py-px rounded-full"
                  >manual</span>
                </div>
                <p class="text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                  <DiagramCodeText
                    :text="step.text"
                    code-class="font-mono text-[10.5px] [overflow-wrap:anywhere]"
                  />
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { DiagramArrowIcon, DiagramCodeText } from '~/utils/diagram-parts'

// `Backticks` mark code.
const steps: { title: string, text: string, manual?: boolean }[] = [
  { title: 'Push main', text: 'Builds the images, runs the tests and deploys staging. On GitHub, set `CWA_CI_STAGING_ENABLED` to true first' },
  { title: 'Check staging', text: 'Its certificate is from `letsencrypt-staging`, so expect a browser warning' },
  { title: 'Switch to trusted certificates', text: 'Set `CWA_CI_CLUSTER_ISSUER=letsencrypt-prod`' },
  { title: 'Deploy production', text: 'First deploy only: with `CWA_CI_FIXTURES_ENABLED="true"`, then load the fixtures', manual: true }
]
</script>
