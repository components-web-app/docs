<template>
  <svg viewBox="0 0 490 210" class="w-full max-w-2xl mx-auto block my-8" aria-hidden="true">

    <!-- ─── depth 0 label ─── -->
    <text x="12" y="16" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">depth 0</text>

    <!-- Page "EventList" (depth 0) -->
    <rect x="40" y="24" width="190" height="48" rx="6" stroke-width="1.5"
      class="fill-blue-50 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700"/>
    <text x="135" y="42" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-blue-600 dark:fill-blue-400">Page</text>
    <text x="135" y="59" text-anchor="middle" font-size="13" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">EventList</text>

    <!-- → Layout -->
    <line x1="231" y1="48" x2="249" y2="48" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 244 44 L 252 48 L 244 52" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="255" y="24" width="130" height="48" rx="6" stroke-width="1.5"
      class="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-700"/>
    <text x="320" y="42" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-emerald-600 dark:fill-emerald-400">Layout</text>
    <text x="320" y="59" text-anchor="middle" font-size="13" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">Primary</text>

    <!-- ─── Vertical connector from EventList to CwaPage pill ─── -->
    <line x1="135" y1="72" x2="135" y2="92" stroke-width="1.5" stroke-dasharray="4 2"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- <CwaPage /> pill -->
    <rect x="75" y="92" width="120" height="26" rx="13" stroke-width="1.5" stroke-dasharray="4 2"
      class="fill-slate-50 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-600"/>
    <text x="135" y="109" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace"
      class="fill-slate-500 dark:fill-slate-400">&lt;CwaPage /&gt;</text>

    <!-- ─── Vertical connector from CwaPage pill down to depth 1 ─── -->
    <line x1="135" y1="118" x2="135" y2="136" stroke-width="1.5" stroke-dasharray="4 2"
      class="stroke-slate-300 dark:stroke-slate-500"/>
    <!-- Arrowhead pointing down -->
    <path d="M 131 131 L 135 138 L 139 131" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <!-- ─── depth 1 label ─── -->
    <text x="12" y="152" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">depth 1</text>

    <!-- PageData "EventData" (depth 1) -->
    <rect x="40" y="158" width="190" height="48" rx="6" stroke-width="1.5"
      class="fill-violet-50 dark:fill-violet-950 stroke-violet-300 dark:stroke-violet-700"/>
    <text x="135" y="176" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-violet-600 dark:fill-violet-400">PageData</text>
    <text x="135" y="193" text-anchor="middle" font-size="13" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">EventData</text>

    <!-- → Page template -->
    <line x1="231" y1="182" x2="249" y2="182" stroke-width="1.5" class="stroke-slate-300 dark:stroke-slate-500"/>
    <path d="M 244 178 L 252 182 L 244 186" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
      class="stroke-slate-300 dark:stroke-slate-500"/>

    <rect x="255" y="158" width="180" height="48" rx="6" stroke-width="1.5"
      class="fill-blue-50 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700"/>
    <text x="345" y="176" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-blue-600 dark:fill-blue-400">Page (isTemplate)</text>
    <text x="345" y="193" text-anchor="middle" font-size="13" font-weight="500" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">EventDetail</text>

  </svg>
</template>
