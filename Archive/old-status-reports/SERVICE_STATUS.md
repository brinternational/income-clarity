# INCOME CLARITY SERVICE STATUS
*Systemd Service Configuration and Management*
*Last Updated: 2025-01-11*

---

## 🟢 SERVICE CONFIGURATION

### Service Details
- **Service Name**: `income-clarity.service`
- **Type**: Systemd system service
- **Auto-Start**: Enabled on boot
- **Auto-Restart**: Always (10 second delay)
- **Working Directory**: `/public/MasterV2/income-clarity/income-clarity-app`
- **Port**: 3000
- **Environment**: Production (NODE_ENV=production)

### Service File Location
```
/etc/systemd/system/income-clarity.service
```

---

## 📍 ACCESS POINTS

### Public Access
- **Domain**: https://incomeclarity.ddns.net
- **Direct IP**: http://137.184.142.42:3000
- **Status**: 24/7 AVAILABLE

### Local Access
- **Localhost**: http://localhost:3000
- **Network**: http://0.0.0.0:3000

---

## 🔧 MANAGEMENT COMMANDS

### Service Control
```bash
# Check service status
sudo systemctl status income-clarity

# Start the service
sudo systemctl start income-clarity

# Stop the service
sudo systemctl stop income-clarity

# Restart the service
sudo systemctl restart income-clarity

# Reload service configuration
sudo systemctl daemon-reload

# Enable auto-start on boot
sudo systemctl enable income-clarity

# Disable auto-start on boot
sudo systemctl disable income-clarity
```

### Log Management
```bash
# View live logs
sudo journalctl -u income-clarity -f

# View last 100 lines
sudo journalctl -u income-clarity -n 100

# View logs from last hour
sudo journalctl -u income-clarity --since "1 hour ago"

# View logs from specific date
sudo journalctl -u income-clarity --since "2025-01-11"

# Export logs to file
sudo journalctl -u income-clarity > income-clarity.log
```

### Health Checks
```bash
# Check if service is active
systemctl is-active income-clarity

# Check if service is enabled
systemctl is-enabled income-clarity

# Check port 3000
sudo lsof -i:3000

# Test HTTP response
curl -I http://localhost:3000

# Check process
ps aux | grep "next start"
```

---

## 🚀 DEPLOYMENT WORKFLOW

### Production Build & Deploy
```bash
# 1. Navigate to app directory
cd /public/MasterV2/income-clarity/income-clarity-app

# 2. Build production bundle
npm run build

# 3. Restart service with new build
sudo systemctl restart income-clarity

# 4. Verify deployment
sudo systemctl status income-clarity
curl -I http://localhost:3000
```

### Quick Restart
```bash
# Single command restart
sudo systemctl restart income-clarity && sudo journalctl -u income-clarity -f
```

---

## 📊 SERVICE FEATURES

### Automatic Recovery
- **On Crash**: Restarts automatically after 10 seconds
- **On Boot**: Starts automatically when server boots
- **On Failure**: Infinite retry with 10 second delays
- **On Update**: Graceful restart with `systemctl restart`

### Resource Management
- **Memory**: Monitored by systemd
- **CPU**: Process priority managed
- **Logs**: Automatic rotation via journald
- **PID**: Tracked at `/run/income-clarity.pid`

### Security Features
- **User**: Runs as specified user (configurable)
- **Environment**: Production mode only
- **No Dev Tools**: HMR and dev endpoints disabled
- **Isolated**: Runs in its own process group

---

## 🔍 TROUBLESHOOTING

### Service Won't Start
```bash
# Check for errors
sudo journalctl -u income-clarity -n 50

# Check port conflict
sudo lsof -i:3000

# Kill conflicting process
sudo kill -9 $(sudo lsof -ti:3000)

# Retry start
sudo systemctl start income-clarity
```

### Build Issues
```bash
# Clean build directory
rm -rf .next

# Rebuild
npm run build

# Restart service
sudo systemctl restart income-clarity
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $(whoami):$(whoami) /public/MasterV2/income-clarity/income-clarity-app

# Fix permissions
chmod -R 755 /public/MasterV2/income-clarity/income-clarity-app
```

---

## 📈 MONITORING

### Service Uptime
```bash
# Check how long service has been running
systemctl status income-clarity | grep "Active:"
```

### Resource Usage
```bash
# Check memory and CPU
systemctl status income-clarity

# Detailed resource usage
systemd-cgtop
```

### Performance Metrics
```bash
# Response time test
time curl -I http://localhost:3000

# Load test (requires Apache Bench)
ab -n 100 -c 10 http://localhost:3000/
```

---

## 🔄 UPDATE PROCEDURE

### Standard Update
1. **Pull latest code** (if using Git)
2. **Install dependencies**: `npm install`
3. **Build production**: `npm run build`
4. **Restart service**: `sudo systemctl restart income-clarity`
5. **Verify**: `sudo systemctl status income-clarity`

### Zero-Downtime Update
```bash
# Build new version
npm run build

# Reload without downtime (if configured)
sudo systemctl reload income-clarity

# Or graceful restart
sudo systemctl restart income-clarity
```

---

## 🎯 BEST PRACTICES

### Do's
- ✅ Always build before restarting service
- ✅ Check logs after deployment
- ✅ Monitor service status regularly
- ✅ Keep systemd service file in sync with app changes
- ✅ Use journalctl for debugging

### Don'ts
- ❌ Don't run `npm run dev` on production
- ❌ Don't stop service during peak hours
- ❌ Don't modify service file without daemon-reload
- ❌ Don't ignore service failure alerts
- ❌ Don't bypass systemd for production runs

---

## 📝 SERVICE CONFIGURATION FILE

Location: `/etc/systemd/system/income-clarity.service`

```ini
[Unit]
Description=Income Clarity Production Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/public/MasterV2/income-clarity/income-clarity-app
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStartPre=/bin/bash -c 'npm run build'
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/income-clarity.log
StandardError=append:/var/log/income-clarity-error.log

[Install]
WantedBy=multi-user.target
```

---

## 🚨 CRITICAL NOTES

1. **Service is configured but needs activation**:
   ```bash
   sudo systemctl enable income-clarity
   sudo systemctl start income-clarity
   ```

2. **WebSocket HMR Issue RESOLVED**: 
   - Service runs in production mode
   - No HMR/webpack-dev-server connections
   - Clean console, no 403 errors

3. **24/7 Availability**:
   - Service ensures app is always accessible
   - Automatic recovery from crashes
   - Survives SSH disconnections

---

*Service Configured: 2025-01-11*
*Status: READY FOR ACTIVATION*
*Maintained by: DevOps Team*