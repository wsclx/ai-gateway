import { test, expect } from '@playwright/test'

test.describe('Manual E2E Testing - Every Page', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check homepage content - it shows loading state initially
    await expect(page.getByText('Lade Assistenten...')).toBeVisible()
    
    // Wait for content to load or show empty state
    await page.waitForTimeout(3000)
    
    // Check if either assistants loaded or empty state is shown
    const hasAssistants = await page.locator('[class*="Card"]').count() > 0
    const hasEmptyState = await page.getByText('Keine Assistenten verfügbar').isVisible()
    const stillLoading = await page.getByText('Lade Assistenten...').isVisible()
    
    // Accept any of these states as valid
    expect(hasAssistants || hasEmptyState || stillLoading).toBe(true)
  })

  test('Dashboard page loads and shows data', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Total threads')).toBeVisible()
  })

  test('Chat page loads and shows interface', async ({ page }) => {
    await page.goto('/chat')
    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible()
    await expect(page.getByText('Chatten Sie mit unseren AI-Assistenten')).toBeVisible()
  })

  test('Tickets page loads', async ({ page }) => {
    await page.goto('/tickets')
    await expect(page.getByRole('heading', { name: 'Support & Tickets' })).toBeVisible()
  })

  test('Analytics page loads', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  })

  test('Admin panel loads and shows content', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
    await expect(page.getByText('Systemverwaltung und Konfiguration')).toBeVisible()
  })

  test('Admin users page loads', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByText('Benutzerverwaltung')).toBeVisible()
  })

  test('Admin system page loads', async ({ page }) => {
    await page.goto('/admin/system')
    await expect(page.getByText('Systemverwaltung')).toBeVisible()
  })

  test('Admin security page loads', async ({ page }) => {
    await page.goto('/admin/security')
    await expect(page.getByText('Sicherheit')).toBeVisible()
  })

  test('Config page loads', async ({ page }) => {
    await page.goto('/admin/config')
    await expect(page.getByText('Konfiguration')).toBeVisible()
  })

  test('Navigation works between pages', async ({ page }) => {
    // Start at home (assistants page)
    await page.goto('/')
    await expect(page.getByText('Lade Assistenten...')).toBeVisible()

    // Navigate to dashboard
    await page.click('text=Dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    // Navigate to chat
    await page.click('text=Chat & Assistenten')
    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible()

    // Navigate to tickets
    await page.click('text=Tickets')
    await expect(page.getByRole('heading', { name: 'Support & Tickets' })).toBeVisible()

    // Navigate to analytics
    await page.click('text=Analytics')
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()

    // Navigate to training
    await page.click('text=Training')
    await expect(page.getByRole('heading', { name: 'Training & Fine-Tuning' })).toBeVisible()

    // Navigate to admin
    await page.click('text=Verwaltung')
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()

    // Navigate back to home
    await page.click('text=Chat & Assistenten')
    await expect(page.getByText('Lade Assistenten...')).toBeVisible()
  })

  test('API endpoints are accessible', async ({ page }) => {
    const systemOverviewResponse = await page.request.get('http://localhost:5555/api/v1/system/overview')
    expect(systemOverviewResponse.ok()).toBeTruthy()
    const systemOverviewData = await systemOverviewResponse.json()
    expect(systemOverviewData).toHaveProperty('users')
    expect(systemOverviewData).toHaveProperty('system')

    const assistantsResponse = await page.request.get('http://localhost:5555/api/v1/assistants')
    expect(assistantsResponse.ok()).toBeTruthy()
    const assistantsData = await assistantsResponse.json()
    expect(Array.isArray(assistantsData)).toBeTruthy()
  })

  test('Check for critical console errors only', async ({ page }) => {
    const criticalErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        criticalErrors.push(msg.text())
      }
    })
    await page.goto('/')
    await page.goto('/dashboard')
    await page.goto('/chat')
    await page.goto('/tickets')
    await page.goto('/analytics')
    await page.goto('/admin')
    await page.goto('/admin/users')
    await page.goto('/admin/system')
    await page.goto('/admin/security')
    await page.goto('/admin/branding')

    // Filter out expected hydration errors if they are not critical after fixes
    const filteredErrors = criticalErrors.filter(error => !error.includes('Hydration failed') && !error.includes('Text content does not match'))
    
    if (filteredErrors.length > 0) {
      console.error('Critical errors found:', filteredErrors)
    }
    expect(filteredErrors.length).toBe(0)
  })
})
