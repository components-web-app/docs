// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],

  build: { transpile: ['shiki'] },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxthq/studio',
    'nuxt-og-image',
    'nuxt-svgo',
    '@vite-pwa/nuxt',
    '@nuxt/scripts'
  ],

  runtimeConfig: {
    campaignMonitor: {
      apiKey: '',
      clientId: ''
    }
  },

  hooks: {
    // Define `@nuxt/ui` components as global to use them in `.md` (feel free to add those you need)
    'components:extend': (components) => {
      const globals = components.filter(c => ['UButton', 'UIcon'].includes(c.pascalName))

      globals.forEach(c => c.global = true)
    }
  },

  colorMode: {
    disableTransition: true
  },

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  routeRules: {
    '/api/search.json': { prerender: true }
  },

  devtools: {
    enabled: true
  },

  typescript: {
    strict: false
  },

  future: {
    compatibilityVersion: 4
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  uiPro: {
    license: 'oss'
  },

  content: {
    highlight: {
      langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml', 'php'],
      themes: ['github-dark', 'github-light'],
      theme: {
        default: 'github-dark',
        light: 'github-light'
      }
    }
  },

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/custom-icons'
      }
    ]
  },

  pwa: {
    manifest: {
      name: 'CWA',
      short_name: 'CWA',
      theme_color: '#000000',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }
  },

  scripts: {
    registry: {
      cloudflareWebAnalytics: {
        token: 'c549c6da5f1a47de8622e59fa1db1ff7'
      } // <!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "c549c6da5f1a47de8622e59fa1db1ff7"}'></script><!-- End Cloudflare Web Analytics -->
    }
  },

  fonts: {
    families: [
      {
        name: 'Caveat',
        weights: [400],
        styles: ['normal']
      },
      {
        name: 'JetBrains Mono',
        styles: ['normal'],
        weights: [400, 600]
      },
      {
        name: 'Source Code Pro',
        styles: ['normal'],
        weights: [600]
      }
    ]
  },

  compatibilityDate: '2024-07-11'
})
