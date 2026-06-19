<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'
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
      icon="i-heroicons-exclamation-triangle"
      color="warning"
      variant="subtle"
      title="The CWA is in heavy development"
      description="The CWA is still in alpha and not ready for production - some code and implementations are likely to change. If you would like to try out the CWA, please enjoy what we have provided and feel free to provide feedback, or get involved on GitHub."
      class="mt-8"
    />

    <UPageHeader
      :title="page.title"
      :description="page.description"
      :links="page.links"
    >
      <template #headline>
        <UBadge v-if="page.badge" v-bind="{ variant: 'subtle', size: 'sm', ...page.badge }" class="mb-1" />
        <span v-if="headline" class="block">{{ headline }}</span>
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
