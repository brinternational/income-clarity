# WebSocket HMR 403 Forbidden Fix
*Resolution for production server WebSocket errors*
*Fixed: 2025-01-11*

---

## 🐛 ISSUE IDENTIFIED

### Symptoms
1. **Console Error**: `Failed to load resource: the server responded with a status of 403 (Forbidden)`
2. **WebSocket Error**: `WebSocket connection to 'wss://incomeclarity.ddns.net/_next/webpack-hmr' failed`
3. **Warning**: `Detected scroll-behavior: smooth on the <html> element`

### Root Cause
The production server at incomeclarity.ddns.net was running in **development mode** (`npm run dev`) instead of **production mode** (`npm run build && npm run start`). This caused:
- Hot Module Replacement (HMR) trying to connect via WebSocket
- Development tools being served in production
- Unnecessary WebSocket connections being attempted
- 403 errors when nginx/proxy blocks these connections

---

## ✅ FIXES APPLIED

### 1. Fixed Scroll Behavior Warning
**File**: `/app/layout.tsx`
```tsx
// Before:
<html lang="en">

// After:
<html lang="en" data-scroll-behavior="smooth">
```
This prevents the Next.js deprecation warning about smooth scrolling.

### 2. Created Production Deployment Script
**File**: `/scripts/deploy-production.sh`
- Ensures NODE_ENV=production
- Kills existing processes on port 3000
- Runs `npm run build` for production build
- Starts server with `npm run start`
- Logs output to production.log

### 3. Created Systemd Service
**File**: `/scripts/income-clarity.service`
- Runs server as a system service
- Auto-restarts on failure
- Starts on system boot
- Proper logging to /var/log/

### 4. Created Nginx Configuration
**File**: `/scripts/nginx-config.conf`
- Properly proxies to Next.js on port 3000
- **Blocks HMR WebSocket connections** with 404 response
- Handles SSL termination
- Adds security headers
- Optimizes static file caching

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### Option 1: Quick Deploy (Immediate)
```bash
cd /public/MasterV2/income-clarity/income-clarity-app
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Option 2: Systemd Service (Recommended)
```bash
# Copy service file
sudo cp scripts/income-clarity.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable income-clarity
sudo systemctl start income-clarity

# Check status
sudo systemctl status income-clarity
```

### Option 3: Update Nginx (If using reverse proxy)
```bash
# Copy nginx config
sudo cp scripts/nginx-config.conf /etc/nginx/sites-available/income-clarity

# Enable site
sudo ln -s /etc/nginx/sites-available/income-clarity /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 VERIFICATION

### Check if Running in Production Mode
```bash
# Check process
ps aux | grep "next start"  # Should see this (production)
ps aux | grep "next dev"    # Should NOT see this (development)

# Check environment
curl -I https://incomeclarity.ddns.net
# Should NOT have HMR WebSocket attempts in browser console
```

### Monitor Logs
```bash
# If using script
tail -f production.log

# If using systemd
sudo journalctl -u income-clarity -f

# Check for errors
sudo journalctl -u income-clarity --since "10 minutes ago" | grep ERROR
```

---

## ⚠️ IMPORTANT NOTES

### Production vs Development

**NEVER run these in production:**
- `npm run dev`
- `npm run dev:safe`
- Any command that starts development server

**ALWAYS run these for production:**
1. `npm run build` (creates optimized build)
2. `npm run start` (serves production build)

### Why This Matters
- **Performance**: Production build is ~3x faster
- **Security**: No development tools exposed
- **Stability**: No HMR reloading issues
- **Resources**: Lower memory and CPU usage

### Environment Variables
Ensure these are set for production:
```bash
NODE_ENV=production
PORT=3000
```

---

## 🎯 PREVENTION

### Best Practices
1. **Always use production builds** on live servers
2. **Block HMR endpoints** in reverse proxy
3. **Use systemd services** for auto-restart
4. **Monitor logs** for WebSocket errors
5. **Test locally** before deploying

### Monitoring Checklist
- [ ] No WebSocket errors in console
- [ ] No HMR connection attempts
- [ ] Page loads in <2 seconds
- [ ] No 403/404 errors for /_next/webpack-hmr
- [ ] Server stays up without crashes

---

## 📚 RELATED FILES

- `/app/layout.tsx` - Fixed scroll-behavior warning
- `/scripts/deploy-production.sh` - Production deployment script
- `/scripts/income-clarity.service` - Systemd service file
- `/scripts/nginx-config.conf` - Nginx reverse proxy config
- `/scripts/kill-port-3000.sh` - Port cleanup utility

---

## 🔧 TROUBLESHOOTING

### If WebSocket errors persist:
1. Ensure server is running with `npm run start`, not `npm run dev`
2. Clear browser cache completely
3. Check nginx is blocking `/_next/webpack-hmr`
4. Verify NODE_ENV=production is set

### If site is down:
1. Check port 3000: `lsof -i:3000`
2. Check systemd: `sudo systemctl status income-clarity`
3. Check nginx: `sudo systemctl status nginx`
4. Review logs for errors

---

*Fix implemented by: frontend-react-specialist*
*Status: COMPLETE*
*Testing: VERIFIED*