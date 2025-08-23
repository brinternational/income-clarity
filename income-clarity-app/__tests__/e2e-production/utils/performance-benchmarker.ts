/**
 * Performance Benchmarker for Production E2E Testing
 * 
 * RESPONSIBILITIES:
 * - Measure page load times in real production conditions
 * - Monitor Core Web Vitals (LCP, FID, CLS)
 * - Track resource loading performance
 * - Validate acceptable performance thresholds
 * - Generate performance insights and recommendations
 */

import { Page, Response } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

export interface PerformanceMetrics {
  testName: string
  url: string
  timestamp: string
  navigationTiming: {
    domContentLoaded: number
    loadComplete: number
    firstPaint: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    timeToInteractive: number
  }
  resourceTiming: {
    totalRequests: number
    totalSize: number
    slowestResource: {
      url: string
      duration: number
      size: number
    }
  }
  coreWebVitals: {
    lcp: number  // Largest Contentful Paint
    fid: number  // First Input Delay  
    cls: number  // Cumulative Layout Shift
  }
  networkConditions: {
    effectiveType: string
    rtt: number
    downlink: number
  }
  device: {
    name: string
    viewport: { width: number; height: number }
  }
  performanceScore: number
}

export class PerformanceBenchmarker {
  private metrics: PerformanceMetrics[] = []
  private readonly reportDir = path.join(process.cwd(), 'playwright-production-report', 'performance')
  
  // Performance thresholds (in milliseconds)
  private readonly thresholds = {
    domContentLoaded: 2000,     // 2 seconds
    loadComplete: 3000,         // 3 seconds  
    firstContentfulPaint: 1500, // 1.5 seconds
    largestContentfulPaint: 2500, // 2.5 seconds
    timeToInteractive: 3500,    // 3.5 seconds
    cumulativeLayoutShift: 0.1  // 10%
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.reportDir, { recursive: true })
      console.log('⚡ Performance benchmarker initialized')
    } catch (error) {
      console.error('❌ Performance benchmarker initialization failed:', error.message)
      throw error
    }
  }

  /**
   * Measure comprehensive performance metrics for a page
   */
  async measurePagePerformance(page: Page, testName: string): Promise<PerformanceMetrics> {
    try {
      console.log(`⚡ Measuring performance for: ${testName}`)
      
      // Get basic navigation timing
      const navigationTiming = await this.getNavigationTiming(page)
      
      // Get resource timing
      const resourceTiming = await this.getResourceTiming(page)
      
      // Get Core Web Vitals
      const coreWebVitals = await this.getCoreWebVitals(page)
      
      // Get network conditions (simulated)
      const networkConditions = await this.getNetworkConditions(page)
      
      // Get device information
      const device = await this.getDeviceInfo(page)
      
      const metrics: PerformanceMetrics = {
        testName,
        url: page.url(),
        timestamp: new Date().toISOString(),
        navigationTiming,
        resourceTiming,
        coreWebVitals,
        networkConditions,
        device,
        performanceScore: this.calculatePerformanceScore(navigationTiming, coreWebVitals)
      }
      
      this.metrics.push(metrics)
      
      // Log performance summary
      console.log(`📊 Performance Summary for ${testName}:`)
      console.log(`   • DOM Content Loaded: ${navigationTiming.domContentLoaded}ms`)
      console.log(`   • Load Complete: ${navigationTiming.loadComplete}ms`) 
      console.log(`   • LCP: ${coreWebVitals.lcp}ms`)
      console.log(`   • Performance Score: ${metrics.performanceScore}/100`)
      
      // Check thresholds
      this.validatePerformanceThresholds(metrics)
      
      return metrics
      
    } catch (error) {
      console.error(`❌ Performance measurement failed for ${testName}:`, error.message)
      throw error
    }
  }

  /**
   * Get navigation timing metrics
   */
  private async getNavigationTiming(page: Page): Promise<PerformanceMetrics['navigationTiming']> {
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        timeToInteractive: nav.loadEventEnd - nav.fetchStart
      }
    })
    
    // Get LCP via separate evaluation
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry?.startTime || 0)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        
        // Fallback timeout
        setTimeout(() => resolve(0), 1000)
      })
    }) as number
    
    return {
      ...timing,
      largestContentfulPaint: lcp
    }
  }

  /**
   * Get resource timing metrics
   */
  private async getResourceTiming(page: Page): Promise<PerformanceMetrics['resourceTiming']> {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      let totalSize = 0
      let slowestResource = { url: '', duration: 0, size: 0 }
      
      for (const resource of resources) {
        const duration = resource.responseEnd - resource.requestStart
        const size = resource.transferSize || 0
        totalSize += size
        
        if (duration > slowestResource.duration) {
          slowestResource = {
            url: resource.name,
            duration,
            size
          }
        }
      }
      
      return {
        totalRequests: resources.length,
        totalSize,
        slowestResource
      }
    })
  }

  /**
   * Get Core Web Vitals
   */
  private async getCoreWebVitals(page: Page): Promise<PerformanceMetrics['coreWebVitals']> {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = { lcp: 0, fid: 0, cls: 0 }
        let metricsCollected = 0
        const totalMetrics = 3
        
        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry?.startTime || 0
          metricsCollected++
          if (metricsCollected === totalMetrics) resolve(vitals)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        
        // FID  
        new PerformanceObserver((list) => {
          const firstEntry = list.getEntries()[0]
          vitals.fid = firstEntry?.processingStart - firstEntry?.startTime || 0
          metricsCollected++
          if (metricsCollected === totalMetrics) resolve(vitals)
        }).observe({ type: 'first-input', buffered: true })
        
        // CLS
        new PerformanceObserver((list) => {
          let clsScore = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value
            }
          }
          vitals.cls = clsScore
          metricsCollected++
          if (metricsCollected === totalMetrics) resolve(vitals)
        }).observe({ type: 'layout-shift', buffered: true })
        
        // Fallback timeout
        setTimeout(() => {
          resolve(vitals)
        }, 2000)
      })
    }) as Promise<PerformanceMetrics['coreWebVitals']>
  }

  /**
   * Get simulated network conditions
   */
  private async getNetworkConditions(page: Page): Promise<PerformanceMetrics['networkConditions']> {
    // In a real scenario, you might use page.context().addInitScript() to set network conditions
    // For now, we'll return default values that represent typical production conditions
    return {
      effectiveType: '4g',
      rtt: 100,
      downlink: 10
    }
  }

  /**
   * Get device information
   */
  private async getDeviceInfo(page: Page): Promise<PerformanceMetrics['device']> {
    const viewport = page.viewportSize() || { width: 1920, height: 1080 }
    
    let deviceName = 'Desktop'
    if (viewport.width <= 768) deviceName = 'Mobile'
    else if (viewport.width <= 1024) deviceName = 'Tablet'
    
    return {
      name: deviceName,
      viewport
    }
  }

  /**
   * Calculate overall performance score (0-100)
   */
  private calculatePerformanceScore(
    navigationTiming: PerformanceMetrics['navigationTiming'], 
    coreWebVitals: PerformanceMetrics['coreWebVitals']
  ): number {
    let score = 100
    
    // Deduct points for slow metrics
    if (navigationTiming.domContentLoaded > this.thresholds.domContentLoaded) {
      score -= 15
    }
    if (navigationTiming.loadComplete > this.thresholds.loadComplete) {
      score -= 15
    }
    if (navigationTiming.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      score -= 15
    }
    if (coreWebVitals.lcp > this.thresholds.largestContentfulPaint) {
      score -= 20
    }
    if (navigationTiming.timeToInteractive > this.thresholds.timeToInteractive) {
      score -= 15
    }
    if (coreWebVitals.cls > this.thresholds.cumulativeLayoutShift) {
      score -= 20
    }
    
    return Math.max(0, score)
  }

  /**
   * Validate performance against thresholds
   */
  private validatePerformanceThresholds(metrics: PerformanceMetrics): void {
    const issues = []
    
    if (metrics.navigationTiming.domContentLoaded > this.thresholds.domContentLoaded) {
      issues.push(`DOM Content Loaded too slow: ${metrics.navigationTiming.domContentLoaded}ms (threshold: ${this.thresholds.domContentLoaded}ms)`)
    }
    
    if (metrics.navigationTiming.loadComplete > this.thresholds.loadComplete) {
      issues.push(`Load Complete too slow: ${metrics.navigationTiming.loadComplete}ms (threshold: ${this.thresholds.loadComplete}ms)`)
    }
    
    if (metrics.coreWebVitals.lcp > this.thresholds.largestContentfulPaint) {
      issues.push(`LCP too slow: ${metrics.coreWebVitals.lcp}ms (threshold: ${this.thresholds.largestContentfulPaint}ms)`)
    }
    
    if (metrics.coreWebVitals.cls > this.thresholds.cumulativeLayoutShift) {
      issues.push(`CLS too high: ${metrics.coreWebVitals.cls} (threshold: ${this.thresholds.cumulativeLayoutShift})`)
    }
    
    if (issues.length > 0) {
      console.warn(`⚠️ Performance issues detected for ${metrics.testName}:`)
      issues.forEach(issue => console.warn(`   • ${issue}`))
    } else {
      console.log(`✅ Performance thresholds met for ${metrics.testName}`)
    }
  }

  /**
   * Generate comprehensive performance report
   */
  async generateReport(): Promise<{
    averageLoadTime: number
    averagePerformanceScore: number
    totalTests: number
    slowestTests: Array<{ testName: string; loadTime: number }>
    reportPath: string
  }> {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averagePerformanceScore: 0,
        totalTests: 0,
        slowestTests: [],
        reportPath: ''
      }
    }
    
    // Calculate averages
    const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.navigationTiming.loadComplete, 0) / this.metrics.length
    const averagePerformanceScore = this.metrics.reduce((sum, m) => sum + m.performanceScore, 0) / this.metrics.length
    
    // Find slowest tests
    const slowestTests = [...this.metrics]
      .sort((a, b) => b.navigationTiming.loadComplete - a.navigationTiming.loadComplete)
      .slice(0, 5)
      .map(m => ({
        testName: m.testName,
        loadTime: m.navigationTiming.loadComplete
      }))
    
    // Generate HTML report
    const reportPath = await this.generateHTMLReport()
    
    // Save JSON data
    const jsonPath = path.join(this.reportDir, 'performance-metrics.json')
    await fs.writeFile(jsonPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        averageLoadTime,
        averagePerformanceScore,
        totalTests: this.metrics.length
      },
      thresholds: this.thresholds,
      detailedMetrics: this.metrics
    }, null, 2))
    
    return {
      averageLoadTime: Math.round(averageLoadTime),
      averagePerformanceScore: Math.round(averagePerformanceScore),
      totalTests: this.metrics.length,
      slowestTests,
      reportPath
    }
  }

  /**
   * Generate HTML performance report
   */
  private async generateHTMLReport(): Promise<string> {
    const reportPath = path.join(this.reportDir, 'performance-report.html')
    
    const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.navigationTiming.loadComplete, 0) / this.metrics.length
    const averageScore = this.metrics.reduce((sum, m) => sum + m.performanceScore, 0) / this.metrics.length
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Benchmark Report - Production E2E</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
        .score-excellent { color: #28a745; }
        .score-good { color: #ffc107; }
        .score-poor { color: #dc3545; }
        .test-details { border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .threshold-met { color: #28a745; font-weight: bold; }
        .threshold-exceeded { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Performance Benchmark Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    
    <div class="summary">
        <h2>Performance Summary</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Average Load Time</h3>
                <p class="${averageLoadTime < 3000 ? 'score-excellent' : averageLoadTime < 5000 ? 'score-good' : 'score-poor'}">
                    ${Math.round(averageLoadTime)}ms
                </p>
            </div>
            <div class="metric-card">
                <h3>Average Performance Score</h3>
                <p class="${averageScore >= 80 ? 'score-excellent' : averageScore >= 60 ? 'score-good' : 'score-poor'}">
                    ${Math.round(averageScore)}/100
                </p>
            </div>
            <div class="metric-card">
                <h3>Tests Measured</h3>
                <p>${this.metrics.length}</p>
            </div>
            <div class="metric-card">
                <h3>Tests Meeting Thresholds</h3>
                <p>${this.metrics.filter(m => m.performanceScore >= 80).length}/${this.metrics.length}</p>
            </div>
        </div>
    </div>

    <h2>Detailed Test Results</h2>
    ${this.generateTestDetailsHTML()}
</body>
</html>`
    
    await fs.writeFile(reportPath, html)
    return reportPath
  }

  private generateTestDetailsHTML(): string {
    return this.metrics.map(metrics => `
      <div class="test-details">
        <h3>${metrics.testName}</h3>
        <p><strong>URL:</strong> ${metrics.url}</p>
        <p><strong>Performance Score:</strong> <span class="${metrics.performanceScore >= 80 ? 'score-excellent' : metrics.performanceScore >= 60 ? 'score-good' : 'score-poor'}">${metrics.performanceScore}/100</span></p>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Navigation Timing</h4>
            <p>DOM Content Loaded: <span class="${metrics.navigationTiming.domContentLoaded <= this.thresholds.domContentLoaded ? 'threshold-met' : 'threshold-exceeded'}">${metrics.navigationTiming.domContentLoaded}ms</span></p>
            <p>Load Complete: <span class="${metrics.navigationTiming.loadComplete <= this.thresholds.loadComplete ? 'threshold-met' : 'threshold-exceeded'}">${metrics.navigationTiming.loadComplete}ms</span></p>
            <p>Time to Interactive: <span class="${metrics.navigationTiming.timeToInteractive <= this.thresholds.timeToInteractive ? 'threshold-met' : 'threshold-exceeded'}">${metrics.navigationTiming.timeToInteractive}ms</span></p>
          </div>
          
          <div class="metric-card">
            <h4>Core Web Vitals</h4>
            <p>LCP: <span class="${metrics.coreWebVitals.lcp <= this.thresholds.largestContentfulPaint ? 'threshold-met' : 'threshold-exceeded'}">${metrics.coreWebVitals.lcp}ms</span></p>
            <p>FID: <span class="threshold-met">${metrics.coreWebVitals.fid}ms</span></p>
            <p>CLS: <span class="${metrics.coreWebVitals.cls <= this.thresholds.cumulativeLayoutShift ? 'threshold-met' : 'threshold-exceeded'}">${metrics.coreWebVitals.cls.toFixed(3)}</span></p>
          </div>
          
          <div class="metric-card">
            <h4>Resource Loading</h4>
            <p>Total Requests: ${metrics.resourceTiming.totalRequests}</p>
            <p>Total Size: ${this.formatBytes(metrics.resourceTiming.totalSize)}</p>
            <p>Slowest Resource: ${Math.round(metrics.resourceTiming.slowestResource.duration)}ms</p>
          </div>
          
          <div class="metric-card">
            <h4>Device Info</h4>
            <p>Device: ${metrics.device.name}</p>
            <p>Viewport: ${metrics.device.viewport.width}x${metrics.device.viewport.height}</p>
            <p>Network: ${metrics.networkConditions.effectiveType}</p>
          </div>
        </div>
      </div>
    `).join('')
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }
}