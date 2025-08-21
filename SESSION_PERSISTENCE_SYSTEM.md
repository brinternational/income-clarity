# SESSION PERSISTENCE SYSTEM - CRASH-PROOF TODO TRACKING

## 🎯 PURPOSE
Ensure zero loss of progress when Claude Code crashes, disconnects, or restarts.

## 📋 PERSISTENT TODO ARCHITECTURE

### File Structure
```
/income-clarity/
├── MASTER_TODO_FINAL.md (existing - high-level)
├── STRATEGIC_TRANSITION_STATE.md (new - current phase)
├── SESSION_STATE.json (new - live session data)
├── TODO_CHECKPOINTS/ (new - timestamped backups)
└── [component-dirs]/
    ├── CLAUDE.md (existing - enhanced with todos)
    └── TODO_STATE.json (new - component progress)
```

### Session State Schema
```json
{
  "timestamp": "2025-08-20T12:34:56Z",
  "session_id": "session_1724155296",
  "current_phase": "Phase 1: Context Synchronization",
  "active_component": "components/super-cards/PerformanceHub",
  "todos": {
    "in_progress": [
      {
        "id": "STRATEGIC-TRANSITION-001",
        "content": "Create Strategic Transition Framework",
        "started": "2025-08-20T12:30:00Z",
        "component": "global",
        "estimated_time": "2 hours"
      }
    ],
    "pending": [],
    "completed": []
  },
  "context": {
    "last_command": "/sc:workflow",
    "last_file_edited": "components/super-cards/PerformanceHub.tsx",
    "git_commit": "abc123def456",
    "server_status": "running"
  }
}
```

## 🔄 AUTO-RECOVERY COMMANDS

### meta-init.py Enhancement
```python
def recover_session():
    if exists("SESSION_STATE.json"):
        state = load_json("SESSION_STATE.json")
        print(f"🔄 Recovering session from {state['timestamp']}")
        print(f"📋 Active todos: {len(state['todos']['in_progress'])}")
        print(f"🎯 Current phase: {state['current_phase']}")
        print(f"📁 Last component: {state['active_component']}")
        
        # Auto-restore TodoWrite state
        restore_todowrite_state(state['todos'])
        
        # Show next recommended action
        print(f"💡 Recommended: Continue with {state['todos']['in_progress'][0]['content']}")
```

### Checkpoint Script (./scripts/checkpoint-session.sh)
```bash
#!/bin/bash
# Run every 10 minutes via cron or manual trigger

TIMESTAMP=$(date -Iseconds)
SESSION_DIR="/public/MasterV2/income-clarity"

# Create checkpoint
cat > "$SESSION_DIR/SESSION_STATE.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "session_id": "session_$(date +%s)",
  "current_phase": "$(grep 'Current Phase:' STRATEGIC_TRANSITION_STATE.md | cut -d: -f2 | tr -d ' ')",
  "git_commit": "$(git rev-parse HEAD)",
  "server_status": "$(curl -s localhost:3000/api/health 2>/dev/null | jq -r .status || echo 'unknown')"
}
EOF

# Backup to timestamped file
cp "$SESSION_DIR/SESSION_STATE.json" "$SESSION_DIR/TODO_CHECKPOINTS/session_$TIMESTAMP.json"

# Keep only last 10 checkpoints
ls -t "$SESSION_DIR/TODO_CHECKPOINTS/" | tail -n +11 | xargs -r rm

echo "✅ Session checkpoint created: $TIMESTAMP"
```

## 🛡️ CRASH PROTECTION STRATEGIES

### Strategy 1: Auto-Commit on Todo Changes
```bash
# Git hook: pre-todo-change
git add MASTER_TODO_FINAL.md SESSION_STATE.json
git commit -m "Auto-save: Todo state checkpoint $(date)"
```

### Strategy 2: Multiple Persistence Layers
- **Layer 1**: TodoWrite (immediate, temporary)
- **Layer 2**: SESSION_STATE.json (session persistence)
- **Layer 3**: MASTER_TODO_FINAL.md (human-readable)
- **Layer 4**: Git commits (version control)
- **Layer 5**: TODO_CHECKPOINTS/ (backup history)

### Strategy 3: Health Monitoring
```bash
# Monitor script - detect crashes
while true; do
  if ! pgrep -f "claude-code" > /dev/null; then
    echo "$(date): Claude Code crashed - creating emergency checkpoint" >> CRASH_LOG.txt
    ./scripts/checkpoint-session.sh
  fi
  sleep 30
done
```

## 🚀 IMPLEMENTATION CHECKLIST

- [ ] Create SESSION_STATE.json template
- [ ] Enhance meta-init.py with recovery function
- [ ] Create checkpoint-session.sh script
- [ ] Add TODO_CHECKPOINTS/ directory
- [ ] Update STRATEGIC_TRANSITION_STATE.md format
- [ ] Add component-level TODO_STATE.json files
- [ ] Create crash monitoring script
- [ ] Test recovery after simulated crash
- [ ] Document recovery procedures
- [ ] Train team on persistence system

## 🎯 USAGE PATTERNS

### Starting New Session
```bash
cd /public/MasterV2/income-clarity/income-clarity-app
python scripts/meta-init.py --recover
# Automatically loads last session state and todos
```

### During Work
```bash
# Manual checkpoint (when about to do risky work)
./scripts/checkpoint-session.sh

# TodoWrite automatically syncs to persistent files
# Component work updates local TODO_STATE.json
```

### After Crash
```bash
# Recovery is automatic on next meta-init.py run
python scripts/meta-init.py
# Shows exactly where you left off + recommended next action
```

## 📊 SUCCESS METRICS
- **Zero Progress Loss**: 100% todo recovery after crashes
- **Fast Recovery**: <30 seconds to restore full session context
- **Automatic Backups**: Checkpoints every 10 minutes
- **Version Control**: All state changes tracked in git
- **Human Readable**: MASTER_TODO_FINAL.md always current

---

**Status**: Ready for implementation - solves crash/disconnect todo loss permanently