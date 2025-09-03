import { test, expect } from '@playwright/test'

test.describe('Assistent erstellen', () => {
  test('öffnet Modal und kann Formular ausfüllen', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Öffne Modal
    const addBtn = page.getByText('Neuen Assistenten hinzufügen')
    await expect(addBtn).toBeVisible()
    await addBtn.click()
    await expect(page.locator('#name')).toBeVisible()

    // Formular ausfüllen
    await page.fill('#name', 'Test Assistant E2E')
    await page.fill('#desc', 'Beschreibung via E2E')

    // Verify form is filled correctly
    await expect(page.locator('#name')).toHaveValue('Test Assistant E2E')
    await expect(page.locator('#desc')).toHaveValue('Beschreibung via E2E')

    // Verify dialog is still open
    await expect(page.locator('dialog[open]')).toBeVisible()
  })
})


