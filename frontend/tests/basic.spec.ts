import { test, expect } from '@playwright/test'

test('loads home and shows nav', async ({ page }) => {
  await page.goto('/')
  
  // Check for navigation buttons in the sidebar
  await expect(page.locator('aside').getByRole('button', { name: 'Chat' })).toBeVisible()
  await expect(page.locator('aside').getByRole('button', { name: 'Analytics' })).toBeVisible()
  await expect(page.locator('aside').getByRole('button', { name: 'Einstellungen' })).toBeVisible()
  await expect(page.locator('aside').getByRole('button', { name: 'Admin' })).toBeVisible()
  
  // Check that Chat tab is active by default
  await expect(page.locator('aside').getByRole('button', { name: 'Chat' })).toHaveClass(/bg-primary/)
})


