# PRODUCTION DEPLOYMENT GUIDE
*Step-by-step guide for deploying Income Clarity to production*
*Version: 1.0.0 | Date: 2025-01-12*

---

## 🚀 QUICK START DEPLOYMENT

### One-Command Deployment (Recommended)
```bash
# Run from income-clarity-app directory
./scripts/deploy-production.sh
```

This script will:
1. Run tests
2. Build production bundle
3. Run database migrations
4. Start PM2 process
5. Configure nginx

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### System Requirements
- [ ] Ubuntu 20.04+ or similar Linux distro
- [ ] Node.js 18.x or higher installed
- [ ] SQLite3 installed
- [ ] Nginx installed (for reverse proxy)
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Git installed
- [ ] 2GB+ RAM available
- [ ] 10GB+ disk space
- [ ] Port 3000 available internally
- [ ] Port 80/443 available externally

### Required Files
- [ ] `.env.production` configured
- [ ] SSL certificates (for HTTPS)
- [ ] Database backup created
- [ ] Current code committed to git

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools
sudo apt install -y build-essential sqlite3

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Clone Repository
```bash
# Create app directory
sudo mkdir -p /var/www/income-clarity
sudo chown $USER:$USER /var/www/income-clarity

# Clone repository
cd /var/www
git clone [your-repo-url] income-clarity
cd income-clarity/income-clarity-app
```

### Step 3: Configure Environment
```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required `.env.production` values:**
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=file:./prisma/income_clarity.db

# Session
SESSION_SECRET=generate_random_64_char_string_here

# External APIs (optional)
POLYGON_API_KEY=your_polygon_api_key

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

### Step 4: Install Dependencies & Build
```bash
# Install production dependencies
npm ci --production=false

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build production bundle
npm run build

# Remove dev dependencies
npm prune --production
```

### Step 5: Setup PM2 Process Manager
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'income-clarity',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/income-clarity/income-clarity-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u $USER --hp /home/$USER
```

### Step 6: Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/income-clarity
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Proxy configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static file caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # API rate limiting
    location /api {
        proxy_pass http://localhost:3000;
        limit_req zone=api burst=20 nodelay;
    }
}
```

**Enable the site:**
```bash
# Create rate limiting zone (add to /etc/nginx/nginx.conf in http block)
sudo nano /etc/nginx/nginx.conf
# Add: limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Enable site
sudo ln -s /etc/nginx/sites-available/income-clarity /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 7: Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Configure Firewall
```bash
# Install UFW if not present
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
```

### Step 9: Setup Database Backups
```bash
# Create backup script
cat > /home/$USER/backup-income-clarity.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/income-clarity"
DB_FILE="/var/www/income-clarity/income-clarity-app/prisma/income_clarity.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_FILE ".backup $BACKUP_DIR/income_clarity_$DATE.db"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "Backup completed: income_clarity_$DATE.db"
EOF

# Make executable
chmod +x /home/$USER/backup-income-clarity.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup-income-clarity.sh") | crontab -
```

### Step 10: Setup Monitoring
```bash
# Create health check script
cat > /home/$USER/health-check.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ $response -ne 200 ]; then
    echo "Health check failed with status $response"
    pm2 restart income-clarity
fi
EOF

# Make executable
chmod +x /home/$USER/health-check.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/$USER/health-check.sh") | crontab -
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. Check Application Status
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs income-clarity --lines 50

# Check Nginx status
sudo systemctl status nginx
```

### 2. Test Application
```bash
# Test local connection
curl http://localhost:3000

# Test external connection
curl https://yourdomain.com

# Test API endpoint
curl https://yourdomain.com/api/health
```

### 3. Verify Database
```bash
# Check database file
ls -la /var/www/income-clarity/income-clarity-app/prisma/income_clarity.db

# Test database connection
cd /var/www/income-clarity/income-clarity-app
npx prisma studio
```

---

## 🚨 TROUBLESHOOTING

### Application Won't Start
```bash
# Check logs
pm2 logs income-clarity --err

# Common fixes:
npm rebuild
npx prisma generate
pm2 restart income-clarity
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check port
netstat -tlnp | grep 3000

# Restart services
pm2 restart income-clarity
sudo systemctl restart nginx
```

### Database Errors
```bash
# Reset database (WARNING: Loses data)
rm prisma/income_clarity.db
npx prisma db push

# Restore from backup
sqlite3 prisma/income_clarity.db ".restore /var/backups/income-clarity/latest.db"
```

### High Memory Usage
```bash
# Check memory
pm2 monit

# Restart with memory limit
pm2 delete income-clarity
pm2 start ecosystem.config.js --max-memory-restart 1G
```

---

## 📊 PERFORMANCE TUNING

### Optimize Node.js
```bash
# Set Node options in ecosystem.config.js
env: {
  NODE_ENV: 'production',
  NODE_OPTIONS: '--max-old-space-size=1024'
}
```

### Enable Compression
```javascript
// In next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
}
```

### Configure Caching
```nginx
# In Nginx config
location /_next/static {
    proxy_pass http://localhost:3000;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔒 SECURITY HARDENING

### 1. Secure Headers
```nginx
# Add to Nginx config
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;
```

### 2. Rate Limiting
```nginx
# In /etc/nginx/nginx.conf
limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

### 3. Fail2Ban Setup
```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
```

---

## 🔄 UPDATE PROCEDURE

### Rolling Update (Zero Downtime)
```bash
# Pull latest code
cd /var/www/income-clarity/income-clarity-app
git pull origin main

# Install dependencies
npm ci

# Build new version
npm run build

# Graceful reload
pm2 reload income-clarity
```

### Full Update (Brief Downtime)
```bash
# Stop application
pm2 stop income-clarity

# Pull and build
git pull origin main
npm ci
npm run build
npx prisma db push

# Start application
pm2 start income-clarity
```

---

## 📈 MONITORING ENDPOINTS

### Health Check
```http
GET /api/health
Response: { status: "ok", timestamp: "..." }
```

### Metrics
```http
GET /api/metrics
Response: { 
  uptime: 12345,
  memory: { ... },
  requests: { ... }
}
```

---

## 🎯 FINAL CHECKLIST

- [ ] Application accessible via HTTPS
- [ ] Database connections working
- [ ] PM2 running and configured for restart
- [ ] Nginx properly proxying requests
- [ ] SSL certificates valid
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring active
- [ ] Logs being collected
- [ ] Error tracking configured

---

## 📞 SUPPORT

### Quick Commands
```bash
# View logs
pm2 logs income-clarity

# Restart app
pm2 restart income-clarity

# Check status
pm2 status

# Monitor resources
pm2 monit
```

### Log Locations
- Application logs: `/var/www/income-clarity/income-clarity-app/logs/`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `~/.pm2/logs/`

---

*Deployment Guide Version 1.0.0*
*Last Updated: 2025-01-12*