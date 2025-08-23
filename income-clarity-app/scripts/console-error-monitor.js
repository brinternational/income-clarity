#!/usr/bin/env node

/**
 * CONSOLE ERROR MONITOR
 * 
 * PURPOSE: Zero-tolerance console error detection with severity classification
 * FEATURES: Real-time error categorization, immediate failure triggers, error correlation
 * MANDATE: Console errors detected immediately with test failure triggers
 */

const fs = require('fs').promises;
const path = require('path');

// Error severity classification rules
const ERROR_SEVERITY_RULES = {
  CRITICAL: [
    // JavaScript runtime errors that break functionality
    /uncaught\s+error/i,
    /unhandled\s+promise\s+rejection/i,
    /reference\s+error/i,
    /type\s+error.*is\s+not\s+a\s+function/i,
    /cannot\s+read\s+propert(y|ies)\s+of\s+(null|undefined)/i,
    /network\s+error/i,
    /failed\s+to\s+fetch/i,
    /authentication\s+failed/i,
    /session\s+expired/i
  ],
  HIGH: [
    // Significant errors that impact user experience
    /404\s+not\s+found/i,
    /500\s+internal\s+server\s+error/i,
    /permission\s+denied/i,
    /access\s+denied/i,
    /cors\s+error/i,
    /mixed\s+content/i,
    /ssl\s+error/i,
    /certificate\s+error/i
  ],
  MEDIUM: [
    // Performance and usability issues
    /warning.*deprecated/i,
    /performance\s+warning/i,
    /memory\s+leak/i,
    /slow\s+script/i,
    /timeout/i,
    /rate\s+limit/i
  ],
  LOW: [
    // Minor issues that don't affect core functionality
    /console\.warn/i,
    /development\s+mode/i,
    /debug/i,
    /experimental\s+feature/i
  ]
};

// Error categories for better organization
const ERROR_CATEGORIES = {
  AUTHENTICATION: ['authentication', 'login', 'session', 'token', 'unauthorized'],
  NETWORK: ['fetch', 'request', 'network', 'connection', 'cors', 'xhr'],
  JAVASCRIPT: ['reference', 'type', 'syntax', 'undefined', 'null'],
  PERFORMANCE: ['memory', 'slow', 'timeout', 'performance'],
  SECURITY: ['csp', 'mixed content', 'ssl', 'certificate'],
  UI_UX: ['render', 'layout', 'style', 'responsive'],
  DATA: ['validation', 'parsing', 'format', 'schema'],
  THIRD_PARTY: ['external', 'vendor', 'library', 'plugin']
};

class ConsoleErrorMonitor {
  constructor(config = {}) {
    this.config = {
      logDir: config.logDir || './test-results/console-monitoring',
      zeroTolerance: config.zeroTolerance !== false, // Default to true
      failureTriggers: config.failureTriggers || ['CRITICAL', 'HIGH'],
      maxAllowedWarnings: config.maxAllowedWarnings || 5,
      correlationWindow: config.correlationWindow || 30000, // 30 seconds
      ...config
    };

    this.errorLog = [];
    this.warningLog = [];
    this.networkErrorLog = [];
    this.performanceWarnings = [];
    
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.errorCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    this.categoryStats = {};
    this.correlationMap = new Map();
  }

  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `monitor_${timestamp}_${random}`;
  }

  async initialize() {
    console.log('🔍 Initializing Console Error Monitor...');
    
    // Create directory structure
    await fs.mkdir(this.config.logDir, { recursive: true });
    await fs.mkdir(path.join(this.config.logDir, 'sessions'), { recursive: true });
    await fs.mkdir(path.join(this.config.logDir, 'reports'), { recursive: true });

    // Initialize category stats
    for (const category of Object.keys(ERROR_CATEGORIES)) {
      this.categoryStats[category] = 0;
    }

    console.log(`✅ Console Error Monitor initialized - Session: ${this.sessionId}`);
    console.log(`🚨 Zero Tolerance Mode: ${this.config.zeroTolerance ? 'ENABLED' : 'DISABLED'}`);
    console.log(`⚡ Failure Triggers: ${this.config.failureTriggers.join(', ')}`);
  }

  /**
   * ATTACH TO PAGE FOR MONITORING
   */
  attachToPage(page) {
    console.log('🔗 Attaching console monitor to page...');

    // Monitor console messages
    page.on('console', (msg) => {
      this.processConsoleMessage(msg, page.url());
    });

    // Monitor page errors
    page.on('pageerror', (error) => {
      this.processPageError(error, page.url());
    });

    // Monitor request failures
    page.on('requestfailed', (request) => {
      this.processNetworkError(request, page.url());
    });

    // Monitor response errors
    page.on('response', (response) => {
      if (!response.ok()) {
        this.processResponseError(response, page.url());
      }
    });

    console.log('✅ Console monitor attached successfully');
  }

  /**
   * PROCESS DIFFERENT ERROR TYPES
   */
  processConsoleMessage(msg, pageUrl) {
    const messageType = msg.type();
    const messageText = msg.text();
    const timestamp = new Date().toISOString();

    const logEntry = {
      id: this.generateErrorId(),
      timestamp,
      type: messageType,
      message: messageText,
      url: pageUrl,
      severity: this.classifyErrorSeverity(messageText),
      category: this.categorizeError(messageText),
      source: 'console'
    };

    // Store based on type
    if (messageType === 'error') {
      this.errorLog.push(logEntry);
      this.errorCounts[logEntry.severity]++;
      this.categoryStats[logEntry.category]++;

      console.log(`❌ Console Error [${logEntry.severity}]: ${messageText.substring(0, 100)}...`);
      
      // Check for immediate failure
      if (this.shouldTriggerFailure(logEntry)) {
        this.triggerTestFailure(logEntry);
      }
    } else if (messageType === 'warning') {
      this.warningLog.push(logEntry);
      console.log(`⚠️ Console Warning [${logEntry.category}]: ${messageText.substring(0, 100)}...`);
    }

    // Add to correlation map for action correlation
    this.addToCorrelationMap(logEntry);
  }

  processPageError(error, pageUrl) {
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      id: this.generateErrorId(),
      timestamp,
      type: 'pageerror',
      message: error.message,
      stack: error.stack,
      url: pageUrl,
      severity: 'CRITICAL', // Page errors are always critical
      category: this.categorizeError(error.message),
      source: 'page'
    };

    this.errorLog.push(logEntry);
    this.errorCounts.CRITICAL++;
    this.categoryStats[logEntry.category]++;

    console.log(`💥 Page Error [CRITICAL]: ${error.message}`);

    // Page errors always trigger failure in zero tolerance mode
    if (this.config.zeroTolerance) {
      this.triggerTestFailure(logEntry);
    }
  }

  processNetworkError(request, pageUrl) {
    const timestamp = new Date().toISOString();
    const failure = request.failure();
    
    const logEntry = {
      id: this.generateErrorId(),
      timestamp,
      type: 'network',
      message: `Network request failed: ${failure.errorText}`,
      url: pageUrl,
      requestUrl: request.url(),
      method: request.method(),
      failure: failure.errorText,
      severity: this.classifyNetworkErrorSeverity(failure.errorText),
      category: 'NETWORK',
      source: 'network'
    };

    this.networkErrorLog.push(logEntry);
    this.errorCounts[logEntry.severity]++;
    this.categoryStats.NETWORK++;

    console.log(`🌐 Network Error [${logEntry.severity}]: ${request.url()}`);

    // Check for immediate failure
    if (this.shouldTriggerFailure(logEntry)) {
      this.triggerTestFailure(logEntry);
    }
  }

  processResponseError(response, pageUrl) {
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      id: this.generateErrorId(),
      timestamp,
      type: 'response',
      message: `HTTP Error: ${response.status()} ${response.statusText()}`,
      url: pageUrl,
      requestUrl: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      severity: this.classifyHttpErrorSeverity(response.status()),
      category: 'NETWORK',
      source: 'http'
    };

    this.networkErrorLog.push(logEntry);
    this.errorCounts[logEntry.severity]++;
    this.categoryStats.NETWORK++;

    console.log(`📡 HTTP Error [${logEntry.severity}]: ${response.status()} - ${response.url()}`);

    // Check for immediate failure
    if (this.shouldTriggerFailure(logEntry)) {
      this.triggerTestFailure(logEntry);
    }
  }

  /**
   * ERROR CLASSIFICATION SYSTEM
   */
  classifyErrorSeverity(message) {
    for (const [severity, patterns] of Object.entries(ERROR_SEVERITY_RULES)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return severity;
        }
      }
    }
    return 'LOW'; // Default classification
  }

  classifyNetworkErrorSeverity(errorText) {
    if (/net::(ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_REFUSED|ERR_NETWORK_CHANGED)/.test(errorText)) {
      return 'CRITICAL';
    }
    if (/net::(ERR_TIMED_OUT|ERR_CONNECTION_TIMED_OUT)/.test(errorText)) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  classifyHttpErrorSeverity(status) {
    if (status >= 500) return 'CRITICAL';
    if (status === 404 || status === 403 || status === 401) return 'HIGH';
    if (status >= 400) return 'MEDIUM';
    return 'LOW';
  }

  categorizeError(message) {
    for (const [category, keywords] of Object.entries(ERROR_CATEGORIES)) {
      for (const keyword of keywords) {
        if (message.toLowerCase().includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    return 'GENERAL';
  }

  /**
   * FAILURE TRIGGER SYSTEM
   */
  shouldTriggerFailure(logEntry) {
    // Always fail on critical errors in zero tolerance mode
    if (this.config.zeroTolerance && logEntry.severity === 'CRITICAL') {
      return true;
    }

    // Check configured failure triggers
    return this.config.failureTriggers.includes(logEntry.severity);
  }

  triggerTestFailure(logEntry) {
    const error = new Error(`CONSOLE MONITOR FAILURE: ${logEntry.message}`);
    error.severity = logEntry.severity;
    error.category = logEntry.category;
    error.logEntry = logEntry;
    error.monitoringSession = this.sessionId;

    console.log(`🚨 TEST FAILURE TRIGGERED by ${logEntry.severity} error: ${logEntry.message}`);
    
    throw error;
  }

  /**
   * ACTION CORRELATION SYSTEM
   */
  addToCorrelationMap(logEntry) {
    const now = Date.now();
    const entryTime = new Date(logEntry.timestamp).getTime();
    
    // Clean old entries outside correlation window
    for (const [time, entry] of this.correlationMap.entries()) {
      if (now - time > this.config.correlationWindow) {
        this.correlationMap.delete(time);
      }
    }

    // Add new entry
    this.correlationMap.set(entryTime, logEntry);
  }

  correlateErrorsWithAction(actionDescription, actionStartTime) {
    const actionStart = new Date(actionStartTime).getTime();
    const actionEnd = actionStart + this.config.correlationWindow;
    
    const correlatedErrors = [];
    for (const [time, entry] of this.correlationMap.entries()) {
      if (time >= actionStart && time <= actionEnd) {
        correlatedErrors.push({
          ...entry,
          correlation: {
            action: actionDescription,
            actionStartTime,
            timeDelta: time - actionStart
          }
        });
      }
    }

    if (correlatedErrors.length > 0) {
      console.log(`🔗 Found ${correlatedErrors.length} errors correlated with action: ${actionDescription}`);
    }

    return correlatedErrors;
  }

  generateErrorId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `error_${timestamp}_${random}`;
  }

  /**
   * MONITORING STATUS AND REPORTING
   */
  getMonitoringStatus() {
    const now = Date.now();
    const duration = now - this.startTime;

    return {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      duration: Math.round(duration / 1000), // seconds
      errorCounts: { ...this.errorCounts },
      categoryStats: { ...this.categoryStats },
      totalErrors: this.errorLog.length,
      totalWarnings: this.warningLog.length,
      totalNetworkErrors: this.networkErrorLog.length,
      zeroToleranceMode: this.config.zeroTolerance,
      status: this.getOverallStatus()
    };
  }

  getOverallStatus() {
    if (this.errorCounts.CRITICAL > 0) return 'CRITICAL_ERRORS_DETECTED';
    if (this.errorCounts.HIGH > 0) return 'HIGH_SEVERITY_ERRORS';
    if (this.errorCounts.MEDIUM > 0) return 'MEDIUM_SEVERITY_ERRORS';
    if (this.warningLog.length > this.config.maxAllowedWarnings) return 'TOO_MANY_WARNINGS';
    if (this.warningLog.length > 0 || this.errorCounts.LOW > 0) return 'WARNINGS_DETECTED';
    return 'CLEAN';
  }

  /**
   * COMPREHENSIVE ERROR REPORT
   */
  async generateErrorReport() {
    const status = this.getMonitoringStatus();
    
    const report = {
      session: {
        id: this.sessionId,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: status.duration
      },
      summary: {
        status: status.status,
        totalErrors: status.totalErrors,
        totalWarnings: status.totalWarnings,
        totalNetworkErrors: status.totalNetworkErrors,
        severityBreakdown: status.errorCounts,
        categoryBreakdown: status.categoryStats
      },
      details: {
        errors: this.errorLog,
        warnings: this.warningLog,
        networkErrors: this.networkErrorLog,
        performanceWarnings: this.performanceWarnings
      },
      analysis: {
        criticalErrorsAnalysis: this.analyzeCriticalErrors(),
        patternAnalysis: this.analyzeErrorPatterns(),
        recommendedActions: this.getRecommendedActions()
      },
      configuration: {
        zeroTolerance: this.config.zeroTolerance,
        failureTriggers: this.config.failureTriggers,
        maxAllowedWarnings: this.config.maxAllowedWarnings
      }
    };

    // Save report
    const reportPath = path.join(this.config.logDir, 'reports', `error_report_${this.sessionId}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Save session log
    const sessionPath = path.join(this.config.logDir, 'sessions', `session_${this.sessionId}.json`);
    await fs.writeFile(sessionPath, JSON.stringify({
      sessionId: this.sessionId,
      summary: report.summary,
      configuration: report.configuration
    }, null, 2));

    console.log(`📊 Error report generated: ${reportPath}`);
    return report;
  }

  analyzeCriticalErrors() {
    const criticalErrors = this.errorLog.filter(e => e.severity === 'CRITICAL');
    
    return {
      count: criticalErrors.length,
      categories: this.groupByCategory(criticalErrors),
      patterns: this.findCommonPatterns(criticalErrors),
      timeline: this.createErrorTimeline(criticalErrors)
    };
  }

  analyzeErrorPatterns() {
    const allErrors = [...this.errorLog, ...this.networkErrorLog];
    
    return {
      mostCommonCategory: this.getMostCommonCategory(),
      errorSpikes: this.detectErrorSpikes(allErrors),
      repeatingErrors: this.findRepeatingErrors(allErrors),
      errorCorrelations: this.findErrorCorrelations(allErrors)
    };
  }

  getRecommendedActions() {
    const actions = [];
    
    if (this.errorCounts.CRITICAL > 0) {
      actions.push({
        priority: 'IMMEDIATE',
        action: 'Fix Critical JavaScript Errors',
        description: `${this.errorCounts.CRITICAL} critical errors detected that break functionality`,
        impact: 'User experience severely impacted'
      });
    }

    if (this.categoryStats.NETWORK > 5) {
      actions.push({
        priority: 'HIGH',
        action: 'Investigate Network Reliability',
        description: `${this.categoryStats.NETWORK} network-related errors detected`,
        impact: 'Data loading and synchronization issues'
      });
    }

    if (this.categoryStats.AUTHENTICATION > 0) {
      actions.push({
        priority: 'HIGH',
        action: 'Review Authentication System',
        description: `${this.categoryStats.AUTHENTICATION} authentication errors detected`,
        impact: 'User login and session management affected'
      });
    }

    if (this.warningLog.length > this.config.maxAllowedWarnings) {
      actions.push({
        priority: 'MEDIUM',
        action: 'Address Console Warnings',
        description: `${this.warningLog.length} warnings detected (threshold: ${this.config.maxAllowedWarnings})`,
        impact: 'Code quality and maintenance concerns'
      });
    }

    return actions;
  }

  // Helper methods for analysis
  groupByCategory(errors) {
    const groups = {};
    for (const error of errors) {
      groups[error.category] = (groups[error.category] || 0) + 1;
    }
    return groups;
  }

  findCommonPatterns(errors) {
    // Implementation would analyze error messages for common patterns
    return {};
  }

  createErrorTimeline(errors) {
    return errors.map(e => ({
      timestamp: e.timestamp,
      message: e.message.substring(0, 100),
      severity: e.severity
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  getMostCommonCategory() {
    let maxCount = 0;
    let mostCommon = null;
    
    for (const [category, count] of Object.entries(this.categoryStats)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = category;
      }
    }
    
    return { category: mostCommon, count: maxCount };
  }

  detectErrorSpikes(errors) {
    // Implementation would analyze error timing for spikes
    return [];
  }

  findRepeatingErrors(errors) {
    const messageGroups = {};
    for (const error of errors) {
      const key = error.message.substring(0, 50);
      messageGroups[key] = (messageGroups[key] || 0) + 1;
    }
    
    return Object.entries(messageGroups)
      .filter(([_, count]) => count > 1)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count);
  }

  findErrorCorrelations(errors) {
    // Implementation would find errors that occur together
    return [];
  }

  /**
   * CLEANUP
   */
  async cleanup() {
    await this.generateErrorReport();
    console.log(`✅ Console Error Monitor cleanup completed - Session: ${this.sessionId}`);
  }
}

module.exports = { ConsoleErrorMonitor, ERROR_SEVERITY_RULES, ERROR_CATEGORIES };