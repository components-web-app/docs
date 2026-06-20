export default defineAppConfig({
  ui: {
    variables: {
      dark: {
        foreground: 'var(--color-gray-200)'
      }
    },
    colors: {
      primary: 'teal',
      neutral: 'zinc'
    },
    pageSection: {
      slots: {
        description: 'text-base sm:text-lg/8 text-zinc-600 dark:text-zinc-300'
      }
    },
    pageHero: {
      slots: {
        container: 'flex flex-col lg:grid py-8 sm:py-16 lg:py-16 gap-8 sm:gap-y-16',
        title: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-highlighted',
        description: 'mt-6 text-lg sm:text-lg tracking-tight text-zinc-600 dark:text-muted flex justify-center'
      }
    },
    pageCard: {
      slots: {
        leadingIcon: 'size-8 shrink-0'
      }
    },
    page: {
      slots: {
        root: 'lg:gap-8 lg:grid-cols-8',
        left: 'lg:col-span-2',
        center: 'lg:col-span-6',
      },
      compoundVariants: [{
        left: true,
        right: true,
        class: {
          center: 'lg:col-span-4'
        }
      }]
    },
    footer: {
      slots: {
        left: 'text-sm text-zinc-500 dark:text-zinc-400',
        root: 'border-t border-t-zinc-200 dark:border-t-zinc-800'
      }
    }
  },
  seo: {
    siteName: 'CWA (Components Web App)'
  },
  header: {
    logo: {
      alt: 'CWA Logo',
      light: '/logo-light.svg',
      dark: '/logo-dark.svg'
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/components-web-app/components-web-app',
      'target': '_blank',
      'aria-label': 'CWA on GitHub'
    }]
  },
  footer: {
    credits: 'Copyright © 2026',
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-instagram',
      'to': 'https://www.instagram.com/cwa.rocks',
      'target': '_blank',
      'aria-label': 'CWA Website'
    }, {
      'icon': 'i-simple-icons-x',
      'to': 'https://x.com/cwa_rocks',
      'target': '_blank',
      'aria-label': 'CWA on X'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/components-web-app/components-web-app',
      'target': '_blank',
      'aria-label': 'CWA on GitHub'
    }]
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/components-web-app/docs/edit/main/content',
      links: [{
        icon: 'i-heroicons-star',
        label: 'Star on GitHub',
        to: 'https://github.com/components-web-app/components-web-app',
        target: '_blank'
      }]
    }
  }
})
