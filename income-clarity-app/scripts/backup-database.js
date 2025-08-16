#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Backup SQLite database with timestamped files
 * Provides automatic cleanup of old backups
 */
const backupDatabase = () => {
  try {
    // console.log('🔄 Starting database backup...');
    
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const timestamp = `${date}_${time}`;
    
    // File paths
    const sourceDb = path.join(__dirname, '../prisma/income_clarity.db');
    const backupDir = path.join(__dirname, '../data/backups');
    const backupFile = path.join(backupDir, `backup_${timestamp}.db`);
    const latestFile = path.join(backupDir, 'latest.db');
    
    // Verify source database exists
    if (!fs.existsSync(sourceDb)) {
      // console.error('❌ Source database not found:', sourceDb);
      // console.log('💡 Make sure you run "npx prisma db push" first');
      process.exit(1);
    }
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      // console.log('📁 Created backup directory:', backupDir);
    }
    
    // Get source file stats
    const sourceStats = fs.statSync(sourceDb);
    const sourceSizeMB = (sourceStats.size / (1024 * 1024)).toFixed(2);
    
    // console.log(`📊 Database size: ${sourceSizeMB} MB`);
    
    // Copy database file with timestamp
    fs.copyFileSync(sourceDb, backupFile);
    // console.log(`✅ Timestamped backup created: ${path.basename(backupFile)}`);
    
    // Create/update latest backup
    if (fs.existsSync(latestFile)) {
      fs.unlinkSync(latestFile);
    }
    fs.copyFileSync(sourceDb, latestFile);
    // console.log('✅ Latest backup updated');
    
    // Cleanup old backups (keep last 30 days)
    cleanupOldBackups(backupDir);
    
    // Generate backup info
    const backupInfo = {
      timestamp: now.toISOString(),
      filename: path.basename(backupFile),
      size: sourceStats.size,
      sizeMB: sourceSizeMB,
      path: backupFile
    };
    
    const infoFile = path.join(backupDir, `backup_${timestamp}.json`);
    fs.writeFileSync(infoFile, JSON.stringify(backupInfo, null, 2));
    
    // console.log('🎉 Database backup completed successfully!');
    // console.log(`📍 Backup location: ${backupFile}`);
    
    return backupInfo;
    
  } catch (error) {
    // console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
};

/**
 * Clean up old backups, keeping only the last 30 days
 */
const cleanupOldBackups = (backupDir) => {
  try {
    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(file => 
      file.startsWith('backup_') && 
      (file.endsWith('.db') || file.endsWith('.json'))
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    let deletedCount = 0;
    
    backupFiles.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate && file !== 'latest.db') {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      // console.log(`🧹 Cleaned up ${deletedCount} old backup files`);
    } else {
      // console.log('🧹 No old backups to clean up');
    }
    
  } catch (error) {
    // console.warn('⚠️  Cleanup warning:', error.message);
  }
};

/**
 * List all available backups
 */
const listBackups = () => {
  const backupDir = path.join(__dirname, '../data/backups');
  
  if (!fs.existsSync(backupDir)) {
    // console.log('📁 No backup directory found');
    return;
  }
  
  const files = fs.readdirSync(backupDir);
  const backupFiles = files
    .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
    .sort()
    .reverse(); // Most recent first
  
  // console.log('📋 Available backups:');
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (backupFiles.length === 0) {
    // console.log('No backups found');
    return;
  }
  
  backupFiles.forEach(file => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const date = stats.mtime.toISOString().split('T')[0];
    const time = stats.mtime.toTimeString().split(' ')[0];
    
    // console.log(`📄 ${file}`);
    // console.log(`   📅 ${date} ${time} | 💾 ${sizeMB} MB`);
  });
};

/**
 * Restore database from backup
 */
const restoreBackup = (backupFilename) => {
  const backupDir = path.join(__dirname, '../data/backups');
  const backupFile = backupFilename === 'latest' 
    ? path.join(backupDir, 'latest.db')
    : path.join(backupDir, backupFilename);
  const targetDb = path.join(__dirname, '../prisma/income_clarity.db');
  
  if (!fs.existsSync(backupFile)) {
    // console.error('❌ Backup file not found:', backupFile);
    process.exit(1);
  }
  
  // console.log('🔄 Restoring database from backup...');
  
  // Create backup of current database before restore
  if (fs.existsSync(targetDb)) {
    const preRestoreBackup = path.join(backupDir, 'pre_restore_backup.db');
    fs.copyFileSync(targetDb, preRestoreBackup);
    // console.log('💾 Current database backed up as pre_restore_backup.db');
  }
  
  // Restore from backup
  fs.copyFileSync(backupFile, targetDb);
  // console.log(`✅ Database restored from: ${path.basename(backupFile)}`);
  
  // Regenerate Prisma client to ensure sync
  // console.log('🔄 Regenerating Prisma client...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    // console.log('✅ Prisma client regenerated');
  } catch (error) {
    // console.warn('⚠️  Prisma generate warning:', error.message);
  }
  
  // console.log('🎉 Database restore completed!');
};

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      listBackups();
      break;
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        // console.error('Usage: node backup-database.js restore <backup-filename>');
        // console.log('Example: node backup-database.js restore latest');
        // console.log('Example: node backup-database.js restore backup_2024-01-15_14-30-00.db');
        process.exit(1);
      }
      restoreBackup(backupFile);
      break;
    default:
      backupDatabase();
  }
}

module.exports = { backupDatabase, listBackups, restoreBackup };