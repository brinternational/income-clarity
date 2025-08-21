# 🚨 CRITICAL PORT PROTECTION RULE - READ FIRST

## ⛔ ABSOLUTE MANDATE - NEVER TOUCH THESE PORTS:
- **PORT 3000**: Income Clarity production server - NEVER KILL
- **PORT 22**: SSH connection to Claude Code CLI - NEVER KILL  
- **PORT 8080**: Any other critical services - NEVER KILL

## 🚫 FORBIDDEN COMMANDS:
- `pkill -f node` (kills Claude Code CLI connection)
- `killall node` (kills everything)
- `npm run dev` with port changes
- Any command that kills ports other than 3000

## ✅ SAFE COMMANDS ONLY:
- `pkill -f custom-server.js` (targets specific server only)
- `lsof -ti:3000 | xargs kill` (port 3000 only)
- Standard npm install/build without server restarts

**VIOLATION = IMMEDIATE TASK FAILURE**

---

# Environment Validator Service

## 📋 Purpose
Performs comprehensive startup and runtime environment validation to ensure application reliability. Validates critical configuration, API connectivity, and system health.

## 🔍 Validation Checks
- **POLYGON_API_KEY**: Market data API configuration (optional - warning if missing)
- **DATABASE_URL**: Database connection (required - fail if missing)
- **SESSION_SECRET**: Authentication security (required - fail if missing)
- **NODE_ENV**: Runtime environment mode
- **NEXT_PUBLIC_APP_URL**: Application URL configuration
- **LITE_PRODUCTION_MODE**: Production mode settings

## 🔧 Key Methods
- `validateEnvironment()` - Full environment validation with API tests
- `quickHealthCheck()` - Fast validation without external calls
- `startupValidation()` - Startup validation with retries
- `getLastValidation()` - Retrieve cached validation results

## ⚡ Health Status Levels
- **Healthy**: All required variables present, APIs functional
- **Degraded**: Non-critical issues (missing optional configs)
- **Failed**: Critical issues preventing application function

## 🔗 Dependencies
- `./stock/stock-price.service` - API connectivity testing
- `@/lib/logger` - Logging service

## ⚡ Current Status
**✅ FULLY IMPLEMENTED**
- Production-ready environment validation
- Comprehensive startup checks with retry logic
- API connectivity testing with graceful fallbacks
- Detailed error reporting and logging
- Health status classification system

## ⚙️ Configuration Required
- No additional configuration needed
- Validates all required environment variables
- Provides clear guidance for missing configurations

## 📝 Recent Changes
- Added comprehensive API connectivity testing
- Implemented retry logic for startup validation
- Enhanced error reporting with specific guidance
- Added lite production mode validation
- Created health status classification system