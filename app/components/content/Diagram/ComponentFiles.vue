<template>
  <div class="not-prose my-8 select-none">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <!-- Header bar -->
      <div class="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <span class="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span class="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </div>

      <div class="px-5 py-4 space-y-0.5 font-mono text-sm">
        <!-- Root directory -->
        <div class="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <FolderIcon class="w-4 h-4 text-amber-400 shrink-0" />
          <span>app/cwa/components/</span>
        </div>

        <!-- Title/ folder -->
        <div class="flex items-center gap-2 pl-5 text-slate-600 dark:text-slate-300">
          <span class="text-slate-300 dark:text-slate-600 select-none">└─</span>
          <FolderIcon class="w-4 h-4 text-amber-400 shrink-0" />
          <span>Title/</span>
        </div>

        <!-- Title.vue (display) -->
        <div class="flex items-center gap-2 pl-10">
          <span class="text-slate-300 dark:text-slate-600 select-none">├─</span>
          <VueFileIcon class="w-4 h-4 shrink-0" />
          <span class="text-slate-700 dark:text-slate-200">Title.vue</span>
          <span class="ml-2 text-[11px] text-slate-400 dark:text-slate-500">display component</span>
        </div>

        <!-- admin/ folder -->
        <div class="flex items-center gap-2 pl-10 text-slate-600 dark:text-slate-300">
          <span class="text-slate-300 dark:text-slate-600 select-none">└─</span>
          <FolderIcon class="w-4 h-4 text-amber-400 shrink-0" />
          <span>admin/</span>
        </div>

        <!-- admin/Title.vue -->
        <div class="flex items-center gap-2 pl-[3.75rem]">
          <span class="text-slate-300 dark:text-slate-600 select-none">└─</span>
          <VueFileIcon class="w-4 h-4 shrink-0" variant="blue" />
          <span class="text-slate-700 dark:text-slate-200">Title.vue</span>
          <span class="ml-2 text-[11px] text-slate-400 dark:text-slate-500">admin editing tab</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const FolderIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`
}

const VueFileIcon = {
  props: { variant: { type: String, default: 'green' } },
  template: `
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect width="20" height="20" rx="4" :fill="variant === 'blue' ? '#dbeafe' : '#dcfce7'" class="dark:opacity-20" />
      <rect width="20" height="20" rx="4" :fill="variant === 'blue' ? '#1d4ed8' : '#16a34a'" class="opacity-0 dark:opacity-30" />
      <text x="4" y="14" font-family="system-ui" font-size="9" font-weight="700" :fill="variant === 'blue' ? '#1d4ed8' : '#15803d'">V</text>
    </svg>
  `
}
</script>
