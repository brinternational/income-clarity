# ONE SERVER DEPLOYMENT GUIDE
*Income Clarity Simplified Architecture*
*Created: 2025-08-17*

## 🎯 PHILOSOPHY: SIMPLICITY FIRST

**Income Clarity uses ONE SERVER for everything**
- Live site: https://incomeclarity.ddns.net
- Single source of truth (no dev/staging confusion)
- Perfect for solo developer, pre-launch phase
- Changes to code = immediate changes to live site

## 🏗️ ARCHITECTURE OVERVIEW

```
Internet
    ↓
Nginx (SSL + Proxy)
    ↓
PM2 → Node.js (localhost:3000)
    ↓
SQLite Database
```

### Components
- **Domain**: incomeclarity.ddns.net (dynamic DNS)
- **SSL**: Handled by Nginx
- **Process Manager**: PM2 (auto-restart, logs, monitoring)
- **Application**: Next.js production build
- **Database**: SQLite (simple, reliable)
- **Port**: 3000 (internal only, proxied via Nginx)

## 🚀 DEPLOYMENT WORKFLOW

### 1. Make Changes
```bash
# Edit code files
vim components/super-cards/PerformanceHub.tsx
```

### 2. Test Locally (Optional)
```bash
# Quick verification
npm run type-check
npm run build  # Verify build succeeds
```

### 3. Deploy Changes
```bash
# Single command deployment
pm2 restart income-clarity
```

That's it! Changes are live in ~5-10 seconds.

## 🛠️ PM2 COMMANDS

### Basic Operations
```bash
# Restart the app (most common)
pm2 restart income-clarity

# Check status
pm2 status

# View logs (real-time)
pm2 logs income-clarity

# View logs (last 100 lines)
pm2 logs income-clarity --lines 100

# Stop the app
pm2 stop income-clarity

# Start the app
pm2 start income-clarity

# Restart with fresh env vars
pm2 restart income-clarity --update-env
```

### Monitoring
```bash
# Real-time monitoring
pm2 monit

# Memory/CPU usage
pm2 show income-clarity

# Log file locations
pm2 logs income-clarity --nostream
```

## 🔧 NGINX CONFIGURATION

### Location
```
/etc/nginx/sites-available/income-clarity
/etc/nginx/sites-enabled/income-clarity (symlink)
```

### Basic Config Structure
```nginx
server {
    listen 443 ssl;
    server_name incomeclarity.ddns.net;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 SYSTEM MONITORING

### Health Checks
```bash
# Check app is running
curl https://incomeclarity.ddns.net/api/health

# Check PM2 status
pm2 status

# Check disk space
df -h

# Check memory usage
free -h

# Check Node.js process
ps aux | grep node
```

### Log Locations
```bash
# PM2 logs
~/.pm2/logs/

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# System logs
journalctl -u nginx
```

## 🚨 ROLLBACK PROCEDURE

### If Deployment Breaks
```bash
# 1. Check logs first
pm2 logs income-clarity --lines 50

# 2. Quick rollback (if you have backup)
pm2 restart income-clarity

# 3. If still broken, restore from git
git checkout HEAD~1  # Go back one commit
pm2 restart income-clarity

# 4. Fix issue, then redeploy
git checkout main
# Make fixes
pm2 restart income-clarity
```

### Backup Strategy
```bash
# Database backup (run before major changes)
cp prisma/income_clarity.db prisma/income_clarity.db.backup

# Code backup (automatic via git)
git add . && git commit -m "Backup before changes"
```

## 🎯 WHY ONE SERVER?

### Advantages
- **Simplicity**: No staging/prod confusion
- **Speed**: Instant deployments
- **Cost**: Single server costs
- **Debugging**: All logs in one place
- **Solo Developer**: Perfect for one person

### When to Add Staging
Consider adding dev/staging servers when:
- Multiple developers join
- Customer base grows (>100 users)
- Revenue justifies infrastructure cost
- Need for zero-downtime deployments

## 🔐 ENVIRONMENT VARIABLES

### Location
```bash
# PM2 ecosystem file
ecosystem.config.js

# Or .env file
/path/to/app/.env.production
```

### Critical Variables
```bash
NODE_ENV=production
DATABASE_URL=file:./prisma/income_clarity.db
YODLEE_API_URL=https://sandbox.api.yodlee.com/ysl
SESSION_SECRET=your-secret-here
```

## 📝 COMMON TASKS

### Update Dependencies
```bash
npm update
pm2 restart income-clarity
```

### Database Migrations
```bash
npx prisma db push
pm2 restart income-clarity
```

### SSL Certificate Renewal
```bash
# Usually automatic with Let's Encrypt
sudo certbot renew
sudo systemctl reload nginx
```

### Port Conflicts
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9
pm2 restart income-clarity
```

## 🚀 FUTURE EXPANSION

### When to Add Staging
- Customer base > 100 users
- Multiple developers
- Revenue > $1000/month

### Migration Path
1. Set up staging server
2. Update deployment scripts
3. Test staging workflow
4. Implement CI/CD pipeline
5. Blue/green deployments

### Database Migration
1. Export SQLite data
2. Set up PostgreSQL
3. Import data
4. Update connection string
5. Test thoroughly

---

**REMEMBER**: This ONE SERVER approach is intentional and optimal for current needs. Simplicity is a feature, not a limitation.

**Quick Deploy**: `pm2 restart income-clarity` → Live in 5 seconds! 🚀