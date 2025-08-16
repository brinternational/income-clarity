# Production Issues Troubleshooting Guide

**For Income Clarity Lite Production Environment**

## 🔍 Common Issues & Solutions

### **Issue 1: Cross-Origin Blocking Errors**

**Symptoms:**
```
Access to fetch at 'https://incomeclarity.ddns.net/api/...' from origin 'https://incomeclarity.ddns.net' has been blocked by CORS policy
```

**Root Cause:** Next.js development mode cross-origin protection

**Solution:**
```javascript
// In next.config.mjs, ensure allowedDevOrigins includes:
allowedDevOrigins: [
  'https://incomeclarity.ddns.net',
  'https://incomeclarity.ddns.net:*',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]
```

**Verification:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://incomeclarity.ddns.net/
# Should return: 200
```

---

### **Issue 2: Font File 403 Errors**

**Symptoms:**
```
GET https://incomeclarity.ddns.net/_next/static/fonts/... 403 (Forbidden)
```

**Root Cause:** nginx not properly handling Next.js font routes

**Solution:**
```nginx
# In nginx configuration, ensure font handling:
location /_next/static {
    proxy_pass http://127.0.0.1:3000/_next/static;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location /__nextjs_font {
    proxy_pass http://127.0.0.1:3000/__nextjs_font;
    add_header Access-Control-Allow-Origin *;
}
```

**Apply Fix:**
```bash
sudo nginx -t      # Test configuration
sudo systemctl reload nginx
```

---

### **Issue 3: Server Hanging on Requests**

**Symptoms:**
- Server starts successfully
- Port 3000 shows as listening
- HTTP requests timeout or hang indefinitely

**Root Cause:** Middleware loops or blocking operations

**Solutions:**

**A. Check for Port Conflicts:**
```bash
ss -tulpn | grep :3000
# Should show only one process

# If multiple processes:
pkill -f "next-server"
npm run start
```

**B. Verify Environment:**
```bash
grep -E "NODE_ENV|LITE_PRODUCTION" .env*
# Should show: NODE_ENV=production, LITE_PRODUCTION_MODE=true
```

**C. Test Middleware:**
```bash
# Test simple API endpoint:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health --max-time 5

# If hanging, check middleware.ts for:
# - Infinite loops
# - Blocking database calls
# - Missing return statements
```

---

### **Issue 4: Build Failures**

**Symptoms:**
```
npm run build fails with Prisma or database errors
```

**Root Cause:** Database access during build time

**Solution:**
```bash
# 1. Clean build environment
rm -rf .next node_modules/.cache

# 2. Generate Prisma client
npx prisma generate

# 3. Use fix:build script
npm run fix:build
```

**Verify Prisma Singleton:**
```typescript
// Ensure all API routes use:
import { prisma } from '@/lib/db';
// NOT: import { PrismaClient } from '@prisma/client';
```

---

### **Issue 5: SSL Certificate Problems**

**Symptoms:**
- HTTPS not working
- Certificate warnings in browser

**Check Certificate Status:**
```bash
sudo certbot certificates
# Should show valid cert for incomeclarity.ddns.net

# Test SSL:
curl -I https://incomeclarity.ddns.net/
# Should return HTTP/1.1 200 OK
```

**Renewal (if needed):**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

### **Issue 6: Database Connection Errors**

**Symptoms:**
```
PrismaClientInitializationError: Can't reach database server
```

**For SQLite (Lite Production):**
```bash
# Check database file exists:
ls -la prisma/income_clarity.db

# Check permissions:
chmod 644 prisma/income_clarity.db

# Regenerate if missing:
npx prisma db push
```

---

## 🚀 Quick Diagnostic Commands

### **Health Check Script**
```bash
#!/bin/bash
echo "🔍 Income Clarity Health Check"
echo "================================"

# 1. Check server process
if pgrep -f "next-server" > /dev/null; then
    echo "✅ Next.js server running"
else
    echo "❌ Next.js server not running"
fi

# 2. Check port availability
if ss -tulpn | grep -q ":3000"; then
    echo "✅ Port 3000 listening"
else
    echo "❌ Port 3000 not listening"
fi

# 3. Check site response
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://incomeclarity.ddns.net/ --max-time 10)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Site responding (HTTP $HTTP_CODE)"
else
    echo "❌ Site not responding (HTTP $HTTP_CODE)"
fi

# 4. Check API endpoints
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://incomeclarity.ddns.net/api/health --max-time 5)
if [ "$API_CODE" = "200" ]; then
    echo "✅ API responding (HTTP $API_CODE)"
else
    echo "❌ API not responding (HTTP $API_CODE)"
fi

# 5. Check database
if [ -f "prisma/income_clarity.db" ]; then
    echo "✅ Database file exists"
else
    echo "❌ Database file missing"
fi

# 6. Check SSL certificate
if curl -s -I https://incomeclarity.ddns.net/ | grep -q "200 OK"; then
    echo "✅ SSL certificate valid"
else
    echo "❌ SSL certificate issues"
fi

echo "================================"
echo "Health check complete"
```

### **Emergency Recovery**
```bash
#!/bin/bash
echo "🚨 Emergency Recovery - Income Clarity"

# 1. Kill any stuck processes
pkill -f "next-server"
pkill -f "next start"

# 2. Clean build artifacts
rm -rf .next node_modules/.cache

# 3. Rebuild from scratch
npm run fix:build

# 4. Start production server
npm run start &

echo "🔄 Recovery process initiated"
echo "Check site in 30 seconds: https://incomeclarity.ddns.net"
```

## 📞 Support Commands

### **View Logs**
```bash
# Next.js logs (from current session)
# Visible in terminal where npm run start was executed

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -u nginx -f
```

### **Process Management**
```bash
# Find Next.js processes
ps aux | grep next

# Check port usage
ss -tulpn | grep :3000

# Check nginx status
sudo systemctl status nginx
```

### **Configuration Verification**
```bash
# Test nginx config
sudo nginx -t

# Check Next.js config
cat next.config.mjs | grep -A5 allowedDevOrigins

# Verify environment
env | grep -E "NODE_ENV|LITE_PRODUCTION|DATABASE"
```

---

## 🎯 Prevention Checklist

**Before Making Changes:**
- [ ] Backup current working configuration
- [ ] Test changes in development first
- [ ] Document what you're changing
- [ ] Have rollback plan ready

**After Making Changes:**
- [ ] Test site accessibility
- [ ] Verify API endpoints
- [ ] Check browser console for errors
- [ ] Monitor logs for errors
- [ ] Update documentation

**Regular Maintenance:**
- [ ] Check disk space weekly
- [ ] Monitor SSL certificate expiry
- [ ] Review nginx logs monthly
- [ ] Update dependencies quarterly

---

**🔧 Remember:** Most production issues can be resolved by restarting the Next.js server and ensuring port 3000 is clean. Always check the basics first!