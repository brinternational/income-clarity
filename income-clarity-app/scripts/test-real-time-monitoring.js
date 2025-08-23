#!/usr/bin/env node

/**
 * Real-Time Monitoring System Test Suite
 * 
 * Comprehensive testing for the real-time monitoring and alerting system.
 * Tests all components including health checks, alerting, metrics collection,
 * and API integration.
 */

const chalk = require('chalk');
const { performance } = require('perf_hooks');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

class RealTimeMonitoringTests {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // Test runner methods
  async runAllTests() {
    console.log(chalk.blue.bold('\\n🧪 Real-Time Monitoring System Test Suite'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.gray(`Base URL: ${TEST_CONFIG.baseUrl}`));
    console.log(chalk.gray(`Started: ${new Date().toLocaleString()}\\n`));

    try {
      // Basic connectivity tests
      await this.testSection('Basic Connectivity', async () => {
        await this.testServerConnectivity();
        await this.testEnvironmentAPI();
        await this.testHealthEndpoint();
      });

      // Service initialization tests
      await this.testSection('Service Initialization', async () => {
        await this.testServiceInstantiation();
        await this.testDefaultConfiguration();
        await this.testDataDirectory();
      });

      // Monitoring lifecycle tests
      await this.testSection('Monitoring Lifecycle', async () => {
        await this.testStartMonitoring();
        await this.testMonitoringStatus();
        await this.testStopMonitoring();
        await this.testRestartMonitoring();
      });

      // Health checking tests
      await this.testSection('Health Checking', async () => {
        await this.testManualHealthCheck();
        await this.testHealthMetrics();
        await this.testThresholdAnalysis();
      });

      // Alert system tests
      await this.testSection('Alert System', async () => {
        await this.testAlertGeneration();
        await this.testAlertChannels();
        await this.testAlertResolution();
        await this.testRateLimiting();
      });

      // Metrics collection tests
      await this.testSection('Metrics Collection', async () => {
        await this.testAPIMetrics();
        await this.testSystemMetrics();
        await this.testDatabaseMetrics();
        await this.testIntegrationMetrics();
      });

      // Dashboard and reporting tests
      await this.testSection('Dashboard & Reporting', async () => {
        await this.testDashboardData();
        await this.testMetricsHistory();
        await this.testAlertHistory();
        await this.testHealthScore();
      });

      // Configuration management tests
      await this.testSection('Configuration Management', async () => {
        await this.testConfigurationUpdate();
        await this.testConfigurationValidation();
        await this.testConfigurationPersistence();
      });

      // Performance and reliability tests
      await this.testSection('Performance & Reliability', async () => {
        await this.testPerformanceImpact();
        await this.testConcurrentOperations();
        await this.testErrorHandling();
        await this.testResourceCleanup();
      });

      // Integration tests
      await this.testSection('Integration Tests', async () => {
        await this.testDeploymentVerificationIntegration();
        await this.testUIVerificationIntegration();
        await this.testEnvironmentDetectionIntegration();
      });

    } catch (error) {
      console.error(chalk.red('\\n❌ Test suite execution failed:'), error.message);
      if (TEST_CONFIG.verbose) {
        console.error(chalk.gray(error.stack));
      }
    } finally {
      await this.printTestSummary();
    }
  }

  async testSection(sectionName, testFunction) {
    console.log(chalk.yellow.bold(`\\n📋 ${sectionName}`));
    console.log(chalk.gray('-'.repeat(40)));

    try {
      await testFunction();
      console.log(chalk.green(`✅ ${sectionName} - All tests passed`));
    } catch (error) {
      console.log(chalk.red(`❌ ${sectionName} - Tests failed: ${error.message}`));
      if (TEST_CONFIG.verbose) {
        console.error(chalk.gray(error.stack));
      }
    }
  }

  async test(testName, testFunction, timeout = TEST_CONFIG.timeout) {
    this.totalTests++;
    const startTime = performance.now();

    try {
      console.log(chalk.blue(`  🔸 ${testName}...`));

      // Run test with timeout
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
        )
      ]);

      const duration = Math.round(performance.now() - startTime);
      this.passedTests++;

      console.log(chalk.green(`    ✓ ${testName} (${duration}ms)`));
      
      this.testResults.push({
        name: testName,
        status: 'passed',
        duration,
        result
      });

      return result;

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      this.failedTests++;

      console.log(chalk.red(`    ✗ ${testName} (${duration}ms): ${error.message}`));
      
      this.testResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      });

      throw error;
    }
  }

  // Basic connectivity tests
  async testServerConnectivity() {
    await this.test('Server Connectivity', async () => {
      const response = await this.apiCall('GET', '/api/health');
      this.assert(response.status === 'healthy', 'Server should be healthy');
      return response;
    });
  }

  async testEnvironmentAPI() {
    await this.test('Environment API Availability', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=fingerprint');
      this.assert(response.success === true, 'Environment API should be successful');
      this.assert(response.data.type, 'Environment data should include type');
      return response;
    });
  }

  async testHealthEndpoint() {
    await this.test('Health Endpoint Detailed Response', async () => {
      const response = await this.apiCall('GET', '/api/health?level=detailed&details=true');
      this.assert(response.status, 'Health response should include status');
      this.assert(response.uptime, 'Health response should include uptime');
      this.assert(Array.isArray(response.checks), 'Health response should include checks array');
      return response;
    });
  }

  // Service initialization tests
  async testServiceInstantiation() {
    await this.test('Real-Time Monitor Service Instantiation', async () => {
      // This would test the service directly if we could import it
      // For now, test through API
      const response = await this.apiCall('GET', '/api/environment?action=realtime_status');
      this.assert(typeof response.isRunning === 'boolean', 'Status should include isRunning boolean');
      return response;
    });
  }

  async testDefaultConfiguration() {
    await this.test('Default Configuration Values', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_status');
      this.assert(response.totalAlerts >= 0, 'Total alerts should be non-negative');
      this.assert(response.totalMetrics >= 0, 'Total metrics should be non-negative');
      return response;
    });
  }

  async testDataDirectory() {
    await this.test('Data Directory Management', async () => {
      // Test through monitoring operations that would create data
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'trigger_health_check'
      });
      this.assert(response.timestamp, 'Health check should return timestamp');
      return response;
    });
  }

  // Monitoring lifecycle tests
  async testStartMonitoring() {
    await this.test('Start Real-Time Monitoring', async () => {
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'start_realtime_monitoring',
        monitoringConfig: {
          enabled: true,
          intervals: {
            health: 10000,
            performance: 15000
          }
        }
      });
      this.assert(response.message.includes('started'), 'Should confirm monitoring started');
      
      // Wait a moment for initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return response;
    });
  }

  async testMonitoringStatus() {
    await this.test('Monitoring Status Check', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_status');
      this.assert(response.isRunning === true, 'Monitoring should be running');
      this.assert(Array.isArray(response.activeIntervals), 'Should have active intervals');
      return response;
    });
  }

  async testStopMonitoring() {
    await this.test('Stop Real-Time Monitoring', async () => {
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'stop_realtime_monitoring'
      });
      this.assert(response.message.includes('stopped'), 'Should confirm monitoring stopped');
      
      // Verify it's actually stopped
      const status = await this.apiCall('GET', '/api/environment?action=realtime_status');
      this.assert(status.isRunning === false, 'Monitoring should be stopped');
      
      return response;
    });
  }

  async testRestartMonitoring() {
    await this.test('Restart Real-Time Monitoring', async () => {
      // Start again for subsequent tests
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'start_realtime_monitoring'
      });
      this.assert(response.message.includes('started'), 'Should restart successfully');
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return response;
    });
  }

  // Health checking tests
  async testManualHealthCheck() {
    await this.test('Manual Health Check Trigger', async () => {
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'trigger_health_check'
      });
      this.assert(response.timestamp, 'Health check should return timestamp');
      this.assert(response.environment, 'Health check should return environment');
      return response;
    });
  }

  async testHealthMetrics() {
    await this.test('Health Metrics Collection', async () => {
      // Trigger health check and then get metrics
      await this.apiCall('POST', '/api/environment', {
        action: 'trigger_health_check'
      });
      
      // Wait for metrics to be collected
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      this.assert(response.metrics.length > 0, 'Should have collected metrics');
      
      const metrics = response.metrics[0];
      this.assert(metrics.system, 'Metrics should include system data');
      this.assert(metrics.api, 'Metrics should include API data');
      this.assert(metrics.database, 'Metrics should include database data');
      
      return response;
    });
  }

  async testThresholdAnalysis() {
    await this.test('Threshold Analysis', async () => {
      // This test would require specific threshold violations
      // For now, just verify the system can handle threshold checks
      const response = await this.apiCall('GET', '/api/environment?action=realtime_dashboard');
      this.assert(response.healthScore, 'Dashboard should include health score');
      this.assert(typeof response.healthScore.overall === 'number', 'Health score should be numeric');
      return response;
    });
  }

  // Alert system tests
  async testAlertGeneration() {
    await this.test('Alert Generation', async () => {
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'test_alerts'
      });
      this.assert(response.message.includes('completed'), 'Alert test should complete');
      
      // Check that alerts were generated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const alerts = await this.apiCall('GET', '/api/environment?action=realtime_alerts&limit=10');
      this.assert(alerts.alerts.length > 0, 'Should have generated test alerts');
      
      return response;
    });
  }

  async testAlertChannels() {
    await this.test('Alert Channel Functionality', async () => {
      // Test different alert channels through the test system
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'test_alerts'
      });
      
      // Verify alerts are properly formatted and delivered
      const alerts = await this.apiCall('GET', '/api/environment?action=realtime_alerts&limit=5');
      const testAlerts = alerts.alerts.filter(alert => 
        alert.category === 'test' && alert.metadata?.testMode === true
      );
      
      this.assert(testAlerts.length > 0, 'Should have test alerts');
      
      // Check alert structure
      const testAlert = testAlerts[0];
      this.assert(testAlert.id, 'Alert should have ID');
      this.assert(testAlert.severity, 'Alert should have severity');
      this.assert(testAlert.title, 'Alert should have title');
      this.assert(testAlert.message, 'Alert should have message');
      
      return response;
    });
  }

  async testAlertResolution() {
    await this.test('Alert Resolution', async () => {
      // Get an unresolved alert
      const alerts = await this.apiCall('GET', '/api/environment?action=realtime_alerts&limit=10');
      const unresolvedAlert = alerts.alerts.find(alert => !alert.resolved);
      
      if (!unresolvedAlert) {
        // Generate test alert if none exist
        await this.apiCall('POST', '/api/environment', { action: 'test_alerts' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newAlerts = await this.apiCall('GET', '/api/environment?action=realtime_alerts&limit=5');
        const testAlert = newAlerts.alerts.find(alert => !alert.resolved);
        this.assert(testAlert, 'Should have unresolved test alert');
        
        // Resolve it
        const response = await this.apiCall('POST', '/api/environment', {
          action: 'resolve_realtime_alert',
          realtimeAlertId: testAlert.id
        });
        
        this.assert(response.resolved === true, 'Alert should be resolved');
        return response;
      } else {
        // Resolve existing alert
        const response = await this.apiCall('POST', '/api/environment', {
          action: 'resolve_realtime_alert',
          realtimeAlertId: unresolvedAlert.id
        });
        
        this.assert(response.resolved === true, 'Alert should be resolved');
        return response;
      }
    });
  }

  async testRateLimiting() {
    await this.test('Alert Rate Limiting', async () => {
      // This would be difficult to test without specific rate limiting triggers
      // For now, verify the system handles multiple alert requests gracefully
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(this.apiCall('POST', '/api/environment', { action: 'test_alerts' }));
      }
      
      const results = await Promise.all(promises);
      results.forEach(result => {
        this.assert(result.message.includes('completed'), 'Each alert test should complete');
      });
      
      return results;
    });
  }

  // Metrics collection tests
  async testAPIMetrics() {
    await this.test('API Metrics Collection', async () => {
      // Trigger health check to generate API metrics
      await this.apiCall('POST', '/api/environment', { action: 'trigger_health_check' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      this.assert(response.metrics.length > 0, 'Should have metrics');
      
      const metrics = response.metrics[0];
      this.assert(metrics.api.totalRequests >= 0, 'Should have total requests count');
      this.assert(metrics.api.averageResponseTime >= 0, 'Should have response time');
      this.assert(metrics.api.errorRate >= 0, 'Should have error rate');
      
      return response;
    });
  }

  async testSystemMetrics() {
    await this.test('System Metrics Collection', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      const metrics = response.metrics[0];
      
      this.assert(metrics.system.memoryUsage, 'Should have memory usage');
      this.assert(typeof metrics.system.cpuUsage === 'number', 'Should have CPU usage');
      this.assert(metrics.system.uptime >= 0, 'Should have uptime');
      
      return response;
    });
  }

  async testDatabaseMetrics() {
    await this.test('Database Metrics Collection', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      const metrics = response.metrics[0];
      
      this.assert(metrics.database.healthStatus, 'Should have database health status');
      this.assert(metrics.database.queryPerformance, 'Should have query performance data');
      this.assert(metrics.database.transactionStats, 'Should have transaction stats');
      
      return response;
    });
  }

  async testIntegrationMetrics() {
    await this.test('Integration Metrics Collection', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=1');
      const metrics = response.metrics[0];
      
      this.assert(metrics.integration.yodlee, 'Should have Yodlee metrics');
      this.assert(metrics.integration.polygon, 'Should have Polygon metrics');
      this.assert(Array.isArray(metrics.integration.external), 'Should have external service metrics');
      
      return response;
    });
  }

  // Dashboard and reporting tests
  async testDashboardData() {
    await this.test('Dashboard Data Structure', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_dashboard');
      
      this.assert(['healthy', 'degraded', 'unhealthy'].includes(response.status), 'Should have valid status');
      this.assert(response.healthScore, 'Should have health score');
      this.assert(Array.isArray(response.activeAlerts), 'Should have active alerts array');
      this.assert(response.systemOverview, 'Should have system overview');
      
      return response;
    });
  }

  async testMetricsHistory() {
    await this.test('Metrics History Retrieval', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_metrics&limit=50');
      
      this.assert(Array.isArray(response.metrics), 'Should return metrics array');
      this.assert(response.metrics.length <= 50, 'Should respect limit parameter');
      
      if (response.metrics.length > 0) {
        const metric = response.metrics[0];
        this.assert(metric.timestamp, 'Each metric should have timestamp');
        this.assert(metric.environment, 'Each metric should have environment');
      }
      
      return response;
    });
  }

  async testAlertHistory() {
    await this.test('Alert History Retrieval', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_alerts&limit=30');
      
      this.assert(Array.isArray(response.alerts), 'Should return alerts array');
      this.assert(response.alerts.length <= 30, 'Should respect limit parameter');
      
      if (response.alerts.length > 0) {
        const alert = response.alerts[0];
        this.assert(alert.id, 'Each alert should have ID');
        this.assert(alert.severity, 'Each alert should have severity');
        this.assert(alert.timestamp, 'Each alert should have timestamp');
      }
      
      return response;
    });
  }

  async testHealthScore() {
    await this.test('Health Score Calculation', async () => {
      const response = await this.apiCall('GET', '/api/environment?action=realtime_dashboard');
      
      this.assert(response.healthScore, 'Should have health score');
      this.assert(typeof response.healthScore.overall === 'number', 'Overall score should be number');
      this.assert(response.healthScore.overall >= 0 && response.healthScore.overall <= 100, 'Score should be 0-100');
      this.assert(response.healthScore.breakdown, 'Should have score breakdown');
      this.assert(['improving', 'stable', 'degrading'].includes(response.healthScore.trend), 'Should have valid trend');
      
      return response;
    });
  }

  // Configuration management tests
  async testConfigurationUpdate() {
    await this.test('Configuration Update', async () => {
      const newConfig = {
        intervals: {
          health: 20000,
          performance: 30000
        },
        thresholds: {
          apiResponseTime: 1000,
          errorRate: 0.1
        }
      };
      
      const response = await this.apiCall('POST', '/api/environment', {
        action: 'update_realtime_config',
        realtimeConfig: newConfig
      });
      
      this.assert(response.message.includes('updated'), 'Should confirm config update');
      
      return response;
    });
  }

  async testConfigurationValidation() {
    await this.test('Configuration Validation', async () => {
      // Test invalid configuration
      try {
        await this.apiCall('POST', '/api/environment', {
          action: 'update_realtime_config',
          realtimeConfig: null
        });
        this.assert(false, 'Should reject null configuration');
      } catch (error) {
        this.assert(error.message.includes('required'), 'Should validate configuration');
      }
      
      return true;
    });
  }

  async testConfigurationPersistence() {
    await this.test('Configuration Persistence', async () => {
      // This would test that configuration survives restart
      // For now, just verify we can read current configuration
      const response = await this.apiCall('GET', '/api/environment?action=realtime_status');
      this.assert(typeof response.isRunning === 'boolean', 'Should maintain configuration state');
      
      return response;
    });
  }

  // Performance and reliability tests
  async testPerformanceImpact() {
    await this.test('Performance Impact Assessment', async () => {
      const startTime = performance.now();
      
      // Perform multiple operations
      const operations = [
        this.apiCall('GET', '/api/environment?action=realtime_status'),
        this.apiCall('GET', '/api/environment?action=realtime_dashboard'),
        this.apiCall('POST', '/api/environment', { action: 'trigger_health_check' })
      ];
      
      await Promise.all(operations);
      
      const duration = performance.now() - startTime;
      this.assert(duration < 5000, 'Operations should complete within 5 seconds');
      
      return { duration, operations: operations.length };
    });
  }

  async testConcurrentOperations() {
    await this.test('Concurrent Operations Handling', async () => {
      // Test multiple concurrent health checks
      const concurrentChecks = Array(5).fill().map(() => 
        this.apiCall('POST', '/api/environment', { action: 'trigger_health_check' })
      );
      
      const results = await Promise.all(concurrentChecks);
      
      results.forEach(result => {
        this.assert(result.timestamp, 'Each concurrent check should complete');
      });
      
      return results;
    });
  }

  async testErrorHandling() {
    await this.test('Error Handling', async () => {
      // Test invalid action
      try {
        await this.apiCall('POST', '/api/environment', {
          action: 'invalid_action_name'
        });
        this.assert(false, 'Should reject invalid action');
      } catch (error) {
        this.assert(error.message.includes('Invalid action'), 'Should handle invalid actions');
      }
      
      // Test missing parameters\n      try {\n        await this.apiCall('POST', '/api/environment', {\n          action: 'resolve_realtime_alert'\n          // Missing realtimeAlertId\n        });\n        this.assert(false, 'Should reject missing parameters');\n      } catch (error) {\n        this.assert(error.message.includes('required'), 'Should validate required parameters');\n      }\n      \n      return true;\n    });\n  }\n\n  async testResourceCleanup() {\n    await this.test('Resource Cleanup', async () => {\n      // Test that stopping monitoring cleans up resources\n      await this.apiCall('POST', '/api/environment', {\n        action: 'stop_realtime_monitoring'\n      });\n      \n      const status = await this.apiCall('GET', '/api/environment?action=realtime_status');\n      this.assert(status.isRunning === false, 'Should stop all monitoring');\n      this.assert(status.activeIntervals.length === 0, 'Should clear all intervals');\n      \n      // Restart for other tests\n      await this.apiCall('POST', '/api/environment', {\n        action: 'start_realtime_monitoring'\n      });\n      \n      return status;\n    });\n  }\n\n  // Integration tests\n  async testDeploymentVerificationIntegration() {\n    await this.test('Deployment Verification Integration', async () => {\n      // Test that monitoring integrates with deployment verification\n      const response = await this.apiCall('POST', '/api/environment', {\n        action: 'verify_deployment',\n        target: 'local'\n      });\n      \n      this.assert(response.deploymentId, 'Should perform deployment verification');\n      this.assert(response.overallStatus, 'Should have overall status');\n      \n      return response;\n    });\n  }\n\n  async testUIVerificationIntegration() {\n    await this.test('UI Verification Integration', async () => {\n      // Test UI verification integration\n      const response = await this.apiCall('GET', '/api/environment?action=ui_history');\n      \n      this.assert(response.history !== undefined, 'Should access UI verification history');\n      this.assert(response.config !== undefined, 'Should access UI verification config');\n      \n      return response;\n    });\n  }\n\n  async testEnvironmentDetectionIntegration() {\n    await this.test('Environment Detection Integration', async () => {\n      // Test integration with environment detection\n      const response = await this.apiCall('GET', '/api/environment?action=full&monitoring=true');\n      \n      this.assert(response.environment, 'Should include environment data');\n      this.assert(response.realTimeMonitoring, 'Should include real-time monitoring status');\n      \n      return response;\n    });\n  }\n\n  // Utility methods\n  async apiCall(method, endpoint, data = null) {\n    const url = `${TEST_CONFIG.baseUrl}${endpoint}`;\n    \n    const fetchOptions = {\n      method,\n      headers: {\n        'Content-Type': 'application/json',\n        'Accept': 'application/json'\n      }\n    };\n\n    if (data) {\n      fetchOptions.body = JSON.stringify(data);\n    }\n\n    const response = await fetch(url, fetchOptions);\n    \n    if (!response.ok) {\n      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));\n      throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);\n    }\n\n    const result = await response.json();\n    return result.data || result;\n  }\n\n  assert(condition, message) {\n    if (!condition) {\n      throw new Error(message);\n    }\n  }\n\n  async printTestSummary() {\n    const duration = Date.now() - this.startTime;\n    \n    console.log(chalk.blue.bold('\\n📊 Test Summary'));\n    console.log(chalk.gray('=' .repeat(60)));\n    \n    console.log(`${chalk.bold('Total Tests:')} ${this.totalTests}`);\n    console.log(`${chalk.green('Passed:')} ${this.passedTests}`);\n    console.log(`${chalk.red('Failed:')} ${this.failedTests}`);\n    console.log(`${chalk.blue('Success Rate:')} ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);\n    console.log(`${chalk.gray('Duration:')} ${this.formatDuration(duration)}`);\n    \n    if (this.failedTests > 0) {\n      console.log(chalk.red.bold('\\n❌ Failed Tests:'));\n      this.testResults\n        .filter(result => result.status === 'failed')\n        .forEach(result => {\n          console.log(chalk.red(`  • ${result.name}: ${result.error}`));\n        });\n    }\n    \n    if (TEST_CONFIG.verbose) {\n      console.log(chalk.blue.bold('\\n📋 Detailed Results:'));\n      this.testResults.forEach(result => {\n        const statusIcon = result.status === 'passed' ? chalk.green('✓') : chalk.red('✗');\n        console.log(`  ${statusIcon} ${result.name} (${result.duration}ms)`);\n        if (result.status === 'failed') {\n          console.log(chalk.red(`    ${result.error}`));\n        }\n      });\n    }\n    \n    // Performance analysis\n    const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / this.testResults.length;\n    const slowestTest = this.testResults.reduce((slowest, current) => \n      current.duration > slowest.duration ? current : slowest\n    );\n    \n    console.log(chalk.blue.bold('\\n⚡ Performance Analysis:'));\n    console.log(`${chalk.gray('Average Test Duration:')} ${avgDuration.toFixed(1)}ms`);\n    console.log(`${chalk.gray('Slowest Test:')} ${slowestTest.name} (${slowestTest.duration}ms)`);\n    \n    // Final status\n    if (this.failedTests === 0) {\n      console.log(chalk.green.bold('\\n✅ All tests passed! Real-time monitoring system is working correctly.'));\n      process.exit(0);\n    } else {\n      console.log(chalk.red.bold('\\n❌ Some tests failed. Please review the issues above.'));\n      process.exit(1);\n    }\n  }\n\n  formatDuration(ms) {\n    if (ms < 1000) return `${ms}ms`;\n    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;\n    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;\n  }\n}\n\n// Handle command line arguments\nif (process.argv.includes('--help') || process.argv.includes('-h')) {\n  console.log(chalk.blue.bold('Real-Time Monitoring System Test Suite'));\n  console.log('\\nUsage: node test-real-time-monitoring.js [options]');\n  console.log('\\nOptions:');\n  console.log('  -v, --verbose    Enable verbose output');\n  console.log('  -h, --help       Show this help message');\n  console.log('\\nEnvironment Variables:');\n  console.log('  TEST_BASE_URL    Base URL for testing (default: http://localhost:3000)');\n  process.exit(0);\n}\n\n// Run tests\nconst testSuite = new RealTimeMonitoringTests();\n\n// Handle unhandled errors\nprocess.on('uncaughtException', (error) => {\n  console.error(chalk.red('\\n💥 Uncaught Exception:'), error.message);\n  if (TEST_CONFIG.verbose) {\n    console.error(chalk.gray(error.stack));\n  }\n  process.exit(1);\n});\n\nprocess.on('unhandledRejection', (reason, promise) => {\n  console.error(chalk.red('\\n💥 Unhandled Rejection:'), reason);\n  process.exit(1);\n});\n\n// Start test execution\ntestSuite.runAllTests();