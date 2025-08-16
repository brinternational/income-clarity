#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * LITE-035: Backup Monitoring and Health Check System
 * Monitors backup health, verifies files, and sends alerts
 */
class BackupMonitor {
  constructor() {
    this.backupDir = path.join(__dirname, '../data/backups');
    this.maxBackupAge = 25 * 60 * 60 * 1000; // 25 hours (allow for missed day)
    this.minBackupSize = 1024; // 1KB minimum (very small for empty DB)
  }

  /**
   * Check backup health and return status
   */
  checkBackupHealth() {
    const health = {
      status: 'healthy',
      lastBackupTime: null,
      lastBackupSize: 0,
      backupCount: 0,
      errors: [],
      warnings: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Check if backup directory exists
      if (!fs.existsSync(this.backupDir)) {
        health.status = 'error';
        health.errors.push('Backup directory does not exist');
        return health;
      }

      // Get all backup files
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
        .sort()
        .reverse(); // Most recent first

      health.backupCount = backupFiles.length;

      if (backupFiles.length === 0) {
        health.status = 'error';
        health.errors.push('No backup files found');
        return health;
      }

      // Check latest backup
      const latestBackup = backupFiles[0];
      const latestPath = path.join(this.backupDir, latestBackup);
      const stats = fs.statSync(latestPath);
      
      health.lastBackupTime = stats.mtime.toISOString();
      health.lastBackupSize = stats.size;

      // Check backup age
      const backupAge = Date.now() - stats.mtime.getTime();
      if (backupAge > this.maxBackupAge) {
        health.status = 'warning';
        health.warnings.push(`Latest backup is ${Math.round(backupAge / (60 * 60 * 1000))} hours old`);
      }

      // Check backup size
      if (stats.size < this.minBackupSize) {
        health.status = 'warning';
        health.warnings.push(`Backup file is suspiciously small: ${stats.size} bytes`);
      }

      // Check backup file integrity
      try {
        // Attempt to open and read basic info from SQLite file
        const buffer = fs.readFileSync(latestPath, { start: 0, end: 16 });
        const header = buffer.toString('ascii', 0, 16);
        
        if (!header.startsWith('SQLite format')) {
          health.status = 'error';
          health.errors.push('Latest backup file is not a valid SQLite database');
        }
      } catch (error) {
        health.status = 'error';
        health.errors.push(`Failed to verify backup integrity: ${error.message}`);
      }

      // Recommendations based on backup count
      if (health.backupCount < 7) {
        health.recommendations.push('Consider keeping at least 7 days of backups');
      } else if (health.backupCount > 60) {
        health.recommendations.push('Consider implementing cleanup for backups older than 60 days');
      }

      // Check latest.db symlink
      const latestLink = path.join(this.backupDir, 'latest.db');
      if (!fs.existsSync(latestLink)) {
        health.warnings.push('Latest backup symlink is missing');
      }

    } catch (error) {
      health.status = 'error';
      health.errors.push(`Backup health check failed: ${error.message}`);
    }

    return health;
  }

  /**
   * Generate backup report
   */
  generateReport() {
    const health = this.checkBackupHealth();
    
    // console.log('📊 Income Clarity Backup Health Report');
    // console.log('═'.repeat(50));
    // console.log(`Status: ${health.status.toUpperCase()}`);
    // console.log(`Timestamp: ${health.timestamp}`);
    // console.log(`Backup Count: ${health.backupCount}`);
    
    if (health.lastBackupTime) {
      const age = Math.round((Date.now() - new Date(health.lastBackupTime).getTime()) / (60 * 60 * 1000));
      // console.log(`Last Backup: ${health.lastBackupTime} (${age}h ago)`);
      // console.log(`Last Backup Size: ${(health.lastBackupSize / 1024 / 1024).toFixed(2)} MB`);
    }

    if (health.errors.length > 0) {
      // console.log('\n❌ ERRORS:');
      health.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (health.warnings.length > 0) {
      // console.log('\n⚠️  WARNINGS:');
      health.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    if (health.recommendations.length > 0) {
      // console.log('\n💡 RECOMMENDATIONS:');
      health.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    return health;
  }

  /**
   * Cleanup old backups beyond retention period
   */
  cleanupOldBackups(retentionDays = 30) {
    try {
      if (!fs.existsSync(this.backupDir)) {
        // console.log('⚠️  Backup directory does not exist');
        return;
      }

      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files.filter(file => 
        file.startsWith('backup_') && 
        (file.endsWith('.db') || file.endsWith('.json'))
      );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      let deletedCount = 0;

      backupFiles.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate && file !== 'latest.db') {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      // console.log(`🧹 Cleaned up ${deletedCount} old backup files (retention: ${retentionDays} days)`);
      return deletedCount;

    } catch (error) {
      // console.error('❌ Cleanup failed:', error.message);
      return 0;
    }
  }

  /**
   * Send alert (placeholder for notification integration)
   */
  sendAlert(health) {
    if (health.status === 'error') {
      // console.log('🚨 BACKUP ALERT: Critical backup issues detected');
      // TODO: Integrate with notification system (email, Slack, etc.)
    }
  }

  /**
   * Verify backup file can be restored
   */
  verifyRestore(backupFile = 'latest.db') {
    try {
      // console.log(`🔍 Verifying backup restoration capability for ${backupFile}`);

      const backupPath = path.join(this.backupDir, backupFile);
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupFile}`);
      }

      // Check file size
      const stats = fs.statSync(backupPath);
      if (stats.size < this.minBackupSize) {
        throw new Error(`Backup file is too small: ${stats.size} bytes`);
      }

      // Verify SQLite file header
      const buffer = fs.readFileSync(backupPath, { start: 0, end: 16 });
      const header = buffer.toString('ascii', 0, 16);
      
      if (!header.startsWith('SQLite format')) {
        throw new Error('File is not a valid SQLite database');
      }

      // Create temporary restore location for testing
      const tempDir = path.join(__dirname, '../data/test-restore');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const testRestorePath = path.join(tempDir, 'restored_test.db');
      
      // Test file copy operation (simulates restore)
      fs.copyFileSync(backupPath, testRestorePath);
      
      // Verify copied file
      const testStats = fs.statSync(testRestorePath);
      if (testStats.size !== stats.size) {
        throw new Error('Backup copy verification failed - size mismatch');
      }

      // console.log(`✅ Backup verification successful:`);
      // console.log(`   • File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      // console.log(`   • SQLite format: Valid`);
      // console.log(`   • Copy operation: Successful`);
      
      // Clean up test file
      fs.unlinkSync(testRestorePath);
      
      return true;

    } catch (error) {
      // console.error('❌ Backup verification failed:', error.message);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new BackupMonitor();
  const command = process.argv[2];

  switch (command) {
    case 'health':
    case 'status':
      monitor.generateReport();
      break;

    case 'cleanup':
      const retentionDays = parseInt(process.argv[3]) || 30;
      monitor.cleanupOldBackups(retentionDays);
      break;

    case 'verify':
      const backupFile = process.argv[3] || 'latest.db';
      monitor.verifyRestore(backupFile);
      break;

    case 'alert':
      const health = monitor.checkBackupHealth();
      monitor.sendAlert(health);
      break;

    default:
      // console.log('Usage: node backup-monitor.js <command>');
      // console.log('Commands:');
      // console.log('  health    - Check backup health and generate report');
      // console.log('  cleanup   - Clean up old backups (default: 30 days)');
      // console.log('  verify    - Verify backup can be restored');
      // console.log('  alert     - Send alerts if backup issues detected');
  }
}

module.exports = { BackupMonitor };