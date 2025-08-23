#!/usr/bin/env node

/**
 * Progressive Disclosure Authenticated Validation Test
 * 
 * Tests all three levels of the 80/15/5 user engagement model with proper authentication:
 * - Level 1 (momentum): 80% of users - 4-card dashboard overview
 * - Level 2 (hero-view): 15% of users - Individual hub focus  
 * - Level 3 (detailed): 5% of users - All hubs expanded with tabs
 * 
 * This script handles authentication and validates the architectural fixes.
 */

const { chromium } = require('playwright')
const fs = require('fs')

const BASE_URL = 'http://localhost:3000'
const DASHBOARD_PATH = '/dashboard/super-cards'

// Test credentials
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
}

// Progressive Disclosure test cases
const TEST_CASES = [
  // Level 1: Momentum Dashboard (80% of users)
  {
    url: `${DASHBOARD_PATH}?level=momentum`,
    level: 'momentum',
    description: 'Level 1 - Momentum Dashboard (4-card overview)',
    expectedSelector: '[data-level="momentum"]',
    expectedText: 'Complete Dashboard'
  },
  
  // Level 2: Hero Views (15% of users) 
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=performance`,
    level: 'hero-view',
    hub: 'performance',
    description: 'Level 2 - Performance Hub Hero View',
    expectedSelector: '[data-level="hero-view"]',
    expectedText: 'Performance Hub'
  },
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=tax-strategy`,
    level: 'hero-view',
    hub: 'tax-strategy',
    description: 'Level 2 - Tax Strategy Hero View', 
    expectedSelector: '[data-level="hero-view"]',
    expectedText: 'Tax Strategy'
  },
  
  // Level 3: Detailed Dashboard (5% of users)
  {
    url: `${DASHBOARD_PATH}?level=detailed`,
    level: 'detailed',
    description: 'Level 3 - Detailed Dashboard (All hubs expanded)',
    expectedSelector: '[data-level="detailed"]',
    expectedText: 'Full Content Dashboard'
  }
]

class AuthenticatedProgressiveDisclosureTest {
  constructor() {
    this.browser = null
    this.page = null
    this.results = []
  }

  async initialize() {
    console.log('🔐 Progressive Disclosure Authenticated Test')
    console.log('=' .repeat(50))
    
    this.browser = await chromium.launch({ 
      headless: true, // Run headless in CI/server environment
      timeout: 30000
    })
    
    const context = await this.browser.newContext()
    this.page = await context.newPage()
    
    // Monitor console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`⚠️  Console: ${msg.text()}`)
      }
    })
  }

  async authenticate() {
    console.log('🔐 Authenticating...')
    
    try {
      // Go to login page
      await this.page.goto(`${BASE_URL}/auth/login`)
      await this.page.waitForLoadState('networkidle')
      
      // Fill login form
      await this.page.fill('input[type="email"]', TEST_CREDENTIALS.email)
      await this.page.fill('input[type="password"]', TEST_CREDENTIALS.password)
      
      // Submit login
      await this.page.click('button[type="submit"]')
      
      // Wait for redirect to dashboard
      await this.page.waitForURL('**/dashboard/super-cards', { timeout: 10000 })
      
      console.log('✅ Authentication successful')
      return true
      
    } catch (error) {
      console.log(`❌ Authentication failed: ${error.message}`)
      return false
    }
  }

  async testProgressiveDisclosureLevel(testCase) {
    const { url, description, expectedSelector, expectedText, level, hub } = testCase
    
    console.log(`\n🧪 Testing: ${description}`)
    console.log(`   URL: ${url}`)
    
    try {
      // Navigate to test URL
      await this.page.goto(`${BASE_URL}${url}`)
      await this.page.waitForLoadState('networkidle')
      
      // Wait a moment for dynamic content
      await this.page.waitForTimeout(3000)
      
      // Check for expected selector
      const selectorExists = await this.page.isVisible(expectedSelector)
      
      // Check for expected text
      const pageContent = await this.page.textContent('body')
      const textFound = pageContent.includes(expectedText)
      
      // Get URL parameters for verification
      const currentUrl = this.page.url()
      const urlParams = new URL(currentUrl).searchParams
      const actualLevel = urlParams.get('level')
      const actualHub = urlParams.get('hub')
      
      // Take screenshot
      const screenshotName = `progressive-disclosure-${level}${hub ? `-${hub}` : ''}.png`
      await this.page.screenshot({ 
        path: `scripts/temp/${screenshotName}`, 
        fullPage: false 
      })
      
      const passed = selectorExists && textFound
      
      console.log(`   🎯 Selector: ${selectorExists ? '✅' : '❌'} ${expectedSelector}`)
      console.log(`   📝 Text: ${textFound ? '✅' : '❌'} "${expectedText}"`)
      console.log(`   🔗 URL Params: level=${actualLevel}, hub=${actualHub}`)
      console.log(`   📸 Screenshot: ${screenshotName}`)
      console.log(`   🎉 Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
      
      return {
        ...testCase,
        passed,
        selectorExists,
        textFound,
        actualLevel,
        actualHub,
        screenshot: screenshotName,
        currentUrl
      }
      
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`)
      console.log(`   🎉 Result: ❌ FAILED`)
      
      return {
        ...testCase,
        passed: false,
        error: error.message
      }
    }
  }

  async runAllTests() {
    console.log(`\n🎯 Running ${TEST_CASES.length} authenticated tests...\n`)
    
    for (const testCase of TEST_CASES) {
      const result = await this.testProgressiveDisclosureLevel(testCase)
      this.results.push(result)
      
      // Brief pause between tests
      await this.page.waitForTimeout(2000)
    }
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    const successRate = ((passed / total) * 100).toFixed(1)
    
    console.log('\n' + '='.repeat(50))
    console.log('📋 PROGRESSIVE DISCLOSURE TEST RESULTS')
    console.log('='.repeat(50))
    console.log(`📊 Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${total - passed}`)
    console.log(`🎯 Success Rate: ${successRate}%`)
    
    // Group results by level
    const momentum = this.results.filter(r => r.level === 'momentum')
    const heroView = this.results.filter(r => r.level === 'hero-view')
    const detailed = this.results.filter(r => r.level === 'detailed')
    
    console.log('\n📈 LEVEL BREAKDOWN:')
    console.log(`🏃 Level 1 (Momentum): ${momentum.filter(r => r.passed).length}/${momentum.length}`)
    console.log(`🎯 Level 2 (Hero-View): ${heroView.filter(r => r.passed).length}/${heroView.length}`)
    console.log(`📊 Level 3 (Detailed): ${detailed.filter(r => r.passed).length}/${detailed.length}`)
    
    if (total - passed > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`   • ${result.description}`)
          if (result.error) {
            console.log(`     Error: ${result.error}`)
          } else {
            console.log(`     Selector found: ${result.selectorExists}`)
            console.log(`     Text found: ${result.textFound}`)
          }
        })
    }
    
    // Final assessment
    if (successRate === '100.0') {
      console.log('\n🎉 SUCCESS: Progressive Disclosure architecture is FUNCTIONAL!')
      console.log('✅ All three levels working correctly')
      console.log('✅ URL parameter handling operational')
      console.log('✅ Hub mappings complete')
    } else {
      console.log('\n⚠️  Issues detected - architecture needs refinement')
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

async function main() {
  // Create temp directory
  if (!fs.existsSync('scripts/temp')) {
    fs.mkdirSync('scripts/temp', { recursive: true })
  }
  
  const test = new AuthenticatedProgressiveDisclosureTest()
  
  try {
    await test.initialize()
    
    const authenticated = await test.authenticate()
    if (!authenticated) {
      console.log('❌ Cannot proceed without authentication')
      process.exit(1)
    }
    
    await test.runAllTests()
    test.printSummary()
    
    const allPassed = test.results.every(r => r.passed)
    process.exit(allPassed ? 0 : 1)
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`)
    process.exit(1)
  } finally {
    await test.cleanup()
  }
}

if (require.main === module) {
  main()
}