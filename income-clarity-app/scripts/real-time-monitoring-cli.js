#!/usr/bin/env node

/**
 * Real-Time Monitoring CLI
 * 
 * Command-line interface for managing real-time monitoring and alerting system.
 * Provides comprehensive monitoring control, configuration management, and dashboard access.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const Table = require('cli-table3');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

// CLI Configuration
const CLI_VERSION = '1.0.0';
const DEFAULT_BASE_URL = 'http://localhost:3000';
const CONFIG_FILE = path.join(process.cwd(), 'monitoring-config.json');

class RealTimeMonitoringCLI {
  constructor() {
    this.baseUrl = process.env.MONITORING_BASE_URL || DEFAULT_BASE_URL;
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('rtm-cli')
      .description('Real-Time Monitoring CLI for Income Clarity')
      .version(CLI_VERSION)
      .option('-u, --url <url>', 'Base URL for the monitoring API', DEFAULT_BASE_URL)
      .option('-v, --verbose', 'Enable verbose logging')
      .option('--no-color', 'Disable colored output');

    // Status commands
    this.program
      .command('status')
      .description('Show monitoring system status')
      .option('-d, --dashboard', 'Show dashboard data')
      .option('-a, --alerts', 'Show active alerts')
      .option('-m, --metrics', 'Show latest metrics')
      .action(this.handleStatus.bind(this));

    // Start monitoring
    this.program
      .command('start')
      .description('Start real-time monitoring')
      .option('-c, --config <file>', 'Configuration file path')
      .option('--intervals <json>', 'Monitoring intervals as JSON')
      .option('--thresholds <json>', 'Alert thresholds as JSON')
      .action(this.handleStart.bind(this));

    // Stop monitoring
    this.program
      .command('stop')
      .description('Stop real-time monitoring')
      .action(this.handleStop.bind(this));

    // Restart monitoring
    this.program
      .command('restart')
      .description('Restart real-time monitoring')
      .option('-c, --config <file>', 'Configuration file path')
      .action(this.handleRestart.bind(this));

    // Dashboard command
    this.program
      .command('dashboard')
      .description('Show real-time monitoring dashboard')
      .option('-w, --watch', 'Continuous dashboard updates')
      .option('-i, --interval <seconds>', 'Update interval for watch mode', '5')
      .action(this.handleDashboard.bind(this));

    // Alerts commands
    const alertsCmd = this.program
      .command('alerts')
      .description('Manage monitoring alerts');

    alertsCmd
      .command('list')
      .description('List monitoring alerts')
      .option('-l, --limit <number>', 'Limit number of alerts', '50')
      .option('-s, --severity <level>', 'Filter by severity (info|warning|error|critical)')
      .option('-c, --category <category>', 'Filter by category')
      .action(this.handleAlertsList.bind(this));

    alertsCmd
      .command('resolve <alertId>')
      .description('Resolve a specific alert')
      .action(this.handleAlertsResolve.bind(this));

    alertsCmd
      .command('test')
      .description('Test alert system')
      .action(this.handleAlertsTest.bind(this));

    // Metrics commands
    const metricsCmd = this.program
      .command('metrics')
      .description('View monitoring metrics');

    metricsCmd
      .command('show')
      .description('Show latest metrics')
      .option('-l, --limit <number>', 'Number of metric records', '10')
      .option('-c, --category <category>', 'Metric category (system|api|database|integration|ui|session|progressive)')
      .action(this.handleMetricsShow.bind(this));

    metricsCmd
      .command('trends')
      .description('Show metric trends')
      .option('-m, --metric <name>', 'Specific metric name')
      .option('-p, --period <hours>', 'Time period in hours', '24')
      .action(this.handleMetricsTrends.bind(this));

    // Configuration commands
    const configCmd = this.program
      .command('config')
      .description('Manage monitoring configuration');

    configCmd
      .command('show')
      .description('Show current configuration')
      .action(this.handleConfigShow.bind(this));

    configCmd
      .command('update <file>')
      .description('Update configuration from file')
      .action(this.handleConfigUpdate.bind(this));

    configCmd
      .command('set <key> <value>')
      .description('Set configuration value')
      .action(this.handleConfigSet.bind(this));

    configCmd
      .command('export [file]')
      .description('Export current configuration')
      .action(this.handleConfigExport.bind(this));

    // Health check command
    this.program
      .command('health')
      .description('Trigger manual health check')
      .option('-w, --wait', 'Wait for completion')
      .action(this.handleHealth.bind(this));

    // Environment validation
    this.program
      .command('validate')
      .description('Validate monitoring environment')
      .option('-t, --target <url>', 'Target environment URL')
      .action(this.handleValidate.bind(this));

    // Circuit breaker status
    this.program
      .command('circuits')
      .description('Show circuit breaker status')
      .action(this.handleCircuits.bind(this));

    // Log viewing
    this.program
      .command('logs')
      .description('View monitoring logs')
      .option('-f, --follow', 'Follow log output')
      .option('-n, --lines <number>', 'Number of lines to show', '100')
      .option('-l, --level <level>', 'Log level filter')
      .action(this.handleLogs.bind(this));
  }

  async handleStatus(options) {
    const spinner = ora('Fetching monitoring status...').start();

    try {
      const status = await this.apiCall('GET', '/api/environment?action=realtime_status');
      
      spinner.succeed('Monitoring status retrieved');

      this.printHeader('Real-Time Monitoring Status');
      
      // Basic status
      const statusTable = new Table({
        head: ['Property', 'Value'],
        colWidths: [25, 40]
      });

      statusTable.push(
        ['Running', status.isRunning ? chalk.green('✓ Yes') : chalk.red('✗ No')],
        ['Uptime', this.formatDuration(status.uptime)],
        ['Active Intervals', status.activeIntervals.join(', ')],
        ['Total Alerts', status.totalAlerts.toString()],
        ['Total Metrics', status.totalMetrics.toString()]
      );

      console.log(statusTable.toString());

      // Health score
      if (status.healthScore) {
        console.log('\\n' + chalk.bold('Health Score:'));
        
        const healthTable = new Table({
          head: ['Component', 'Score', 'Status'],
          colWidths: [20, 10, 15]
        });

        const getHealthStatus = (score) => {
          if (score >= 90) return chalk.green('Excellent');
          if (score >= 80) return chalk.yellow('Good');
          if (score >= 60) return chalk.orange('Fair');
          return chalk.red('Poor');
        };

        healthTable.push(
          ['Overall', status.healthScore.overall, getHealthStatus(status.healthScore.overall)],
          ['System', status.healthScore.breakdown.system, getHealthStatus(status.healthScore.breakdown.system)],
          ['API', status.healthScore.breakdown.api, getHealthStatus(status.healthScore.breakdown.api)],
          ['Database', status.healthScore.breakdown.database, getHealthStatus(status.healthScore.breakdown.database)],
          ['Integration', status.healthScore.breakdown.integration, getHealthStatus(status.healthScore.breakdown.integration)],
          ['UI', status.healthScore.breakdown.ui, getHealthStatus(status.healthScore.breakdown.ui)],
          ['Session', status.healthScore.breakdown.session, getHealthStatus(status.healthScore.breakdown.session)],
          ['Progressive', status.healthScore.breakdown.progressive, getHealthStatus(status.healthScore.breakdown.progressive)]
        );

        console.log(healthTable.toString());
        
        const trend = status.healthScore.trend;
        const trendColor = trend === 'improving' ? chalk.green : 
                         trend === 'degrading' ? chalk.red : chalk.yellow;
        console.log(`\\nTrend: ${trendColor(trend.toUpperCase())}`);
      }

      // Show dashboard data if requested
      if (options.dashboard) {
        await this.showDashboard();
      }

      // Show alerts if requested
      if (options.alerts) {
        await this.showActiveAlerts();
      }

      // Show metrics if requested
      if (options.metrics) {
        await this.showLatestMetrics();
      }

    } catch (error) {
      spinner.fail('Failed to fetch status');
      this.handleError(error);
    }
  }

  async handleStart(options) {
    const spinner = ora('Starting real-time monitoring...').start();

    try {
      let config = {};

      // Load configuration from file if specified
      if (options.config) {
        const configPath = path.resolve(options.config);
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          spinner.text = `Starting with config from ${configPath}...`;
        } else {
          throw new Error(`Configuration file not found: ${configPath}`);
        }
      }

      // Override with command line options
      if (options.intervals) {
        config.intervals = JSON.parse(options.intervals);
      }

      if (options.thresholds) {
        config.thresholds = JSON.parse(options.thresholds);
      }

      const result = await this.apiCall('POST', '/api/environment', {
        action: 'start_realtime_monitoring',
        monitoringConfig: Object.keys(config).length > 0 ? config : undefined
      });

      spinner.succeed('Real-time monitoring started successfully');

      console.log(chalk.green('\\n✓ Monitoring System Active'));
      console.log(`Started at: ${new Date().toLocaleString()}`);
      
      if (result.status) {
        console.log(`Active intervals: ${result.status.activeIntervals.join(', ')}`);
      }

      // Show status after start
      setTimeout(() => this.handleStatus({}), 1000);

    } catch (error) {
      spinner.fail('Failed to start monitoring');
      this.handleError(error);
    }
  }

  async handleStop(options) {
    const spinner = ora('Stopping real-time monitoring...').start();

    try {
      await this.apiCall('POST', '/api/environment', {
        action: 'stop_realtime_monitoring'
      });

      spinner.succeed('Real-time monitoring stopped successfully');
      console.log(chalk.yellow('\\n⚠ Monitoring System Stopped'));
      console.log(`Stopped at: ${new Date().toLocaleString()}`);

    } catch (error) {
      spinner.fail('Failed to stop monitoring');
      this.handleError(error);
    }
  }

  async handleRestart(options) {
    const spinner = ora('Restarting real-time monitoring...').start();

    try {
      // Stop first
      spinner.text = 'Stopping monitoring...';
      await this.apiCall('POST', '/api/environment', {
        action: 'stop_realtime_monitoring'
      });

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Start with config
      spinner.text = 'Starting monitoring...';
      let config = {};

      if (options.config) {
        const configPath = path.resolve(options.config);
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
      }

      await this.apiCall('POST', '/api/environment', {
        action: 'start_realtime_monitoring',
        monitoringConfig: Object.keys(config).length > 0 ? config : undefined
      });

      spinner.succeed('Real-time monitoring restarted successfully');
      console.log(chalk.green('\\n✓ Monitoring System Restarted'));

    } catch (error) {
      spinner.fail('Failed to restart monitoring');
      this.handleError(error);
    }
  }

  async handleDashboard(options) {
    if (options.watch) {
      const interval = parseInt(options.interval) * 1000;
      console.log(chalk.blue(`\\n📊 Real-Time Dashboard (updating every ${options.interval}s)`));
      console.log(chalk.gray('Press Ctrl+C to exit\\n'));

      const updateDashboard = async () => {
        try {
          // Clear screen
          process.stdout.write('\\x1Bc');
          
          console.log(chalk.blue('📊 Real-Time Monitoring Dashboard'));
          console.log(chalk.gray(`Last updated: ${new Date().toLocaleString()}\\n`));

          await this.showDashboard();
        } catch (error) {
          console.error(chalk.red('Dashboard update failed:'), error.message);
        }
      };

      // Initial load
      await updateDashboard();

      // Set up interval
      const dashboardInterval = setInterval(updateDashboard, interval);

      // Handle Ctrl+C
      process.on('SIGINT', () => {
        clearInterval(dashboardInterval);
        console.log(chalk.yellow('\\n\\nDashboard monitoring stopped.'));
        process.exit(0);
      });

    } else {
      await this.showDashboard();
    }
  }

  async showDashboard() {
    try {
      const dashboard = await this.apiCall('GET', '/api/environment?action=realtime_dashboard');

      // System overview
      console.log(chalk.bold('System Overview:'));
      const overviewTable = new Table({
        head: ['Metric', 'Value'],
        colWidths: [25, 30]
      });

      const statusColor = dashboard.status === 'healthy' ? chalk.green : 
                         dashboard.status === 'degraded' ? chalk.yellow : chalk.red;

      overviewTable.push(
        ['Status', statusColor(dashboard.status.toUpperCase())],
        ['Uptime', dashboard.systemOverview.uptime],
        ['Environment', dashboard.systemOverview.environment],
        ['Total Requests', dashboard.systemOverview.totalRequests.toLocaleString()],
        ['Current Users', dashboard.systemOverview.currentUsers.toString()],
        ['Error Rate', `${(dashboard.systemOverview.errorRate * 100).toFixed(2)}%`],
        ['Avg Response Time', `${dashboard.systemOverview.averageResponseTime}ms`]
      );

      console.log(overviewTable.toString());

      // Active alerts
      if (dashboard.activeAlerts.length > 0) {
        console.log('\\n' + chalk.bold('Active Alerts:'));
        const alertsTable = new Table({
          head: ['Severity', 'Category', 'Title', 'Time'],
          colWidths: [10, 15, 35, 20]
        });

        dashboard.activeAlerts.slice(0, 5).forEach(alert => {
          const severityColor = alert.severity === 'critical' ? chalk.red :
                               alert.severity === 'error' ? chalk.orange :
                               alert.severity === 'warning' ? chalk.yellow : chalk.blue;

          alertsTable.push([
            severityColor(alert.severity.toUpperCase()),
            alert.category,
            alert.title,
            new Date(alert.timestamp).toLocaleTimeString()
          ]);
        });

        console.log(alertsTable.toString());

        if (dashboard.activeAlerts.length > 5) {
          console.log(chalk.gray(`... and ${dashboard.activeAlerts.length - 5} more alerts`));
        }
      } else {
        console.log('\\n' + chalk.green('✓ No active alerts'));
      }

      // Health score breakdown
      if (dashboard.healthScore) {
        console.log('\\n' + chalk.bold('Health Score Breakdown:'));
        const healthTable = new Table({
          head: ['Component', 'Score', 'Bar'],
          colWidths: [15, 8, 25]
        });

        Object.entries(dashboard.healthScore.breakdown).forEach(([component, score]) => {
          const bar = this.createProgressBar(score, 20);
          healthTable.push([
            component.charAt(0).toUpperCase() + component.slice(1),
            score.toString(),
            bar
          ]);
        });

        console.log(healthTable.toString());
      }

    } catch (error) {
      console.error(chalk.red('Failed to load dashboard:'), error.message);
    }
  }

  async showActiveAlerts() {
    try {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_alerts&limit=10');
      const alerts = response.alerts.filter(alert => !alert.resolved);

      if (alerts.length === 0) {
        console.log('\\n' + chalk.green('✓ No active alerts'));
        return;
      }

      console.log('\\n' + chalk.bold('Active Alerts:'));
      
      alerts.forEach(alert => {
        const severityColor = alert.severity === 'critical' ? chalk.red :
                             alert.severity === 'error' ? chalk.orange :
                             alert.severity === 'warning' ? chalk.yellow : chalk.blue;

        console.log(`\\n${severityColor('●')} ${severityColor(alert.severity.toUpperCase())} - ${alert.title}`);
        console.log(`   ${chalk.gray('Category:')} ${alert.category}`);
        console.log(`   ${chalk.gray('Source:')} ${alert.source}`);
        console.log(`   ${chalk.gray('Time:')} ${new Date(alert.timestamp).toLocaleString()}`);
        console.log(`   ${chalk.gray('Message:')} ${alert.message}`);
        
        if (alert.metadata && Object.keys(alert.metadata).length > 0) {
          console.log(`   ${chalk.gray('Metadata:')} ${JSON.stringify(alert.metadata, null, 2)}`);
        }
      });

    } catch (error) {
      console.error(chalk.red('Failed to load alerts:'), error.message);
    }
  }

  async showLatestMetrics() {
    try {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      
      if (response.metrics.length === 0) {
        console.log('\\n' + chalk.yellow('No metrics available'));
        return;
      }

      const metrics = response.metrics[0];
      
      console.log('\\n' + chalk.bold('Latest Metrics:'));
      console.log(`Timestamp: ${new Date(metrics.timestamp).toLocaleString()}`);
      console.log(`Environment: ${metrics.environment}`);

      // System metrics
      console.log('\\n' + chalk.bold('System:'));
      console.log(`  Memory: ${metrics.system.memoryUsage.used}MB / ${metrics.system.memoryUsage.total}MB (${metrics.system.memoryUsage.percentage}%)`);
      console.log(`  CPU: ${metrics.system.cpuUsage}%`);
      console.log(`  Disk: ${metrics.system.diskUsage.used}MB / ${metrics.system.diskUsage.total}MB (${metrics.system.diskUsage.percentage}%)`);

      // API metrics
      console.log('\\n' + chalk.bold('API:'));
      console.log(`  Total Requests: ${metrics.api.totalRequests}`);
      console.log(`  Error Rate: ${(metrics.api.errorRate * 100).toFixed(2)}%`);
      console.log(`  Avg Response Time: ${metrics.api.averageResponseTime}ms`);
      console.log(`  Slowest Endpoint: ${metrics.api.slowestEndpoint}`);

      // Database metrics
      console.log('\\n' + chalk.bold('Database:'));
      console.log(`  Health: ${metrics.database.healthStatus}`);
      console.log(`  Avg Query Time: ${metrics.database.queryPerformance.averageTime}ms`);
      console.log(`  Successful Transactions: ${metrics.database.transactionStats.successful}`);
      console.log(`  Failed Transactions: ${metrics.database.transactionStats.failed}`);

    } catch (error) {
      console.error(chalk.red('Failed to load metrics:'), error.message);
    }
  }

  async handleAlertsList(options) {
    const spinner = ora('Fetching alerts...').start();

    try {
      const limit = parseInt(options.limit);
      const response = await this.apiCall('GET', `/api/environment?action=realtime_alerts&limit=${limit}`);
      
      spinner.succeed(`Found ${response.alerts.length} alerts`);

      if (response.alerts.length === 0) {
        console.log(chalk.green('\\n✓ No alerts found'));
        return;
      }

      // Filter alerts if options provided
      let filteredAlerts = response.alerts;

      if (options.severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === options.severity);
      }

      if (options.category) {
        filteredAlerts = filteredAlerts.filter(alert => alert.category === options.category);
      }

      // Display alerts table
      const alertsTable = new Table({
        head: ['ID', 'Severity', 'Category', 'Title', 'Status', 'Time'],
        colWidths: [12, 10, 15, 30, 10, 20]
      });

      filteredAlerts.forEach(alert => {
        const severityColor = alert.severity === 'critical' ? chalk.red :
                             alert.severity === 'error' ? chalk.orange :
                             alert.severity === 'warning' ? chalk.yellow : chalk.blue;

        const statusColor = alert.resolved ? chalk.green : chalk.red;
        const status = alert.resolved ? '✓ Resolved' : '● Active';

        alertsTable.push([
          alert.id.substring(0, 10) + '...',
          severityColor(alert.severity),
          alert.category,
          alert.title.substring(0, 28) + (alert.title.length > 28 ? '...' : ''),
          statusColor(status),
          new Date(alert.timestamp).toLocaleString()
        ]);
      });

      console.log('\\n' + alertsTable.toString());

      // Summary
      const active = filteredAlerts.filter(a => !a.resolved).length;
      const resolved = filteredAlerts.filter(a => a.resolved).length;
      
      console.log(`\\nSummary: ${chalk.red(active + ' active')}, ${chalk.green(resolved + ' resolved')}`);

    } catch (error) {
      spinner.fail('Failed to fetch alerts');
      this.handleError(error);
    }
  }

  async handleAlertsResolve(alertId, options) {
    const spinner = ora(`Resolving alert ${alertId}...`).start();

    try {
      const result = await this.apiCall('POST', '/api/environment', {
        action: 'resolve_realtime_alert',
        realtimeAlertId: alertId
      });

      if (result.resolved) {
        spinner.succeed('Alert resolved successfully');
        console.log(chalk.green(`\\n✓ Alert ${alertId} has been resolved`));
      } else {
        spinner.warn('Alert not found or already resolved');
        console.log(chalk.yellow(`\\n⚠ Alert ${alertId} was not found or already resolved`));
      }

    } catch (error) {
      spinner.fail('Failed to resolve alert');
      this.handleError(error);
    }
  }

  async handleAlertsTest(options) {
    const spinner = ora('Testing alert system...').start();

    try {
      await this.apiCall('POST', '/api/environment', {
        action: 'test_alerts'
      });

      spinner.succeed('Alert system test completed');
      console.log(chalk.green('\\n✓ Alert system test completed successfully'));
      console.log(chalk.gray('Check your configured alert channels for test messages'));

    } catch (error) {
      spinner.fail('Alert system test failed');
      this.handleError(error);
    }
  }

  async handleMetricsShow(options) {
    const spinner = ora('Fetching metrics...').start();

    try {
      const limit = parseInt(options.limit);
      const response = await this.apiCall('GET', `/api/environment?action=realtime_metrics&limit=${limit}`);
      
      spinner.succeed(`Retrieved ${response.metrics.length} metric records`);

      if (response.metrics.length === 0) {
        console.log(chalk.yellow('\\nNo metrics available'));
        return;
      }

      // Show metrics table
      const metricsTable = new Table({
        head: ['Timestamp', 'Environment', 'API Resp.', 'Error Rate', 'Memory', 'CPU'],
        colWidths: [20, 15, 12, 12, 12, 8]
      });

      response.metrics.reverse().forEach(metric => {
        metricsTable.push([
          new Date(metric.timestamp).toLocaleTimeString(),
          metric.environment.substring(0, 12) + '...',
          `${metric.api.averageResponseTime}ms`,
          `${(metric.api.errorRate * 100).toFixed(1)}%`,
          `${metric.system.memoryUsage.percentage}%`,
          `${metric.system.cpuUsage}%`
        ]);
      });

      console.log('\\n' + metricsTable.toString());

      // Show category-specific metrics if requested
      if (options.category) {
        this.showCategoryMetrics(response.metrics[0], options.category);
      }

    } catch (error) {
      spinner.fail('Failed to fetch metrics');
      this.handleError(error);
    }
  }

  showCategoryMetrics(metrics, category) {
    console.log(`\\n${chalk.bold(category.toUpperCase())} Metrics:`);

    switch (category) {
      case 'system':
        console.log(`Memory: ${metrics.system.memoryUsage.used}MB / ${metrics.system.memoryUsage.total}MB`);
        console.log(`CPU: ${metrics.system.cpuUsage}%`);
        console.log(`Disk: ${metrics.system.diskUsage.percentage}%`);
        console.log(`Uptime: ${this.formatDuration(metrics.system.uptime)}`);
        break;

      case 'api':
        console.log(`Total Requests: ${metrics.api.totalRequests}`);
        console.log(`Successful: ${metrics.api.successfulRequests}`);
        console.log(`Failed: ${metrics.api.failedRequests}`);
        console.log(`Error Rate: ${(metrics.api.errorRate * 100).toFixed(2)}%`);
        console.log(`Avg Response Time: ${metrics.api.averageResponseTime}ms`);
        break;

      case 'database':
        console.log(`Health: ${metrics.database.healthStatus}`);
        console.log(`Active Connections: ${metrics.database.connectionPool.active}`);
        console.log(`Avg Query Time: ${metrics.database.queryPerformance.averageTime}ms`);
        console.log(`Successful Transactions: ${metrics.database.transactionStats.successful}`);
        break;

      case 'integration':
        console.log(`Yodlee: ${metrics.integration.yodlee.status} (${metrics.integration.yodlee.responseTime}ms)`);
        console.log(`Polygon: ${metrics.integration.polygon.status} (${metrics.integration.polygon.responseTime}ms)`);
        break;

      default:
        console.log(chalk.yellow(`Category '${category}' not recognized`));
    }
  }

  async handleMetricsTrends(options) {
    console.log(chalk.blue('\\n📈 Metric Trends'));
    console.log(chalk.gray('(Trend analysis feature coming soon)'));
  }

  async handleConfigShow(options) {
    const spinner = ora('Fetching configuration...').start();

    try {
      // For now, show the status which includes some config info
      const status = await this.apiCall('GET', '/api/environment?action=realtime_status');
      
      spinner.succeed('Configuration retrieved');

      console.log(chalk.bold('\\nCurrent Monitoring Configuration:'));
      console.log(JSON.stringify({
        isRunning: status.isRunning,
        activeIntervals: status.activeIntervals,
        totalAlerts: status.totalAlerts,
        totalMetrics: status.totalMetrics
      }, null, 2));

    } catch (error) {
      spinner.fail('Failed to fetch configuration');
      this.handleError(error);
    }
  }

  async handleConfigUpdate(file, options) {
    const spinner = ora(`Updating configuration from ${file}...`).start();

    try {
      const configPath = path.resolve(file);
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      await this.apiCall('POST', '/api/environment', {
        action: 'update_realtime_config',
        realtimeConfig: config
      });

      spinner.succeed('Configuration updated successfully');
      console.log(chalk.green(`\\n✓ Configuration updated from ${file}`));

    } catch (error) {
      spinner.fail('Failed to update configuration');
      this.handleError(error);
    }
  }

  async handleConfigSet(key, value, options) {
    console.log(chalk.blue(`\\nSetting ${key} = ${value}`));
    console.log(chalk.gray('(Individual config setting feature coming soon)'));
  }

  async handleConfigExport(file, options) {
    const targetFile = file || 'monitoring-config-export.json';
    
    console.log(chalk.blue(`\\nExporting configuration to ${targetFile}`));
    console.log(chalk.gray('(Configuration export feature coming soon)'));
  }

  async handleHealth(options) {
    const spinner = ora('Triggering health check...').start();

    try {
      const result = await this.apiCall('POST', '/api/environment', {
        action: 'trigger_health_check'
      });

      spinner.succeed('Health check completed');

      console.log(chalk.green('\\n✓ Manual health check completed'));
      console.log(`Timestamp: ${result.timestamp}`);
      console.log(`Environment: ${result.environment}`);

      // Show key metrics from the health check
      if (result.api) {
        console.log(`\\nAPI Health:`);
        console.log(`  Response Time: ${result.api.averageResponseTime}ms`);
        console.log(`  Error Rate: ${(result.api.errorRate * 100).toFixed(2)}%`);
      }

      if (result.system) {
        console.log(`\\nSystem Health:`);
        console.log(`  Memory: ${result.system.memoryUsage.percentage}%`);
        console.log(`  CPU: ${result.system.cpuUsage}%`);
      }

    } catch (error) {
      spinner.fail('Health check failed');
      this.handleError(error);
    }
  }

  async handleValidate(options) {
    const targetUrl = options.target || 'https://incomeclarity.ddns.net';
    const spinner = ora(`Validating environment: ${targetUrl}...`).start();

    try {
      const result = await this.apiCall('GET', `/api/environment?action=validate&target=${encodeURIComponent(targetUrl)}`);
      
      if (result.isValid && result.isReachable) {
        spinner.succeed('Environment validation passed');
        console.log(chalk.green(`\\n✓ Environment is valid and reachable`));
      } else {
        spinner.warn('Environment validation failed');
        console.log(chalk.yellow(`\\n⚠ Environment validation issues detected`));
      }

      console.log(`\\nValidation Results:`);
      console.log(`  Valid: ${result.isValid ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Reachable: ${result.isReachable ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Response Time: ${result.responseTime}ms`);

      if (result.error) {
        console.log(chalk.red(`  Error: ${result.error}`));
      }

    } catch (error) {
      spinner.fail('Environment validation failed');
      this.handleError(error);
    }
  }

  async handleCircuits(options) {
    const spinner = ora('Fetching circuit breaker status...').start();

    try {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      
      spinner.succeed('Circuit breaker status retrieved');

      if (!response.circuitBreakers || Object.keys(response.circuitBreakers).length === 0) {
        console.log(chalk.green('\\n✓ No circuit breakers currently active'));
        return;
      }

      console.log(chalk.bold('\\nCircuit Breaker Status:'));
      
      const circuitTable = new Table({
        head: ['Circuit', 'Status', 'Failures', 'Last Failure', 'Next Retry'],
        colWidths: [20, 10, 10, 20, 20]
      });

      Object.entries(response.circuitBreakers).forEach(([name, state]) => {
        const statusColor = state.isOpen ? chalk.red : chalk.green;
        const status = state.isOpen ? 'OPEN' : 'CLOSED';
        
        circuitTable.push([
          name,
          statusColor(status),
          state.failureCount.toString(),
          state.lastFailureTime ? new Date(state.lastFailureTime).toLocaleString() : 'Never',
          state.nextRetryTime ? new Date(state.nextRetryTime).toLocaleString() : 'N/A'
        ]);
      });

      console.log(circuitTable.toString());

    } catch (error) {
      spinner.fail('Failed to fetch circuit breaker status');
      this.handleError(error);
    }
  }

  async handleLogs(options) {
    console.log(chalk.blue('\\n📋 Monitoring Logs'));
    console.log(chalk.gray('(Log viewing feature coming soon)'));
    
    if (options.follow) {
      console.log(chalk.gray('Follow mode would be enabled'));
    }
  }

  // Utility methods
  async apiCall(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  printHeader(title) {
    console.log('\\n' + chalk.bold.blue('='.repeat(60)));
    console.log(chalk.bold.blue(`  ${title}`));
    console.log(chalk.bold.blue('='.repeat(60)));
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  createProgressBar(value, width = 20, max = 100) {
    const percentage = Math.min(value / max, 1);
    const filled = Math.round(width * percentage);
    const empty = width - filled;
    
    const getColor = (val) => {
      if (val >= 90) return chalk.green;
      if (val >= 80) return chalk.yellow;
      if (val >= 60) return chalk.orange;
      return chalk.red;
    };

    const color = getColor(value);
    const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    return `${bar} ${value}%`;
  }

  handleError(error) {
    console.error(chalk.red('\\n✗ Error:'), error.message);
    
    if (this.program.opts().verbose) {
      console.error(chalk.gray('\\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  }

  run() {
    // Set base URL from options
    this.program.hook('preAction', (thisCommand, actionCommand) => {
      const options = thisCommand.opts();
      if (options.url) {
        this.baseUrl = options.url;
      }
      
      // Disable colors if requested
      if (options.noColor) {
        chalk.level = 0;
      }
    });

    this.program.parse(process.argv);
  }
}

// Create and run CLI
const cli = new RealTimeMonitoringCLI();

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\\n✗ Uncaught Exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\\n✗ Unhandled Rejection:'), reason);
  process.exit(1);
});

// Run the CLI
cli.run();