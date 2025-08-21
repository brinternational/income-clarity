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

# Super Cards API Context

## What This Folder Does
API endpoints that serve data to the 5 Super Card hubs. Each hub has its own route that handles GET (fetch data) and POST (update data) operations.

## Key Files & Patterns

### Hub Endpoints (Pattern: [name]-hub/route.ts)
- `income-hub/route.ts` - Income and dividend data
- `performance-hub/route.ts` - Portfolio performance and SPY benchmarking
- `tax-strategy-hub/route.ts` - Tax optimization calculations
- `portfolio-strategy-hub/route.ts` - Asset allocation and rebalancing
- `financial-planning-hub/route.ts` - FIRE progress and goal tracking
- `planning-hub/route.ts` - Alternative planning endpoint

### Main Route
- `route.ts` - Root super-cards endpoint, handles general queries

### Standard Pattern
```typescript
export async function GET() {
  try {
    const data = await superCardsDatabase.get[Hub]Data();
    return NextResponse.json(data);
  } catch (error) {
    logger.error(`[Hub] API Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

## Recent Changes
- 2025-08-16: Added logger imports to all route files
- 2025-08-15: All endpoints migrated from Supabase to SQLite
- 2025-08-14: Improved error handling and logging
- 2025-08-13: Added empty state handling for new users

## Next Steps
- [ ] Add caching layer for frequently accessed data
- [ ] Implement rate limiting for production
- [ ] Add data validation middleware
- [ ] Create unified error response format

## Dependencies
- Database: `/lib/services/super-cards-database.service.ts` - All database operations
- Logger: `/lib/logger.ts` - Centralized logging
- Types: `/lib/database.types.ts` - TypeScript interfaces
- Auth: Middleware checks session before allowing access

---
*Last updated: 2025-08-16 by META ORCHESTRATOR*