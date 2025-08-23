/**
 * PRODUCTION-ONLY E2E Testing Configuration
 * 
 * CRITICAL RULES:
 * - NEVER test localhost - PRODUCTION ENVIRONMENT ONLY
 * - Real authentication with demo credentials
 * - Screenshot evidence for every test phase
 * - Zero tolerance for JavaScript console errors
 * - Interactive testing (clicks, forms, navigation)
 * - Progressive disclosure validation (all 3 levels)
 * - Cross-device validation
 * - Performance benchmarking with acceptable thresholds
 */

import { defineConfig, devices } from '@playwright/test'

const PRODUCTION_URL = 'https://incomeclarity.ddns.net'

export default defineConfig({
  testDir: './__tests__/e2e-production',
  
  /* Strict production testing - no parallelism for comprehensive validation */
  fullyParallel: false,
  workers: 1,
  
  /* Fail fast on errors */
  forbidOnly: true,
  
  /* Comprehensive retry strategy */
  retries: 2,
  
  /* Extended timeout for production network conditions */
  timeout: 60000,
  expect: {
    timeout: 15000
  },
  
  /* Comprehensive reporting with visual evidence */
  reporter: [
    ['html', { outputFolder: 'playwright-production-report' }],
    ['json', { outputFile: 'playwright-production-report/results.json' }],
    ['junit', { outputFile: 'playwright-production-report/results.xml' }],
    ['line'],
    ['./lib/reporters/production-e2e-reporter.ts']
  ],
  
  /* Production-only configuration */
  use: {
    /* CRITICAL: Production URL only - localhost blocked */
    baseURL: PRODUCTION_URL,
    
    /* Extended navigation timeout for production */
    navigationTimeout: 30000,
    
    /* Always capture screenshots for visual evidence */
    screenshot: 'on',
    
    /* Always record video for comprehensive validation */
    video: 'on',
    
    /* Always capture trace for debugging */
    trace: 'on',
    
    /* Browser context settings for production testing */
    ignoreHTTPSErrors: false,
    
    /* Console error monitoring */
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  },

  /* Comprehensive browser matrix for production validation */
  projects: [
    /* Desktop browsers */
    {
      name: 'production-chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      testDir: './__tests__/e2e-production/desktop'
    },
    
    {
      name: 'production-firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      testDir: './__tests__/e2e-production/desktop'
    },
    
    {
      name: 'production-webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      testDir: './__tests__/e2e-production/desktop'
    },

    /* Mobile devices for responsive validation */
    {
      name: 'production-mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true
      },
      testDir: './__tests__/e2e-production/mobile'
    },
    
    {
      name: 'production-mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true
      },
      testDir: './__tests__/e2e-production/mobile'
    },

    /* Tablet devices */
    {
      name: 'production-tablet-chrome',
      use: { 
        ...devices['iPad Pro'],
        hasTouch: true
      },
      testDir: './__tests__/e2e-production/tablet'
    }
  ],

  /* Global test setup and teardown */
  globalSetup: require.resolve('./__tests__/e2e-production/global-setup.ts'),
  globalTeardown: require.resolve('./__tests__/e2e-production/global-teardown.ts'),

  /* NO LOCAL SERVER - Production environment only */
  webServer: undefined
})