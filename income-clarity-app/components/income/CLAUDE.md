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

# Income Components Context

## What This Folder Does
Specialized React components for income tracking, dividend analysis, and cash flow projections. These components are used primarily by the IncomeIntelligenceHub but can be reused elsewhere.

## Key Files & Patterns

### Core Income Components
- `IncomeSummary.tsx` - Main income summary display
- `IncomeProgressionCard.tsx` - Income growth over time
- `IncomeStabilityCard.tsx` - Income volatility analysis
- `CashFlowProjectionCard.tsx` - Future cash flow predictions

### Dividend Intelligence
- `DividendIntelligenceEngine.tsx` - Advanced dividend analysis
- `InteractiveDividendCalendar.tsx` - Calendar view of dividend payments
- `IncomeProgressionTracker.tsx` - Track income milestones

### Tax & Planning
- `TaxBillCalculator.tsx` - Estimate tax obligations
- `TaxBreakdownCard.tsx` - Detailed tax analysis
- `FIREProgressCard.tsx` - Financial independence tracking

### Utilities
- `ProjectionCalculator.tsx` - Income projection algorithms
- `YTDIncomeAccumulator.tsx` - Year-to-date income tracking

## Recent Changes
- 2025-08-16: Fixed TypeScript compilation errors
- 2025-08-15: All components migrated from Supabase to SQLite
- 2025-08-14: Improved TypeScript typing throughout
- 2025-08-13: Enhanced mobile responsiveness

## Next Steps
- [ ] Add more sophisticated dividend prediction algorithms
- [ ] Improve tax estimation accuracy
- [ ] Create income goal setting interface
- [ ] Add quarterly income comparison views

## Dependencies
- Charts: `/components/charts/` - IncomeWaterfall, DividendProjections
- Services: `/lib/services/super-cards-database.service.ts` - Data persistence
- Hooks: `/hooks/useOptimizedAnimation.ts` - Performance animations
- Types: `/types/index.ts` - IncomeClarityResult interface

---
*Last updated: 2025-08-16 by META ORCHESTRATOR*