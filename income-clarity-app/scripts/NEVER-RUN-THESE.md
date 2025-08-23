# 🚫 NEVER RUN THESE COMMANDS - Claude Code CLI Protection

## ⛔ ABSOLUTE FORBIDDEN COMMANDS

### 🚨 THESE COMMANDS WILL DISCONNECT CLAUDE CODE CLI:

```bash
# ❌ NEVER - Kills ALL Node.js processes (including Claude Code CLI)
pkill -f node

# ❌ NEVER - Kills ALL Node.js processes  
killall node

# ❌ NEVER - Broad pattern matching kills Claude Code
pkill node

# ❌ NEVER - Force kills all Node processes
killall -9 node

# ❌ NEVER - Kills processes by port without validation
kill $(lsof -ti:22)  # Port 22 is SSH/Claude Code CLI

# ❌ NEVER - Broad process tree killing
pkill -f "node.*"

# ❌ NEVER - System-wide Node.js termination
sudo pkill node
sudo killall node

# ❌ NEVER - Process group killing
kill -TERM -1
kill -9 -1
```

## ⚠️ RISKY COMMANDS (Use with extreme caution):

```bash
# ⚠️ RISKY - Could kill wrong process if multiple custom-server.js exist
pkill -f custom-server.js

# ⚠️ RISKY - If another service uses port 3000
lsof -ti:3000 | xargs kill

# ⚠️ RISKY - Without proper validation
ps aux | grep node | kill

# ⚠️ RISKY - Docker commands that affect host
docker kill $(docker ps -q)
```

## ✅ SAFE ALTERNATIVES

### Use Our Safe Server Manager:

```bash
# ✅ SAFE - Uses PID-based targeting
./scripts/safe-server-manager.sh stop

# ✅ SAFE - Graceful restart with validation  
./scripts/safe-server-manager.sh restart

# ✅ SAFE - Health check before operations
./scripts/server-health-check.sh

# ✅ SAFE - Status without killing anything
./scripts/safe-server-manager.sh status
```

### Manual Safe Commands (if needed):

```bash
# ✅ SAFE - Target specific PID only
PID=$(cat .server-pid | cut -d: -f1)
if ps -p $PID | grep -q custom-server.js; then
  kill $PID
fi

# ✅ SAFE - Validate process before killing
PROCESS_CMD=$(ps -p $PID -o cmd --no-headers)
if [[ "$PROCESS_CMD" == *"custom-server.js"* ]]; then
  kill $PID
fi

# ✅ SAFE - Port-specific with validation
if lsof -ti:3000 | xargs ps -p | grep -q custom-server; then
  lsof -ti:3000 | xargs kill
fi
```

## 🛡️ PROTECTION MECHANISMS

### Our Safe System Prevents:

1. **PID Validation**: Only kills processes that match our exact signature
2. **Directory Validation**: Ensures operations happen in correct directory  
3. **Port Protection**: Never touches critical ports (22, 8080)
4. **Process Owner Check**: Only kills processes owned by current user
5. **Command Line Validation**: Verifies process command matches our server
6. **Graceful Shutdown**: Attempts SIGTERM before SIGKILL

### How It Works:

```bash
# PID file contains: PID:TIMESTAMP:COMMAND_HASH
# Example: 12345:1692712800:a1b2c3d4e5f6...

# Validation process:
1. Read PID from .server-pid file
2. Check if PID exists: kill -0 $PID
3. Validate command: ps -p $PID -o cmd
4. Validate directory: pwdx $PID
5. Validate owner: ps -p $PID -o user
6. Only then proceed with kill
```

## 🚨 EMERGENCY RECOVERY

### If You Accidentally Disconnect Claude Code CLI:

1. **Don't Panic**: Claude Code can reconnect
2. **Check SSH**: `ss -tlnp | grep :22`
3. **Restart SSH**: `sudo systemctl restart ssh` (if needed)
4. **Reconnect**: Follow Claude Code CLI reconnection procedure
5. **Verify**: Run health check to ensure system stability

### Recovery Commands:

```bash
# Check if Claude Code CLI connection is alive
ss -tlnp | grep :22

# Check SSH service status  
sudo systemctl status ssh

# Restart SSH service (last resort)
sudo systemctl restart ssh

# Validate Income Clarity server status
./scripts/safe-server-manager.sh status
```

## 📋 CHECKLIST BEFORE ANY SERVER OPERATION

- [ ] ✅ Using safe-server-manager.sh script?
- [ ] ✅ Ran health check first?
- [ ] ✅ Verified working directory?
- [ ] ✅ Confirmed PID file exists?
- [ ] ✅ Checked Claude Code CLI is safe (port 22 active)?
- [ ] ✅ Not using any forbidden commands?
- [ ] ✅ Have recovery plan ready?

## 🎯 REMEMBER

**The goal is to manage the Income Clarity server safely without ever risking the Claude Code CLI connection that enables our development workflow.**

### Key Principles:

1. **Specificity Over Speed**: Better to be slow and safe than fast and disconnected
2. **Validation Over Assumptions**: Always check what you're about to kill
3. **PID-based Over Pattern Matching**: Exact process identification only
4. **Graceful Over Forceful**: Try SIGTERM before SIGKILL
5. **Recovery Over Prevention**: Have a plan if things go wrong

---

**VIOLATION OF THESE RULES = IMMEDIATE WORKFLOW DISRUPTION**

Use the safe server management scripts. They exist to protect your development environment.