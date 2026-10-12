<script setup lang="ts">
import VipSlideover from '~/components/VipSlideover.vue'

const { seo } = useAppConfig()
const route = useRoute()
const canonicalUrl = computed(() => absoluteUrl(route.path))

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
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
    // One URL per page for search engines, without a trailing slash.
    { rel: 'canonical', href: canonicalUrl }
  ],
  htmlAttrs: {
    'lang': 'en',
    'data-vip': isVip.value
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogImage: `${SITE_URL}/social-card.png`,
  twitterImage: `${SITE_URL}/social-card.png`,
  twitterCard: 'summary_large_image',
  twitterSite: '@cwa_rocks',
  themeColor: '#000000'
})

// Structured data for the home page: who publishes the site, and the site itself.
useHead({
  script: computed(() => route.path === '/'
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${SITE_URL}/#organization`,
              'name': seo?.siteName,
              'url': SITE_URL,
              'logo': `${SITE_URL}/icon.png`,
              'sameAs': [
                'https://github.com/components-web-app',
                'https://x.com/cwa_rocks',
                'https://www.instagram.com/cwa.rocks'
              ]
            },
            {
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              'name': seo?.siteName,
              'url': SITE_URL,
              'publisher': { '@id': `${SITE_URL}/#organization` }
            },
            {
              '@type': 'SoftwareSourceCode',
              'name': seo?.siteName,
              'url': SITE_URL,
              'codeRepository': 'https://github.com/components-web-app/components-web-app',
              'programmingLanguage': ['PHP', 'TypeScript', 'Vue'],
              'author': { '@id': `${SITE_URL}/#organization` }
            }
          ]
        })
      }]
    : [])
})

const links = siteLinks

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <AppHeader :links="links" />

    <UMain>
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
