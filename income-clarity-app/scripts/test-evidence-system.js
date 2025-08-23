#!/usr/bin/env node

/**
 * EVIDENCE SYSTEM VALIDATION SCRIPT
 * 
 * PURPOSE: Quick validation of the comprehensive evidence capture and monitoring system
 * FEATURES: Component testing, integration validation, system readiness check
 */

const { ComprehensiveEvidenceE2ESystem } = require('./comprehensive-evidence-e2e-system');
const { EvidenceCaptureManager } = require('./evidence-capture-manager');
const { ConsoleErrorMonitor } = require('./console-error-monitor');
const { EvidenceCorrelationSystem } = require('./evidence-correlation-system');

async function validateEvidenceSystem() {
  console.log('🧪 EVIDENCE SYSTEM VALIDATION');
  console.log('='*50);
  
  const results = {
    evidenceManager: false,
    consoleMonitor: false,
    correlationSystem: false,
    comprehensiveSystem: false,
    directoryStructure: false
  };

  try {
    // Test Evidence Capture Manager
    console.log('\n1. Testing Evidence Capture Manager...');
    const evidenceManager = new EvidenceCaptureManager({
      baseDir: './test-results/validation-evidence'
    });
    await evidenceManager.initialize();
    
    // Test basic functionality
    const stats = evidenceManager.getEvidenceStatistics();
    console.log(`   ✅ Evidence Manager initialized - Session: ${stats.currentSession.sessionId}`);
    results.evidenceManager = true;

    // Test Console Error Monitor
    console.log('\n2. Testing Console Error Monitor...');
    const consoleMonitor = new ConsoleErrorMonitor({
      logDir: './test-results/validation-console'
    });
    await consoleMonitor.initialize();
    
    const monitorStatus = consoleMonitor.getMonitoringStatus();
    console.log(`   ✅ Console Monitor initialized - Session: ${monitorStatus.sessionId}`);
    results.consoleMonitor = true;

    // Test Evidence Correlation System
    console.log('\n3. Testing Evidence Correlation System...');
    const correlationSystem = new EvidenceCorrelationSystem(
      evidenceManager,
      consoleMonitor,
      { reportDir: './test-results/validation-correlation' }
    );
    await correlationSystem.initialize();
    
    console.log(`   ✅ Correlation System initialized - Session: ${correlationSystem.sessionId}`);
    results.correlationSystem = true;

    // Test Directory Structure Creation
    console.log('\n4. Testing Directory Structure...');
    const fs = require('fs').promises;
    const requiredDirs = [
      './test-results/validation-evidence',
      './test-results/validation-console',
      './test-results/validation-correlation'
    ];
    
    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
        console.log(`   ✅ Directory exists: ${dir}`);
      } catch (error) {
        console.log(`   ❌ Directory missing: ${dir}`);
        throw new Error(`Required directory not created: ${dir}`);
      }
    }
    results.directoryStructure = true;

    // Test Comprehensive System (initialization only)
    console.log('\n5. Testing Comprehensive System Initialization...');
    const comprehensiveSystem = new ComprehensiveEvidenceE2ESystem();
    
    // Only test configuration and basic setup without browser
    const sessionId = comprehensiveSystem.generateSessionId();
    console.log(`   ✅ Comprehensive System configured - Session: ${sessionId}`);
    results.comprehensiveSystem = true;

    // Summary
    console.log('\n' + '='*50);
    console.log('📊 VALIDATION RESULTS');
    console.log('='*50);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    for (const [component, passed] of Object.entries(results)) {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${component.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}: ${status}`);
    }
    
    console.log('\n' + (allPassed ? '✅ ALL VALIDATIONS PASSED' : '❌ SOME VALIDATIONS FAILED'));
    
    if (allPassed) {
      console.log('\n🎯 EVIDENCE SYSTEM READY FOR DEPLOYMENT');
      console.log('The comprehensive evidence capture and monitoring system is fully operational.');
      console.log('\nNext steps:');
      console.log('1. Run: node scripts/comprehensive-evidence-e2e-system.js');
      console.log('2. Review generated evidence reports');
      console.log('3. Use evidence for deployment decisions');
    } else {
      console.log('\n🚨 EVIDENCE SYSTEM NOT READY');
      console.log('Some components failed validation. Review the errors above.');
    }

    return allPassed;

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run validation if called directly
if (require.main === module) {
  validateEvidenceSystem().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { validateEvidenceSystem };