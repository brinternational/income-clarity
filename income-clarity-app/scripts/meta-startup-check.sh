#!/bin/bash

# META Startup Check - Runs automatically when Claude reloads
# This ensures META always has proper context after reload/compact

echo ""
echo "========================================="
echo "  🚀 META STARTUP SEQUENCE INITIATED"
echo "========================================="
echo ""

# Quick health check
echo "Running context health check..."
HEALTH_OUTPUT=$(./scripts/meta-context-health-check.sh 2>&1)
HEALTH_STATUS=$?

# Extract summary
echo "$HEALTH_OUTPUT" | grep -A 10 "HEALTH CHECK SUMMARY"

echo ""
echo "🧠 LOADING CRITICAL CONTEXT..."
echo "---------------------------------------------"

# Load and display key info
echo "📋 Current TODOs:"
grep -E "^\- \[ \]" /public/MasterV2/income-clarity/MASTER_TODO_FINAL.md 2>/dev/null | head -3
echo ""

echo "✅ Recent Completions:"
grep -E "^\- \[x\]" /public/MasterV2/income-clarity/MASTER_TODO_FINAL.md 2>/dev/null | tail -3
echo ""

echo "📁 Active Contexts:"
find . -name "CLAUDE.md" -type f -mtime -1 2>/dev/null | wc -l | xargs echo "  Updated in last 24h:"
echo ""

echo "🔄 Last Context Updates:"
find . -name "CLAUDE.md" -type f -mtime -1 -exec ls -lt {} \; 2>/dev/null | head -3 | awk '{print "  " $6 " " $7 " " $8 " - " $9}'
echo ""

# Check if app is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ App Status: RUNNING on port 3000"
else
    echo "⚠️  App Status: NOT RUNNING"
    echo "   To start: ./run-app.sh"
fi

echo ""
echo "========================================="
echo "  📊 STARTUP SUMMARY"
echo "========================================="

if [ $HEALTH_STATUS -eq 0 ]; then
    echo "✅ META ORCHESTRATOR READY!"
    echo "   - All systems operational"
    echo "   - Context loaded successfully"
    echo "   - Ready to process tasks"
else
    echo "⚠️  META ORCHESTRATOR READY WITH WARNINGS"
    echo "   - Some non-critical issues detected"
    echo "   - Check health report for details"
    echo "   - System functional"
fi

echo ""
echo "💡 Quick Commands:"
echo "   Health Check: ./scripts/meta-context-health-check.sh"
echo "   Check TODOs: grep '\\[ \\]' MASTER_TODO_FINAL.md"
echo "   Start App: ./run-app.sh"
echo "   Check Contexts: ./scripts/check-context-updates.sh"
echo "========================================="
echo ""

# Return health status
exit $HEALTH_STATUS