/**
 * Test Report Generator for Production E2E Testing
 * 
 * RESPONSIBILITIES:
 * - Aggregate all test results from multiple sources
 * - Generate comprehensive quality assessment reports
 * - Provide actionable insights and recommendations
 * - Create executive summaries for stakeholders
 * - Track testing progress and coverage metrics
 */

import fs from 'fs/promises'
import path from 'path'

export interface TestResult {
  testName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  retries: number
  browser: string
  device: string
}

export interface TestSuite {
  name: string
  tests: TestResult[]
  duration: number
  passed: number
  failed: number
  skipped: number
}

export interface ComprehensiveTestReport {
  timestamp: string
  environment: string
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    skippedTests: number
    totalDuration: number
    passRate: number
  }
  suiteBreakdown: TestSuite[]
  browserCoverage: Record<string, { passed: number; failed: number }>
  deviceCoverage: Record<string, { passed: number; failed: number }>
  criticalFailures: TestResult[]
  qualityGateStatus: 'PASSED' | 'FAILED'
  recommendations: string[]
}

export class TestReportGenerator {
  private readonly reportDir = path.join(process.cwd(), 'playwright-production-report')
  private testResults: TestResult[] = []
  private testSuites: TestSuite[] = []

  /**
   * Generate comprehensive production test report
   */
  async generateProductionReport(): Promise<ComprehensiveTestReport> {
    console.log('📊 Generating comprehensive production test report...')
    
    try {
      // Load test results from Playwright JSON reports
      await this.loadPlaywrightResults()
      
      // Generate summary statistics
      const summary = this.generateSummaryStatistics()
      
      // Analyze browser and device coverage
      const browserCoverage = this.analyzeBrowserCoverage()
      const deviceCoverage = this.analyzeDeviceCoverage()
      
      // Identify critical failures
      const criticalFailures = this.identifyCriticalFailures()
      
      // Determine quality gate status
      const qualityGateStatus = this.evaluateQualityGate(summary, criticalFailures)
      
      // Generate actionable recommendations
      const recommendations = this.generateRecommendations(summary, criticalFailures)
      
      const report: ComprehensiveTestReport = {
        timestamp: new Date().toISOString(),
        environment: 'https://incomeclarity.ddns.net',
        summary,
        suiteBreakdown: this.testSuites,
        browserCoverage,
        deviceCoverage,
        criticalFailures,
        qualityGateStatus,
        recommendations
      }
      
      // Save comprehensive report
      await this.saveReport(report)
      
      console.log(`✅ Comprehensive test report generated: ${summary.totalTests} tests`)
      return report
      
    } catch (error) {
      console.error('❌ Test report generation failed:', error.message)
      throw error
    }
  }

  /**
   * Load test results from Playwright JSON reports
   */
  private async loadPlaywrightResults(): Promise<void> {
    try {
      const resultsPath = path.join(this.reportDir, 'results.json')
      
      // Check if results file exists
      try {
        await fs.access(resultsPath)
      } catch {
        console.warn('⚠️ No Playwright results found, using empty dataset')
        return
      }
      
      const resultsData = await fs.readFile(resultsPath, 'utf-8')
      const playwrightReport = JSON.parse(resultsData)
      
      // Parse Playwright test results format
      if (playwrightReport.suites) {
        for (const suite of playwrightReport.suites) {
          const testSuite: TestSuite = {
            name: suite.title || 'Unknown Suite',
            tests: [],
            duration: 0,
            passed: 0,
            failed: 0,
            skipped: 0
          }
          
          if (suite.specs) {
            for (const spec of suite.specs) {
              for (const test of spec.tests || []) {
                const testResult: TestResult = {
                  testName: test.title || spec.title || 'Unknown Test',
                  status: this.mapPlaywrightStatus(test.status),
                  duration: test.duration || 0,
                  error: test.error?.message,
                  retries: test.results?.length - 1 || 0,
                  browser: this.extractBrowser(test.projectName),
                  device: this.extractDevice(test.projectName)
                }
                
                testSuite.tests.push(testResult)
                testSuite.duration += testResult.duration
                
                switch (testResult.status) {
                  case 'passed': testSuite.passed++; break
                  case 'failed': testSuite.failed++; break
                  case 'skipped': testSuite.skipped++; break
                }
              }
            }
          }
          
          this.testSuites.push(testSuite)
          this.testResults.push(...testSuite.tests)
        }
      }
      
      console.log(`📊 Loaded ${this.testResults.length} test results from ${this.testSuites.length} suites`)
      
    } catch (error) {
      console.error('❌ Failed to load Playwright results:', error.message)
      // Continue with empty dataset rather than failing
    }
  }

  /**
   * Generate summary statistics
   */
  private generateSummaryStatistics(): ComprehensiveTestReport['summary'] {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(t => t.status === 'passed').length
    const failedTests = this.testResults.filter(t => t.status === 'failed').length
    const skippedTests = this.testResults.filter(t => t.status === 'skipped').length
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0)
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    
    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      passRate
    }
  }

  /**
   * Analyze browser coverage
   */
  private analyzeBrowserCoverage(): Record<string, { passed: number; failed: number }> {
    const coverage: Record<string, { passed: number; failed: number }> = {}
    
    for (const test of this.testResults) {
      if (!coverage[test.browser]) {
        coverage[test.browser] = { passed: 0, failed: 0 }
      }
      
      if (test.status === 'passed') {
        coverage[test.browser].passed++
      } else if (test.status === 'failed') {
        coverage[test.browser].failed++
      }
    }
    
    return coverage
  }

  /**
   * Analyze device coverage
   */
  private analyzeDeviceCoverage(): Record<string, { passed: number; failed: number }> {
    const coverage: Record<string, { passed: number; failed: number }> = {}
    
    for (const test of this.testResults) {
      if (!coverage[test.device]) {
        coverage[test.device] = { passed: 0, failed: 0 }
      }
      
      if (test.status === 'passed') {
        coverage[test.device].passed++
      } else if (test.status === 'failed') {
        coverage[test.device].failed++
      }
    }
    
    return coverage
  }

  /**
   * Identify critical failures
   */
  private identifyCriticalFailures(): TestResult[] {
    return this.testResults.filter(test => 
      test.status === 'failed' && this.isCriticalTest(test.testName)
    )
  }

  /**
   * Determine if a test is critical
   */
  private isCriticalTest(testName: string): boolean {
    const criticalPatterns = [
      /authentication/i,
      /login/i,
      /logout/i,
      /critical/i,
      /production/i,
      /console.*error/i,
      /navigation/i
    ]
    
    return criticalPatterns.some(pattern => pattern.test(testName))
  }

  /**
   * Evaluate quality gate status
   */
  private evaluateQualityGate(
    summary: ComprehensiveTestReport['summary'], 
    criticalFailures: TestResult[]
  ): 'PASSED' | 'FAILED' {
    // Quality gate criteria:
    // 1. No critical test failures
    // 2. Pass rate >= 95%
    // 3. No tests with excessive retries (>3)
    
    if (criticalFailures.length > 0) {
      console.log(`❌ Quality Gate: FAILED - ${criticalFailures.length} critical failures`)
      return 'FAILED'
    }
    
    if (summary.passRate < 95) {
      console.log(`❌ Quality Gate: FAILED - Pass rate ${summary.passRate}% < 95%`)
      return 'FAILED'
    }
    
    const excessiveRetries = this.testResults.filter(t => t.retries > 3)
    if (excessiveRetries.length > 0) {
      console.log(`❌ Quality Gate: FAILED - ${excessiveRetries.length} tests with excessive retries`)
      return 'FAILED'
    }
    
    console.log('✅ Quality Gate: PASSED - All criteria met')
    return 'PASSED'
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    summary: ComprehensiveTestReport['summary'], 
    criticalFailures: TestResult[]
  ): string[] {
    const recommendations: string[] = []
    
    if (criticalFailures.length > 0) {
      recommendations.push(`Fix ${criticalFailures.length} critical test failure(s) before production deployment`)
      
      // Specific recommendations for common failures
      for (const failure of criticalFailures) {
        if (failure.testName.includes('authentication')) {
          recommendations.push('Review authentication system - login/logout functionality may be broken')
        }
        if (failure.testName.includes('console')) {
          recommendations.push('Resolve JavaScript console errors - check browser developer tools')
        }
        if (failure.testName.includes('navigation')) {
          recommendations.push('Verify navigation functionality - user journey may be interrupted')
        }
      }
    }
    
    if (summary.passRate < 95) {
      recommendations.push(`Improve test pass rate from ${summary.passRate}% to at least 95%`)
    }
    
    if (summary.failedTests > 0 && criticalFailures.length === 0) {
      recommendations.push('Address non-critical test failures to improve overall stability')
    }
    
    const slowTests = this.testResults.filter(t => t.duration > 30000) // 30 seconds
    if (slowTests.length > 0) {
      recommendations.push(`Optimize ${slowTests.length} slow-running tests (>30s) to improve test execution time`)
    }
    
    // Browser-specific recommendations
    const browserCoverage = this.analyzeBrowserCoverage()
    for (const [browser, stats] of Object.entries(browserCoverage)) {
      const browserPassRate = (stats.passed / (stats.passed + stats.failed)) * 100
      if (browserPassRate < 90) {
        recommendations.push(`Investigate ${browser} compatibility issues (${browserPassRate.toFixed(1)}% pass rate)`)
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All tests passing - ready for production deployment!')
    }
    
    return recommendations
  }

  /**
   * Save comprehensive report
   */
  private async saveReport(report: ComprehensiveTestReport): Promise<void> {
    // Save JSON report
    const jsonPath = path.join(this.reportDir, 'comprehensive-test-report.json')
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2))
    
    // Generate and save HTML report
    const htmlPath = await this.generateHTMLReport(report)
    
    console.log(`📄 Reports saved:`)
    console.log(`   • JSON: ${jsonPath}`)
    console.log(`   • HTML: ${htmlPath}`)
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(report: ComprehensiveTestReport): Promise<string> {
    const htmlPath = path.join(this.reportDir, 'comprehensive-test-report.html')
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production E2E Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: white; border: 2px solid #e9ecef; border-radius: 10px; padding: 20px; text-align: center; }
        .quality-gate-passed { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .quality-gate-failed { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .test-suite { border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0; overflow: hidden; }
        .suite-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #dee2e6; }
        .test-item { padding: 10px 15px; border-bottom: 1px solid #f0f0f0; }
        .test-passed { border-left: 4px solid #28a745; }
        .test-failed { border-left: 4px solid #dc3545; }
        .test-skipped { border-left: 4px solid #6c757d; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .critical-failures { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .coverage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .coverage-card { background: #f8f9fa; border-radius: 8px; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏭 Production E2E Test Report</h1>
        <p>Environment: ${report.environment}</p>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        <div class="summary-grid">
            <div class="summary-card">
                <h3>${report.summary.totalTests}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #28a745;">${report.summary.passedTests}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #dc3545;">${report.summary.failedTests}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card">
                <h3>${report.summary.passRate}%</h3>
                <p>Pass Rate</p>
            </div>
        </div>
    </div>

    <div class="summary-card quality-gate-${report.qualityGateStatus.toLowerCase()}">
        <h2>🚦 Quality Gate: ${report.qualityGateStatus}</h2>
        ${report.qualityGateStatus === 'PASSED' ? 
          '<p>All quality criteria met - ready for production!</p>' :
          '<p>Quality issues detected - review required before production deployment</p>'
        }
    </div>

    ${report.criticalFailures.length > 0 ? this.generateCriticalFailuresHTML(report.criticalFailures) : ''}

    <div class="recommendations">
        <h2>📋 Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <h2>📊 Coverage Analysis</h2>
    <div class="coverage-grid">
        <div class="coverage-card">
            <h3>Browser Coverage</h3>
            ${this.generateCoverageHTML(report.browserCoverage)}
        </div>
        <div class="coverage-card">
            <h3>Device Coverage</h3>
            ${this.generateCoverageHTML(report.deviceCoverage)}
        </div>
    </div>

    <h2>🧪 Test Suite Breakdown</h2>
    ${report.suiteBreakdown.map(suite => this.generateSuiteHTML(suite)).join('')}
</body>
</html>`
    
    await fs.writeFile(htmlPath, html)
    return htmlPath
  }

  private generateCriticalFailuresHTML(failures: TestResult[]): string {
    return `
    <div class="critical-failures">
        <h2>🚨 Critical Failures (${failures.length})</h2>
        ${failures.map(failure => `
            <div class="test-item test-failed">
                <strong>${failure.testName}</strong>
                <p><strong>Browser:</strong> ${failure.browser} | <strong>Device:</strong> ${failure.device}</p>
                ${failure.error ? `<p><strong>Error:</strong> ${failure.error}</p>` : ''}
            </div>
        `).join('')}
    </div>`
  }

  private generateCoverageHTML(coverage: Record<string, { passed: number; failed: number }>): string {
    return Object.entries(coverage).map(([name, stats]) => {
      const total = stats.passed + stats.failed
      const passRate = total > 0 ? Math.round((stats.passed / total) * 100) : 0
      return `
        <div style="margin: 10px 0;">
            <strong>${name}:</strong> ${stats.passed}/${total} (${passRate}%)
            <div style="background: #e9ecef; border-radius: 10px; overflow: hidden; height: 10px; margin-top: 5px;">
                <div style="background: ${passRate >= 90 ? '#28a745' : passRate >= 70 ? '#ffc107' : '#dc3545'}; height: 100%; width: ${passRate}%;"></div>
            </div>
        </div>
      `
    }).join('')
  }

  private generateSuiteHTML(suite: TestSuite): string {
    return `
    <div class="test-suite">
        <div class="suite-header">
            <h3>${suite.name}</h3>
            <p>Duration: ${Math.round(suite.duration / 1000)}s | Passed: ${suite.passed} | Failed: ${suite.failed} | Skipped: ${suite.skipped}</p>
        </div>
        ${suite.tests.map(test => `
            <div class="test-item test-${test.status}">
                <strong>${test.testName}</strong>
                <span style="float: right;">${Math.round(test.duration / 1000)}s</span>
                <br>
                <small>${test.browser} • ${test.device}${test.retries > 0 ? ` • ${test.retries} retries` : ''}</small>
                ${test.error ? `<br><small style="color: #dc3545;">${test.error}</small>` : ''}
            </div>
        `).join('')}
    </div>`
  }

  private mapPlaywrightStatus(status: string): 'passed' | 'failed' | 'skipped' {
    switch (status) {
      case 'passed': return 'passed'
      case 'failed': return 'failed'
      case 'timedOut': return 'failed'
      case 'interrupted': return 'failed'
      default: return 'skipped'
    }
  }

  private extractBrowser(projectName: string = ''): string {
    if (projectName.includes('chromium')) return 'Chromium'
    if (projectName.includes('firefox')) return 'Firefox'
    if (projectName.includes('webkit')) return 'WebKit'
    if (projectName.includes('chrome')) return 'Chrome'
    if (projectName.includes('edge')) return 'Edge'
    return 'Unknown'
  }

  private extractDevice(projectName: string = ''): string {
    if (projectName.includes('mobile')) return 'Mobile'
    if (projectName.includes('tablet')) return 'Tablet'
    return 'Desktop'
  }

  getTotalTests(): number {
    return this.testResults.length
  }

  getPassedTests(): number {
    return this.testResults.filter(t => t.status === 'passed').length
  }

  getFailedTests(): number {
    return this.testResults.filter(t => t.status === 'failed').length
  }
}