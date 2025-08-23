#!/usr/bin/env node

/**
 * EVIDENCE CAPTURE MANAGER
 * 
 * PURPOSE: Comprehensive screenshot evidence system with systematic metadata capture
 * FEATURES: Before/after states, cross-device comparison, evidence correlation
 * MANDATE: Visual proof at every critical test phase with forensic-level documentation
 */

const fs = require('fs').promises;
const path = require('path');

class EvidenceCaptureManager {
  constructor(config = {}) {
    this.config = {
      baseDir: config.baseDir || './test-results/evidence-capture',
      screenshotDir: config.screenshotDir || './test-results/evidence-capture/screenshots',
      metadataDir: config.metadataDir || './test-results/evidence-capture/metadata',
      archiveDir: config.archiveDir || './test-results/evidence-capture/archive',
      maxRetentionDays: config.maxRetentionDays || 30,
      ...config
    };

    this.evidenceIndex = [];
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      evidence: []
    };
  }

  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  async initialize() {
    console.log('📸 Initializing Evidence Capture Manager...');
    
    // Create directory structure
    await this.createDirectoryStructure();
    
    // Load existing evidence index
    await this.loadEvidenceIndex();
    
    console.log(`✅ Evidence Capture Manager initialized - Session: ${this.currentSession.sessionId}`);
  }

  async createDirectoryStructure() {
    const directories = [
      this.config.baseDir,
      this.config.screenshotDir,
      this.config.metadataDir,
      this.config.archiveDir,
      path.join(this.config.screenshotDir, 'before-after'),
      path.join(this.config.screenshotDir, 'cross-device'),
      path.join(this.config.screenshotDir, 'error-states'),
      path.join(this.config.screenshotDir, 'user-journeys'),
      path.join(this.config.metadataDir, 'console-states'),
      path.join(this.config.metadataDir, 'performance-metrics')
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async loadEvidenceIndex() {
    const indexPath = path.join(this.config.baseDir, 'evidence-index.json');
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      this.evidenceIndex = JSON.parse(indexData);
    } catch (error) {
      // Index doesn't exist yet - create empty
      this.evidenceIndex = {
        sessions: [],
        totalEvidence: 0,
        lastCleanup: null,
        retentionPolicy: {
          maxDays: this.config.maxRetentionDays,
          maxSessions: 100
        }
      };
    }
  }

  async saveEvidenceIndex() {
    const indexPath = path.join(this.config.baseDir, 'evidence-index.json');
    await fs.writeFile(indexPath, JSON.stringify(this.evidenceIndex, null, 2));
  }

  /**
   * SYSTEMATIC SCREENSHOT CAPTURE WITH METADATA
   */
  async captureEvidence(page, context) {
    const evidenceId = this.generateEvidenceId();
    const timestamp = new Date().toISOString();
    
    const evidence = {
      id: evidenceId,
      sessionId: this.currentSession.sessionId,
      timestamp,
      type: context.type || 'screenshot',
      phase: context.phase || 'unknown',
      url: page.url(),
      viewport: await page.viewportSize(),
      metadata: {
        testCase: context.testCase || null,
        userAction: context.userAction || null,
        expectedOutcome: context.expectedOutcome || null,
        actualOutcome: context.actualOutcome || null,
        consoleState: null, // Will be populated
        performanceMetrics: null // Will be populated
      },
      files: {
        screenshot: null,
        consoleLog: null,
        performanceLog: null
      }
    };

    // Capture screenshot
    evidence.files.screenshot = await this.captureScreenshot(page, evidenceId, context);
    
    // Capture console state
    evidence.files.consoleLog = await this.captureConsoleState(page, evidenceId, context);
    
    // Capture performance metrics
    evidence.files.performanceLog = await this.capturePerformanceMetrics(page, evidenceId, context);
    
    // Save evidence metadata
    await this.saveEvidenceMetadata(evidence);
    
    // Add to current session
    this.currentSession.evidence.push(evidence);
    
    console.log(`📸 Evidence captured: ${evidenceId} (${context.type || 'screenshot'})`);
    
    return evidence;
  }

  generateEvidenceId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `evidence_${timestamp}_${random}`;
  }

  async captureScreenshot(page, evidenceId, context) {
    const screenshotFilename = `${evidenceId}_${context.phase || 'capture'}.png`;
    let screenshotPath;

    // Organize by screenshot type
    switch (context.type) {
      case 'before-after':
        screenshotPath = path.join(this.config.screenshotDir, 'before-after', screenshotFilename);
        break;
      case 'cross-device':
        screenshotPath = path.join(this.config.screenshotDir, 'cross-device', screenshotFilename);
        break;
      case 'error-state':
        screenshotPath = path.join(this.config.screenshotDir, 'error-states', screenshotFilename);
        break;
      case 'user-journey':
        screenshotPath = path.join(this.config.screenshotDir, 'user-journeys', screenshotFilename);
        break;
      default:
        screenshotPath = path.join(this.config.screenshotDir, screenshotFilename);
    }

    // Capture screenshot with appropriate options
    await page.screenshot({
      path: screenshotPath,
      fullPage: context.fullPage !== false, // Default to full page
      clip: context.clip || null
    });

    return screenshotPath;
  }

  async captureConsoleState(page, evidenceId, context) {
    const consoleFilename = `${evidenceId}_console_state.json`;
    const consolePath = path.join(this.config.metadataDir, 'console-states', consoleFilename);

    // Get current console messages and errors
    const consoleState = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      consoleMessages: context.consoleMessages || [],
      networkRequests: context.networkRequests || [],
      pageErrors: context.pageErrors || [],
      resourceLoadErrors: context.resourceLoadErrors || []
    };

    await fs.writeFile(consolePath, JSON.stringify(consoleState, null, 2));
    return consolePath;
  }

  async capturePerformanceMetrics(page, evidenceId, context) {
    const performanceFilename = `${evidenceId}_performance.json`;
    const performancePath = path.join(this.config.metadataDir, 'performance-metrics', performanceFilename);

    try {
      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return {
          loadComplete: perfData ? perfData.loadEventEnd - perfData.loadEventStart : null,
          domContentLoaded: perfData ? perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart : null,
          firstPaint: perfData ? perfData.loadEventEnd - perfData.fetchStart : null,
          memoryUsage: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null
        };
      });

      const performanceData = {
        timestamp: new Date().toISOString(),
        url: page.url(),
        metrics,
        context: context.performanceContext || {}
      };

      await fs.writeFile(performancePath, JSON.stringify(performanceData, null, 2));
      return performancePath;
    } catch (error) {
      console.warn(`⚠️ Could not capture performance metrics: ${error.message}`);
      return null;
    }
  }

  async saveEvidenceMetadata(evidence) {
    const metadataFilename = `${evidence.id}_metadata.json`;
    const metadataPath = path.join(this.config.metadataDir, metadataFilename);
    
    await fs.writeFile(metadataPath, JSON.stringify(evidence, null, 2));
  }

  /**
   * BEFORE/AFTER STATE DOCUMENTATION
   */
  async captureBeforeAfterEvidence(page, actionDescription, actionFn) {
    console.log(`🔄 Capturing before/after evidence: ${actionDescription}`);
    
    const beforeEvidence = await this.captureEvidence(page, {
      type: 'before-after',
      phase: 'before',
      userAction: actionDescription,
      expectedOutcome: 'State before action'
    });

    // Perform the action
    let actionResult;
    try {
      actionResult = await actionFn();
    } catch (error) {
      // Capture error state
      await this.captureEvidence(page, {
        type: 'error-state',
        phase: 'action-error',
        userAction: actionDescription,
        actualOutcome: `Action failed: ${error.message}`
      });
      throw error;
    }

    // Wait for page to stabilize after action
    await page.waitForTimeout(1000);

    const afterEvidence = await this.captureEvidence(page, {
      type: 'before-after',
      phase: 'after',
      userAction: actionDescription,
      expectedOutcome: 'State after action',
      actualOutcome: actionResult ? 'Action completed successfully' : 'Action completed'
    });

    return {
      before: beforeEvidence,
      after: afterEvidence,
      actionResult
    };
  }

  /**
   * CROSS-DEVICE EVIDENCE COMPARISON
   */
  async captureCrossDeviceEvidence(page, testCase) {
    console.log(`📱 Capturing cross-device evidence for: ${testCase.description}`);
    
    const devices = [
      { name: 'desktop', viewport: { width: 1920, height: 1080 } },
      { name: 'tablet', viewport: { width: 1024, height: 768 } },
      { name: 'mobile', viewport: { width: 375, height: 667 } }
    ];

    const crossDeviceEvidence = [];

    for (const device of devices) {
      // Set viewport
      await page.setViewportSize(device.viewport);
      await page.waitForTimeout(1000); // Allow layout to settle

      const evidence = await this.captureEvidence(page, {
        type: 'cross-device',
        phase: device.name,
        testCase: testCase.description,
        expectedOutcome: `Responsive layout for ${device.name}`,
        viewport: device.viewport
      });

      crossDeviceEvidence.push({
        device: device.name,
        evidence
      });
    }

    return crossDeviceEvidence;
  }

  /**
   * ERROR STATE DOCUMENTATION
   */
  async captureErrorStateEvidence(page, error, context = {}) {
    console.log(`❌ Capturing error state evidence: ${error.message}`);
    
    const evidence = await this.captureEvidence(page, {
      type: 'error-state',
      phase: 'error-occurred',
      userAction: context.userAction || 'Unknown action',
      expectedOutcome: context.expectedOutcome || 'Successful operation',
      actualOutcome: `Error: ${error.message}`,
      errorDetails: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });

    // Also capture recovery attempt if provided
    if (context.recoveryAction) {
      try {
        await context.recoveryAction();
        await page.waitForTimeout(1000);
        
        await this.captureEvidence(page, {
          type: 'error-state',
          phase: 'error-recovery',
          userAction: 'Recovery attempt',
          actualOutcome: 'Recovery action executed'
        });
      } catch (recoveryError) {
        await this.captureEvidence(page, {
          type: 'error-state',
          phase: 'recovery-failed',
          userAction: 'Recovery attempt',
          actualOutcome: `Recovery failed: ${recoveryError.message}`
        });
      }
    }

    return evidence;
  }

  /**
   * SESSION MANAGEMENT
   */
  async finalizeSession() {
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = new Date(this.currentSession.endTime) - new Date(this.currentSession.startTime);
    this.currentSession.totalEvidence = this.currentSession.evidence.length;

    // Add session to evidence index
    this.evidenceIndex.sessions.push({
      sessionId: this.currentSession.sessionId,
      startTime: this.currentSession.startTime,
      endTime: this.currentSession.endTime,
      duration: this.currentSession.duration,
      totalEvidence: this.currentSession.totalEvidence
    });

    this.evidenceIndex.totalEvidence += this.currentSession.totalEvidence;

    // Save session details
    const sessionPath = path.join(this.config.baseDir, `session_${this.currentSession.sessionId}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(this.currentSession, null, 2));

    // Update evidence index
    await this.saveEvidenceIndex();

    console.log(`✅ Session finalized: ${this.currentSession.sessionId} (${this.currentSession.totalEvidence} evidence items)`);
  }

  /**
   * EVIDENCE ARCHIVAL AND CLEANUP
   */
  async performArchival() {
    console.log('🗂️ Performing evidence archival...');
    
    const now = new Date();
    const maxAge = this.config.maxRetentionDays * 24 * 60 * 60 * 1000;
    let archivedCount = 0;
    let deletedCount = 0;

    // Archive old sessions
    for (const session of this.evidenceIndex.sessions) {
      const sessionAge = now - new Date(session.startTime);
      
      if (sessionAge > maxAge) {
        try {
          const sessionPath = path.join(this.config.baseDir, `session_${session.sessionId}.json`);
          const archivePath = path.join(this.config.archiveDir, `session_${session.sessionId}.json`);
          
          // Move to archive
          await fs.rename(sessionPath, archivePath);
          
          // Archive associated evidence files (move screenshots and metadata)
          // Implementation would move all files associated with this session
          
          archivedCount++;
        } catch (error) {
          console.warn(`⚠️ Could not archive session ${session.sessionId}: ${error.message}`);
        }
      }
    }

    // Clean up very old archived sessions
    const archiveMaxAge = maxAge * 2; // Keep archives for 2x retention period
    // Implementation would clean up archived files older than archiveMaxAge

    this.evidenceIndex.lastCleanup = now.toISOString();
    await this.saveEvidenceIndex();

    console.log(`✅ Archival complete: ${archivedCount} archived, ${deletedCount} deleted`);
    return { archivedCount, deletedCount };
  }

  /**
   * EVIDENCE RETRIEVAL AND ANALYSIS
   */
  async getEvidenceForSession(sessionId) {
    const sessionPath = path.join(this.config.baseDir, `session_${sessionId}.json`);
    
    try {
      const sessionData = await fs.readFile(sessionPath, 'utf8');
      return JSON.parse(sessionData);
    } catch (error) {
      throw new Error(`Session ${sessionId} not found or could not be loaded: ${error.message}`);
    }
  }

  async getEvidenceByType(type, limit = 10) {
    const matchingEvidence = [];
    
    // Search through current session first
    for (const evidence of this.currentSession.evidence) {
      if (evidence.type === type) {
        matchingEvidence.push(evidence);
      }
    }

    // If needed, search through other sessions
    if (matchingEvidence.length < limit) {
      // Implementation would search through other session files
    }

    return matchingEvidence.slice(0, limit);
  }

  /**
   * EVIDENCE STATISTICS
   */
  getEvidenceStatistics() {
    return {
      currentSession: {
        sessionId: this.currentSession.sessionId,
        startTime: this.currentSession.startTime,
        evidenceCount: this.currentSession.evidence.length,
        evidenceTypes: this.getEvidenceTypeBreakdown(this.currentSession.evidence)
      },
      total: {
        totalSessions: this.evidenceIndex.sessions.length,
        totalEvidence: this.evidenceIndex.totalEvidence,
        lastCleanup: this.evidenceIndex.lastCleanup
      },
      retention: this.evidenceIndex.retentionPolicy
    };
  }

  getEvidenceTypeBreakdown(evidenceList) {
    const breakdown = {};
    for (const evidence of evidenceList) {
      breakdown[evidence.type] = (breakdown[evidence.type] || 0) + 1;
    }
    return breakdown;
  }
}

module.exports = { EvidenceCaptureManager };