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

# Super Cards Context

## What This Folder Does
Contains the 5 main intelligence hubs that make up the core Income Clarity dashboard. Each hub is a complex React component with mobile variants and shared state management.

## Key Files & Patterns

### Main Hubs (Pattern: [Name]Hub.tsx)
- `IncomeIntelligenceHub.tsx` - Income tracking and projections
- `PerformanceHub.tsx` - SPY benchmarking and portfolio performance  
- `TaxStrategyHub.tsx` - Multi-state tax optimization
- `PortfolioStrategyHub.tsx` - Asset allocation and rebalancing
- `FinancialPlanningHub.tsx` - FIRE progress and goal tracking

### Mobile Variants (Pattern: Mobile[Name]Hub.tsx)
- Each hub has a mobile-optimized version
- Same data, different layout and interactions

### Shared Infrastructure
- `SuperCardProvider.tsx` - Global state management
- `SuperCardsEnhancedLayout.tsx` - Common layout wrapper
- `index.ts` - Exports all components

## Recent Changes
- 2025-08-16: Fixed logger imports across all hub files
- 2025-08-15: All hubs successfully migrated to SQLite database
- 2025-08-14: Mobile responsiveness improved across all components
- 2025-08-13: State synchronization working between hubs

## Next Steps
- [ ] Performance optimization for mobile devices
- [ ] Enhanced cross-hub data sharing
- [ ] Improved loading states and error handling
- [ ] Add loading skeletons for better UX

## Dependencies
- Store: `/store/superCardStore.ts` - Zustand state management
- API: `/app/api/super-cards/` - Data fetching endpoints  
- Services: `/lib/services/super-cards-database.service.ts` - Database operations
- Income Components: `/components/income/` - Specialized income components
- Charts: `/components/charts/` - Data visualization components

---
*Last updated: 2025-08-16 by META ORCHESTRATOR*