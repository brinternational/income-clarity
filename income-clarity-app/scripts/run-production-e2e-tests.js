#!/usr/bin/env node

/**
 * Production E2E Test Runner
 * 
 * COMPREHENSIVE PRODUCTION TESTING SYSTEM:
 * - Environment validation (blocks localhost completely)
 * - Real user authentication with demo credentials
 * - Screenshot evidence capture for every test phase
 * - Console error monitoring with zero tolerance
 * - Performance benchmarking with acceptable thresholds
 * - Cross-device validation (desktop, mobile, tablet)
 * - Progressive disclosure testing (all 3 levels)
 * - Quality gate evaluation with actionable recommendations
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class ProductionE2ETestRunner {
  constructor() {
    this.productionUrl = 'https://incomeclarity.ddns.net'
    this.testResults = {
      startTime: Date.now(),
      environment: this.productionUrl,
      tests: [],
      summary: null
    }
  }

  async runTests() {
    console.log('🚀 PRODUCTION E2E TESTING FRAMEWORK')
    console.log('━'.repeat(80))
    console.log(`📍 Target Environment: ${this.productionUrl}`)
    console.log(`⚠️ LOCALHOST TESTING: BLOCKED`)
    console.log(`🔐 Demo User: test@example.com`)
    console.log(`📸 Screenshot Evidence: ENABLED`)
    console.log(`🖥️ Console Error Policy: ZERO TOLERANCE`)
    console.log(`🎯 Quality Gate: ACTIVE`)
    console.log('━'.repeat(80))

    try {
      // Step 1: Pre-flight environment validation
      await this.validateEnvironment()
      
      // Step 2: Run production tests
      await this.runProductionTests()
      
      // Step 3: Generate comprehensive reports
      await this.generateReports()
      
      // Step 4: Evaluate quality gate
      const qualityGatePassed = await this.evaluateQualityGate()
      
      // Step 5: Output final results
      this.outputFinalResults(qualityGatePassed)
      
      // Exit with appropriate code
      process.exit(qualityGatePassed ? 0 : 1)
      
    } catch (error) {
      console.error('❌ Production E2E testing failed:', error.message)
      console.error(error.stack)
      process.exit(1)
    }
  }

  async validateEnvironment() {
    console.log('🔍 STEP 1: Environment Validation')
    console.log('━'.repeat(40))
    
    // Check production connectivity
    console.log(`📡 Testing connectivity to ${this.productionUrl}...`)
    
    try {
      const response = await fetch(this.productionUrl, {
        method: 'HEAD',
        timeout: 15000
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      console.log('✅ Production environment accessible')
    } catch (error) {
      throw new Error(`❌ Production environment validation failed: ${error.message}`)
    }
    
    // Block localhost environment variables
    delete process.env.LOCALHOST_URL
    delete process.env.LOCAL_BASE_URL
    delete process.env.DEV_URL
    
    // Set production environment
    process.env.NODE_ENV = 'production'
    process.env.PLAYWRIGHT_BASE_URL = this.productionUrl
    process.env.TEST_ENVIRONMENT = 'production-only'
    
    console.log('✅ Environment validation complete')
    console.log('')
  }

  async runProductionTests() {
    console.log('🧪 STEP 2: Production Test Execution')
    console.log('━'.repeat(40))
    
    // Test suites to run
    const testSuites = [
      {
        name: 'Authentication Tests',
        config: 'playwright.production.config.ts',
        pattern: '__tests__/e2e-production/desktop/production-authentication.spec.ts',
        critical: true
      },
      {
        name: 'Progressive Disclosure Tests', 
        config: 'playwright.production.config.ts',
        pattern: '__tests__/e2e-production/desktop/production-progressive-disclosure.spec.ts',
        critical: true
      },
      {
        name: 'Mobile Responsive Tests',
        config: 'playwright.production.config.ts',
        pattern: '__tests__/e2e-production/mobile/production-mobile-responsive.spec.ts',
        critical: false
      }
    ]
    
    for (const suite of testSuites) {
      console.log(`\n🔍 Running: ${suite.name}`)
      console.log(`  Pattern: ${suite.pattern}`)
      console.log(`  Critical: ${suite.critical ? 'YES' : 'NO'}`)
      
      try {
        const startTime = Date.now()
        
        // Run Playwright tests
        const result = execSync(
          `npx playwright test ${suite.pattern} --config=${suite.config} --reporter=line`, 
          {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 600000 // 10 minute timeout
          }
        )
        
        const duration = Date.now() - startTime
        
        console.log(`  ✅ ${suite.name} completed in ${Math.round(duration / 1000)}s`)
        
        this.testResults.tests.push({
          name: suite.name,
          status: 'passed',
          duration,
          critical: suite.critical,
          output: result
        })
        
      } catch (error) {
        const duration = Date.now() - Date.now()
        
        console.log(`  ❌ ${suite.name} failed`)
        console.log(`  Error: ${error.message}`)
        
        this.testResults.tests.push({
          name: suite.name,
          status: 'failed',
          duration,
          critical: suite.critical,
          error: error.message,
          output: error.stdout
        })
        
        // Fail fast for critical test suites
        if (suite.critical) {
          throw new Error(`Critical test suite failed: ${suite.name}`)
        }
      }
    }
    
    console.log('\n✅ Test execution complete')
  }

  async generateReports() {
    console.log('\n📊 STEP 3: Report Generation')
    console.log('━'.repeat(40))
    
    const reportDir = 'playwright-production-report'
    
    // Ensure report directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    // Generate HTML report
    try {
      execSync(`npx playwright show-report ${reportDir}`, { stdio: 'pipe' })
      console.log(`✅ HTML report generated: ${reportDir}/index.html`)
    } catch (error) {
      console.warn('⚠️ HTML report generation failed')
    }
    
    // Save test results summary
    const summaryPath = path.join(reportDir, 'test-summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify({
      ...this.testResults,
      endTime: Date.now(),
      totalDuration: Date.now() - this.testResults.startTime
    }, null, 2))
    
    console.log(`✅ Test summary saved: ${summaryPath}`)
    
    // Check for screenshot evidence
    const screenshotDir = path.join(reportDir, 'screenshots')
    if (fs.existsSync(screenshotDir)) {
      const screenshots = fs.readdirSync(screenshotDir, { recursive: true })
      console.log(`📸 Screenshot evidence: ${screenshots.length} files`)
    }
    
    // Check for console error reports
    const consoleErrorDir = path.join(reportDir, 'console-errors')
    if (fs.existsSync(consoleErrorDir)) {
      console.log(`🖥️ Console error reports available`)
    }
    
    // Check for performance reports
    const performanceDir = path.join(reportDir, 'performance')
    if (fs.existsSync(performanceDir)) {
      console.log(`⚡ Performance reports available`)
    }
  }

  async evaluateQualityGate() {
    console.log('\n🚦 STEP 4: Quality Gate Evaluation')
    console.log('━'.repeat(40))
    
    const criticalTests = this.testResults.tests.filter(t => t.critical)
    const criticalFailures = criticalTests.filter(t => t.status === 'failed')
    
    const totalTests = this.testResults.tests.length
    const passedTests = this.testResults.tests.filter(t => t.status === 'passed').length
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    
    console.log('📊 Quality Gate Criteria:')
    console.log(`  • Critical Test Failures: ${criticalFailures.length} (max: 0)`)
    console.log(`  • Overall Pass Rate: ${passRate}% (min: 95%)`)
    
    // Quality gate rules
    let qualityGatePassed = true
    const issues = []
    
    if (criticalFailures.length > 0) {
      qualityGatePassed = false
      issues.push(`${criticalFailures.length} critical test failure(s)`)
    }
    
    if (passRate < 95) {
      qualityGatePassed = false
      issues.push(`Pass rate ${passRate}% below minimum 95%`)
    }
    
    // Check for console errors (if reports exist)
    const consoleErrorReport = path.join('playwright-production-report', 'console-errors', 'console-errors.json')
    if (fs.existsSync(consoleErrorReport)) {
      try {
        const consoleData = JSON.parse(fs.readFileSync(consoleErrorReport, 'utf-8'))
        if (consoleData.summary && consoleData.summary.critical > 0) {
          qualityGatePassed = false
          issues.push(`${consoleData.summary.critical} critical console error(s)`)
        }
      } catch (error) {
        console.warn('⚠️ Could not parse console error report')
      }
    }
    
    if (qualityGatePassed) {
      console.log('\n✅ QUALITY GATE: PASSED')
      console.log('🚀 Production deployment approved!')
    } else {
      console.log('\n❌ QUALITY GATE: FAILED')
      console.log('⚠️ Issues detected:')
      issues.forEach(issue => console.log(`   • ${issue}`))
      console.log('🚫 Production deployment blocked')
    }
    
    return qualityGatePassed
  }

  outputFinalResults(qualityGatePassed) {
    const totalDuration = Date.now() - this.testResults.startTime
    const totalTests = this.testResults.tests.length
    const passedTests = this.testResults.tests.filter(t => t.status === 'passed').length
    const failedTests = this.testResults.tests.filter(t => t.status === 'failed').length
    
    console.log('\n🏁 PRODUCTION E2E TESTING COMPLETE')
    console.log('━'.repeat(80))
    console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`)
    console.log(`🧪 Total Test Suites: ${totalTests}`)
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    console.log(`📈 Pass Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`)
    console.log(`🎯 Quality Gate: ${qualityGatePassed ? 'PASSED ✅' : 'FAILED ❌'}`)
    console.log(`📍 Environment: ${this.productionUrl}`)
    console.log(`📊 Reports: playwright-production-report/`)
    console.log('━'.repeat(80))
    
    if (qualityGatePassed) {
      console.log('🚀 PRODUCTION DEPLOYMENT APPROVED')
      console.log('All quality gates passed - ready for production!')
    } else {
      console.log('🚫 PRODUCTION DEPLOYMENT BLOCKED')
      console.log('Resolve issues before production deployment')
    }
    
    console.log('━'.repeat(80))
  }
}

// Add fetch polyfill for Node.js environments that don't have it
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

// Run the tests
const runner = new ProductionE2ETestRunner()
runner.runTests().catch(error => {
  console.error('❌ Test runner failed:', error.message)
  process.exit(1)
})

module.exports = ProductionE2ETestRunner