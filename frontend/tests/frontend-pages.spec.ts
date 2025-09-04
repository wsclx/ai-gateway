import { test, expect } from '@playwright/test';

test.describe('Frontend Pages Load Test', () => {
  test('Homepage loads and shows content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're not stuck in loading state
    const loadingText = page.getByText('Lade Assistenten...');
    await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    
    // Check if we see actual content
    const heading = page.getByRole('heading', { name: 'AI Gateway' });
    await expect(heading).toBeVisible();
  });

  test('Admin users page loads', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we see the page title
    const heading = page.getByRole('heading', { name: 'Benutzerverwaltung' });
    await expect(heading).toBeVisible();
    
    // Check if the add user button is visible
    const addButton = page.getByRole('button', { name: 'Neuen Benutzer hinzufügen' });
    await expect(addButton).toBeVisible();
  });

  test('Admin assistants new page loads', async ({ page }) => {
    await page.goto('/admin/assistants/new');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we see the page title
    const heading = page.getByRole('heading', { name: 'Neuen Assistenten erstellen' });
    await expect(heading).toBeVisible();
    
    // Check if the form fields are visible (using text content instead of labels)
    const nameLabel = page.getByText('Name');
    await expect(nameLabel).toBeVisible();
    
    const descriptionLabel = page.getByText('Beschreibung');
    await expect(descriptionLabel).toBeVisible();
    
    // Check if the create button is visible
    const createButton = page.getByRole('button', { name: 'Erstellen' });
    await expect(createButton).toBeVisible();
  });

  test('Analytics page loads', async ({ page }) => {
    await page.goto('/analytics');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we see the page title
    const heading = page.getByRole('heading', { name: 'Analytics' });
    await expect(heading).toBeVisible();
  });

  test('Training page loads', async ({ page }) => {
    await page.goto('/training');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we see the page title
    const heading = page.getByRole('heading', { name: 'Training' });
    await expect(heading).toBeVisible();
  });
});
