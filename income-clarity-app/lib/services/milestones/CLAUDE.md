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

# Milestone Tracker Service

## 📋 Purpose
Detects FIRE (Financial Independence, Retire Early) milestone achievements and triggers automated email notifications. Tracks user progress toward financial independence goals.

## 🎯 Milestone Categories
- **Utilities Coverage**: $25,000 (Dividend coverage for utilities)
- **Food Coverage**: $75,000 (Dividend coverage for food expenses)
- **Housing Coverage**: $375,000 (Dividend coverage for housing)
- **Transportation**: $125,000 (Dividend coverage for transport)
- **Healthcare**: $200,000 (Dividend coverage for healthcare)
- **Lifestyle Freedom**: $500,000 (Complete lifestyle coverage)
- **Complete FIRE**: $1,000,000 (Full financial independence)

## 🔧 Key Methods
- `checkMilestones()` - Compare portfolio values and detect new achievements
- `getMilestoneProgress()` - Calculate current progress toward all milestones
- `triggerMilestoneCheck()` - Manual milestone verification
- `sendMilestoneNotification()` - Email notifications for achievements
- `estimateTimeToNextMilestone()` - Calculate projected timeline

## 🔗 Dependencies
- `@prisma/client` - Database operations
- `./email/email-scheduler.service` - Email notifications
- `@/lib/logger` - Logging service

## ⚡ Current Status
**✅ FULLY IMPLEMENTED**
- Complete milestone definitions with 4% rule calculations
- Email notification integration ready
- Progress tracking and estimation
- Database logging prepared
- Singleton pattern for reliability

## ⚙️ Configuration Required
- Email scheduler service must be configured
- Database schema for milestone logging (commented code ready)

## 📝 Recent Changes
- Integrated with email scheduler service
- Added sophisticated time estimation logic
- Implemented comprehensive progress tracking
- Ready for milestone achievement storage