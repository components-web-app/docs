# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.spec.ts >> home - loads without error
- Location: tests/pages.spec.ts:14:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 503
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Nuxt" [ref=e3] [cursor=pointer]:
    - /url: https://nuxt.com
    - img [ref=e4]
  - button "Animation Enabled" [ref=e7] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const ROUTES = [
  4  |   { path: '/', name: 'home' },
  5  |   { path: '/about', name: 'about' },
  6  |   { path: '/built-for-business', name: 'built-for-business' },
  7  |   { path: '/getting-started', name: 'getting-started' },
  8  |   { path: '/getting-started/installation', name: 'installation' },
  9  |   { path: '/basic-usage/pages-and-layouts', name: 'pages-and-layouts' },
  10 |   { path: '/basic-usage/create-your-first-component', name: 'create-your-first-component' },
  11 | ]
  12 | 
  13 | for (const route of ROUTES) {
  14 |   test(`${route.name} - loads without error`, async ({ page }) => {
  15 |     const errors: string[] = []
  16 |     page.on('pageerror', err => errors.push(err.message))
  17 | 
  18 |     const response = await page.goto(route.path)
> 19 |     expect(response?.status()).toBe(200)
     |                                ^ Error: expect(received).toBe(expected) // Object.is equality
  20 | 
  21 |     // Wait for hydration
  22 |     await page.waitForLoadState('networkidle')
  23 |     expect(errors, `Console errors on ${route.path}: ${errors.join(', ')}`).toHaveLength(0)
  24 |   })
  25 | }
  26 | 
  27 | test('home - hero section renders', async ({ page }) => {
  28 |   await page.goto('/')
  29 |   await page.waitForLoadState('networkidle')
  30 |   await expect(page.locator('header')).toBeVisible()
  31 |   // CWA logo SVG in the hero
  32 |   await expect(page.locator('main svg').first()).toBeVisible()
  33 | })
  34 | 
  35 | test('home - features section renders', async ({ page }) => {
  36 |   await page.goto('/')
  37 |   await page.waitForLoadState('networkidle')
  38 |   await expect(page.getByText('all the hard work is done for you', { exact: false })).toBeVisible()
  39 | })
  40 | 
  41 | test('about - hero title renders', async ({ page }) => {
  42 |   await page.goto('/about')
  43 |   await page.waitForLoadState('networkidle')
  44 |   await expect(page.locator('h1').first()).toBeVisible()
  45 | })
  46 | 
  47 | test('about - video embed renders', async ({ page }) => {
  48 |   await page.goto('/about')
  49 |   await page.waitForLoadState('networkidle')
  50 |   await expect(page.locator('iframe[src*="vimeo"]')).toBeVisible()
  51 | })
  52 | 
  53 | test('built-for-business - hero renders', async ({ page }) => {
  54 |   await page.goto('/built-for-business')
  55 |   await page.waitForLoadState('networkidle')
  56 |   await expect(page.locator('h1').first()).toBeVisible()
  57 | })
  58 | 
  59 | test('nav - header links are present', async ({ page }) => {
  60 |   await page.goto('/')
  61 |   await page.waitForLoadState('networkidle')
  62 |   await expect(page.locator('header')).toBeVisible()
  63 |   await expect(page.locator('header').getByRole('link', { name: /about/i })).toBeVisible()
  64 |   await expect(page.locator('header').getByRole('link', { name: /docs/i })).toBeVisible()
  65 | })
  66 | 
  67 | test('docs - getting-started renders content', async ({ page }) => {
  68 |   await page.goto('/getting-started')
  69 |   await page.waitForLoadState('networkidle')
  70 |   await expect(page.locator('h1').first()).toBeVisible()
  71 |   // Sidebar navigation should be present
  72 |   await expect(page.locator('aside').first()).toBeVisible()
  73 | })
  74 | 
  75 | test('docs - installation page renders content', async ({ page }) => {
  76 |   await page.goto('/getting-started/installation')
  77 |   await page.waitForLoadState('networkidle')
  78 |   await expect(page.locator('h1').filter({ hasText: /install/i })).toBeVisible()
  79 | })
  80 | 
  81 | // Visual snapshots — run once on main to create baseline, then compare on migration branch
  82 | for (const route of ROUTES) {
  83 |   test(`${route.name} - visual snapshot`, async ({ page }) => {
  84 |     await page.goto(route.path)
  85 |     await page.waitForLoadState('networkidle')
  86 |     // Wait for fonts and images to settle
  87 |     await page.waitForTimeout(1000)
  88 |     await expect(page).toHaveScreenshot(`${route.name}.png`, {
  89 |       fullPage: true,
  90 |       maxDiffPixelRatio: 0.02,
  91 |     })
  92 |   })
  93 | }
  94 | 
```