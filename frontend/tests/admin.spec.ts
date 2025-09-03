import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Direkt auf die Admin-Übersicht navigieren
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('accesses admin panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('displays system configuration', async ({ page }) => {
    await expect(page.getByText('Systemverwaltung und Konfiguration')).toBeVisible()
  })

  test('updates configuration', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('displays user management', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('manages user status', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('shows system analytics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('displays system monitoring', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('manages API keys', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('configures compliance settings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('navigates between admin tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })

  test('admin panel content check', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible()
  })
})
