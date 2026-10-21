import { fileURLToPath } from 'node:url'

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
    '@nuxt/scripts'
  ],

  // Used by nuxt-og-image (absolute og:image URLs). Canonical URLs, the sitemap and
  // structured data use the same origin (app/utils/site.ts).
  site: {
    url: 'https://cwa.rocks',
    name: 'CWA (Components Web App)'
  },

  // The site is prerendered (nuxt generate), so OG images are generated at build time
  // only. There is no runtime image endpoint to abuse, so no signing secret is needed.
  ogImage: {
    zeroRuntime: true
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    disableTransition: true,
    preference: 'dark',
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
      // The docs chat assistant (docs #1). Decided at build time, so a deploy without an
      // Anthropic key ships no chat button. The key itself is only read by /api/chat.
      chat: {
        enabled: Boolean(process.env.NUXT_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY)
          || ['1', 'true'].includes(process.env.NUXT_CHAT_MOCK ?? '')
      },
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
    '/api/search.json': { prerender: true },
    // cwa-api was one page until it was split into per-service sub-pages
    '/nuxt-module/cwa-api': { redirect: { to: '/nuxt-module/cwa-api/overview', statusCode: 301 } },
    // The template replaced Behat with PHPUnit functional tests
    '/deployment/faster-behat-tests': { redirect: { to: '/deployment/faster-functional-tests', statusCode: 301 } },
    // The API section was restructured: users-and-security split into users/*, data-fixtures into data-fixtures/*,
    // and the overview became the section's index page
    '/api/users-and-security': { redirect: { to: '/api/users/authentication', statusCode: 301 } },
    '/api/data-fixtures': { redirect: { to: '/api/data-fixtures/getting-started', statusCode: 301 } },
    '/api/overview': { redirect: { to: '/api', statusCode: 301 } },
    // The form composables moved out of component/ into their own form/ folder
    '/nuxt-module/composables/component/use-cwa-form': { redirect: { to: '/nuxt-module/composables/form/use-cwa-form', statusCode: 301 } },
    '/nuxt-module/composables/component/use-cwa-form-input': { redirect: { to: '/nuxt-module/composables/form/use-cwa-form-input', statusCode: 301 } },
    '/nuxt-module/composables/component/use-cwa-form-repeated': { redirect: { to: '/nuxt-module/composables/form/use-cwa-form-repeated', statusCode: 301 } },
    '/nuxt-module/composables/component/use-cwa-form-collection': { redirect: { to: '/nuxt-module/composables/form/use-cwa-form-collection', statusCode: 301 } },
    // The hand-written upgrade pages were replaced by the Releases page, which shows each release's notes from GitHub
    '/api/upgrading': { redirect: { to: '/getting-started/releases', statusCode: 301 } },
    '/nuxt-module/upgrading': { redirect: { to: '/getting-started/releases', statusCode: 301 } },
    '/deployment/upgrading-the-template': { redirect: { to: '/getting-started/releases', statusCode: 301 } }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    // The quiz bank (quiz/config.yml and quiz/bank/**) for the /api/quiz/* routes (server/utils/quiz-bank.ts)
    serverAssets: [
      { baseName: 'quiz', dir: fileURLToPath(new URL('./quiz', import.meta.url)), pattern: '**/*.yml' }
    ],
    prerender: {
      routes: [
        '/',
        '/llms.txt',
        '/llms-full.txt',
        '/sitemap.xml',
        '/robots.txt',
        '/api/stats.json',
        '/api/releases.json',
        // The chat assistant's retrieval corpus, fetched by the /api/chat edge function
        '/api/chat-index.json',
        // Server-highlighted snippets for the marketing pages (useHighlightedCode)
        '/api/highlighted-code/index.json',
        '/api/highlighted-code/about.json',
        // The quiz: two page shells, and its data, which no page links to
        '/quiz',
        '/quiz/play',
        '/api/quiz/config.json',
        ...['beginner', 'intermediate', 'advanced', 'expert', 'whats-new'].flatMap(level => [
          `/api/quiz/questions/${level}.json`,
          `/api/quiz/keys/${level}.json`
        ])
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
        '@vue/devtools-kit',
        'highcharts/esm/highcharts.js',
        'highcharts/esm/modules/sankey.js',
        'highcharts/esm/modules/organization.js'
      ]
    },
    ssr: {
      noExternal: ['highcharts']
    }
  },
  ui: {
    prose: true
  }
})
