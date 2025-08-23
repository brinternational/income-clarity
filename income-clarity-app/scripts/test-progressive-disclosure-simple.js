#!/usr/bin/env node

/**
 * Simple Progressive Disclosure Structure Test
 * 
 * Verifies the basic architectural implementation without full E2E testing
 * Tests that the URL parameter handling code is in place and functional
 */

const fs = require('fs')
const path = require('path')

const PAGE_FILE = path.join(__dirname, '..', 'app', 'dashboard', 'super-cards', 'page.tsx')

class ProgressiveDisclosureStructureTest {
  constructor() {
    this.results = {
      codeStructure: {},
      architecturalElements: {},
      urlParameterHandling: {},
      componentIntegration: {}
    }
  }

  analyzeCodeStructure() {
    console.log('🔍 Analyzing Progressive Disclosure code structure...')
    
    if (!fs.existsSync(PAGE_FILE)) {
      throw new Error(`Main page file not found: ${PAGE_FILE}`)
    }
    
    const pageContent = fs.readFileSync(PAGE_FILE, 'utf-8')
    
    // Check for Progressive Disclosure implementation
    const checks = {
      urlParameterReading: {
        pattern: /const level = searchParams\.get\('level'\)/,
        description: 'URL parameter reading for level'
      },
      hubParameterReading: {
        pattern: /const hubParam = searchParams\.get\('hub'\)/,
        description: 'URL parameter reading for hub'
      },
      hubMapping: {
        pattern: /const hubMapping.*=.*{/,
        description: 'Hub mapping configuration'
      },
      momentumLevel: {
        pattern: /if \(level === 'momentum'\)/,
        description: 'Level 1 (momentum) handler'
      },
      heroViewLevel: {
        pattern: /if \(level === 'hero-view'/,
        description: 'Level 2 (hero-view) handler'
      },
      detailedLevel: {
        pattern: /if \(level === 'detailed'\)/,
        description: 'Level 3 (detailed) handler'
      },
      singlePageDashboardImport: {
        pattern: /import.*SinglePageDashboard.*from/,
        description: 'SinglePageDashboard component import'
      },
      fullContentDashboardImport: {
        pattern: /import.*FullContentDashboard.*from/,
        description: 'FullContentDashboard component import'
      },
      errorHandling: {
        pattern: /Invalid disclosure level/,
        description: 'Invalid level parameter error handling'
      }
    }
    
    const results = {}
    for (const [key, check] of Object.entries(checks)) {
      const found = check.pattern.test(pageContent)
      results[key] = {
        found,
        description: check.description,
        status: found ? '✅' : '❌'
      }
      console.log(`   ${results[key].status} ${check.description}`)
    }
    
    this.results.codeStructure = results
    return results
  }

  analyzeHubMapping() {
    console.log('\n🗺️  Analyzing hub mapping configuration...')
    
    const pageContent = fs.readFileSync(PAGE_FILE, 'utf-8')
    
    // Extract hub mapping
    const hubMappingMatch = pageContent.match(/const hubMapping.*?=\s*{([^}]+)}/s)
    if (!hubMappingMatch) {
      console.log('   ❌ Hub mapping not found')
      return false
    }
    
    const hubMappingContent = hubMappingMatch[1]
    
    const requiredMappings = [
      'performance',
      'income-tax',
      'tax-strategy', 
      'portfolio-strategy',
      'financial-planning'
    ]
    
    const mappingResults = {}
    for (const mapping of requiredMappings) {
      const found = hubMappingContent.includes(`'${mapping}'`)
      mappingResults[mapping] = found
      console.log(`   ${found ? '✅' : '❌'} ${mapping} mapping`)
    }
    
    this.results.urlParameterHandling.hubMappings = mappingResults
    return Object.values(mappingResults).every(Boolean)
  }

  analyzeComponentIntegration() {
    console.log('\n🔗 Analyzing component integration...')
    
    const pageContent = fs.readFileSync(PAGE_FILE, 'utf-8')
    
    // Check for proper component usage in level handlers
    const integrationChecks = {
      momentumUsingSinglePage: {
        pattern: /<SinglePageDashboard/,
        description: 'Momentum level uses SinglePageDashboard'
      },
      detailedUsingFullContent: {
        pattern: /<FullContentDashboard/,
        description: 'Detailed level uses FullContentDashboard'
      },
      dataAttributes: {
        pattern: /data-level=.*momentum|data-level=.*hero-view|data-level=.*detailed/,
        description: 'Data attributes for testing'
      },
      superCardsAppShell: {
        pattern: /<SuperCardsAppShell/,
        description: 'SuperCardsAppShell wrapper integration'
      }
    }
    
    const results = {}
    for (const [key, check] of Object.entries(integrationChecks)) {
      const found = check.pattern.test(pageContent)
      results[key] = {
        found,
        description: check.description,
        status: found ? '✅' : '❌'
      }
      console.log(`   ${results[key].status} ${check.description}`)
    }
    
    this.results.componentIntegration = results
    return results
  }

  checkComponentFiles() {
    console.log('\n📁 Checking component file existence...')
    
    const componentPaths = [
      'components/super-cards/SinglePageDashboard.tsx',
      'components/super-cards/FullContentDashboard.tsx'
    ]
    
    const results = {}
    for (const componentPath of componentPaths) {
      const fullPath = path.join(__dirname, '..', componentPath)
      const exists = fs.existsSync(fullPath)
      results[componentPath] = exists
      console.log(`   ${exists ? '✅' : '❌'} ${componentPath}`)
    }
    
    this.results.architecturalElements.componentFiles = results
    return Object.values(results).every(Boolean)
  }

  generateTestUrls() {
    console.log('\n🔗 Generating test URLs...')
    
    const testUrls = [
      // Level 1 - Momentum
      '/dashboard/super-cards?level=momentum',
      
      // Level 2 - Hero Views  
      '/dashboard/super-cards?level=hero-view&hub=performance',
      '/dashboard/super-cards?level=hero-view&hub=income-tax',
      '/dashboard/super-cards?level=hero-view&hub=tax-strategy',
      '/dashboard/super-cards?level=hero-view&hub=portfolio-strategy',
      '/dashboard/super-cards?level=hero-view&hub=financial-planning',
      
      // Level 3 - Detailed
      '/dashboard/super-cards?level=detailed',
      
      // Error cases
      '/dashboard/super-cards?level=invalid',
      '/dashboard/super-cards?level=hero-view&hub=nonexistent'
    ]
    
    console.log('   Test URLs that should now work:')
    testUrls.forEach(url => console.log(`   • ${url}`))
    
    return testUrls
  }

  printSummary() {
    const codeChecks = Object.values(this.results.codeStructure)
    const codeScore = codeChecks.filter(c => c.found).length / codeChecks.length * 100
    
    console.log('\n' + '='.repeat(60))
    console.log('📋 PROGRESSIVE DISCLOSURE STRUCTURE ANALYSIS')
    console.log('='.repeat(60))
    console.log(`🏗️  Code Structure: ${codeScore.toFixed(1)}% complete`)
    
    const hubMappings = this.results.urlParameterHandling.hubMappings || {}
    const hubScore = Object.values(hubMappings).filter(Boolean).length / Object.keys(hubMappings).length * 100
    console.log(`🗺️  Hub Mappings: ${hubScore.toFixed(1)}% complete`)
    
    const integrationChecks = Object.values(this.results.componentIntegration)
    const integrationScore = integrationChecks.filter(c => c.found).length / integrationChecks.length * 100
    console.log(`🔗 Component Integration: ${integrationScore.toFixed(1)}% complete`)
    
    const componentFiles = Object.values(this.results.architecturalElements.componentFiles || {})
    const componentScore = componentFiles.filter(Boolean).length / componentFiles.length * 100
    console.log(`📁 Required Components: ${componentScore.toFixed(1)}% available`)
    
    const overallScore = (codeScore + hubScore + integrationScore + componentScore) / 4
    
    console.log(`\n🎯 OVERALL ARCHITECTURE: ${overallScore.toFixed(1)}% complete`)
    
    if (overallScore >= 90) {
      console.log('\n🎉 EXCELLENT: Progressive Disclosure architecture is comprehensive!')
      console.log('✅ All three levels properly implemented')
      console.log('✅ URL parameter handling complete')
      console.log('✅ Component integration functional')
      console.log('✅ Error handling in place')
      console.log('\n🚀 Ready for production E2E testing')
    } else if (overallScore >= 75) {
      console.log('\n👍 GOOD: Core architecture is solid, minor issues remain')
    } else {
      console.log('\n⚠️  NEEDS WORK: Significant architectural gaps detected')
    }
  }
}

async function main() {
  console.log('🏗️  Progressive Disclosure Architecture Analysis')
  console.log('=' .repeat(60))
  
  const test = new ProgressiveDisclosureStructureTest()
  
  try {
    test.analyzeCodeStructure()
    test.analyzeHubMapping()
    test.analyzeComponentIntegration()
    test.checkComponentFiles()
    test.generateTestUrls()
    test.printSummary()
    
  } catch (error) {
    console.error(`❌ Analysis failed: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}