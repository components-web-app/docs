import { test } from '@playwright/test'

test('measure footer and full layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const data = await page.evaluate(() => {
    const totalH = document.body.scrollHeight

    function getEl(sel: string) { return document.querySelector(sel) }
    function getH(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().height) : null }
    function getTop(el: Element | null) { return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null }

    // Footer
    const footer = getEl('footer')
    const footerH = getH(footer)
    const footerTop = getTop(footer)

    // HomeSponsors
    const ucontainers = [...document.querySelectorAll('.pb-20')]
    const sponsors = ucontainers.length > 0 ? ucontainers[0] : null
    const sponsorsH = getH(sponsors)
    const sponsorsTop = getTop(sponsors)

    // HomeHero  
    const heroSection = document.querySelector('#__nuxt > div > div > div.relative.overflow-hidden')
    const heroH = getH(heroSection)
    const heroTop = getTop(heroSection)

    // Features bg div
    const bgDiv = document.querySelector('#__nuxt > div > div > div.bg-primary\\/5')
    const bgDivH = getH(bgDiv)
    const bgDivTop = getTop(bgDiv)

    // All benefit sections (sections NOT inside bg-div)
    const allDivChildren = [...document.querySelectorAll('#__nuxt > div > div > *')]

    const children = allDivChildren.map(c => ({
      tag: c.tagName,
      cls: c.className.substring(0, 80),
      h: getH(c),
      top: getTop(c)
    }))

    return { totalH, footerH, footerTop, sponsorsH, sponsorsTop, heroH, heroTop, bgDivH, bgDivTop, children }
  })

  console.log('Total:', data.totalH)
  console.log('Footer:', data.footerH, 'top:', data.footerTop)
  console.log('Sponsors (.pb-20):', data.sponsorsH, 'top:', data.sponsorsTop)
  console.log('Hero:', data.heroH, 'top:', data.heroTop)
  console.log('BgDiv (features):', data.bgDivH, 'top:', data.bgDivTop)
  console.log('\nAll main div children:')
  data.children.forEach((c, i) => console.log(`  [${i}] ${c.tag} cls="${c.cls}" h=${c.h} top=${c.top}`))
})
