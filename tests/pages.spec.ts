import { test, expect } from '@playwright/test'

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/built-for-business', name: 'built-for-business' },
  { path: '/getting-started', name: 'getting-started' },
  { path: '/getting-started/installation', name: 'installation' },
  { path: '/basic-usage/pages-and-layouts', name: 'pages-and-layouts' },
  { path: '/basic-usage/create-your-first-component', name: 'create-your-first-component' },
]

for (const route of ROUTES) {
  test(`${route.name} - loads without error`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    const response = await page.goto(route.path)
    expect(response?.status()).toBe(200)

    // Wait for hydration
    await page.waitForLoadState('networkidle')
    expect(errors, `Console errors on ${route.path}: ${errors.join(', ')}`).toHaveLength(0)
  })
}

test('home - hero section renders', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('header')).toBeVisible()
  // CWA logo SVG in the hero
  await expect(page.locator('main svg').first()).toBeVisible()
})

test('home - features section renders', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('all the hard work is done for you', { exact: false })).toBeVisible()
})

test('about - hero title renders', async ({ page }) => {
  await page.goto('/about')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1').first()).toBeVisible()
})

test('about - video embed renders', async ({ page }) => {
  await page.goto('/about')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('iframe[src*="vimeo"]')).toBeVisible()
})

test('built-for-business - hero renders', async ({ page }) => {
  await page.goto('/built-for-business')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1').first()).toBeVisible()
})

test('nav - header links are present', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('header')).toBeVisible()
  await expect(page.locator('header').getByRole('link', { name: /about/i })).toBeVisible()
  await expect(page.locator('header').getByRole('link', { name: /docs/i })).toBeVisible()
})

test('docs - getting-started renders content', async ({ page }) => {
  await page.goto('/getting-started')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1').first()).toBeVisible()
  // Sidebar navigation should be present
  await expect(page.locator('aside').first()).toBeVisible()
})

test('docs - installation page renders content', async ({ page }) => {
  await page.goto('/getting-started/installation')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1').filter({ hasText: /install/i })).toBeVisible()
})

// Visual snapshots — run once on main to create baseline, then compare on migration branch
for (const route of ROUTES) {
  test(`${route.name} - visual snapshot`, async ({ page }) => {
    await page.goto(route.path)
    await page.waitForLoadState('networkidle')
    // Wait for fonts and images to settle
    await page.waitForTimeout(1000)
    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    })
  })
}
