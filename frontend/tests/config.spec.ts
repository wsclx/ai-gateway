import { test, expect } from '@playwright/test'

test.describe('Admin Konfiguration', () => {
  test('lädt und speichert Einstellungen', async ({ page }) => {
    await page.goto('/admin/config')
    await expect(page.getByRole('heading', { name: 'Konfiguration' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Neu laden' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Speichern' })).toBeVisible()

    // Eingaben ändern
    const retention = page.locator('input[type="number"]')
    await retention.fill('123')
    await page.locator('#redact').check()

    await page.getByRole('button', { name: 'Speichern' }).click()

    // Check that save button is disabled (indicates saving)
    await expect(page.getByRole('button', { name: 'Speichern' })).toBeDisabled()
  })
})


