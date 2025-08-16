#!/bin/bash

# Environment Switcher for Income Clarity
# Usage: ./scripts/switch-env.sh [local|lite|production]

ENV=${1:-local}
ENV_FILE=""

case $ENV in
  local)
    ENV_FILE=".env.local"
    echo "🏠 Switching to LOCAL development environment..."
    ;;
  lite)
    ENV_FILE=".env.lite-production"
    echo "🧪 Switching to LITE PRODUCTION environment (SQLite + Testing)..."
    ;;
  production)
    ENV_FILE=".env.production"
    echo "🚀 Switching to FULL PRODUCTION environment (Supabase + Live)..."
    ;;
  *)
    echo "❌ Unknown environment: $ENV"
    echo "Usage: $0 [local|lite|production]"
    exit 1
    ;;
esac

# Backup current .env if it exists
if [ -f .env ]; then
  cp .env .env.backup
  echo "📦 Backed up current .env to .env.backup"
fi

# Copy the selected environment file
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" .env
  echo "✅ Activated $ENV environment from $ENV_FILE"
  
  # Show key settings
  echo ""
  echo "📋 Configuration Summary:"
  grep -E "^NODE_ENV|^LOCAL_MODE|^DATABASE|^LITE_PRODUCTION" .env | head -5
  
  echo ""
  echo "🔄 Next steps:"
  echo "1. Restart the application: npm run dev:safe (local) or sudo systemctl restart income-clarity (server)"
  echo "2. Check logs for any issues"
else
  echo "❌ Environment file $ENV_FILE not found!"
  exit 1
fi