/**
 * Production-Only E2E Global Setup
 * 
 * CRITICAL VALIDATIONS:
 * 1. Block localhost testing completely
 * 2. Validate production environment accessibility
 * 3. Verify demo user credentials are working
 * 4. Initialize screenshot and error monitoring systems
 */

import { FullConfig, chromium } from '@playwright/test'
import { ProductionEnvironmentValidator } from './utils/production-environment-validator'
import { ScreenshotManager } from './utils/screenshot-manager'
import { ConsoleErrorMonitor } from './utils/console-error-monitor'

const PRODUCTION_URL = 'https://incomeclarity.ddns.net'
const DEMO_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 PRODUCTION-ONLY E2E TESTING FRAMEWORK INITIALIZATION')
  console.log('━'.repeat(80))
  
  // Step 1: Environment Validation
  console.log('📍 Step 1: Environment Validation')
  const envValidator = new ProductionEnvironmentValidator()
  
  // CRITICAL: Block localhost completely
  await envValidator.blockLocalhostAttempts()
  console.log('✅ Localhost blocking activated')
  
  // Validate production environment accessibility
  const isProductionAccessible = await envValidator.validateProductionConnectivity(PRODUCTION_URL)
  if (!isProductionAccessible) {
    throw new Error(`❌ CRITICAL: Production environment ${PRODUCTION_URL} is not accessible`)
  }
  console.log('✅ Production environment connectivity verified')
  
  // Step 2: Demo User Authentication Validation
  console.log('📍 Step 2: Demo User Authentication Validation')
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    console.log(`🔐 Testing demo user authentication: ${DEMO_CREDENTIALS.email}`)
    await page.goto(`${PRODUCTION_URL}/auth/login`)
    
    // Fill login form
    await page.fill('input[type="email"]', DEMO_CREDENTIALS.email)
    await page.fill('input[type="password"]', DEMO_CREDENTIALS.password)
    await page.click('button[type="submit"]')
    
    // Wait for successful login
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })
    console.log('✅ Demo user authentication working')
    
    // Test logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')
    await page.waitForURL(/\//, { timeout: 15000 })
    console.log('✅ Demo user logout working')
    
  } catch (error) {
    throw new Error(`❌ CRITICAL: Demo user authentication failed: ${error.message}`)
  } finally {
    await browser.close()
  }
  
  // Step 3: Initialize Screenshot Management System
  console.log('📍 Step 3: Screenshot Management System')
  const screenshotManager = new ScreenshotManager()
  await screenshotManager.initialize()
  console.log('✅ Screenshot management system initialized')
  
  // Step 4: Initialize Console Error Monitoring
  console.log('📍 Step 4: Console Error Monitoring System')
  const consoleMonitor = new ConsoleErrorMonitor()
  await consoleMonitor.initialize()
  console.log('✅ Console error monitoring system initialized')
  
  // Step 5: Validate Progressive Disclosure Endpoints
  console.log('📍 Step 5: Progressive Disclosure Validation')
  const progressiveDisclosureTests = [
    '/dashboard?view=momentum',
    '/dashboard?view=hero-view&hub=income',
    '/dashboard?view=detailed&hub=income&tab=projections'
  ]
  
  for (const testUrl of progressiveDisclosureTests) {
    try {
      const response = await fetch(`${PRODUCTION_URL}${testUrl}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      console.log(`✅ Progressive disclosure level accessible: ${testUrl}`)
    } catch (error) {
      throw new Error(`❌ CRITICAL: Progressive disclosure level failed: ${testUrl} - ${error.message}`)
    }
  }
  
  console.log('━'.repeat(80))
  console.log('🎯 PRODUCTION E2E FRAMEWORK READY FOR TESTING')
  console.log(`📍 Target: ${PRODUCTION_URL}`)
  console.log(`🔐 Demo User: ${DEMO_CREDENTIALS.email}`)
  console.log(`📸 Screenshots: Enabled for all test phases`)
  console.log(`🖥️ Console Errors: Zero tolerance monitoring`)
  console.log(`📱 Cross-Device: Desktop, Mobile, Tablet validation`)
  console.log('━'.repeat(80))
}

export default globalSetup