<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb, findPageHeadline } from '@nuxt/content/utils'
import { withoutTrailingSlash } from 'ufo'

definePageMeta({
  layout: 'docs',
  scrollToTop: true
})

const route = useRoute()
const { toc, seo } = useAppConfig()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: page } = await useAsyncData<any>(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('docs', withoutTrailingSlash(route.path), {
    fields: ['title', 'description']
  })
)

useSeoMeta({
  title: page.value.title,
  ogTitle: `${page.value.title} - ${seo?.siteName}`,
  description: page.value.description,
  ogDescription: page.value.description
})

defineOgImage('Docs.satori', {
  title: page.value.title,
  description: page.value.description
})

const headline = computed(() => findPageHeadline(navigation?.value, page.value?.path))

// Breadcrumb structured data: the parent pages, then this page. Folders with no page
// of their own (`page: false`) are left out, because their URL doesn't exist.
useHead({
  script: computed(() => {
    const trail = [
      ...findPageBreadcrumb(navigation?.value, page.value?.path)
        .filter(item => item.page !== false)
        .map(item => ({ title: item.title, path: item.path })),
      { title: page.value?.title, path: page.value?.path }
    ]
    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': trail.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.title,
          'item': absoluteUrl(item.path)
        }))
      })
    }]
  })
})

// The alpha notice is shown until the reader dismisses it. The choice is kept in this
// browser only; storage can be unavailable (private windows), so every access is guarded.
const ALPHA_NOTICE_KEY = 'cwa-docs-alpha-notice-dismissed'
const showAlphaNotice = ref(true)
onMounted(() => {
  try {
    if (localStorage.getItem(ALPHA_NOTICE_KEY) === '1') {
      showAlphaNotice.value = false
    }
  } catch {
    // storage unavailable: keep showing the notice
  }
})
function dismissAlphaNotice(open: boolean) {
  if (open) {
    return
  }
  showAlphaNotice.value = false
  try {
    localStorage.setItem(ALPHA_NOTICE_KEY, '1')
  } catch {
    // storage unavailable: the notice comes back on the next page load
  }
}

const links = computed(() => [toc?.bottom?.edit && {
  icon: 'i-heroicons-pencil-square',
  label: 'Edit this page',
  to: `${toc.bottom.edit}/${page?.value?.stem}.md`,
  target: '_blank'
}, ...(toc?.bottom?.links || [])].filter(Boolean))
</script>

<template>
  <UPage>
    <UAlert
      v-if="showAlphaNotice"
      icon="i-heroicons-beaker"
      color="warning"
      variant="subtle"
      close
      class="mt-6"
      :ui="{ root: 'py-2 px-3', title: 'text-sm font-normal', icon: 'size-4' }"
      @update:open="dismissAlphaNotice"
    >
      <template #title>
        CWA 2.0 is in alpha: try it, build with it, give feedback. APIs can still change between releases; see <NuxtLink to="/getting-started/releases" class="underline">Releases</NuxtLink>.
      </template>
    </UAlert>

    <UPageHeader
      :title="page.title"
      :description="page.description"
      :links="page.links"
    >
      <template #headline>
        <div class="flex flex-col items-start gap-1.5">
          <UBadge
            v-if="page.badge"
            :label="page.badge.label"
            :color="page.badge.color || 'warning'"
            :variant="page.badge.variant || 'solid'"
            size="sm"
          />
          <span v-if="headline">{{ headline }}</span>
        </div>
      </template>
    </UPageHeader>

    <UPageBody prose>
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />

      <hr v-if="surround?.length">

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page.toc !== false"
      #right
    >
      <UContentToc
        :title="toc?.title"
        :links="page.body?.toc?.links"
      >
        <template
          v-if="toc?.bottom"
          #bottom
        >
          <div
            class="hidden lg:block space-y-6"
            :class="{ '!mt-6': page.body?.toc?.links?.length }"
          >
            <USeparator
              v-if="page.body?.toc?.links?.length"
              type="dashed"
            />

            <UPageLinks
              :title="toc.bottom.title"
              :links="links"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
