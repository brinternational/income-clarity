/**
 * Portfolio Management E2E Tests
 * Tests complete portfolio and holdings management workflows
 */

import { test, expect } from '@playwright/test'

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new portfolio', async ({ page }) => {
    // Navigate to portfolio page
    await page.click('text=Portfolio')
    await expect(page).toHaveURL('/portfolio')
    
    // Click create portfolio button
    await page.click('button:has-text("Create Portfolio")')
    
    // Fill portfolio form
    await page.fill('input[name="name"]', 'Test Portfolio')
    await page.selectOption('select[name="type"]', 'TAXABLE')
    await page.fill('input[name="institution"]', 'Test Broker')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Portfolio created successfully')).toBeVisible()
    
    // Should see the new portfolio in the list
    await expect(page.locator('text=Test Portfolio')).toBeVisible()
  })

  test('should add holdings to portfolio', async ({ page }) => {
    await page.goto('/portfolio')
    
    // Click on existing portfolio or create one
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Click add holding button
    await page.click('button:has-text("Add Holding")')
    
    // Fill holding form
    await page.fill('input[name="ticker"]', 'SCHD')
    await page.fill('input[name="shares"]', '100')
    await page.fill('input[name="costBasis"]', '75.50')
    await page.fill('input[name="purchaseDate"]', '2024-01-15')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Holding added successfully')).toBeVisible()
    
    // Should see the holding in the table
    await expect(page.locator('text=SCHD')).toBeVisible()
    await expect(page.locator('text=100')).toBeVisible()
  })

  test('should validate ticker symbols', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    await page.click('button:has-text("Add Holding")')
    
    // Enter invalid ticker
    await page.fill('input[name="ticker"]', 'INVALID')
    await page.blur('input[name="ticker"]')
    
    // Should show validation error or warning
    await expect(page.locator('text=Invalid symbol')).toBeVisible({ timeout: 5000 })
  })

  test('should edit existing holdings', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Click edit button on first holding
    await page.click('[data-testid="edit-holding"]:first-child')
    
    // Update shares
    await page.fill('input[name="shares"]', '150')
    
    // Submit changes
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Holding updated successfully')).toBeVisible()
    
    // Should reflect new values
    await expect(page.locator('text=150')).toBeVisible()
  })

  test('should delete holdings with confirmation', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Click delete button on first holding
    await page.click('[data-testid="delete-holding"]:first-child')
    
    // Should show confirmation dialog
    await expect(page.locator('text=Are you sure')).toBeVisible()
    
    // Confirm deletion
    await page.click('button:has-text("Delete")')
    
    // Should show success message
    await expect(page.locator('text=Holding deleted successfully')).toBeVisible()
  })

  test('should refresh stock prices', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Click refresh prices button
    await page.click('button:has-text("Refresh Prices")')
    
    // Should show loading state
    await expect(page.locator('text=Refreshing')).toBeVisible()
    
    // Should complete refresh
    await expect(page.locator('text=Prices updated')).toBeVisible({ timeout: 10000 })
  })

  test('should calculate portfolio values correctly', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Should display calculated values
    await expect(page.locator('[data-testid="total-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-cost"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-gain-loss"]')).toBeVisible()
    
    // Values should be formatted as currency
    await expect(page.locator('text=/\\$[\\d,]+/')).toBeVisible()
  })

  test('should show data source indicators', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Should show price data source
    await expect(page.locator('[data-testid="data-source-indicator"]')).toBeVisible()
    
    // Should indicate if using live or simulated data
    const dataSource = await page.locator('[data-testid="data-source-indicator"]').textContent()
    expect(dataSource).toMatch(/(Live|Simulated|Polygon)/)
  })

  test('should record dividend payments', async ({ page }) => {
    await page.goto('/portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    
    // Click record dividend button
    await page.click('[data-testid="record-dividend"]:first-child')
    
    // Fill dividend form
    await page.fill('input[name="amount"]', '125.50')
    await page.fill('input[name="exDate"]', '2024-01-15')
    await page.fill('input[name="payDate"]', '2024-01-30')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Dividend recorded')).toBeVisible()
  })

  test('should handle portfolio import functionality', async ({ page }) => {
    await page.goto('/portfolio')
    
    // Click import button
    await page.click('button:has-text("Import")')
    
    // Should show import wizard
    await expect(page.locator('text=Import Portfolio')).toBeVisible()
    
    // Should show file upload area
    await expect(page.locator('input[type="file"]')).toBeVisible()
  })

  test('should display portfolio statistics', async ({ page }) => {
    await page.goto('/portfolio')
    
    // Should show summary statistics
    await expect(page.locator('[data-testid="total-portfolios"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-holdings"]')).toBeVisible()
    await expect(page.locator('[data-testid="portfolio-value"]')).toBeVisible()
    
    // Statistics should have meaningful values
    const totalValue = await page.locator('[data-testid="portfolio-value"]').textContent()
    expect(totalValue).toMatch(/\$[\d,]+/)
  })

  test('should handle mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/portfolio')
    
    // Should show mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-portfolio-view"]')).toBeVisible()
    
    // Should be able to navigate and interact on mobile
    await page.click('[data-testid="portfolio-card"]:first-child')
    await expect(page.locator('text=Holdings')).toBeVisible()
  })

  test('should maintain portfolio state across navigation', async ({ page }) => {
    await page.goto('/portfolio')
    
    // Add a holding
    await page.click('[data-testid="portfolio-card"]:first-child')
    await page.click('button:has-text("Add Holding")')
    await page.fill('input[name="ticker"]', 'VTI')
    await page.fill('input[name="shares"]', '50')
    await page.fill('input[name="costBasis"]', '220.00')
    await page.click('button[type="submit"]')
    
    // Navigate away and back
    await page.click('text=Dashboard')
    await page.click('text=Portfolio')
    
    // Should still see the added holding
    await page.click('[data-testid="portfolio-card"]:first-child')
    await expect(page.locator('text=VTI')).toBeVisible()
  })
})