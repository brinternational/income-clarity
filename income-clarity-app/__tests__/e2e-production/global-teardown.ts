/**
 * Production-Only E2E Global Teardown
 * 
 * RESPONSIBILITIES:
 * 1. Generate comprehensive test reports with visual evidence
 * 2. Compile console error summaries
 * 3. Create performance benchmarking reports
 * 4. Clean up test artifacts
 * 5. Provide actionable quality recommendations
 */

import { FullConfig } from '@playwright/test'
import { TestReportGenerator } from './utils/test-report-generator'
import { ScreenshotManager } from './utils/screenshot-manager'
import { ConsoleErrorMonitor } from './utils/console-error-monitor'
import { PerformanceBenchmarker } from './utils/performance-benchmarker'
import fs from 'fs/promises'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🏁 PRODUCTION E2E TESTING FRAMEWORK TEARDOWN')
  console.log('━'.repeat(80))
  
  try {
    // Step 1: Generate Comprehensive Test Report
    console.log('📊 Step 1: Generating Comprehensive Test Report')
    const reportGenerator = new TestReportGenerator()
    const testReport = await reportGenerator.generateProductionReport()
    console.log('✅ Comprehensive test report generated')
    
    // Step 2: Compile Screenshot Evidence
    console.log('📸 Step 2: Compiling Screenshot Evidence')
    const screenshotManager = new ScreenshotManager()
    const screenshotSummary = await screenshotManager.compileEvidence()
    console.log(`✅ Screenshot evidence compiled: ${screenshotSummary.totalScreenshots} screenshots`)
    
    // Step 3: Console Error Summary
    console.log('🖥️ Step 3: Console Error Analysis')
    const consoleMonitor = new ConsoleErrorMonitor()
    const errorSummary = await consoleMonitor.generateErrorReport()
    
    if (errorSummary.criticalErrors > 0) {
      console.log(`❌ CRITICAL: ${errorSummary.criticalErrors} JavaScript errors detected`)
      console.log('⚠️ Test suite should be considered FAILED due to console errors')
    } else {
      console.log('✅ Zero console errors detected - Clean JavaScript execution')
    }
    
    // Step 4: Performance Benchmarking Summary
    console.log('⚡ Step 4: Performance Benchmarking Summary')
    const performanceBenchmarker = new PerformanceBenchmarker()
    const performanceReport = await performanceBenchmarker.generateReport()
    console.log(`✅ Performance report: Avg load time ${performanceReport.averageLoadTime}ms`)
    
    // Step 5: Generate Combined Quality Report
    console.log('📋 Step 5: Generating Combined Quality Report')
    const qualityReport = {
      timestamp: new Date().toISOString(),
      environment: 'https://incomeclarity.ddns.net',
      summary: {
        testsRun: testReport.totalTests,
        testsPassed: testReport.passedTests,
        testsFailed: testReport.failedTests,
        screenshotsCaptured: screenshotSummary.totalScreenshots,
        consoleErrors: errorSummary.criticalErrors,
        averageLoadTime: performanceReport.averageLoadTime,
        overallQualityScore: calculateQualityScore(testReport, errorSummary, performanceReport)
      },
      detailedResults: {
        testExecution: testReport,
        visualEvidence: screenshotSummary,
        consoleHealth: errorSummary,
        performanceMetrics: performanceReport
      },
      qualityGate: {
        passed: testReport.failedTests === 0 && errorSummary.criticalErrors === 0,
        recommendations: generateQualityRecommendations(testReport, errorSummary, performanceReport)
      }
    }
    
    // Save quality report
    const reportPath = path.join(process.cwd(), 'playwright-production-report', 'quality-report.json')
    await fs.writeFile(reportPath, JSON.stringify(qualityReport, null, 2))
    
    // Step 6: Output Final Quality Assessment
    console.log('━'.repeat(80))
    console.log('🎯 FINAL QUALITY ASSESSMENT')
    console.log(`📊 Overall Quality Score: ${qualityReport.summary.overallQualityScore}/100`)
    console.log(`✅ Tests Passed: ${qualityReport.summary.testsPassed}/${qualityReport.summary.testsRun}`)
    console.log(`🖥️ Console Errors: ${qualityReport.summary.consoleErrors}`)
    console.log(`⚡ Avg Load Time: ${qualityReport.summary.averageLoadTime}ms`)
    console.log(`📸 Visual Evidence: ${qualityReport.summary.screenshotsCaptured} screenshots`)
    
    if (qualityReport.qualityGate.passed) {
      console.log('✅ QUALITY GATE: PASSED - Production ready!')
    } else {
      console.log('❌ QUALITY GATE: FAILED - Issues detected')
      console.log('📋 Recommendations:')
      qualityReport.qualityGate.recommendations.forEach(rec => {
        console.log(`   • ${rec}`)
      })
    }
    
    console.log('━'.repeat(80))
    console.log(`📄 Full report: ${reportPath}`)
    console.log('🏁 Production E2E Testing Framework teardown complete')
    
  } catch (error) {
    console.error('❌ Error during teardown:', error.message)
    throw error
  }
}

function calculateQualityScore(testReport: any, errorSummary: any, performanceReport: any): number {
  let score = 100
  
  // Deduct for failed tests (20 points per failed test, max 60 points)
  score -= Math.min(testReport.failedTests * 20, 60)
  
  // Deduct for console errors (15 points per error, max 30 points)
  score -= Math.min(errorSummary.criticalErrors * 15, 30)
  
  // Deduct for slow performance (1 point per 100ms over 2000ms, max 10 points)
  const slowPerformancePenalty = Math.max(0, Math.floor((performanceReport.averageLoadTime - 2000) / 100))
  score -= Math.min(slowPerformancePenalty, 10)
  
  return Math.max(0, score)
}

function generateQualityRecommendations(testReport: any, errorSummary: any, performanceReport: any): string[] {
  const recommendations = []
  
  if (testReport.failedTests > 0) {
    recommendations.push(`Fix ${testReport.failedTests} failed test(s) before production deployment`)
  }
  
  if (errorSummary.criticalErrors > 0) {
    recommendations.push(`Resolve ${errorSummary.criticalErrors} JavaScript console error(s)`)
  }
  
  if (performanceReport.averageLoadTime > 3000) {
    recommendations.push(`Improve page load performance (current: ${performanceReport.averageLoadTime}ms, target: <3000ms)`)
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All quality gates passed - ready for production deployment!')
  }
  
  return recommendations
}

export default globalTeardown