import { test, expect } from '@playwright/test'

test.describe('API Communication Debug', () => {
  test('Test API calls with detailed logging', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Enable network logging
    page.on('request', request => {
      console.log(`[Network Request] ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      console.log(`[Network Response] ${response.status()} ${response.url()}`);
    });

    // Navigate to the homepage
    await page.goto('/');
    console.log('[Test] Navigated to homepage');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    console.log('[Test] Page loaded');

    // Check if there are any console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any API calls to complete
    await page.waitForTimeout(3000);

    // Log any errors found
    if (errors.length > 0) {
      console.error('[Test] Console errors found:', errors);
    } else {
      console.log('[Test] No console errors found');
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/api-debug-homepage.png', fullPage: true });

    // Now test a direct API call
    console.log('[Test] Testing direct API call...');
    
    try {
      const response = await page.request.get('/api/v1/system/overview');
      console.log(`[Test] Direct API call status: ${response.status()}`);
      if (response.ok()) {
        const data = await response.json();
        console.log('[Test] API response data:', data);
      } else {
        console.error('[Test] API call failed:', response.statusText());
      }
    } catch (error) {
      console.error('[Test] Direct API call error:', error);
    }

    // Test the dashboard page which makes API calls
    console.log('[Test] Testing dashboard page...');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/api-debug-dashboard.png', fullPage: true });

    // Check for any new errors
    if (errors.length > 0) {
      console.error('[Test] Final console errors:', errors);
      expect(errors.length).toBe(0);
    }
  });
});
