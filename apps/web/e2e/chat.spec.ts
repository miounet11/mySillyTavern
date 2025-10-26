import { test, expect } from '@playwright/test'

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
  })

  test('should display chat interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /chat/i })).toBeVisible()
  })

  test('should send a message', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type a message/i)
    await messageInput.fill('Hello, how are you?')
    
    const sendButton = page.getByRole('button', { name: /send/i })
    await sendButton.click()
    
    // Verify message appears in chat
    await expect(page.getByText('Hello, how are you?')).toBeVisible()
  })

  test('should create new chat', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()
    
    // Verify new chat form or modal
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should regenerate response', async ({ page }) => {
    // Assuming there's already a conversation
    const regenerateButton = page.getByRole('button', { name: /regenerate/i }).first()
    
    if (await regenerateButton.isVisible()) {
      await regenerateButton.click()
      // Wait for regeneration
      await page.waitForTimeout(1000)
    }
  })
})

test.describe('Chat Branches', () => {
  test('should create branch', async ({ page }) => {
    await page.goto('/chat')
    
    const branchButton = page.getByRole('button', { name: /branch/i }).first()
    
    if (await branchButton.isVisible()) {
      await branchButton.click()
      await expect(page.getByText(/branch created/i)).toBeVisible()
    }
  })

  test('should switch between branches', async ({ page }) => {
    await page.goto('/chat')
    
    // Interact with branch selector if available
    const branchSelector = page.getByRole('button', { name: /branches/i })
    
    if (await branchSelector.isVisible()) {
      await branchSelector.click()
      // Verify branch list
      await expect(page.getByRole('menu')).toBeVisible()
    }
  })
})

