<template>
  <svg viewBox="0 0 660 200" class="w-full max-w-2xl mx-auto block my-8" aria-hidden="true">

    <!-- ─── Row 1: /blog/post-1 ─── -->
    <rect x="10" y="33" width="130" height="44" rx="6" stroke-width="1.5"
      class="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="75" y="50" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">URL</text>
    <text x="75" y="66" text-anchor="middle" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">/blog/post-1</text>

    <line x1="141" y1="55" x2="157" y2="55" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 152 51 L 160 55 L 152 59" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="163" y="33" width="140" height="44" rx="6" stroke-width="1.5"
      class="fill-violet-50 dark:fill-violet-950 stroke-violet-300 dark:stroke-violet-700"/>
    <text x="233" y="50" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-violet-600 dark:fill-violet-400">PageData</text>
    <text x="233" y="66" text-anchor="middle" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">BlogArticle #1</text>

    <!-- ─── Row 2: /blog/post-2 ─── -->
    <rect x="10" y="78" width="130" height="44" rx="6" stroke-width="1.5"
      class="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="75" y="95" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">URL</text>
    <text x="75" y="111" text-anchor="middle" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">/blog/post-2</text>

    <line x1="141" y1="100" x2="157" y2="100" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 152 96 L 160 100 L 152 104" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="163" y="78" width="140" height="44" rx="6" stroke-width="1.5"
      class="fill-violet-50 dark:fill-violet-950 stroke-violet-300 dark:stroke-violet-700"/>
    <text x="233" y="95" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-violet-600 dark:fill-violet-400">PageData</text>
    <text x="233" y="111" text-anchor="middle" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">BlogArticle #2</text>

    <!-- ─── Row 3: /blog/post-3 ─── -->
    <rect x="10" y="123" width="130" height="44" rx="6" stroke-width="1.5"
      class="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="75" y="140" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">URL</text>
    <text x="75" y="156" text-anchor="middle" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">/blog/post-3</text>

    <line x1="141" y1="145" x2="157" y2="145" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 152 141 L 160 145 L 152 149" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="163" y="123" width="140" height="44" rx="6" stroke-width="1.5"
      class="fill-violet-50 dark:fill-violet-950 stroke-violet-300 dark:stroke-violet-700"/>
    <text x="233" y="140" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-violet-600 dark:fill-violet-400">PageData</text>
    <text x="233" y="156" text-anchor="middle" font-size="11" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">BlogArticle #3</text>

    <!-- ─── Convergence: PageData → junction → Template ─── -->
    <!-- Horizontal leads from each PageData right edge to junction x=320 -->
    <line x1="304" y1="55" x2="321" y2="55" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <line x1="304" y1="100" x2="321" y2="100" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <line x1="304" y1="145" x2="321" y2="145" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <!-- Vertical spine -->
    <line x1="321" y1="55" x2="321" y2="145" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <!-- Arrow from spine to template -->
    <line x1="322" y1="100" x2="340" y2="100" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 335 96 L 343 100 L 335 104" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- ─── Page Template ─── -->
    <rect x="346" y="78" width="160" height="44" rx="6" stroke-width="1.5"
      class="fill-blue-50 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700"/>
    <text x="426" y="95" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-blue-600 dark:fill-blue-400">Page (isTemplate)</text>
    <text x="426" y="111" text-anchor="middle" font-size="12" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">BlogDetail</text>

    <!-- → -->
    <line x1="507" y1="100" x2="523" y2="100" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 518 96 L 526 100 L 518 104" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- ─── Layout ─── -->
    <rect x="529" y="78" width="118" height="44" rx="6" stroke-width="1.5"
      class="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-700"/>
    <text x="588" y="95" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-emerald-600 dark:fill-emerald-400">Layout</text>
    <text x="588" y="111" text-anchor="middle" font-size="12" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">Primary</text>

  </svg>
</template>
