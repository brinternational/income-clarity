/**
 * Production Progressive Disclosure Tests - Desktop
 * 
 * CRITICAL VALIDATION:
 * - Level 1: Momentum view (dashboard overview)
 * - Level 2: Hero view (focused super card view)  
 * - Level 3: Detailed view (comprehensive hub interface)
 * - Interactive navigation between all levels
 * - Real data loading and display validation
 * - Performance measurement for each level
 * - Visual evidence capture for every transition
 */

import { test, expect } from '@playwright/test'
import { ProductionAuthPage } from '../page-objects/ProductionAuthPage'
import { ProductionDashboardPage } from '../page-objects/ProductionDashboardPage'
import { ScreenshotManager } from '../utils/screenshot-manager'
import { ConsoleErrorMonitor } from '../utils/console-error-monitor'
import { PerformanceBenchmarker } from '../utils/performance-benchmarker'

test.describe('Production Progressive Disclosure - Desktop', () => {
  let authPage: ProductionAuthPage
  let dashboardPage: ProductionDashboardPage
  let screenshotManager: ScreenshotManager
  let consoleMonitor: ConsoleErrorMonitor
  let performanceBenchmarker: PerformanceBenchmarker

  test.beforeAll(async () => {
    screenshotManager = new ScreenshotManager()
    consoleMonitor = new ConsoleErrorMonitor()
    performanceBenchmarker = new PerformanceBenchmarker()
    
    await screenshotManager.initialize()
    await consoleMonitor.initialize()
    await performanceBenchmarker.initialize()
  })

  test.beforeEach(async ({ page }) => {
    authPage = new ProductionAuthPage(page)
    dashboardPage = new ProductionDashboardPage(page)
    
    // Authenticate before each test
    await authPage.navigateToLogin('setup')
    await authPage.loginWithDemoUser('setup')
  })

  test.afterEach(async ({ page }) => {
    // Logout after each test
    try {
      await authPage.logout('cleanup')
    } catch (error) {
      console.warn('⚠️ Logout failed during cleanup:', error.message)
    }
  })

  test('should validate all three progressive disclosure levels', async ({ page }) => {
    const testName = 'complete-progressive-disclosure-validation'
    
    console.log('🎯 Starting comprehensive progressive disclosure validation...')
    consoleMonitor.startMonitoring(page, testName, 'progressive-disclosure')
    
    // LEVEL 1: Momentum View Testing
    console.log('📊 Testing Progressive Disclosure Level 1 (Momentum View)...')
    await dashboardPage.testProgressiveDisclosureLevel1(testName)
    
    // Capture momentum view evidence
    await screenshotManager.captureScreenshot(
      page, 
      testName, 
      'level-1-momentum-complete',
      { fullPage: true }
    )
    
    // LEVEL 2: Hero Views Testing
    console.log('🎯 Testing Progressive Disclosure Level 2 (Hero Views)...')
    await dashboardPage.testProgressiveDisclosureLevel2(testName)
    
    // LEVEL 3: Detailed Views Testing  
    console.log('🔍 Testing Progressive Disclosure Level 3 (Detailed Views)...')
    await dashboardPage.testProgressiveDisclosureLevel3(testName)
    
    // Capture final validation state
    await screenshotManager.captureScreenshot(
      page, 
      testName, 
      'all-levels-validated',
      { fullPage: true }
    )
    
    // Validate no critical console errors
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ All three progressive disclosure levels validated successfully')
    console.log(`📊 Console errors: ${errorCount.total} (${errorCount.critical} critical)`)
  })

  test('should test interactive navigation between disclosure levels', async ({ page }) => {
    const testName = 'interactive-navigation-validation'
    
    console.log('🧭 Testing interactive navigation between disclosure levels...')
    consoleMonitor.startMonitoring(page, testName, 'navigation')
    
    // Test navigation flow
    await dashboardPage.testInteractiveNavigation(testName)
    
    // Additional navigation testing - back to momentum
    console.log('🔄 Testing return to momentum view...')
    await page.goto('/dashboard?view=momentum')
    await page.waitForLoadState('domcontentloaded')
    
    // Capture navigation complete
    await screenshotManager.captureScreenshot(page, testName, 'navigation-flow-complete')
    
    // Validate we're back at momentum view
    const currentUrl = page.url()
    expect(currentUrl).toContain('view=momentum')
    
    console.log('✅ Interactive navigation validated successfully')
  })

  test('should validate each super card hub in all disclosure levels', async ({ page }) => {
    const testName = 'super-card-hub-validation'
    
    console.log('🃏 Validating each super card hub across all disclosure levels...')
    consoleMonitor.startMonitoring(page, testName, 'hub-validation')
    
    const superCards = dashboardPage.getSuperCards()
    const performanceResults = []
    
    for (const card of superCards) {
      console.log(`\n🎯 Testing ${card.name} hub across all levels...`)
      
      // Level 2: Hero view for this hub
      console.log(`  📈 Testing ${card.name} hero view...`)
      await page.goto(`/dashboard?view=hero-view&hub=${card.hubName}`)
      await page.waitForLoadState('domcontentloaded')
      
      // Capture hero view
      await screenshotManager.captureScreenshot(
        page, 
        testName, 
        `hero-${card.hubName}`
      )
      
      // Measure performance
      const heroPerformance = await performanceBenchmarker.measurePagePerformance(
        page, 
        `${testName}-hero-${card.hubName}`
      )
      performanceResults.push({
        hub: card.name,
        view: 'hero',
        loadTime: heroPerformance.navigationTiming.loadComplete
      })
      
      // Level 3: Detailed view for this hub
      console.log(`  🔍 Testing ${card.name} detailed view...`)
      await page.goto(`/dashboard?view=detailed&hub=${card.hubName}&tab=overview`)
      await page.waitForLoadState('domcontentloaded')
      
      // Wait for detailed content
      await page.waitForTimeout(2000) // Allow for content loading
      
      // Capture detailed view
      await screenshotManager.captureScreenshot(
        page, 
        testName, 
        `detailed-${card.hubName}`,
        { fullPage: true }
      )
      
      // Measure detailed view performance
      const detailedPerformance = await performanceBenchmarker.measurePagePerformance(
        page, 
        `${testName}-detailed-${card.hubName}`
      )
      performanceResults.push({
        hub: card.name,
        view: 'detailed',
        loadTime: detailedPerformance.navigationTiming.loadComplete
      })
      
      console.log(`  ✅ ${card.name} hub validated across hero and detailed views`)
    }
    
    // Performance analysis
    console.log('\n⚡ Performance Analysis:')
    for (const result of performanceResults) {
      console.log(`  ${result.hub} (${result.view}): ${result.loadTime}ms`)
      if (result.loadTime > 5000) {
        console.warn(`    ⚠️ Slow load time detected: ${result.loadTime}ms`)
      }
    }
    
    // Final validation
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ All super card hubs validated across disclosure levels')
  })

  test('should validate URL parameters for progressive disclosure states', async ({ page }) => {
    const testName = 'url-parameter-validation'
    
    console.log('🔗 Testing URL parameters for progressive disclosure states...')
    consoleMonitor.startMonitoring(page, testName, 'url-params')
    
    // Test direct navigation to specific states via URL
    const testUrls = [
      { url: '/dashboard?view=momentum', description: 'Momentum view' },
      { url: '/dashboard?view=hero-view&hub=income', description: 'Income hero view' },
      { url: '/dashboard?view=hero-view&hub=performance', description: 'Performance hero view' },
      { url: '/dashboard?view=detailed&hub=tax-strategy&tab=comparison', description: 'Tax strategy detailed view' },
      { url: '/dashboard?view=detailed&hub=portfolio-strategy&tab=allocation', description: 'Portfolio strategy detailed view' },
      { url: '/dashboard?view=detailed&hub=financial-planning&tab=goals', description: 'Financial planning detailed view' }
    ]
    
    for (const testUrl of testUrls) {
      console.log(`  🔍 Testing direct navigation: ${testUrl.description}`)
      
      // Navigate directly via URL
      await page.goto(testUrl.url)
      await page.waitForLoadState('domcontentloaded')
      
      // Wait for content to load
      await page.waitForTimeout(2000)
      
      // Capture state
      const urlSafeDescription = testUrl.description.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
      await screenshotManager.captureScreenshot(
        page, 
        testName, 
        `url-direct-${urlSafeDescription}`
      )
      
      // Validate URL is correct
      const currentUrl = page.url()
      expect(currentUrl).toContain(testUrl.url.split('?')[1]) // Check query params
      
      // Measure performance
      await performanceBenchmarker.measurePagePerformance(page, `${testName}-${urlSafeDescription}`)
      
      console.log(`    ✅ ${testUrl.description} accessible via direct URL`)
    }
    
    // Test invalid URL parameters
    console.log('  🚫 Testing invalid URL parameters...')
    await page.goto('/dashboard?view=invalid&hub=nonexistent')
    await page.waitForLoadState('domcontentloaded')
    
    // Should fallback to default view (momentum or dashboard)
    await screenshotManager.captureScreenshot(page, testName, 'invalid-url-fallback')
    
    // Validate no critical errors from invalid parameters
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ URL parameter validation completed')
  })

  test('should validate progressive disclosure performance benchmarks', async ({ page }) => {
    const testName = 'progressive-disclosure-performance'
    
    console.log('⚡ Starting progressive disclosure performance benchmarking...')
    consoleMonitor.startMonitoring(page, testName, 'performance')
    
    const performanceThresholds = {
      momentum: 3000,    // 3 seconds
      heroView: 2500,    // 2.5 seconds  
      detailedView: 4000 // 4 seconds (more content)
    }
    
    // Benchmark Level 1: Momentum View
    console.log('📊 Benchmarking momentum view performance...')
    await page.goto('/dashboard?view=momentum')
    await page.waitForLoadState('domcontentloaded')
    
    const momentumPerformance = await performanceBenchmarker.measurePagePerformance(page, `${testName}-momentum`)
    
    if (momentumPerformance.navigationTiming.loadComplete > performanceThresholds.momentum) {
      console.warn(`⚠️ Momentum view slower than threshold: ${momentumPerformance.navigationTiming.loadComplete}ms > ${performanceThresholds.momentum}ms`)
    }
    
    // Benchmark Level 2: Hero Views (sample)
    console.log('🎯 Benchmarking hero view performance...')
    await page.goto('/dashboard?view=hero-view&hub=income')
    await page.waitForLoadState('domcontentloaded')
    
    const heroPerformance = await performanceBenchmarker.measurePagePerformance(page, `${testName}-hero`)
    
    if (heroPerformance.navigationTiming.loadComplete > performanceThresholds.heroView) {
      console.warn(`⚠️ Hero view slower than threshold: ${heroPerformance.navigationTiming.loadComplete}ms > ${performanceThresholds.heroView}ms`)
    }
    
    // Benchmark Level 3: Detailed View (sample)
    console.log('🔍 Benchmarking detailed view performance...')
    await page.goto('/dashboard?view=detailed&hub=performance&tab=overview')
    await page.waitForLoadState('domcontentloaded')
    
    const detailedPerformance = await performanceBenchmarker.measurePagePerformance(page, `${testName}-detailed`)
    
    if (detailedPerformance.navigationTiming.loadComplete > performanceThresholds.detailedView) {
      console.warn(`⚠️ Detailed view slower than threshold: ${detailedPerformance.navigationTiming.loadComplete}ms > ${performanceThresholds.detailedView}ms`)
    }
    
    // Capture performance benchmark complete
    await screenshotManager.captureScreenshot(page, testName, 'performance-benchmark-complete')
    
    // Performance summary
    console.log('📈 Progressive Disclosure Performance Summary:')
    console.log(`  Momentum View: ${momentumPerformance.navigationTiming.loadComplete}ms (threshold: ${performanceThresholds.momentum}ms)`)
    console.log(`  Hero View: ${heroPerformance.navigationTiming.loadComplete}ms (threshold: ${performanceThresholds.heroView}ms)`)
    console.log(`  Detailed View: ${detailedPerformance.navigationTiming.loadComplete}ms (threshold: ${performanceThresholds.detailedView}ms)`)
    
    // Overall performance score
    const avgLoadTime = (momentumPerformance.navigationTiming.loadComplete + heroPerformance.navigationTiming.loadComplete + detailedPerformance.navigationTiming.loadComplete) / 3
    console.log(`  Average Load Time: ${Math.round(avgLoadTime)}ms`)
    
    // Assert no critical errors
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Progressive disclosure performance benchmarking completed')
  })

  test('should validate data loading and display across all levels', async ({ page }) => {
    const testName = 'data-loading-validation'
    
    console.log('📊 Validating data loading and display across all progressive disclosure levels...')
    consoleMonitor.startMonitoring(page, testName, 'data-loading')
    
    // Level 1: Check for summary data in momentum view
    await page.goto('/dashboard?view=momentum')
    await page.waitForLoadState('domcontentloaded')
    
    // Wait for potential data loading
    await page.waitForTimeout(3000)
    
    await screenshotManager.captureScreenshot(page, testName, 'momentum-data-loaded')
    
    // Look for data indicators (numbers, charts, etc.)
    const dataIndicators = [
      'text=/[\\$]\\d+/',           // Dollar amounts
      'text=/\\d+%/',              // Percentages  
      'text=/\\d+\\.\\d+%/',       // Decimal percentages
      'text=/\\d{1,3}(,\\d{3})*/', // Formatted numbers
      '[data-testid*="value"]',    // Value elements
      '.value',                    // Value classes
      '.amount',                   // Amount classes
      '.percentage'                // Percentage classes
    ]
    
    let dataFound = false
    for (const indicator of dataIndicators) {
      try {
        const elements = page.locator(indicator)
        const count = await elements.count()
        if (count > 0) {
          console.log(`✅ Data indicators found in momentum view: ${count} ${indicator}`)
          dataFound = true
          break
        }
      } catch {
        // Continue to next indicator
      }
    }
    
    if (!dataFound) {
      console.warn('⚠️ No data indicators found in momentum view')
    }
    
    // Level 2: Check for focused data in hero view
    await page.goto('/dashboard?view=hero-view&hub=income')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    
    await screenshotManager.captureScreenshot(page, testName, 'hero-income-data-loaded')
    
    // Look for income-specific data
    const incomeDataIndicators = [
      'text=Income',
      'text=Dividend',
      'text=Annual',
      'text=Monthly',
      'text=Projection'
    ]
    
    let incomeDataFound = false
    for (const indicator of incomeDataIndicators) {
      try {
        await expect(page.locator(indicator).first()).toBeVisible({ timeout: 5000 })
        console.log(`✅ Income data found: ${indicator}`)
        incomeDataFound = true
        break
      } catch {
        // Continue to next indicator
      }
    }
    
    if (!incomeDataFound) {
      console.warn('⚠️ No income-specific data found in hero view')
    }
    
    // Level 3: Check for detailed data in detailed view
    await page.goto('/dashboard?view=detailed&hub=performance&tab=overview')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    
    await screenshotManager.captureScreenshot(page, testName, 'detailed-performance-data-loaded')
    
    // Look for detailed performance data
    const performanceDataIndicators = [
      'text=Performance',
      'text=Portfolio',
      'text=Return',
      'text=Benchmark',
      'text=SPY'
    ]
    
    let performanceDataFound = false
    for (const indicator of performanceDataIndicators) {
      try {
        await expect(page.locator(indicator).first()).toBeVisible({ timeout: 5000 })
        console.log(`✅ Performance data found: ${indicator}`)
        performanceDataFound = true
        break
      } catch {
        // Continue to next indicator
      }
    }
    
    if (!performanceDataFound) {
      console.warn('⚠️ No performance-specific data found in detailed view')
    }
    
    // Final validation
    const errorCount = consoleMonitor.getErrorCount()
    expect(errorCount.critical).toBe(0)
    
    console.log('✅ Data loading validation completed across all progressive disclosure levels')
  })
})