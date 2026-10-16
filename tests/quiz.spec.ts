import { test, expect, type Page } from '@playwright/test'

// The quiz runs in the browser from prerendered JSON. Intermediate has a pick-the-line and a
// spot-the-mistake example question, so it covers the code-line questions.
const PLAY = '/quiz/play?level=intermediate&topic=all&seed=test1234'

async function promptsInOrder(page: Page) {
  const prompts: string[] = []
  await page.goto(PLAY)
  for (;;) {
    const prompt = page.locator('#quiz-prompt')
    await expect(prompt).toBeVisible()
    prompts.push((await prompt.innerText()).trim())
    // Pick the first line or option, check, move on.
    await page.locator('[role="radio"]').first().click()
    await page.getByRole('button', { name: 'Check answer' }).click()
    const next = page.getByRole('button', { name: /Next question|See your result/ })
    const label = await next.innerText()
    await next.click()
    if (label.includes('See your result')) {
      break
    }
  }
  return prompts
}

test('quiz - start page lists the levels and starts a seeded quiz', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', err => errors.push(err.message))
  await page.goto('/quiz')
  await expect(page.getByRole('radio', { name: /Beginner/ })).toBeVisible()
  await page.getByRole('radio', { name: /Intermediate/ }).click()
  await page.getByRole('button', { name: 'Start the quiz' }).click()
  await expect(page).toHaveURL(/\/quiz\/play\?level=intermediate&topic=all&seed=[a-z0-9]{8}/)
  await expect(page.locator('#quiz-prompt')).toBeVisible()
  expect(errors).toHaveLength(0)
})

test('quiz - can be answered with the keyboard only', async ({ page }) => {
  await page.goto(PLAY)
  await expect(page.locator('#quiz-prompt')).toBeFocused()
  for (let question = 0; question < 10; question++) {
    // Tab into the radiogroup, move down a line, select it.
    await page.keyboard.press('Tab')
    await expect(page.locator('[role="radio"]:focus')).toHaveCount(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Space')
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1)
    // Tab to "Check answer".
    await tabTo(page, /Check answer/)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: /Correct|Not quite|Not scored/ })).toBeFocused()
    const next = await tabTo(page, /Next question|See your result/)
    await page.keyboard.press('Enter')
    if (next.includes('See your result')) {
      break
    }
  }
  await expect(page.getByText(/pass mark/)).toBeVisible()
})

async function tabTo(page: Page, name: RegExp) {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    const text = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
    if (name.test(text)) {
      return text
    }
  }
  throw new Error(`Could not tab to ${name}`)
}

test('quiz - phone width has no horizontal page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  for (const path of ['/quiz', PLAY]) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('quiz - the same seed gives the same questions', async ({ page }) => {
  const first = await promptsInOrder(page)
  const second = await promptsInOrder(page)
  expect(first.length).toBeGreaterThan(0)
  expect(second).toEqual(first)
})
