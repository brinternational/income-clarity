# Income Clarity Service Configuration

This directory contains everything needed to run the Income Clarity app as a Linux systemd service on port 3000.

## Quick Start

```bash
# Navigate to service configs
cd /public/MasterV2/income-clarity/income-clarity-app/service-configs

# Install the service
./service-manager.sh install

# Check status
./service-manager.sh status

# View health
./service-manager.sh health
```

## Files

- **`income-clarity.service`** - Systemd service configuration
- **`install-service.sh`** - Complete installation script
- **`service-manager.sh`** - Service management commands
- **`README.md`** - This documentation

## Service Management

Use the service manager for all operations:

```bash
# Service lifecycle
./service-manager.sh start      # Start service
./service-manager.sh stop       # Stop service
./service-manager.sh restart    # Restart service
./service-manager.sh status     # Check status

# Auto-start configuration
./service-manager.sh enable     # Enable auto-start on boot
./service-manager.sh disable    # Disable auto-start

# Monitoring
./service-manager.sh logs       # View live logs
./service-manager.sh health     # Check application health

# Maintenance
./service-manager.sh uninstall  # Remove service
```

## Service Features

### ✅ Production Ready
- Automatic restart on failure
- Resource limits (1GB memory, 65536 file descriptors)
- Security hardening (NoNewPrivileges, PrivateTmp)
- Health monitoring endpoint
- Structured logging to journald

### ✅ Port Management
- Kills existing processes on port 3000 before starting
- Ensures single instance on port 3000
- Health check validates port 3000 accessibility

### ✅ Environment Configuration
- Uses existing `.env.local` file
- Production-ready environment variables
- Proper NODE_ENV=production setting

## Installation Process

The installation script performs these steps:

1. **Verification** - Checks app directory and dependencies
2. **Build** - Builds the app for production (`npm run build`)
3. **Environment** - Validates `.env.local` configuration
4. **Health Check** - Creates/verifies health endpoint
5. **Service Installation** - Installs systemd service
6. **Activation** - Enables and starts the service
7. **Validation** - Tests service health

## Service Configuration Details

### System Service Location
- Service file: `/etc/systemd/system/income-clarity.service`
- Runs as user: `devuser`
- Working directory: `/public/MasterV2/income-clarity/income-clarity-app`

### Port & Network
- **Port**: 3000 (fixed)
- **Hostname**: 0.0.0.0 (accepts external connections)
- **Health endpoint**: `http://localhost:3000/api/health`

### Security Features
- No new privileges allowed
- Private temporary directories
- System directories protected
- Limited file system access

### Resource Limits
- Memory: 1GB maximum
- File descriptors: 65536
- Automatic restart after 10 seconds

## Health Monitoring

The service includes comprehensive health monitoring:

```bash
# Simple health check
curl http://localhost:3000/api/health

# Detailed health information
curl http://localhost:3000/api/health?details=true

# Prometheus metrics format
curl http://localhost:3000/api/health?format=prometheus
```

## Logs and Debugging

```bash
# View service logs
sudo journalctl -u income-clarity

# Follow live logs
sudo journalctl -u income-clarity -f

# Recent logs with timestamps
sudo journalctl -u income-clarity --since "1 hour ago"

# Using service manager
./service-manager.sh logs
```

## Troubleshooting

### Service won't start
```bash
# Check service status
sudo systemctl status income-clarity

# Check logs for errors
sudo journalctl -u income-clarity --since "5 minutes ago"

# Verify app builds successfully
cd /public/MasterV2/income-clarity/income-clarity-app
npm run build
```

### Port 3000 already in use
```bash
# Kill existing processes (handled automatically)
npm run port:kill

# Or manually check what's using port 3000
sudo netstat -tlnp | grep :3000
```

### Health check failing
```bash
# Test health endpoint directly
curl -v http://localhost:3000/api/health

# Check if service is listening
sudo netstat -tlnp | grep :3000

# Verify environment variables
sudo systemctl show income-clarity --property=Environment
```

## Manual Commands

If you prefer direct systemctl commands:

```bash
# Service control
sudo systemctl start income-clarity
sudo systemctl stop income-clarity
sudo systemctl restart income-clarity
sudo systemctl status income-clarity

# Enable/disable auto-start
sudo systemctl enable income-clarity
sudo systemctl disable income-clarity

# View logs
sudo journalctl -u income-clarity -f
```

## Updating the Application

To update the application after code changes:

```bash
# Rebuild and restart
cd /public/MasterV2/income-clarity/income-clarity-app
npm run build
./service-configs/service-manager.sh restart

# Verify health
./service-configs/service-manager.sh health
```

## Uninstalling

To completely remove the service:

```bash
./service-manager.sh uninstall
```

This will:
- Stop the running service
- Disable auto-start
- Remove the service file
- Clean up systemd configuration

---

**Your Income Clarity app will now run automatically as a system service on port 3000!**