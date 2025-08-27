import { test, expect } from '@playwright/test'

test('loads home and shows nav', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('DUH AI Gateway')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Chat' })).toBeVisible()
})


