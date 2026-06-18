import { test } from '@playwright/test'

test('measure detailed section breakdown', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  const data = await page.evaluate(() => {
    function getH(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().height) : null }
    function getTop(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null }

    // Get the home children
    const main = document.querySelector('main')
    const homeDiv = main?.children[0]
    const children = homeDiv ? [...homeDiv.children] : []

    const sections = children.map((el, i) => ({
      i,
      h: getH(el),
      top: getTop(el),
      cls: el.className.substring(0, 80)
    }))

    // Measure HomeContributors internals
    const contribSection = children[6] // relative isolate (HomeContributors UPageSection)
    const contribInternals = contribSection ? {
      root: getH(contribSection),
      // Find UPageSection container
      container: contribSection.querySelector('[data-slot="container"]') ?
        getH(contribSection.querySelector('[data-slot="container"]')) : null,
      // Find UPageCTA
      cta: contribSection.querySelector('[data-orientation]') ?
        getH(contribSection.querySelector('[data-orientation]')) : null,
      ctaContainer: contribSection.querySelector('[data-slot="container"]') ?
        getH(contribSection.querySelector('[data-slot="container"]')) : null,
    } : null

    // Get UPageCTA and its children
    const cta = document.querySelector('[data-orientation]')
    const ctaRoot = cta ? getH(cta) : null
    const ctaContainer = cta?.querySelector('[data-slot="container"]')
    const ctaContainerH = ctaContainer ? getH(ctaContainer) : null
    const ctaWrapper = ctaContainer?.querySelector('[data-slot="wrapper"]')
    const ctaWrapperH = ctaWrapper ? getH(ctaWrapper) : null

    // Measure UPageSection outer container for HomeContributors
    const pageSections = document.querySelectorAll('[data-slot="root"]')
    const sectionDetails = [...pageSections].map(s => ({
      h: getH(s),
      top: getTop(s),
      cls: (s as HTMLElement).className?.substring(0, 60) || ''
    }))

    return { sections, ctaRoot, ctaContainerH, ctaWrapperH, sectionDetails }
  })

  console.log('=== Section Heights ===')
  const target = [64, 843, 684, 96, 609, 659, 576, 1211, 96, 575, 188, 64]
  const labels = ['Header', 'HomeHero', 'Features', 'mb-24', 'Benefits1', 'Benefits2', 'Benefits3', 'HomeCode', 'mb-24', 'HomeContributors', 'HomeSponsors', 'Footer']

  data.sections.forEach((s, i) => {
    const expected = target[i] || '?'
    const gap = s.h !== null && typeof expected === 'number' ? (s.h - expected) : '?'
    console.log(`[${i}] top=${s.top} h=${s.h} (expected ~${expected}, diff=${gap}) | ${s.cls.substring(0,40)}`)
  })

  console.log('\n=== UPageCTA Details ===')
  console.log('CTA root h:', data.ctaRoot)
  console.log('CTA container h:', data.ctaContainerH)
  console.log('CTA wrapper h:', data.ctaWrapperH)
})
