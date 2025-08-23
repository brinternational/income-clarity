#!/usr/bin/env node

/**
 * Environment Validation System CLI
 * 
 * Command-line interface for environment identification, validation,
 * and monitoring operations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class EnvironmentValidationCLI {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://incomeclarity.ddns.net' 
      : 'http://localhost:3000';
    this.args = process.argv.slice(2);
  }

  /**
   * Main entry point
   */
  async run() {
    try {
      if (this.args.length === 0) {
        this.showHelp();
        return;
      }

      const command = this.args[0];
      const subcommand = this.args[1];

      switch (command) {
        case 'fingerprint':
          await this.handleFingerprint();
          break;

        case 'compare':
          await this.handleCompare();
          break;

        case 'validate':
          await this.handleValidate(subcommand);
          break;

        case 'monitor':
          await this.handleMonitor(subcommand);
          break;

        case 'verify':
          await this.handleVerify(subcommand);
          break;

        case 'status':
          await this.handleStatus();
          break;

        case 'dashboard':
          await this.handleDashboard();
          break;

        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;

        default:
          console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
          this.showHelp();
          process.exit(1);
      }

    } catch (error) {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle fingerprint command
   */
  async handleFingerprint() {
    console.log(`${colors.cyan}🔍 Environment Fingerprint${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const response = await this.apiRequest('/api/environment?action=fingerprint');
      
      if (response.success) {
        this.displayEnvironmentFingerprint(response.data);
      } else {
        throw new Error(response.details || 'Failed to get environment fingerprint');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to get environment fingerprint: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle compare command
   */
  async handleCompare() {
    console.log(`${colors.cyan}⚖️  Environment Comparison${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const response = await this.apiRequest('/api/environment?action=compare');
      
      if (response.success) {
        this.displayEnvironmentComparison(response.data);
      } else {
        throw new Error(response.details || 'Failed to compare environments');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to compare environments: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle validate command
   */
  async handleValidate(target = 'production') {
    console.log(`${colors.cyan}✅ Environment Validation${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    const targetUrl = target === 'production' 
      ? 'https://incomeclarity.ddns.net'
      : target.startsWith('http') ? target : `http://${target}`;

    console.log(`${colors.blue}Validating target: ${targetUrl}${colors.reset}\n`);

    try {
      const response = await this.apiRequest(`/api/environment?action=validate&target=${encodeURIComponent(targetUrl)}`);
      
      if (response.success) {
        this.displayValidationResult(response.data, targetUrl);
      } else {
        throw new Error(response.details || 'Failed to validate environment');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to validate environment: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle monitor command
   */
  async handleMonitor(action = 'status') {
    switch (action) {
      case 'start':
        await this.startMonitoring();
        break;
      case 'stop':
        await this.stopMonitoring();
        break;
      case 'status':
      default:
        await this.getMonitoringStatus();
        break;
    }
  }

  /**
   * Start environment monitoring
   */
  async startMonitoring() {
    console.log(`${colors.cyan}🚀 Starting Environment Monitoring${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const environments = this.args.slice(2).length > 0 ? this.args.slice(2) : ['local', 'production'];
      
      const response = await this.apiRequest('/api/environment', 'POST', {
        action: 'start_monitoring',
        environments
      });

      if (response.success) {
        console.log(`${colors.green}✅ Monitoring started successfully${colors.reset}`);
        console.log(`${colors.blue}Session ID: ${response.data.sessionId}${colors.reset}`);
        console.log(`${colors.blue}Environments: ${response.data.environments.join(', ')}${colors.reset}\n`);
        
        console.log(`${colors.yellow}💡 Use 'npm run env:monitor status' to check monitoring status${colors.reset}`);
        console.log(`${colors.yellow}💡 Use 'npm run env:monitor stop' to stop monitoring${colors.reset}`);
      } else {
        throw new Error(response.details || 'Failed to start monitoring');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to start monitoring: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Stop environment monitoring
   */
  async stopMonitoring() {
    console.log(`${colors.cyan}🛑 Stopping Environment Monitoring${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const response = await this.apiRequest('/api/environment', 'POST', {
        action: 'stop_monitoring'
      });

      if (response.success) {
        console.log(`${colors.green}✅ Monitoring stopped successfully${colors.reset}`);
      } else {
        throw new Error(response.details || 'Failed to stop monitoring');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to stop monitoring: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Get monitoring status
   */
  async getMonitoringStatus() {
    console.log(`${colors.cyan}📊 Environment Monitoring Status${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const response = await this.apiRequest('/api/environment?action=status');
      
      if (response.success) {
        this.displayMonitoringStatus(response.data);
      } else {
        throw new Error(response.details || 'Failed to get monitoring status');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to get monitoring status: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle verify command
   */
  async handleVerify(target = 'production') {
    console.log(`${colors.cyan}🔍 Deployment Verification${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const expectedVersion = this.getFlag('--version') || this.getPackageVersion();
      const expectedCommit = this.getFlag('--commit') || this.getGitCommit();

      const response = await this.apiRequest('/api/environment', 'POST', {
        action: 'verify_deployment',
        target,
        expectedVersion,
        expectedCommit
      });

      if (response.success) {
        this.displayDeploymentVerification(response.data);
      } else {
        throw new Error(response.details || 'Failed to verify deployment');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to verify deployment: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle status command
   */
  async handleStatus() {
    console.log(`${colors.cyan}📋 Complete Environment Status${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    try {
      const response = await this.apiRequest('/api/environment?action=full&comparison=true&monitoring=true');
      
      if (response.success) {
        this.displayCompleteStatus(response.data);
      } else {
        throw new Error(response.details || 'Failed to get environment status');
      }

    } catch (error) {
      console.error(`${colors.red}Failed to get environment status: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Handle dashboard command
   */
  async handleDashboard() {
    console.log(`${colors.cyan}🎛️  Environment Dashboard${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    // This would open a web interface or display a real-time dashboard
    // For now, we'll show a quick overview and links
    
    console.log(`${colors.green}🌐 Environment Web Interfaces:${colors.reset}`);
    console.log(`${colors.blue}   Local:      ${colors.white}http://localhost:3000${colors.reset}`);
    console.log(`${colors.blue}   Production: ${colors.white}https://incomeclarity.ddns.net${colors.reset}\n`);

    console.log(`${colors.green}🔧 API Endpoints:${colors.reset}`);
    console.log(`${colors.blue}   Environment:   ${colors.white}/api/environment${colors.reset}`);
    console.log(`${colors.blue}   Health Check:  ${colors.white}/api/health${colors.reset}\n`);

    console.log(`${colors.green}📊 Quick Commands:${colors.reset}`);
    console.log(`${colors.yellow}   npm run env:fingerprint      ${colors.dim}# Get environment info${colors.reset}`);
    console.log(`${colors.yellow}   npm run env:compare          ${colors.dim}# Compare with production${colors.reset}`);
    console.log(`${colors.yellow}   npm run env:validate         ${colors.dim}# Validate production${colors.reset}`);
    console.log(`${colors.yellow}   npm run env:monitor start    ${colors.dim}# Start monitoring${colors.reset}`);
    console.log(`${colors.yellow}   npm run env:verify           ${colors.dim}# Verify deployment${colors.reset}`);
  }

  /**
   * Display environment fingerprint
   */
  displayEnvironmentFingerprint(env) {
    console.log(`${colors.green}Environment: ${colors.bright}${env.name}${colors.reset}`);
    console.log(`${colors.blue}Type: ${colors.white}${env.type}${colors.reset}`);
    console.log(`${colors.blue}Hostname: ${colors.white}${env.hostname}${colors.reset}`);
    console.log(`${colors.blue}Version: ${colors.white}${env.version}${colors.reset}`);
    console.log(`${colors.blue}Target: ${colors.white}${env.deploymentTarget}${colors.reset}`);
    console.log(`${colors.blue}Live: ${colors.white}${env.isLive ? '✅ Yes' : '❌ No'}${colors.reset}`);
    
    if (env.gitCommit) {
      console.log(`${colors.blue}Git Commit: ${colors.white}${env.gitCommit.substring(0, 8)}${colors.reset}`);
      console.log(`${colors.blue}Git Branch: ${colors.white}${env.gitBranch}${colors.reset}`);
    }

    console.log(`\n${colors.green}Configuration:${colors.reset}`);
    Object.entries(env.configuration).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`  ${colors.blue}${key}: ${colors.white}${status} ${value}${colors.reset}`);
    });

    console.log(`\n${colors.green}Security:${colors.reset}`);
    Object.entries(env.security).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`  ${colors.blue}${key}: ${colors.white}${status} ${value}${colors.reset}`);
    });

    if (env.capabilities.length > 0) {
      console.log(`\n${colors.green}Capabilities:${colors.reset}`);
      env.capabilities.forEach(cap => {
        console.log(`  ${colors.yellow}• ${cap}${colors.reset}`);
      });
    }
  }

  /**
   * Display environment comparison
   */
  displayEnvironmentComparison(comparison) {
    console.log(`${colors.green}Local Environment:${colors.reset}`);
    console.log(`  ${colors.blue}Name: ${colors.white}${comparison.local.name}${colors.reset}`);
    console.log(`  ${colors.blue}Type: ${colors.white}${comparison.local.type}${colors.reset}`);
    console.log(`  ${colors.blue}Version: ${colors.white}${comparison.local.version}${colors.reset}`);

    console.log(`\n${colors.green}Production Environment:${colors.reset}`);
    console.log(`  ${colors.blue}Name: ${colors.white}${comparison.production.name}${colors.reset}`);
    console.log(`  ${colors.blue}Type: ${colors.white}${comparison.production.type}${colors.reset}`);
    console.log(`  ${colors.blue}Version: ${colors.white}${comparison.production.version}${colors.reset}`);

    console.log(`\n${colors.green}Synchronization:${colors.reset}`);
    const syncColor = {
      synchronized: colors.green,
      drift: colors.yellow,
      outdated: colors.red,
      ahead: colors.blue
    }[comparison.syncStatus] || colors.white;
    
    console.log(`  ${colors.blue}Status: ${syncColor}${comparison.syncStatus.toUpperCase()}${colors.reset}`);
    
    const riskColor = {
      low: colors.green,
      medium: colors.yellow,
      high: colors.red,
      critical: colors.red + colors.bright
    }[comparison.riskLevel] || colors.white;
    
    console.log(`  ${colors.blue}Risk Level: ${riskColor}${comparison.riskLevel.toUpperCase()}${colors.reset}`);

    if (comparison.differences.length > 0) {
      console.log(`\n${colors.yellow}Differences Found: ${comparison.differences.length}${colors.reset}`);
      comparison.differences.forEach((diff, index) => {
        const impactColor = {
          low: colors.green,
          medium: colors.yellow,
          high: colors.red,
          critical: colors.red + colors.bright
        }[diff.impact] || colors.white;

        console.log(`\n  ${colors.cyan}${index + 1}. ${diff.category}/${diff.field}${colors.reset}`);
        console.log(`     ${colors.blue}Local: ${colors.white}${diff.localValue}${colors.reset}`);
        console.log(`     ${colors.blue}Production: ${colors.white}${diff.productionValue}${colors.reset}`);
        console.log(`     ${colors.blue}Impact: ${impactColor}${diff.impact.toUpperCase()}${colors.reset}`);
        console.log(`     ${colors.dim}${diff.recommendation}${colors.reset}`);
      });
    } else {
      console.log(`\n${colors.green}✅ No differences found - environments are synchronized${colors.reset}`);
    }
  }

  /**
   * Display validation result
   */
  displayValidationResult(result, targetUrl) {
    const statusColor = result.isValid ? colors.green : colors.red;
    const reachableColor = result.isReachable ? colors.green : colors.red;

    console.log(`${colors.blue}Target: ${colors.white}${targetUrl}${colors.reset}`);
    console.log(`${colors.blue}Valid: ${statusColor}${result.isValid ? '✅ Yes' : '❌ No'}${colors.reset}`);
    console.log(`${colors.blue}Reachable: ${reachableColor}${result.isReachable ? '✅ Yes' : '❌ No'}${colors.reset}`);
    console.log(`${colors.blue}Response Time: ${colors.white}${result.responseTime}ms${colors.reset}`);

    if (result.error) {
      console.log(`${colors.red}Error: ${result.error}${colors.reset}`);
    }

    if (result.environment) {
      console.log(`\n${colors.green}Environment Details:${colors.reset}`);
      console.log(`  ${colors.blue}Name: ${colors.white}${result.environment.name}${colors.reset}`);
      console.log(`  ${colors.blue}Version: ${colors.white}${result.environment.version}${colors.reset}`);
      console.log(`  ${colors.blue}Live: ${colors.white}${result.environment.isLive ? '✅ Yes' : '❌ No'}${colors.reset}`);
    }
  }

  /**
   * Display monitoring status
   */
  displayMonitoringStatus(data) {
    const activeColor = data.monitoring.isActive ? colors.green : colors.red;
    
    console.log(`${colors.blue}Monitoring Active: ${activeColor}${data.monitoring.isActive ? '✅ Yes' : '❌ No'}${colors.reset}`);
    
    if (data.monitoring.session) {
      console.log(`${colors.blue}Session ID: ${colors.white}${data.monitoring.session.id}${colors.reset}`);
      console.log(`${colors.blue}Started: ${colors.white}${new Date(data.monitoring.session.startTime).toLocaleString()}${colors.reset}`);
      console.log(`${colors.blue}Checks Performed: ${colors.white}${data.monitoring.session.checksPerformed}${colors.reset}`);
    }

    console.log(`${colors.blue}Environments: ${colors.white}${data.monitoring.environments.join(', ')}${colors.reset}`);
    console.log(`${colors.blue}Total Alerts: ${colors.white}${data.monitoring.totalAlerts}${colors.reset}`);
    console.log(`${colors.blue}Active Alerts: ${colors.white}${data.monitoring.activeAlerts}${colors.reset}`);

    if (Object.keys(data.environments).length > 0) {
      console.log(`\n${colors.green}Environment Status:${colors.reset}`);
      Object.entries(data.environments).forEach(([name, status]) => {
        const statusColor = {
          healthy: colors.green,
          degraded: colors.yellow,
          unhealthy: colors.red,
          unknown: colors.dim
        }[status.status] || colors.white;

        console.log(`\n  ${colors.cyan}${name}:${colors.reset}`);
        console.log(`    ${colors.blue}Status: ${statusColor}${status.status.toUpperCase()}${colors.reset}`);
        console.log(`    ${colors.blue}Last Check: ${colors.white}${new Date(status.lastCheck).toLocaleString()}${colors.reset}`);
        console.log(`    ${colors.blue}Response Time: ${colors.white}${status.responseTime}ms${colors.reset}`);
        console.log(`    ${colors.blue}Uptime: ${colors.white}${status.metrics.uptimePercentage}%${colors.reset}`);
        console.log(`    ${colors.blue}Success Rate: ${colors.white}${status.metrics.successRate}%${colors.reset}`);
      });
    }

    if (data.alerts && data.alerts.length > 0) {
      console.log(`\n${colors.yellow}Recent Alerts:${colors.reset}`);
      data.alerts.slice(0, 5).forEach(alert => {
        const severityColor = {
          info: colors.blue,
          warning: colors.yellow,
          error: colors.red,
          critical: colors.red + colors.bright
        }[alert.severity] || colors.white;

        console.log(`  ${severityColor}${alert.severity.toUpperCase()}${colors.reset} [${alert.environment}] ${alert.message}`);
        console.log(`    ${colors.dim}${new Date(alert.timestamp).toLocaleString()}${colors.reset}`);
      });
    }
  }

  /**
   * Display deployment verification
   */
  displayDeploymentVerification(result) {
    const statusColor = {
      success: colors.green,
      partial: colors.yellow,
      failed: colors.red
    }[result.overallStatus] || colors.white;

    console.log(`${colors.blue}Deployment ID: ${colors.white}${result.deploymentId}${colors.reset}`);
    console.log(`${colors.blue}Status: ${statusColor}${result.overallStatus.toUpperCase()}${colors.reset}`);
    console.log(`${colors.blue}Success Rate: ${colors.white}${result.successRate}%${colors.reset}`);
    console.log(`${colors.blue}Duration: ${colors.white}${result.duration}ms${colors.reset}`);

    console.log(`\n${colors.green}Verification Checks:${colors.reset}`);
    result.verificationChecks.forEach(check => {
      const statusColor = {
        passed: colors.green,
        failed: colors.red,
        warning: colors.yellow,
        skipped: colors.dim
      }[check.status] || colors.white;

      const statusIcon = {
        passed: '✅',
        failed: '❌',
        warning: '⚠️',
        skipped: '⏭️'
      }[check.status] || '❓';

      console.log(`  ${statusColor}${statusIcon} ${check.name}${colors.reset} (${check.duration}ms)`);
      
      if (check.error) {
        console.log(`    ${colors.red}Error: ${check.error}${colors.reset}`);
      }
    });

    if (result.recommendations.length > 0) {
      console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
      result.recommendations.forEach(rec => {
        console.log(`  ${colors.yellow}• ${rec}${colors.reset}`);
      });
    }
  }

  /**
   * Display complete status
   */
  displayCompleteStatus(data) {
    console.log(`${colors.green}Current Environment:${colors.reset}`);
    this.displayEnvironmentFingerprint(data.environment);

    if (data.comparison) {
      console.log(`\n${colors.cyan}Environment Comparison:${colors.reset}`);
      console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
      this.displayEnvironmentComparison(data.comparison);
    }

    if (data.monitoring) {
      console.log(`\n${colors.cyan}Monitoring Status:${colors.reset}`);
      console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
      console.log(`${colors.blue}Active: ${colors.white}${data.monitoring.isActive ? '✅ Yes' : '❌ No'}${colors.reset}`);
      console.log(`${colors.blue}Environments: ${colors.white}${data.monitoring.environments.join(', ')}${colors.reset}`);
    }
  }

  /**
   * Make API request
   */
  async apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return await response.json();
  }

  /**
   * Get command line flag value
   */
  getFlag(flag) {
    const index = this.args.indexOf(flag);
    return index !== -1 && index + 1 < this.args.length ? this.args[index + 1] : null;
  }

  /**
   * Get package version
   */
  getPackageVersion() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return pkg.version || '1.0.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Get Git commit hash
   */
  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`${colors.cyan}Environment Validation System${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    console.log(`${colors.green}USAGE:${colors.reset}`);
    console.log(`  node scripts/environment-validation-system.js <command> [options]\n`);

    console.log(`${colors.green}COMMANDS:${colors.reset}`);
    console.log(`  ${colors.yellow}fingerprint${colors.reset}          Get current environment fingerprint`);
    console.log(`  ${colors.yellow}compare${colors.reset}              Compare local with production environment`);
    console.log(`  ${colors.yellow}validate [target]${colors.reset}    Validate deployment target (default: production)`);
    console.log(`  ${colors.yellow}verify [target]${colors.reset}      Verify deployment to target`);
    console.log(`  ${colors.yellow}monitor <action>${colors.reset}     Monitor environments (start|stop|status)`);
    console.log(`  ${colors.yellow}status${colors.reset}               Show complete environment status`);
    console.log(`  ${colors.yellow}dashboard${colors.reset}            Show environment dashboard info`);
    console.log(`  ${colors.yellow}help${colors.reset}                 Show this help message\n`);

    console.log(`${colors.green}OPTIONS:${colors.reset}`);
    console.log(`  ${colors.blue}--version <version>${colors.reset}   Expected version for verification`);
    console.log(`  ${colors.blue}--commit <hash>${colors.reset}       Expected commit hash for verification\n`);

    console.log(`${colors.green}EXAMPLES:${colors.reset}`);
    console.log(`  ${colors.dim}# Get current environment info${colors.reset}`);
    console.log(`  node scripts/environment-validation-system.js fingerprint\n`);
    
    console.log(`  ${colors.dim}# Compare local with production${colors.reset}`);
    console.log(`  node scripts/environment-validation-system.js compare\n`);
    
    console.log(`  ${colors.dim}# Validate production environment${colors.reset}`);
    console.log(`  node scripts/environment-validation-system.js validate production\n`);
    
    console.log(`  ${colors.dim}# Start monitoring both environments${colors.reset}`);
    console.log(`  node scripts/environment-validation-system.js monitor start local production\n`);
    
    console.log(`  ${colors.dim}# Verify deployment with expected version${colors.reset}`);
    console.log(`  node scripts/environment-validation-system.js verify production --version 1.2.3\n`);
  }
}

// Run the CLI if this script is executed directly
if (require.main === module) {
  const cli = new EnvironmentValidationCLI();
  cli.run().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = EnvironmentValidationCLI;