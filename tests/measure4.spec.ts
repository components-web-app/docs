import { test } from '@playwright/test'

test('measure all sections precisely', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const data = await page.evaluate(() => {
    const totalH = document.body.scrollHeight

    function getH(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().height) : null }
    function getTop(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null }
    function getBot(el: Element | null) { return el && getH(el) !== null && getTop(el) !== null ? (getTop(el)! + getH(el)!) : null }

    const header = document.querySelector('header')
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')

    // Get all direct children of the main content div
    const mainChildren = main ? [...main.children] : []
    const homeDiv = mainChildren[0] // Should be the outer div wrapping everything
    const homeDivChildren = homeDiv ? [...homeDiv.children] : []

    const sections = homeDivChildren.map((el, i) => {
      const cls = el.className.substring(0, 100)
      const h = getH(el)
      const top = getTop(el)
      const bot = getBot(el)
      // Check for nested sections
      const childCount = el.children.length
      return { i, tag: el.tagName, cls, h, top, bot, childCount }
    })

    // Get UPageSection containers for the benefits
    const benefitSections = document.querySelectorAll('[class*="!pt-0"]')

    return {
      totalH,
      header: { h: getH(header), top: getTop(header) },
      footer: { h: getH(footer), top: getTop(footer) },
      sections,
      benefitCount: benefitSections.length,
    }
  })

  console.log('=== Page Measurement ===')
  console.log('Total height:', data.totalH)
  console.log('Header:', data.header.h, 'top:', data.header.top)
  console.log('Footer:', data.footer.h, 'top:', data.footer.top)
  console.log('\n--- Main Home Children ---')
  data.sections.forEach(s => {
    console.log(`[${s.i}] top=${s.top} h=${s.h} bot=${s.bot} cls="${s.cls}"`)
  })
  console.log('\nBenefit sections found:', data.benefitCount)
})
