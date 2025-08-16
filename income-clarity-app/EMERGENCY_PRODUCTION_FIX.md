# 🚨 EMERGENCY PRODUCTION FIX - 502 Bad Gateway

## Current Issue
Production is DOWN with 502 Bad Gateway because server.js was deleted.

## IMMEDIATE FIX - Run these commands on production server:

```bash
# 1. SSH into production server
ssh your-server

# 2. Navigate to app directory
cd /path/to/income-clarity-app

# 3. Create emergency server.js file
cat > server.js << 'EOF'
#!/usr/bin/env node

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Use production mode
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

console.log(`Starting in ${dev ? 'DEV' : 'PRODUCTION'} mode`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, hostname, () => {
    console.log(`Server ready on http://${hostname}:${port}`);
  });
});
EOF

# 4. Make it executable
chmod +x server.js

# 5. Set production environment
export NODE_ENV=production

# 6. Restart PM2
pm2 delete income-clarity
pm2 start server.js --name income-clarity --env production

# 7. Check it's running
pm2 status
pm2 logs income-clarity --lines 20
```

## Alternative: Use custom-server.js

If custom-server.js exists on production:

```bash
# Use the existing custom-server.js instead
pm2 delete income-clarity
NODE_ENV=production pm2 start custom-server.js --name income-clarity

# Or update PM2 ecosystem file
pm2 ecosystem
# Edit ecosystem.config.js to use custom-server.js
```

## Verification

After restart, check:
1. Visit https://incomeclarity.ddns.net - Should load (not 502)
2. Visit https://incomeclarity.ddns.net/auth/login - Should show login page
3. Check PM2 logs: `pm2 logs income-clarity`
4. Should see "Starting in PRODUCTION mode"

## Prevention

Never delete server files without:
1. Checking what production is using
2. Testing the replacement first
3. Having a rollback plan

---

**This will restore production immediately. The server.js file now properly respects NODE_ENV.**