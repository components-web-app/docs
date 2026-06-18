import { test } from '@playwright/test'

test('measure contributor section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const data = await page.evaluate(() => {
    // Find HomeContributors section
    const contribSection = [...document.querySelectorAll('section')].find(s => s.querySelector('[data-slot="title"]')?.textContent?.includes('community'))
    if (!contribSection) return { error: 'not found' }

    const cta = contribSection.querySelector('[class*="UPageCTA"], div')
    const container = contribSection.querySelector('[data-slot="container"]') || contribSection.querySelector(':scope > div')

    // Get all direct slot children  
    function getH(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().height) : null }
    function getTop(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null }

    const sectionH = getH(contribSection)
    const sectionTop = getTop(contribSection)

    // Get the title, description, links, default slot
    const title = contribSection.querySelector('[data-slot="title"], h2')
    const desc = contribSection.querySelector('[data-slot="description"]')
    const links = contribSection.querySelector('[data-slot="links"]')
    const body = contribSection.querySelector('[data-slot="body"]') || contribSection.querySelector('[data-slot="wrapper"]')

    // UPageCTA
    const uPageCTA = contribSection.querySelector('[data-slot="root"]')

    // Count contributors grid
    const gridParent = contribSection.querySelector('.grid')
    const gridItems = gridParent ? gridParent.querySelectorAll('a').length : 0

    return {
      sectionH, sectionTop,
      titleH: getH(title),
      descH: getH(desc),
      linksH: getH(links),
      bodyH: getH(body),
      uPageCTAH: getH(uPageCTA),
      gridH: getH(gridParent),
      gridItems,
      // Get computed style of the section container
      sectionStyle: window.getComputedStyle(contribSection).cssText.substring(0, 200)
    }
  })

  console.log('HomeContributors measurement:', JSON.stringify(data, null, 2))

  // Also measure HomeCode section
  const codeData = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('section')]
    const homeCodeSection = sections[4] // should be the outer HomeCode section

    function getH(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().height) : null }

    const tabs = homeCodeSection?.querySelector('[role="tablist"]') || homeCodeSection?.querySelector('[data-slot="list"]')
    const tabsParent = homeCodeSection?.querySelectorAll('[data-slot="list"]')

    // Find the UTabs components
    const allLists = [...document.querySelectorAll('[role="tablist"]')]

    return {
      homeCodeH: getH(homeCodeSection),
      allTabLists: allLists.map(l => ({
        h: getH(l),
        top: Math.round(l.getBoundingClientRect().top + window.scrollY),
        itemCount: l.querySelectorAll('[role="tab"]').length
      }))
    }
  })

  console.log('\nHomeCode measurement:', JSON.stringify(codeData, null, 2))
})
