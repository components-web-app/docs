import { fileURLToPath } from 'node:url'
import { SITE_ORIGIN, channelPrefix, findChannel, resolveChannelId, versionRewrites } from './shared/docs-versions'

// Which documentation version this build is, and the path it's served under: '' for the
// current version, `/edge` or `/2.0` for the others (shared/docs-versions.ts, VERSIONS.md)
const docsChannelId = resolveChannelId(process.env.NUXT_PUBLIC_DOCS_CHANNEL, process.env.VERCEL_GIT_COMMIT_REF)
const docsPrefix = channelPrefix(findChannel(docsChannelId)!)

type RouteRulesMap = Record<string, { prerender?: boolean, redirect?: { to: string, statusCode: 301 | 302 | 307 | 308 } }>

/**
 * A version under a path (/edge, /2.0) redirects to pages under the same path. Nitro matches
 * the rule's key without the base URL, so only the target gets the prefix here.
 */
function withVersionPrefix(rules: RouteRulesMap): RouteRulesMap {
  if (!docsPrefix) {
    return rules
  }
  return Object.fromEntries(Object.entries(rules).map(([path, rule]) => [path, rule.redirect
    ? { ...rule, redirect: { ...rule.redirect, to: `${docsPrefix}${rule.redirect.to}` } }
    : rule]))
}

/**
 * Vercel's routes match the full URL, base included, while the routes Nitro writes for
 * redirect rules leave the base out. So a version under a path adds its own.
 */
function vercelRedirects(rules: RouteRulesMap) {
  if (!docsPrefix) {
    return []
  }
  return Object.entries(rules).filter(([, rule]) => rule.redirect).map(([path, rule]) => ({
    src: `^${`${docsPrefix}${path}`.replace(/[.]/g, '\\.')}/?$`,
    status: rule.redirect!.statusCode,
    headers: { Location: rule.redirect!.to }
  }))
}

const routeRules = withVersionPrefix({
  '/api/search.json': { prerender: true },
  // Why CWA was split between Built for Business and the comparison page
  '/why-cwa': { redirect: { to: '/compare', statusCode: 301 } },
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
})

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
  // structured data use the same origin, plus the version's path (shared/docs-versions.ts).
  site: {
    url: SITE_ORIGIN,
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

  // Every version is served from one origin, under its own path (app.baseURL)
  app: {
    baseURL: `${docsPrefix}/`
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
      // The documentation version this build documents (shared/docs-versions.ts). Not named
      // docsChannel: NUXT_PUBLIC_DOCS_CHANNEL would override it at run time, and "2.0" would
      // be read as the number 2.
      docsVersion: docsChannelId,
      scripts: {
        cloudflareWebAnalytics: {
          // .env
          // NUXT_PUBLIC_SCRIPTS_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<your-token>
          token: ''
        }
      }
    }
  },

  routeRules,

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    // On Vercel, the current version's build sends /edge/... and older versions' paths on to
    // their own deployments (shared/docs-versions.ts › versionRewrites). Routes listed here
    // come before Vercel's filesystem check.
    vercel: {
      config: {
        routes: [...versionRewrites(docsChannelId), ...vercelRedirects(routeRules)]
      }
    },
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
        // The version switcher reads it from the other versions' deployments
        '/api/docs-version.json',
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

  // Under a path (/edge, /2.0), image sources carry the base URL, so the image server would
  // read `/edge/logo.svg` as `public/edge/logo.svg`. The alias sends it to `public/logo.svg`.
  image: {
    alias: docsPrefix ? { [`${docsPrefix}/`]: '/' } : {}
  },

  icon: {
    // Icons rendered only in the browser (the version switcher's menu) must be in the client
    // bundle: the prerendered site has no icon API to fetch them from
    clientBundle: {
      icons: ['heroicons:check-20-solid']
    },
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
