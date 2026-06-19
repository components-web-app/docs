import DiagramArchitecture from '~/components/content/Diagram/Architecture.vue'
import DiagramBlogExample from '~/components/content/Diagram/BlogExample.vue'
import DiagramCiPipeline from '~/components/content/Diagram/CiPipeline.vue'
import DiagramDynamicPage from '~/components/content/Diagram/DynamicPage.vue'
import DiagramNestedPages from '~/components/content/Diagram/NestedPages.vue'
import DiagramResourceChain from '~/components/content/Diagram/ResourceChain.vue'
import DiagramStaticPage from '~/components/content/Diagram/StaticPage.vue'
import DiagramChart from '~/components/content/Diagram/Chart.vue'

// Register Diagram components under their short names so MDCRenderer can
// resolve <DiagramXxx /> in markdown. Files stay in components/content/ so
// @nuxt/content treats them as safe block-level elements (no content cutoff).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('DiagramArchitecture', DiagramArchitecture)
  nuxtApp.vueApp.component('DiagramBlogExample', DiagramBlogExample)
  nuxtApp.vueApp.component('DiagramCiPipeline', DiagramCiPipeline)
  nuxtApp.vueApp.component('DiagramDynamicPage', DiagramDynamicPage)
  nuxtApp.vueApp.component('DiagramNestedPages', DiagramNestedPages)
  nuxtApp.vueApp.component('DiagramResourceChain', DiagramResourceChain)
  nuxtApp.vueApp.component('DiagramChart', DiagramChart)
  nuxtApp.vueApp.component('DiagramStaticPage', DiagramStaticPage)
})
