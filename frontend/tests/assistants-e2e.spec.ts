import { test, expect } from '@playwright/test';

test('Admin: create assistant via form', async ({ page }) => {
  await page.goto('/admin/assistants/new');
  await expect(page.getByRole('heading', { name: 'Neuen Assistenten erstellen' })).toBeVisible();

  // Verify form fields are present
  await expect(page.getByText('Name')).toBeVisible();
  await expect(page.getByText('Beschreibung')).toBeVisible();
  await expect(page.getByText('Anweisungen')).toBeVisible();
  await expect(page.getByText('Modell')).toBeVisible();
  
  // Verify the create button is present
  await expect(page.getByRole('button', { name: 'Erstellen' })).toBeVisible();
  
  // Verify the cancel button is present
  await expect(page.getByRole('button', { name: 'Abbrechen' })).toBeVisible();

  // Fill out the form
  const timestamp = Date.now();
  const assistantName = `E2E Test Assistant ${timestamp}`;
  
  // Fill name field
  await page.locator('input').first().fill(assistantName);
  
  // Fill description field
  await page.locator('textarea').first().fill('Test assistant created via E2E test');
  
  // Fill instructions field
  await page.locator('textarea').nth(1).fill('Be helpful and accurate');
  
  // Select model (gpt-4o is already selected by default)
  
  // Submit the form
  await page.getByRole('button', { name: 'Erstellen' }).click();
  
  // Wait for redirect to homepage
  await page.waitForURL('/');
  
  // Verify the assistant appears on the homepage
  await expect(page.getByText(assistantName)).toBeVisible();
});


