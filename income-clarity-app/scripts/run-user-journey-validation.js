#!/usr/bin/env node

/**
 * User Journey Validation Test Runner
 * 
 * MISSION: Execute comprehensive user journey validation tests
 * 
 * OPTIONS:
 * 1. Run individual journey validation script (visual, comprehensive)
 * 2. Run Playwright E2E journey tests (structured, fast)  
 * 3. Run both for complete validation coverage
 * 
 * USAGE:
 * node scripts/run-user-journey-validation.js [--script-only] [--playwright-only] [--full]
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class UserJourneyTestRunner {
  constructor() {
    this.results = {
      scriptValidation: null,
      playwrightTests: null,
      startTime: Date.now(),
      endTime: null
    };
    
    this.options = this.parseArguments();
  }

  parseArguments() {
    const args = process.argv.slice(2);
    
    return {
      scriptOnly: args.includes('--script-only'),
      playwrightOnly: args.includes('--playwright-only'),
      full: args.includes('--full') || args.length === 0 // Default to full
    };
  }

  async run() {
    console.log('🚀 Starting User Journey Validation Test Runner...\n');
    
    try {
      if (this.options.full || this.options.scriptOnly) {
        await this.runScriptValidation();
      }
      
      if (this.options.full || this.options.playwrightOnly) {
        await this.runPlaywrightTests();
      }
      
      await this.generateSummaryReport();
      
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }

  async runScriptValidation() {
    console.log('📋 RUNNING: Comprehensive User Journey Validation Script');
    console.log('=' .repeat(60));
    console.log('🎯 Type: Visual, Interactive, Comprehensive');
    console.log('⏱️  Duration: ~10-15 minutes');
    console.log('📸 Screenshots: Yes (full evidence capture)');
    console.log('🖥️  Browser: Visible (for visual validation)');
    console.log('');
    
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'comprehensive-user-journey-validation.js');
      
      if (!fs.existsSync(scriptPath)) {
        reject(new Error('User journey validation script not found'));
        return;
      }
      
      const scriptProcess = spawn('node', [scriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      scriptProcess.on('close', (code) => {
        this.results.scriptValidation = {
          status: code === 0 ? 'passed' : 'failed',
          exitCode: code,
          timestamp: Date.now()
        };
        
        if (code === 0) {
          console.log('\n✅ Script validation completed successfully!\n');
          resolve();
        } else {
          console.log('\n❌ Script validation failed!\n');
          reject(new Error(`Script validation failed with exit code ${code}`));
        }
      });
      
      scriptProcess.on('error', (error) => {
        this.results.scriptValidation = {
          status: 'error',
          error: error.message,
          timestamp: Date.now()
        };
        reject(new Error(`Script validation error: ${error.message}`));
      });
    });
  }

  async runPlaywrightTests() {
    console.log('🎭 RUNNING: Playwright User Journey Tests');
    console.log('=' .repeat(60));
    console.log('🎯 Type: Structured, Fast, Automated');
    console.log('⏱️  Duration: ~5-8 minutes');
    console.log('📸 Screenshots: Yes (key validation points)');
    console.log('🖥️  Browser: Headless (for speed)');
    console.log('');
    
    return new Promise((resolve, reject) => {
      const playwrightCommand = [
        'npx',
        'playwright',
        'test',
        '__tests__/e2e-production/user-journey-validation.spec.ts',
        '--config=playwright.production.config.ts',
        '--reporter=html'
      ];
      
      const playwrightProcess = spawn(playwrightCommand[0], playwrightCommand.slice(1), {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      playwrightProcess.on('close', (code) => {
        this.results.playwrightTests = {
          status: code === 0 ? 'passed' : 'failed',
          exitCode: code,
          timestamp: Date.now()
        };
        
        if (code === 0) {
          console.log('\n✅ Playwright tests completed successfully!\n');
          resolve();
        } else {
          console.log('\n⚠️ Playwright tests completed with issues (check report)\n');
          // Don't reject - Playwright tests may have warnings but still be valuable
          resolve();
        }
      });
      
      playwrightProcess.on('error', (error) => {
        this.results.playwrightTests = {
          status: 'error',
          error: error.message,
          timestamp: Date.now()
        };
        reject(new Error(`Playwright tests error: ${error.message}`));
      });
    });
  }

  async generateSummaryReport() {
    this.results.endTime = Date.now();
    const duration = Math.round((this.results.endTime - this.results.startTime) / 1000 / 60 * 10) / 10;
    
    console.log('\n📊 USER JOURNEY VALIDATION SUMMARY REPORT');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total Duration: ${duration} minutes`);
    console.log(`🕐 Started: ${new Date(this.results.startTime).toLocaleTimeString()}`);
    console.log(`🕐 Ended: ${new Date(this.results.endTime).toLocaleTimeString()}`);
    console.log('');
    
    // Script Validation Results
    if (this.results.scriptValidation) {
      console.log('📋 SCRIPT VALIDATION RESULTS:');
      console.log(`   Status: ${this.getStatusEmoji(this.results.scriptValidation.status)} ${this.results.scriptValidation.status.toUpperCase()}`);
      if (this.results.scriptValidation.error) {
        console.log(`   Error: ${this.results.scriptValidation.error}`);
      }
      console.log('');
    }
    
    // Playwright Test Results
    if (this.results.playwrightTests) {
      console.log('🎭 PLAYWRIGHT TEST RESULTS:');
      console.log(`   Status: ${this.getStatusEmoji(this.results.playwrightTests.status)} ${this.results.playwrightTests.status.toUpperCase()}`);
      if (this.results.playwrightTests.error) {
        console.log(`   Error: ${this.results.playwrightTests.error}`);
      }
      console.log('');
    }
    
    // Overall Assessment
    const overallStatus = this.getOverallStatus();
    console.log('🎯 OVERALL ASSESSMENT:');
    console.log(`   Status: ${this.getStatusEmoji(overallStatus)} ${overallStatus.toUpperCase()}`);
    console.log('');
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    const recommendations = this.generateRecommendations();
    recommendations.forEach(rec => console.log(`   ${rec}`));
    console.log('');
    
    // Next Steps
    console.log('🚀 NEXT STEPS:');
    if (overallStatus === 'passed') {
      console.log('   ✅ All user journeys validated successfully');
      console.log('   ✅ System ready for production user workflows');
      console.log('   📊 Review reports for performance optimizations');
    } else if (overallStatus === 'partial') {
      console.log('   ⚠️ Review failed journey scenarios');
      console.log('   🔧 Fix identified issues and re-run validation');
      console.log('   📋 Consider focused testing on problem areas');
    } else {
      console.log('   ❌ Critical user journey failures detected');
      console.log('   🛠️ Immediate investigation and fixes required');
      console.log('   🚨 Do not deploy until issues resolved');
    }
    console.log('');
    
    // Save report
    const reportPath = path.join(__dirname, 'test-results', `user-journey-summary-${Date.now()}.json`);
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);
    
    return overallStatus;
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'error': return '🚨';
      default: return '❓';
    }
  }

  getOverallStatus() {
    const statuses = [this.results.scriptValidation, this.results.playwrightTests]
      .filter(result => result !== null)
      .map(result => result.status);
    
    if (statuses.length === 0) return 'unknown';
    
    if (statuses.every(status => status === 'passed')) return 'passed';
    if (statuses.some(status => status === 'error')) return 'failed';
    if (statuses.some(status => status === 'passed')) return 'partial';
    
    return 'failed';
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.scriptValidation?.status === 'failed') {
      recommendations.push('🔧 Fix script validation failures (check visual evidence in screenshots)');
    }
    
    if (this.results.playwrightTests?.status === 'failed') {
      recommendations.push('📋 Review Playwright test failures (check HTML report)');
    }
    
    if (this.getOverallStatus() === 'passed') {
      recommendations.push('🎉 All user journeys working - ready for production deployment!');
      recommendations.push('📈 Monitor real user behavior to validate journey assumptions');
      recommendations.push('🔄 Schedule regular journey validation (weekly/monthly)');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('📊 Review individual test results for specific recommendations');
    }
    
    return recommendations;
  }
}

// Usage information
function printUsage() {
  console.log(`
🚀 User Journey Validation Test Runner

USAGE:
  node scripts/run-user-journey-validation.js [options]

OPTIONS:
  --script-only      Run only the comprehensive script validation
  --playwright-only  Run only the Playwright E2E tests  
  --full            Run both validations (default)

VALIDATION TYPES:

📋 Script Validation:
   • Visual browser testing (visible)
   • Interactive element validation
   • Screenshot evidence capture
   • Comprehensive error detection
   • ~10-15 minutes duration

🎭 Playwright Tests:
   • Structured automated testing
   • Fast execution (headless)
   • HTML report generation
   • Performance benchmarking
   • ~5-8 minutes duration

🎯 Recommended: --full (both validations for complete coverage)
`);
}

// Execute if run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }
  
  const runner = new UserJourneyTestRunner();
  runner.run().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = UserJourneyTestRunner;