/**
 * Production Authentication Page Object
 * 
 * PRODUCTION-ONLY FEATURES:
 * - Real demo user authentication
 * - Visual validation with screenshots
 * - Console error monitoring
 * - Performance measurement
 * - Session persistence validation
 */

import { Page, expect } from '@playwright/test'
import { ScreenshotManager } from '../utils/screenshot-manager'
import { ConsoleErrorMonitor } from '../utils/console-error-monitor'
import { PerformanceBenchmarker } from '../utils/performance-benchmarker'
import { ProductionEnvironmentValidator } from '../utils/production-environment-validator'

export class ProductionAuthPage {
  private readonly page: Page
  private readonly screenshotManager: ScreenshotManager
  private readonly consoleMonitor: ConsoleErrorMonitor
  private readonly performanceBenchmarker: PerformanceBenchmarker
  private readonly envValidator: ProductionEnvironmentValidator
  
  // Demo user credentials - PRODUCTION ONLY
  private readonly DEMO_CREDENTIALS = {
    email: 'test@example.com',
    password: 'password123'
  }

  constructor(page: Page) {
    this.page = page
    this.screenshotManager = new ScreenshotManager()
    this.consoleMonitor = new ConsoleErrorMonitor()
    this.performanceBenchmarker = new PerformanceBenchmarker()
    this.envValidator = new ProductionEnvironmentValidator()
  }

  /**
   * Navigate to login page with production validation
   */
  async navigateToLogin(testName: string): Promise<void> {
    // Start console monitoring
    this.consoleMonitor.startMonitoring(this.page, testName, 'navigate-to-login')
    
    // Validate production environment
    await this.envValidator.validateNoLocalhostInTestContext(this.page)
    
    // Capture before navigation
    await this.screenshotManager.captureScreenshot(this.page, testName, 'before-login-navigation')
    
    // Navigate to login
    console.log('🔐 Navigating to production login page...')
    await this.page.goto('/auth/login')
    
    // Wait for page load and measure performance
    await this.page.waitForLoadState('domcontentloaded')
    await this.performanceBenchmarker.measurePagePerformance(this.page, `${testName}-login-page`)
    
    // Validate we're on the correct page
    await expect(this.page).toHaveURL(/\/auth\/login/)
    
    // Capture after navigation
    await this.screenshotManager.captureScreenshot(this.page, testName, 'after-login-navigation')
    
    // Validate essential elements are present
    await this.validateLoginPageElements()
    
    console.log('✅ Login page loaded successfully')
  }

  /**
   * Perform demo user login with comprehensive validation
   */
  async loginWithDemoUser(testName: string): Promise<void> {
    console.log(`🔐 Logging in with demo user: ${this.DEMO_CREDENTIALS.email}`)
    
    // Start console monitoring for login
    this.consoleMonitor.startMonitoring(this.page, testName, 'demo-user-login')
    
    // Capture before login attempt
    await this.screenshotManager.captureScreenshot(this.page, testName, 'before-login-attempt')
    
    // Fill email field
    const emailField = this.page.locator('input[type="email"]')
    await expect(emailField).toBeVisible()
    await emailField.fill(this.DEMO_CREDENTIALS.email)
    
    // Fill password field
    const passwordField = this.page.locator('input[type="password"]')
    await expect(passwordField).toBeVisible()
    await passwordField.fill(this.DEMO_CREDENTIALS.password)
    
    // Capture filled form
    await this.screenshotManager.captureScreenshot(this.page, testName, 'login-form-filled')
    
    // Submit login form
    const submitButton = this.page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
    
    // Click submit and wait for navigation
    await Promise.all([
      this.page.waitForURL(/\/dashboard/, { timeout: 30000 }),
      submitButton.click()
    ])
    
    // Measure post-login performance
    await this.performanceBenchmarker.measurePagePerformance(this.page, `${testName}-post-login`)
    
    // Validate successful login
    await this.validateSuccessfulLogin(testName)
    
    console.log('✅ Demo user login successful')
  }

  /**
   * Validate successful login with evidence capture
   */
  private async validateSuccessfulLogin(testName: string): Promise<void> {
    // Should be redirected to dashboard
    await expect(this.page).toHaveURL(/\/dashboard/)
    
    // Look for authenticated user indicators
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '[data-testid="user-profile"]',
      'button:has-text("test@example.com")',
      'button:has-text("Logout")',
      '.user-menu',
      '.profile-menu'
    ]
    
    let userMenuFound = false
    for (const selector of userMenuSelectors) {
      try {
        const element = this.page.locator(selector)
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ User menu found: ${selector}`)
          userMenuFound = true
          break
        }
      } catch {
        // Continue to next selector
      }
    }
    
    if (!userMenuFound) {
      console.warn('⚠️ User menu not found with standard selectors, checking for other auth indicators')
      
      // Alternative authentication indicators
      const alternativeSelectors = [
        'text=Dashboard',
        'text=Super Cards',
        'text=Income Intelligence',
        'text=Performance Hub'
      ]
      
      for (const selector of alternativeSelectors) {
        try {
          await expect(this.page.locator(selector)).toBeVisible({ timeout: 5000 })
          console.log(`✅ Authentication indicator found: ${selector}`)
          userMenuFound = true
          break
        } catch {
          // Continue to next selector
        }
      }
    }
    
    // Capture post-login state
    await this.screenshotManager.captureScreenshot(this.page, testName, 'successful-login-state')
    
    if (!userMenuFound) {
      await this.screenshotManager.captureErrorScreenshot(this.page, testName, 'user-menu-not-found')
      throw new Error('❌ User authentication indicators not found after login')
    }
    
    // Validate no console errors during login
    const consoleErrors = this.consoleMonitor.getErrorsForTest(testName)
    if (consoleErrors.some(error => error.severity === 'critical')) {
      throw new Error(`❌ Critical console errors detected during login: ${consoleErrors.length}`)
    }
  }

  /**
   * Perform logout with validation
   */
  async logout(testName: string): Promise<void> {
    console.log('🔓 Logging out demo user...')
    
    this.consoleMonitor.startMonitoring(this.page, testName, 'demo-user-logout')
    
    // Capture before logout
    await this.screenshotManager.captureScreenshot(this.page, testName, 'before-logout')
    
    // Find and click user menu
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '[data-testid="user-profile"]',
      'button:has-text("test@example.com")',
      '.user-menu button',
      '.profile-menu button'
    ]
    
    let userMenuClicked = false
    for (const selector of userMenuSelectors) {
      try {
        const element = this.page.locator(selector)
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click()
          console.log(`✅ User menu clicked: ${selector}`)
          userMenuClicked = true
          break
        }
      } catch {
        // Continue to next selector
      }
    }
    
    if (!userMenuClicked) {
      // Try alternative logout approaches
      const logoutSelectors = [
        'text=Logout',
        'button:has-text("Logout")',
        '[data-testid="logout-button"]',
        'a[href*="logout"]'
      ]
      
      for (const selector of logoutSelectors) {
        try {
          const element = this.page.locator(selector)
          if (await element.isVisible({ timeout: 3000 })) {
            await element.click()
            console.log(`✅ Logout button clicked: ${selector}`)
            userMenuClicked = true
            break
          }
        } catch {
          // Continue to next selector
        }
      }
    }
    
    if (!userMenuClicked) {
      await this.screenshotManager.captureErrorScreenshot(this.page, testName, 'logout-menu-not-found')
      throw new Error('❌ Could not find user menu or logout button')
    }
    
    // Look for logout option and click it
    try {
      const logoutOption = this.page.locator('text=Logout').first()
      await logoutOption.waitFor({ state: 'visible', timeout: 5000 })
      await logoutOption.click()
    } catch {
      console.log('⚠️ Logout menu item not found, checking if already logged out')
    }
    
    // Wait for redirect to home or login page
    await this.page.waitForURL(/\/(auth\/login|$)/, { timeout: 15000 })
    
    // Capture post-logout state
    await this.screenshotManager.captureScreenshot(this.page, testName, 'successful-logout-state')
    
    // Validate logout was successful
    await this.validateSuccessfulLogout()
    
    console.log('✅ Demo user logout successful')
  }

  /**
   * Validate successful logout
   */
  private async validateSuccessfulLogout(): Promise<void> {
    // Should be redirected away from dashboard
    const currentUrl = this.page.url()
    if (currentUrl.includes('/dashboard')) {
      throw new Error('❌ Still on dashboard after logout attempt')
    }
    
    // Should see login button or be on login page
    try {
      await expect(this.page.locator('text=Login').first()).toBeVisible({ timeout: 5000 })
    } catch {
      // If not on a page with login button, check if on login page itself
      if (!currentUrl.includes('/auth/login')) {
        throw new Error('❌ Logout validation failed - no login indicators found')
      }
    }
  }

  /**
   * Test invalid credentials with error validation
   */
  async testInvalidCredentials(testName: string): Promise<void> {
    console.log('🔐 Testing invalid credentials...')
    
    this.consoleMonitor.startMonitoring(this.page, testName, 'invalid-credentials-test')
    
    // Navigate to login if not already there
    if (!this.page.url().includes('/auth/login')) {
      await this.navigateToLogin(testName)
    }
    
    // Capture before invalid login attempt
    await this.screenshotManager.captureScreenshot(this.page, testName, 'before-invalid-login')
    
    // Fill invalid credentials
    await this.page.fill('input[type="email"]', 'invalid@example.com')
    await this.page.fill('input[type="password"]', 'wrongpassword')
    
    // Submit form
    await this.page.click('button[type="submit"]')
    
    // Wait for error message
    const errorSelectors = [
      'text=Invalid credentials',
      'text=Login failed',
      'text=Incorrect email or password',
      '[data-testid="error-message"]',
      '.error-message',
      '.alert-error'
    ]
    
    let errorFound = false
    for (const selector of errorSelectors) {
      try {
        await expect(this.page.locator(selector)).toBeVisible({ timeout: 5000 })
        console.log(`✅ Error message found: ${selector}`)
        errorFound = true
        break
      } catch {
        // Continue to next selector
      }
    }
    
    // Capture error state
    await this.screenshotManager.captureScreenshot(this.page, testName, 'invalid-credentials-error')
    
    if (!errorFound) {
      await this.screenshotManager.captureErrorScreenshot(this.page, testName, 'no-error-message-shown')
      throw new Error('❌ No error message shown for invalid credentials')
    }
    
    // Should still be on login page
    await expect(this.page).toHaveURL(/\/auth\/login/)
    
    console.log('✅ Invalid credentials handled correctly')
  }

  /**
   * Validate essential login page elements
   */
  private async validateLoginPageElements(): Promise<void> {
    const requiredElements = [
      { selector: 'input[type="email"]', name: 'Email field' },
      { selector: 'input[type="password"]', name: 'Password field' },
      { selector: 'button[type="submit"]', name: 'Submit button' }
    ]
    
    for (const element of requiredElements) {
      try {
        await expect(this.page.locator(element.selector)).toBeVisible({ timeout: 10000 })
        console.log(`✅ ${element.name} found`)
      } catch (error) {
        throw new Error(`❌ Required element missing: ${element.name} (${element.selector})`)
      }
    }
  }

  /**
   * Test session persistence across page refreshes
   */
  async testSessionPersistence(testName: string): Promise<void> {
    console.log('🔄 Testing session persistence...')
    
    // Ensure we're logged in and on dashboard
    await expect(this.page).toHaveURL(/\/dashboard/)
    
    // Capture before refresh
    await this.screenshotManager.captureScreenshot(this.page, testName, 'before-session-refresh')
    
    // Refresh the page
    await this.page.reload()
    await this.page.waitForLoadState('domcontentloaded')
    
    // Should still be authenticated and on dashboard
    await expect(this.page).toHaveURL(/\/dashboard/)
    
    // Capture after refresh
    await this.screenshotManager.captureScreenshot(this.page, testName, 'after-session-refresh')
    
    // Validate user is still authenticated
    await this.validateSuccessfulLogin(testName)
    
    console.log('✅ Session persistence validated')
  }

  /**
   * Get demo user credentials (for external use)
   */
  getDemoCredentials() {
    return { ...this.DEMO_CREDENTIALS }
  }
}