/** The production origin. Used for canonical URLs, og:url, the sitemap and structured data. */
export const SITE_URL = 'https://cwa.rocks'

export type SiteLink = {
  label: string
  icon?: string
  to: string
  target?: string
}

/** The main site navigation: header, mobile menu, footer and the 404 page all use it. */
export const siteLinks: SiteLink[] = [
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
    label: 'Quiz',
    icon: 'i-heroicons-academic-cap-solid',
    to: '/quiz'
  },
  {
    label: 'Try It Out',
    icon: 'i-ph-play-duotone',
    to: 'https://preview.cwa.rocks/login',
    target: '_blank'
  }
]

/** `https://cwa.rocks/<path>` without a trailing slash (except the home page). */
export function absoluteUrl(path: string) {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  return `${SITE_URL}${clean}`
}
