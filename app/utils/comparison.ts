// How CWA compares with other ways to build an editable website, product by product.
// One source for the full table on /why-cwa and the five-row summary on the home page.
// Every cell came from the product's own docs, feature or pricing pages, read on COMPARISON_AS_OF.
// Re-check prices and plan limits before changing a cell: they move often.

export const COMPARISON_AS_OF = 'October 2026'

export type ComparisonValue = 'yes' | 'partly' | 'no' | 'paid' | 'planned' | 'unknown' | 'text'

export interface ComparisonCell {
  value: ComparisonValue
  note: string
}

export interface ComparisonProduct {
  id: string
  name: string
  sources: { label: string, url: string }[]
}

export interface ComparisonRow {
  id: string
  label: string
  cells: Record<string, ComparisonCell>
}

export const COMPARISON_PRODUCTS: ComparisonProduct[] = [
  { id: 'cwa', name: 'CWA', sources: [] },
  {
    id: 'wordpress',
    name: 'WordPress',
    sources: [
      { label: 'Synced patterns', url: 'https://wordpress.org/documentation/article/reusable-blocks/' },
      { label: 'Post status', url: 'https://wordpress.org/documentation/article/post-status/' },
      { label: 'Curating the editor', url: 'https://developer.wordpress.org/block-editor/how-to-guides/curating-the-editor-experience/' },
      { label: 'Caching', url: 'https://developer.wordpress.org/advanced-administration/performance/cache/' },
      { label: 'Licence', url: 'https://wordpress.org/about/license/' },
      { label: 'Elementor pricing', url: 'https://elementor.com/pricing/' }
    ]
  },
  {
    id: 'storyblok',
    name: 'Storyblok',
    sources: [
      { label: 'Visual Editor', url: 'https://www.storyblok.com/docs/concepts/visual-editor' },
      { label: 'Fields', url: 'https://www.storyblok.com/docs/concepts/fields' },
      { label: 'Cache invalidation', url: 'https://www.storyblok.com/docs/api/content-delivery/v2/getting-started/cache-invalidation' },
      { label: 'Pricing', url: 'https://www.storyblok.com/pricing' }
    ]
  },
  {
    id: 'contentful',
    name: 'Contentful',
    sources: [
      { label: 'Live preview', url: 'https://www.contentful.com/developers/docs/tutorials/preview/live-preview/' },
      { label: 'Webhooks', url: 'https://www.contentful.com/help/faq/webhooks/' },
      { label: 'Pricing', url: 'https://www.contentful.com/pricing/' }
    ]
  },
  {
    id: 'sanity',
    name: 'Sanity',
    sources: [
      { label: 'Visual editing overlays', url: 'https://www.sanity.io/docs/visual-editing/visual-editing-overlays' },
      { label: 'Caching in Next.js', url: 'https://www.sanity.io/docs/nextjs/caching-and-revalidation-in-nextjs' },
      { label: 'Repository and licence', url: 'https://github.com/sanity-io/sanity' },
      { label: 'Pricing', url: 'https://www.sanity.io/pricing' }
    ]
  },
  {
    id: 'payload',
    name: 'Payload',
    sources: [
      { label: 'Live preview', url: 'https://payloadcms.com/docs/live-preview/overview' },
      { label: 'Drafts and scheduling', url: 'https://payloadcms.com/docs/versions/drafts' },
      { label: 'Locked documents', url: 'https://payloadcms.com/docs/admin/locked-documents' },
      { label: 'Plugins', url: 'https://payloadcms.com/docs/plugins/overview' },
      { label: 'Repository and licence', url: 'https://github.com/payloadcms/payload' }
    ]
  },
  {
    id: 'drupal',
    name: 'Drupal',
    sources: [
      { label: 'Internal page cache', url: 'https://www.drupal.org/docs/administering-a-drupal-site/internal-page-cache' },
      { label: 'Cache tags', url: 'https://www.drupal.org/docs/drupal-apis/cache-api/cache-tags' },
      { label: 'Purge', url: 'https://www.drupal.org/project/purge' },
      { label: 'Scheduler', url: 'https://www.drupal.org/project/scheduler' },
      { label: 'Canvas', url: 'https://www.drupal.org/project/canvas' },
      { label: 'Licence', url: 'https://www.drupal.org/about/licensing' }
    ]
  },
  {
    id: 'webflow',
    name: 'Webflow',
    sources: [
      { label: 'Pricing and features', url: 'https://webflow.com/pricing' },
      { label: 'Code components', url: 'https://developers.webflow.com/code-components/introduction' }
    ]
  },
  {
    id: 'wix',
    name: 'Wix Studio',
    sources: [
      { label: 'Plans', url: 'https://www.wix.com/studio/plans' },
      { label: 'Editing permissions', url: 'https://support.wix.com/en/article/studio-editor-editing-permissions-per-page' },
      { label: 'Collaborating on a site', url: 'https://support.wix.com/en/article/studio-editor-collaborating-on-a-site' }
    ]
  }
]

const c = (value: ComparisonValue, note: string): ComparisonCell => ({ value, note })

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: 'live-page',
    label: 'Editors work on the live page of your own front end',
    cells: {
      cwa: c('yes', 'On the live site, in edit mode'),
      wordpress: c('partly', 'In the block editor, styled like your theme; not for a separate front end'),
      storyblok: c('partly', 'Your site in a preview frame inside Storyblok; click a block to edit it'),
      contentful: c('partly', 'Preview frame with links to each field; Studio drag and drop is React-only, on Premium'),
      sanity: c('partly', 'Preview frame in Studio; overlays on your site open Studio to edit'),
      payload: c('partly', 'Preview frame in the admin; a visual editor is coming for Enterprise'),
      drupal: c('partly', 'On pages Drupal renders; a separate front end needs add-ons'),
      webflow: c('partly', 'On the live page, but only for sites built in Webflow'),
      wix: c('partly', 'On the live page, but only for sites built in Wix')
    }
  },
  {
    id: 'guardrails',
    label: 'Developers decide which blocks and styles editors can use',
    cells: {
      cwa: c('yes', 'Allowed components per component group, and preset styles'),
      wordpress: c('yes', 'Allowed blocks, block locking and theme.json presets'),
      storyblok: c('yes', 'Allow or deny blocks per field'),
      contentful: c('yes', 'Validations on which content types a field accepts'),
      sanity: c('yes', 'Allowed types in each schema field'),
      payload: c('yes', 'Allowed blocks per field'),
      drupal: c('partly', 'Layout Builder restrictions come from a contributed module'),
      webflow: c('yes', 'Designer-approved blocks and a content-only editing role'),
      wix: c('partly', 'Roles and per-page permissions; elements can\'t be locked')
    }
  },
  {
    id: 'cache',
    label: 'Publishing clears only the pages that changed, out to the CDN',
    cells: {
      cwa: c('yes', 'Built in, by cache tag; Cloudflare\'s edge needs an API token'),
      wordpress: c('no', 'Left to caching plugins or your host'),
      storyblok: c('no', 'Its API cache updates; your site\'s cache is webhooks you write'),
      contentful: c('partly', 'Its own API CDN purges on publish; your site\'s cache is webhooks you write'),
      sanity: c('partly', 'Automatic on the Next.js App Router; elsewhere webhooks you write'),
      payload: c('no', 'Its website template calls Next.js revalidation; the rest is yours'),
      drupal: c('yes', 'In core, by cache tag; a CDN needs contributed modules'),
      webflow: c('yes', 'Managed, on Webflow\'s own hosting'),
      wix: c('partly', 'Managed; caches are cleared site-wide on publish')
    }
  },
  {
    id: 'scheduling',
    label: 'Drafts and scheduled publishing on the free version',
    cells: {
      cwa: c('yes', 'Drafts per component; scheduling for components and pages'),
      wordpress: c('yes', 'Drafts and scheduled posts in core'),
      storyblok: c('paid', 'Drafts free; scheduling on paid plans'),
      contentful: c('paid', 'Scheduling on paid plans'),
      sanity: c('paid', 'Drafts free; scheduled drafts on paid plans'),
      payload: c('yes', 'Drafts and scheduling; scheduling needs a jobs runner'),
      drupal: c('yes', 'Drafts in core; scheduling with the free Scheduler module'),
      webflow: c('paid', 'Scheduling on the CMS plans'),
      wix: c('yes', 'Scheduling for CMS items and blog posts (plan not checked)')
    }
  },
  {
    id: 'reuse',
    label: 'One piece of content on many pages, edited once',
    cells: {
      cwa: c('yes', 'Shared components'),
      wordpress: c('yes', 'Synced patterns'),
      storyblok: c('yes', 'References'),
      contentful: c('yes', 'References'),
      sanity: c('yes', 'References'),
      payload: c('yes', 'Relationship fields'),
      drupal: c('unknown', 'Not checked for this table'),
      webflow: c('unknown', 'Not checked for this table'),
      wix: c('yes', 'Global sections')
    }
  },
  {
    id: 'realtime',
    label: 'Editors see each other working, in real time',
    cells: {
      cwa: c('planned', 'Changes already reach open pages live; showing who\'s editing is planned'),
      wordpress: c('no', 'Taken out of WordPress 7.0, not on the 7.2 roadmap'),
      storyblok: c('unknown', 'Claimed in its marketing; not found in its docs'),
      contentful: c('paid', 'Live collaboration on paid plans'),
      sanity: c('yes', 'Real-time editing and presence on every plan'),
      payload: c('no', 'One editor per document at a time'),
      drupal: c('no', 'Not in core'),
      webflow: c('yes', 'Real-time collaboration'),
      wix: c('yes', 'Several people can edit at once')
    }
  },
  {
    id: 'open-source',
    label: 'Open source and self-hosted',
    cells: {
      cwa: c('yes', 'MIT, on your own servers'),
      wordpress: c('yes', 'GPLv2 or later'),
      storyblok: c('no', 'Hosted service'),
      contentful: c('no', 'Hosted service'),
      sanity: c('partly', 'The Studio is MIT; your content is hosted by Sanity'),
      payload: c('yes', 'MIT'),
      drupal: c('yes', 'GPLv2 or later'),
      webflow: c('no', 'Hosted service'),
      wix: c('no', 'Hosted service')
    }
  },
  {
    id: 'pricing',
    label: 'How you pay',
    cells: {
      cwa: c('text', 'Free software; you pay for your own hosting'),
      wordpress: c('text', 'Free; Elementor Pro is per site, per year'),
      storyblok: c('text', 'Per plan, plus seats and API requests'),
      contentful: c('text', 'Per plan'),
      sanity: c('text', 'Per seat, plus API requests'),
      payload: c('text', 'Free to self-host'),
      drupal: c('text', 'Free'),
      webflow: c('text', 'Per site, plus per-seat workspace plans'),
      wix: c('text', 'Per site')
    }
  },
  {
    id: 'included',
    label: 'Sign-in, forms, image variants, SEO and deployment included',
    cells: {
      cwa: c('yes', 'All of them, with a deploy pipeline for Docker or Kubernetes'),
      wordpress: c('partly', 'Users and image sizes in core; forms, SEO and caching are plugins'),
      storyblok: c('partly', 'An image service; no visitor sign-in, forms or hosting'),
      contentful: c('partly', 'An image API; no visitor sign-in or forms'),
      sanity: c('partly', 'An image pipeline; no visitor sign-in or forms'),
      payload: c('partly', 'Sign-in, image sizes, and form and SEO plugins; deployment is yours'),
      drupal: c('partly', 'Users and image styles in core; forms and SEO are contributed modules'),
      webflow: c('partly', 'Hosting, forms and SEO; member sign-in ended in January 2026'),
      wix: c('yes', 'Hosting, SEO tools, members and forms (members and forms not re-checked)')
    }
  }
]

// The home page shows the rows where CWA differs most, against the products people ask about most.
export const COMPARISON_HOME_ROWS = ['live-page', 'cache', 'scheduling', 'open-source', 'included']
export const COMPARISON_HOME_PRODUCTS = ['cwa', 'wordpress', 'storyblok', 'sanity', 'payload', 'webflow']
