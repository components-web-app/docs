import type { Component } from 'vue'

// Register every Diagram component under `Diagram<FileName>` so MDCRenderer can
// resolve <DiagramXxx /> in markdown. Files stay in components/content/ so
// @nuxt/content treats them as safe block-level elements (no content cutoff).
//
// The list is generated from the directory, so a new file in
// components/content/Diagram/ is registered without editing this plugin.
const diagrams = import.meta.glob<{ default: Component }>(
  '../components/content/Diagram/*.vue',
  { eager: true },
)

export default defineNuxtPlugin((nuxtApp) => {
  for (const [path, mod] of Object.entries(diagrams)) {
    const fileName = path.split('/').pop()!.replace(/\.vue$/, '')
    nuxtApp.vueApp.component(`Diagram${fileName}`, mod.default)
  }
})
