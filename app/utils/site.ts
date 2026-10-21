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
    label: 'Why CWA',
    icon: 'i-heroicons-scale-solid',
    to: '/why-cwa'
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

/** `<siteUrl><path>` without a trailing slash (except the home page). Pass `useDocsChannel().siteUrl`, which includes the version's path. */
export function absoluteUrl(path: string, siteUrl: string) {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  return `${siteUrl}${clean}`
}
