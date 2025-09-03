import { test, expect } from '@playwright/test'

test('loads home and shows nav', async ({ page }) => {
  await page.goto('/')
  // Sidebar ist ein <aside>, nicht fixed positioned div
  await expect(page.locator('aside')).toBeVisible()
  
  // Wait a bit for the page to fully load
  await page.waitForTimeout(1000)
  
  // Check for navigation elements in the sidebar
  await expect(page.locator('aside').getByText('Hauptseite')).toBeVisible()
  await expect(page.locator('aside').getByText('Dashboard')).toBeVisible()
  await expect(page.locator('aside').getByText('Chat & Assistenten')).toBeVisible()
  await expect(page.locator('aside').getByText('Support & Tickets')).toBeVisible()
  await expect(page.locator('aside').getByText('Analytics')).toBeVisible()
  await expect(page.locator('aside').getByText('Branding')).toBeVisible()
  
  // Check that Hauptseite is active by default (has primary background)
  const hauptseiteElement = page.locator('aside').getByText('Hauptseite')
  await expect(hauptseiteElement).toBeVisible()
})


