<template>
  <div class="not-prose my-8 select-none">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <!-- macOS-style title bar -->
      <div class="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <span class="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span class="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </div>

      <div class="px-5 py-4 space-y-1 font-mono text-sm">
        <!-- Optional root directory -->
        <div v-if="root" class="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
          <FolderIcon class="w-4 h-4 shrink-0 text-amber-400" />
          <span>{{ root }}</span>
        </div>

        <!-- Flattened tree rows -->
        <div
          v-for="(node, i) in flatNodes"
          :key="i"
          class="flex items-center gap-2"
          :style="{ paddingLeft: `${(node.depth + (root ? 1 : 0)) * 1.25}rem` }"
        >
          <FolderIcon v-if="node.type === 'dir'" class="w-4 h-4 shrink-0 text-amber-400" />
          <VueBadge v-else-if="node.type === 'vue'" :variant="node.variant" class="shrink-0" />
          <PhpBadge v-else-if="node.type === 'php'" class="shrink-0" />
          <TsBadge v-else-if="node.type === 'ts'" class="shrink-0" />
          <FileIcon v-else class="w-4 h-4 shrink-0 text-slate-400" />

          <span :class="node.type === 'dir' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'">
            {{ node.name }}
          </span>

          <span v-if="node.label" class="ml-1 font-sans text-[11px] text-slate-400 dark:text-slate-500">
            {{ node.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

interface FileEntry {
  path: string
  label?: string
  variant?: string
}

interface FlatNode {
  name: string
  type: 'dir' | 'vue' | 'php' | 'ts' | 'file'
  depth: number
  label?: string
  variant?: string
}

const props = defineProps<{
  root?: string
  files?: FileEntry[]
}>()

function extToType(ext: string): FlatNode['type'] {
  if (ext === 'vue') return 'vue'
  if (ext === 'php') return 'php'
  if (ext === 'ts' || ext === 'js' || ext === 'mjs') return 'ts'
  return 'file'
}

const flatNodes = computed((): FlatNode[] => {
  if (!props.files?.length) return []
  const seen = new Set<string>()
  const result: FlatNode[] = []

  for (const file of props.files) {
    const parts = file.path.split('/').filter(Boolean)

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts.slice(0, i + 1).join('/')
      if (!seen.has(key)) {
        seen.add(key)
        result.push({ name: parts[i] + '/', type: 'dir', depth: i })
      }
    }

    const filename = parts[parts.length - 1]
    const ext = filename.split('.').pop() ?? ''
    result.push({
      name: filename,
      type: extToType(ext),
      depth: parts.length - 1,
      label: file.label,
      variant: file.variant,
    })
  }

  return result
})

// ── Inline icon components ────────────────────────────────────────────────────

const FolderIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="w-4 h-4">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
  </svg>`
}

const FileIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="w-4 h-4">
    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
  </svg>`
}

const VueBadge = {
  props: { variant: { type: String, default: 'green' } },
  setup(p: { variant: string }) {
    const isBlue = p.variant === 'blue'
    return () => h('span', {
      class: `inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold ${
        isBlue
          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
          : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
      }`
    }, 'V')
  }
}

const PhpBadge = {
  template: `<span class="inline-flex items-center justify-center w-5 h-5 rounded text-[8px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">PHP</span>`
}

const TsBadge = {
  template: `<span class="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">TS</span>`
}
</script>
