# PORT_RULES.md - SINGLE SERVER ENFORCEMENT
*LOCAL PROJECT RULES: One server, port 3000 only*

---

## 🚨 CRITICAL: SINGLE SERVER RULE

### **THIS PROJECT RUNS ONE SERVER ONLY**
- **Port 3000** - No exceptions, no alternatives
- **Kill existing processes** before starting
- **Fail immediately** if port is busy after cleanup
- **No automatic port switching** to 3001, 3002, etc.

### **WHY THIS MATTERS**
- **Memory Leaks**: Multiple servers consume RAM exponentially
- **State Conflicts**: Multiple instances cause data inconsistency  
- **API Confusion**: Unclear which server is responding
- **Development Chaos**: Hard to debug with multiple servers

---

## 🔧 ENFORCEMENT SCRIPTS

### **Pre-Start Port Cleanup**
File: `scripts/kill-port-3000.ps1` (Auto-created)
```powershell
Write-Host "🚨 ENFORCING SINGLE SERVER RULE..." -ForegroundColor Red

# Find and kill all processes on port 3000
$processes = netstat -ano | findstr :3000
if ($processes) {
    Write-Host "❌ KILLING EXISTING PROCESSES" -ForegroundColor Red
    $processes | ForEach-Object {
        $fields = $_.Trim() -split '\s+'
        if ($fields.Length -ge 5) {
            $pid = $fields[4]
            taskkill /F /PID $pid 2>$null
        }
    }
    Start-Sleep 2
}

Write-Host "✅ PORT 3000 IS CLEAR" -ForegroundColor Green
```

### **Package.json Integration**
```json
{
  "scripts": {
    "predev": "powershell scripts/kill-port-3000.ps1",
    "dev": "next dev --port 3000",
    "dev:safe": "npm run predev && npm run dev",
    "start": "npm run predev && next start --port 3000"
  }
}
```

---

## 🛡️ USAGE RULES

### **ALWAYS USE THESE COMMANDS:**
```bash
npm run dev:safe     # Kills existing processes first
npm run predev       # Just the cleanup script
```

### **NEVER USE THESE:**
```bash
npm run dev          # (Now safe - has predev hook)
next dev             # Raw command bypasses cleanup
next dev -p 3001     # FORBIDDEN - wrong port
```

### **CHECK FOR VIOLATIONS:**
```bash
# Should return EMPTY if clean
netstat -ano | findstr :3000

# Should show no Next.js processes  
tasklist | findstr node.exe
```

---

## 🚨 EMERGENCY CLEANUP

### **If Multiple Servers Detected:**
```bash
# 1. Nuclear option - kill all Node.js
taskkill /F /IM node.exe

# 2. Wait for cleanup
timeout /t 3

# 3. Verify clean state
netstat -ano | findstr :3000

# 4. Start single instance
npm run dev:safe
```

### **If Port Won't Clear:**
```bash
# 1. Check what's using the port
netstat -ano | findstr :3000

# 2. Kill specific PID
taskkill /F /PID [PID_FROM_ABOVE]

# 3. If still stuck, restart terminal/IDE
# 4. Last resort: reboot system
```

---

## 📋 AGENT COMPLIANCE

### **ALL AGENTS MUST:**
- ✅ Check port status before starting server
- ✅ Use `npm run dev:safe` exclusively  
- ✅ Kill existing processes without asking
- ✅ Report port conflicts immediately
- ✅ Fail loudly if port can't be cleared

### **AGENTS MUST NEVER:**
- ❌ Start server on alternate ports
- ❌ Ignore port conflicts
- ❌ Run multiple servers "for convenience"
- ❌ Use raw `next dev` command
- ❌ Continue with busy ports

---

## 🎯 SUCCESS CRITERIA

### **Clean State Indicators:**
- `netstat -ano | findstr :3000` returns empty
- Only one Node.js process running
- Single browser tab on localhost:3000
- No port conflict errors in terminal

### **Violation Indicators:**
- Multiple "ready on" messages
- Port 3001/3002 in browser URL
- Multiple Node.js processes in Task Manager
- "Port in use" errors ignored

---

**REMEMBER: One server. Port 3000. Kill existing. No exceptions.**

*This file enforces the absolute rule: ONE development server only.*