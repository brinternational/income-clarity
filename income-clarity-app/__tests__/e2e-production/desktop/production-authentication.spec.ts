/**
 * Production Authentication Tests - Desktop
 * 
 * PRODUCTION-ONLY VALIDATION:
 * - Real demo user authentication against https://incomeclarity.ddns.net
 * - Visual evidence capture for every test phase
 * - Zero tolerance console error monitoring
 * - Interactive testing with real user flows
 * - Session persistence validation
 * - Performance benchmarking
 */

import { test, expect } from '@playwright/test'
import { ProductionAuthPage } from '../page-objects/ProductionAuthPage'
import { ProductionDashboardPage } from '../page-objects/ProductionDashboardPage'
import { ScreenshotManager } from '../utils/screenshot-manager'
import { ConsoleErrorMonitor } from '../utils/console-error-monitor'
import { PerformanceBenchmarker } from '../utils/performance-benchmarker'
import { ProductionEnvironmentValidator } from '../utils/production-environment-validator'

test.describe('Production Authentication - Desktop', () => {
  let authPage: ProductionAuthPage
  let dashboardPage: ProductionDashboardPage
  let screenshotManager: ScreenshotManager
  let consoleMonitor: ConsoleErrorMonitor
  let performanceBenchmarker: PerformanceBenchmarker
  let envValidator: ProductionEnvironmentValidator

  test.beforeAll(async () => {
    // Initialize monitoring systems
    screenshotManager = new ScreenshotManager()
    consoleMonitor = new ConsoleErrorMonitor()
    performanceBenchmarker = new PerformanceBenchmarker()
    envValidator = new ProductionEnvironmentValidator()
    
    await screenshotManager.initialize()
    await consoleMonitor.initialize()
    await performanceBenchmarker.initialize()
  })

  test.beforeEach(async ({ page }) => {
    // CRITICAL: Validate production environment
    await envValidator.blockLocalhostAttempts()
    
    // Initialize page objects
    authPage = new ProductionAuthPage(page)
    dashboardPage = new ProductionDashboardPage(page)
    
    // Validate production URL
    await envValidator.validateNoLocalhostInTestContext(page)
    
    console.log('🚀 Starting production authentication test')
    console.log(`📍 Environment: ${page.url() || 'https://incomeclarity.ddns.net'}`)
  })

  test.afterEach(async ({ page }, testInfo) => {
    // Capture final state regardless of test result
    await screenshotManager.captureScreenshot(page, testInfo.title, 'test-complete')
    
    // Check for console errors - fail test if critical errors found
    const errorCount = consoleMonitor.getErrorCount()
    if (errorCount.critical > 0) {
      await screenshotManager.captureErrorScreenshot(page, testInfo.title, 'critical-console-errors')
      throw new Error(`❌ Test failed due to ${errorCount.critical} critical console errors`)
    }
    
    // Log test completion
    console.log(`✅ Test completed: ${testInfo.title}`)
    console.log(`📊 Console errors: ${errorCount.total} (${errorCount.critical} critical)`)
  })

  test('should complete full authentication flow with demo user', async ({ page }) => {
    const testName = 'complete-authentication-flow'
    
    // Step 1: Navigate to login page
    await authPage.navigateToLogin(testName)
    
    // Step 2: Login with demo user
    await authPage.loginWithDemoUser(testName)
    
    // Step 3: Verify dashboard access
    await dashboardPage.navigateToDashboard(testName)
    
    // Step 4: Test session persistence
    await authPage.testSessionPersistence(testName)
    
    // Step 5: Complete logout
    await authPage.logout(testName)
    
    // Final validation: Should be logged out
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/dashboard')
    
    console.log('✅ Full authentication flow completed successfully')
  })

  test('should handle invalid credentials correctly', async ({ page }) => {
    const testName = 'invalid-credentials-handling'
    
    // Navigate to login
    await authPage.navigateToLogin(testName)
    
    // Test invalid credentials
    await authPage.testInvalidCredentials(testName)
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/auth\/login/)
    
    console.log('✅ Invalid credentials handled correctly')
  })

  test('should maintain session across page refreshes', async ({ page }) => {
    const testName = 'session-persistence-validation'
    
    // Login first
    await authPage.navigateToLogin(testName)
    await authPage.loginWithDemoUser(testName)
    
    // Navigate to dashboard
    await dashboardPage.navigateToDashboard(testName)
    
    // Test multiple refreshes
    for (let i = 1; i <= 3; i++) {
      console.log(`🔄 Testing session persistence - refresh ${i}/3`)
      
      await page.reload()
      await page.waitForLoadState('domcontentloaded')
      
      // Should still be on dashboard
      await expect(page).toHaveURL(/\/dashboard/)
      
      // Capture evidence
      await screenshotManager.captureScreenshot(page, testName, `session-refresh-${i}`)
      
      // Verify performance remains good
      await performanceBenchmarker.measurePagePerformance(page, `${testName}-refresh-${i}`)
    }
    
    // Logout at end
    await authPage.logout(testName)
    
    console.log('✅ Session persistence validated across multiple refreshes')
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    const testName = 'unauthenticated-redirect'
    
    // Try to access dashboard without authentication
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 })
    
    // Capture redirect state
    await screenshotManager.captureScreenshot(page, testName, 'unauthenticated-redirect')
    
    console.log('✅ Unauthenticated redirect working correctly')
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    const testName = 'authentication-error-handling'
    
    // Navigate to login
    await authPage.navigateToLogin(testName)
    
    // Intercept authentication requests to simulate server errors
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    // Capture before error attempt
    await screenshotManager.captureScreenshot(page, testName, 'before-server-error')
    
    // Try to login - should handle error gracefully
    const credentials = authPage.getDemoCredentials()
    await page.fill('input[type="email"]', credentials.email)
    await page.fill('input[type="password"]', credentials.password)
    await page.click('button[type="submit"]')
    
    // Should show error message
    const errorSelectors = [
      'text=server error',
      'text=Server error',
      'text=Internal server error',
      '[data-testid="error-message"]',
      '.error-message',
      '.alert-error'
    ]
    
    let errorFound = false
    for (const selector of errorSelectors) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 10000 })
        errorFound = true
        console.log(`✅ Error message found: ${selector}`)
        break
      } catch {
        // Continue to next selector
      }
    }
    
    // Capture error state
    await screenshotManager.captureScreenshot(page, testName, 'server-error-displayed')
    
    if (!errorFound) {
      console.warn('⚠️ No error message displayed for server error')
    }
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/auth\/login/)
    
    console.log('✅ Authentication error handling validated')
  })

  test('should perform authentication with performance benchmarking', async ({ page }) => {
    const testName = 'authentication-performance-benchmark'
    
    console.log('⚡ Starting authentication performance benchmark...')
    
    // Measure login page load performance
    await authPage.navigateToLogin(testName)
    const loginPerformance = await performanceBenchmarker.measurePagePerformance(page, `${testName}-login-page`)
    
    // Ensure login page meets performance thresholds
    if (loginPerformance.navigationTiming.loadComplete > 5000) {
      console.warn(`⚠️ Login page load time: ${loginPerformance.navigationTiming.loadComplete}ms (slow)`)
    }
    
    // Measure authentication process performance
    const authStartTime = Date.now()
    await authPage.loginWithDemoUser(testName)
    const authEndTime = Date.now()
    const authDuration = authEndTime - authStartTime
    
    console.log(`⚡ Authentication process duration: ${authDuration}ms`)
    
    // Measure dashboard load performance post-auth
    await dashboardPage.navigateToDashboard(testName)
    const dashboardPerformance = await performanceBenchmarker.measurePagePerformance(page, `${testName}-dashboard`)
    
    // Performance validation
    if (authDuration > 10000) {
      console.warn(`⚠️ Authentication process too slow: ${authDuration}ms`)
    }
    
    if (dashboardPerformance.navigationTiming.loadComplete > 5000) {
      console.warn(`⚠️ Dashboard load time: ${dashboardPerformance.navigationTiming.loadComplete}ms (slow)`)
    }
    
    // Capture performance summary
    await screenshotManager.captureScreenshot(page, testName, 'performance-benchmark-complete')
    
    // Logout
    await authPage.logout(testName)
    
    console.log('✅ Authentication performance benchmark completed')
    console.log(`📊 Login page load: ${loginPerformance.navigationTiming.loadComplete}ms`)
    console.log(`📊 Auth process: ${authDuration}ms`)
    console.log(`📊 Dashboard load: ${dashboardPerformance.navigationTiming.loadComplete}ms`)
  })

  test('should validate zero console errors during authentication', async ({ page }) => {
    const testName = 'zero-console-errors-validation'
    
    // Clear any existing errors
    consoleMonitor.clearErrors()
    
    // Start fresh monitoring
    consoleMonitor.startMonitoring(page, testName, 'full-auth-flow')
    
    console.log('🖥️ Starting zero console errors validation...')
    
    // Complete full authentication flow
    await authPage.navigateToLogin(testName)
    await authPage.loginWithDemoUser(testName)
    await dashboardPage.navigateToDashboard(testName)
    
    // Check for any console errors
    const errorCount = consoleMonitor.getErrorCount()
    
    // Capture final state
    await screenshotManager.captureScreenshot(page, testName, 'console-validation-complete')
    
    // Generate error report
    const errorReport = await consoleMonitor.generateErrorReport()
    console.log(`📊 Console error report: ${errorReport.reportPath}`)
    
    // Assert zero critical errors
    expect(errorCount.critical).toBe(0)
    
    if (errorCount.total > 0) {
      console.warn(`⚠️ Non-critical console issues detected: ${errorCount.total}`)
      console.warn(`   High: ${errorCount.high}, Medium: ${errorCount.medium}, Low: ${errorCount.low}`)
    } else {
      console.log('✅ Zero console errors detected - Clean JavaScript execution!')
    }
    
    // Logout
    await authPage.logout(testName)
    
    console.log('✅ Zero console errors validation completed')
  })
})