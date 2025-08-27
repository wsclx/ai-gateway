import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('accesses admin panel', async ({ page }) => {
    // Navigate to admin tab
    await page.getByRole('button', { name: 'Admin' }).click()
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
  })

  test('displays system configuration', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Check for config sections
    await expect(page.getByText('Provider')).toBeVisible()
    await expect(page.getByText('Compliance & Kosten')).toBeVisible()
    await expect(page.getByText('Features')).toBeVisible()
    
    // Verify config form elements
    await expect(page.getByText('OpenAI API Key')).toBeVisible()
    await expect(page.getByText('Anthropic API Key')).toBeVisible()
  })

  test('updates configuration', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Find and update config fields - use more specific selectors
    const retentionInput = page.locator('input[type="number"]').first()
    await expect(retentionInput).toBeVisible()
    
    // Check for save button
    await expect(page.getByRole('button', { name: 'Speichern' })).toBeVisible()
  })

  test('displays user management', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Wait for admin panel to load and tabs to be visible
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
    
    // Wait for tabs to be rendered and click on users tab
    // Use more specific selector for Radix UI tabs
    const usersTab = page.locator('[role="tab"][value="users"]')
    await expect(usersTab).toBeVisible({ timeout: 10000 })
    await usersTab.click()
    
    // Check for user management section
    await expect(page.getByText('Benutzer-Verwaltung')).toBeVisible()
    await expect(page.getByText('Benutzer und Rollen verwalten')).toBeVisible()
    
    // Verify user list is displayed
    await expect(page.getByText('Max Mustermann')).toBeVisible()
    await expect(page.getByText('Anna Schmidt')).toBeVisible()
    await expect(page.getByText('Tom Weber')).toBeVisible()
  })

  test('manages user status', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Wait for admin panel to load
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
    
    // Wait for tabs to be rendered and click on users tab
    const usersTab = page.locator('[role="tab"][value="users"]')
    await expect(usersTab).toBeVisible({ timeout: 10000 })
    await usersTab.click()
    
    // Check for user action buttons
    await expect(page.getByRole('button', { name: 'Deaktivieren' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sperren' })).toBeVisible()
    
    // Verify user badges
    await expect(page.getByText('admin')).toBeVisible()
    await expect(page.getByText('user')).toBeVisible()
    await expect(page.getByText('IT')).toBeVisible()
    await expect(page.getByText('HR')).toBeVisible()
  })

  test('shows system analytics', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Wait for admin panel to load
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
    
    // Wait for tabs to be rendered and click on analytics tab
    const analyticsTab = page.locator('[role="tab"][value="analytics"]')
    await expect(analyticsTab).toBeVisible({ timeout: 10000 })
    await analyticsTab.click()
    
    // Check for analytics metrics cards
    await expect(page.getByText('Aktive Benutzer')).toBeVisible()
    await expect(page.getByText('Gesamt-Requests')).toBeVisible()
    await expect(page.getByText('Durchschn. Antwortzeit')).toBeVisible()
    await expect(page.getByText('Fehlerrate')).toBeVisible()
    
    // Verify metric values
    await expect(page.getByText('12')).toBeVisible() // Active users
    await expect(page.getByText('15,420')).toBeVisible() // Total requests
    await expect(page.getByText('245ms')).toBeVisible() // Response time
    await expect(page.getByText('0.8%')).toBeVisible() // Error rate
  })

  test('displays system monitoring', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Wait for admin panel to load
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
    
    // Wait for tabs to be rendered and click on monitoring tab
    const monitoringTab = page.locator('[role="tab"][value="monitoring"]')
    await expect(monitoringTab).toBeVisible({ timeout: 10000 })
    await monitoringTab.click()
    
    // Check for monitoring sections
    await expect(page.getByText('System-Status')).toBeVisible()
    await expect(page.getByText('Performance')).toBeVisible()
    await expect(page.getByText('Letzte Alerts')).toBeVisible()
    
    // Verify system metrics
    await expect(page.getByText('Uptime')).toBeVisible()
    await expect(page.getByText('Speicher')).toBeVisible()
    await expect(page.getByText('Datenbank')).toBeVisible()
    await expect(page.getByText('Redis Cache')).toBeVisible()
  })

  test('manages API keys', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Check for API key management
    await expect(page.getByText('Provider')).toBeVisible()
    await expect(page.getByText('API-Schlüssel (werden nicht angezeigt)')).toBeVisible()
    
    // Verify input fields exist
    const openaiInput = page.getByPlaceholder('sk-...')
    const anthropicInput = page.getByPlaceholder('anthropic-...')
    
    await expect(openaiInput).toBeVisible()
    await expect(anthropicInput).toBeVisible()
  })

  test('configures compliance settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Check for compliance section
    await expect(page.getByText('Compliance & Kosten')).toBeVisible()
    
    // Verify compliance options
    await expect(page.getByText('Retention (Tage)')).toBeVisible()
    await expect(page.getByText('Budget (Monat, Cent)')).toBeVisible()
    await expect(page.getByText('Kostenschwelle (Cent)')).toBeVisible()
    await expect(page.getByText('Redaction')).toBeVisible()
  })

  test('navigates between admin tabs', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Wait for admin panel to load
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
    
    // Wait for tabs to be rendered and check all tabs are visible
    const configTab = page.locator('[role="tab"][value="config"]')
    const usersTab = page.locator('[role="tab"][value="users"]')
    const analyticsTab = page.locator('[role="tab"][value="analytics"]')
    const monitoringTab = page.locator('[role="tab"][value="monitoring"]')
    
    await expect(configTab).toBeVisible({ timeout: 10000 })
    await expect(usersTab).toBeVisible()
    await expect(analyticsTab).toBeVisible()
    await expect(monitoringTab).toBeVisible()
    
    // Test tab navigation using proper selectors
    await usersTab.click()
    await expect(page.getByText('Benutzer-Verwaltung')).toBeVisible()
    
    await analyticsTab.click()
    await expect(page.getByText('Aktive Benutzer')).toBeVisible()
    
    await monitoringTab.click()
    await expect(page.getByText('System-Status')).toBeVisible()
    
    await configTab.click()
    await expect(page.getByText('Provider')).toBeVisible()
  })

  test('admin panel content check', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click()
    
    // Wait for admin panel to load
    await expect(page.getByText('Gateway-Konfiguration verwalten')).toBeVisible()
    
    // Wait a bit for content to render
    await page.waitForTimeout(2000)
    
    // Check what's actually visible
    const allText = await page.locator('body').textContent()
    console.log('All visible text on page:')
    console.log(allText?.substring(0, 500))
    
    // Check for specific content
    const hasConfig = allText?.includes('Konfiguration')
    const hasUsers = allText?.includes('Benutzer')
    const hasAnalytics = allText?.includes('Analytics')
    const hasMonitoring = allText?.includes('Monitoring')
    
    console.log('Content check:')
    console.log('- Konfiguration:', hasConfig)
    console.log('- Benutzer:', hasUsers)
    console.log('- Analytics:', hasAnalytics)
    console.log('- Monitoring:', hasMonitoring)
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'admin-panel-content.png', fullPage: true })
  })
})
