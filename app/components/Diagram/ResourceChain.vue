<template>
  <svg viewBox="0 0 460 272" class="w-full max-w-lg mx-auto block my-8" aria-hidden="true">

    <!-- ─── Connecting lines ─── -->

    <!-- URL → Route -->
    <line x1="18" y1="22" x2="18" y2="42" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- Route → Page -->
    <line x1="18" y1="50" x2="18" y2="76" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="18" y1="76" x2="38" y2="76" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- Page → Layout (branch 1) and ComponentGroup (branch 2) -->
    <line x1="42" y1="80" x2="42" y2="210" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="42" y1="106" x2="62" y2="106" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="42" y1="210" x2="62" y2="210" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- Layout → CG-Layout -->
    <line x1="66" y1="110" x2="66" y2="136" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="66" y1="136" x2="86" y2="136" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- CG-Layout → CP-Layout -->
    <line x1="90" y1="140" x2="90" y2="166" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="90" y1="166" x2="110" y2="166" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- CG-Page → CP-Page -->
    <line x1="66" y1="214" x2="66" y2="240" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="66" y1="240" x2="86" y2="240" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- ─── URL root ─── -->
    <text x="8" y="18" font-size="11" font-family="ui-monospace,monospace"
      class="fill-slate-400 dark:fill-slate-500">URL</text>

    <!-- ─── Route ─── -->
    <circle cx="18" cy="46" r="4" class="fill-amber-400 dark:fill-amber-500"/>
    <text x="30" y="49" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">Route</text>

    <!-- ─── Page ─── -->
    <circle cx="42" cy="76" r="4" class="fill-blue-500 dark:fill-blue-400"/>
    <text x="54" y="79" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">Page</text>

    <!-- ─── Layout (branch 1) ─── -->
    <circle cx="66" cy="106" r="4" class="fill-emerald-500 dark:fill-emerald-400"/>
    <text x="78" y="109" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">Layout</text>

    <!-- ─── ComponentGroup (under Layout) ─── -->
    <circle cx="90" cy="136" r="4" class="fill-slate-400 dark:fill-slate-500"/>
    <text x="102" y="139" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">ComponentGroup</text>
    <rect x="232" y="127" width="60" height="18" rx="9"
      class="fill-slate-100 dark:fill-slate-800"/>
    <text x="262" y="139" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-500 dark:fill-slate-400">nav region</text>

    <!-- ─── ComponentPosition → Component (under Layout CG) ─── -->
    <circle cx="114" cy="166" r="4" class="fill-slate-400 dark:fill-slate-500"/>
    <text x="126" y="169" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">ComponentPosition</text>
    <text x="256" y="169" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">→</text>
    <rect x="268" y="157" width="72" height="18" rx="9"
      class="fill-orange-100 dark:fill-orange-900"/>
    <text x="304" y="169" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-orange-700 dark:fill-orange-300">Component</text>

    <!-- ─── Branch separator ─── -->
    <line x1="46" y1="190" x2="440" y2="190" stroke-width="1" stroke-dasharray="3 3"
      class="stroke-slate-100 dark:stroke-slate-800"/>

    <!-- ─── ComponentGroup (under Page, branch 2) ─── -->
    <circle cx="66" cy="210" r="4" class="fill-slate-400 dark:fill-slate-500"/>
    <text x="78" y="213" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">ComponentGroup</text>
    <rect x="208" y="201" width="74" height="18" rx="9"
      class="fill-slate-100 dark:fill-slate-800"/>
    <text x="245" y="213" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-slate-500 dark:fill-slate-400">page content</text>

    <!-- ─── ComponentPosition → Component (under Page CG) ─── -->
    <circle cx="90" cy="240" r="4" class="fill-slate-400 dark:fill-slate-500"/>
    <text x="102" y="243" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">ComponentPosition</text>
    <text x="232" y="243" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">→</text>
    <rect x="244" y="231" width="72" height="18" rx="9"
      class="fill-orange-100 dark:fill-orange-900"/>
    <text x="280" y="243" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-orange-700 dark:fill-orange-300">Component</text>

  </svg>
</template>
