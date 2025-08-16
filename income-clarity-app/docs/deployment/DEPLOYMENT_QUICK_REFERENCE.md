# Income Clarity - SSH Deployment Quick Reference

## 🚀 One-Command Deployment

```bash
# Make scripts executable
chmod +x scripts/ssh-deploy.sh scripts/create-deployment-package.sh

# Full automated deployment
./scripts/ssh-deploy.sh --host your-server.com --user ubuntu --domain your-domain.com

# Quick development deployment  
./scripts/ssh-deploy.sh --host dev-server.com --user ubuntu --no-ssl
```

## 📦 Deployment Methods

### Method 1: Automated SSH Deployment (Recommended)
```bash
# rsync method (fast updates)
./scripts/ssh-deploy.sh --method rsync --host server.com --user ubuntu

# tar method (complete package)  
./scripts/ssh-deploy.sh --method tar --host server.com --user ubuntu

# git method (repository-based)
./scripts/ssh-deploy.sh --method git --host server.com --user ubuntu
```

### Method 2: Manual Package Deployment
```bash
# Create deployment package
./scripts/create-deployment-package.sh

# Transfer to server
scp /tmp/income-clarity-*.tar.gz user@server:/tmp/

# Extract and deploy (on server)
cd /var/www && sudo tar -xzf /tmp/income-clarity-*.tar.gz
```

### Method 3: Simple rsync (Minimal)
```bash
# Direct rsync without automation
rsync -avz --delete --exclude-from=scripts/exclude.txt ./ user@server:/var/www/income-clarity/
```

## ⚙️ Command Options

### SSH Deploy Script Options
```bash
--host HOST        # Remote server hostname/IP
--user USER        # Remote server username  
--port PORT        # SSH port (default: 22)
--path PATH        # Remote path (default: /var/www/income-clarity)
--key PATH         # SSH private key path
--method METHOD    # rsync|tar|git (default: rsync)
--domain DOMAIN    # Domain name for SSL
--no-nginx         # Skip Nginx configuration
--no-ssl           # Skip SSL certificate setup
```

### Package Creator Options
```bash
--name NAME        # Package name
--output PATH      # Output archive path
```

## 🔧 Server Requirements

### System Requirements
- **OS**: Ubuntu 18.04+ or Debian 10+
- **Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **Access**: SSH with sudo privileges

### Auto-Installed by Script
- **Node.js** 18.17.0+
- **PM2** process manager
- **Nginx** reverse proxy
- **Certbot** for SSL certificates

## 📝 Essential Environment Variables

```env
# Application (Required)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...

# Stock API (Required)
POLYGON_API_KEY=your_polygon_key
STOCK_API_PROVIDER=polygon

# Security (Required)
SESSION_SECRET=$(openssl rand -base64 64)
```

## 🔄 Common Post-Deployment Commands

### Application Management
```bash
# Check status
pm2 status

# View logs  
pm2 logs income-clarity

# Restart app
pm2 restart income-clarity

# Monitor resources
pm2 monit
```

### Server Management  
```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check SSL certificate
sudo certbot certificates

# View application logs
tail -f /var/www/income-clarity/logs/combined.log
```

### Health Checks
```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Test homepage
curl -I https://your-domain.com/

# Check PM2 status
ssh user@server "pm2 status"
```

## 🔒 Security Checklist

### SSH Security
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096

# Copy to server
ssh-copy-id user@server

# Use key for deployment
./scripts/ssh-deploy.sh --key ~/.ssh/id_rsa
```

### Firewall Setup
```bash
# Enable firewall (on server)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http  
sudo ufw allow https
```

## 🚨 Troubleshooting Quick Fixes

### Application Issues
```bash
# App won't start
pm2 logs income-clarity
cd /var/www/income-clarity && npm run build
pm2 restart income-clarity

# Environment issues
nano /var/www/income-clarity/.env.production
pm2 restart income-clarity

# Permission issues  
sudo chown -R $USER:$USER /var/www/income-clarity
```

### Build Issues
```bash
# Clear and rebuild
cd /var/www/income-clarity
rm -rf .next node_modules
npm ci --only=production
npm run build
pm2 restart income-clarity
```

### SSL Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate
curl -I https://your-domain.com
```

## 📊 File Sizes & Transfer Times

| Method | Size | Transfer Time* | Update Time* |
|--------|------|----------------|--------------|
| rsync (initial) | ~50MB | 2-5 min | N/A |
| rsync (updates) | ~1-5MB | 10-30 sec | 10-30 sec |
| tar package | ~30MB | 1-3 min | 2-4 min |
| git clone | ~40MB | 1-4 min | 30 sec - 2 min |

*Times vary by connection speed and server location

## 📂 Excluded Files/Directories

```
node_modules/     # Rebuilt on server
.next/           # Rebuilt on server  
.git/            # Version control (git method only)
coverage/        # Test coverage
test-results/    # Test output
*.log           # Log files
.env.local      # Local environment
test-*          # Test files
debug-*         # Debug files
.vscode/        # Editor configs
```

## 🎯 Success Indicators

### Deployment Success
- ✅ SSH connection established
- ✅ Files transferred successfully
- ✅ Dependencies installed
- ✅ Application built without errors
- ✅ PM2 process running
- ✅ Health endpoint returns 200

### Production Ready
- ✅ Environment variables configured
- ✅ Database connection working
- ✅ SSL certificate active
- ✅ Application accessible via domain
- ✅ PM2 auto-startup configured

## 📞 Quick Help Commands

```bash
# Show script help
./scripts/ssh-deploy.sh --help
./scripts/create-deployment-package.sh --help

# Test SSH connection
ssh -o ConnectTimeout=10 user@server "echo 'Connection OK'"

# Check Node.js version compatibility  
node --version  # Should be 18.17.0+

# Validate package.json
grep "income-clarity-app" package.json
```

---

## 📚 Full Documentation

- **Complete Guide**: `SSH_DEPLOYMENT_GUIDE.md`
- **Automated Script**: `scripts/ssh-deploy.sh`
- **Package Creator**: `scripts/create-deployment-package.sh`
- **Vercel Deployment**: `DEPLOYMENT_GUIDE.md`

---

*Quick reference for deploying Income Clarity to SSH servers*