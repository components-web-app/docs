import { test, expect, type Page } from '@playwright/test'
import { selectQuestions } from '../quiz/lib/select.ts'

// The quiz runs in the browser from prerendered JSON. Intermediate has a pick-the-line and a
// spot-the-mistake example question, so it covers the code-line questions.
const PLAY = '/quiz/play?level=intermediate&topic=all&seed=test1234'

// A choice row: a radio for multiple choice and code lines, a checkbox for select many.
const CHOICE = '[role="radio"], [role="checkbox"]'

async function promptsInOrder(page: Page) {
  const prompts: string[] = []
  await page.goto(PLAY)
  // Clicks before hydration are lost, so wait for the page to finish loading.
  await page.waitForLoadState('networkidle')
  for (;;) {
    const prompt = page.locator('#quiz-prompt')
    await expect(prompt).toBeVisible()
    // Markdown in a prompt, such as bold, can render a moment after the text: read it once it's settled.
    let text = ''
    await expect.poll(async () => {
      const before = text
      text = (await prompt.innerText()).trim()
      return text === before
    }, { intervals: [100, 100, 200, 400] }).toBe(true)
    prompts.push(text)
    // Pick the first line or option, check, move on.
    await page.locator(CHOICE).first().click()
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
  await page.waitForLoadState('networkidle')
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
    // Tab into the options or lines, move down one, select it.
    await page.keyboard.press('Tab')
    await expect(page.locator(`${CHOICE.split(', ').map(s => `${s}:focus`).join(', ')}`)).toHaveCount(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Space')
    await expect(page.locator(CHOICE.split(', ').map(s => `${s}[aria-checked="true"]`).join(', '))).toHaveCount(1)
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

type PoolQuestion = { id: string, level: 'beginner', area: 'api', type: string, family?: string, weight?: number }
type PoolKey = { key: { id: string, correct: { optionIds?: string[] } } }

/** A seed whose quiz has a select-many question, with its place in the quiz and its right options. */
async function findSelectMany(page: Page, level: string) {
  const pool = await (await page.request.get(`/api/quiz/questions/${level}.json`)).json() as PoolQuestion[]
  const keys = await (await page.request.get(`/api/quiz/keys/${level}.json`)).json() as PoolKey[]
  for (let n = 0; n < 500; n++) {
    const seed = `many${String(n).padStart(4, '0')}`
    const { questions } = selectQuestions(pool, { seed, level: level as 'beginner', area: 'all', count: 10 })
    const at = questions.findIndex(q => q.type === 'select-many')
    if (at !== -1) {
      const correct = keys.find(k => k.key.id === questions[at]!.id)!.key.correct.optionIds!
      return { seed, at, correct }
    }
  }
  throw new Error(`No seed in 500 gives a ${level} quiz with a select-many question`)
}

async function playTo(page: Page, level: string, seed: string, at: number) {
  await page.goto(`/quiz/play?level=${level}&topic=all&seed=${seed}`)
  await page.waitForLoadState('networkidle')
  for (let i = 0; i < at; i++) {
    await page.locator(CHOICE).first().click()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.getByRole('button', { name: /Next question/ }).click()
  }
  await expect(page.locator('[role="checkbox"]').first()).toBeVisible()
}

test('quiz - select many scores only every right option and no other', async ({ page }) => {
  const { seed, at, correct } = await findSelectMany(page, 'beginner')

  // Every right option: correct.
  await playTo(page, 'beginner', seed, at)
  const check = page.getByRole('button', { name: 'Check answer' })
  await expect(check).toBeDisabled()
  for (const id of correct) {
    await page.locator(`[role="checkbox"][data-option="${id}"]`).click()
  }
  await expect(page.locator('[role="checkbox"][aria-checked="true"]')).toHaveCount(correct.length)
  await check.click()
  await expect(page.getByRole('heading', { name: 'Correct' })).toBeVisible()

  // One right option left out: wrong, and the left-out one is marked as missed.
  await playTo(page, 'beginner', seed, at)
  for (const id of correct.slice(1)) {
    await page.locator(`[role="checkbox"][data-option="${id}"]`).click()
  }
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByRole('heading', { name: 'Not quite' })).toBeVisible()
  await expect(page.locator(`[role="checkbox"][data-option="${correct[0]}"]`)).toContainText('Right, and you left it out')
})
