# SSH Server Deployment Guide

## Problem: Next.js 15 TTY Detection Issue

Next.js 15 dev server immediately exits when run on SSH servers due to TTY detection issues. The server starts normally, shows "Ready", then exits with code 0.

### Symptoms
- Server starts, shows "Ready in X.Xs"
- Immediately exits with exit code 0
- No error messages
- Happens specifically on SSH/headless servers
- Works fine when run interactively

## Solutions Overview

We've implemented multiple solutions to handle this issue:

### 1. Server Wrapper (Recommended)
**File**: `server-wrapper.js`
**Best for**: Production deployments, automatic restarts, health monitoring

```bash
# Development mode
node server-wrapper.js

# Production mode (requires build first)
npm run build
node server-wrapper.js --production
```

**Features**:
- Automatic restart on crash (up to 5 attempts)
- Health checking every 30 seconds
- Proper logging and PID management
- Graceful shutdown handling
- Works with both dev and production modes

### 2. Package.json Scripts
**Best for**: Quick testing and development

```bash
# TTY-compatible development scripts
npm run dev:tty        # Node.js wrapper
npm run dev:ssh        # exec-based approach
npm run dev:force-tty  # Force TTY environment
npm run dev:production # Production-mode development

# Production scripts
npm run start:production  # Build + start
```

### 3. Development Server Script
**File**: `start-dev-server.sh`
**Best for**: Manual server management

```bash
./start-dev-server.sh start    # Start server
./start-dev-server.sh stop     # Stop server
./start-dev-server.sh restart  # Restart server
./start-dev-server.sh status   # Check status
./start-dev-server.sh logs     # View logs
```

**Features**:
- Multiple fallback methods (setsid, screen, nohup)
- PID file management
- Process cleanup
- Log file management

### 4. PM2 Configuration (If Available)
**File**: `ecosystem.dev.config.js`
**Best for**: Production environments with PM2 installed

```bash
# Install PM2 (if not available)
npm install -g pm2

# Development mode
pm2 start ecosystem.dev.config.js

# Production mode
npm run build
pm2 start ecosystem.config.js
```

## Quick Start Guide

### Option A: Simple Development (Recommended)
```bash
# Navigate to project directory
cd /public/MasterV2/income-clarity/income-clarity-app

# Use the server wrapper (stays running automatically)
node server-wrapper.js
```

### Option B: Production Mode
```bash
# Build the application
npm run build

# Start in production mode
node server-wrapper.js --production
```

### Option C: Manual Script Management
```bash
# Start using the management script
./start-dev-server.sh start

# Check if it's running
./start-dev-server.sh status

# View logs
./start-dev-server.sh logs
```

## Environment Variables

Set these for optimal SSH compatibility:

```bash
export NODE_ENV=development  # or production
export PORT=3000
export FORCE_COLOR=1
export NPM_CONFIG_COLOR=always
export TERM=xterm-256color
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Troubleshooting

### Server Exits Immediately
**Cause**: TTY detection issue
**Solution**: Use any of the wrapper solutions above

### Port Already in Use
```bash
# Kill existing processes
lsof -ti:3000 | xargs -r kill -9
# Or use the script
./start-dev-server.sh stop
```

### Server Not Responding to HTTP
1. Check if process is running: `./start-dev-server.sh status`
2. Check logs: `./start-dev-server.sh logs`
3. Verify port: `netstat -tlnp | grep :3000`
4. Test locally: `curl http://localhost:3000`

### Build Errors in Production Mode
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### Permission Issues
```bash
# Make scripts executable
chmod +x start-dev-server.sh
chmod +x dev-server-exec.sh
chmod +x server-wrapper.js
```

## File Structure

```
├── server-wrapper.js          # Robust server wrapper (RECOMMENDED)
├── start-dev-server.sh        # Management script with fallbacks
├── dev-server-tty.js          # TTY-aware wrapper
├── dev-server-exec.sh         # Exec-based script
├── ecosystem.dev.config.js    # PM2 development config
├── ecosystem.config.js        # PM2 production config
└── logs/
    ├── server-wrapper.log      # Wrapper logs
    ├── server.pid              # PID file
    └── dev-server.log          # Dev server logs
```

## Logging

All solutions provide comprehensive logging:

- **Wrapper logs**: `./logs/server-wrapper.log`
- **Dev server logs**: `./logs/dev-server.log`
- **Real-time logs**: `./start-dev-server.sh logs`

## SSH Session Management

### Using Screen (Recommended for Interactive Sessions)
```bash
# Start in screen session
screen -S income-clarity
node server-wrapper.js

# Detach: Ctrl+A, then D
# Reattach: screen -r income-clarity
```

### Using Nohup (Background Process)
```bash
# Start in background
nohup node server-wrapper.js > server.log 2>&1 &

# Check process
ps aux | grep server-wrapper
```

## Production Checklist

- [ ] Build application: `npm run build`
- [ ] Test server wrapper: `node server-wrapper.js --production`
- [ ] Verify HTTP responses: `curl http://localhost:3000`
- [ ] Set up process monitoring (PM2/systemd)
- [ ] Configure nginx proxy (if needed)
- [ ] Set up log rotation
- [ ] Configure firewall rules for port 3000

## Monitoring and Maintenance

### Check Server Status
```bash
# Using management script
./start-dev-server.sh status

# Manual check
curl -I http://localhost:3000
```

### View Logs
```bash
# Real-time logs
tail -f ./logs/server-wrapper.log

# Recent logs
tail -50 ./logs/server-wrapper.log
```

### Restart Server
```bash
# Using management script
./start-dev-server.sh restart

# Manual restart (wrapper handles automatically)
# Just wait for auto-restart or kill and restart wrapper
```

## Security Considerations

1. **Firewall**: Ensure port 3000 is properly configured
2. **Process Management**: Use non-root user for server processes
3. **Logs**: Regular log rotation to prevent disk space issues
4. **Environment**: Never expose sensitive environment variables

## Next.js 15 Specific Issues

### Known Problems
- TTY detection causes immediate exit on SSH
- Development server more sensitive to process management
- Background processes require special handling

### Workarounds Implemented
- Force TTY environment variables
- Process wrapping with restart capability
- stdin keep-alive mechanisms
- Proper signal handling

## Support and Debugging

### Enable Debug Mode
```bash
# Set debug environment
export DEBUG=next:*
node server-wrapper.js
```

### Common Log Messages
- `✅ Server ready on http://localhost:3000` - Server started successfully
- `📛 Server exited with code 0` - TTY issue, wrapper will restart
- `🔄 Restarting server` - Automatic restart in progress
- `❌ Max restart attempts reached` - Multiple failures, manual intervention needed

### Getting Help
1. Check logs in `./logs/` directory
2. Verify process status with management script
3. Test HTTP connectivity
4. Review environment variables
5. Check system resources (memory, disk space)

## Alternative Approaches

If the provided solutions don't work:

1. **Use Production Mode**: `npm run build && npm run start`
2. **Docker Container**: Containerize the application
3. **Reverse Proxy**: Use nginx to proxy to a local process
4. **Process Manager**: Use systemd, supervisor, or PM2
5. **Development Server**: Use alternative dev servers like Vite

## Updates and Maintenance

This guide addresses Next.js 15.4.6 specific issues. Future versions may resolve the TTY detection problem. Check for:

- Next.js updates that fix TTY issues
- New process management features
- Alternative server configurations

Last updated: August 2025