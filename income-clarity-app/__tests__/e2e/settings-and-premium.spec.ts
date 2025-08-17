/**
 * Settings and Premium Features E2E Tests
 * Tests settings page functionality and premium feature gates
 */

import { test, expect } from '@playwright/test'

test.describe('Settings and Premium Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test.describe('Settings Page Functionality', () => {
    test('should load settings page successfully', async ({ page }) => {
      await page.goto('/settings')
      await expect(page).toHaveURL(/\/settings/)
      
      // Should have main settings sections
      await expect(page.locator('text=Settings')).toBeVisible()
      
      // Take screenshot for documentation
      await page.screenshot({ 
        path: 'test-results/settings-page-overview.png', 
        fullPage: true 
      })
    })

    test('should display bank connections section', async ({ page }) => {
      await page.goto('/settings')
      
      // Should see Bank Connections section
      const bankSection = page.locator('text=Bank Connections').or(
        page.locator('[data-testid*="bank"]')
      )
      await expect(bankSection).toBeVisible()
      
      // Should see Connect Bank Account button
      const connectButton = page.locator('button:has-text("Connect Bank Account")').or(
        page.locator('[data-testid*="connect-bank"]')
      )
      await expect(connectButton).toBeVisible()
    })

    test('should handle theme toggle', async ({ page }) => {
      await page.goto('/settings')
      
      // Look for theme toggle
      const themeToggle = page.locator('[data-testid*="theme"]').or(
        page.locator('button:has-text("Dark")').or(
          page.locator('button:has-text("Light")')
        )
      )
      
      if (await themeToggle.first().isVisible()) {
        await themeToggle.first().click()
        await page.waitForTimeout(1000)
        
        // Should update theme
        const bodyClass = await page.locator('body').getAttribute('class')
        expect(bodyClass).toBeTruthy()
      }
    })

    test('should validate notification preferences', async ({ page }) => {
      await page.goto('/settings')
      
      // Look for notification settings
      const notificationSection = page.locator('text=Notifications').or(
        page.locator('[data-testid*="notification"]')
      )
      
      if (await notificationSection.isVisible()) {
        // Test notification toggles
        const toggles = page.locator('input[type="checkbox"]')
        const toggleCount = await toggles.count()
        
        for (let i = 0; i < Math.min(toggleCount, 3); i++) {
          const toggle = toggles.nth(i)
          if (await toggle.isVisible() && await toggle.isEnabled()) {
            await toggle.check()
            await page.waitForTimeout(200)
            await toggle.uncheck()
          }
        }
      }
    })

    test('should handle profile settings', async ({ page }) => {
      await page.goto('/settings')
      
      // Look for profile section
      const profileSection = page.locator('text=Profile').or(
        page.locator('[data-testid*="profile"]')
      )
      
      if (await profileSection.isVisible()) {
        // Test profile fields
        const nameField = page.locator('input[name*="name"]')
        const emailField = page.locator('input[type="email"]')
        
        if (await nameField.first().isVisible()) {
          await nameField.first().clear()
          await nameField.first().fill('Test User Updated')
          await nameField.first().clear()
          await nameField.first().fill('Test User')
        }
      }
    })
  })

  test.describe('Premium Features Testing', () => {
    test('should display Connect Bank Account button', async ({ page }) => {
      await page.goto('/settings')
      
      // Should see premium Connect Bank Account button
      const connectButton = page.locator('button:has-text("Connect Bank Account")')
      await expect(connectButton).toBeVisible()
      
      // Click to test premium modal
      await connectButton.click()
      await page.waitForTimeout(2000)
      
      // Should open premium modal or iframe
      const modal = page.locator('[role="dialog"]').or(
        page.locator('iframe').or(
          page.locator('.modal')
        )
      )
      
      const modalVisible = await modal.first().isVisible({ timeout: 5000 })
      if (modalVisible) {
        await page.screenshot({ 
          path: 'test-results/bank-connection-modal.png', 
          fullPage: true 
        })
      }
      
      expect(modalVisible).toBeTruthy()
    })

    test('should show premium indicators throughout app', async ({ page }) => {
      // Check dashboard for premium indicators
      await page.goto('/dashboard/super-cards-unified')
      
      // Look for premium badges or indicators
      const premiumIndicators = page.locator('text=Premium').or(
        page.locator('[data-testid*="premium"]').or(
          page.locator('text=Pro').or(
            page.locator('text=Upgrade')
          )
        )
      )
      
      const indicatorCount = await premiumIndicators.count()
      console.log(`Found ${indicatorCount} premium indicators`)
      
      // Should have at least some premium indicators
      expect(indicatorCount).toBeGreaterThan(0)
    })

    test('should handle premium feature gates', async ({ page }) => {
      await page.goto('/portfolio')
      
      // Look for premium gated features
      const premiumFeatures = page.locator('button:has-text("Upgrade")').or(
        page.locator('[data-testid*="premium-gate"]')
      )
      
      if (await premiumFeatures.first().isVisible()) {
        await premiumFeatures.first().click()
        await page.waitForTimeout(1000)
        
        // Should show upgrade modal or redirect
        const upgradeModal = page.locator('text=Upgrade').or(
          page.locator('text=Premium')
        )
        await expect(upgradeModal).toBeVisible()
      }
    })

    test('should test pricing page access', async ({ page }) => {
      await page.goto('/pricing')
      
      // Should load pricing page
      await expect(page).toHaveURL(/\/pricing/)
      
      // Should show pricing options
      const pricingElements = page.locator('text=Free').or(
        page.locator('text=Premium').or(
          page.locator('text=Pro')
        )
      )
      
      await expect(pricingElements.first()).toBeVisible()
      
      await page.screenshot({ 
        path: 'test-results/pricing-page.png', 
        fullPage: true 
      })
    })
  })

  test.describe('Data Management Features', () => {
    test('should test demo data reset functionality', async ({ page }) => {
      // Navigate to demo page
      await page.goto('/demo')
      
      // Look for reset demo data button
      const resetButton = page.locator('button:has-text("Reset")').or(
        page.locator('button:has-text("Demo")').or(
          page.locator('[data-testid*="reset"]')
        )
      )
      
      if (await resetButton.first().isVisible()) {
        // Test reset functionality (without actually resetting)
        await resetButton.first().click()
        await page.waitForTimeout(1000)
        
        // Should show confirmation
        const confirmation = page.locator('text=Are you sure').or(
          page.locator('text=Reset').or(
            page.locator('text=Confirm')
          )
        )
        
        if (await confirmation.isVisible()) {
          // Cancel to avoid actual reset
          const cancelButton = page.locator('button:has-text("Cancel")').or(
            page.locator('button:has-text("No")')
          )
          
          if (await cancelButton.first().isVisible()) {
            await cancelButton.first().click()
          }
        }
      } else {
        // Try API endpoint directly
        const response = await page.request.post('/api/demo/reset', {
          failOnStatusCode: false
        })
        
        // Should be accessible (even if it returns error due to missing data)
        expect(response.status()).toBeLessThan(500)
      }
    })

    test('should test data export functionality', async ({ page }) => {
      await page.goto('/portfolio')
      
      // Look for export buttons
      const exportButton = page.locator('button:has-text("Export")').or(
        page.locator('button:has-text("Download")').or(
          page.locator('[data-testid*="export"]')
        )
      )
      
      if (await exportButton.first().isVisible()) {
        // Note: Not actually downloading to avoid file system changes
        await exportButton.first().click()
        await page.waitForTimeout(1000)
        
        // Should trigger download or show options
        const downloadOption = page.locator('text=CSV').or(
          page.locator('text=Download')
        )
        
        expect(await downloadOption.first().isVisible({ timeout: 3000 })).toBeTruthy()
      }
    })
  })

  test.describe('Accessibility and UX Features', () => {
    test('should test keyboard navigation', async ({ page }) => {
      await page.goto('/settings')
      
      // Test tab navigation
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)
      await page.keyboard.press('Tab')
      
      // Should have focus indicators
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should test screen reader compatibility', async ({ page }) => {
      await page.goto('/settings')
      
      // Check for ARIA labels and roles
      const ariaElements = page.locator('[aria-label]').or(
        page.locator('[role]')
      )
      
      const ariaCount = await ariaElements.count()
      expect(ariaCount).toBeGreaterThan(0)
      
      // Check for semantic HTML
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      expect(headingCount).toBeGreaterThan(0)
    })

    test('should handle high contrast mode', async ({ page }) => {
      await page.goto('/settings')
      
      // Test with forced colors (high contrast)
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
      
      // Should still be usable
      const buttons = page.locator('button:visible')
      const buttonCount = await buttons.count()
      expect(buttonCount).toBeGreaterThan(0)
      
      // Reset media
      await page.emulateMedia({ colorScheme: 'light', forcedColors: 'none' })
    })
  })

  test.describe('Performance and Error Handling', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.context().route('**/*', route => {
        setTimeout(() => route.continue(), 1000)
      })
      
      await page.goto('/settings')
      
      // Should still load (may take longer)
      await expect(page.locator('text=Settings')).toBeVisible({ timeout: 15000 })
      
      // Clear route override
      await page.context().unroute('**/*')
    })

    test('should handle API failures gracefully', async ({ page }) => {
      // Intercept settings API calls to return errors
      await page.route('**/api/user/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        })
      })
      
      await page.goto('/settings')
      
      // Should show error state or default values
      const errorMessage = page.locator('text=Error').or(
        page.locator('text=Failed').or(
          page.locator('text=Try again')
        )
      )
      
      // Should either show error or handle gracefully
      const pageLoaded = await page.locator('text=Settings').isVisible({ timeout: 5000 })
      expect(pageLoaded).toBeTruthy()
    })
  })

  test.describe('Mobile Settings Experience', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/settings')
      
      // Should show mobile-optimized layout
      await expect(page.locator('text=Settings')).toBeVisible()
      
      // Test mobile interactions
      const buttons = page.locator('button:visible')
      if (await buttons.first().isVisible()) {
        await buttons.first().tap()
        await page.waitForTimeout(500)
      }
      
      await page.screenshot({ 
        path: 'test-results/settings-mobile.png', 
        fullPage: true 
      })
    })

    test('should handle touch gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/settings')
      
      // Test touch interactions
      const scrollableArea = page.locator('main').or(page.locator('body'))
      
      // Simulate scroll gesture
      await scrollableArea.hover()
      await page.mouse.wheel(0, 300)
      await page.waitForTimeout(500)
      
      // Should handle scroll smoothly
      const scrollPosition = await page.evaluate(() => window.pageYOffset)
      expect(scrollPosition).toBeGreaterThan(0)
    })
  })
})