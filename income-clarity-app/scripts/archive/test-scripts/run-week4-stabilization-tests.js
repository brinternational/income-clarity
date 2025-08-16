#!/usr/bin/env node

/**
 * Week 4 Stabilization Test Suite Runner
 * Executes comprehensive stabilization tests and generates detailed reports
 * 
 * Usage: node scripts/run-week4-stabilization-tests.js [options]
 * Options:
 *   --full      Run all tests including stress tests
 *   --quick     Run only essential tests
 *   --report    Generate detailed HTML report
 *   --ci        Run in CI mode with machine-readable output
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes per test suite
  retries: 1,
  outputDir: 'test-results/week4-stabilization',
  reportFile: 'stabilization-report.html'
}

// Performance thresholds for validation
const PERFORMANCE_THRESHOLDS = {
  pageLoadTime: 2000, // 2 seconds
  apiResponseTime: 100, // 100ms
  testCoverage: 80, // 80%
  passRate: 95 // 95%
}

class StabilizationTestRunner {
  constructor(options = {}) {
    this.options = options
    this.results = {
      startTime: new Date(),
      endTime: null,
      testSuites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      performance: {
        averageLoadTime: 0,
        averageApiResponse: 0,
        memoryUsage: 0
      },
      issues: []
    }
    
    this.setupOutputDirectory()
  }

  setupOutputDirectory() {
    if (!fs.existsSync(TEST_CONFIG.outputDir)) {
      fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true })
    }
  }

  async runAllTests() {
    // console.log('🚀 Starting Week 4 Stabilization Test Suite')
    // console.log('=' + '='.repeat(50))
    
    try {
      // Kill any existing dev servers
      await this.killExistingServers()
      
      // Start development server for E2E tests
      const serverProcess = await this.startDevServer()
      
      // Run test suites in sequence
      await this.runTestSuite('LITE-043', 'End-to-End Workflow Tests', 'e2e/week4-stabilization-e2e.spec.ts')
      await this.runTestSuite('LITE-044', 'Data Integrity Tests', '__tests__/data-integrity-verification.test.ts')
      await this.runTestSuite('LITE-045', 'Calculation Accuracy Tests', '__tests__/calculation-accuracy.test.ts')
      await this.runTestSuite('LITE-046', 'Performance Benchmarks', 'e2e/performance-benchmarks.spec.ts')
      
      if (this.options.full) {
        await this.runTestSuite('LITE-047', 'Stress Testing', '__tests__/stress-testing.test.ts')
      }
      
      // Stop development server
      if (serverProcess) {
        serverProcess.kill()
      }
      
      // Generate reports
      await this.generateReports()
      
    } catch (error) {
      // console.error('❌ Test suite execution failed:', error.message)
      process.exit(1)
    }
  }

  async killExistingServers() {
    // console.log('🔄 Killing existing development servers...')
    try {
      execSync('npm run port:kill', { stdio: 'ignore' })
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for cleanup
    } catch (error) {
      // console.log('No existing servers to kill')
    }
  }

  async startDevServer() {
    if (this.options.ci) {
      // console.log('ℹ️  CI mode: Assuming server is already running')
      return null
    }

    // console.log('🚀 Starting development server...')
    
    const serverProcess = spawn('npm', ['run', 'dev:safe'], {
      detached: false,
      stdio: 'pipe'
    })
    
    // Wait for server to be ready
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server startup timeout'))
      }, 30000) // 30 second timeout
      
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Ready') || output.includes('localhost:3000')) {
          clearTimeout(timeout)
          // console.log('✅ Development server started')
          resolve(serverProcess)
        }
      })
      
      serverProcess.stderr.on('data', (data) => {
        const error = data.toString()
        if (error.includes('Error') && !error.includes('warning')) {
          clearTimeout(timeout)
          reject(new Error(`Server startup failed: ${error}`))
        }
      })
    })
  }

  async runTestSuite(id, name, testPath) {
    // console.log(`\n📋 Running ${id}: ${name}`)
    // console.log('-'.repeat(50))
    
    const suiteResult = {
      id,
      name,
      testPath,
      startTime: new Date(),
      endTime: null,
      status: 'running',
      tests: [],
      performance: {},
      issues: []
    }
    
    try {
      let command
      let args
      
      if (testPath.includes('e2e/')) {
        // Playwright E2E tests
        command = 'npx'
        args = ['playwright', 'test', testPath, '--reporter=json']
      } else {
        // Jest unit tests
        command = 'npx'
        args = ['jest', testPath, '--json', '--coverage', '--detectOpenHandles']
      }
      
      const result = execSync(`${command} ${args.join(' ')}`, {
        encoding: 'utf-8',
        timeout: TEST_CONFIG.timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      })
      
      // Parse test results
      this.parseTestResults(result, suiteResult)
      
      suiteResult.status = 'passed'
      // console.log(`✅ ${name} completed successfully`)
      
    } catch (error) {
      suiteResult.status = 'failed'
      suiteResult.error = error.message
      suiteResult.issues.push({
        type: 'error',
        message: error.message,
        details: error.stdout || error.stderr || ''
      })
      
      // console.log(`❌ ${name} failed:`, error.message)
      
      // Continue with other tests unless critical failure
      if (!this.isCriticalFailure(error)) {
        // console.log('⚠️  Continuing with remaining tests...')
      } else {
        throw error
      }
    } finally {
      suiteResult.endTime = new Date()
      suiteResult.duration = suiteResult.endTime - suiteResult.startTime
      this.results.testSuites.push(suiteResult)
      
      this.updateSummary(suiteResult)
    }
  }

  parseTestResults(output, suiteResult) {
    try {
      const result = JSON.parse(output)
      
      if (result.testResults) {
        // Jest results
        result.testResults.forEach(testFile => {
          testFile.assertionResults.forEach(test => {
            suiteResult.tests.push({
              name: test.title,
              status: test.status,
              duration: test.duration || 0,
              error: test.failureMessages?.[0] || null
            })
          })
        })
        
        // Extract performance metrics if available
        if (result.coverageMap) {
          suiteResult.coverage = this.calculateCoverage(result.coverageMap)
        }
      } else if (result.suites) {
        // Playwright results
        result.suites.forEach(suite => {
          suite.specs.forEach(spec => {
            spec.tests.forEach(test => {
              suiteResult.tests.push({
                name: test.title,
                status: test.outcome,
                duration: test.results?.[0]?.duration || 0,
                error: test.results?.[0]?.error || null
              })
            })
          })
        })
      }
    } catch (parseError) {
      // console.warn('Failed to parse test results as JSON, using raw output')
      suiteResult.rawOutput = output
    }
  }

  calculateCoverage(coverageMap) {
    let totalLines = 0
    let coveredLines = 0
    
    Object.values(coverageMap).forEach(fileCoverage => {
      const statements = fileCoverage.s || {}
      totalLines += Object.keys(statements).length
      coveredLines += Object.values(statements).filter(count => count > 0).length
    })
    
    return totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
  }

  updateSummary(suiteResult) {
    this.results.summary.total += suiteResult.tests.length
    this.results.summary.passed += suiteResult.tests.filter(t => t.status === 'passed').length
    this.results.summary.failed += suiteResult.tests.filter(t => t.status === 'failed').length
    this.results.summary.skipped += suiteResult.tests.filter(t => t.status === 'skipped').length
    this.results.summary.duration += suiteResult.duration || 0
    
    // Collect issues
    this.results.issues.push(...suiteResult.issues)
  }

  isCriticalFailure(error) {
    const criticalErrors = [
      'server startup failed',
      'database connection failed',
      'out of memory',
      'timeout'
    ]
    
    return criticalErrors.some(critical => 
      error.message.toLowerCase().includes(critical)
    )
  }

  async generateReports() {
    // console.log('\n📊 Generating test reports...')
    
    this.results.endTime = new Date()
    this.results.summary.passRate = (this.results.summary.passed / this.results.summary.total) * 100
    
    // Generate JSON report
    const jsonReport = JSON.stringify(this.results, null, 2)
    fs.writeFileSync(
      path.join(TEST_CONFIG.outputDir, 'results.json'),
      jsonReport
    )
    
    // Generate HTML report if requested
    if (this.options.report || this.options.full) {
      await this.generateHtmlReport()
    }
    
    // Generate console summary
    this.printSummary()
  }

  async generateHtmlReport() {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Week 4 Stabilization Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric h3 { margin: 0 0 10px 0; font-size: 24px; }
        .metric p { margin: 0; color: #666; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .test-suite { margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
        .suite-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .suite-content { padding: 15px; }
        .test { padding: 8px; border-bottom: 1px solid #eee; }
        .test:last-child { border-bottom: none; }
        .issues { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Week 4 Stabilization Test Report</h1>
        <p><strong>Generated:</strong> ${this.results.endTime.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${Math.round(this.results.summary.duration / 1000)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3 class="passed">${this.results.summary.passed}</h3>
            <p>Tests Passed</p>
        </div>
        <div class="metric">
            <h3 class="failed">${this.results.summary.failed}</h3>
            <p>Tests Failed</p>
        </div>
        <div class="metric">
            <h3>${this.results.summary.total}</h3>
            <p>Total Tests</p>
        </div>
        <div class="metric">
            <h3 class="${this.results.summary.passRate >= PERFORMANCE_THRESHOLDS.passRate ? 'passed' : 'failed'}">
                ${this.results.summary.passRate.toFixed(1)}%
            </h3>
            <p>Pass Rate</p>
        </div>
    </div>
    
    ${this.results.issues.length > 0 ? `
    <div class="issues">
        <h3>⚠️ Issues Found</h3>
        ${this.results.issues.map(issue => `
            <div class="issue">
                <strong>${issue.type}:</strong> ${issue.message}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    <h2>Test Suites</h2>
    ${this.results.testSuites.map(suite => `
        <div class="test-suite">
            <div class="suite-header">
                <h3>${suite.id}: ${suite.name} 
                    <span class="${suite.status === 'passed' ? 'passed' : 'failed'}">
                        ${suite.status.toUpperCase()}
                    </span>
                </h3>
                <p>Duration: ${Math.round((suite.duration || 0) / 1000)}s | Tests: ${suite.tests.length}</p>
            </div>
            <div class="suite-content">
                ${suite.tests.map(test => `
                    <div class="test">
                        <strong class="${test.status === 'passed' ? 'passed' : 'failed'}">${test.status.toUpperCase()}</strong>
                        ${test.name} 
                        ${test.duration ? `(${test.duration}ms)` : ''}
                        ${test.error ? `<br><small style="color: #dc3545;">${test.error}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Income Clarity - Week 4 Stabilization Testing</p>
        <p>Generated by automated test runner</p>
    </div>
</body>
</html>
    `
    
    fs.writeFileSync(
      path.join(TEST_CONFIG.outputDir, TEST_CONFIG.reportFile),
      htmlTemplate
    )
    
    // console.log(`📄 HTML report generated: ${path.join(TEST_CONFIG.outputDir, TEST_CONFIG.reportFile)}`)
  }

  printSummary() {
    // console.log('\n' + '='.repeat(60))
    // console.log('📊 WEEK 4 STABILIZATION TEST SUMMARY')
    // console.log('='.repeat(60))
    
    // console.log(`🎯 Test Results:`)
    // console.log(`   Total Tests: ${this.results.summary.total}`)
    // console.log(`   ✅ Passed: ${this.results.summary.passed}`)
    // console.log(`   ❌ Failed: ${this.results.summary.failed}`)
    // console.log(`   ⏭️  Skipped: ${this.results.summary.skipped}`)
    // console.log(`   📊 Pass Rate: ${this.results.summary.passRate.toFixed(1)}%`)
    
    // console.log(`\n⏱️  Performance:`)
    // console.log(`   Total Duration: ${Math.round(this.results.summary.duration / 1000)}s`)
    
    // Status determination
    const isSuccess = this.results.summary.passRate >= PERFORMANCE_THRESHOLDS.passRate && 
                     this.results.summary.failed === 0
    
    if (isSuccess) {
      // console.log('\n🎉 Week 4 Stabilization Tests: PASSED')
      // console.log('✅ System is ready for production deployment')
    } else {
      // console.log('\n⚠️  Week 4 Stabilization Tests: NEEDS ATTENTION')
      // console.log('❌ Issues found that should be addressed before deployment')
    }
    
    if (this.results.issues.length > 0) {
      // console.log(`\n🚨 Issues to Address (${this.results.issues.length}):`)
      this.results.issues.slice(0, 5).forEach(issue => {
        // console.log(`   • ${issue.type}: ${issue.message}`)
      })
      if (this.results.issues.length > 5) {
        // console.log(`   • ... and ${this.results.issues.length - 5} more (see full report)`)
      }
    }
    
    // console.log('\n' + '='.repeat(60))
    
    // Exit with appropriate code
    process.exit(isSuccess ? 0 : 1)
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    full: args.includes('--full'),
    quick: args.includes('--quick'),
    report: args.includes('--report'),
    ci: args.includes('--ci')
  }
  
  if (args.includes('--help')) {
    // console.log(`
Week 4 Stabilization Test Runner

Usage: node scripts/run-week4-stabilization-tests.js [options]

Options:
  --full      Run all tests including stress tests
  --quick     Run only essential tests (default)  
  --report    Generate detailed HTML report
  --ci        Run in CI mode with machine-readable output
  --help      Show this help message

Examples:
  node scripts/run-week4-stabilization-tests.js --full --report
  node scripts/run-week4-stabilization-tests.js --quick
  node scripts/run-week4-stabilization-tests.js --ci
    `)
    process.exit(0)
  }
  
  return options
}

// Main execution
if (require.main === module) {
  const options = parseArgs()
  const runner = new StabilizationTestRunner(options)
  
  runner.runAllTests().catch(error => {
    // console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = StabilizationTestRunner