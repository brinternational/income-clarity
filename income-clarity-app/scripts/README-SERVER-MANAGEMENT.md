# Server Management Quick Reference

## 🚀 Quick Commands

### Essential Operations
```bash
# Check current status
./scripts/server-mgmt status

# Graceful restart (recommended)
./scripts/server-mgmt restart  

# Emergency recovery
./scripts/server-mgmt emergency
```

### Diagnostic Commands
```bash
# Service discovery
./scripts/server-mgmt discover

# System test
./scripts/server-mgmt test

# View logs
tail -f logs/server-management.log
```

## 🛡️ Safety Guarantees

### PROTECTED (Never Touched)
- **Claude Code CLI** (PID 8128) 
- **MCP Servers** (PIDs 8232, 8307, 8319)
- **SSH Daemon** (PID 1122, Port 22)
- **VSCode Server** (PIDs 16116-16175)

### MANAGED (Graceful Only)
- **Income Clarity Server** (PID 12136, Port 3000)

## 🔧 Troubleshooting

### Server Won't Start
```bash
./scripts/server-mgmt emergency
```

### Server Unresponsive
```bash
./scripts/server-mgmt restart
```

### Check System Health  
```bash
./scripts/server-mgmt status
```

### Port 3000 Conflicts
```bash
# System automatically handles port conflicts
./scripts/server-mgmt restart
```

## ⚡ How It Works

1. **Service Discovery**: Identifies all processes safely
2. **Process Categorization**: Protects Claude CLI, manages Income Clarity
3. **Graceful Shutdown**: SIGTERM → wait → SIGKILL sequence
4. **Health Validation**: Confirms restart success
5. **Emergency Recovery**: Automated port clearing and restart

## 🎯 Key Features

- **Zero Disconnections**: Claude Code CLI never affected
- **Intelligent Detection**: Automatic service categorization  
- **Graceful Operations**: Proper shutdown sequences
- **Health Monitoring**: Validates all operations
- **Emergency Recovery**: Handles all failure scenarios
- **Comprehensive Logging**: Full operation history

## 📱 Status Indicators

- **🟢 Protected Services**: 11 critical processes identified
- **🔵 Income Clarity**: Running on port 3000 
- **🟡 Port Protection**: SSH (22) and critical ports secured
- **⚪ Health Status**: Validated after every operation