import { test, expect } from '@playwright/test'

test('measure section heights', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const data = await page.evaluate(() => {
    const totalHeight = document.body.scrollHeight

    const allSections = [...document.querySelectorAll('section')]
    const sectionData = allSections.map(s => ({
      height: Math.round(s.getBoundingClientRect().height),
      top: Math.round(s.getBoundingClientRect().top + window.scrollY),
      h2: s.querySelector('h2, [data-slot="title"]')?.textContent?.trim().substring(0, 50) || null
    }))

    // Find the bg div (features)
    const bgDiv = document.querySelector('.bg-primary\\/5')
    const bgDivHeight = bgDiv ? Math.round(bgDiv.getBoundingClientRect().height) : null

    // HomeCode bg div
    const allBgDivs = [...document.querySelectorAll('.bg-primary\\/5, .dark\\:bg-feature\\/65')].filter(el => el.tagName === 'DIV')

    // Get all main children
    const mainEl = document.querySelector('#__nuxt > div > div')
    const children = mainEl ? [...mainEl.children].map(c => ({
      tag: c.tagName,
      cls: c.className.substring(0, 60),
      h: Math.round(c.getBoundingClientRect().height),
      top: Math.round(c.getBoundingClientRect().top + window.scrollY)
    })) : []

    return { totalHeight, sectionData, bgDivHeight, children }
  })

  console.log('Total height:', data.totalHeight)
  console.log('\nMain children:')
  data.children.forEach((c, i) => console.log(`  [${i}] ${c.tag} cls="${c.cls}" h=${c.h} top=${c.top}`))
  console.log('\nSections:')
  data.sectionData.forEach((s, i) => console.log(`  [${i}] h=${s.height} top=${s.top} title="${s.h2 || ''}"`))
})
