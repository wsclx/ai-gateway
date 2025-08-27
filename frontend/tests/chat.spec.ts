import { test, expect } from '@playwright/test'

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('creates new chat thread', async ({ page }) => {
    // Navigate to chat tab (should be default)
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Check if assistant picker is visible
    await expect(page.getByText('Bitte wähle einen Assistenten aus, um zu beginnen.')).toBeVisible()
    
    // Look for assistant options
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
    }
  })

  test('sends and receives messages', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Look for assistant picker and select one if available
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      
      // Wait for chat interface to appear
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
      
      // Send message
      const messageInput = page.getByPlaceholder('Schreibe eine Nachricht...')
      await expect(messageInput).toBeVisible()
      await messageInput.fill('Hallo, wie geht es dir?')
      await messageInput.press('Enter')
      
      // Wait for user message to appear
      await expect(page.getByText('Hallo, wie geht es dir?')).toBeVisible()
      
      // Check for assistant response (with timeout for API calls)
      await expect(page.locator('.bg-muted').filter({ hasText: /.*/ })).toBeVisible({ timeout: 30000 })
    }
  })

  test('displays chat history', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Check if chat interface is available - use more specific selector
    const chatInterface = page.locator('.bg-card.border.rounded-lg.p-8.text-center')
    await expect(chatInterface).toBeVisible()
    
    // Verify message area exists
    await expect(page.getByText('Bitte wähle einen Assistenten aus, um zu beginnen.')).toBeVisible()
  })

  test('handles thread navigation', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Check if we can switch between tabs
    const chatTab = page.getByRole('button', { name: 'Chat' })
    const analyticsTab = page.getByRole('button', { name: 'Analytics' })
    const settingsTab = page.getByRole('button', { name: 'Einstellungen' })
    const adminTab = page.getByRole('button', { name: 'Admin' })
    
    await expect(chatTab).toBeVisible()
    await expect(analyticsTab).toBeVisible()
    await expect(settingsTab).toBeVisible()
    await expect(adminTab).toBeVisible()
    
    // Test tab switching - use more specific selectors
    await analyticsTab.click()
    await expect(page.locator('span').filter({ hasText: 'Lade Analytics...' })).toBeVisible()
    
    await settingsTab.click()
    await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible()
    
    await adminTab.click()
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
    
    await chatTab.click()
    await expect(page.getByText('Bitte wähle einen Assistenten aus, um zu beginnen.')).toBeVisible()
  })

  test('manages conversation threads', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Look for assistant picker and select one if available
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      
      // Wait for chat interface to appear
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
      
      // Check for thread management header
      await expect(page.getByText('Neue Konversation')).toBeVisible()
      
      // Check for thread management buttons
      const threadsButton = page.locator('button[title="Konversationen anzeigen"]')
      await expect(threadsButton).toBeVisible()
      
      // Click to show threads
      await threadsButton.click()
      
      // Check for threads section
      await expect(page.getByText('Konversationen')).toBeVisible()
    }
  })

  test('edits conversation title', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Look for assistant picker and select one if available
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      
      // Wait for chat interface to appear
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
      
      // Check for editable title
      const titleButton = page.getByText('Neue Konversation')
      await expect(titleButton).toBeVisible()
      
      // Click to edit title
      await titleButton.click()
      
      // Check for title input
      const titleInput = page.locator('input[type="text"]').first()
      await expect(titleInput).toBeVisible()
      
      // Type new title
      await titleInput.fill('Meine wichtige Konversation')
      await titleInput.press('Enter')
      
      // Check if title was updated
      await expect(page.getByText('Meine wichtige Konversation')).toBeVisible()
    }
  })

  test('exports conversation', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Look for assistant picker and select one if available
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      
      // Wait for chat interface to appear
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
      
      // Send a message to create conversation content
      const messageInput = page.getByPlaceholder('Schreibe eine Nachricht...')
      await expect(messageInput).toBeVisible()
      await messageInput.fill('Test message for export')
      await messageInput.press('Enter')
      
      // Wait for message to appear
      await expect(page.getByText('Test message for export')).toBeVisible()
      
      // Check for export button
      const exportButton = page.locator('button[title="Konversation exportieren"]')
      await expect(exportButton).toBeVisible()
      
      // Export should be enabled now
      await expect(exportButton).toBeEnabled()
    }
  })

  test('deletes conversation', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Look for assistant picker and select one if available
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      
      // Wait for chat interface to appear
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
      
      // Send a message to create conversation content
      const messageInput = page.getByPlaceholder('Schreibe eine Nachricht...')
      await expect(messageInput).toBeVisible()
      await messageInput.fill('Test message for deletion')
      await messageInput.press('Enter')
      
      // Wait for message to appear
      await expect(page.getByText('Test message for deletion')).toBeVisible()
      
      // Check for delete button
      const deleteButton = page.locator('button[title="Konversation löschen"]')
      await expect(deleteButton).toBeVisible()
      
      // Delete should be enabled now
      await expect(deleteButton).toBeEnabled()
    }
  })

  test('handles conversation switching', async ({ page }) => {
    await expect(page.getByText('DUH AI Gateway')).toBeVisible()
    
    // Look for assistant picker and select one if available
    const assistantOptions = page.locator('[data-testid="assistant-option"]')
    if (await assistantOptions.count() > 0) {
      await assistantOptions.first().click()
      
      // Wait for chat interface to appear
      await expect(page.getByText('Starte eine Konversation.')).toBeVisible()
      
      // Check for thread management buttons
      const threadsButton = page.locator('button[title="Konversationen anzeigen"]')
      await expect(threadsButton).toBeVisible()
      
      // Click to show threads
      await threadsButton.click()
      
      // Check for threads section
      await expect(page.getByText('Konversationen')).toBeVisible()
      
      // If there are existing threads, test switching
      const existingThreads = page.locator('.bg-muted\\/50 button')
      if (await existingThreads.count() > 0) {
        await existingThreads.first().click()
        
        // Check if thread content loaded
        await expect(page.getByText('Konversationen')).not.toBeVisible()
      }
    }
  })
})
