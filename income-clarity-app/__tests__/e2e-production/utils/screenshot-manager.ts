/**
 * Screenshot Manager for Production E2E Testing
 * 
 * RESPONSIBILITIES:
 * - Capture screenshots at every test phase for visual evidence
 * - Organize screenshots with meaningful naming
 * - Provide before/after comparison capabilities
 * - Generate visual test evidence reports
 * - Handle cross-device screenshot management
 */

import { Page } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

export interface ScreenshotMetadata {
  testName: string
  phase: string
  timestamp: string
  device: string
  viewport: { width: number; height: number }
  url: string
  filepath: string
  filesize: number
}

export class ScreenshotManager {
  private readonly screenshotDir = path.join(process.cwd(), 'playwright-production-report', 'screenshots')
  private screenshots: ScreenshotMetadata[] = []

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.screenshotDir, { recursive: true })
      
      // Create organized subdirectories
      const subdirs = [
        'authentication',
        'navigation',
        'super-cards',
        'progressive-disclosure',
        'mobile',
        'tablet',
        'desktop',
        'errors',
        'performance'
      ]
      
      for (const subdir of subdirs) {
        await fs.mkdir(path.join(this.screenshotDir, subdir), { recursive: true })
      }
      
      console.log(`✅ Screenshot directories initialized: ${this.screenshotDir}`)
    } catch (error) {
      console.error('❌ Screenshot manager initialization failed:', error.message)
      throw error
    }
  }

  /**
   * Capture screenshot with comprehensive metadata
   */
  async captureScreenshot(
    page: Page, 
    testName: string, 
    phase: string, 
    options: {
      category?: string
      fullPage?: boolean
      element?: string
    } = {}
  ): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const device = await this.detectDevice(page)
      const viewport = page.viewportSize() || { width: 1920, height: 1080 }
      const url = page.url()
      
      // Generate meaningful filename
      const filename = `${testName.replace(/[^a-zA-Z0-9]/g, '-')}_${phase}_${device}_${timestamp}.png`
      const category = options.category || this.categorizeScreenshot(testName, phase)
      const filepath = path.join(this.screenshotDir, category, filename)
      
      // Capture screenshot with options
      const screenshotBuffer = await page.screenshot({
        path: filepath,
        fullPage: options.fullPage || false,
        type: 'png',
        quality: 95
      })
      
      // Get file size
      const stats = await fs.stat(filepath)
      
      // Store metadata
      const metadata: ScreenshotMetadata = {
        testName,
        phase,
        timestamp,
        device,
        viewport,
        url,
        filepath,
        filesize: stats.size
      }
      
      this.screenshots.push(metadata)
      
      console.log(`📸 Screenshot captured: ${filename} (${this.formatFileSize(stats.size)})`)
      return filepath
      
    } catch (error) {
      console.error(`❌ Screenshot capture failed for ${testName}/${phase}:`, error.message)
      throw error
    }
  }

  /**
   * Capture before/after comparison screenshots
   */
  async captureBeforeAfter(
    page: Page,
    testName: string,
    action: string,
    actionCallback: () => Promise<void>
  ): Promise<{ before: string; after: string }> {
    // Capture before screenshot
    const beforePath = await this.captureScreenshot(page, testName, `before-${action}`)
    
    // Perform action
    await actionCallback()
    
    // Wait for potential UI changes
    await page.waitForTimeout(1000)
    
    // Capture after screenshot
    const afterPath = await this.captureScreenshot(page, testName, `after-${action}`)
    
    return {
      before: beforePath,
      after: afterPath
    }
  }

  /**
   * Capture error state screenshot
   */
  async captureErrorScreenshot(page: Page, testName: string, errorMessage: string): Promise<string> {
    try {
      const errorPhase = `error-${errorMessage.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)}`
      return await this.captureScreenshot(page, testName, errorPhase, { 
        category: 'errors',
        fullPage: true
      })
    } catch (screenshotError) {
      console.error('❌ Error screenshot capture failed:', screenshotError.message)
      throw screenshotError
    }
  }

  /**
   * Capture element-specific screenshot
   */
  async captureElementScreenshot(
    page: Page, 
    testName: string, 
    elementSelector: string, 
    phase: string
  ): Promise<string> {
    try {
      const element = page.locator(elementSelector)
      await element.waitFor({ state: 'visible', timeout: 10000 })
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const device = await this.detectDevice(page)
      const filename = `${testName.replace(/[^a-zA-Z0-9]/g, '-')}_element-${phase}_${device}_${timestamp}.png`
      const filepath = path.join(this.screenshotDir, 'elements', filename)
      
      // Ensure elements directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true })
      
      await element.screenshot({ path: filepath, type: 'png' })
      
      const stats = await fs.stat(filepath)
      console.log(`📸 Element screenshot captured: ${filename} (${this.formatFileSize(stats.size)})`)
      
      return filepath
      
    } catch (error) {
      console.error(`❌ Element screenshot failed for ${elementSelector}:`, error.message)
      throw error
    }
  }

  /**
   * Generate visual evidence compilation
   */
  async compileEvidence(): Promise<{
    totalScreenshots: number
    categorizedScreenshots: Record<string, number>
    deviceBreakdown: Record<string, number>
    totalFileSize: string
    evidenceReport: string
  }> {
    const categorizedScreenshots: Record<string, number> = {}
    const deviceBreakdown: Record<string, number> = {}
    let totalFileSize = 0
    
    for (const screenshot of this.screenshots) {
      const category = path.basename(path.dirname(screenshot.filepath))
      categorizedScreenshots[category] = (categorizedScreenshots[category] || 0) + 1
      deviceBreakdown[screenshot.device] = (deviceBreakdown[screenshot.device] || 0) + 1
      totalFileSize += screenshot.filesize
    }
    
    // Generate HTML evidence report
    const evidenceReport = await this.generateEvidenceReport()
    
    return {
      totalScreenshots: this.screenshots.length,
      categorizedScreenshots,
      deviceBreakdown,
      totalFileSize: this.formatFileSize(totalFileSize),
      evidenceReport
    }
  }

  /**
   * Generate HTML evidence report
   */
  private async generateEvidenceReport(): Promise<string> {
    const reportPath = path.join(this.screenshotDir, 'evidence-report.html')
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production E2E Visual Evidence Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        .screenshot-image { width: 100%; max-width: 280px; border-radius: 4px; }
        .metadata { font-size: 12px; color: #666; margin-top: 10px; }
        .category-header { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>Production E2E Visual Evidence Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <p>Total Screenshots: ${this.screenshots.length}</p>
    
    ${await this.generateScreenshotsByCategory()}
</body>
</html>`
    
    await fs.writeFile(reportPath, html)
    return reportPath
  }

  private async generateScreenshotsByCategory(): Promise<string> {
    const categories = [...new Set(this.screenshots.map(s => path.basename(path.dirname(s.filepath))))]
    
    let html = ''
    for (const category of categories) {
      const categoryScreenshots = this.screenshots.filter(s => 
        path.basename(path.dirname(s.filepath)) === category
      )
      
      html += `
        <div class="category-header">
          <h2>${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryScreenshots.length})</h2>
        </div>
        <div class="screenshot-grid">
      `
      
      for (const screenshot of categoryScreenshots) {
        const relativePath = path.relative(this.screenshotDir, screenshot.filepath)
        html += `
          <div class="screenshot-card">
            <img src="${relativePath}" alt="${screenshot.testName} - ${screenshot.phase}" class="screenshot-image" />
            <div class="metadata">
              <strong>${screenshot.testName}</strong><br/>
              Phase: ${screenshot.phase}<br/>
              Device: ${screenshot.device}<br/>
              Time: ${screenshot.timestamp}<br/>
              URL: ${screenshot.url}<br/>
              Size: ${this.formatFileSize(screenshot.filesize)}
            </div>
          </div>
        `
      }
      
      html += '</div>'
    }
    
    return html
  }

  private categorizeScreenshot(testName: string, phase: string): string {
    if (testName.includes('auth') || phase.includes('login') || phase.includes('logout')) {
      return 'authentication'
    }
    if (testName.includes('nav') || phase.includes('navigation')) {
      return 'navigation'
    }
    if (testName.includes('super-card') || testName.includes('hub')) {
      return 'super-cards'
    }
    if (phase.includes('progressive') || phase.includes('level')) {
      return 'progressive-disclosure'
    }
    if (phase.includes('performance') || phase.includes('load')) {
      return 'performance'
    }
    return 'general'
  }

  private async detectDevice(page: Page): string {
    const viewport = page.viewportSize()
    if (!viewport) return 'unknown'
    
    if (viewport.width >= 1024) return 'desktop'
    if (viewport.width >= 768) return 'tablet'
    return 'mobile'
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  getScreenshotMetadata(): ScreenshotMetadata[] {
    return [...this.screenshots]
  }
}