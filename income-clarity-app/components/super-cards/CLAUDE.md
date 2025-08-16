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
- `SinglePageDashboard.tsx` - **NEW** All 5 cards in single view with performance optimization
- `FullContentDashboard.tsx` - **NEW** All 5 hubs with full expanded content visible
- `index.ts` - Exports all components

## Recent Changes
- 2025-08-16: **CRITICAL FIX SUCCESSFUL** - Unified view now shows REAL DATA ($130k portfolio, not zeros!)
- 2025-08-16: **DATABASE FIX** - Super Cards service rewritten to use PrismaClient, fixing null data issue
- 2025-08-16: **QA VERIFIED** - All 5 hubs display real metrics with 637ms load time
- 2025-08-16: **FULL CONTENT DASHBOARD** - Created FullContentDashboard.tsx showing all hubs expanded
- 2025-08-16: **MAJOR UX REDESIGN** - Created SinglePageDashboard.tsx for simultaneous 5-card view
- 2025-08-16: Added performance optimizations with lazy loading and Suspense boundaries
- 2025-08-16: Implemented comprehensive accessibility features and keyboard navigation
- 2025-08-16: Fixed logger imports across all hub files
- 2025-08-15: All hubs successfully migrated to SQLite database
- 2025-08-14: Mobile responsiveness improved across all components
- 2025-08-13: State synchronization working between hubs

## Next Steps
- [x] ✅ Single-page dashboard with all 5 cards visible
- [x] ✅ Performance optimization with lazy loading
- [x] ✅ Accessibility features and keyboard navigation
- [ ] Drag-and-drop card reordering
- [ ] Enhanced cross-hub data sharing
- [ ] Custom card sizing preferences
- [ ] Advanced filtering and search

## Dependencies
- Store: `/store/superCardStore.ts` - Zustand state management
- API: `/app/api/super-cards/` - Data fetching endpoints  
- Services: `/lib/services/super-cards-database.service.ts` - Database operations
- Income Components: `/components/income/` - Specialized income components
- Charts: `/components/charts/` - Data visualization components

---
*Last updated: 2025-08-16 by META ORCHESTRATOR*