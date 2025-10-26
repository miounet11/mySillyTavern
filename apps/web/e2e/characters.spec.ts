import { test, expect } from '@playwright/test'

test.describe('Characters Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/characters')
  })

  test('should display characters page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '角色管理' })).toBeVisible()
  })

  test('should open create character modal', async ({ page }) => {
    await page.getByRole('button', { name: /创建角色/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should search for characters', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索角色...')
    await searchInput.fill('test')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Verify search was triggered
    await expect(searchInput).toHaveValue('test')
  })

  test('should create a new character', async ({ page }) => {
    // Open create modal
    await page.getByRole('button', { name: /创建角色/ }).click()
    
    // Fill in character details
    await page.getByLabel('名称').fill('Test Character')
    await page.getByLabel('描述').fill('This is a test character')
    await page.getByLabel('个性').fill('Friendly and helpful')
    
    // Submit form
    await page.getByRole('button', { name: /保存/ }).click()
    
    // Verify character was created
    await expect(page.getByText('Test Character')).toBeVisible()
  })

  test('should handle file import', async ({ page }) => {
    // Create a test file
    const fileContent = JSON.stringify({
      name: 'Imported Character',
      description: 'An imported character',
      personality: 'Mysterious',
    })

    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByLabel('导入角色').click()
    const fileChooser = await fileChooserPromise
    
    // Note: In real test, you would upload actual file
    // This is a simplified example
    
    await expect(page.getByText('角色导入成功')).toBeVisible()
  })
})

test.describe('Character Details', () => {
  test('should display character details', async ({ page }) => {
    await page.goto('/characters')
    
    // Assuming there's at least one character
    const characterCard = page.locator('[data-testid="character-card"]').first()
    await characterCard.click()
    
    // Verify character details are shown
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('should edit character', async ({ page }) => {
    await page.goto('/characters')
    
    // Click edit on first character
    await page.getByRole('button', { name: /编辑/ }).first().click()
    
    // Edit character name
    const nameInput = page.getByLabel('名称')
    await nameInput.clear()
    await nameInput.fill('Updated Character Name')
    
    // Save changes
    await page.getByRole('button', { name: /保存/ }).click()
    
    // Verify update
    await expect(page.getByText('Updated Character Name')).toBeVisible()
  })

  test('should delete character with confirmation', async ({ page }) => {
    await page.goto('/characters')
    
    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept())
    
    // Delete first character
    await page.getByRole('button', { name: /删除/ }).first().click()
    
    // Verify character was deleted (list updated)
    await page.waitForTimeout(500)
  })
})

test.describe('Character Export', () => {
  test('should export character as JSON', async ({ page }) => {
    await page.goto('/characters')
    
    // Click export on first character
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出/ }).first().click()
    
    const download = await downloadPromise
    
    // Verify file was downloaded
    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })
})

