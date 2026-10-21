---
title: Privacy
description: What cwa.rocks collects when you visit, who it is shared with, and how to ask us to remove it.
---

This page covers the cwa.rocks website and its documentation. It doesn't cover the CWA software you install: a site you build with CWA has its own privacy policy, and what it collects is up to you.

The site is run by **Silverback Internet Services Limited**. Contact us about anything on this page at [hello@cwa.rocks](mailto:hello@cwa.rocks).

## What we collect

### Visits: Cloudflare Web Analytics

We count page views with [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). It records the page you visited, the page you came from, your browser and device type, and your country. Cloudflare says it uses no cookies, no local storage and no fingerprinting, so we can't identify you from it.

### Hosting

The site is hosted on Vercel. Like any web server, Vercel receives your IP address and browser details with each request, and may keep them in its logs to run and protect the service. We don't use those logs to identify visitors.

### Your email address, if you sign up

Some visitors see a sign-up form for updates about CWA. If you submit it, your email address is added to our mailing list at [Campaign Monitor](https://www.campaignmonitor.com/), our email provider. We use it only to send you CWA news. Campaign Monitor may record when you open an email or click a link in it.

Every email has an unsubscribe link. To have your address removed completely, email [hello@cwa.rocks](mailto:hello@cwa.rocks).

### The docs chat assistant

The **Ask AI** button opens an assistant that answers questions from these docs. It only sends anything when you ask a question. Then our server function on Vercel sends [Anthropic](https://www.anthropic.com/), whose Claude model writes the answer:

- your question;
- the earlier questions and answers in the same conversation, so it can follow on;
- the passages of these docs that best match your question.

It doesn't send your IP address, cookies or anything else about you to Anthropic.

We store nothing. The conversation is kept only in your open browser tab, and it's gone when you reload or close the tab. To stop one address asking too many questions, the server function counts your IP address's questions in memory for up to a day, and doesn't write it anywhere. Hosting logs are covered under [Hosting](#hosting).

Anthropic handles what we send under its commercial terms. It doesn't use it to train its models, and it deletes it within 30 days, unless it has to keep it longer to enforce its Usage Policy or by law. See Anthropic's [Is my data used for model training?](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training) and [How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data).

Please don't put personal or confidential details in your questions.

## Cookies and storage in your browser

We don't use advertising or tracking cookies. The site stores these small values in your browser:

| Name | Type | What it's for | How long |
|------|------|---------------|----------|
| `vip`, `vip-expires` | Cookie | Shows the sign-up offer after you open a `/vip` link | 24 hours |
| `vip-shown` | Cookie | Stops the sign-up panel opening again on every page | 1 hour |
| `nuxt-color-mode` | Local storage | Remembers light or dark mode, if you choose one | Until you clear it |
| `cwa-docs-alpha-notice-dismissed` | Local storage | Remembers that you closed the alpha notice in the docs | Until you clear it |

None of these leave your browser except the two `vip` cookies, which are sent back to cwa.rocks only.

## Content from other services

Some pages load content from other services, which then receive your IP address and browser details:

- **Vimeo:** the About page embeds a video from Vimeo. Vimeo may set its own cookies when the player loads. See [Vimeo's privacy policy](https://vimeo.com/privacy).
- **GitHub avatars:** the home page shows contributors' GitHub profile pictures, loaded through GitHub and Nuxt's image service (`ipx.nuxt.com`).

Fonts and the docs search are served from cwa.rocks itself, so they send nothing to anyone else.

## Changes

If what the site collects changes, we'll update this page.
