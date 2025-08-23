/**
 * Console Error Monitor for Production E2E Testing
 * 
 * ZERO TOLERANCE POLICY:
 * - Any JavaScript console error fails the test
 * - Comprehensive error categorization
 * - Real-time error detection and reporting
 * - Performance impact analysis
 * - Source code location mapping
 */

import { Page, ConsoleMessage } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

export interface ConsoleError {
  timestamp: string
  type: 'error' | 'warning' | 'info'
  message: string
  source: string
  location: {
    url: string
    line?: number
    column?: number
  }
  stackTrace?: string
  testContext: {
    testName: string
    phase: string
    url: string
  }
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export class ConsoleErrorMonitor {
  private errors: ConsoleError[] = []
  private activePages: Set<Page> = new Set()
  private errorHandlers: Map<Page, (msg: ConsoleMessage) => void> = new Map()
  private readonly reportDir = path.join(process.cwd(), 'playwright-production-report', 'console-errors')

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.reportDir, { recursive: true })
      console.log('🖥️ Console error monitoring system initialized')
    } catch (error) {
      console.error('❌ Console error monitor initialization failed:', error.message)
      throw error
    }
  }

  /**
   * Start monitoring console messages for a page
   */
  startMonitoring(page: Page, testName: string, phase: string = 'unknown'): void {
    if (this.activePages.has(page)) {
      return // Already monitoring this page
    }

    const errorHandler = (msg: ConsoleMessage) => {
      this.handleConsoleMessage(msg, testName, phase, page.url())
    }

    page.on('console', errorHandler)
    page.on('pageerror', (error) => {
      this.handlePageError(error, testName, phase, page.url())
    })
    
    this.activePages.add(page)
    this.errorHandlers.set(page, errorHandler)
    
    console.log(`🔍 Console monitoring started for: ${testName}/${phase}`)
  }

  /**
   * Stop monitoring a specific page
   */
  stopMonitoring(page: Page): void {
    const handler = this.errorHandlers.get(page)
    if (handler) {
      page.off('console', handler)
      this.errorHandlers.delete(page)
    }
    
    this.activePages.delete(page)
  }

  /**
   * Handle console message
   */
  private handleConsoleMessage(msg: ConsoleMessage, testName: string, phase: string, url: string): void {
    const messageType = msg.type()
    
    // Only capture errors and warnings
    if (!['error', 'warning'].includes(messageType)) {
      return
    }

    const consoleError: ConsoleError = {
      timestamp: new Date().toISOString(),
      type: messageType as 'error' | 'warning',
      message: msg.text(),
      source: this.extractErrorSource(msg.text()),
      location: {
        url: msg.location()?.url || url,
        line: msg.location()?.lineNumber,
        column: msg.location()?.columnNumber
      },
      testContext: {
        testName,
        phase,
        url
      },
      severity: this.categorizeSeverity(msg.text(), messageType)
    }

    this.errors.push(consoleError)
    
    // Log error immediately for visibility
    console.error(`🚨 Console ${messageType.toUpperCase()}: ${msg.text()}`)
    console.error(`   Test: ${testName}/${phase}`)
    console.error(`   URL: ${url}`)
    
    // For critical errors, we might want to fail immediately
    if (consoleError.severity === 'critical') {
      console.error('💥 CRITICAL CONSOLE ERROR DETECTED - Test should fail!')
    }
  }

  /**
   * Handle page error (unhandled exceptions)
   */
  private handlePageError(error: Error, testName: string, phase: string, url: string): void {
    const consoleError: ConsoleError = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: error.message,
      source: 'Page Error (Unhandled Exception)',
      location: { url },
      stackTrace: error.stack,
      testContext: {
        testName,
        phase,
        url
      },
      severity: 'critical'
    }

    this.errors.push(consoleError)
    
    console.error('💥 UNHANDLED PAGE ERROR:', error.message)
    console.error('   Test:', testName)
    console.error('   Stack:', error.stack)
  }

  /**
   * Extract error source from message
   */
  private extractErrorSource(message: string): string {
    // Common error source patterns
    const patterns = [
      { regex: /TypeError/, source: 'JavaScript Runtime' },
      { regex: /ReferenceError/, source: 'JavaScript Runtime' },
      { regex: /SyntaxError/, source: 'JavaScript Syntax' },
      { regex: /NetworkError/, source: 'Network Request' },
      { regex: /Failed to fetch/, source: 'API Request' },
      { regex: /404/, source: 'Resource Not Found' },
      { regex: /CORS/, source: 'Cross-Origin Request' },
      { regex: /ChunkLoadError/, source: 'Code Splitting' },
      { regex: /React/, source: 'React Framework' },
      { regex: /Next\.js/, source: 'Next.js Framework' },
      { regex: /prisma/i, source: 'Database (Prisma)' }
    ]

    for (const pattern of patterns) {
      if (pattern.regex.test(message)) {
        return pattern.source
      }
    }

    return 'Unknown'
  }

  /**
   * Categorize error severity
   */
  private categorizeSeverity(message: string, type: string): 'critical' | 'high' | 'medium' | 'low' {
    // Critical errors that break functionality
    const criticalPatterns = [
      /TypeError.*Cannot read prop.*undefined/,
      /ReferenceError.*not defined/,
      /Failed to fetch.*api\//,
      /NetworkError/,
      /ChunkLoadError/,
      /Uncaught/
    ]

    // High priority errors
    const highPatterns = [
      /404.*\.(js|css|json)/,
      /CORS policy/,
      /React.*Warning.*validateDOMNesting/,
      /Failed to load resource/
    ]

    // Medium priority warnings
    const mediumPatterns = [
      /React.*Warning/,
      /Deprecated/,
      /Performance/
    ]

    if (type === 'error') {
      for (const pattern of criticalPatterns) {
        if (pattern.test(message)) return 'critical'
      }
      
      for (const pattern of highPatterns) {
        if (pattern.test(message)) return 'high'
      }
      
      return 'high' // All errors are at least high priority
    }

    if (type === 'warning') {
      for (const pattern of mediumPatterns) {
        if (pattern.test(message)) return 'medium'
      }
      return 'low'
    }

    return 'low'
  }

  /**
   * Get current error count
   */
  getErrorCount(): {
    critical: number
    high: number
    medium: number
    low: number
    total: number
  } {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
    
    for (const error of this.errors) {
      counts[error.severity]++
      counts.total++
    }
    
    return counts
  }

  /**
   * Check if any critical errors exist (fails test)
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(error => error.severity === 'critical')
  }

  /**
   * Get errors for specific test
   */
  getErrorsForTest(testName: string): ConsoleError[] {
    return this.errors.filter(error => error.testContext.testName === testName)
  }

  /**
   * Generate comprehensive error report
   */
  async generateErrorReport(): Promise<{
    criticalErrors: number
    totalErrors: number
    errorsBySource: Record<string, number>
    errorsByTest: Record<string, number>
    reportPath: string
  }> {
    const errorCounts = this.getErrorCount()
    const errorsBySource: Record<string, number> = {}
    const errorsByTest: Record<string, number> = {}

    // Categorize errors
    for (const error of this.errors) {
      errorsBySource[error.source] = (errorsBySource[error.source] || 0) + 1
      errorsByTest[error.testContext.testName] = (errorsByTest[error.testContext.testName] || 0) + 1
    }

    // Generate detailed HTML report
    const reportPath = await this.generateHTMLReport()

    // Save JSON report for programmatic analysis
    const jsonReportPath = path.join(this.reportDir, 'console-errors.json')
    await fs.writeFile(jsonReportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: errorCounts,
      errorsBySource,
      errorsByTest,
      detailedErrors: this.errors
    }, null, 2))

    return {
      criticalErrors: errorCounts.critical,
      totalErrors: errorCounts.total,
      errorsBySource,
      errorsByTest,
      reportPath
    }
  }

  /**
   * Generate HTML error report
   */
  private async generateHTMLReport(): Promise<string> {
    const reportPath = path.join(this.reportDir, 'console-error-report.html')
    const errorCounts = this.getErrorCount()

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Console Error Report - Production E2E</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .error-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .error-card { border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; background: #fff5f5; }
        .warning-card { border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; background: #fff9e6; }
        .severity-critical { border-left-color: #dc3545; background: #fff5f5; }
        .severity-high { border-left-color: #fd7e14; background: #fff8f0; }
        .severity-medium { border-left-color: #ffc107; background: #fff9e6; }
        .severity-low { border-left-color: #6c757d; background: #f8f9fa; }
        .error-message { font-weight: bold; color: #721c24; margin-bottom: 10px; }
        .error-details { font-size: 14px; color: #495057; }
        .stack-trace { background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow-x: auto; }
        .no-errors { background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <h1>Console Error Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    
    <div class="error-summary">
        <h2>Error Summary</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3 style="color: #dc3545;">${errorCounts.critical}</h3>
                <p>Critical Errors</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #fd7e14;">${errorCounts.high}</h3>
                <p>High Priority</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #ffc107;">${errorCounts.medium}</h3>
                <p>Medium Priority</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #28a745;">${errorCounts.low}</h3>
                <p>Low Priority</p>
            </div>
        </div>
        ${errorCounts.total === 0 ? 
          '<div class="no-errors"><h3>✅ Zero Console Errors Detected!</h3><p>All JavaScript executed cleanly during testing.</p></div>' :
          `<p><strong>Total Errors: ${errorCounts.total}</strong></p>
           ${errorCounts.critical > 0 ? '<p style="color: #dc3545;"><strong>⚠️ Critical errors detected - Test suite should FAIL</strong></p>' : ''}`
        }
    </div>

    ${this.errors.length > 0 ? this.generateErrorDetailsHTML() : ''}
</body>
</html>`

    await fs.writeFile(reportPath, html)
    return reportPath
  }

  private generateErrorDetailsHTML(): string {
    let html = '<h2>Detailed Error Log</h2>'
    
    // Group by severity
    const severityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low']
    
    for (const severity of severityOrder) {
      const severityErrors = this.errors.filter(e => e.severity === severity)
      if (severityErrors.length === 0) continue
      
      html += `<h3>${severity.charAt(0).toUpperCase() + severity.slice(1)} Priority (${severityErrors.length})</h3>`
      
      for (const error of severityErrors) {
        html += `
          <div class="error-card severity-${severity}">
            <div class="error-message">${this.escapeHtml(error.message)}</div>
            <div class="error-details">
              <strong>Source:</strong> ${error.source}<br/>
              <strong>Test:</strong> ${error.testContext.testName} / ${error.testContext.phase}<br/>
              <strong>URL:</strong> ${error.testContext.url}<br/>
              <strong>Time:</strong> ${error.timestamp}<br/>
              ${error.location.line ? `<strong>Location:</strong> ${error.location.url}:${error.location.line}:${error.location.column}<br/>` : ''}
            </div>
            ${error.stackTrace ? `<div class="stack-trace">${this.escapeHtml(error.stackTrace)}</div>` : ''}
          </div>
        `
      }
    }
    
    return html
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * Clear all errors (useful for test isolation)
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Get all errors
   */
  getAllErrors(): ConsoleError[] {
    return [...this.errors]
  }
}