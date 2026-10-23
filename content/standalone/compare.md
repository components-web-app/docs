---
title: How CWA Compares
description: CWA side by side with WordPress, Storyblok, Contentful, Sanity, Payload, Drupal, Webflow and Wix Studio, and with the main ways to give clients an editable website.
---

## Product by product

The table puts CWA beside three of the eight products teams often weigh it against (one on a phone). Choose each product from the menu at the top of its column; the other columns stay where they are. **Accurate as of October 2026:** products and prices change quickly, so check each one's current documentation and pricing before you decide.

::comparison-table
::

::callout{icon="i-heroicons-information-circle"}
**Partly** means the product does some of it, as the note says. **Paid plan** means the free version doesn't include it. **Not checked** means we couldn't confirm it from the product's own pages.
::

## Compared with other approaches

There are several ways to give clients an editable website. This table compares the approaches rather than products.

| | CWA | Hosted visual CMS | Headless CMS with its own admin | Git-based editing | PHP CMS with its own templates |
|---|---|---|---|---|---|
| **Where editors work** | On the live page, in edit mode | In the vendor's editor, with a preview of your site | In a separate admin app | In an editor that commits files | In the CMS's admin, sometimes with a page builder |
| **Draft, publish and scheduling** | Per component, and per page through its route | Usually built in | Varies by product and plan | Through Git branches and merges | Usually built in |
| **Hosting** | Self-hosted | Vendor-hosted (SaaS) | Often both | Your Git host and your site host | Usually self-hosted |
| **Licence and cost** | MIT; you pay for hosting and developers | Subscription, often per seat or tier | Open source, source-available or commercial | Often free | Open source or commercial |
| **Front end** | Nuxt (Vue) | Any, through an SDK | Any, through the API | Usually tied to a static site generator | The CMS's own templates, or headless |
| **Back end** | Symfony and API Platform (PHP) | The vendor's | Varies (often Node.js) | None | PHP |
| **Real-time updates to open pages** | Built in (Mercure) | Varies | Varies | Usually after a rebuild | Varies |
| **Production stack included** | Docker, Helm, CI, page cache, Mercure | Hosted for you | You build it | You build it | Varies |
| **Maturity** | 2.0 prerelease, heading for a beta | Often mature | Often mature | Varies | Often mature |

Examples of each approach: hosted visual CMSs such as Storyblok; headless CMSs such as Strapi, Payload and Directus; Git-based editors such as Nuxt Studio; PHP CMSs such as Sulu, Statamic and Craft.

::callout{icon="i-heroicons-information-circle"}
CWA's closest neighbours are Symfony content platforms. If your team already runs Symfony and API Platform and wants a Nuxt front end with page building, CWA is built for that.
::

## Is CWA right for you?

The comparison shows what CWA does. Whether it fits your project depends on your team and your clients: read [Built for Business](/built-for-business), or [open the playground](https://preview.cwa.rocks/login) and edit a CWA site yourself.

::comparison-sources
::
