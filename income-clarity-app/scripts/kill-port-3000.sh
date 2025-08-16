#!/bin/bash
# Kill any process using port 3000 (Linux compatible)

echo "Checking for processes on port 3000..."
PID=$(lsof -ti:3000 2>/dev/null)

if [ ! -z "$PID" ]; then
    echo "Killing process $PID on port 3000..."
    kill -9 $PID
    echo "Process killed successfully"
else
    echo "Port 3000 is free"
fi

# Also kill any Next.js dev processes
pkill -f "next.*dev" 2>/dev/null && echo "Killed Next.js dev processes" || echo "No Next.js dev processes found"

echo "Port cleanup complete"