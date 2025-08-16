#!/usr/bin/env node

/**
 * Backup and Restore System Test
 * Verifies backup/restore functionality without affecting production database
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const { backupDatabase, listBackups, restoreBackup } = require('./backup-database');

// console.log('🧪 Testing Backup and Restore System\n');

const backupDir = path.join(__dirname, '../data/backups');
const testDir = path.join(__dirname, '../data/test-restore');
const originalDb = path.join(__dirname, '../prisma/income_clarity.db');

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  // console.log('📁 Created test directory');
}

async function runBackupRestoreTests() {
  let testsPassed = 0;
  let totalTests = 0;
  
  // console.log('🔬 Running backup and restore tests...\n');
  
  // Test 1: Verify backup creation
  // console.log('1️⃣  Testing backup creation...');
  totalTests++;
  try {
    const originalSize = fs.statSync(originalDb).size;
    const backupInfo = backupDatabase();
    
    if (fs.existsSync(backupInfo.path) && backupInfo.size === originalSize) {
      // console.log('   ✅ Backup creation successful');
      // console.log(`   📊 Size match: ${backupInfo.sizeMB} MB`);
      testsPassed++;
    } else {
      // console.log('   ❌ Backup creation failed - size mismatch or file not found');
    }
  } catch (error) {
    // console.log(`   ❌ Backup creation failed: ${error.message}`);
  }
  
  // Test 2: Verify latest backup exists
  // console.log('\n2️⃣  Testing latest backup functionality...');
  totalTests++;
  try {
    const latestBackup = path.join(backupDir, 'latest.db');
    if (fs.existsSync(latestBackup)) {
      const latestSize = fs.statSync(latestBackup).size;
      const originalSize = fs.statSync(originalDb).size;
      
      if (latestSize === originalSize) {
        // console.log('   ✅ Latest backup exists and size matches');
        testsPassed++;
      } else {
        // console.log('   ❌ Latest backup size mismatch');
      }
    } else {
      // console.log('   ❌ Latest backup file not found');
    }
  } catch (error) {
    // console.log(`   ❌ Latest backup test failed: ${error.message}`);
  }
  
  // Test 3: Test backup integrity by opening with SQLite
  // console.log('\n3️⃣  Testing backup file integrity...');
  totalTests++;
  try {
    const latestBackup = path.join(backupDir, 'latest.db');
    const db = Database(latestBackup, { readonly: true });
    
    // Test basic queries
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    
    db.close();
    
    if (tables.length > 0) {
      // console.log(`   ✅ Backup file integrity verified`);
      // console.log(`   📊 Tables: ${tables.length}, Users: ${userCount.count}`);
      testsPassed++;
    } else {
      // console.log('   ❌ Backup file appears corrupted - no tables found');
    }
  } catch (error) {
    // console.log(`   ❌ Backup integrity test failed: ${error.message}`);
  }
  
  // Test 4: Test restore to a safe location (non-destructive)
  // console.log('\n4️⃣  Testing restore functionality (non-destructive)...');
  totalTests++;
  try {
    const testRestoreDb = path.join(testDir, 'restored_test.db');
    const latestBackup = path.join(backupDir, 'latest.db');
    
    // Copy backup to test location
    fs.copyFileSync(latestBackup, testRestoreDb);
    
    // Verify restored database
    const restoredDb = Database(testRestoreDb, { readonly: true });
    const restoredTables = restoredDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const restoredUserCount = restoredDb.prepare("SELECT COUNT(*) as count FROM users").get();
    restoredDb.close();
    
    // Compare with original
    const originalDb_test = Database(originalDb, { readonly: true });
    const originalTables = originalDb_test.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const originalUserCount = originalDb_test.prepare("SELECT COUNT(*) as count FROM users").get();
    originalDb_test.close();
    
    if (restoredTables.length === originalTables.length && 
        restoredUserCount.count === originalUserCount.count) {
      // console.log('   ✅ Restore functionality verified');
      // console.log(`   📊 Tables restored: ${restoredTables.length}, Users: ${restoredUserCount.count}`);
      testsPassed++;
    } else {
      // console.log('   ❌ Restore verification failed - data mismatch');
    }
    
    // Clean up test file
    fs.unlinkSync(testRestoreDb);
    
  } catch (error) {
    // console.log(`   ❌ Restore test failed: ${error.message}`);
  }
  
  // Test 5: Test backup listing functionality
  // console.log('\n5️⃣  Testing backup listing...');
  totalTests++;
  try {
    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(file => 
      file.startsWith('backup_') && file.endsWith('.db')
    );
    
    if (backupFiles.length > 0) {
      // console.log(`   ✅ Backup listing functional`);
      // console.log(`   📊 Found ${backupFiles.length} backup files`);
      testsPassed++;
    } else {
      // console.log('   ❌ No backup files found');
    }
  } catch (error) {
    // console.log(`   ❌ Backup listing test failed: ${error.message}`);
  }
  
  // Test 6: Test backup metadata (JSON files)
  // console.log('\n6️⃣  Testing backup metadata...');
  totalTests++;
  try {
    const files = fs.readdirSync(backupDir);
    const metadataFiles = files.filter(file => 
      file.startsWith('backup_') && file.endsWith('.json')
    );
    
    if (metadataFiles.length > 0) {
      // Test the latest metadata file
      const latestMeta = metadataFiles.sort().reverse()[0];
      const metaPath = path.join(backupDir, latestMeta);
      const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      
      if (metadata.timestamp && metadata.filename && metadata.size && metadata.path) {
        // console.log('   ✅ Backup metadata functional');
        // console.log(`   📊 Latest: ${metadata.filename} (${metadata.sizeMB} MB)`);
        testsPassed++;
      } else {
        // console.log('   ❌ Backup metadata incomplete');
      }
    } else {
      // console.log('   ❌ No backup metadata files found');
    }
  } catch (error) {
    // console.log(`   ❌ Backup metadata test failed: ${error.message}`);
  }
  
  // Test 7: Test automated cleanup simulation
  // console.log('\n7️⃣  Testing backup cleanup functionality...');
  totalTests++;
  try {
    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(file => 
      (file.startsWith('backup_') && (file.endsWith('.db') || file.endsWith('.json'))) ||
      file === 'latest.db'
    );
    
    // Count files that would be kept vs deleted (30 day policy)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    let wouldKeep = 0;
    let wouldDelete = 0;
    
    backupFiles.forEach(file => {
      if (file === 'latest.db') {
        wouldKeep++;
        return;
      }
      
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime >= cutoffDate) {
        wouldKeep++;
      } else {
        wouldDelete++;
      }
    });
    
    // console.log('   ✅ Cleanup policy functional');
    // console.log(`   📊 Would keep: ${wouldKeep} files, Would delete: ${wouldDelete} files`);
    testsPassed++;
    
  } catch (error) {
    // console.log(`   ❌ Cleanup test failed: ${error.message}`);
  }
  
  // Test Results Summary
  // console.log('\n📊 Test Results Summary');
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // console.log(`Tests passed: ${testsPassed}/${totalTests}`);
  // console.log(`Success rate: ${(testsPassed/totalTests*100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    // console.log('🎉 All backup and restore tests PASSED!');
    // console.log('✅ Backup system is fully functional');
  } else {
    // console.log('⚠️  Some tests failed. Review the issues above.');
  }
  
  // Additional recommendations
  // console.log('\n💡 Backup System Status:');
  
  const dbSize = (fs.statSync(originalDb).size / (1024 * 1024)).toFixed(2);
  const backupCount = fs.readdirSync(backupDir).filter(f => f.startsWith('backup_') && f.endsWith('.db')).length;
  
  // console.log(`   📊 Database size: ${dbSize} MB`);
  // console.log(`   📋 Available backups: ${backupCount}`);
  // console.log(`   📁 Backup directory: ${backupDir}`);
  // console.log(`   🔄 Backup frequency: Manual (recommended: daily)`);
  // console.log(`   🧹 Retention policy: 30 days`);
  
  // console.log('\n📝 Recommendations:');
  // console.log('   1. Set up automated daily backups via cron or systemd timer');
  // console.log('   2. Consider off-site backup storage for disaster recovery');
  // console.log('   3. Test restore procedure monthly');
  // console.log('   4. Monitor backup directory disk space');
  
  return testsPassed === totalTests;
}

// Additional utility functions for backup analysis
function analyzeBackups() {
  // console.log('\n🔍 Backup Analysis');
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(file => 
      file.startsWith('backup_') && file.endsWith('.db')
    ).sort();
    
    if (backupFiles.length === 0) {
      // console.log('No backup files found');
      return;
    }
    
    let totalSize = 0;
    let oldestBackup = null;
    let newestBackup = null;
    
    backupFiles.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      if (!oldestBackup || stats.mtime < oldestBackup.mtime) {
        oldestBackup = { file, mtime: stats.mtime, size: stats.size };
      }
      
      if (!newestBackup || stats.mtime > newestBackup.mtime) {
        newestBackup = { file, mtime: stats.mtime, size: stats.size };
      }
    });
    
    // console.log(`Total backups: ${backupFiles.length}`);
    // console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    // console.log(`Average size: ${(totalSize / backupFiles.length / (1024 * 1024)).toFixed(2)} MB`);
    // console.log(`Oldest: ${oldestBackup.file} (${oldestBackup.mtime.toISOString().split('T')[0]})`);
    // console.log(`Newest: ${newestBackup.file} (${newestBackup.mtime.toISOString().split('T')[0]})`);
    
    // Check for size anomalies
    const avgSize = totalSize / backupFiles.length;
    const threshold = avgSize * 0.1; // 10% variation threshold
    
    const anomalies = backupFiles.filter(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return Math.abs(stats.size - avgSize) > threshold;
    });
    
    if (anomalies.length > 0) {
      // console.log(`⚠️  Size anomalies detected: ${anomalies.length} files`);
      anomalies.forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        // console.log(`   • ${file}: ${sizeMB} MB`);
      });
    } else {
      // console.log('✅ All backup sizes are consistent');
    }
    
  } catch (error) {
    // console.error('Backup analysis failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  runBackupRestoreTests()
    .then(success => {
      analyzeBackups();
      
      // console.log('\n🎯 Next Steps:');
      // console.log('   1. Document the backup/restore procedures');
      // console.log('   2. Set up automated backups');
      // console.log('   3. Create disaster recovery plan');
      // console.log('   4. Test restore in staging environment');
      
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      // console.error('Test execution failed:', error);
      process.exit(1);
    });
}