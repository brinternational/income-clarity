#!/usr/bin/env node

/**
 * AUTOMATED DARK MODE SCREENSHOT CAPTURE SYSTEM
 * 
 * This script provides automated screenshot capture specifically designed
 * for dark mode visual regression testing with organized storage and
 * comprehensive component state coverage.
 * 
 * Features:
 * - Systematic screenshot capture across all breakpoints
 * - Component state testing (hover, focus, active, disabled, etc.)
 * - Organized directory structure by page and breakpoint
 * - Baseline creation for future comparison
 * - Interactive element detection and testing
 * - Dark mode specific validation
 * 
 * Date: August 22, 2025
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  BASE_URL: process.env.TEST_URL || 'http://localhost:3000',
  OUTPUT_DIR: './test-results/automated-dark-mode-screenshots',
  BASELINE_DIR: './test-results/dark-mode-screenshot-baseline',
  TIMEOUT: 15000,
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  },
  SCREENSHOT_OPTIONS: {
    quality: 100,
    fullPage: true,
    animations: 'disabled'
  }
};

// Responsive breakpoints with device characteristics
const BREAKPOINTS = [
  { 
    name: 'mobile-portrait-375', 
    width: 375, 
    height: 812, 
    category: 'mobile',
    description: 'iPhone X/11/12/13 Portrait'
  },
  { 
    name: 'mobile-portrait-414', 
    width: 414, 
    height: 896, 
    category: 'mobile',
    description: 'iPhone XR/11/12/13 Pro Max Portrait'
  },
  { 
    name: 'tablet-portrait-768', 
    width: 768, 
    height: 1024, 
    category: 'tablet',
    description: 'iPad Portrait'
  },
  { 
    name: 'tablet-landscape-1024', 
    width: 1024, 
    height: 768, 
    category: 'tablet',
    description: 'iPad Landscape'
  },
  { 
    name: 'desktop-1440', 
    width: 1440, 
    height: 900, 
    category: 'desktop',
    description: 'Laptop/Desktop Standard'
  },
  { 
    name: 'desktop-1920', 
    width: 1920, 
    height: 1080, 
    category: 'desktop',
    description: 'Full HD Desktop'
  },
  { 
    name: 'ultrawide-2560', 
    width: 2560, 
    height: 1440, 
    category: 'ultrawide',
    description: 'Ultra-wide Monitor'
  }
];

// Pages to capture with specific focus areas
const CAPTURE_PAGES = [
  {
    name: 'landing',
    url: '/',
    description: 'Landing page with marketing content',
    requiresAuth: false,
    focusAreas: [
      'header navigation',
      'hero section',
      'feature cards',
      'call-to-action buttons',
      'footer'
    ]
  },
  {
    name: 'login',
    url: '/auth/login',
    description: 'User login form',
    requiresAuth: false,
    focusAreas: [
      'login form',
      'input fields',
      'submit button',
      'forgot password link',
      'signup link'
    ]
  },
  {
    name: 'signup',
    url: '/auth/signup',
    description: 'User registration form',
    requiresAuth: false,
    focusAreas: [
      'signup form',
      'validation messages',
      'terms checkbox',
      'submit button'
    ]
  },
  {
    name: 'dashboard-momentum',
    url: '/dashboard/super-cards',
    description: 'Main dashboard - momentum level',
    requiresAuth: true,
    focusAreas: [
      'super cards grid',
      'navigation header',
      'performance metrics',
      'action buttons'
    ]
  },
  {
    name: 'dashboard-hero-performance',
    url: '/dashboard/super-cards?view=hero-view&card=performance',
    description: 'Performance hub hero view',
    requiresAuth: true,
    focusAreas: [
      'performance charts',
      'comparison metrics',
      'navigation tabs',
      'data tables'
    ]
  },
  {
    name: 'dashboard-hero-income',
    url: '/dashboard/super-cards?view=hero-view&card=income',
    description: 'Income intelligence hub hero view',
    requiresAuth: true,
    focusAreas: [
      'income waterfall',
      'projection charts',
      'tax breakdown',
      'dividend calendar'
    ]
  },
  {
    name: 'dashboard-detailed-performance',
    url: '/dashboard/super-cards?view=detailed&card=performance',
    description: 'Performance hub detailed view',
    requiresAuth: true,
    focusAreas: [
      'detailed analytics',
      'advanced charts',
      'tab interface',
      'filter controls'
    ]
  },
  {
    name: 'settings',
    url: '/settings',
    description: 'Application settings',
    requiresAuth: true,
    focusAreas: [
      'settings panels',
      'toggle switches',
      'bank connections',
      'preference controls'
    ]
  },
  {
    name: 'profile',
    url: '/profile',
    description: 'User profile management',
    requiresAuth: true,
    focusAreas: [
      'profile information',
      'subscription details',
      'billing settings',
      'security options'
    ]
  },
  {
    name: 'onboarding',
    url: '/onboarding',
    description: 'User onboarding flow',
    requiresAuth: false,
    focusAreas: [
      'onboarding steps',
      'progress indicator',
      'instruction content',
      'navigation buttons'
    ]
  },
  {
    name: 'pricing',
    url: '/pricing',
    description: 'Pricing and upgrade page',
    requiresAuth: false,
    focusAreas: [
      'pricing tiers',
      'feature comparison',
      'upgrade buttons',
      'billing toggles'
    ]
  }
];

// Component states to capture
const COMPONENT_STATES = [
  { name: 'default', description: 'Normal/resting state' },
  { name: 'hover', description: 'Mouse hover state', action: 'hover' },
  { name: 'focus', description: 'Keyboard focus state', action: 'focus' },
  { name: 'active', description: 'Active/pressed state', action: 'click' },
  { name: 'disabled', description: 'Disabled state', selector: '[disabled]' },
  { name: 'loading', description: 'Loading state', selector: '[class*="loading"], [aria-busy="true"]' },
  { name: 'error', description: 'Error state', selector: '[class*="error"], [aria-invalid="true"]' }
];

class AutomatedDarkModeScreenshotCapture {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.captureResults = [];
    this.isAuthenticated = false;
    this.screenshotCount = 0;
  }

  async initialize() {
    console.log('📸 Initializing Automated Dark Mode Screenshot Capture...');
    
    // Create directory structure
    await this.createDirectoryStructure();
    
    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ]
    });
    
    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.context.newPage();
    
    // Disable animations for consistent screenshots
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `
    });
    
    // Force dark mode
    await this.forceDarkMode();
    
    console.log('✅ Browser initialized with dark mode forced');
    console.log(`📍 Target URL: ${CONFIG.BASE_URL}`);
  }

  async createDirectoryStructure() {
    // Create main directories
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    await fs.mkdir(CONFIG.BASELINE_DIR, { recursive: true });
    
    // Create subdirectories for each page and breakpoint
    for (const page of CAPTURE_PAGES) {
      for (const breakpoint of BREAKPOINTS) {
        const pageDir = path.join(CONFIG.OUTPUT_DIR, page.name, breakpoint.name);
        const baselineDir = path.join(CONFIG.BASELINE_DIR, page.name, breakpoint.name);
        
        await fs.mkdir(pageDir, { recursive: true });
        await fs.mkdir(baselineDir, { recursive: true });
      }
    }
    
    console.log('📁 Directory structure created');
  }

  async forceDarkMode() {
    await this.page.addInitScript(() => {
      // Set dark mode in localStorage
      localStorage.setItem('income-clarity-theme', 'accessibility-dark');
      localStorage.setItem('theme', 'dark');
      
      // Add dark mode classes to document
      document.documentElement.classList.add('dark');
      document.body.classList.add('theme-accessibility-dark', 'theme-type-dark');
      
      // Override system preferences
      Object.defineProperty(window, 'matchMedia', {
        value: (query) => ({
          matches: query.includes('prefers-color-scheme: dark'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {}
        })
      });
    });
  }

  async authenticateIfNeeded() {
    if (this.isAuthenticated) return;
    
    console.log('🔑 Authenticating user...');
    
    try {
      await this.page.goto(`${CONFIG.BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
      
      await this.page.fill('input[type="email"]', CONFIG.TEST_USER.email);
      await this.page.fill('input[type="password"]', CONFIG.TEST_USER.password);
      await this.page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await this.page.waitForURL('**/dashboard/super-cards', { timeout: CONFIG.TIMEOUT });
      
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  async capturePageAtBreakpoint(pageConfig, breakpoint) {
    console.log(`  📱 Capturing ${pageConfig.name} at ${breakpoint.name}...`);
    
    const result = {
      page: pageConfig.name,
      breakpoint: breakpoint.name,
      url: pageConfig.url,
      timestamp: new Date().toISOString(),
      screenshots: {},
      issues: []
    };

    try {
      // Set viewport
      await this.page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height
      });

      // Navigate to page
      const fullURL = `${CONFIG.BASE_URL}${pageConfig.url}`;
      await this.page.goto(fullURL, { 
        waitUntil: 'networkidle',
        timeout: CONFIG.TIMEOUT 
      });

      // Wait for page to stabilize
      await this.page.waitForTimeout(2000);

      // Capture default state
      const defaultPath = await this.captureScreenshot(
        pageConfig.name, 'default', breakpoint.name, 'full-page'
      );
      result.screenshots.default = defaultPath;

      // Capture component states
      await this.captureComponentStates(pageConfig, breakpoint, result);

      // Capture focus areas if on larger screens
      if (breakpoint.width >= 768) {
        await this.captureFocusAreas(pageConfig, breakpoint, result);
      }

      console.log(`    ✅ Captured ${Object.keys(result.screenshots).length} screenshots`);

    } catch (error) {
      result.issues.push(`Capture failed: ${error.message}`);
      console.log(`    ❌ Failed: ${error.message}`);
    }

    this.captureResults.push(result);
    return result;
  }

  async captureComponentStates(pageConfig, breakpoint, result) {
    try {
      // Find interactive elements
      const buttons = await this.page.locator('button, [role="button"], a[href]').all();
      const inputs = await this.page.locator('input, select, textarea').all();
      
      // Capture hover states
      if (buttons.length > 0 && breakpoint.width >= 768) { // Only on non-touch devices
        const button = buttons[0];
        await button.hover();
        await this.page.waitForTimeout(500);
        
        const hoverPath = await this.captureScreenshot(
          pageConfig.name, 'hover', breakpoint.name, 'first-button'
        );
        result.screenshots.hover = hoverPath;
      }

      // Capture focus states
      if (inputs.length > 0) {
        const input = inputs[0];
        await input.focus();
        await this.page.waitForTimeout(500);
        
        const focusPath = await this.captureScreenshot(
          pageConfig.name, 'focus', breakpoint.name, 'first-input'
        );
        result.screenshots.focus = focusPath;
      }

      // Capture error states (if any exist)
      const errorElements = await this.page.locator('[class*="error"], [aria-invalid="true"]').all();
      if (errorElements.length > 0) {
        const errorPath = await this.captureScreenshot(
          pageConfig.name, 'error', breakpoint.name, 'error-state'
        );
        result.screenshots.error = errorPath;
      }

      // Capture loading states (if any exist)
      const loadingElements = await this.page.locator('[class*="loading"], [aria-busy="true"]').all();
      if (loadingElements.length > 0) {
        const loadingPath = await this.captureScreenshot(
          pageConfig.name, 'loading', breakpoint.name, 'loading-state'
        );
        result.screenshots.loading = loadingPath;
      }

    } catch (error) {
      result.issues.push(`Component state capture failed: ${error.message}`);
    }
  }

  async captureFocusAreas(pageConfig, breakpoint, result) {
    try {
      for (const area of pageConfig.focusAreas) {
        // Try to find elements related to this focus area
        const areaSelector = this.generateSelectorFromArea(area);
        const elements = await this.page.locator(areaSelector).all();
        
        if (elements.length > 0) {
          // Scroll to and highlight the area
          await elements[0].scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(500);
          
          const areaPath = await this.captureScreenshot(
            pageConfig.name, 'focus-area', breakpoint.name, area.replace(/\s+/g, '-')
          );
          result.screenshots[`area-${area.replace(/\s+/g, '-')}`] = areaPath;
        }
      }
    } catch (error) {
      result.issues.push(`Focus area capture failed: ${error.message}`);
    }
  }

  generateSelectorFromArea(area) {
    // Generate reasonable selectors based on area descriptions
    const areaMap = {
      'header navigation': 'header, nav, [role="navigation"]',
      'hero section': '.hero, [class*="hero"], main section:first-child',
      'feature cards': '[class*="card"], [class*="feature"]',
      'call-to-action buttons': '[class*="cta"], [class*="call-to-action"], button[class*="primary"]',
      'footer': 'footer',
      'login form': 'form, [class*="login"]',
      'input fields': 'input, select, textarea',
      'submit button': 'button[type="submit"], input[type="submit"]',
      'super cards grid': '[class*="super-card"], [class*="grid"]',
      'performance charts': '[class*="chart"], canvas, svg',
      'settings panels': '[class*="panel"], [class*="setting"]',
      'toggle switches': '[role="switch"], input[type="checkbox"]'
    };
    
    return areaMap[area] || `[class*="${area.replace(/\s+/g, '-')}"]`;
  }

  async captureScreenshot(pageName, state, breakpointName, variant = '') {
    this.screenshotCount++;
    
    const filename = variant 
      ? `${pageName}-${state}-${variant}-${breakpointName}-dark.png`
      : `${pageName}-${state}-${breakpointName}-dark.png`;
    
    // Save to both current and baseline directories
    const currentPath = path.join(CONFIG.OUTPUT_DIR, pageName, breakpointName, filename);
    const baselinePath = path.join(CONFIG.BASELINE_DIR, pageName, breakpointName, filename);
    
    await this.page.screenshot({
      path: currentPath,
      ...CONFIG.SCREENSHOT_OPTIONS
    });
    
    await this.page.screenshot({
      path: baselinePath,
      ...CONFIG.SCREENSHOT_OPTIONS
    });
    
    return currentPath;
  }

  async runFullCapture() {
    console.log('\n📸 Starting comprehensive dark mode screenshot capture...');
    console.log(`📊 Capturing ${CAPTURE_PAGES.length} pages across ${BREAKPOINTS.length} breakpoints`);
    
    for (const pageConfig of CAPTURE_PAGES) {
      console.log(`\n🔍 Capturing page: ${pageConfig.name} (${pageConfig.description})`);
      
      // Authenticate if required
      if (pageConfig.requiresAuth) {
        await this.authenticateIfNeeded();
      }

      for (const breakpoint of BREAKPOINTS) {
        await this.capturePageAtBreakpoint(pageConfig, breakpoint);
      }
    }

    console.log(`\n✅ Capture complete! Total screenshots: ${this.screenshotCount}`);
  }

  async generateCaptureReport() {
    console.log('\n📊 Generating capture report...');
    
    const report = {
      captureRun: {
        timestamp: new Date().toISOString(),
        baseUrl: CONFIG.BASE_URL,
        totalPages: CAPTURE_PAGES.length,
        totalBreakpoints: BREAKPOINTS.length,
        totalScreenshots: this.screenshotCount,
        outputDirectory: CONFIG.OUTPUT_DIR,
        baselineDirectory: CONFIG.BASELINE_DIR
      },
      summary: {
        successfulCaptures: this.captureResults.filter(r => r.issues.length === 0).length,
        failedCaptures: this.captureResults.filter(r => r.issues.length > 0).length,
        totalIssues: this.captureResults.reduce((sum, r) => sum + r.issues.length, 0)
      },
      breakpointBreakdown: this.generateBreakpointBreakdown(),
      pageBreakdown: this.generatePageBreakdown(),
      directoryStructure: this.generateDirectoryStructure(),
      results: this.captureResults
    };

    // Save JSON report
    const reportPath = path.join(CONFIG.OUTPUT_DIR, 'screenshot-capture-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown summary
    const summaryPath = path.join(CONFIG.OUTPUT_DIR, 'screenshot-capture-summary.md');
    await this.generateMarkdownSummary(report, summaryPath);

    console.log(`✅ Report saved: ${reportPath}`);
    console.log(`📋 Summary saved: ${summaryPath}`);
    
    return report;
  }

  generateBreakpointBreakdown() {
    const breakdown = {};
    
    for (const breakpoint of BREAKPOINTS) {
      const breakpointResults = this.captureResults.filter(r => r.breakpoint === breakpoint.name);
      breakdown[breakpoint.name] = {
        description: breakpoint.description,
        dimensions: `${breakpoint.width}x${breakpoint.height}`,
        category: breakpoint.category,
        totalCaptures: breakpointResults.length,
        screenshots: breakpointResults.reduce((sum, r) => sum + Object.keys(r.screenshots).length, 0),
        issues: breakpointResults.reduce((sum, r) => sum + r.issues.length, 0)
      };
    }
    
    return breakdown;
  }

  generatePageBreakdown() {
    const breakdown = {};
    
    for (const page of CAPTURE_PAGES) {
      const pageResults = this.captureResults.filter(r => r.page === page.name);
      breakdown[page.name] = {
        description: page.description,
        requiresAuth: page.requiresAuth,
        focusAreas: page.focusAreas,
        totalCaptures: pageResults.length,
        screenshots: pageResults.reduce((sum, r) => sum + Object.keys(r.screenshots).length, 0),
        issues: pageResults.reduce((sum, r) => sum + r.issues.length, 0)
      };
    }
    
    return breakdown;
  }

  generateDirectoryStructure() {
    const structure = {
      organization: 'By page and breakpoint',
      pattern: '{OUTPUT_DIR}/{page-name}/{breakpoint-name}/{screenshot-files}',
      example: 'test-results/automated-dark-mode-screenshots/dashboard-momentum/desktop-1920/dashboard-momentum-default-desktop-1920-dark.png',
      breakpoints: BREAKPOINTS.map(bp => ({
        name: bp.name,
        directory: bp.name,
        description: bp.description
      })),
      pages: CAPTURE_PAGES.map(page => ({
        name: page.name,
        directory: page.name,
        description: page.description
      }))
    };
    
    return structure;
  }

  async generateMarkdownSummary(report, filePath) {
    const { captureRun, summary, breakpointBreakdown, pageBreakdown } = report;
    
    let markdown = `# Dark Mode Screenshot Capture Report\n\n`;
    markdown += `**Generated:** ${captureRun.timestamp}\n`;
    markdown += `**Base URL:** ${captureRun.baseUrl}\n\n`;
    
    markdown += `## 📊 Capture Summary\n\n`;
    markdown += `- **Pages Captured:** ${captureRun.totalPages}\n`;
    markdown += `- **Breakpoints:** ${captureRun.totalBreakpoints}\n`;
    markdown += `- **Total Screenshots:** ${captureRun.totalScreenshots}\n`;
    markdown += `- **Successful Captures:** ${summary.successfulCaptures}\n`;
    markdown += `- **Failed Captures:** ${summary.failedCaptures}\n`;
    markdown += `- **Issues:** ${summary.totalIssues}\n\n`;

    markdown += `## 📱 Breakpoint Coverage\n\n`;
    markdown += `| Breakpoint | Dimensions | Category | Screenshots | Issues |\n`;
    markdown += `|------------|------------|----------|-------------|--------|\n`;
    Object.entries(breakpointBreakdown).forEach(([name, data]) => {
      markdown += `| ${name} | ${data.dimensions} | ${data.category} | ${data.screenshots} | ${data.issues} |\n`;
    });
    markdown += `\n`;

    markdown += `## 📄 Page Coverage\n\n`;
    Object.entries(pageBreakdown).forEach(([pageName, data]) => {
      markdown += `### ${pageName}\n`;
      markdown += `**Description:** ${data.description}\n`;
      markdown += `**Screenshots:** ${data.screenshots}\n`;
      markdown += `**Issues:** ${data.issues}\n`;
      
      if (data.focusAreas.length > 0) {
        markdown += `**Focus Areas:** ${data.focusAreas.join(', ')}\n`;
      }
      markdown += `\n`;
    });

    markdown += `## 📂 Directory Structure\n\n`;
    markdown += `Screenshots are organized by page and breakpoint:\n\n`;
    markdown += `\`\`\`\n`;
    markdown += `${CONFIG.OUTPUT_DIR}/\n`;
    markdown += `├── {page-name}/\n`;
    markdown += `│   ├── {breakpoint-name}/\n`;
    markdown += `│   │   ├── {page}-default-{breakpoint}-dark.png\n`;
    markdown += `│   │   ├── {page}-hover-{breakpoint}-dark.png\n`;
    markdown += `│   │   └── {page}-focus-{breakpoint}-dark.png\n`;
    markdown += `│   └── ...\n`;
    markdown += `└── ...\n`;
    markdown += `\`\`\`\n\n`;

    markdown += `## 🔧 Usage Instructions\n\n`;
    markdown += `### Visual Regression Testing\n`;
    markdown += `1. Use baseline directory for comparison: \`${CONFIG.BASELINE_DIR}\`\n`;
    markdown += `2. Compare new captures against baseline images\n`;
    markdown += `3. Update baseline when intentional changes are made\n\n`;

    markdown += `### Integration with Testing\n`;
    markdown += `1. Run before major releases to detect visual regressions\n`;
    markdown += `2. Automate comparison with visual diff tools\n`;
    markdown += `3. Include in CI/CD pipeline for continuous validation\n\n`;

    markdown += `---\n`;
    markdown += `**Generated by:** Automated Dark Mode Screenshot Capture System\n`;

    await fs.writeFile(filePath, markdown);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Browser cleanup completed');
  }
}

// Main execution
async function runAutomatedScreenshotCapture() {
  const capturer = new AutomatedDarkModeScreenshotCapture();
  
  try {
    await capturer.initialize();
    await capturer.runFullCapture();
    
    const report = await capturer.generateCaptureReport();
    
    // Console summary
    console.log('\n' + '='.repeat(80));
    console.log('📸 AUTOMATED DARK MODE SCREENSHOT CAPTURE COMPLETE');
    console.log('='.repeat(80));
    console.log(`Screenshots: ${report.captureRun.totalScreenshots}`);
    console.log(`Successful: ${report.summary.successfulCaptures}`);
    console.log(`Failed: ${report.summary.failedCaptures}`);
    console.log(`Issues: ${report.summary.totalIssues}`);
    console.log(`\n📂 Screenshots: ${CONFIG.OUTPUT_DIR}`);
    console.log(`📁 Baseline: ${CONFIG.BASELINE_DIR}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await capturer.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  runAutomatedScreenshotCapture();
}

module.exports = { 
  AutomatedDarkModeScreenshotCapture, 
  CONFIG, 
  BREAKPOINTS, 
  CAPTURE_PAGES 
};