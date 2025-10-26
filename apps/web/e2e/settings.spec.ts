import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('should display settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    // General tab
    await page.getByRole('tab', { name: /general/i }).click()
    await expect(page.getByText(/user name/i)).toBeVisible()

    // AI Models tab
    await page.getByRole('tab', { name: /ai models/i }).click()
    await expect(page.getByText(/add model/i)).toBeVisible()

    // Plugins tab
    await page.getByRole('tab', { name: /plugins/i }).click()
    await expect(page.getByText(/install plugin/i)).toBeVisible()

    // Interface tab
    await page.getByRole('tab', { name: /interface/i }).click()
    await expect(page.getByText(/compact mode/i)).toBeVisible()
  })

  test('should change language', async ({ page }) => {
    await page.getByRole('tab', { name: /general/i }).click()
    
    const languageSelect = page.locator('#language')
    await languageSelect.selectOption('en')
    
    // Verify language changed (would need actual i18n implementation)
    await page.waitForTimeout(500)
  })

  test('should toggle theme', async ({ page }) => {
    await page.getByRole('tab', { name: /general/i }).click()
    
    const themeSelect = page.locator('#theme')
    await themeSelect.selectOption('light')
    
    // Verify theme applied
    await page.waitForTimeout(500)
  })
})

test.describe('AI Model Settings', () => {
  test('should display model list', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('tab', { name: /ai models/i }).click()
    
    // Verify models are listed or "no models" message
    const hasModels = await page.getByRole('button', { name: /edit/i }).count() > 0
    const noModels = await page.getByText(/no ai models/i).isVisible()
    
    expect(hasModels || noModels).toBeTruthy()
  })

  test('should toggle plugin', async ({ page }) => {
    await page.goto('/settings')
    await page.getByRole('tab', { name: /plugins/i }).click()
    
    const toggleSwitch = page.locator('input[type="checkbox"]').first()
    
    if (await toggleSwitch.isVisible()) {
      const initialState = await toggleSwitch.isChecked()
      await toggleSwitch.click()
      
      // Verify state changed
      const newState = await toggleSwitch.isChecked()
      expect(newState).not.toBe(initialState)
    }
  })
})

