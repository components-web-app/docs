<template>
  <div class="not-prose my-8 select-none">
    <!-- Layout -->
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 shadow-sm">
      <div class="flex items-center gap-2.5 px-5 pt-4 pb-2">
        <span class="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
        <span class="text-[11px] font-bold tracking-[0.08em] uppercase text-blue-600 dark:text-blue-400">Layout</span>
        <span class="text-xs text-slate-400 dark:text-slate-500 truncate">outer shell · header, navigation, footer</span>
        <span class="ml-auto shrink-0 text-[10px] font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">Vue template</span>
      </div>

      <!-- Page -->
      <div class="mx-3 mb-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/70">
        <div class="flex items-center gap-2.5 px-5 pt-4 pb-2">
          <span class="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
          <span class="text-[11px] font-bold tracking-[0.08em] uppercase text-blue-600 dark:text-blue-400">Page</span>
          <span class="text-xs text-slate-400 dark:text-slate-500 truncate">content structure inside the layout</span>
          <span class="ml-auto shrink-0 text-[10px] font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">Vue template</span>
        </div>

        <!-- ComponentGroup -->
        <div class="mx-3 mb-3 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60">
          <div class="flex items-center gap-2.5 px-5 pt-4 pb-2">
            <span class="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
            <span class="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">ComponentGroup</span>
            <span class="text-xs text-slate-400 dark:text-slate-500 truncate">named region · "hero", "main", "sidebar"</span>
            <span class="ml-auto shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full">CWA resource</span>
          </div>

          <!-- Component -->
          <div class="mx-3 mb-3 rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/30">
            <div class="flex items-center gap-2.5 px-5 pt-4 pb-2">
              <span class="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shrink-0" />
              <span class="text-[11px] font-bold tracking-[0.08em] uppercase text-sky-600 dark:text-sky-400">Component</span>
              <span class="text-xs text-slate-400 dark:text-slate-500 truncate">what you build · titles, images, text, links</span>
              <span class="ml-auto shrink-0 text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full">Vue + PHP</span>
            </div>
            <p class="px-5 pb-4 text-[11px] text-slate-400 dark:text-slate-500">one PHP entity · one Vue component · one admin tab</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
