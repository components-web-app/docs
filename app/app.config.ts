export default defineAppConfig({
  ui: {
    primary: 'teal',
    gray: 'zinc',
    footer: {
      bottom: {
        left: 'text-sm text-gray-500 dark:text-gray-400',
        wrapper: 'border-t border-gray-200 dark:border-gray-800'
      }
    },
    variables: {
      dark: {
        foreground: 'var(--color-gray-200)'
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
    credits: 'Copyright © 2024',
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
      'to': 'https://github.com/components-web-app',
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
