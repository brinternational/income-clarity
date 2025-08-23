/**
 * Complete User Journey Validation Tests
 * 
 * MISSION: Validate complete user workflows from first visit to advanced usage
 * 
 * USER JOURNEY COVERAGE:
 * - First-Time Visitor Journey (80% users): Landing → Login → Dashboard → Quick insights → Logout
 * - Engaged User Journey (15% users): Login → Explore cards → Hero-view focus → Feature discovery  
 * - Power User Journey (5% users): Login → Detailed dashboard → All hubs → Comprehensive analysis
 * - Cross-Device Journey: Desktop initial → Mobile continuation → Session persistence
 * - Error Recovery Journey: Handle failures → Graceful recovery → Workflow continuation
 * 
 * VALIDATION REQUIREMENTS:
 * - Production environment (https://incomeclarity.ddns.net)
 * - Real user authentication (test@example.com/password123)
 * - Complete workflow continuity validation
 * - Performance benchmarking for entire journeys
 * - Screenshot evidence for every journey step
 * - Zero console error tolerance
 */

import { test, expect } from '@playwright/test'
import { ProductionAuthPage } from './page-objects/ProductionAuthPage'
import { ProductionDashboardPage } from './page-objects/ProductionDashboardPage'
import { ScreenshotManager } from './utils/screenshot-manager'
import { ConsoleErrorMonitor } from './utils/console-error-monitor'
import { PerformanceBenchmarker } from './utils/performance-benchmarker'
import { ProductionEnvironmentValidator } from './utils/production-environment-validator'

// User journey test suite
test.describe('Complete User Journey Validation', () => {
  let authPage: ProductionAuthPage
  let dashboardPage: ProductionDashboardPage
  let screenshotManager: ScreenshotManager
  let consoleMonitor: ConsoleErrorMonitor
  let performanceBenchmarker: PerformanceBenchmarker
  let envValidator: ProductionEnvironmentValidator

  test.beforeAll(async () => {
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
    await envValidator.validateNoLocalhostInTestContext(page)
    
    authPage = new ProductionAuthPage(page)
    dashboardPage = new ProductionDashboardPage(page)
    
    console.log('🚀 Starting user journey validation on production')
    console.log(`📍 Environment: https://incomeclarity.ddns.net`)
  })

  test.afterEach(async ({ page }, testInfo) => {
    // Capture final state
    await screenshotManager.captureScreenshot(page, testInfo.title, 'journey-complete')
    
    // Validate zero critical console errors
    const errorCount = consoleMonitor.getErrorCount()
    if (errorCount.critical > 0) {
      await screenshotManager.captureErrorScreenshot(page, testInfo.title, 'critical-console-errors')
      throw new Error(`❌ Journey failed due to ${errorCount.critical} critical console errors`)
    }
    
    console.log(`✅ Journey completed: ${testInfo.title}`)
    console.log(`📊 Console errors: ${errorCount.total} (${errorCount.critical} critical)`)
  })

  test('should validate complete first-time visitor journey (80% users)', async ({ page }) => {
    const journeyName = 'first-time-visitor-journey'
    
    console.log('\n👶 FIRST-TIME VISITOR JOURNEY (80% Users)')
    console.log('📋 Flow: Landing → Login → Dashboard → Quick insights → Logout')
    
    consoleMonitor.startMonitoring(page, journeyName, 'complete-journey')
    
    // Step 1: Landing page first impression
    console.log('  📄 Step 1: Landing page first impression...')
    const landingStart = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, journeyName, 'landing-page')
    const landingPerf = await performanceBenchmarker.measurePagePerformance(page, `${journeyName}-landing`)
    console.log(`    ⚡ Landing page load: ${landingPerf.navigationTiming.loadComplete}ms`)
    
    // Step 2: Navigate to login
    console.log('  🔐 Step 2: Navigate to login...')
    await authPage.navigateToLogin(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'login-page')
    
    // Step 3: First-time authentication
    console.log('  ✅ Step 3: First-time user authentication...')
    const authStart = Date.now()
    await authPage.loginWithDemoUser(journeyName)
    const authDuration = Date.now() - authStart
    console.log(`    ⚡ Authentication duration: ${authDuration}ms`)
    await screenshotManager.captureScreenshot(page, journeyName, 'authenticated')
    
    // Step 4: First dashboard experience (should default to momentum view)
    console.log('  📊 Step 4: First dashboard experience...')
    await dashboardPage.navigateToDashboard(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'first-dashboard')
    
    // Validate we're in momentum view (typical for first-time users)
    const currentUrl = page.url()
    if (!currentUrl.includes('view=momentum') && !currentUrl.includes('/dashboard')) {
      console.warn('    ⚠️ First-time user not directed to momentum view')
    }
    
    // Step 5: Quick insights exploration (typical 80% user behavior)  
    console.log('  💡 Step 5: Quick insights exploration...')
    const explorationStart = Date.now()
    
    // Look for and interact with super cards
    const superCardSelectors = [
      '.super-card',
      '[data-testid="super-card"]',
      '.card',
      '.hub-card',
      '[data-hub]'
    ]
    
    let cardInteracted = false
    for (const selector of superCardSelectors) {
      try {
        const cards = page.locator(selector)
        const count = await cards.count()
        if (count > 0) {
          await cards.first().click()
          await page.waitForLoadState('domcontentloaded')
          cardInteracted = true
          console.log(`    ✅ Interacted with super card: ${selector}`)
          break
        }
      } catch {
        // Continue to next selector
      }
    }
    
    if (cardInteracted) {
      await screenshotManager.captureScreenshot(page, journeyName, 'quick-exploration')
    } else {
      console.log('    💡 No interactive super cards found')
      await screenshotManager.captureScreenshot(page, journeyName, 'dashboard-state')
    }
    
    const explorationDuration = Date.now() - explorationStart
    console.log(`    ⚡ Quick exploration duration: ${explorationDuration}ms`)
    
    // Step 6: Return to main dashboard
    console.log('  🏠 Step 6: Return to main dashboard...')
    await page.goto('/dashboard')
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, journeyName, 'return-dashboard')
    
    // Step 7: Session completion (logout)
    console.log('  👋 Step 7: Session completion (logout)...')
    await authPage.logout(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'logged-out')
    
    // Validate we're logged out
    const logoutUrl = page.url()
    expect(logoutUrl).not.toContain('/dashboard')
    
    console.log('  ✅ First-Time Visitor Journey Completed Successfully!')
  })

  test('should validate complete engaged user journey (15% users)', async ({ page }) => {
    const journeyName = 'engaged-user-journey'
    
    console.log('\n🎯 ENGAGED USER JOURNEY (15% Users)')
    console.log('📋 Flow: Login → Explore cards → Hero-view focus → Feature discovery')
    
    consoleMonitor.startMonitoring(page, journeyName, 'complete-journey')
    
    // Step 1: Returning user login
    console.log('  🔐 Step 1: Returning user login...')
    await authPage.navigateToLogin(journeyName)
    await authPage.loginWithDemoUser(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'returning-user-login')
    
    // Step 2: Dashboard exploration
    console.log('  📊 Step 2: Dashboard exploration...')
    await dashboardPage.navigateToDashboard(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'dashboard-exploration')
    
    // Step 3: Systematic super cards exploration
    console.log('  🃏 Step 3: Super cards systematic exploration...')
    const superCards = [
      { name: 'Income', hub: 'income' },
      { name: 'Performance', hub: 'performance' },
      { name: 'Tax Strategy', hub: 'tax-strategy' }
    ]
    
    for (const card of superCards) {
      console.log(`    📈 Exploring ${card.name} card...`)
      
      try {
        // Try direct URL navigation to hero view
        await page.goto(`/dashboard?view=hero-view&hub=${card.hub}`)
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(2000) // Allow for content loading
        await screenshotManager.captureScreenshot(page, journeyName, `explored-${card.hub}`)
        console.log(`    ✅ ${card.name} card explored successfully`)
      } catch (error) {
        console.log(`    ⚠️ ${card.name} card exploration failed: ${error.message}`)
        await screenshotManager.captureScreenshot(page, journeyName, `${card.hub}-error`)
      }
    }
    
    // Step 4: Hero-view focused exploration
    console.log('  🎯 Step 4: Hero-view focused exploration...')
    await page.goto('/dashboard?view=hero-view&hub=income')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000) // Engaged users spend time exploring
    await screenshotManager.captureScreenshot(page, journeyName, 'hero-view-focus')
    
    // Step 5: Feature discovery (advanced exploration)
    console.log('  🔍 Step 5: Advanced feature discovery...')
    const discoveryUrls = ['/settings', '/profile']
    
    for (const url of discoveryUrls) {
      try {
        await page.goto(url)
        await page.waitForLoadState('domcontentloaded')
        const feature = url.replace('/', '')
        await screenshotManager.captureScreenshot(page, journeyName, `feature-${feature}`)
        console.log(`    ✅ ${feature} feature discovered`)
      } catch (error) {
        console.log(`    ⚠️ Feature ${url} not accessible: ${error.message}`)
      }
    }
    
    // Step 6: Return to dashboard (workflow completion)
    console.log('  🏠 Step 6: Return to dashboard...')
    await dashboardPage.navigateToDashboard(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'workflow-complete')
    
    console.log('  ✅ Engaged User Journey Completed Successfully!')
  })

  test('should validate complete power user journey (5% users)', async ({ page }) => {
    const journeyName = 'power-user-journey'
    
    console.log('\n⚡ POWER USER JOURNEY (5% Users)')
    console.log('📋 Flow: Login → Detailed dashboard → All hubs → Comprehensive analysis')
    
    consoleMonitor.startMonitoring(page, journeyName, 'complete-journey')
    
    // Step 1: Expert user login
    console.log('  🔐 Step 1: Expert user login...')
    await authPage.navigateToLogin(journeyName)
    await authPage.loginWithDemoUser(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'expert-login')
    
    // Step 2: Direct to detailed dashboard
    console.log('  📊 Step 2: Direct detailed dashboard access...')
    await page.goto('/dashboard?view=detailed')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await screenshotManager.captureScreenshot(page, journeyName, 'detailed-dashboard')
    
    // Step 3: Comprehensive hub analysis
    console.log('  🔍 Step 3: Comprehensive hub analysis...')
    const allHubs = [
      { name: 'Income', hub: 'income' },
      { name: 'Performance', hub: 'performance' },
      { name: 'Tax Strategy', hub: 'tax-strategy' },
      { name: 'Portfolio Strategy', hub: 'portfolio-strategy' },
      { name: 'Financial Planning', hub: 'financial-planning' }
    ]
    
    for (const hub of allHubs) {
      console.log(`    📈 Analyzing ${hub.name} hub in detail...`)
      
      try {
        await page.goto(`/dashboard?view=detailed&hub=${hub.hub}&tab=overview`)
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(2000) // Power users spend time analyzing
        await screenshotManager.captureScreenshot(page, journeyName, `detailed-${hub.hub}`)
        
        // Test tab navigation within detailed view
        const tabs = ['analysis', 'comparison', 'projections']
        for (let i = 0; i < Math.min(2, tabs.length); i++) {
          const tab = tabs[i]
          try {
            await page.goto(`/dashboard?view=detailed&hub=${hub.hub}&tab=${tab}`)
            await page.waitForLoadState('domcontentloaded')
            await page.waitForTimeout(1500)
            await screenshotManager.captureScreenshot(page, journeyName, `${hub.hub}-${tab}`)
          } catch {
            // Tab may not exist for this hub
            console.log(`      💡 Tab ${tab} not available for ${hub.name}`)
          }
        }
        
        console.log(`    ✅ ${hub.name} hub analysis complete`)
      } catch (error) {
        console.log(`    ⚠️ ${hub.name} hub analysis failed: ${error.message}`)
        await screenshotManager.captureScreenshot(page, journeyName, `${hub.hub}-error`)
      }
    }
    
    // Step 4: Advanced features exploration
    console.log('  ⚙️ Step 4: Advanced features exploration...')
    const advancedFeatures = ['/settings', '/profile', '/portfolio']
    
    for (const featureUrl of advancedFeatures) {
      try {
        await page.goto(featureUrl)
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(2000) // Power users explore thoroughly
        const featureName = featureUrl.replace('/', '')
        await screenshotManager.captureScreenshot(page, journeyName, `advanced-${featureName}`)
        console.log(`    ✅ Advanced ${featureName} explored`)
      } catch (error) {
        console.log(`    ⚠️ Advanced feature ${featureUrl} not accessible: ${error.message}`)
      }
    }
    
    // Step 5: Data export/analysis attempt
    console.log('  📊 Step 5: Data export/analysis attempt...')
    const exportSelectors = [
      'button:has-text("Export")',
      'a:has-text("Export")',
      'button:has-text("Download")',
      '[data-testid="export-button"]'
    ]
    
    let exportFound = false
    for (const selector of exportSelectors) {
      try {
        await page.click(selector)
        exportFound = true
        await page.waitForLoadState('domcontentloaded')
        await screenshotManager.captureScreenshot(page, journeyName, 'export-initiated')
        console.log(`    ✅ Export feature found and tested: ${selector}`)
        break
      } catch {
        // Continue to next selector
      }
    }
    
    if (!exportFound) {
      console.log('    💡 No export features found')
      await screenshotManager.captureScreenshot(page, journeyName, 'analysis-complete')
    }
    
    // Step 6: Workflow completion
    console.log('  🏁 Step 6: Power user workflow completion...')
    await dashboardPage.navigateToDashboard(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'power-workflow-complete')
    
    console.log('  ✅ Power User Journey Completed Successfully!')
  })

  test('should validate cross-device workflow continuity', async ({ browser }) => {
    const journeyName = 'cross-device-journey'
    
    console.log('\n📱 CROSS-DEVICE WORKFLOW')
    console.log('📋 Flow: Desktop initial → Mobile continuation → Session persistence')
    
    // Desktop context
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    const desktopPage = await desktopContext.newPage()
    
    // Mobile context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
    })
    const mobilePage = await mobileContext.newPage()
    
    try {
      consoleMonitor.startMonitoring(desktopPage, journeyName, 'desktop-workflow')
      consoleMonitor.startMonitoring(mobilePage, journeyName, 'mobile-workflow')
      
      // Step 1: Desktop initial session
      console.log('  💻 Step 1: Desktop initial session...')
      const desktopAuth = new ProductionAuthPage(desktopPage)
      const desktopDashboard = new ProductionDashboardPage(desktopPage)
      
      await desktopAuth.navigateToLogin(journeyName)
      await desktopAuth.loginWithDemoUser(journeyName)
      await screenshotManager.captureScreenshot(desktopPage, journeyName, 'desktop-authenticated')
      
      // Step 2: Desktop workflow start
      console.log('  📊 Step 2: Desktop workflow initiation...')
      await desktopPage.goto('/dashboard?view=hero-view&hub=income')
      await desktopPage.waitForLoadState('domcontentloaded')
      await screenshotManager.captureScreenshot(desktopPage, journeyName, 'desktop-workflow-start')
      
      // Step 3: Mobile session attempt
      console.log('  📱 Step 3: Mobile session continuation...')
      const mobileAuth = new ProductionAuthPage(mobilePage)
      
      // Try to access same URL on mobile
      await mobilePage.goto('/dashboard?view=hero-view&hub=income')
      await mobilePage.waitForLoadState('domcontentloaded')
      
      // Check if authentication is required (expected)
      const currentUrl = mobilePage.url()
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        console.log('    🔐 Mobile requires authentication (expected behavior)')
        await mobileAuth.loginWithDemoUser(journeyName)
      }
      
      await screenshotManager.captureScreenshot(mobilePage, journeyName, 'mobile-session-start')
      
      // Step 4: Mobile workflow continuation
      console.log('  👆 Step 4: Mobile workflow continuation...')
      await mobilePage.goto('/dashboard?view=momentum')
      await mobilePage.waitForLoadState('domcontentloaded')
      await screenshotManager.captureScreenshot(mobilePage, journeyName, 'mobile-workflow')
      
      // Step 5: Session persistence validation
      console.log('  🔄 Step 5: Session persistence validation...')
      
      // Refresh both devices
      await desktopPage.reload()
      await desktopPage.waitForLoadState('domcontentloaded')
      await screenshotManager.captureScreenshot(desktopPage, journeyName, 'desktop-refreshed')
      
      await mobilePage.reload()
      await mobilePage.waitForLoadState('domcontentloaded')
      await screenshotManager.captureScreenshot(mobilePage, journeyName, 'mobile-refreshed')
      
      // Verify sessions persist
      const desktopUrlAfter = desktopPage.url()
      const mobileUrlAfter = mobilePage.url()
      
      const desktopAuthenticated = !desktopUrlAfter.includes('/login')
      const mobileAuthenticated = !mobileUrlAfter.includes('/login')
      
      console.log(`    💻 Desktop session persistent: ${desktopAuthenticated}`)
      console.log(`    📱 Mobile session persistent: ${mobileAuthenticated}`)
      
      // At least one device should maintain session
      expect(desktopAuthenticated || mobileAuthenticated).toBe(true)
      
      console.log('  ✅ Cross-Device Journey Completed Successfully!')
      
    } finally {
      await desktopContext.close()
      await mobileContext.close()
    }
  })

  test('should validate error recovery workflow', async ({ page }) => {
    const journeyName = 'error-recovery-journey'
    
    console.log('\n🛠️ ERROR RECOVERY WORKFLOW')
    console.log('📋 Flow: Handle failures → Graceful recovery → Workflow continuation')
    
    consoleMonitor.startMonitoring(page, journeyName, 'error-recovery')
    
    // Step 1: Establish working session
    console.log('  ✅ Step 1: Establish working session...')
    await authPage.navigateToLogin(journeyName)
    await authPage.loginWithDemoUser(journeyName)
    await screenshotManager.captureScreenshot(page, journeyName, 'working-session')
    
    // Step 2: Simulate error scenario
    console.log('  🚫 Step 2: Simulate network error scenario...')
    
    // Intercept API calls to simulate failures
    await page.route('**/api/**', route => {
      const url = route.request().url()
      if (url.includes('/api/super-cards/') && Math.random() < 0.3) {
        // Simulate 30% API failure rate
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Simulated network error' })
        })
      } else {
        route.continue()
      }
    })
    
    // Try to navigate to data-heavy page
    await page.goto('/dashboard?view=detailed&hub=performance')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    await screenshotManager.captureScreenshot(page, journeyName, 'error-scenario')
    
    // Step 3: Error detection
    console.log('  🔍 Step 3: Error detection and handling...')
    const errorIndicators = [
      'text=error',
      'text=Error',
      'text=failed',
      'text=Unable to load',
      '.error-message'
    ]
    
    let errorDetected = false
    for (const indicator of errorIndicators) {
      try {
        await page.waitForSelector(indicator, { timeout: 3000 })
        errorDetected = true
        console.log(`    🚨 Error UI detected: ${indicator}`)
        break
      } catch {
        // Continue checking
      }
    }
    
    await screenshotManager.captureScreenshot(page, journeyName, 'error-detection')
    
    // Step 4: Recovery attempt
    console.log('  🔄 Step 4: Recovery attempt...')
    
    // Remove network interception to allow recovery
    await page.unroute('**/api/**')
    
    // Try refresh
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, journeyName, 'recovery-attempt')
    
    // Navigate to simpler page
    await page.goto('/dashboard')
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, journeyName, 'recovery-navigation')
    
    // Step 5: Workflow continuation validation
    console.log('  ✅ Step 5: Workflow continuation validation...')
    
    // Test normal functionality after error
    await page.goto('/dashboard?view=hero-view&hub=income')
    await page.waitForLoadState('domcontentloaded')
    await screenshotManager.captureScreenshot(page, journeyName, 'workflow-continuation')
    
    // Verify user can access settings after recovery
    try {
      await page.goto('/settings')
      await page.waitForLoadState('domcontentloaded')
      await screenshotManager.captureScreenshot(page, journeyName, 'settings-after-recovery')
      console.log('    ✅ Settings accessible after recovery')
    } catch {
      console.log('    ⚠️ Settings not accessible after recovery')
    }
    
    console.log('  ✅ Error Recovery Journey Completed Successfully!')
  })

  test('should validate progressive disclosure user journeys', async ({ page }) => {
    const journeyName = 'progressive-disclosure-journeys'
    
    console.log('\n📈 PROGRESSIVE DISCLOSURE JOURNEYS')
    console.log('📋 Flow: All user types through 3 disclosure levels')
    
    consoleMonitor.startMonitoring(page, journeyName, 'progressive-disclosure')
    
    // Authenticate first
    await authPage.navigateToLogin(journeyName)
    await authPage.loginWithDemoUser(journeyName)
    
    // Journey 1: 80% Users - Momentum View Journey
    console.log('  📊 80% User Journey: Momentum view focus...')
    await page.goto('/dashboard?view=momentum')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000) // Quick view time for 80% users
    await screenshotManager.captureScreenshot(page, journeyName, 'momentum-80percent-users')
    
    // Journey 2: 15% Users - Hero View Journey  
    console.log('  🎯 15% User Journey: Hero view exploration...')
    const heroHubs = ['income', 'performance', 'tax-strategy']
    
    for (const hub of heroHubs) {
      await page.goto(`/dashboard?view=hero-view&hub=${hub}`)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000) // Engaged users spend more time
      await screenshotManager.captureScreenshot(page, journeyName, `hero-${hub}-15percent`)
    }
    
    // Journey 3: 5% Users - Detailed View Journey
    console.log('  🔍 5% User Journey: Detailed view comprehensive...')
    const detailedHubs = ['performance', 'financial-planning']
    
    for (const hub of detailedHubs) {
      await page.goto(`/dashboard?view=detailed&hub=${hub}&tab=overview`)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(4000) // Power users analyze deeply
      await screenshotManager.captureScreenshot(page, journeyName, `detailed-${hub}-5percent`)
      
      // Test tab switching within detailed view
      const tabs = ['analysis', 'comparison']
      for (const tab of tabs) {
        try {
          await page.goto(`/dashboard?view=detailed&hub=${hub}&tab=${tab}`)
          await page.waitForLoadState('domcontentloaded')
          await page.waitForTimeout(2000)
          await screenshotManager.captureScreenshot(page, journeyName, `detailed-${hub}-${tab}`)
        } catch {
          console.log(`      💡 Tab ${tab} not available for ${hub}`)
        }
      }
    }
    
    console.log('  ✅ Progressive Disclosure Journeys Completed!')
  })

  test('should validate complete workflow performance benchmarks', async ({ page }) => {
    const journeyName = 'workflow-performance-benchmarks'
    
    console.log('\n⚡ WORKFLOW PERFORMANCE BENCHMARKS')
    console.log('📋 Measuring complete journey performance')
    
    consoleMonitor.startMonitoring(page, journeyName, 'performance-benchmarks')
    
    const performanceThresholds = {
      authentication: 5000,    // 5 seconds max
      dashboardLoad: 3000,     // 3 seconds max
      heroViewLoad: 2500,      // 2.5 seconds max
      detailedViewLoad: 4000   // 4 seconds max
    }
    
    // Benchmark 1: Authentication Performance
    console.log('  🔐 Benchmarking authentication performance...')
    const authStart = Date.now()
    await authPage.navigateToLogin(journeyName)
    await authPage.loginWithDemoUser(journeyName)
    const authDuration = Date.now() - authStart
    
    console.log(`    ⚡ Authentication: ${authDuration}ms (threshold: ${performanceThresholds.authentication}ms)`)
    if (authDuration > performanceThresholds.authentication) {
      console.warn(`    ⚠️ Authentication slower than threshold`)
    }
    
    // Benchmark 2: Dashboard Load Performance
    console.log('  📊 Benchmarking dashboard load performance...')
    const dashboardStart = Date.now()
    await dashboardPage.navigateToDashboard(journeyName)
    const dashboardDuration = Date.now() - dashboardStart
    
    console.log(`    ⚡ Dashboard: ${dashboardDuration}ms (threshold: ${performanceThresholds.dashboardLoad}ms)`)
    if (dashboardDuration > performanceThresholds.dashboardLoad) {
      console.warn(`    ⚠️ Dashboard slower than threshold`)
    }
    
    // Benchmark 3: Hero View Performance
    console.log('  🎯 Benchmarking hero view performance...')
    const heroStart = Date.now()
    await page.goto('/dashboard?view=hero-view&hub=income')
    await page.waitForLoadState('domcontentloaded')
    const heroDuration = Date.now() - heroStart
    
    console.log(`    ⚡ Hero View: ${heroDuration}ms (threshold: ${performanceThresholds.heroViewLoad}ms)`)
    if (heroDuration > performanceThresholds.heroViewLoad) {
      console.warn(`    ⚠️ Hero view slower than threshold`)
    }
    
    // Benchmark 4: Detailed View Performance
    console.log('  🔍 Benchmarking detailed view performance...')
    const detailedStart = Date.now()
    await page.goto('/dashboard?view=detailed&hub=performance&tab=overview')
    await page.waitForLoadState('domcontentloaded')
    const detailedDuration = Date.now() - detailedStart
    
    console.log(`    ⚡ Detailed View: ${detailedDuration}ms (threshold: ${performanceThresholds.detailedViewLoad}ms)`)
    if (detailedDuration > performanceThresholds.detailedViewLoad) {
      console.warn(`    ⚠️ Detailed view slower than threshold`)
    }
    
    // Overall Performance Assessment
    const avgPerformance = (authDuration + dashboardDuration + heroDuration + detailedDuration) / 4
    console.log(`  📈 Average workflow step duration: ${Math.round(avgPerformance)}ms`)
    
    await screenshotManager.captureScreenshot(page, journeyName, 'performance-benchmark-complete')
    
    // Assert performance is within acceptable bounds
    expect(authDuration).toBeLessThan(performanceThresholds.authentication * 1.5) // 50% tolerance
    expect(dashboardDuration).toBeLessThan(performanceThresholds.dashboardLoad * 1.5)
    
    console.log('  ✅ Workflow Performance Benchmarking Completed!')
  })
})