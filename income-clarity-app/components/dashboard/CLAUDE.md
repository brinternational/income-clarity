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

# Dashboard Components Directory

## Overview
This directory contains legacy dashboard components that are being migrated to Super Cards architecture.

## Recent Changes

### August 16, 2025 - Duplicate Component Cleanup
**CLEANUP COMPLETED**: Removed duplicate visualization components that were no longer used.

**Files Removed**:
- `DividendCalendar.tsx` (824 lines) - Duplicate of /components/charts/DividendCalendar.tsx
- `PerformanceChart.tsx` (347 lines) - Duplicate of /components/charts/PerformanceChart.tsx

**Reason for Removal**:
- The analytics page migration to Super Cards was completed
- All active imports point to the charts/ versions
- These duplicates were increasing bundle size unnecessarily
- No functional changes - application continues working perfectly

**Active Versions Location**:
- ✅ `/components/charts/DividendCalendar.tsx` (ACTIVE - used by Super Cards)
- ✅ `/components/charts/PerformanceChart.tsx` (ACTIVE - used by Super Cards)

**Verification Performed**:
- ✅ Comprehensive grep searches confirmed no active imports
- ✅ TypeScript compilation confirmed no broken imports
- ✅ Application tested and working correctly
- ✅ Super Cards continue functioning as expected

**Impact**:
- Bundle size reduced by ~1,171 lines of duplicate code
- No functional changes
- Cleaner codebase architecture
- Eliminated confusion about which components to use

## Remaining Components
All other components in this directory are still active and serve specific purposes in the legacy dashboard areas.

## Migration Notes
As Super Cards architecture becomes fully adopted, additional components may be migrated or deprecated from this directory.