/**
 * Production E2E Custom Reporter
 * 
 * RESPONSIBILITIES:
 * - Real-time test execution monitoring
 * - Screenshot capture integration
 * - Console error detection and reporting  
 * - Performance metrics collection
 * - Live quality gate evaluation
 */

import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter'
import { ScreenshotManager } from '../../__tests__/e2e-production/utils/screenshot-manager'
import { ConsoleErrorMonitor } from '../../__tests__/e2e-production/utils/console-error-monitor'
import { PerformanceBenchmarker } from '../../__tests__/e2e-production/utils/performance-benchmarker'

export class ProductionE2EReporter implements Reporter {
  private screenshotManager: ScreenshotManager
  private consoleMonitor: ConsoleErrorMonitor  
  private performanceBenchmarker: PerformanceBenchmarker
  private startTime: number = 0
  private testCount = 0
  private passedCount = 0
  private failedCount = 0
  private criticalFailures: Array<{ testName: string; error: string }> = []

  constructor() {
    this.screenshotManager = new ScreenshotManager()
    this.consoleMonitor = new ConsoleErrorMonitor()
    this.performanceBenchmarker = new PerformanceBenchmarker()
  }

  async onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now()
    
    console.log('🚀 PRODUCTION E2E TESTING STARTED')
    console.log('━'.repeat(80))
    console.log(`📍 Target Environment: https://incomeclarity.ddns.net`)
    console.log(`🖥️ Browser Projects: ${config.projects.length}`)
    console.log(`🧪 Total Tests: ${suite.allTests().length}`)
    console.log(`⚡ Zero Console Error Policy: ACTIVE`)
    console.log(`📸 Screenshot Evidence: ENABLED`)
    console.log(`🎯 Quality Gate: MONITORING`)
    console.log('━'.repeat(80))
    
    // Initialize monitoring systems
    await this.screenshotManager.initialize()
    await this.consoleMonitor.initialize()
    await this.performanceBenchmarker.initialize()
  }

  onTestBegin(test: TestCase, result: TestResult) {
    const projectName = result.workerIndex !== undefined ? `[${test.parent.project()?.name || 'unknown'}]` : ''
    console.log(`🧪 STARTING: ${projectName} ${test.title}`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testCount++
    const duration = result.duration
    const status = result.status
    const projectName = result.workerIndex !== undefined ? `[${test.parent.project()?.name || 'unknown'}]` : ''
    
    // Update counters
    if (status === 'passed') {
      this.passedCount++
      console.log(`✅ PASSED: ${projectName} ${test.title} (${Math.round(duration)}ms)`)
    } else if (status === 'failed') {
      this.failedCount++
      const error = result.error?.message || 'Unknown error'
      
      // Check if this is a critical failure
      if (this.isCriticalTest(test.title)) {
        this.criticalFailures.push({
          testName: `${projectName} ${test.title}`,
          error: error.substring(0, 200) + (error.length > 200 ? '...' : '')
        })
        console.log(`🚨 CRITICAL FAILURE: ${projectName} ${test.title}`)
      } else {
        console.log(`❌ FAILED: ${projectName} ${test.title}`)
      }
      
      console.log(`   Error: ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`)
      console.log(`   Duration: ${Math.round(duration)}ms`)
      console.log(`   Retries: ${result.retry}`)
    } else {
      console.log(`⏭️ SKIPPED: ${projectName} ${test.title}`)
    }
    
    // Real-time quality gate check
    this.checkQualityGateStatus()
  }

  onStepBegin(test: TestCase, result: TestResult, step: any) {
    // Log important test steps for visibility
    if (step.title.includes('screenshot') || step.title.includes('navigate') || step.title.includes('authenticate')) {
      console.log(`   📝 Step: ${step.title}`)
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: any) {
    // Log step completion for critical steps
    if (step.error) {
      console.log(`   ❌ Step Failed: ${step.title} - ${step.error.message}`)
    }
  }

  async onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime
    const passRate = this.testCount > 0 ? Math.round((this.passedCount / this.testCount) * 100) : 0
    
    console.log('━'.repeat(80))
    console.log('🏁 PRODUCTION E2E TESTING COMPLETE')
    console.log('━'.repeat(80))
    
    // Test Execution Summary
    console.log('📊 EXECUTION SUMMARY:')
    console.log(`   ⏱️ Total Duration: ${Math.round(duration / 1000)}s`)
    console.log(`   🧪 Total Tests: ${this.testCount}`)
    console.log(`   ✅ Passed: ${this.passedCount}`)
    console.log(`   ❌ Failed: ${this.failedCount}`)
    console.log(`   📈 Pass Rate: ${passRate}%`)
    
    // Console Error Summary
    const errorSummary = this.consoleMonitor.getErrorCount()
    console.log('')
    console.log('🖥️ CONSOLE ERROR SUMMARY:')
    console.log(`   🚨 Critical Errors: ${errorSummary.critical}`)
    console.log(`   ⚠️ High Priority: ${errorSummary.high}`)
    console.log(`   📝 Medium Priority: ${errorSummary.medium}`)
    console.log(`   ℹ️ Low Priority: ${errorSummary.low}`)
    console.log(`   📊 Total Console Issues: ${errorSummary.total}`)
    
    // Screenshot Summary
    const screenshotSummary = await this.screenshotManager.compileEvidence()
    console.log('')
    console.log('📸 VISUAL EVIDENCE SUMMARY:')
    console.log(`   📷 Screenshots Captured: ${screenshotSummary.totalScreenshots}`)
    console.log(`   📁 Evidence Report: ${screenshotSummary.evidenceReport}`)
    console.log(`   💾 Total File Size: ${screenshotSummary.totalFileSize}`)
    
    // Performance Summary
    const performanceReport = await this.performanceBenchmarker.generateReport()
    console.log('')
    console.log('⚡ PERFORMANCE SUMMARY:')
    console.log(`   ⏱️ Average Load Time: ${performanceReport.averageLoadTime}ms`)
    console.log(`   📊 Average Performance Score: ${performanceReport.averagePerformanceScore}/100`)
    console.log(`   📈 Total Performance Tests: ${performanceReport.totalTests}`)
    
    // Critical Failures
    if (this.criticalFailures.length > 0) {
      console.log('')
      console.log('🚨 CRITICAL FAILURES:')
      this.criticalFailures.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure.testName}`)
        console.log(`      Error: ${failure.error}`)
      })
    }
    
    // Final Quality Gate Assessment
    console.log('')
    console.log('🚦 FINAL QUALITY GATE ASSESSMENT:')
    const qualityGatePassed = this.evaluateFinalQualityGate(passRate, errorSummary)
    
    if (qualityGatePassed) {
      console.log('✅ QUALITY GATE: PASSED')
      console.log('🚀 Production deployment approved!')
    } else {
      console.log('❌ QUALITY GATE: FAILED')
      console.log('⚠️ Production deployment blocked - resolve issues before deployment')
    }
    
    // Recommendations
    const recommendations = this.generateRecommendations(passRate, errorSummary, this.criticalFailures)
    if (recommendations.length > 0) {
      console.log('')
      console.log('📋 RECOMMENDATIONS:')
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    }
    
    console.log('━'.repeat(80))
  }

  onError(error: Error) {
    console.error('🚨 REPORTER ERROR:', error.message)
    console.error(error.stack)
  }

  private isCriticalTest(testTitle: string): boolean {
    const criticalPatterns = [
      /authentication/i,
      /login/i,
      /logout/i,
      /console.*error/i,
      /navigation/i,
      /progressive.*disclosure/i,
      /production/i
    ]
    
    return criticalPatterns.some(pattern => pattern.test(testTitle))
  }

  private checkQualityGateStatus() {
    // Real-time quality gate monitoring
    if (this.criticalFailures.length > 0) {
      console.log(`⚠️ QUALITY GATE WARNING: ${this.criticalFailures.length} critical failure(s) detected`)
    }
    
    if (this.consoleMonitor.hasCriticalErrors()) {
      console.log('⚠️ QUALITY GATE WARNING: Critical console errors detected')
    }
    
    const currentPassRate = this.testCount > 0 ? Math.round((this.passedCount / this.testCount) * 100) : 100
    if (currentPassRate < 95 && this.testCount > 10) {
      console.log(`⚠️ QUALITY GATE WARNING: Pass rate ${currentPassRate}% below threshold (95%)`)
    }
  }

  private evaluateFinalQualityGate(passRate: number, errorSummary: any): boolean {
    // Final quality gate criteria:
    // 1. No critical test failures
    // 2. Pass rate >= 95%
    // 3. No critical console errors
    
    if (this.criticalFailures.length > 0) {
      console.log(`   ❌ Critical test failures: ${this.criticalFailures.length}`)
      return false
    }
    
    if (passRate < 95) {
      console.log(`   ❌ Pass rate below threshold: ${passRate}% (minimum: 95%)`)
      return false
    }
    
    if (errorSummary.critical > 0) {
      console.log(`   ❌ Critical console errors: ${errorSummary.critical}`)
      return false
    }
    
    console.log('   ✅ All quality gate criteria met')
    return true
  }

  private generateRecommendations(passRate: number, errorSummary: any, criticalFailures: Array<any>): string[] {
    const recommendations: string[] = []
    
    if (criticalFailures.length > 0) {
      recommendations.push(`Fix ${criticalFailures.length} critical test failure(s) - these block production deployment`)
      
      if (criticalFailures.some(f => f.testName.includes('authentication'))) {
        recommendations.push('Review authentication system - demo user login may be broken')
      }
      
      if (criticalFailures.some(f => f.testName.includes('console'))) {
        recommendations.push('Resolve JavaScript console errors - check browser developer tools')
      }
    }
    
    if (errorSummary.critical > 0) {
      recommendations.push(`Resolve ${errorSummary.critical} critical console error(s) - check browser console`)
    }
    
    if (passRate < 95) {
      recommendations.push(`Improve test pass rate from ${passRate}% to at least 95%`)
    }
    
    if (errorSummary.high > 5) {
      recommendations.push(`Address ${errorSummary.high} high-priority console warnings`)
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All quality checks passed - ready for production deployment!')
    }
    
    return recommendations
  }
}

export default ProductionE2EReporter