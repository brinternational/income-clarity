# Emergency Recovery Procedures

## Overview
This document provides comprehensive recovery procedures after the incident of 465+ file deletions on August 21, 2025. These procedures are designed to handle catastrophic failures and restore the Income Clarity application to a working state.

## Incident Background
- **Date**: August 21, 2025
- **Incident**: 465+ files were accidentally deleted during system operations
- **Recovery**: Successfully restored using Git rollback to commit `6eb1a14`
- **Lessons Learned**: Multiple safeguard layers now implemented to prevent recurrence

## Quick Recovery Commands

### 🚨 IMMEDIATE ACTIONS (First 5 Minutes)

1. **Stop All Operations**
   ```bash
   # Kill the server immediately
   pkill -f custom-server.js
   
   # Stop all background processes
   pkill -f file-change-monitor
   pkill -f automated-backup-system
   ```

2. **Assess Damage**
   ```bash
   cd /public/MasterV2/income-clarity/income-clarity-app
   
   # Check if critical files exist
   ls -la custom-server.js package.json next.config.mjs
   
   # Count remaining files
   find . -type f -not -path "*/node_modules/*" | wc -l
   ```

3. **Check Available Backups**
   ```bash
   # List recent backups
   ls -lah data/backups/emergency/
   ls -lah data/backups/hourly/
   ls -lah data/backups/daily/
   ```

## Recovery Strategies

### Strategy 1: Git-Based Recovery (Preferred)

#### Step 1: Verify Git Repository Integrity
```bash
cd /public/MasterV2/income-clarity
git status
git log --oneline -10
```

#### Step 2: Find Last Known Good Commit
```bash
# Check recent commits
git log --oneline --since="1 week ago"

# Show files in specific commit
git show --name-only <commit-hash>

# Compare with current state
git diff HEAD --name-status
```

#### Step 3: Perform Git Recovery
```bash
# For complete restoration to last known good state
git reset --hard <commit-hash>

# For selective file recovery
git checkout <commit-hash> -- path/to/specific/file

# Verify restoration
git status
```

### Strategy 2: Backup-Based Recovery

#### Step 1: Select Appropriate Backup
```bash
cd /public/MasterV2/income-clarity/income-clarity-app

# List available backups with details
./scripts/safeguards/automated-backup-system.sh list

# Check backup manifests
cat data/backups/emergency/backup_emergency_*.manifest | head -20
```

#### Step 2: Restore from Backup
```bash
# Using the automated backup system
./scripts/safeguards/automated-backup-system.sh restore /path/to/backup.tar.gz

# Manual restoration (if needed)
cd /public/MasterV2/income-clarity/income-clarity-app
tar -xzf /path/to/backup.tar.gz
```

#### Step 3: Verify Restoration
```bash
# Check critical files
ls -la custom-server.js package.json next.config.mjs

# Check application structure
tree -L 2 app/
tree -L 2 components/
tree -L 2 lib/services/
```

### Strategy 3: Hybrid Recovery (Git + Backup)

Use this when git repository is intact but application files are missing:

```bash
# 1. Restore git state
cd /public/MasterV2/income-clarity
git reset --hard HEAD

# 2. Restore missing application data from backup
cd income-clarity-app
tar -xzf data/backups/latest-backup.tar.gz --exclude='.git'

# 3. Verify consistency
git status
```

## Post-Recovery Verification

### 1. Critical File Check
```bash
#!/bin/bash
CRITICAL_FILES=(
    "custom-server.js"
    "package.json"
    "next.config.mjs"
    "app/api/health/route.ts"
    "components/super-cards/IncomeIntelligenceHub.tsx"
    "lib/services/super-cards-database.service.ts"
)

echo "Checking critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING!"
    fi
done
```

### 2. Database Integrity Check
```bash
# Check SQLite database
sqlite3 prisma/dev.db ".tables"
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User;"
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Portfolio;"
```

### 3. Application Health Check
```bash
# Install dependencies if needed
npm install

# Run type checking
npm run type-check

# Test critical APIs
node scripts/test-health-check.js
```

### 4. Server Startup Test
```bash
# Start server in test mode
NODE_ENV=production node custom-server.js &
SERVER_PID=$!

# Wait for startup
sleep 10

# Test health endpoint
curl -f http://localhost:3000/api/health || echo "Health check failed"

# Stop test server
kill $SERVER_PID
```

## Advanced Recovery Scenarios

### Scenario 1: Complete File System Loss

If the entire application directory is lost:

```bash
# 1. Clone from GitHub (if available)
cd /public/MasterV2/income-clarity
git clone https://github.com/brinternational/income-clarity.git temp-recovery
cp -r temp-recovery/* ./
rm -rf temp-recovery

# 2. Restore data from backups
cd income-clarity-app
tar -xzf /path/to/latest/backup.tar.gz data/
tar -xzf /path/to/latest/backup.tar.gz prisma/dev.db

# 3. Reinstall dependencies
npm install
```

### Scenario 2: Corrupted Git Repository

If the git repository is corrupted:

```bash
# 1. Backup current state
cp -r /public/MasterV2/income-clarity /tmp/income-clarity-backup

# 2. Re-initialize git from GitHub
cd /public/MasterV2
rm -rf income-clarity
git clone https://github.com/brinternational/income-clarity.git

# 3. Restore application data
cd income-clarity/income-clarity-app
tar -xzf /tmp/income-clarity-backup/income-clarity-app/data/backups/latest.tar.gz
```

### Scenario 3: Partial File Loss

For selective file recovery:

```bash
# Identify missing files
./scripts/safeguards/change-validation-gates.sh health

# Restore specific files from git
git checkout HEAD -- path/to/missing/file

# Or restore from backup
tar -xzf backup.tar.gz path/to/missing/file
```

## Safeguard System Recovery

After main recovery, ensure all safeguards are operational:

### 1. Git Hooks
```bash
cd /public/MasterV2/income-clarity
ls -la .git/hooks/pre-commit .git/hooks/pre-push
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

### 2. Backup System
```bash
cd /public/MasterV2/income-clarity/income-clarity-app
./scripts/safeguards/automated-backup-system.sh health
./scripts/safeguards/automated-backup-system.sh daily
```

### 3. File Monitor
```bash
./scripts/safeguards/file-change-monitor.sh restart
./scripts/safeguards/file-change-monitor.sh status
```

### 4. Validation Gates
```bash
./scripts/safeguards/change-validation-gates.sh health
```

## Production Server Recovery

### 1. Stop Production Server
```bash
# If using PM2
pm2 stop income-clarity

# If using systemd
sudo systemctl stop income-clarity

# If running directly
pkill -f custom-server.js
```

### 2. Perform Recovery
Follow the appropriate recovery strategy above.

### 3. Restart Production Server
```bash
# Verify everything is ready
./scripts/safeguards/change-validation-gates.sh health

# Start server
NODE_ENV=production node custom-server.js

# Verify startup
curl -f https://incomeclarity.ddns.net/api/health
```

## Prevention Checklist

After recovery, verify these safeguards are in place:

- [ ] Git pre-commit hook active (blocks mass deletions)
- [ ] Git pre-push hook active (blocks dangerous pushes)
- [ ] Automated backup system running (hourly/daily backups)
- [ ] File change monitor active (real-time protection)
- [ ] Change validation gates operational
- [ ] Regular backup cleanup configured
- [ ] Emergency contact procedures documented

## Testing Recovery Procedures

### Simulate File Loss (SAFE TEST)
```bash
# Create test directory with dummy files
mkdir -p /tmp/recovery-test
cd /tmp/recovery-test
for i in {1..100}; do echo "test file $i" > "file$i.txt"; done

# Test backup creation
tar -czf test-backup.tar.gz *.txt

# Simulate deletion
rm *.txt

# Test restoration
tar -xzf test-backup.tar.gz

# Verify restoration
ls *.txt | wc -l  # Should be 100
```

### Test Git Recovery (SAFE TEST)
```bash
# In a test branch
git checkout -b recovery-test

# Make test commits
echo "test change" >> test-file.txt
git add test-file.txt
git commit -m "Test commit for recovery"

# Simulate reset
git reset --hard HEAD~1

# Verify recovery capability
git log --oneline
```

## Emergency Contacts

- **Development Team**: Internal escalation
- **System Administrator**: Server access and permissions
- **Backup Administrator**: External backup verification
- **GitHub Support**: Repository recovery assistance

## Recovery Time Objectives

- **Critical System Recovery**: 15 minutes
- **Complete Application Recovery**: 30 minutes
- **Full Data Integrity Verification**: 60 minutes
- **Production Service Restoration**: 90 minutes

## Post-Incident Actions

1. **Document the incident**: What happened, when, and why
2. **Update safeguards**: Identify and close any protection gaps
3. **Test recovery procedures**: Verify all procedures work as expected
4. **Update team training**: Ensure all team members know recovery procedures
5. **Review backup strategy**: Adjust backup frequency and retention as needed

---

**Last Updated**: August 21, 2025
**Next Review**: September 21, 2025
**Document Owner**: Systems Architecture Team