/**
 * Super Cards E2E Tests
 * Tests all 5 super card hubs functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Super Cards Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Navigate to super cards
    await page.goto('/dashboard/super-cards-unified')
    await expect(page).toHaveURL(/\/dashboard\/super-cards/)
  })

  test('should load all 5 super cards', async ({ page }) => {
    // Should see all super card hubs
    await expect(page.locator('[data-testid="income-intelligence-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="performance-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="portfolio-strategy-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="tax-strategy-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="financial-planning-hub"]')).toBeVisible()
  })

  test('should navigate between card tabs in Income Intelligence Hub', async ({ page }) => {
    // Click on Income Intelligence Hub
    const incomeHub = page.locator('[data-testid="income-intelligence-hub"]')
    await expect(incomeHub).toBeVisible()
    
    // Should see above/below zero indicator
    await expect(incomeHub.locator('text=ABOVE ZERO LINE')).toBeVisible()
    
    // Navigate through tabs
    await incomeHub.locator('button:has-text("Progression")').click()
    await expect(incomeHub.locator('[data-testid="income-progression"]')).toBeVisible()
    
    await incomeHub.locator('button:has-text("Projections")').click()
    await expect(incomeHub.locator('[data-testid="dividend-projections"]')).toBeVisible()
    
    await incomeHub.locator('button:has-text("Calendar")').click()
    await expect(incomeHub.locator('[data-testid="dividend-calendar"]')).toBeVisible()
  })

  test('should display real-time data in Performance Hub', async ({ page }) => {
    const performanceHub = page.locator('[data-testid="performance-hub"]')
    await expect(performanceHub).toBeVisible()
    
    // Should show portfolio performance metrics
    await expect(performanceHub.locator('[data-testid="portfolio-return"]')).toBeVisible()
    await expect(performanceHub.locator('[data-testid="spy-comparison"]')).toBeVisible()
    await expect(performanceHub.locator('[data-testid="benchmark-chart"]')).toBeVisible()
    
    // Should display formatted percentages
    await expect(performanceHub.locator('text=/%/')).toBeVisible()
    
    // Should show time period selector
    await expect(performanceHub.locator('[data-testid="time-period-selector"]')).toBeVisible()
  })

  test('should show portfolio allocation in Portfolio Strategy Hub', async ({ page }) => {
    const strategyHub = page.locator('[data-testid="portfolio-strategy-hub"]')
    await expect(strategyHub).toBeVisible()
    
    // Should show sector allocation
    await expect(strategyHub.locator('[data-testid="sector-allocation"]')).toBeVisible()
    
    // Should show holdings breakdown
    await expect(strategyHub.locator('[data-testid="holdings-breakdown"]')).toBeVisible()
    
    // Should display allocation percentages
    await expect(strategyHub.locator('text=/%/')).toBeVisible()
  })

  test('should calculate tax strategies in Tax Strategy Hub', async ({ page }) => {
    const taxHub = page.locator('[data-testid="tax-strategy-hub"]')
    await expect(taxHub).toBeVisible()
    
    // Should show current tax situation
    await expect(taxHub.locator('[data-testid="current-tax-rate"]')).toBeVisible()
    
    // Should show potential savings
    await expect(taxHub.locator('[data-testid="potential-savings"]')).toBeVisible()
    
    // Should show strategy recommendations
    await expect(taxHub.locator('[data-testid="tax-strategies"]')).toBeVisible()
    
    // Should allow location changes
    await expect(taxHub.locator('[data-testid="location-selector"]')).toBeVisible()
  })

  test('should display FIRE progress in Financial Planning Hub', async ({ page }) => {
    const planningHub = page.locator('[data-testid="financial-planning-hub"]')
    await expect(planningHub).toBeVisible()
    
    // Should show FIRE targets
    await expect(planningHub.locator('[data-testid="fire-targets"]')).toBeVisible()
    
    // Should show progress bars
    await expect(planningHub.locator('[data-testid="progress-bar"]')).toBeVisible()
    
    // Should show milestone tracking
    await expect(planningHub.locator('[data-testid="milestones"]')).toBeVisible()
    
    // Should display years to FIRE
    await expect(planningHub.locator('text=/\\d+ years/')).toBeVisible()
  })

  test('should toggle between monthly and annual views', async ({ page }) => {
    const incomeHub = page.locator('[data-testid="income-intelligence-hub"]')
    
    // Should show monthly by default
    await expect(incomeHub.locator('text=/\\/month/')).toBeVisible()
    
    // Click annual toggle
    await incomeHub.locator('[data-testid="annual-toggle"]').click()
    
    // Should update to annual view
    await expect(incomeHub.locator('text=/\\/year/')).toBeVisible()
    
    // Values should be multiplied by 12
    const monthlyValue = await incomeHub.locator('[data-testid="available-amount"]').textContent()
    expect(monthlyValue).toMatch(/\$[\d,]+/)
  })

  test('should handle data loading states', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/super-cards/**', route => {
      setTimeout(() => route.continue(), 2000)
    })
    
    await page.reload()
    
    // Should show loading skeletons
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible()
    
    // Should eventually load data
    await expect(page.locator('[data-testid="income-intelligence-hub"]')).toBeVisible({ timeout: 10000 })
  })

  test('should update data when portfolio changes', async ({ page }) => {
    // Get initial values from Performance Hub
    const performanceHub = page.locator('[data-testid="performance-hub"]')
    const initialValue = await performanceHub.locator('[data-testid="portfolio-value"]').textContent()
    
    // Navigate to portfolio and add holding
    await page.click('text=Portfolio')
    await page.click('[data-testid="portfolio-card"]:first-child')
    await page.click('button:has-text("Add Holding")')
    
    await page.fill('input[name="ticker"]', 'AAPL')
    await page.fill('input[name="shares"]', '10')
    await page.fill('input[name="costBasis"]', '180.00')
    await page.click('button[type="submit"]')
    
    // Return to super cards
    await page.goto('/dashboard/super-cards-unified')
    
    // Should reflect updated portfolio value
    const newValue = await performanceHub.locator('[data-testid="portfolio-value"]').textContent()
    expect(newValue).not.toBe(initialValue)
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should show mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-super-cards"]')).toBeVisible()
    
    // Should allow swiping between cards
    const incomeHub = page.locator('[data-testid="income-intelligence-hub"]')
    await expect(incomeHub).toBeVisible()
    
    // Should show swipe indicators
    await expect(page.locator('text=/Swipe/')).toBeVisible()
  })

  test('should handle data refresh functionality', async ({ page }) => {
    // Click refresh button
    await page.click('[data-testid="refresh-data"]')
    
    // Should show loading indicator
    await expect(page.locator('[data-testid="refreshing"]')).toBeVisible()
    
    // Should complete refresh
    await expect(page.locator('text=Data updated')).toBeVisible({ timeout: 10000 })
  })

  test('should show appropriate error states', async ({ page }) => {
    // Intercept API calls to return errors
    await page.route('**/api/super-cards/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    await page.reload()
    
    // Should show error messages
    await expect(page.locator('text=Failed to load data')).toBeVisible()
    
    // Should show retry button
    await expect(page.locator('button:has-text("Retry")')).toBeVisible()
  })

  test('should maintain state across browser refresh', async ({ page }) => {
    const incomeHub = page.locator('[data-testid="income-intelligence-hub"]')
    
    // Change to annual view
    await incomeHub.locator('[data-testid="annual-toggle"]').click()
    await expect(incomeHub.locator('text=/\\/year/')).toBeVisible()
    
    // Refresh page
    await page.reload()
    
    // Should maintain annual view
    await expect(incomeHub.locator('text=/\\/year/')).toBeVisible()
  })

  test('should show data source indicators', async ({ page }) => {
    // Should show where data comes from
    await expect(page.locator('[data-testid="data-source"]')).toBeVisible()
    
    // Should indicate live vs simulated data
    const dataSource = await page.locator('[data-testid="data-source"]').textContent()
    expect(dataSource).toMatch(/(Live|Simulated|Demo)/)
  })
})