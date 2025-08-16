# 📚 LITE PRODUCTION OPERATIONS MANUAL
*Complete guide for running, maintaining, and troubleshooting Income Clarity Lite Production*

---

## 🚀 QUICK START GUIDE

### Prerequisites
- Node.js 18+ installed
- SSH access to server (137.184.142.42)
- 500MB free disk space
- Port 3000 available

### First-Time Setup
```bash
# 1. Clone or copy project to server
cd /public/MasterV2/income-clarity/income-clarity-app

# 2. Install dependencies
npm install

# 3. Initialize database
npx prisma db push
npx prisma generate

# 4. Set environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# 5. Build production version
npm run build

# 6. Start application
npm run start
```

### Daily Operations
```bash
# Start the application
npm run start

# Check application status
npm run status

# View logs
npm run logs

# Restart application
npm run restart
```

---

## ⚠️ CRITICAL: PORT MANAGEMENT

### NEVER DO THIS
```bash
❌ taskkill /F /IM node.exe    # KILLS ALL NODE PROCESSES SYSTEM-WIDE!
❌ killall node                 # Linux equivalent - also dangerous
```

### ALWAYS DO THIS
```bash
# Windows - Find and kill ONLY port 3000 process
netstat -ano | findstr :3000      # Note the PID
taskkill /PID [process_id] /F     # Kill ONLY that process

# Linux/Mac
lsof -i :3000                      # Find process
kill -9 [process_id]               # Kill specific process

# PowerShell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess
Stop-Process -Id [process_id] -Force
```

---

## 💾 DATABASE MANAGEMENT

### Database Location
```
/public/MasterV2/income-clarity/income-clarity-app/prisma/dev.db
```

### Daily Backup (Automated)
```bash
# Backup runs automatically at 2 AM via systemd timer
# Manual backup:
npm run backup

# Backups stored in:
/backups/income-clarity/
```

### Restore from Backup
```bash
# List available backups
ls -la /backups/income-clarity/

# Restore specific backup
npm run restore -- --file=/backups/income-clarity/backup-2025-01-31.db.enc

# Verify restore
npm run db:verify
```

### Database Maintenance
```bash
# Check database integrity
npm run db:check

# Optimize database (weekly)
npm run db:optimize

# Vacuum database (monthly)
npm run db:vacuum

# Check size
du -h prisma/dev.db
```

---

## 🔒 SECURITY OPERATIONS

### Security Configuration
```env
# .env.local security settings
ENCRYPTION_KEY=your-256-bit-key-here
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
BACKUP_PASSWORD=your-backup-password
```

### Security Monitoring
```bash
# Check security status
curl http://localhost:3000/api/security/status

# Run security tests
npm run security:test

# View security logs
tail -f logs/security.log

# Check for vulnerabilities
npm audit
```

### Certificate Management (if using HTTPS)
```bash
# Generate self-signed cert for testing
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Install Let's Encrypt for production
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 PERFORMANCE MONITORING

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
npm run db:health

# Memory usage
npm run monitor:memory

# Performance metrics
npm run monitor:perf
```

### Performance Optimization
```bash
# Clear cache
npm run cache:clear

# Rebuild indexes
npm run db:reindex

# Analyze slow queries
npm run db:analyze

# Check bundle size
npm run analyze
```

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Kill blocking process (use PID, not node.exe!)
taskkill /PID [process_id] /F

# Check for errors
npm run dev
# Look for error messages

# Reset and rebuild
rm -rf .next node_modules
npm install
npm run build
npm run start
```

#### 2. Database Errors
```bash
# Reset database (CAUTION: Data loss!)
rm prisma/dev.db
npx prisma db push

# Restore from backup
npm run restore

# Fix migrations
npx prisma migrate reset
```

#### 3. Performance Issues
```bash
# Check memory usage
npm run monitor:memory

# Clear caches
npm run cache:clear
redis-cli FLUSHALL  # If using Redis

# Optimize database
npm run db:optimize

# Check for memory leaks
npm run test:memory
```

#### 4. Authentication Issues
```bash
# Clear sessions
npm run sessions:clear

# Regenerate secrets
npm run generate:secrets

# Reset user passwords
npm run user:reset-password
```

#### 5. Data Integrity Issues
```bash
# Verify calculations
npm run test:calculations

# Check database integrity
npm run db:check

# Validate all data
npm run validate:all
```

---

## 🚀 DEPLOYMENT PROCEDURES

### Production Deployment Checklist
```bash
# 1. Pre-deployment
□ Backup current database
□ Test on staging environment
□ Check all tests pass
□ Review security settings

# 2. Deployment
□ SSH to server: ssh user@137.184.142.42
□ Navigate to app: cd /public/MasterV2/income-clarity/income-clarity-app
□ Pull latest code: git pull
□ Install dependencies: npm ci
□ Build production: npm run build
□ Run migrations: npx prisma migrate deploy
□ Start application: npm run start:prod

# 3. Post-deployment
□ Verify application health
□ Check all features working
□ Monitor error logs
□ Test critical paths
```

### Rollback Procedure
```bash
# If deployment fails:
1. Stop application: npm run stop
2. Restore database: npm run restore
3. Revert code: git checkout [previous-commit]
4. Rebuild: npm run build
5. Restart: npm run start
```

---

## 📅 MAINTENANCE SCHEDULE

### Daily Tasks
- Check application health
- Review error logs
- Verify backups completed

### Weekly Tasks
- Database optimization
- Security updates check
- Performance review
- Clear old logs

### Monthly Tasks
- Database vacuum
- Full security audit
- Update dependencies
- Archive old backups

### Quarterly Tasks
- Disaster recovery test
- Performance benchmarking
- Security penetration test
- Documentation review

---

## 🛠️ UTILITY SCRIPTS

### Package.json Scripts
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "start:dev": "next dev",
    "build": "next build",
    "backup": "node scripts/backup.js",
    "restore": "node scripts/restore.js",
    "db:check": "node scripts/db-check.js",
    "db:optimize": "node scripts/db-optimize.js",
    "security:test": "node scripts/security-test.js",
    "monitor:perf": "node scripts/perf-monitor.js",
    "test:week4": "jest --config=jest.week4.config.js",
    "deploy": "node scripts/deploy.js"
  }
}
```

### Custom Scripts Location
```
/scripts/
  ├── backup.js           # Automated backup
  ├── restore.js          # Database restore
  ├── db-check.js         # Database integrity
  ├── db-optimize.js      # Performance optimization
  ├── security-test.js    # Security validation
  ├── perf-monitor.js     # Performance monitoring
  └── deploy.js           # Deployment automation
```

---

## 📞 SUPPORT & RESOURCES

### Log Locations
```
/logs/
  ├── application.log    # Main app logs
  ├── error.log          # Error logs
  ├── security.log       # Security events
  ├── access.log         # Access logs
  └── performance.log    # Performance metrics
```

### Configuration Files
```
/.env.local            # Environment variables
/prisma/schema.prisma  # Database schema
/next.config.js        # Next.js configuration
/package.json          # Dependencies
/vercel.json          # Deployment config
```

### Emergency Procedures
```bash
# Complete system restart
npm run emergency:restart

# Data recovery
npm run emergency:recover

# Security lockdown
npm run emergency:lockdown

# Contact for critical issues
# Check application logs first
# Document error messages and steps to reproduce
```

---

## 🎯 PRODUCTION READINESS CHECKLIST

### Pre-Launch
- [ ] All tests passing (npm run test:all)
- [ ] Security hardening complete
- [ ] Backups configured and tested
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Database optimized
- [ ] Monitoring configured

### Go-Live
- [ ] Deploy to production server
- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Test backup/restore
- [ ] Document any issues

### Post-Launch
- [ ] Daily health checks
- [ ] Weekly performance review
- [ ] Monthly security audit
- [ ] Quarterly disaster recovery test

---

## 📝 NOTES

### Important Reminders
1. **NEVER** use `taskkill /F /IM node.exe` - kills ALL Node processes
2. **ALWAYS** backup before major changes
3. **TEST** restore procedures regularly
4. **MONITOR** security logs daily
5. **UPDATE** dependencies monthly

### Version Information
- Application Version: 1.0.0 (Lite Production)
- Node.js: 18+
- Next.js: 14
- Database: SQLite with Prisma
- Last Updated: January 31, 2025

---

*This operations manual is critical for maintaining the Income Clarity Lite Production system. Keep it updated with any operational changes or lessons learned.*