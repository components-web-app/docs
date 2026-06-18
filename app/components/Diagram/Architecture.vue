<template>
  <svg viewBox="0 0 500 148" class="w-full max-w-2xl mx-auto block my-8" aria-hidden="true">

    <!-- Outer "Your Project" shell -->
    <rect x="2" y="2" width="496" height="144" rx="10" stroke-width="1.5"
      class="fill-slate-50 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"/>
    <text x="16" y="20" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">Your Project</text>

    <!-- API panel -->
    <rect x="14" y="28" width="210" height="108" rx="8" stroke-width="1.5"
      class="fill-amber-50 dark:fill-amber-950 stroke-amber-200 dark:stroke-amber-800"/>
    <text x="28" y="50" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-amber-700 dark:fill-amber-300">API (Symfony)</text>
    <text x="28" y="72" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">Your entities &amp; PageData</text>
    <text x="28" y="91" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">+ API Components Bundle</text>
    <text x="28" y="110" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">+ API Platform / Symfony</text>

    <!-- Middle connector -->
    <line x1="224" y1="82" x2="242" y2="82" stroke-width="1" stroke-dasharray="3 2"
      class="stroke-slate-300 dark:stroke-slate-600"/>
    <text x="233" y="96" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">REST/Hydra</text>

    <!-- Nuxt panel -->
    <rect x="276" y="28" width="210" height="108" rx="8" stroke-width="1.5"
      class="fill-blue-50 dark:fill-blue-950 stroke-blue-200 dark:stroke-blue-800"/>
    <text x="290" y="50" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-blue-700 dark:fill-blue-300">Nuxt App</text>
    <text x="290" y="72" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">Your layouts, pages &amp; components</text>
    <text x="290" y="91" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">+ CWA Nuxt module</text>
    <text x="290" y="110" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">+ Nuxt / Vue / Pinia</text>

  </svg>
</template>
