<template>
  <svg viewBox="0 0 692 150" class="w-full max-w-2xl mx-auto block my-8" aria-hidden="true">

    <!-- ─── Build box (shared) ─── -->
    <rect x="10" y="48" width="120" height="54" rx="8" stroke-width="1.5"
      class="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="70" y="70" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-700 dark:fill-slate-200">Build</text>
    <text x="70" y="86" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">API &amp; Nuxt images</text>
    <text x="70" y="100" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace"
      class="fill-slate-300 dark:fill-slate-600">docker buildx</text>

    <!-- Build → Test -->
    <line x1="131" y1="75" x2="147" y2="75" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 142 71 L 150 75 L 142 79" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- ─── Test box (shared) ─── -->
    <rect x="152" y="48" width="120" height="54" rx="8" stroke-width="1.5"
      class="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="212" y="70" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-700 dark:fill-slate-200">Test</text>
    <text x="212" y="86" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">PHPUnit + Behat</text>
    <text x="212" y="100" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace"
      class="fill-slate-300 dark:fill-slate-600">PostgreSQL service</text>

    <!-- Test → fork junction -->
    <line x1="273" y1="75" x2="292" y2="75" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- Fork vertical spine -->
    <line x1="292" y1="30" x2="292" y2="120" stroke-width="1" class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- Top branch: branches → Review -->
    <text x="296" y="18" font-size="9" font-family="system-ui,sans-serif"
      class="fill-slate-300 dark:fill-slate-600">all branches</text>
    <line x1="292" y1="30" x2="311" y2="30" stroke-width="1" class="stroke-slate-200 dark:stroke-slate-700"/>
    <path d="M 306 26 L 314 30 L 306 34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <rect x="315" y="8" width="118" height="44" rx="8" stroke-width="1.5"
      class="fill-blue-50 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700"/>
    <text x="374" y="26" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-blue-700 dark:fill-blue-200">Review App</text>
    <text x="374" y="42" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">per-branch K8s deploy</text>

    <!-- Bottom branch: main → Staging -->
    <text x="296" y="125" font-size="9" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">main only</text>
    <line x1="292" y1="120" x2="311" y2="120" stroke-width="1" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 306 116 L 314 120 L 306 124" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="315" y="98" width="110" height="44" rx="8" stroke-width="1.5"
      class="fill-amber-50 dark:fill-amber-950 stroke-amber-300 dark:stroke-amber-700"/>
    <text x="370" y="116" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-amber-700 dark:fill-amber-200">Staging</text>
    <text x="370" y="132" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">auto on merge</text>

    <!-- Staging → Canary -->
    <line x1="426" y1="120" x2="442" y2="120" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 437 116 L 445 120 L 437 124" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="447" y="98" width="104" height="44" rx="8" stroke-width="1.5"
      class="fill-violet-50 dark:fill-violet-950 stroke-violet-300 dark:stroke-violet-700"/>
    <text x="499" y="116" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-violet-700 dark:fill-violet-200">Canary</text>
    <text x="499" y="132" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">manual</text>

    <!-- Canary → Production -->
    <line x1="552" y1="120" x2="568" y2="120" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 563 116 L 571 120 L 563 124" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="573" y="98" width="112" height="44" rx="8" stroke-width="1.5"
      class="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-700"/>
    <text x="629" y="116" text-anchor="middle" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-emerald-700 dark:fill-emerald-200">Production</text>
    <text x="629" y="132" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">manual</text>

  </svg>
</template>
