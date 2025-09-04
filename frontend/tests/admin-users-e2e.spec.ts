import { test, expect } from '@playwright/test';

test('Admin: create user via dialog', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: 'Benutzerverwaltung' })).toBeVisible();

  await page.getByRole('button', { name: 'Neuen Benutzer hinzufügen' }).click();
  await page.getByLabel('Name').fill('E2E Tester');
  await page.getByLabel('E-Mail').fill('e2e.tester@example.com');
  await page.getByLabel('Rolle').selectOption('admin');
  await page.getByRole('button', { name: 'Speichern' }).click();

  await expect(page.getByText('e2e.tester@example.com')).toBeVisible();
});


