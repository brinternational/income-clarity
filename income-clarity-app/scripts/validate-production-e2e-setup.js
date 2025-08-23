#!/usr/bin/env node

/**
 * Production E2E Setup Validator
 * 
 * Validates that the production E2E testing framework is properly configured
 * and all required components are in place before running actual tests.
 */

const fs = require('fs')
const path = require('path')

class ProductionE2ESetupValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.productionUrl = 'https://incomeclarity.ddns.net'
  }

  validate() {
    console.log('🔍 VALIDATING PRODUCTION E2E FRAMEWORK SETUP')
    console.log('━'.repeat(60))

    this.validateRequiredFiles()
    this.validatePlaywrightConfig()
    this.validatePageObjects()
    this.validateUtilities()
    this.validateTestFiles()
    this.validatePackageJson()
    this.validateProductionEnvironment()

    this.outputResults()
  }

  validateRequiredFiles() {
    console.log('📁 Checking required files...')
    
    const requiredFiles = [
      'playwright.production.config.ts',
      '__tests__/e2e-production/global-setup.ts',
      '__tests__/e2e-production/global-teardown.ts',
      'lib/reporters/production-e2e-reporter.ts',
      'scripts/run-production-e2e-tests.js',
      'PRODUCTION_E2E_FRAMEWORK.md'
    ]

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file)
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`)
      } else {
        this.errors.push(`Missing required file: ${file}`)
        console.log(`  ❌ ${file}`)
      }
    }
  }

  validatePlaywrightConfig() {
    console.log('\n⚙️ Checking Playwright configuration...')
    
    const configPath = path.join(process.cwd(), 'playwright.production.config.ts')
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8')
      
      // Check for production URL
      if (configContent.includes(this.productionUrl)) {
        console.log('  ✅ Production URL configured')
      } else {
        this.errors.push('Production URL not found in config')
        console.log('  ❌ Production URL not configured')
      }
      
      // Check for localhost blocking
      if (configContent.includes('webServer: undefined')) {
        console.log('  ✅ Local server disabled')
      } else {
        this.warnings.push('Local server may still be enabled')
        console.log('  ⚠️  Local server configuration detected')
      }

      // Check for custom reporter
      if (configContent.includes('production-e2e-reporter')) {
        console.log('  ✅ Custom reporter configured')
      } else {
        this.warnings.push('Custom reporter not configured')
        console.log('  ⚠️  Custom reporter not found')
      }
    }
  }

  validatePageObjects() {
    console.log('\n📄 Checking page objects...')
    
    const pageObjects = [
      '__tests__/e2e-production/page-objects/ProductionAuthPage.ts',
      '__tests__/e2e-production/page-objects/ProductionDashboardPage.ts'
    ]

    for (const pageObject of pageObjects) {
      const filePath = path.join(process.cwd(), pageObject)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        
        // Check for demo credentials
        if (content.includes('test@example.com')) {
          console.log(`  ✅ ${path.basename(pageObject)} with demo credentials`)
        } else {
          this.warnings.push(`Demo credentials not found in ${pageObject}`)
          console.log(`  ⚠️  ${path.basename(pageObject)} - no demo credentials`)
        }
      } else {
        this.errors.push(`Missing page object: ${pageObject}`)
        console.log(`  ❌ ${path.basename(pageObject)}`)
      }
    }
  }

  validateUtilities() {
    console.log('\n🔧 Checking utility classes...')
    
    const utilities = [
      '__tests__/e2e-production/utils/production-environment-validator.ts',
      '__tests__/e2e-production/utils/screenshot-manager.ts',
      '__tests__/e2e-production/utils/console-error-monitor.ts',
      '__tests__/e2e-production/utils/performance-benchmarker.ts',
      '__tests__/e2e-production/utils/test-report-generator.ts'
    ]

    for (const utility of utilities) {
      const filePath = path.join(process.cwd(), utility)
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${path.basename(utility)}`)
      } else {
        this.errors.push(`Missing utility: ${utility}`)
        console.log(`  ❌ ${path.basename(utility)}`)
      }
    }
  }

  validateTestFiles() {
    console.log('\n🧪 Checking test files...')
    
    const testFiles = [
      '__tests__/e2e-production/desktop/production-authentication.spec.ts',
      '__tests__/e2e-production/desktop/production-progressive-disclosure.spec.ts',
      '__tests__/e2e-production/mobile/production-mobile-responsive.spec.ts'
    ]

    for (const testFile of testFiles) {
      const filePath = path.join(process.cwd(), testFile)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        
        // Check for production-only patterns
        if (content.includes('production') && content.includes(this.productionUrl.replace('https://', ''))) {
          console.log(`  ✅ ${path.basename(testFile)} (production-ready)`)
        } else {
          this.warnings.push(`${testFile} may not be production-configured`)
          console.log(`  ⚠️  ${path.basename(testFile)} (check production config)`)
        }
      } else {
        this.errors.push(`Missing test file: ${testFile}`)
        console.log(`  ❌ ${path.basename(testFile)}`)
      }
    }
  }

  validatePackageJson() {
    console.log('\n📦 Checking package.json scripts...')
    
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const scripts = packageJson.scripts || {}

      const requiredScripts = [
        'test:e2e:production',
        'test:e2e:production:auth',
        'test:e2e:production:disclosure',
        'test:e2e:production:mobile',
        'test:e2e:production:report'
      ]

      for (const script of requiredScripts) {
        if (scripts[script]) {
          console.log(`  ✅ ${script}`)
        } else {
          this.warnings.push(`Missing package.json script: ${script}`)
          console.log(`  ⚠️  ${script}`)
        }
      }
    } else {
      this.errors.push('package.json not found')
    }
  }

  async validateProductionEnvironment() {
    console.log('\n🌐 Checking production environment...')
    
    try {
      // Add fetch polyfill if needed
      if (typeof fetch === 'undefined') {
        global.fetch = require('node-fetch')
      }

      console.log(`  🔍 Testing connectivity to ${this.productionUrl}...`)
      
      const response = await fetch(this.productionUrl, {
        method: 'HEAD',
        timeout: 10000
      })

      if (response.ok) {
        console.log('  ✅ Production environment accessible')
      } else {
        this.errors.push(`Production environment returned HTTP ${response.status}`)
        console.log(`  ❌ Production environment: HTTP ${response.status}`)
      }
    } catch (error) {
      this.errors.push(`Production environment connectivity failed: ${error.message}`)
      console.log(`  ❌ Production environment: ${error.message}`)
    }
  }

  outputResults() {
    console.log('\n━'.repeat(60))
    console.log('📊 VALIDATION RESULTS')
    console.log('━'.repeat(60))

    if (this.errors.length === 0) {
      console.log('✅ FRAMEWORK SETUP: VALID')
      console.log('🚀 Production E2E testing framework is ready to use!')
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:')
        this.warnings.forEach(warning => console.log(`   • ${warning}`))
      }
      
      console.log('\n📋 USAGE:')
      console.log('   npm run test:e2e:production              # Run all production tests')
      console.log('   npm run test:e2e:production:auth         # Run authentication tests')
      console.log('   npm run test:e2e:production:disclosure   # Run progressive disclosure tests')
      console.log('   npm run test:e2e:production:mobile       # Run mobile tests')
      console.log('   npm run test:e2e:production:report       # View test reports')
      
    } else {
      console.log('❌ FRAMEWORK SETUP: INVALID')
      console.log('\n🚫 ERRORS:')
      this.errors.forEach(error => console.log(`   • ${error}`))
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:')
        this.warnings.forEach(warning => console.log(`   • ${warning}`))
      }
      
      console.log('\n📋 NEXT STEPS:')
      console.log('   1. Fix the errors listed above')
      console.log('   2. Run this validator again: node scripts/validate-production-e2e-setup.js')
      console.log('   3. Once valid, run: npm run test:e2e:production')
    }

    console.log('━'.repeat(60))
    
    // Exit with appropriate code
    process.exit(this.errors.length > 0 ? 1 : 0)
  }
}

// Run validation
const validator = new ProductionE2ESetupValidator()
validator.validate()

module.exports = ProductionE2ESetupValidator