#!/usr/bin/env node

/**
 * Focused Test: Progressive Disclosure Level 3 (Detailed Views)
 * Tests that all detailed views show comprehensive tab-based analysis
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const PRODUCTION_URL = 'https://incomeclarity.ddns.net'
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
}

// Test configurations for all hub IDs
const DETAILED_VIEW_TESTS = [
  {
    hub: 'performance',
    title: 'Performance Hub',
    expectedTabs: ['Overview', 'Analysis', 'Comparison', 'Risk']
  },
  {
    hub: 'income',
    title: 'Income Intelligence Hub',
    expectedTabs: ['Overview', 'Analysis', 'Projections', 'Optimization']
  },
  {
    hub: 'tax-strategy',
    title: 'Tax Strategy Hub',
    expectedTabs: ['Overview', 'Strategies', 'Scenarios', 'Optimization']
  },
  {
    hub: 'portfolio-strategy',
    title: 'Portfolio Strategy Hub',
    expectedTabs: ['Overview', 'Strategy', 'Health', 'Rebalancing']
  },
  {
    hub: 'financial-planning',
    title: 'Financial Planning Hub',
    expectedTabs: ['Overview', 'FIRE', 'Milestones', 'Scenarios']
  }
]

async function testDetailedViews() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const results = []
  let screenshotCounter = 1

  try {
    console.log('🔑 Logging in...')
    
    // Login
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    await page.fill('[name="email"]', TEST_CREDENTIALS.email)
    await page.fill('[name="password"]', TEST_CREDENTIALS.password)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL(`${PRODUCTION_URL}/dashboard/**`)
    console.log('✅ Login successful')

    // Test each detailed view
    for (const testConfig of DETAILED_VIEW_TESTS) {
      console.log(`\n🧪 Testing Detailed View: ${testConfig.title}`)
      
      const detailedUrl = `${PRODUCTION_URL}/dashboard/super-cards?level=detailed&hub=${testConfig.hub}`
      
      try {
        // Navigate to detailed view
        await page.goto(detailedUrl)
        
        // Wait for page to load
        await page.waitForSelector('.detailed-view', { timeout: 10000 })
        
        // Check if we're actually in detailed view level
        const levelBadge = await page.textContent('[data-testid="level-badge"], .badge:has-text("Level 3")')
        if (!levelBadge || !levelBadge.includes('Level 3')) {
          throw new Error('Not showing Level 3 - Detailed View badge')
        }
        
        // Check hub title
        const hubTitle = await page.textContent('h1')
        if (!hubTitle.includes(testConfig.title)) {
          throw new Error(`Expected hub title "${testConfig.title}" but found "${hubTitle}"`)
        }
        
        // Take screenshot before checking tabs
        const beforeTabsPath = `detailed-view-${testConfig.hub}-before-tabs-${screenshotCounter++}.png`
        await page.screenshot({ path: beforeTabsPath, fullPage: true })
        
        // Wait for tabs to load
        await page.waitForSelector('[role="tablist"]', { timeout: 10000 })
        
        // Get all tab labels
        const actualTabs = await page.$$eval('[role="tab"]', tabs => 
          tabs.map(tab => tab.textContent.trim())
        )
        
        console.log(`📋 Expected tabs: ${testConfig.expectedTabs.join(', ')}`)
        console.log(`📋 Found tabs: ${actualTabs.join(', ')}`)
        
        // Verify all expected tabs are present
        const missingTabs = testConfig.expectedTabs.filter(expectedTab => 
          !actualTabs.some(actualTab => actualTab === expectedTab)
        )
        
        if (missingTabs.length > 0) {
          throw new Error(`Missing tabs: ${missingTabs.join(', ')}`)
        }
        
        // Test clicking each tab to ensure content loads
        for (let i = 0; i < actualTabs.length; i++) {
          const tabName = actualTabs[i]
          console.log(`🖱️ Testing tab: ${tabName}`)
          
          // Click the tab
          await page.click(`[role="tab"]:nth-child(${i + 1})`)
          
          // Wait for tab content to load
          await page.waitForTimeout(1000)
          
          // Take screenshot of tab content
          const tabScreenshotPath = `detailed-view-${testConfig.hub}-tab-${tabName.toLowerCase()}-${screenshotCounter++}.png`
          await page.screenshot({ path: tabScreenshotPath, fullPage: true })
          
          // Check that tab content is not empty or showing fallback
          const tabContent = await page.textContent('[role="tabpanel"]')
          if (!tabContent || tabContent.length < 100) {
            console.warn(`⚠️ Tab "${tabName}" has minimal content`)
          }
        }
        
        // Take final screenshot showing complete detailed view
        const finalPath = `detailed-view-${testConfig.hub}-complete-${screenshotCounter++}.png`
        await page.screenshot({ path: finalPath, fullPage: true })
        
        results.push({
          hub: testConfig.hub,
          title: testConfig.title,
          status: 'PASSED',
          tabsFound: actualTabs.length,
          tabsExpected: testConfig.expectedTabs.length,
          screenshots: [beforeTabsPath, finalPath],
          url: detailedUrl
        })
        
        console.log(`✅ PASSED: ${testConfig.title} detailed view working with ${actualTabs.length} tabs`)
        
      } catch (error) {
        const errorScreenshotPath = `detailed-view-${testConfig.hub}-ERROR-${screenshotCounter++}.png`
        await page.screenshot({ path: errorScreenshotPath, fullPage: true })
        
        results.push({
          hub: testConfig.hub,
          title: testConfig.title,
          status: 'FAILED',
          error: error.message,
          screenshot: errorScreenshotPath,
          url: detailedUrl
        })
        
        console.log(`❌ FAILED: ${testConfig.title} - ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error)
  } finally {
    await browser.close()
  }

  // Print results summary
  console.log('\n📊 DETAILED VIEWS TEST RESULTS:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const passed = results.filter(r => r.status === 'PASSED')
  const failed = results.filter(r => r.status === 'FAILED')
  
  console.log(`✅ PASSED: ${passed.length}/${results.length}`)
  console.log(`❌ FAILED: ${failed.length}/${results.length}`)
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:')
    failed.forEach(result => {
      console.log(`  • ${result.title}: ${result.error}`)
    })
  }
  
  if (passed.length > 0) {
    console.log('\n✅ PASSED TESTS:')
    passed.forEach(result => {
      console.log(`  • ${result.title}: ${result.tabsFound} tabs working`)
    })
  }
  
  // Write detailed results
  const resultFile = 'detailed-views-test-results.json'
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2))
  console.log(`\n📋 Full results saved to: ${resultFile}`)
  
  return results
}

if (require.main === module) {
  testDetailedViews().catch(console.error)
}

module.exports = { testDetailedViews }