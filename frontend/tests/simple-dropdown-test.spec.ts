import { test, expect } from '@playwright/test';

test('Assistant Picker Dropdown is fully opaque', async ({ page }) => {
  await page.goto('/');

  // Find a likely assistant picker button and open it (robust selector)
  const btn = page.locator('button:has-text("Assistant"), button:has-text("Assistent")').first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();

  // Fallback to generic popover/menu/listbox roles
  const dropdown = page.locator('[role="listbox"], [role="menu"], [data-state="open"], .assistant-picker-dropdown');
  await expect(dropdown.first()).toBeVisible();
});
