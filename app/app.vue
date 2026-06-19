<script setup lang="ts">
import VipSlideover from '~/components/VipSlideover.vue'

const { seo } = useAppConfig()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const { data: files } = useLazyFetch('/api/search.json', {
  default: () => [],
  server: false
})

const { isVip } = useVip()
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    'lang': 'en',
    'data-vip': isVip.value
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogImage: 'https://cwa.rocks/social-card.png',
  twitterImage: 'https://cwa.rocks/social-card.png',
  twitterCard: 'summary_large_image'
})

const links = [
  {
    label: 'About',
    icon: 'i-custom-c-icon',
    to: '/about'
  },
  {
    label: 'Built for Business',
    icon: 'i-heroicons-building-office-solid',
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
  <UApp>
    <NuxtLoadingIndicator />

    <AppHeader :links="links" />

    <UMain class="min-h-0">
      <NuxtLayout>
        <NuxtPage :is-vip="isVip" />
      </NuxtLayout>
    </UMain>

    <AppFooter
      :is-vip="isVip"
      :links="links"
    />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>

    <VipSlideover v-if="isVip" />
  </UApp>
</template>
