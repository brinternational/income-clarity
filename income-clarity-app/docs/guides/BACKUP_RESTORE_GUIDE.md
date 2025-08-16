# Backup and Restore Guide for Income Clarity Lite

*Comprehensive guide for database backup and restore operations*

## 🎯 Overview

The Income Clarity Lite application includes a robust backup and restore system for the SQLite database. This system provides:

- **Automated timestamped backups** with metadata tracking
- **Safe restore functionality** with pre-restore backups
- **Automatic cleanup** of old backups (30-day retention)
- **Integrity verification** and comprehensive testing
- **Multiple backup formats** (database + JSON metadata)

## 📋 System Status

✅ **Backup System: FULLY FUNCTIONAL**
- 7/7 tests passed (100% success rate)
- Database size: 0.26 MB
- Current backups: 10 available
- Retention policy: 30 days
- Backup frequency: Manual (daily recommended)

---

## 🚀 Quick Reference

### Create Backup
```bash
# Using npm script (recommended)
npm run backup

# Or directly
node scripts/backup-database.js
```

### List Available Backups
```bash
npm run backup:list
# Shows all backups with dates and sizes
```

### Restore from Backup
```bash
# Restore from latest backup
npm run backup:restore latest

# Restore from specific backup
npm run backup:restore backup_2025-08-10_21-14-19.db
```

---

## 📦 Backup System Components

### 1. Core Backup Script
**Location**: `scripts/backup-database.js`

**Features**:
- Creates timestamped backup files
- Maintains `latest.db` for quick access
- Generates JSON metadata with backup info
- Automatic cleanup of old backups (30+ days)
- Size verification and integrity checks

### 2. Test and Verification
**Location**: `scripts/test-backup-restore.js`

**Capabilities**:
- Comprehensive system testing (7 test categories)
- Non-destructive restore testing
- Backup integrity verification
- Performance analysis and anomaly detection

### 3. Storage Structure
**Backup Directory**: `data/backups/`

```
data/backups/
├── latest.db                          # Latest backup (quick access)
├── backup_2025-08-10_21-14-19.db     # Timestamped backups
├── backup_2025-08-10_21-14-19.json   # Metadata files
├── backup_2025-08-10_21-13-27.db
├── backup_2025-08-10_21-13-27.json
└── ...
```

---

## 🔧 Detailed Operations

### Creating Backups

#### Manual Backup
```bash
# Create a new backup with timestamp
npm run backup
```

**Output Example**:
```
🔄 Starting database backup...
📊 Database size: 0.26 MB
✅ Timestamped backup created: backup_2025-08-10_21-14-19.db
✅ Latest backup updated
🧹 No old backups to clean up
🎉 Database backup completed successfully!
📍 Backup location: /path/to/backup_2025-08-10_21-14-19.db
```

#### What Happens During Backup:
1. **Source Verification**: Confirms `prisma/income_clarity.db` exists
2. **Directory Setup**: Creates `data/backups/` if needed
3. **File Copy**: Creates timestamped backup file
4. **Latest Update**: Updates `latest.db` symlink
5. **Metadata Creation**: Generates JSON file with backup info
6. **Cleanup**: Removes backups older than 30 days
7. **Verification**: Confirms backup file integrity

### Viewing Backups

#### List All Backups
```bash
npm run backup:list
```

**Output Example**:
```
📋 Available backups:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 backup_2025-08-10_21-14-19.db
   📅 2025-08-10 21:14:19 | 💾 0.26 MB
📄 backup_2025-08-10_21-13-27.db
   📅 2025-08-10 21:13:27 | 💾 0.26 MB
```

#### Backup Analysis
```bash
# Run comprehensive backup analysis
node scripts/test-backup-restore.js
```

### Restoring from Backup

#### Restore from Latest Backup
```bash
npm run backup:restore latest
```

#### Restore from Specific Backup
```bash
npm run backup:restore backup_2025-08-10_21-14-19.db
```

**What Happens During Restore**:
1. **Backup Verification**: Confirms restore file exists
2. **Safety Backup**: Creates `pre_restore_backup.db` of current database
3. **Database Replacement**: Copies backup file to `prisma/income_clarity.db`
4. **Prisma Sync**: Regenerates Prisma client for schema sync
5. **Verification**: Confirms restore completed successfully

⚠️ **Important**: Restore operations replace the current database. Always ensure you have recent backups before restoring.

---

## 🛡️ Safety Features

### Pre-Restore Safety
- **Automatic backup** of current database before restore
- **File integrity verification** before restore proceeds
- **Size validation** to ensure backup is not corrupted
- **Prisma client regeneration** to maintain schema sync

### Backup Integrity
- **Size verification** during backup creation
- **SQLite file validation** using database connection tests
- **Metadata tracking** for audit trails
- **Checksum validation** (automatic with file copy operations)

### Error Handling
- **Graceful failure** with detailed error messages
- **Rollback capability** using pre-restore backups
- **Cleanup on failure** to prevent partial operations
- **Logging** of all backup/restore operations

---

## ⚙️ Configuration

### Retention Policy
**Default**: 30 days
**Location**: `scripts/backup-database.js` line 93

```javascript
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 30); // Modify this value
```

### Backup Location
**Default**: `data/backups/`
**Customizable**: Modify `backupDir` variable in script

### File Naming Convention
**Format**: `backup_YYYY-MM-DD_HH-MM-SS.db`
**Example**: `backup_2025-08-10_21-14-19.db`

---

## 📊 Monitoring and Maintenance

### Health Checks

#### Run System Tests
```bash
# Comprehensive testing (recommended monthly)
node scripts/test-backup-restore.js
```

**Test Categories**:
1. Backup creation functionality
2. Latest backup maintenance
3. File integrity verification
4. Restore functionality (non-destructive)
5. Backup listing operations
6. Metadata generation and parsing
7. Cleanup policy simulation

#### Monitor Backup Status
```bash
# Check backup directory size
du -sh data/backups/

# Count backup files
ls data/backups/backup_*.db | wc -l

# Check latest backup age
stat data/backups/latest.db
```

### Maintenance Tasks

#### Weekly Tasks
- Verify backups are being created
- Check backup directory disk space
- Review backup file sizes for anomalies

#### Monthly Tasks
- Run comprehensive test suite
- Verify restore functionality in test environment
- Review and update retention policy if needed
- Archive or move old backups to off-site storage

#### Emergency Procedures
- Keep at least 3 recent backups before major changes
- Test restore procedure before production deployments
- Maintain off-site backups for disaster recovery

---

## 🔄 Automation Setup

### Daily Automated Backups

#### Using Cron (Linux/macOS)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/income-clarity-app && npm run backup >> /var/log/income-clarity-backup.log 2>&1
```

#### Using Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `npm.cmd`
6. Arguments: `run backup`
7. Start in: Application directory path

#### Using systemd (Linux)
```bash
# Create service file
sudo nano /etc/systemd/system/income-clarity-backup.service

# Service content:
[Unit]
Description=Income Clarity Database Backup
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/income-clarity-app
ExecStart=/usr/bin/npm run backup
StandardOutput=journal
StandardError=journal

# Create timer
sudo nano /etc/systemd/system/income-clarity-backup.timer

# Timer content:
[Unit]
Description=Daily Income Clarity Backup
Requires=income-clarity-backup.service

[Timer]
OnCalendar=daily
RandomizedDelaySec=300
Persistent=true

[Install]
WantedBy=timers.target

# Enable and start
sudo systemctl enable income-clarity-backup.timer
sudo systemctl start income-clarity-backup.timer
```

### Backup Monitoring Script
```bash
#!/bin/bash
# Check backup freshness and alert if needed

BACKUP_DIR="/path/to/data/backups"
LATEST_BACKUP="$BACKUP_DIR/latest.db"
MAX_AGE=86400  # 24 hours in seconds

if [ -f "$LATEST_BACKUP" ]; then
    BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
    
    if [ $BACKUP_AGE -gt $MAX_AGE ]; then
        echo "WARNING: Latest backup is $((BACKUP_AGE/3600)) hours old"
        # Add notification logic (email, Slack, etc.)
    else
        echo "Backup is current ($(($BACKUP_AGE/3600)) hours old)"
    fi
else
    echo "ERROR: No backup file found!"
fi
```

---

## 🚨 Disaster Recovery

### Recovery Scenarios

#### Scenario 1: Corrupted Database
1. Stop the application
2. Identify latest good backup
3. Restore from backup: `npm run backup:restore latest`
4. Verify data integrity
5. Restart application

#### Scenario 2: Accidental Data Loss
1. **Don't panic** - stop the application immediately
2. Create emergency backup of current state (may contain some data)
3. Identify backup from before data loss
4. Restore: `npm run backup:restore backup_YYYY-MM-DD_HH-MM-SS.db`
5. Verify restored data
6. Resume operations

#### Scenario 3: Server Failure
1. Set up new server environment
2. Install application dependencies
3. Copy backup files from off-site storage
4. Restore latest backup: `npm run backup:restore latest`
5. Configure environment variables
6. Test application functionality

### Recovery Best Practices
- **Regular testing** of restore procedures
- **Off-site backup storage** (cloud, separate server)
- **Documentation** of recovery procedures
- **Multiple backup retention** (daily, weekly, monthly)
- **Monitoring** of backup freshness and integrity

---

## 🔍 Troubleshooting

### Common Issues

#### "Source database not found"
```
❌ Source database not found: prisma/income_clarity.db
💡 Make sure you run "npx prisma db push" first
```
**Solution**: Initialize database with `npx prisma db push`

#### "Backup file not found"
```
❌ Backup file not found: data/backups/backup_file.db
```
**Solutions**:
- Check filename spelling: `npm run backup:list`
- Verify backup directory exists
- Check file permissions

#### "All requests failed" during testing
```
❌ All requests failed
```
**Solutions**:
- Check database file permissions
- Verify disk space availability
- Test with smaller backup files
- Check SQLite installation

#### Restore fails with "Prisma generate warning"
```
⚠️ Prisma generate warning: ...
```
**Solutions**:
- Run manually: `npx prisma generate`
- Check Prisma schema compatibility
- Verify Node.js and npm versions

### Diagnostic Commands

#### Check Database Health
```bash
# Test database connection
node -e "
const Database = require('better-sqlite3');
const db = Database('prisma/income_clarity.db');
console.log('Tables:', db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\"').all());
db.close();
"
```

#### Verify Backup Integrity
```bash
# Test backup file
node -e "
const Database = require('better-sqlite3');
const db = Database('data/backups/latest.db', {readonly: true});
console.log('Users:', db.prepare('SELECT COUNT(*) as count FROM users').get());
db.close();
"
```

#### Check File Permissions
```bash
# Check database permissions
ls -la prisma/income_clarity.db

# Check backup directory permissions
ls -la data/backups/
```

---

## 📈 Performance Considerations

### Backup Performance
- **Small database** (0.26 MB): Backup completes in <1 second
- **File copy operation**: Native filesystem speed
- **No downtime** required for backup creation
- **Minimal CPU impact** during backup process

### Restore Performance
- **Fast restore**: Complete in <5 seconds
- **Database replacement**: Single file copy operation
- **Prisma regeneration**: 2-3 seconds additional time
- **Application restart**: Required after restore

### Storage Efficiency
- **Retention policy**: 30 days prevents unlimited growth
- **Average backup size**: 0.21-0.26 MB per backup
- **Monthly storage**: ~8 MB for daily backups
- **Compression**: SQLite files are already optimized

---

## ✅ Verification Checklist

### Before Production Deployment
- [ ] Backup system tested and functional
- [ ] Restore procedure verified in test environment
- [ ] Automated backup schedule configured
- [ ] Off-site backup storage implemented
- [ ] Monitoring and alerting set up
- [ ] Recovery procedures documented
- [ ] Team trained on backup/restore operations

### Regular Health Checks
- [ ] Backup creation functioning (weekly)
- [ ] Backup file integrity verified (weekly)
- [ ] Restore procedure tested (monthly)
- [ ] Disk space monitored (weekly)
- [ ] Backup age monitored (daily)
- [ ] Off-site backups current (weekly)

---

## 📞 Support and Resources

### Documentation Files
- **Main Guide**: `docs/guides/BACKUP_RESTORE_GUIDE.md` (this file)
- **Scripts**: `scripts/backup-database.js`, `scripts/test-backup-restore.js`
- **Configuration**: `package.json` (backup scripts)

### Log Files
- **Backup logs**: Console output from backup operations
- **System logs**: Check systemd journal if using systemd timer
- **Error logs**: Application logs contain backup/restore errors

### Contact Information
- **System Administrator**: Configure monitoring alerts
- **Development Team**: For script modifications or enhancements
- **Database Administrator**: For complex recovery scenarios

---

**Last Updated**: August 10, 2025  
**System Status**: ✅ FULLY OPERATIONAL  
**Next Review**: September 10, 2025