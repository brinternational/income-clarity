# Income Clarity - SSH Server Deployment Guide

Complete guide for deploying Income Clarity to a remote SSH server with automated setup, environment configuration, and production deployment.

## 🚀 Quick Start

### One-Command Deployment

```bash
# Make script executable
chmod +x scripts/ssh-deploy.sh

# Deploy with minimal configuration (will prompt for missing values)
./scripts/ssh-deploy.sh --host your-server.com --user ubuntu --domain your-domain.com

# Deploy with full configuration
./scripts/ssh-deploy.sh \
  --host your-server.com \
  --user ubuntu \
  --path /var/www/income-clarity \
  --method rsync \
  --domain your-domain.com
```

## 📋 Prerequisites

### Local Machine Requirements
- **Bash shell** (Git Bash on Windows, or WSL)
- **SSH access** to remote server
- **rsync** (for rsync method)
- **git** (for git method)
- **tar** (for tar method)

### Remote Server Requirements
- **Ubuntu 18.04+** or **Debian 10+** (script will install requirements)
- **SSH access** with sudo privileges
- **Public IP** or accessible hostname
- **Domain name** (optional, for SSL)
- **Open ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## 🔧 Deployment Methods

### Method 1: rsync (Recommended)
**Best for**: Updates, development deployments, maintaining sync

**Advantages**:
- Only transfers changed files (fast updates)
- Maintains file permissions and timestamps
- Can delete removed files with `--delete`
- Resume interrupted transfers

**Usage**:
```bash
./scripts/ssh-deploy.sh --method rsync --host server.com --user ubuntu
```

### Method 2: tar (Archive)
**Best for**: First-time deployments, clean installations

**Advantages**:
- Creates complete snapshot
- Single file transfer
- Works with any SSH server
- Good for backup purposes

**Usage**:
```bash
./scripts/ssh-deploy.sh --method tar --host server.com --user ubuntu
```

### Method 3: git (Repository)
**Best for**: Git-based deployments, CI/CD integration

**Advantages**:
- Version controlled deployments
- Easy rollbacks to previous versions
- Works with any git hosting (GitHub, GitLab)
- Clean deployment from repository

**Requirements**:
- Git repository with remote origin
- Remote server has git access to repository

**Usage**:
```bash
./scripts/ssh-deploy.sh --method git --host server.com --user ubuntu
```

## 📂 File Exclusions

The deployment automatically excludes these files/directories:

### Build Artifacts
- `node_modules/` (rebuilt on server)
- `.next/` (rebuilt on server)  
- `coverage/`
- `test-results/`
- `playwright-report/`

### Environment Files
- `.env.local`
- `.env.development`
- `.env.test`

### Development Files
- `*.log`
- `*.tmp`
- `test-*`
- `debug-*`
- `*-snippet-*.json`
- `*-batch-*.txt`

### System Files
- `.DS_Store`
- `Thumbs.db`
- `.vscode/`
- `.idea/`

### Testing & Debug
- `cypress/`
- `test-next/`
- `lighthouserc.js`
- `manual-*.js`

## 🌐 Server Architecture

After deployment, your server will have:

```
/var/www/income-clarity/          # Application code
├── app/                          # Next.js app directory
├── components/                   # React components
├── lib/                         # Core services
├── public/                      # Static assets
├── .env.production             # Environment variables ⚠️
├── ecosystem.config.js         # PM2 configuration
├── logs/                       # Application logs
│   ├── combined.log
│   ├── out.log
│   └── error.log
└── package.json                # Dependencies

/etc/nginx/sites-available/      # Nginx configuration
└── income-clarity              # Reverse proxy config

SSL Certificates (if domain provided):
/etc/letsencrypt/live/domain.com/
```

## ⚙️ Configuration Options

### Command Line Options

```bash
./scripts/ssh-deploy.sh [OPTIONS]

Required (or prompted):
  --host HOST        Remote server hostname/IP
  --user USER        Remote server username

Optional:
  --port PORT        SSH port (default: 22)
  --path PATH        Remote path (default: /var/www/income-clarity)
  --key PATH         SSH private key path
  --method METHOD    Deployment method: rsync|tar|git
  --domain DOMAIN    Domain name for SSL certificate
  --no-nginx         Skip Nginx reverse proxy setup
  --no-ssl           Skip SSL certificate setup

Help:
  --help, -h         Show help message
```

### Environment Variables

Set these to avoid interactive prompts:

```bash
export REMOTE_HOST=your-server.com
export REMOTE_USER=ubuntu
export REMOTE_PORT=22
export REMOTE_PATH=/var/www/income-clarity
export SSH_KEY_PATH=~/.ssh/id_rsa
export DEPLOYMENT_METHOD=rsync
export DOMAIN_NAME=your-domain.com
export NGINX_CONFIG=true
export SSL_SETUP=true

./scripts/ssh-deploy.sh
```

## 🔒 Security Configuration

### SSH Key Authentication (Recommended)

1. **Generate SSH key pair** (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. **Copy public key to server**:
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub user@server.com
   ```

3. **Use key with deployment**:
   ```bash
   ./scripts/ssh-deploy.sh --key ~/.ssh/id_rsa --host server.com --user ubuntu
   ```

### Firewall Setup

After deployment, secure your server:

```bash
# SSH to your server
ssh user@server.com

# Enable firewall
sudo ufw enable

# Allow essential services
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Check status
sudo ufw status
```

## 📝 Environment Variables Setup

### Critical Configuration Required

After deployment, you **must** configure production environment variables:

```bash
# SSH to your server
ssh user@server.com
cd /var/www/income-clarity

# Edit production environment
nano .env.production
```

### Required Variables

```env
# Application URL (your domain)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Supabase Configuration (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stock API (Polygon.io - get from polygon.io)
POLYGON_API_KEY=your_polygon_api_key_here
STOCK_API_PROVIDER=polygon

# Session Security (generate with: openssl rand -base64 64)
SESSION_SECRET=your_super_secure_random_64_character_string_here...
```

### Optional Variables

```env
# Error Tracking

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Caching (Redis/Upstash)
REDIS_URL=redis://your-redis-connection-string

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_PWA_FEATURES=true
ENABLE_ADVANCED_ANALYTICS=false
```

### Generate Secure Session Secret

```bash
# On your server, generate a secure session secret:
openssl rand -base64 64
```

## 🔄 Process Management with PM2

### PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs income-clarity

# Restart application
pm2 restart income-clarity

# Stop application
pm2 stop income-clarity

# Monitor resource usage
pm2 monit

# View detailed info
pm2 show income-clarity
```

### PM2 Configuration

The deployment creates `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'income-clarity',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/income-clarity',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/www/income-clarity/logs/combined.log',
    out_file: '/var/www/income-clarity/logs/out.log',
    error_file: '/var/www/income-clarity/logs/error.log',
    max_restarts: 5,
    restart_delay: 1000
  }]
};
```

## 🌐 Nginx Reverse Proxy

### Configuration Location
- **Config File**: `/etc/nginx/sites-available/income-clarity`
- **Enabled**: `/etc/nginx/sites-enabled/income-clarity`

### Key Features
- **Reverse Proxy**: Routes traffic to Node.js app on port 3000
- **Security Headers**: X-Frame-Options, CSP, XSS protection
- **Static Asset Caching**: Optimized caching for `_next/static/`
- **API Route Handling**: Proper headers for API endpoints
- **WebSocket Support**: Upgrade headers for real-time features

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔒 SSL Certificate (Let's Encrypt)

### Automatic Setup
If you provide a domain name, the script automatically:
1. Obtains SSL certificate via Certbot
2. Configures HTTPS redirect
3. Sets up auto-renewal

### Manual SSL Setup

```bash
# SSH to server
ssh user@server.com

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### SSL Certificate Renewal

Auto-renewal is set up via crontab:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Application Health Check

```bash
# Check application health endpoint
curl https://your-domain.com/api/health

# Expected response: {"status":"ok","timestamp":"..."}
```

### Log Monitoring

```bash
# View application logs
pm2 logs income-clarity

# View specific log files
tail -f /var/www/income-clarity/logs/combined.log
tail -f /var/www/income-clarity/logs/error.log

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Resource Monitoring

```bash
# CPU and memory usage
htop

# Disk usage
df -h

# PM2 resource monitor
pm2 monit
```

### Database Connection Test

```bash
# SSH to server and test Supabase connection
ssh user@server.com
cd /var/www/income-clarity

# Create test script
cat > test-db.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

# Run test
node test-db.js
rm test-db.js
```

## 🔄 Updates & Redeployment

### Update Deployed Application

```bash
# Method 1: Rsync (recommended for updates)
./scripts/ssh-deploy.sh --method rsync --host server.com --user ubuntu

# Method 2: Git-based update (if using git method)
ssh user@server.com "cd /var/www/income-clarity && git pull && npm ci --only=production && npm run build && pm2 restart income-clarity"

# Method 3: Full redeployment
./scripts/ssh-deploy.sh --method tar --host server.com --user ubuntu
```

### Rollback Strategy

```bash
# If using git method, rollback to previous commit
ssh user@server.com
cd /var/www/income-clarity
git log --oneline -5                    # See recent commits
git checkout <previous-commit-hash>     # Rollback
npm ci --only=production                # Reinstall dependencies
npm run build                          # Rebuild
pm2 restart income-clarity             # Restart app
```

### Zero-Downtime Updates

For production environments:

```bash
# 1. Deploy to staging directory
ssh user@server.com
sudo mkdir -p /var/www/income-clarity-staging

# 2. Use rsync to staging
./scripts/ssh-deploy.sh --path /var/www/income-clarity-staging --method rsync

# 3. Build and test staging
ssh user@server.com
cd /var/www/income-clarity-staging
npm run build
# Test application...

# 4. Atomic switch
sudo mv /var/www/income-clarity /var/www/income-clarity-backup
sudo mv /var/www/income-clarity-staging /var/www/income-clarity
pm2 restart income-clarity
```

## 🚨 Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Check SSH service
ssh -v user@server.com

# Test different port
ssh -p 2222 user@server.com

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

#### 2. Permission Denied
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/income-clarity

# Fix permissions
chmod -R 755 /var/www/income-clarity
```

#### 3. Application Won't Start
```bash
# Check PM2 logs
pm2 logs income-clarity

# Check environment variables
cd /var/www/income-clarity
cat .env.production

# Test manual start
npm start
```

#### 4. Build Fails
```bash
# Clear cache and rebuild
ssh user@server.com
cd /var/www/income-clarity
rm -rf .next node_modules
npm ci --only=production
npm run build
```

#### 5. Database Connection Issues
```bash
# Test Supabase connection
curl "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"

# Check RLS policies
# Login to Supabase dashboard and verify RLS settings
```

#### 6. SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test SSL configuration
curl -I https://your-domain.com
```

### Performance Issues

#### High Memory Usage
```bash
# Check PM2 memory usage
pm2 monit

# Restart application if needed
pm2 restart income-clarity

# Consider adding swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### Slow Response Times
```bash
# Check application logs
pm2 logs income-clarity

# Monitor API calls
tail -f /var/www/income-clarity/logs/combined.log | grep "API"

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

## 📋 Post-Deployment Checklist

### Immediate Tasks
- [ ] Configure production environment variables in `.env.production`
- [ ] Generate secure SESSION_SECRET
- [ ] Set up Supabase production database
- [ ] Configure Polygon.io API key
- [ ] Test application health endpoint
- [ ] Verify SSL certificate (if domain configured)
- [ ] Test authentication flow
- [ ] Verify stock price data loading

### Security Tasks  
- [ ] Configure firewall (UFW)
- [ ] Set up SSH key authentication
- [ ] Disable password authentication
- [ ] Configure automatic security updates
- [ ] Set up SSL certificate auto-renewal
- [ ] Review Nginx security headers

### Monitoring Setup
- [ ] Configure log rotation
- [ ] Configure backup strategy
- [ ] Set up uptime monitoring
- [ ] Test disaster recovery plan

### Performance Optimization
- [ ] Enable Nginx gzip compression
- [ ] Configure Redis caching (optional)
- [ ] Set up CDN (optional)
- [ ] Monitor Core Web Vitals
- [ ] Optimize images and assets

## 📞 Support Resources

### Documentation Links
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **PM2 Guide**: [pm2.keymetrics.io/docs](https://pm2.keymetrics.io/docs/)
- **Nginx Configuration**: [nginx.org/en/docs](http://nginx.org/en/docs/)
- **Let's Encrypt**: [letsencrypt.org/getting-started](https://letsencrypt.org/getting-started/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

### Example Commands Reference

```bash
# Complete deployment with all options
./scripts/ssh-deploy.sh \
  --host production-server.com \
  --user deploy \
  --port 22 \
  --path /var/www/income-clarity \
  --key ~/.ssh/production_key \
  --method rsync \
  --domain income-clarity.app

# Quick development deployment
./scripts/ssh-deploy.sh \
  --host dev-server.com \
  --user ubuntu \
  --method rsync \
  --no-ssl

# Git-based deployment with custom path
./scripts/ssh-deploy.sh \
  --host server.com \
  --user git-deploy \
  --path /opt/income-clarity \
  --method git \
  --domain staging.income-clarity.com
```

---

## 🎯 Success Criteria

### Deployment Successful When:
- [x] **SSH connection established**
- [x] **Application files transferred**
- [x] **Dependencies installed**
- [x] **Application built successfully**
- [x] **PM2 process running**
- [x] **Nginx reverse proxy configured**
- [x] **SSL certificate installed** (if domain provided)
- [x] **Health endpoint returns 200**
- [x] **Application accessible via web**

### Production Ready When:
- [ ] **Environment variables configured**
- [ ] **Database connection working**
- [ ] **Stock API integration functional**
- [ ] **Authentication flow working**
- [ ] **Performance meets targets** (<3s load time)
- [ ] **Security headers configured**
- [ ] **Monitoring set up**
- [ ] **Backup strategy implemented**

---

**🎉 Your Income Clarity application is now deployed and ready for production use!**

*Last updated: $(date)*