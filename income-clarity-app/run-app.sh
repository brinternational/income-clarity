#!/bin/bash

echo "Starting Income Clarity App..."
echo "================================"

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the app
NODE_ENV=production node custom-server.js