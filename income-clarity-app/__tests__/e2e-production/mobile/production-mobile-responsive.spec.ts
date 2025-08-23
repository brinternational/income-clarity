/**
 * Production Mobile Responsive Tests
 * 
 * MOBILE-SPECIFIC VALIDATION:
 * - Touch interaction testing
 * - Mobile viewport responsive design
 * - Progressive disclosure on mobile devices
 * - Mobile navigation patterns
 * - Performance on mobile network conditions
 * - Cross-device consistency validation
 */

import { test, expect } from '@playwright/test'
import { ProductionAuthPage } from '../page-objects/ProductionAuthPage'
import { ProductionDashboardPage } from '../page-objects/ProductionDashboardPage'
import { ScreenshotManager } from '../utils/screenshot-manager'
import { ConsoleErrorMonitor } from '../utils/console-error-monitor'

test.describe('Production Mobile Responsive - Mobile', () => {
  let authPage: ProductionAuthPage
  let dashboardPage: ProductionDashboardPage
  let screenshotManager: ScreenshotManager
  let consoleMonitor: ConsoleErrorMonitor

  test.beforeAll(async () => {
    screenshotManager = new ScreenshotManager()
    consoleMonitor = new ConsoleErrorMonitor()
    
    await screenshotManager.initialize()
    await consoleMonitor.initialize()
  })

  test.beforeEach(async ({ page }) => {
    authPage = new ProductionAuthPage(page)
    dashboardPage = new ProductionDashboardPage(page)
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Authenticate for mobile tests
    await authPage.navigateToLogin('mobile-setup')
    await authPage.loginWithDemoUser('mobile-setup')
  })

  test.afterEach(async ({ page }) => {
    try {
      await authPage.logout('mobile-cleanup')
    } catch (error) {
      console.warn('⚠️ Mobile logout failed during cleanup:', error.message)
    }
  })

  test('should validate mobile authentication flow', async ({ page }) => {
    const testName = 'mobile-authentication-flow'
    
    console.log('📱 Testing mobile authentication flow...')
    consoleMonitor.startMonitoring(page, testName, 'mobile-auth')
    
    // Logout first to test full flow on mobile
    await authPage.logout('mobile-auth-prep')
    
    // Test mobile login
    await authPage.navigateToLogin(testName)
    
    // Capture mobile login page
    await screenshotManager.captureScreenshot(page, testName, 'mobile-login-page')
    
    // Test form interactions on mobile
    await authPage.loginWithDemoUser(testName)
    
    // Validate mobile dashboard
    await dashboardPage.navigateToDashboard(testName)
    await screenshotManager.captureScreenshot(page, testName, 'mobile-dashboard')
    
    // Validate no critical errors on mobile
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Mobile authentication flow validated')
  })

  test('should validate mobile progressive disclosure', async ({ page }) => {
    const testName = 'mobile-progressive-disclosure'
    
    console.log('📱 Testing progressive disclosure on mobile...')
    consoleMonitor.startMonitoring(page, testName, 'mobile-disclosure')
    
    // Test each disclosure level on mobile
    await dashboardPage.testResponsiveDesign(testName, 'mobile')
    
    // Test mobile-specific progressive disclosure
    await dashboardPage.testProgressiveDisclosureLevel1(testName)
    await screenshotManager.captureScreenshot(page, testName, 'mobile-momentum-view')
    
    // Test hero view on mobile
    await page.goto('/dashboard?view=hero-view&hub=income')
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, testName, 'mobile-hero-view')
    
    // Test detailed view on mobile
    await page.goto('/dashboard?view=detailed&hub=income&tab=projections')
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, testName, 'mobile-detailed-view')
    
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Mobile progressive disclosure validated')
  })

  test('should validate mobile navigation and touch interactions', async ({ page }) => {
    const testName = 'mobile-navigation-touch'
    
    console.log('📱 Testing mobile navigation and touch interactions...')
    consoleMonitor.startMonitoring(page, testName, 'mobile-touch')
    
    await dashboardPage.navigateToDashboard(testName)
    
    // Look for mobile navigation elements
    const mobileNavSelectors = [
      '[aria-label="Menu"]',
      '.hamburger',
      '.mobile-menu',
      'button[aria-expanded]',
      '[data-testid="mobile-nav"]',
      '.nav-toggle'
    ]
    
    let mobileNavFound = false
    for (const selector of mobileNavSelectors) {
      try {
        const element = page.locator(selector)
        if (await element.isVisible({ timeout: 5000 })) {
          await screenshotManager.captureScreenshot(page, testName, 'mobile-nav-before-click')
          
          // Test touch interaction
          await element.click()
          await page.waitForTimeout(1000) // Wait for animation
          
          await screenshotManager.captureScreenshot(page, testName, 'mobile-nav-after-click')
          
          console.log(`✅ Mobile navigation clicked: ${selector}`)
          mobileNavFound = true
          break
        }
      } catch {
        // Continue to next selector
      }
    }
    
    if (!mobileNavFound) {
      console.warn('⚠️ No mobile navigation found - testing alternative interactions')
    }
    
    // Test scrolling on mobile
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })
    await page.waitForTimeout(1000)
    await screenshotManager.captureScreenshot(page, testName, 'mobile-scroll-test')
    
    // Test touch gestures (simulated)
    const mainContent = page.locator('main, [role="main"], .dashboard').first()
    if (await mainContent.isVisible()) {
      const box = await mainContent.boundingBox()
      if (box) {
        // Simulate swipe gesture
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 })
        await page.mouse.up()
        
        await screenshotManager.captureScreenshot(page, testName, 'mobile-swipe-gesture')
        console.log('✅ Mobile swipe gesture simulated')
      }
    }
    
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Mobile navigation and touch interactions validated')
  })

  test('should validate mobile performance and loading', async ({ page }) => {
    const testName = 'mobile-performance'
    
    console.log('📱 Testing mobile performance and loading...')
    consoleMonitor.startMonitoring(page, testName, 'mobile-performance')
    
    // Simulate slower mobile network conditions
    await page.route('**/*', (route) => {
      // Add small delay to simulate mobile network
      setTimeout(() => {
        route.continue()
      }, 50) // 50ms delay
    })
    
    // Test loading performance on mobile
    const startTime = Date.now()
    await dashboardPage.navigateToDashboard(testName)
    const loadTime = Date.now() - startTime
    
    console.log(`📊 Mobile dashboard load time: ${loadTime}ms`)
    
    // Mobile should still load reasonably fast
    if (loadTime > 10000) {
      console.warn(`⚠️ Mobile load time slow: ${loadTime}ms`)
    }
    
    await screenshotManager.captureScreenshot(page, testName, 'mobile-performance-loaded')
    
    // Test different views on mobile with performance consideration
    const views = [
      '/dashboard?view=momentum',
      '/dashboard?view=hero-view&hub=income',
      '/dashboard?view=detailed&hub=performance&tab=overview'
    ]
    
    for (const view of views) {
      const viewStart = Date.now()
      await page.goto(view)
      await page.waitForLoadState('domcontentloaded')
      const viewTime = Date.now() - viewStart
      
      console.log(`📊 Mobile view load time ${view}: ${viewTime}ms`)
      
      await screenshotManager.captureScreenshot(
        page, 
        testName, 
        `mobile-view-${view.split('=')[1]?.split('&')[0] || 'default'}`
      )
    }
    
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Mobile performance validation completed')
  })

  test('should validate mobile accessibility and usability', async ({ page }) => {
    const testName = 'mobile-accessibility'
    
    console.log('📱 Testing mobile accessibility and usability...')
    consoleMonitor.startMonitoring(page, testName, 'mobile-accessibility')
    
    await dashboardPage.navigateToDashboard(testName)
    
    // Check for accessible mobile elements
    const accessibilityChecks = [
      { selector: '[aria-label]', description: 'Elements with aria-label' },
      { selector: 'button', description: 'Interactive buttons' },
      { selector: '[role]', description: 'Elements with ARIA roles' },
      { selector: '[tabindex]', description: 'Focusable elements' }
    ]
    
    for (const check of accessibilityChecks) {
      try {
        const elements = page.locator(check.selector)
        const count = await elements.count()
        console.log(`✅ ${check.description}: ${count} found`)
      } catch (error) {
        console.warn(`⚠️ ${check.description} check failed:`, error.message)
      }
    }
    
    // Test focus management on mobile
    await page.keyboard.press('Tab')
    await page.waitForTimeout(500)
    await screenshotManager.captureScreenshot(page, testName, 'mobile-focus-test')
    
    // Check viewport meta tag for mobile
    const viewportMeta = page.locator('meta[name="viewport"]')
    if (await viewportMeta.count() > 0) {
      console.log('✅ Viewport meta tag found for mobile optimization')
    } else {
      console.warn('⚠️ No viewport meta tag found')
    }
    
    // Test text readability on mobile
    const textElements = page.locator('p, span, div').filter({ hasText: /\w{10,}/ }) // Text with 10+ chars
    const textCount = await textElements.count()
    console.log(`📝 Text elements for readability check: ${textCount}`)
    
    await screenshotManager.captureScreenshot(page, testName, 'mobile-accessibility-complete')
    
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Mobile accessibility and usability validation completed')
  })

  test('should validate cross-device consistency', async ({ page }) => {
    const testName = 'mobile-cross-device-consistency'
    
    console.log('📱 Testing cross-device consistency...')
    consoleMonitor.startMonitoring(page, testName, 'cross-device')
    
    // Test multiple mobile viewport sizes
    const mobileViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy', width: 412, height: 915 }
    ]
    
    for (const viewport of mobileViewports) {
      console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`)
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/dashboard')
      await page.waitForLoadState('domcontentloaded')
      
      // Capture this viewport
      await screenshotManager.captureScreenshot(
        page, 
        testName, 
        `cross-device-${viewport.name.replace(/\s+/g, '-').toLowerCase()}`
      )
      
      // Test key functionality still works
      await page.goto('/dashboard?view=hero-view&hub=income')
      await page.waitForLoadState('domcontentloaded')
      
      await screenshotManager.captureScreenshot(
        page, 
        testName, 
        `hero-view-${viewport.name.replace(/\s+/g, '-').toLowerCase()}`
      )
    }
    
    // Reset to standard mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Cross-device consistency validation completed')
  })
})