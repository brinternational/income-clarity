# RESTORATION PLAN
*Systematic audit and restoration plan for Income Clarity after Supabase/Sentry removal damage*
*Created: 2025-01-12 | Updated: 2025-01-12 | Status: AUDIT COMPLETE - RESTORATION PHASE*

## 🚨 CRITICAL ISSUE SUMMARY
A developer attempted to remove Supabase, Sentry, and other dependencies but:
1. **Broke syntax** while removing code
2. **Deleted files** to hide mistakes
3. **Created stub files** with minimal functionality to make app "load"
4. **"Fixed" TypeScript errors** by adding stub implementations and making parameters optional
5. **Result**: Features marked "✅ COMPLETE" in todo lists may actually be hollow shells

### Latest Developer's "Fixes" (Jan 12, 2025)
The previous developer claims to have "fixed all TypeScript errors" by:
- Making parameters optional instead of implementing logic
- Adding stub properties to satisfy TypeScript
- Changing signatures without adding functionality
- **THE APP COMPILES BUT DOESN'T WORK**

### Deep Analysis Results (Jan 12, 2025)
- **Authentication**: Completely stubbed, returns null
- **Data Layer**: No persistence, localStorage only
- **Super Cards**: All showing mock data
- **47+ instances** of fake/demo data throughout

---

## 🏗️ NEW ARCHITECTURE REQUIREMENTS
*Based on Lite Production needs - NOT personal, but first deployment for testing*

### Database
- ✅ **SQLite** with better-sqlite3 (no Prisma/ORM)
- ✅ Simple direct SQL queries
- ✅ Use `/data/income-clarity.db` (currently empty)
- ✅ Keep test user system for development

### Authentication
- ✅ **Session-based auth** with SQLite storage
- ✅ Email/password only (no OAuth)
- ✅ Multi-user support (but focus on test user first)
- ✅ Test credentials: `test@example.com` / `password123`
- ❌ No JWT tokens
- ❌ No bcrypt (use simple hashing for now)

### Data Philosophy
- ✅ **NO mock/demo data** - all real user data
- ✅ Show empty states when no data exists
- ✅ Remove all `demo-data.ts`, `mock-data.ts` files
- ✅ Test user for development only

### External Services
- ✅ **Polygon.io API** for stock prices (already have key)
- ⏳ Future APIs to evaluate:
  - Alpha Vantage (backup stock data)
  - IEX Cloud (market data)
  - Yahoo Finance (free tier)
  - Financial Modeling Prep
- ❌ No Sentry/monitoring (dev logs only)
- ❌ No error tracking service

### Deployment
- ✅ **Lite Production** on SSH server
- ✅ Port 3000 with nginx proxy
- ✅ User registration system (not hardcoded)
- ✅ SQLite automated backups
- ✅ This is NOT personal use - it's first testing deployment

### Features (Keep ALL)
- ✅ Portfolio tracking with real holdings
- ✅ Dividend income tracking
- ✅ Tax calculations (all locations)
- ✅ Super Cards with real calculations
- ✅ Expense tracking and budgets
- ✅ User registration/onboarding flows
- ✅ All existing features

---

## 📋 MASTER RESTORATION TODO LIST

### PHASE 1: DAMAGE ASSESSMENT (Day 1-2)
*Identify what's broken, stubbed, or missing*

#### 1.1 Context Files Audit
- [ ] **AUDIT-001**: Analyze `/contexts/AuthContext.tsx` - Check if it's a stub (currently returns null user)
- [ ] **AUDIT-002**: Analyze `/contexts/PortfolioContext.tsx` - Verify CRUD operations exist
- [ ] **AUDIT-003**: Analyze `/contexts/ExpenseContext.tsx` - Check expense tracking logic
- [ ] **AUDIT-004**: Analyze `/contexts/LoadingContext.tsx` - Verify loading state management
- [ ] **AUDIT-005**: Analyze `/contexts/NotificationContext.tsx` - Check notification system
- [ ] **AUDIT-006**: Analyze `/contexts/ThemeContext.tsx` - Verify theme persistence to database
- [ ] **AUDIT-007**: Analyze `/contexts/UserProfileContext.tsx` - Check profile management
- [ ] **AUDIT-008**: Analyze `/contexts/SimpleAuthContext.tsx` - Check if this replaced real auth
- [ ] **AUDIT-009**: Analyze `/contexts/LiteProductionAuthContext.tsx` - Verify lite auth implementation

#### 1.2 Hook Files Audit
- [ ] **AUDIT-010**: Analyze `/hooks/useAuth.ts` - Verify login/logout/session management
- [ ] **AUDIT-011**: Analyze `/hooks/useAuth-simple.ts` - Check if this is a stub replacement
- [ ] **AUDIT-012**: Analyze `/hooks/usePortfolios.ts` - Verify portfolio CRUD operations
- [ ] **AUDIT-013**: Analyze `/hooks/useExpenses.ts` - Check expense calculations
- [ ] **AUDIT-014**: Analyze `/hooks/useDashboardData.ts` - Verify data aggregation
- [ ] **AUDIT-015**: Analyze `/hooks/useCoastFI.ts` - Check FIRE calculations
- [ ] **AUDIT-016**: Analyze `/hooks/useDividendIntelligence.ts` - Verify dividend logic
- [ ] **AUDIT-017**: Analyze `/hooks/useLocalStorage.ts` - Check persistence layer
- [ ] **AUDIT-018**: Analyze `/hooks/useIncomeProgression.ts` - Verify income tracking
- [ ] **AUDIT-019**: Analyze `/hooks/useSPYIntelligence.ts` - Check SPY comparison logic
- [ ] **AUDIT-020**: Analyze `/hooks/useGoalStore.ts` - Verify goal management

#### 1.3 Service Layer Audit
- [ ] **AUDIT-021**: Analyze `/lib/db-simple.ts` - Verify SQLite connection and queries
- [ ] **AUDIT-022**: Analyze `/lib/db.ts` - Check if this is the original or stub
- [ ] **AUDIT-023**: Analyze `/lib/stock-price-service.ts` - Verify price fetching logic
- [ ] **AUDIT-024**: Analyze `/lib/calculations.ts` - Check financial calculations
- [ ] **AUDIT-025**: Analyze `/lib/tax-strategies.ts` - Verify tax calculation logic
- [ ] **AUDIT-026**: Analyze `/lib/cache-service.ts` - Check caching implementation
- [ ] **AUDIT-027**: Analyze `/lib/super-cards-client.ts` - Verify Super Cards data
- [ ] **AUDIT-028**: Analyze `/lib/demo-data.ts` - Check demo/test data generation
- [ ] **AUDIT-029**: Analyze `/lib/demo-mode.ts` - Verify demo mode functionality
- [ ] **AUDIT-030**: Analyze `/lib/supabase-client.ts` - Check if stub or deleted

#### 1.4 Component Functionality Audit
- [ ] **AUDIT-031**: Analyze `/components/dashboard/*.tsx` - All dashboard cards functionality
- [ ] **AUDIT-032**: Analyze `/components/portfolio/*.tsx` - Portfolio management components
- [ ] **AUDIT-033**: Analyze `/components/income/*.tsx` - Income tracking components
- [ ] **AUDIT-034**: Analyze `/components/expenses/*.tsx` - Expense management components
- [ ] **AUDIT-035**: Analyze `/components/super-cards/*.tsx` - All 5 Super Cards
- [ ] **AUDIT-036**: Analyze `/components/auth/LoginForm.tsx` - Login form functionality
- [ ] **AUDIT-037**: Analyze `/components/auth/SignupForm.tsx` - Signup form functionality
- [ ] **AUDIT-038**: Analyze `/components/forms/*.tsx` - All form components
- [ ] **AUDIT-039**: Analyze `/components/planning/*.tsx` - Planning components
- [ ] **AUDIT-040**: Analyze `/components/budgets/*.tsx` - Budget tracking components

#### 1.5 API Routes Audit
- [ ] **AUDIT-041**: Analyze `/api/auth/login/route.ts` - Login endpoint functionality
- [ ] **AUDIT-042**: Analyze `/api/auth/logout/route.ts` - Logout endpoint
- [ ] **AUDIT-043**: Analyze `/api/auth/session/route.ts` - Session management
- [ ] **AUDIT-044**: Analyze `/api/auth/signup/route.ts` - User registration
- [ ] **AUDIT-045**: Analyze `/api/portfolio/*` - All portfolio CRUD endpoints
- [ ] **AUDIT-046**: Analyze `/api/expenses/*` - Expense management endpoints
- [ ] **AUDIT-047**: Analyze `/api/income/*` - Income tracking endpoints
- [ ] **AUDIT-048**: Analyze `/api/super-cards/*` - Super Cards data endpoints
- [ ] **AUDIT-049**: Analyze `/api/calculations/*` - Calculation endpoints
- [ ] **AUDIT-050**: Analyze `/api/admin/*` - Admin functionality endpoints

#### 1.6 Page Files Audit
- [ ] **AUDIT-051**: Analyze `/app/dashboard/page.tsx` - Main dashboard functionality
- [ ] **AUDIT-052**: Analyze `/app/super-cards/page.tsx` - Super Cards page
- [ ] **AUDIT-053**: Analyze `/app/auth/login/page.tsx` - Login page
- [ ] **AUDIT-054**: Analyze `/app/auth/signup/page.tsx` - Signup page
- [ ] **AUDIT-055**: Analyze `/app/profile/page.tsx` - Profile management
- [ ] **AUDIT-056**: Analyze `/app/settings/page.tsx` - Settings page
- [ ] **AUDIT-057**: Analyze `/app/expenses/page.tsx` - Expense management page
- [ ] **AUDIT-058**: Analyze `/app/onboarding/page.tsx` - Onboarding flow
- [ ] **AUDIT-059**: Analyze `/app/admin/*` - Admin pages
- [ ] **AUDIT-060**: Analyze `/app/demo/*` - Demo mode pages

---

### PHASE 2: CATEGORIZATION & DOCUMENTATION (Day 3)
*Document findings and categorize damage*

#### 2.1 Create Damage Report
- [ ] **DOC-001**: Create file status matrix (INTACT/PARTIAL/STUB/MISSING/BROKEN)
- [ ] **DOC-002**: List all TypeScript compilation errors
- [ ] **DOC-003**: Document all missing imports/modules
- [ ] **DOC-004**: List all empty/stub functions found
- [ ] **DOC-005**: Document all TODO comments left by previous developer
- [ ] **DOC-006**: Create feature impact assessment
- [ ] **DOC-007**: Map dependencies between broken components
- [ ] **DOC-008**: Document all console.log statements (debugging remnants)
- [ ] **DOC-009**: List all files that return null or empty objects
- [ ] **DOC-010**: Create comprehensive damage assessment report

#### 2.2 Priority Classification
- [ ] **PRIORITY-001**: Classify P0 issues (app won't run without these)
- [ ] **PRIORITY-002**: Classify P1 issues (core features broken)
- [ ] **PRIORITY-003**: Classify P2 issues (enhanced features broken)
- [ ] **PRIORITY-004**: Create restoration sequence plan
- [ ] **PRIORITY-005**: Estimate time for each restoration task

---

### PHASE 3: RESTORATION TASKS (Days 4-10)
*Fix issues in priority order - UPDATED for new architecture*

#### 3.1 Priority 0: Core Infrastructure (App Won't Run)
- [ ] **FIX-001**: ~~Fix all TypeScript syntax errors~~ ✅ DONE (but with stubs)
- [ ] **FIX-002**: Create NEW AuthContext with SQLite session-based auth
- [ ] **FIX-003**: Implement useAuth.ts with real SQLite user queries
- [ ] **FIX-004**: Enhance db-simple.ts with all needed tables/queries
- [ ] **FIX-005**: Create /api/auth/session with SQLite session management
- [ ] **FIX-006**: Build PortfolioContext with SQLite CRUD operations
- [ ] **FIX-007**: Remove ALL mock/demo data imports
- [ ] **FIX-008**: Create empty state components for no-data scenarios
- [ ] **FIX-009**: Update test user to test@example.com/password123
- [ ] **FIX-010**: Remove all Supabase/Sentry remnants

#### 3.2 Priority 1: Essential Features
- [ ] **FIX-011**: Restore portfolio management UI components
- [ ] **FIX-012**: Fix income tracking components and logic
- [ ] **FIX-013**: Restore expense management functionality
- [ ] **FIX-014**: Fix Super Cards data fetching and display
- [ ] **FIX-015**: Restore financial calculation logic
- [ ] **FIX-016**: Fix dashboard data aggregation
- [ ] **FIX-017**: Restore form submission and validation
- [ ] **FIX-018**: Fix data persistence to SQLite
- [ ] **FIX-019**: Restore loading states and error handling
- [ ] **FIX-020**: Fix user profile management

#### 3.3 Priority 2: Enhanced Features
- [ ] **FIX-021**: Restore tax calculation strategies
- [ ] **FIX-022**: Fix charts and data visualizations
- [ ] **FIX-023**: Restore milestone tracking and gamification
- [ ] **FIX-024**: Fix notification system
- [ ] **FIX-025**: Restore theme persistence to database
- [ ] **FIX-026**: Fix PWA functionality
- [ ] **FIX-027**: Restore keyboard shortcuts
- [ ] **FIX-028**: Fix mobile responsive layouts
- [ ] **FIX-029**: Restore report generation
- [ ] **FIX-030**: Fix admin panel functionality

#### 3.4 Data Layer Restoration
- [ ] **DATA-001**: Verify all Prisma models are correct
- [ ] **DATA-002**: Restore database migrations
- [ ] **DATA-003**: Fix database seeding scripts
- [ ] **DATA-004**: Restore backup functionality
- [ ] **DATA-005**: Fix cache layer implementation
- [ ] **DATA-006**: Restore transaction history
- [ ] **DATA-007**: Fix dividend tracking
- [ ] **DATA-008**: Restore historical price data
- [ ] **DATA-009**: Fix portfolio calculations
- [ ] **DATA-010**: Restore user settings persistence

---

### PHASE 4: VERIFICATION & TESTING (Days 11-12)
*Ensure everything works*

#### 4.1 Functionality Testing
- [ ] **TEST-001**: Test complete authentication flow (signup → login → logout)
- [ ] **TEST-002**: Test portfolio CRUD operations
- [ ] **TEST-003**: Test income tracking functionality
- [ ] **TEST-004**: Test expense management
- [ ] **TEST-005**: Test all 5 Super Cards
- [ ] **TEST-006**: Test data persistence after refresh
- [ ] **TEST-007**: Test calculation accuracy
- [ ] **TEST-008**: Test report generation
- [ ] **TEST-009**: Test mobile responsiveness
- [ ] **TEST-010**: Test PWA installation

#### 4.2 Integration Testing
- [ ] **TEST-011**: Test API endpoints with database
- [ ] **TEST-012**: Test context providers with components
- [ ] **TEST-013**: Test form submissions to API
- [ ] **TEST-014**: Test data flow from DB to UI
- [ ] **TEST-015**: Test error handling and recovery

#### 4.3 Performance Testing
- [ ] **TEST-016**: Test page load times
- [ ] **TEST-017**: Test database query performance
- [ ] **TEST-018**: Test with large datasets
- [ ] **TEST-019**: Test memory usage
- [ ] **TEST-020**: Test cache effectiveness

---

### PHASE 5: DOCUMENTATION & DEPLOYMENT (Day 13-14)
*Document fixes and deploy*

#### 5.1 Documentation
- [ ] **DOCS-001**: Document all restored functionality
- [ ] **DOCS-002**: Update API documentation
- [ ] **DOCS-003**: Create troubleshooting guide
- [ ] **DOCS-004**: Document known issues
- [ ] **DOCS-005**: Update setup instructions

#### 5.2 Deployment
- [ ] **DEPLOY-001**: Build production bundle
- [ ] **DEPLOY-002**: Run final test suite
- [ ] **DEPLOY-003**: Deploy to staging environment
- [ ] **DEPLOY-004**: Perform smoke tests
- [ ] **DEPLOY-005**: Deploy to production

---

## 📊 DAMAGE ASSESSMENT MATRIX

| Component | Status | Impact | Priority | Notes |
|-----------|--------|--------|----------|-------|
| AuthContext | STUB? | Critical | P0 | Returns null user |
| PortfolioContext | UNKNOWN | High | P0 | Needs verification |
| Database Layer | UNKNOWN | Critical | P0 | SQLite connection? |
| Super Cards | UNKNOWN | High | P1 | 5 cards to check |
| API Routes | UNKNOWN | Critical | P0 | Core functionality |
| UI Components | UNKNOWN | Medium | P1 | User experience |
| Calculations | UNKNOWN | High | P1 | Financial accuracy |
| Tax Logic | UNKNOWN | Medium | P2 | Enhanced feature |

---

## 🔍 INVESTIGATION COMMANDS

```bash
# Find all stub patterns (CRITICAL - these reveal fake implementations)
grep -r "return.*null" --include="*.tsx" --include="*.ts" components/ contexts/ hooks/
grep -r "return.*\{\}" --include="*.tsx" --include="*.ts" components/ contexts/ hooks/
grep -r "return \[\]" --include="*.tsx" --include="*.ts" hooks/
grep -r "// TODO" --include="*.tsx" --include="*.ts"
grep -r "console.log" --include="*.tsx" --include="*.ts"

# Find optional parameters that should be required (red flag for stubs)
grep -r "\?:" --include="*.ts" hooks/ | grep -E "email|password|id|data"

# Find empty async functions
grep -r "async.*=>.*\{\s*\}" --include="*.tsx" --include="*.ts"
grep -r "async.*\{[\s]*\}" --include="*.tsx" --include="*.ts"

# Find stub implementations (success: true without logic)
grep -r "success:.*true" --include="*.ts" hooks/ contexts/
grep -r "return.*success.*true.*error.*null" --include="*.ts"

# Check for TypeScript errors (should be none after "fixes")
npx tsc --noEmit

# Find deleted file references
npm run build 2>&1 | grep "Cannot find module"

# Check which contexts are actually used vs stubbed
grep -r "useContext\|Context\.Provider" --include="*.tsx" --include="*.ts"

# Find methods that don't do anything
grep -r "=.*async.*=>.*\{.*\}" --include="*.ts" hooks/ | grep -v "await"
```

---

## 📈 PROGRESS TRACKING

### Overall Progress: 1/140 tasks (0.7%)

**Phase 1 (Audit)**: ✅ COMPLETE via deep analysis
**Phase 2 (Documentation)**: 1/15 tasks  
**Phase 3 (Restoration)**: 0/40 tasks
**Phase 4 (Testing)**: 0/20 tasks
**Phase 5 (Deployment)**: 0/5 tasks

### REVISED Critical Path Items (Based on New Architecture)
1. ~~Fix TypeScript compilation~~ ✅ Done (but needs real implementation)
2. Build SQLite session-based authentication (NO Supabase)
3. Remove ALL mock/demo data
4. Implement SQLite CRUD for all features
5. Connect Super Cards to real SQLite data
6. Create empty state UI for no-data scenarios
7. Test with test@example.com account

---

## 🚀 NEXT STEPS (REVISED)

### Immediate Priority Tasks (Day 1)
1. **Remove all mock/demo data files**
   - Delete `/lib/demo-data.ts`, `/lib/mock-data.ts`
   - Remove all imports of mock data
   - Find and remove 47+ hardcoded data instances

2. **Build SQLite authentication from scratch**
   - Create sessions table in SQLite
   - Implement real login/logout
   - Store sessions in database (not memory)

3. **Update test user credentials**
   - Change to test@example.com / password123
   - Remove test@incomeclarity.com

### Week 1 Focus
- **Day 1-2**: Remove mock data, build auth
- **Day 3-4**: SQLite CRUD for portfolios
- **Day 5-6**: Connect Super Cards to real data
- **Day 7**: Testing with test user

### Architecture Decisions Made
- ✅ SQLite only (no Prisma/ORM)
- ✅ Session-based auth (no JWT)
- ✅ No mock data (real or empty states)
- ✅ Keep all features (not simplified)
- ✅ Multi-user support (not personal app)
- ✅ Polygon.io for stock prices

---

## 📝 NOTES

- Previous developer attempted to remove Supabase/Sentry but broke the app
- Many files may be stubs that just make the app "load" but don't work
- Features marked "complete" in other todos may actually be broken
- Need systematic verification of every component
- Test user system was just added and appears to be working

---

*This plan will be updated as the audit progresses and we discover the true extent of the damage.*