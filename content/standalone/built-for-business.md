---
title: Built for Business
description: What sets CWA apart, a link to how it compares, and when to choose it or not. Rendered in the middle of the Built for Business page.
---

## What sets it apart

**Editing on the page, MIT licensed and self-hosted.** Editors switch to edit mode on the live site and change the page they are looking at. There is no separate CMS application and no hosted editor. The API bundle and the Nuxt module are MIT licensed, and you run them on your own servers.

**Guard-rails for the brand.** You decide which component types each component group accepts, and which preset styles an editor can pick for each component. Editors change content, not your design. See [Components](/core-concepts/components) and [Draft and Publish](/core-concepts/draft-and-publish).

**The production stack included.** A project made with `pnpm create cwa` already has:

- Docker for local development, and for production on one server (a preview for now);
- a Helm chart for Kubernetes;
- GitLab and GitHub pipelines that build, test and deploy;
- an HTTP page cache that is purged by tag when content changes, with optional Cloudflare edge purges;
- Mercure, so open browsers hear about a publish straight away;
- scheduled publishing for components and for whole pages.

See [Deployment](/deployment) for the full list.

## How CWA compares

Weighing CWA against a headless CMS, a page builder or WordPress? [How CWA Compares](/compare) puts CWA side by side with the products teams usually consider, with the reason behind each mark.

## When to choose CWA

- You build bespoke websites for clients, and want them to edit content without breaking the design.
- Your team knows PHP and Vue, or Symfony and Nuxt.
- You want to self-host, own your data, and avoid per-seat CMS fees.
- You want one component library you can reuse across sites.
- You want the deployment, caching and real-time pieces to come ready-made.

## When not to choose CWA

CWA isn't the right choice for every project.

- **You want a single JavaScript stack.** CWA's API is PHP (Symfony). If your team only writes JavaScript or TypeScript, a Node.js CMS fits better.
- **You need a stable release now.** CWA 2 is a prerelease (2.0.0-alpha), heading for a beta. It runs production sites; configuration can still change between releases, always with upgrade notes. See [Releases › Versions and support](/getting-started/releases#versions-and-support).
- **You have no PHP skills on the team.** Every component has a PHP entity as well as a Vue file.
- **Your editors want free design control.** CWA deliberately limits editors to the components and styles your developers provide. If editors should design pages freely, a page builder fits better.
- **You don't want to run servers.** CWA is self-hosted. In production it runs on Docker on your own server (a preview for now) or on Kubernetes, which is supported and the way to scale (see [Deploying a CWA Site](/deployment)). A hosted CMS removes that work.
- **Your content lives in Git.** If your editors are happy committing Markdown and you don't need draft and publish states, a Git-based editor is simpler.
