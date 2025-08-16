#!/bin/bash

# SIMPLE: Just start the app with real data, ignore all errors

echo "🚀 Starting Income Clarity (Real Data Mode)..."
echo ""

# Kill any existing server
pkill -f node 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Use existing build or create minimal one
if [ ! -d ".next" ]; then
    echo "Building app (this only happens once)..."
    npm run build 2>/dev/null || npx next build 2>/dev/null || true
fi

# Start with production mode (most stable)
NODE_ENV=production node custom-server.js

# If that fails, try the simpler approach
if [ $? -ne 0 ]; then
    echo "Trying alternative start..."
    npx next start --port 3000
fi