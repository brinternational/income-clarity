# 🤖 Claude AI Autonomous Management - Quick Reference
*Instant access to all critical system commands - no passwords required*

## 🚨 Emergency Response Commands

### Nginx Issues
```bash
sudo nginx -t                    # Test config (instant)
sudo systemctl reload nginx      # Apply changes (instant)
sudo systemctl restart nginx     # Full restart (instant)
sudo systemctl status nginx      # Check status (instant)
```

### Port Conflicts
```bash
sudo lsof -i:3000               # Check port 3000 usage
sudo lsof -i:80                 # Check port 80 usage  
sudo lsof -i:443                # Check port 443 usage
sudo pkill -f node              # Kill all Node processes
sudo pkill -f next-server        # Kill Next.js processes
```

### Service Management
```bash
sudo systemctl restart income-clarity    # Restart app service
sudo systemctl status income-clarity     # Check app status
sudo systemctl daemon-reload            # Reload service configs
```

### Log Monitoring
```bash
sudo journalctl -u nginx -f             # Follow nginx logs
sudo journalctl -u income-clarity -f    # Follow app logs
sudo tail -f /var/log/nginx/error.log   # Nginx error logs
sudo tail -f /var/log/nginx/access.log  # Nginx access logs
```

### System Health
```bash
sudo ps aux | grep node                 # Show all Node processes
sudo df -h                              # Disk space usage
sudo netstat -tulpn | grep :3000        # Network connections
```

## 🎯 Common Autonomous Workflows

### 1. **Fix 502 Bad Gateway**
```bash
sudo lsof -i:3000                       # Check what's on port 3000
sudo systemctl restart income-clarity    # Restart app service
sudo nginx -t && sudo systemctl reload nginx  # Test & reload nginx
```

### 2. **Deploy Config Changes**
```bash
sudo nginx -t                           # Test new config
sudo systemctl reload nginx             # Apply changes
sudo journalctl -u nginx -n 10          # Check for errors
```

### 3. **Debug Startup Issues**
```bash
sudo systemctl status income-clarity    # Check service status
sudo journalctl -u income-clarity -n 20 # View recent logs
sudo lsof -i:3000                       # Check port availability
```

### 4. **Kill Stuck Processes**
```bash
sudo lsof -i:3000                       # Find process on port 3000
sudo pkill -f income-clarity            # Kill by process name
sudo systemctl restart income-clarity    # Restart service cleanly
```

## 🔥 Autonomous Capabilities

### ✅ **No Password Required For:**
- All nginx management (test, reload, restart, status)
- All Income Clarity service operations
- Port conflict debugging and resolution
- Log viewing and monitoring
- Process management and cleanup
- System health monitoring
- Certificate status checking

### ✅ **Real-Time Monitoring:**
- Live log streaming from nginx and application
- Port usage monitoring
- Process health checking
- Disk space monitoring
- Network connection status

### ✅ **Emergency Recovery:**
- Automatic stuck process cleanup
- Service restart without downtime
- Configuration rollback capabilities
- Port conflict resolution

## 🚨 **Emergency Contact Points**

### **Service Down:**
1. `sudo systemctl status income-clarity` - Check service
2. `sudo systemctl restart income-clarity` - Restart service  
3. `sudo journalctl -u income-clarity -f` - Monitor startup

### **502 Bad Gateway:**
1. `sudo lsof -i:3000` - Check backend
2. `sudo nginx -t` - Test nginx config
3. `sudo systemctl reload nginx` - Reload nginx

### **High CPU/Memory:**
1. `sudo ps aux | grep node` - Find heavy processes
2. `sudo pkill -f next-server` - Kill Next.js if needed
3. `sudo systemctl restart income-clarity` - Clean restart

## 🎯 **Setup Verification**

Test that all permissions work:
```bash
sudo nginx -t                    # Should work without password
sudo systemctl status nginx      # Should work without password  
sudo lsof -i:3000               # Should work without password
sudo journalctl -u nginx -n 5   # Should work without password
```

---

**🚀 Result: Claude AI can now maintain Income Clarity 24/7 autonomously!**

*No more manual intervention needed for common issues, deployments, or monitoring.*
