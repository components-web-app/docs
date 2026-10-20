---
title: Why CWA
description: What CWA does differently, how it compares with other ways to build an editable website, when not to choose it, and the project's alpha status.
---

CWA is an open-source, self-hosted website platform for Symfony and Nuxt. Your developers build the components. Your clients edit, draft, schedule and publish pages directly on the live site. The template ships the whole production stack.

This page helps you decide whether it fits your project.

## What sets it apart

**Editing on the page, MIT licensed and self-hosted.** Editors switch to edit mode on the live site and change the page they are looking at. There is no separate CMS application and no hosted editor. The API bundle and the Nuxt module are MIT licensed, and you run them on your own servers.

**Guard-rails for the brand.** You decide which component types each component group accepts, and which preset styles an editor can pick for each component. Editors change content, not your design. See [Components](/core-concepts/components) and [Draft and Publish](/core-concepts/draft-and-publish).

**The production stack included.** A project made with `pnpm create cwa` already has:

- Docker for local development and production;
- a Helm chart for Kubernetes;
- GitLab and GitHub pipelines that build, test and deploy;
- an HTTP page cache that is purged by tag when content changes, with optional Cloudflare edge purges;
- Mercure, so open browsers hear about a publish straight away;
- scheduled publishing for components and for whole pages.

See [Deployment](/deployment) for the full list.

## Compared with other approaches

There are several ways to give clients an editable website. The table compares CWA with the main approaches, not with individual products. Products change quickly, so check each one's current documentation and pricing before you decide.

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
| **Maturity** | 2.0 alpha | Often mature | Often mature | Varies | Often mature |

Examples of each approach: hosted visual CMSs such as Storyblok; headless CMSs such as Strapi, Payload and Directus; Git-based editors such as Nuxt Studio; PHP CMSs such as Sulu, Statamic and Craft.

::callout{icon="i-heroicons-information-circle"}
CWA's closest neighbours are Symfony content platforms. If your team already runs Symfony and API Platform and wants a Nuxt front end with page building, CWA is built for that.
::

## When to choose CWA

- You build bespoke websites for clients, and want them to edit content without breaking the design.
- Your team knows PHP and Vue, or Symfony and Nuxt.
- You want to self-host, own your data, and avoid per-seat CMS fees.
- You want one component library you can reuse across sites.
- You want the deployment, caching and real-time pieces to come ready-made.

## When not to choose CWA

CWA isn't the right choice for every project.

- **You want a single JavaScript stack.** CWA's API is PHP (Symfony). If your team only writes JavaScript or TypeScript, a Node.js CMS fits better.
- **You need a stable release now.** CWA 2.0 is in alpha. APIs and configuration can still change between releases. See [Project status](#project-status).
- **You have no PHP skills on the team.** Every component has a PHP entity as well as a Vue file.
- **Your editors want free design control.** CWA deliberately limits editors to the components and styles your developers provide. If editors should design pages freely, a page builder fits better.
- **You don't want to run servers.** CWA is self-hosted. In production it expects Kubernetes, or Docker on your own server. A hosted CMS removes that work.
- **Your content lives in Git.** If your editors are happy committing Markdown and you don't need draft and publish states, a Git-based editor is simpler.

## Project status

CWA 2.0 is in **alpha**: try it, build with it, and give feedback.

- The API bundle (`components-web-app/api-components-bundle`) and the Nuxt module (`@cwa/nuxt`) are released as `2.0.0-alpha` versions, and the template follows them.
- The core model is in place: layouts, pages, component groups, components, routes, and draft and publish.
- Configuration, APIs and behaviour can still change between alpha releases. Some changes need manual upgrade steps.

::callout{icon="i-heroicons-exclamation-triangle" color="warning"}
**Read the upgrade notes before you update.** Each alpha release lists its manual steps on the [Releases](/getting-started/releases) page.
::

Release notes are in each repository's changelog: [API bundle](https://github.com/components-web-app/api-components-bundle/blob/main/CHANGELOG.md), [Nuxt module](https://github.com/components-web-app/cwa-nuxt-module/blob/main/CHANGELOG.md) and [template](https://github.com/components-web-app/components-web-app/blob/main/CHANGELOG.md).

CWA is MIT-licensed (the template's [LICENSE](https://github.com/components-web-app/components-web-app/blob/main/LICENSE) and the API bundle's [LICENSE](https://github.com/components-web-app/api-components-bundle/blob/main/LICENSE)). Report a security problem privately, as the template's [SECURITY.md](https://github.com/components-web-app/components-web-app/blob/main/SECURITY.md) describes, never in a public issue. There's no warranty and no guaranteed response time. To contribute, start with [CONTRIBUTING.md](https://github.com/components-web-app/components-web-app/blob/main/CONTRIBUTING.md). See [Introduction › Licence, security and contributing](/getting-started#licence-security-and-contributing).

## Next steps

- [Open the playground](https://preview.cwa.rocks/login) to try editing a CWA site. Sign in with the username and password `admin`.
- [Install CWA](/getting-started/installation) and build your first site.
- Read [Key Ideas](/getting-started/key-ideas) for the terms the guides use.
