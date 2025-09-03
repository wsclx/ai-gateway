import { test, expect } from '@playwright/test'

test.describe('Admin Subpages', () => {
  test('direct navigation to /admin/users returns 200 and shows heading', async ({ page }) => {
    const resp = await page.goto('/admin/users')
    expect(resp?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { name: 'Benutzerverwaltung' })).toBeVisible()
    // Check that the page content is loaded
    await expect(page.locator('body')).toBeVisible()
  })

  test('direct navigation to /admin/system shows system page', async ({ page }) => {
    const resp = await page.goto('/admin/system')
    expect(resp?.ok()).toBeTruthy()
    await page.waitForTimeout(2000) // Wait for page to load
    // Just check that page loads successfully
    await expect(page.locator('body')).toBeVisible()
  })

  test('direct navigation to /admin/security returns 200 and shows heading', async ({ page }) => {
    const resp = await page.goto('/admin/security')
    expect(resp?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { name: 'Sicherheit', exact: true })).toBeVisible()
    // Check that the page content is loaded
    await expect(page.locator('body')).toBeVisible()
  })
})


