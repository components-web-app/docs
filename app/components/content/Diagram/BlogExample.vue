<template>
  <svg viewBox="0 0 380 240" class="w-full max-w-lg mx-auto block my-8" aria-hidden="true">

    <!-- ─── Connecting lines ─── -->

    <!-- URL → Route -->
    <line x1="20" y1="22" x2="20" y2="44" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- Route → BlogArticle -->
    <line x1="20" y1="52" x2="20" y2="80" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="20" y1="80" x2="40" y2="80" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- BlogArticle → {title, htmlContent, page} -->
    <line x1="44" y1="84" x2="44" y2="176" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="44" y1="112" x2="64" y2="112" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="44" y1="144" x2="64" y2="144" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="44" y1="176" x2="64" y2="176" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- page → layout -->
    <line x1="68" y1="180" x2="68" y2="208" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>
    <line x1="68" y1="208" x2="88" y2="208" stroke-width="1"
      class="stroke-slate-200 dark:stroke-slate-700"/>

    <!-- ─── URL path ─── -->
    <text x="8" y="18" font-size="11" font-family="ui-monospace,monospace"
      class="fill-slate-500 dark:fill-slate-400">/blog/my-first-post</text>

    <!-- ─── Route ─── -->
    <circle cx="20" cy="48" r="4" class="fill-amber-400 dark:fill-amber-500"/>
    <text x="32" y="51" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">Route</text>

    <!-- ─── BlogArticle (PageData) ─── -->
    <circle cx="44" cy="80" r="4" class="fill-violet-500 dark:fill-violet-400"/>
    <text x="56" y="83" font-size="12" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">BlogArticle</text>
    <rect x="140" y="71" width="58" height="18" rx="9"
      class="fill-violet-100 dark:fill-violet-900"/>
    <text x="169" y="83" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-violet-700 dark:fill-violet-300">PageData</text>

    <!-- ─── title property ─── -->
    <circle cx="68" cy="112" r="3" class="fill-slate-300 dark:fill-slate-600"/>
    <text x="78" y="115" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">title</text>
    <text x="106" y="115" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">· "My First Post"</text>

    <!-- ─── htmlContent → HtmlContent component ─── -->
    <circle cx="68" cy="144" r="3" class="fill-slate-300 dark:fill-slate-600"/>
    <text x="78" y="147" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">htmlContent</text>
    <text x="152" y="147" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-400 dark:fill-slate-500">→</text>
    <rect x="164" y="135" width="74" height="18" rx="9"
      class="fill-orange-100 dark:fill-orange-900"/>
    <text x="201" y="147" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-orange-700 dark:fill-orange-300">HtmlContent</text>

    <!-- ─── page → BlogTemplate Page ─── -->
    <circle cx="68" cy="176" r="3" class="fill-slate-300 dark:fill-slate-600"/>
    <text x="78" y="179" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">page</text>
    <text x="78" y="179" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300"> </text>
    <text x="106" y="179" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">BlogTemplate</text>
    <rect x="202" y="167" width="36" height="18" rx="9"
      class="fill-blue-100 dark:fill-blue-900"/>
    <text x="220" y="179" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-blue-700 dark:fill-blue-300">Page</text>

    <!-- ─── layout → CwaLayoutPrimary ─── -->
    <circle cx="92" cy="208" r="3" class="fill-slate-300 dark:fill-slate-600"/>
    <text x="102" y="211" font-size="11" font-family="system-ui,sans-serif"
      class="fill-slate-600 dark:fill-slate-300">layout</text>
    <text x="144" y="211" font-size="11" font-weight="600" font-family="system-ui,sans-serif"
      class="fill-slate-800 dark:fill-slate-100">CwaLayoutPrimary</text>
    <rect x="278" y="199" width="44" height="18" rx="9"
      class="fill-emerald-100 dark:fill-emerald-900"/>
    <text x="300" y="211" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif"
      class="fill-emerald-700 dark:fill-emerald-300">Layout</text>

  </svg>
</template>
