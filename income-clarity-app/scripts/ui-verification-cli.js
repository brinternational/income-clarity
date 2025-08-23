#!/usr/bin/env node

/**
 * UI Verification CLI
 * 
 * Command-line interface for UI change verification system.
 * Provides easy access to UI verification functionality for deployment pipelines.
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

class UIVerificationCLI {
  constructor() {
    this.baseUrl = process.env.VERIFICATION_BASE_URL || 'http://localhost:3000';
    this.apiEndpoint = `${this.baseUrl}/api/environment`;
    this.configPath = join(process.cwd(), 'ui-verification.config.json');
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const parsed = {
      command: args[2],
      options: {},
      flags: []
    };

    for (let i = 3; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];
        
        if (nextArg && !nextArg.startsWith('--')) {
          parsed.options[key] = nextArg;
          i++; // Skip next argument as it's a value
        } else {
          parsed.flags.push(key);
        }
      }
    }

    return parsed;
  }

  /**
   * Display help information
   */
  showHelp() {
    console.log(`
🎨 UI Verification CLI

USAGE:
  node scripts/ui-verification-cli.js <command> [options]

COMMANDS:
  verify          Perform UI verification between two URLs
  status          Show UI verification status and history
  config          Manage UI verification configuration
  help            Show this help message

OPTIONS:
  --before <url>           Before URL for comparison
  --after <url>            After URL for comparison  
  --production             Use production URL (https://incomeclarity.ddns.net)
  --localhost              Use localhost URL (http://localhost:3000)
  --expected <changes>     Expected changes (comma-separated)
  --tolerance <number>     Pixel difference tolerance (0-1)
  --viewport <name>        Specific viewport to test
  --theme <light|dark>     Specific theme to test
  --progressive            Include Progressive Disclosure testing
  --accessibility          Include accessibility verification
  --performance            Include performance verification
  --responsive             Include responsive design verification
  --output <path>          Output directory for reports
  --format <json|md>       Output format for reports
  --verbose                Verbose output
  --quiet                  Minimal output

EXAMPLES:
  # Basic UI verification
  node scripts/ui-verification-cli.js verify --before "http://localhost:3000/dashboard" --after "https://incomeclarity.ddns.net/dashboard"

  # Production deployment verification
  node scripts/ui-verification-cli.js verify --production --before "http://localhost:3000" --after "https://incomeclarity.ddns.net"

  # Full verification with all features
  node scripts/ui-verification-cli.js verify --before "http://localhost:3000" --after "https://incomeclarity.ddns.net" --progressive --accessibility --performance --responsive

  # Check verification status
  node scripts/ui-verification-cli.js status

  # Update configuration
  node scripts/ui-verification-cli.js config --tolerance 0.05 --viewport desktop

PROGRESSIVE DISCLOSURE TESTING:
  Automatically tests these URL patterns:
  - ?level=momentum (Momentum Dashboard)
  - ?level=hero-view&hub=performance (Hero Views)
  - ?level=detailed&hub=performance&view=holdings (Detailed Views)

PRODUCTION ENVIRONMENT:
  Always uses: https://incomeclarity.ddns.net
  Authentication: test@example.com / password123

EXIT CODES:
  0 - Success (all verifications passed)
  1 - Warning (some issues found)
  2 - Error (verification failed)
  3 - Critical (accessibility or performance failures)
`);
  }

  /**
   * Perform UI verification
   */
  async performVerification(options) {
    try {
      let beforeUrl = options.before;
      let afterUrl = options.after;

      // Handle production/localhost shortcuts
      if (options.production) {
        afterUrl = afterUrl || 'https://incomeclarity.ddns.net/dashboard/super-cards';
        beforeUrl = beforeUrl || 'http://localhost:3000/dashboard/super-cards';
      }

      if (options.localhost) {
        beforeUrl = beforeUrl || 'http://localhost:3000/dashboard/super-cards';
        afterUrl = afterUrl || 'http://localhost:3000/dashboard/super-cards';
      }

      if (!beforeUrl || !afterUrl) {
        console.error('❌ Error: Both --before and --after URLs are required');
        process.exit(2);
      }

      if (!options.quiet) {
        console.log('🎨 Starting UI Verification...');
        console.log(`📋 Before URL: ${beforeUrl}`);
        console.log(`📋 After URL: ${afterUrl}`);
        console.log('');
      }

      // Prepare verification request
      const payload = {
        action: 'verify_ui_changes',
        beforeUrl,
        afterUrl,
        expectedChanges: options.expected ? options.expected.split(',') : undefined
      };

      // Call API
      const result = await this.callAPI('POST', payload);

      if (!result.success) {
        console.error('❌ UI Verification failed:', result.error);
        process.exit(2);
      }

      const verification = result.data;
      await this.displayVerificationResults(verification, options);

      // Determine exit code based on results
      const exitCode = this.determineExitCode(verification);
      process.exit(exitCode);

    } catch (error) {
      console.error('❌ UI Verification error:', error.message);
      process.exit(2);
    }
  }

  /**
   * Display verification results
   */
  async displayVerificationResults(verification, options) {
    const { overallStatus, successRate, duration } = verification;
    const statusEmoji = overallStatus === 'passed' ? '✅' : overallStatus === 'warning' ? '⚠️' : '❌';

    console.log(`${statusEmoji} UI Verification Complete`);
    console.log(`📊 Status: ${overallStatus.toUpperCase()}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log('');

    // Screenshot comparison results
    const { screenshotComparison } = verification;
    console.log('📸 Screenshot Comparison:');
    console.log(`  • Screenshots captured: ${screenshotComparison.beforeScreenshots.length + screenshotComparison.afterScreenshots.length}`);
    console.log(`  • Pixel difference: ${(screenshotComparison.overallPixelDifference * 100).toFixed(2)}%`);
    console.log(`  • Regression detected: ${screenshotComparison.regressionDetected ? 'Yes' : 'No'}`);
    console.log(`  • Significant changes: ${screenshotComparison.significantChanges.length}`);
    console.log('');

    // Accessibility results
    const { accessibilityResults } = verification;
    console.log('♿ Accessibility Verification:');
    console.log(`  • Overall score: ${accessibilityResults.overallAccessibilityScore}%`);
    console.log(`  • WCAG compliance: ${accessibilityResults.wcagCompliance.score}%`);
    console.log(`  • Violations: ${accessibilityResults.wcagCompliance.violations.length}`);
    console.log(`  • Keyboard accessible: ${accessibilityResults.keyboardNavigation.allInteractiveElementsReachable ? 'Yes' : 'No'}`);
    console.log('');

    // Performance results
    const { performanceResults } = verification;
    console.log('🚀 Performance Verification:');
    console.log(`  • Overall score: ${performanceResults.overallPerformanceScore}%`);
    console.log(`  • Core Web Vitals: ${performanceResults.coreWebVitals.overallGrade.toUpperCase()}`);
    console.log(`  • Performance regression: ${performanceResults.performanceRegression ? 'Yes' : 'No'}`);
    console.log(`  • Load time: ${performanceResults.performanceMetrics.loadTime}ms`);
    console.log('');

    // Responsive results
    const { responsiveResults } = verification;
    console.log('📱 Responsive Design:');
    console.log(`  • Overall score: ${responsiveResults.overallResponsiveScore}%`);
    console.log(`  • Layout consistency: ${responsiveResults.layoutConsistency ? 'Yes' : 'No'}`);
    console.log(`  • Touch targets adequate: ${responsiveResults.touchTargetSizes.minimumSizeMet ? 'Yes' : 'No'}`);
    console.log('');

    // Progressive Disclosure results
    const { progressiveDisclosureResults } = verification;
    console.log('🔄 Progressive Disclosure:');
    console.log(`  • Overall score: ${progressiveDisclosureResults.overallProgressiveScore}%`);
    console.log(`  • Navigation consistency: ${progressiveDisclosureResults.navigationConsistency ? 'Yes' : 'No'}`);
    console.log(`  • URL parameter handling: ${progressiveDisclosureResults.urlParameterHandling ? 'Yes' : 'No'}`);
    console.log('');

    // Detailed checks
    if (options.verbose) {
      console.log('🔍 Detailed Checks:');
      verification.verificationChecks.forEach(check => {
        const checkEmoji = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${checkEmoji} ${check.name} (${check.duration}ms)`);
        if (check.error && options.verbose) {
          console.log(`     Error: ${check.error}`);
        }
        if (check.recommendation && check.status !== 'passed') {
          console.log(`     💡 ${check.recommendation}`);
        }
      });
      console.log('');
    }

    // Recommendations
    if (verification.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      verification.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
      console.log('');
    }

    // Artifacts
    console.log('📁 Generated Artifacts:');
    console.log(`  • Report: ${verification.artifacts.reportPath}`);
    console.log(`  • Summary: ${verification.artifacts.summaryPath}`);
    console.log(`  • Screenshots: ${verification.artifacts.screenshotDirectory}`);
    console.log(`  • Diffs: ${verification.artifacts.diffDirectory}`);
    console.log('');

    // Save output if requested
    if (options.output) {
      await this.saveOutput(verification, options);
    }
  }

  /**
   * Show verification status and history
   */
  async showStatus() {
    try {
      console.log('📊 UI Verification Status\n');

      // Get current status
      const statusResult = await this.callAPI('GET', null, '?action=status');
      
      if (!statusResult.success) {
        console.error('❌ Failed to get status:', statusResult.error);
        process.exit(2);
      }

      const { uiVerification } = statusResult.data;

      // Show latest verification
      if (uiVerification.latestVerification) {
        const latest = uiVerification.latestVerification;
        const statusEmoji = latest.overallStatus === 'passed' ? '✅' : 
                           latest.overallStatus === 'warning' ? '⚠️' : '❌';
        
        console.log('🕐 Latest Verification:');
        console.log(`  ${statusEmoji} Status: ${latest.overallStatus.toUpperCase()}`);
        console.log(`  📈 Success Rate: ${latest.successRate}%`);
        console.log(`  🕒 Timestamp: ${new Date(latest.timestamp).toLocaleString()}`);
        console.log(`  ⏱️  Duration: ${latest.duration}ms`);
        console.log('');
      } else {
        console.log('ℹ️  No verifications performed yet\n');
      }

      // Get full history
      const historyResult = await this.callAPI('GET', null, '?action=ui_history');
      
      if (historyResult.success) {
        const { history, config } = historyResult.data;
        
        console.log(`📚 Verification History (${history.length} total):`);
        
        if (history.length > 0) {
          history.slice(0, 5).forEach((verification, index) => {
            const statusEmoji = verification.overallStatus === 'passed' ? '✅' : 
                               verification.overallStatus === 'warning' ? '⚠️' : '❌';
            const date = new Date(verification.timestamp).toLocaleDateString();
            console.log(`  ${index + 1}. ${statusEmoji} ${verification.successRate}% - ${date} (${verification.duration}ms)`);
          });
          
          if (history.length > 5) {
            console.log(`  ... and ${history.length - 5} more`);
          }
        } else {
          console.log('  No verification history available');
        }
        console.log('');

        // Show configuration
        console.log('⚙️  Current Configuration:');
        console.log(`  • Screenshot tolerance: ${(config.comparisonTolerance * 100).toFixed(1)}%`);
        console.log(`  • Accessibility standard: ${config.accessibilityStandard}`);
        console.log(`  • Viewports: ${config.viewports.map(v => v.name).join(', ')}`);
        console.log(`  • Features enabled: ${[
          config.enableAccessibility && 'Accessibility',
          config.enablePerformance && 'Performance',
          config.enableResponsive && 'Responsive',
          config.enableDarkMode && 'Dark Mode',
          config.enableProgressive && 'Progressive Disclosure'
        ].filter(Boolean).join(', ')}`);
      }

    } catch (error) {
      console.error('❌ Status check error:', error.message);
      process.exit(2);
    }
  }

  /**
   * Manage configuration
   */
  async manageConfig(options) {
    try {
      console.log('⚙️  UI Verification Configuration\n');

      if (Object.keys(options).length === 0) {
        // Show current configuration
        const result = await this.callAPI('GET', null, '?action=ui_history');
        
        if (result.success) {
          const { config } = result.data;
          console.log('Current Configuration:');
          console.log(JSON.stringify(config, null, 2));
        }
        return;
      }

      // Update configuration
      const configUpdates = {};

      if (options.tolerance) {
        configUpdates.comparisonTolerance = parseFloat(options.tolerance);
      }

      if (options.viewport) {
        // This would need more complex logic to update viewport config
        console.log('⚠️  Viewport configuration updates require manual editing');
      }

      if (options.accessibility) {
        configUpdates.enableAccessibility = options.accessibility === 'true';
      }

      if (options.performance) {
        configUpdates.enablePerformance = options.performance === 'true';
      }

      if (options.responsive) {
        configUpdates.enableResponsive = options.responsive === 'true';
      }

      if (options.progressive) {
        configUpdates.enableProgressive = options.progressive === 'true';
      }

      if (options['dark-mode']) {
        configUpdates.enableDarkMode = options['dark-mode'] === 'true';
      }

      if (Object.keys(configUpdates).length > 0) {
        const result = await this.callAPI('POST', {
          action: 'update_ui_config',
          uiConfig: configUpdates
        });

        if (result.success) {
          console.log('✅ Configuration updated successfully');
          console.log('Updated settings:');
          console.log(JSON.stringify(configUpdates, null, 2));
        } else {
          console.error('❌ Configuration update failed:', result.error);
          process.exit(2);
        }
      } else {
        console.log('ℹ️  No configuration changes specified');
      }

    } catch (error) {
      console.error('❌ Configuration error:', error.message);
      process.exit(2);
    }
  }

  /**
   * Call API endpoint
   */
  async callAPI(method, payload, queryParams = '') {
    const url = `${this.apiEndpoint}${queryParams}`;
    
    const command = method === 'GET' 
      ? `curl -s -X GET "${url}"`
      : `curl -s -X POST "${url}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`;

    try {
      const response = execSync(command, { encoding: 'utf8' });
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  /**
   * Save verification output
   */
  async saveOutput(verification, options) {
    const outputPath = options.output;
    const format = options.format || 'json';

    try {
      if (format === 'json') {
        const jsonPath = join(outputPath, `ui-verification-${verification.verificationId}.json`);
        writeFileSync(jsonPath, JSON.stringify(verification, null, 2));
        console.log(`💾 JSON report saved: ${jsonPath}`);
      }

      if (format === 'md') {
        // Use the summary that was already generated
        const mdPath = join(outputPath, `ui-verification-${verification.verificationId}.md`);
        const summaryContent = readFileSync(verification.artifacts.summaryPath, 'utf8');
        writeFileSync(mdPath, summaryContent);
        console.log(`💾 Markdown report saved: ${mdPath}`);
      }

    } catch (error) {
      console.error('⚠️  Failed to save output:', error.message);
    }
  }

  /**
   * Determine exit code based on verification results
   */
  determineExitCode(verification) {
    const { overallStatus, accessibilityResults, performanceResults } = verification;

    // Critical failures
    if (overallStatus === 'failed') return 3;
    
    // Accessibility critical issues
    const criticalA11yViolations = accessibilityResults.wcagCompliance.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    if (criticalA11yViolations.length > 0) return 3;

    // Performance critical issues
    if (performanceResults.coreWebVitals.overallGrade === 'poor') return 3;

    // Warnings
    if (overallStatus === 'warning') return 1;

    // Success
    return 0;
  }

  /**
   * Main CLI entry point
   */
  async run() {
    const args = process.argv;
    const parsed = this.parseArgs(args);

    switch (parsed.command) {
      case 'verify':
        await this.performVerification(parsed.options);
        break;

      case 'status':
        await this.showStatus();
        break;

      case 'config':
        await this.manageConfig(parsed.options);
        break;

      case 'help':
      case '--help':
      case '-h':
      default:
        this.showHelp();
        break;
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new UIVerificationCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(2);
  });
}

module.exports = UIVerificationCLI;