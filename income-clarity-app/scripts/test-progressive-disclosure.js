#!/usr/bin/env node

/**
 * Progressive Disclosure Validation Test
 * 
 * Tests all three levels of the 80/15/5 user engagement model:
 * - Level 1 (momentum): 80% of users - 4-card dashboard overview
 * - Level 2 (hero-view): 15% of users - Individual hub focus  
 * - Level 3 (detailed): 5% of users - All hubs expanded with tabs
 * 
 * This script validates that the architectural fixes resolve the 100% failure rate
 * from comprehensive E2E testing.
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:3000'
const DASHBOARD_PATH = '/dashboard/super-cards'

// Test URLs that were failing in E2E testing
const TEST_URLS = [
  // Level 1: Momentum Dashboard (80% of users)
  {
    url: `${DASHBOARD_PATH}?level=momentum`,
    level: 'momentum',
    description: 'Level 1 - Momentum Dashboard (4-card overview)',
    expectedElements: ['momentum-dashboard', '.single-page-dashboard'],
    expectedContent: 'All 5 Super Cards'
  },
  
  // Level 2: Hero Views (15% of users) 
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=performance`,
    level: 'hero-view',
    hub: 'performance',
    description: 'Level 2 - Performance Hub Hero View',
    expectedElements: ['hero-view', '[data-level="hero-view"]'],
    expectedContent: 'Performance Hub'
  },
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=income-tax`,
    level: 'hero-view', 
    hub: 'income-tax',
    description: 'Level 2 - Income Intelligence Hero View',
    expectedElements: ['hero-view', '[data-level="hero-view"]'],
    expectedContent: 'Income Intelligence'
  },
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=tax-strategy`,
    level: 'hero-view',
    hub: 'tax-strategy', 
    description: 'Level 2 - Tax Strategy Hero View',
    expectedElements: ['hero-view', '[data-level="hero-view"]'],
    expectedContent: 'Tax Strategy'
  },
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=portfolio-strategy`,
    level: 'hero-view',
    hub: 'portfolio-strategy',
    description: 'Level 2 - Portfolio Strategy Hero View', 
    expectedElements: ['hero-view', '[data-level="hero-view"]'],
    expectedContent: 'Portfolio Strategy'
  },
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=financial-planning`,
    level: 'hero-view',
    hub: 'financial-planning',
    description: 'Level 2 - Financial Planning Hero View',
    expectedElements: ['hero-view', '[data-level="hero-view"]'],
    expectedContent: 'Financial Planning'
  },
  
  // Level 3: Detailed Dashboard (5% of users)
  {
    url: `${DASHBOARD_PATH}?level=detailed`,
    level: 'detailed',
    description: 'Level 3 - Detailed Dashboard (All hubs expanded)',
    expectedElements: ['detailed-dashboard', '.full-content-dashboard'],
    expectedContent: 'Full Content Dashboard'
  },
  
  // Error Handling Tests
  {
    url: `${DASHBOARD_PATH}?level=invalid`,
    level: 'invalid',
    description: 'Error Handling - Invalid level parameter',
    expectedElements: ['invalid-level'],
    expectedContent: 'Invalid disclosure level'
  },
  {
    url: `${DASHBOARD_PATH}?level=hero-view&hub=nonexistent`,
    level: 'hero-view',
    hub: 'nonexistent', 
    description: 'Error Handling - Invalid hub for hero-view',
    expectedElements: ['hero-view'],
    expectedContent: 'not found for hero view'
  }
]

class ProgressiveDisclosureValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    }
    this.browser = null
    this.page = null
  }

  async initialize() {
    console.log('🚀 Progressive Disclosure Validation Test')
    console.log('=' .repeat(60))
    
    this.browser = await chromium.launch({ 
      headless: true,
      timeout: 30000
    })
    
    this.page = await this.browser.newPage()
    
    // Set up console error monitoring
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`❌ Console Error: ${msg.text()}`)
      }
    })
    
    // Check if server is running
    try {
      await this.page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 })
      console.log('✅ Server connection confirmed')
    } catch (error) {
      throw new Error(`❌ Cannot connect to server at ${BASE_URL}. Is the server running?`)
    }
  }

  async testUrl(testCase) {
    const { url, description, expectedElements, expectedContent, level, hub } = testCase
    
    console.log(`\n🧪 Testing: ${description}`)
    console.log(`   URL: ${url}`)
    
    try {
      // Navigate to test URL
      await this.page.goto(`${BASE_URL}${url}`, { 
        waitUntil: 'networkidle', 
        timeout: 15000 
      })
      
      // Wait for page to stabilize
      await this.page.waitForTimeout(2000)
      
      // Take screenshot for evidence
      const screenshotName = `progressive-disclosure-${level}${hub ? `-${hub}` : ''}.png`
      await this.page.screenshot({ 
        path: `scripts/temp/${screenshotName}`, 
        fullPage: true 
      })
      
      // Check for expected elements
      const elementChecks = []
      for (const element of expectedElements) {
        try {
          await this.page.waitForSelector(element, { timeout: 5000 })
          elementChecks.push({ element, found: true })
        } catch {
          elementChecks.push({ element, found: false })
        }
      }
      
      // Check for expected content
      const pageContent = await this.page.textContent('body')
      const contentFound = pageContent.includes(expectedContent)
      
      // Validate URL parameters are handled correctly
      const currentUrl = this.page.url()
      const urlParams = new URL(currentUrl).searchParams
      const actualLevel = urlParams.get('level')
      const actualHub = urlParams.get('hub')
      
      // Determine test result
      const allElementsFound = elementChecks.every(check => check.found)
      const passed = allElementsFound && contentFound
      
      // Log detailed results
      console.log(`   📊 Elements: ${elementChecks.filter(c => c.found).length}/${elementChecks.length} found`)
      console.log(`   📝 Content: ${contentFound ? '✅' : '❌'} "${expectedContent}"`)
      console.log(`   🎯 URL Params: level=${actualLevel}, hub=${actualHub}`)
      console.log(`   📸 Screenshot: ${screenshotName}`)
      console.log(`   🎉 Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
      
      return {
        ...testCase,
        passed,
        screenshot: screenshotName,
        elementChecks,
        contentFound,
        actualLevel,
        actualHub,
        currentUrl,
        error: null
      }
      
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`)
      console.log(`   🎉 Result: ❌ FAILED`)
      
      return {
        ...testCase,
        passed: false,
        error: error.message,
        elementChecks: [],
        contentFound: false
      }
    }
  }

  async runAllTests() {
    console.log(`\n🎯 Running ${TEST_URLS.length} Progressive Disclosure tests...\n`)
    
    for (const testCase of TEST_URLS) {
      const result = await this.testUrl(testCase)
      
      this.results.total++
      if (result.passed) {
        this.results.passed++
      } else {
        this.results.failed++
      }
      
      this.results.tests.push(result)
      
      // Brief pause between tests
      await this.page.waitForTimeout(1000)
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString()
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1)
    
    const report = {
      timestamp,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${successRate}%`
      },
      architecture: {
        level1_momentum: this.results.tests.filter(t => t.level === 'momentum'),
        level2_heroView: this.results.tests.filter(t => t.level === 'hero-view' && !t.error),
        level3_detailed: this.results.tests.filter(t => t.level === 'detailed'),
        errorHandling: this.results.tests.filter(t => t.level === 'invalid' || t.hub === 'nonexistent')
      },
      tests: this.results.tests
    }
    
    // Save detailed report
    fs.writeFileSync(
      'scripts/temp/progressive-disclosure-validation-report.json',
      JSON.stringify(report, null, 2)
    )
    
    return report
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60))
    console.log('📋 PROGRESSIVE DISCLOSURE VALIDATION RESULTS')
    console.log('='.repeat(60))
    console.log(`📊 Tests Run: ${report.summary.total}`)
    console.log(`✅ Passed: ${report.summary.passed}`)
    console.log(`❌ Failed: ${report.summary.failed}`)
    console.log(`🎯 Success Rate: ${report.summary.successRate}`)
    
    console.log('\n📈 ARCHITECTURE VALIDATION:')
    console.log(`🏃 Level 1 (Momentum): ${report.architecture.level1_momentum.filter(t => t.passed).length}/${report.architecture.level1_momentum.length} passed`)
    console.log(`🎯 Level 2 (Hero-View): ${report.architecture.level2_heroView.filter(t => t.passed).length}/${report.architecture.level2_heroView.length} passed`)
    console.log(`📊 Level 3 (Detailed): ${report.architecture.level3_detailed.filter(t => t.passed).length}/${report.architecture.level3_detailed.length} passed`)
    console.log(`⚠️  Error Handling: ${report.architecture.errorHandling.filter(t => t.passed).length}/${report.architecture.errorHandling.length} passed`)
    
    if (report.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      report.tests
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`   • ${test.description}`)
          console.log(`     URL: ${test.url}`)
          console.log(`     Error: ${test.error || 'Content/element validation failed'}`)
        })
    }
    
    console.log(`\n📁 Report saved: scripts/temp/progressive-disclosure-validation-report.json`)
    console.log(`📸 Screenshots: scripts/temp/progressive-disclosure-*.png`)
    
    // Final verdict
    if (report.summary.successRate === '100.0%') {
      console.log('\n🎉 SUCCESS: Progressive Disclosure architecture fully functional!')
      console.log('✅ All three levels (momentum/hero-view/detailed) working correctly')
      console.log('✅ Hub mappings complete')
      console.log('✅ Error handling operational')
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Some tests failed')
      console.log('❌ Progressive Disclosure system requires additional fixes')
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Main execution
async function main() {
  // Create temp directory for screenshots and reports
  if (!fs.existsSync('scripts/temp')) {
    fs.mkdirSync('scripts/temp', { recursive: true })
  }
  
  const validator = new ProgressiveDisclosureValidator()
  
  try {
    await validator.initialize()
    await validator.runAllTests()
    const report = validator.generateReport()
    validator.printSummary(report)
    
    // Exit with proper code
    process.exit(report.summary.failed === 0 ? 0 : 1)
    
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`)
    process.exit(1)
  } finally {
    await validator.cleanup()
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error)
  process.exit(1)
})

if (require.main === module) {
  main()
}

module.exports = { ProgressiveDisclosureValidator, TEST_URLS }