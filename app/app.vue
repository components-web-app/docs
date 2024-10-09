<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

const { seo } = useAppConfig()

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', {
  default: () => [],
  server: false
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogImage: 'https://docs.cwa.rocks/social-card.png',
  twitterImage: 'https://docs.cwa.rocks/social-card.png',
  twitterCard: 'summary_large_image'
})

const links = [
  {
    label: 'About',
    icon: 'i-heroicons-book-open-solid',
    to: '/about'
  },
  {
    label: 'Built for Business',
    icon: 'i-heroicons-book-open-solid',
    to: '/built-for-business'
  },
  {
    label: 'Docs',
    icon: 'i-heroicons-book-open-solid',
    to: '/getting-started'
  },
  {
    label: 'Try It Out',
    icon: 'i-ph-play-duotone',
    to: 'https://preview.cwa.rocks/login',
    target: '_blank'
  }
]

provide('navigation', navigation)
</script>

<template>
  <div>
    <NuxtLoadingIndicator />

    <AppHeader :links="links" />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter :links="links" />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>

    <UNotifications />
  </div>
</template>
