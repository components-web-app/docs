// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/ui',
    '@comark/nuxt',
    'nuxt-og-image',
    'nuxt-svgo',
    '@vite-pwa/nuxt',
    '@nuxt/scripts'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    disableTransition: true
  },

  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml', 'php'],
          theme: { default: 'github-dark', light: 'github-light' }
        }
      }
    }
  },

  runtimeConfig: {
    campaignMonitor: {
      apiKey: '',
      clientId: ''
    },
    public: {
      scripts: {
        cloudflareWebAnalytics: {
          // .env
          // NUXT_PUBLIC_SCRIPTS_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<your-token>
          token: ''
        }
      }
    }
  },

  routeRules: {
    '/api/search.json': { prerender: true }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  typescript: {
    strict: false
  },

  hooks: {
    // Define components as global to use them in `.md` (feel free to add those you need)
    'components:extend': (components) => {
      components
        .filter(c => ['UButton', 'UIcon'].includes(c.pascalName))
        .forEach(c => { c.global = true })
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
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
      cloudflareWebAnalytics: { trigger: 'onNuxtReady' }
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@chenfengyuan/vue-countdown',
        '@vue/devtools-core',
        '@vue/devtools-kit'
      ]
    }
  },
  ui: {
    prose: true
  }
})
