<template>
  <svg viewBox="0 0 520 130" class="w-full max-w-2xl mx-auto block my-8" aria-hidden="true">

    <!-- ─── Push / PR trigger ─── -->
    <text x="62" y="16" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">push / PR</text>

    <rect x="10" y="24" width="104" height="52" rx="8" stroke-width="1.5"
      class="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="62" y="46" text-anchor="middle" font-size="11" font-weight="600" font-family="ui-monospace,monospace"
      class="fill-slate-700 dark:fill-slate-200">test.yml</text>
    <text x="62" y="63" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">PHP + Nuxt tests</text>

    <!-- ─── Arrow → build ─── -->
    <line x1="115" y1="50" x2="191" y2="50" stroke-width="1.5" stroke-dasharray="4 3"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <text x="153" y="44" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif"
      class="fill-slate-300 dark:fill-slate-600">merge to main</text>
    <path d="M 186 46 L 194 50 L 186 54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-600"/>

    <!-- ─── build.yml ─── -->
    <rect x="196" y="24" width="120" height="52" rx="8" stroke-width="1.5"
      class="fill-blue-50 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700"/>
    <text x="256" y="46" text-anchor="middle" font-size="11" font-weight="600" font-family="ui-monospace,monospace"
      class="fill-blue-700 dark:fill-blue-200">build.yml</text>
    <text x="256" y="63" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">Docker → registry</text>

    <!-- ─── Arrow → deploy ─── -->
    <line x1="317" y1="50" x2="349" y2="50" stroke-width="1.5"
      class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 344 46 L 352 50 L 344 54" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- ─── deploy.yml ─── -->
    <rect x="354" y="24" width="154" height="52" rx="8" stroke-width="1.5"
      class="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-700"/>
    <text x="431" y="46" text-anchor="middle" font-size="11" font-weight="600" font-family="ui-monospace,monospace"
      class="fill-emerald-700 dark:fill-emerald-200">deploy.yml</text>
    <text x="431" y="63" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">Helm upgrade / apply</text>

    <!-- ─── Legend: build depends on test ─── -->
    <text x="62" y="110" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif"
      class="fill-slate-300 dark:fill-slate-600">independent</text>
    <text x="318" y="110" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">triggered after build completes</text>

  </svg>
</template>
