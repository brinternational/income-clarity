#!/bin/bash
# SESSION CHECKPOINT SCRIPT - Crash-proof todo tracking
# Run every 10 minutes or manually before risky operations

TIMESTAMP=$(date -Iseconds)
SESSION_DIR="/public/MasterV2/income-clarity"
CHECKPOINT_DIR="$SESSION_DIR/TODO_CHECKPOINTS"

# Create checkpoint directory if needed
mkdir -p "$CHECKPOINT_DIR"

# Get current git commit
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "no-git")

# Get server status
SERVER_STATUS=$(curl -s localhost:3000/api/health 2>/dev/null | jq -r .status 2>/dev/null || echo "unknown")

# Get current phase from strategic state
CURRENT_PHASE="Phase 1: Context Synchronization"

# Create session state file
cat > "$SESSION_DIR/SESSION_STATE.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "session_id": "session_$(date +%s)",
  "current_phase": "$CURRENT_PHASE",
  "active_component": "strategic-transition",
  "todos": {
    "in_progress": [
      {
        "id": "STRATEGIC-TRANSITION-001",
        "content": "Create Strategic Transition Framework - Preserve existing system context while implementing new design",
        "started": "$TIMESTAMP",
        "component": "global",
        "estimated_time": "2 hours"
      }
    ],
    "pending": [
      {
        "id": "CONTEXT-SYNC-001", 
        "content": "Sync all CLAUDE.md files with Strategic Design decisions to prevent agent confusion",
        "component": "global"
      },
      {
        "id": "TRANSITION-PLAN-001",
        "content": "Design phased transition plan that builds incrementally without breaking existing functionality", 
        "component": "global"
      }
    ],
    "completed": []
  },
  "context": {
    "last_command": "checkpoint-session.sh",
    "last_action": "Creating session persistence system",
    "git_commit": "$GIT_COMMIT",
    "server_status": "$SERVER_STATUS",
    "app_url": "https://incomeclarity.ddns.net"
  }
}
EOF

# Backup to timestamped file
cp "$SESSION_DIR/SESSION_STATE.json" "$CHECKPOINT_DIR/session_$(date +%s).json"

# Keep only last 10 checkpoints
ls -t "$CHECKPOINT_DIR/" | tail -n +11 | xargs -I {} rm "$CHECKPOINT_DIR/{}" 2>/dev/null

# Update master todo with checkpoint info
echo "" >> "$SESSION_DIR/MASTER_TODO_FINAL.md"
echo "<!-- Session checkpoint: $TIMESTAMP -->" >> "$SESSION_DIR/MASTER_TODO_FINAL.md"

echo "✅ Session checkpoint created: $TIMESTAMP"
echo "📁 Checkpoint saved to: $CHECKPOINT_DIR/"
echo "🔄 Session state: $SESSION_DIR/SESSION_STATE.json"
echo "📋 Active todos preserved for crash recovery"