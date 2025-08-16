# ARCHIVE MIGRATION TODO - Super Cards Pivot
*Comprehensive list of items to archive from 18-card system to 5 Super Cards*
*Created: 2025-01-09 by Meta Orchestrator*

## 🎯 PURPOSE
Archive all old 18-card architecture files while preserving them for reference.
Focus development on the new 5 Super Card system.

## 📁 ARCHIVE STRUCTURE
```
/income-clarity/Archive/
├── old-blueprints/       # Original 18-card blueprints
├── old-todos/            # Original master todos
├── old-tests/            # Tests for deprecated components
├── old-components/       # Unused card components
├── old-documentation/    # Old feature mapping docs
└── old-18-card-system/   # Complete backup of old approach
```

## 🗂️ FILES TO ARCHIVE

### 1. Blueprint & Planning Files
- [ ] **ARCH-001**: Move `APP_STRUCTURE_BLUEPRINT.md` → `Archive/old-blueprints/`
- [ ] **ARCH-002**: Move `FEATURE_MAPPING.md` → `Archive/old-documentation/`
- [ ] **ARCH-003**: Move `IMPLEMENTATION_GUIDE.md` → `Archive/old-documentation/`
- [ ] **ARCH-004**: Move `STRATEGIC_CARDS_IMPLEMENTATION.md` → `Archive/old-documentation/`
- [ ] **ARCH-005**: Move `INCOME_CLARITY_PROJECT_CONTEXT.md` → `Archive/old-documentation/`
- [ ] **ARCH-006**: Move `INCOME_CLARITY_MASTER_TODO.md` → `Archive/old-todos/`
- [ ] **ARCH-007**: Move any `*_OLD.md` or `*_BACKUP.md` files → `Archive/old-documentation/`

### 2. Old Component Files (Not Used in Super Cards)
- [ ] **COMP-001**: Analyze `/components/dashboard/` - identify non-Super Card components
- [ ] **COMP-002**: Move standalone card components → `Archive/old-components/`
  - [ ] Individual milestone cards
  - [ ] Individual tax cards
  - [ ] Individual strategy cards
  - [ ] Individual income cards (not in hub)
- [ ] **COMP-003**: Keep only components used by Super Cards
- [ ] **COMP-004**: Archive old form components not integrated with Super Cards
- [ ] **COMP-005**: Archive old navigation components (pre-Super Card nav)

### 3. Test Files for Deprecated Components
- [ ] **TEST-001**: Identify tests for archived components
- [ ] **TEST-002**: Move old component tests → `Archive/old-tests/`
- [ ] **TEST-003**: Keep only tests for Super Card components
- [ ] **TEST-004**: Archive E2E tests for 18-card system
- [ ] **TEST-005**: Create new test structure for 5 Super Cards

### 4. Old Pages & Routes
- [ ] **PAGE-001**: Archive `/app/test/` → `Archive/old-18-card-system/pages/`
- [ ] **PAGE-002**: Archive `/app/test-dashboard/` → `Archive/old-18-card-system/pages/`
- [ ] **PAGE-003**: Archive `/app/minimal/` → `Archive/old-18-card-system/pages/`
- [ ] **PAGE-004**: Archive `/app/working/` (if replaced by new dashboard)
- [ ] **PAGE-005**: Archive any demo pages for individual cards

### 5. Documentation to Archive
- [ ] **DOC-001**: Move `UI_TESTING_CHECKLIST.md` → `Archive/old-documentation/`
- [ ] **DOC-002**: Move `CONSOLIDATION_AUDIT.md` → `Archive/old-documentation/`
- [ ] **DOC-003**: Move old agent reports → `Archive/old-documentation/agent-reports/`
- [ ] **DOC-004**: Move old analysis files → `Archive/old-documentation/analysis/`
- [ ] **DOC-005**: Archive any "how-to" docs for 18-card system

### 6. Configuration Files
- [ ] **CONFIG-001**: Archive old mock data for 18 cards
- [ ] **CONFIG-002**: Archive old type definitions for deprecated cards
- [ ] **CONFIG-003**: Archive old API routes for individual cards
- [ ] **CONFIG-004**: Keep only Super Card related configs

### 7. Legacy Files & Backups
- [ ] **LEGACY-001**: Search for all `*.backup`, `*.old`, `*.bak` files → Archive
- [ ] **LEGACY-002**: Find all `*_OLD*`, `*_BACKUP*`, `*_DEPRECATED*` files → Archive
- [ ] **LEGACY-003**: Move `.backup` folders → Archive
- [ ] **LEGACY-004**: Archive `node_modules.backup` if exists
- [ ] **LEGACY-005**: Archive any `package-lock.json.backup` files
- [ ] **LEGACY-006**: Find and archive all `*.tmp`, `*.temp` files
- [ ] **LEGACY-007**: Archive any `OBSOLETE_*` or `DEPRECATED_*` files

### 8. Old Analysis & Reports
- [ ] **ANALYSIS-001**: Archive `CONSOLIDATION_AUDIT.md`
- [ ] **ANALYSIS-002**: Archive `QA_TEST_RESULTS.md` (old results)
- [ ] **ANALYSIS-003**: Archive `API_OPTIMIZATION_COMPLETE.md`
- [ ] **ANALYSIS-004**: Archive `COMPREHENSIVE_CACHING_IMPLEMENTATION.md`
- [ ] **ANALYSIS-005**: Archive old consultant reports and assessments
- [ ] **ANALYSIS-006**: Archive performance audit results
- [ ] **ANALYSIS-007**: Archive old roadmaps and timelines

### 9. PaycheckToPortfolio (P2P) Remnants
- [ ] **P2P-001**: Search for any `*p2p*` or `*P2P*` files → Archive
- [ ] **P2P-002**: Search for `paycheck*` files → Archive
- [ ] **P2P-003**: Archive any portfolio migration files
- [ ] **P2P-004**: Archive P2P related components
- [ ] **P2P-005**: Archive P2P documentation
- [ ] **P2P-006**: Clean P2P references from active code

### 10. Experimental & Demo Code
- [ ] **EXP-001**: Archive `/app/demo/` pages (except Super Card demos)
- [ ] **EXP-002**: Archive `/app/mobile-demo/` if not using
- [ ] **EXP-003**: Archive experimental hook implementations
- [ ] **EXP-004**: Archive POC components
- [ ] **EXP-005**: Archive playground/sandbox files
- [ ] **EXP-006**: Archive test utility files not in use

### 11. Old Scripts & Tools
- [ ] **SCRIPT-001**: Archive unused scripts in `/scripts/`
- [ ] **SCRIPT-002**: Archive old migration scripts
- [ ] **SCRIPT-003**: Archive deprecated build scripts
- [ ] **SCRIPT-004**: Archive old deployment scripts
- [ ] **SCRIPT-005**: Archive test data generators
- [ ] **SCRIPT-006**: Archive one-time use scripts

### 12. Stale Documentation
- [ ] **STALE-001**: Archive old README versions
- [ ] **STALE-002**: Archive superseded API documentation
- [ ] **STALE-003**: Archive old setup guides
- [ ] **STALE-004**: Archive deprecated workflow documentation
- [ ] **STALE-005**: Archive old architecture diagrams
- [ ] **STALE-006**: Archive historical decision records

### 13. Old State Management
- [ ] **STATE-001**: Archive Context providers not used by Super Cards
- [ ] **STATE-002**: Archive old Redux/MobX files if any
- [ ] **STATE-003**: Archive individual card state files
- [ ] **STATE-004**: Archive old global state implementations
- [ ] **STATE-005**: Archive state migration utilities

### 14. Deprecated Styles
- [ ] **STYLE-001**: Archive old CSS modules not in use
- [ ] **STYLE-002**: Archive component-specific styles for archived components
- [ ] **STYLE-003**: Archive old theme files (pre-10-theme system)
- [ ] **STYLE-004**: Archive unused Tailwind configs
- [ ] **STYLE-005**: Archive old animation files

### 15. Old Type Definitions
- [ ] **TYPES-001**: Archive interfaces for deprecated components
- [ ] **TYPES-002**: Archive old API type definitions
- [ ] **TYPES-003**: Archive unused model types
- [ ] **TYPES-004**: Archive legacy type utilities
- [ ] **TYPES-005**: Archive old enum definitions

## 📝 FILES TO CREATE (NEW)

### 1. New Blueprint Files
- [ ] **NEW-001**: Create `SUPER_CARDS_BLUEPRINT.md` - Complete 5 Super Card architecture
- [ ] **NEW-002**: Create `SUPER_CARDS_MASTER_TODO.md` - New consolidated todo list
- [ ] **NEW-003**: Create `SUPER_CARDS_TECH_SPEC.md` - Technical implementation
- [ ] **NEW-004**: Create `SUPER_CARDS_FEATURE_MAP.md` - Map old features to new cards
- [ ] **NEW-005**: Create `SUPER_CARDS_MIGRATION_GUIDE.md` - How to migrate

### 2. New Component Structure
- [ ] **NEW-006**: Document 5 Super Cards in detail:
  1. Performance Hub (SPY comparison, holdings analysis)
  2. Income Intelligence Hub (clarity, projections, stability)
  3. Tax Strategy Hub (optimization, savings calculator)
  4. Portfolio Strategy Hub (rebalancing, health scores)
  5. Financial Planning Hub (FIRE progress, milestones)

### 3. New Documentation
- [ ] **NEW-007**: Create component mapping (old → new)
- [ ] **NEW-008**: Create data flow documentation for Super Cards
- [ ] **NEW-009**: Create API consolidation plan
- [ ] **NEW-010**: Create state management migration plan

## 🤖 SUB-AGENT ASSIGNMENTS

### Frontend React Specialist
- [ ] **AGENT-FE-001**: Analyze all components in `/components/dashboard/`
- [ ] **AGENT-FE-002**: Identify which components map to which Super Card
- [ ] **AGENT-FE-003**: List components to archive vs keep
- [ ] **AGENT-FE-004**: Create component migration checklist
- [ ] **AGENT-FE-005**: Design new Super Card component structure

### Backend Node Specialist
- [ ] **AGENT-BE-001**: Analyze API routes for consolidation
- [ ] **AGENT-BE-002**: Identify data models to archive vs keep
- [ ] **AGENT-BE-003**: Plan API endpoint consolidation for Super Cards
- [ ] **AGENT-BE-004**: Document state management migration (Context → Zustand)
- [ ] **AGENT-BE-005**: Create caching strategy for Super Cards

### QA Test Specialist
- [ ] **AGENT-QA-001**: Audit all test files
- [ ] **AGENT-QA-002**: Identify tests to archive vs update
- [ ] **AGENT-QA-003**: Create new test plan for 5 Super Cards
- [ ] **AGENT-QA-004**: Document test coverage requirements
- [ ] **AGENT-QA-005**: Plan E2E tests for Super Card workflows

## 📊 ANALYSIS REQUIRED

### What to Keep (Active Development)
1. **Super Card Components**:
   - `/components/super-cards/` - ALL files
   - Components used IN Super Cards
   - Shared utilities and hooks
   - Theme system
   - Auth system

2. **Core Infrastructure**:
   - Supabase integration
   - PWA features
   - Cache system
   - API structure (to be consolidated)

3. **Essential Features**:
   - Tax Intelligence Engine
   - Stock price integration
   - User profile system
   - Data persistence layer

### What to Archive (Reference Only)
1. **18-Card System**:
   - Individual card components
   - Old navigation structure
   - Card-specific tests
   - Card-specific documentation

2. **Old Architecture**:
   - Multiple dashboard pages
   - Scattered state management
   - Individual API endpoints
   - Fragmented user flow

3. **Legacy PaycheckToPortfolio (P2P)**:
   - Any P2P related files
   - P2P documentation
   - P2P components
   - P2P tests
   - P2P configs

4. **Old Decision Documents**:
   - Previous architectural decisions
   - Abandoned feature specs
   - Old roadmaps
   - Superseded strategies
   - Consultant reports

5. **Deprecated Workflows**:
   - Old CI/CD configs
   - Unused GitHub workflows
   - Old deployment scripts
   - Deprecated build configs

6. **Stale Agent Communications**:
   - Old mailbox messages
   - Completed task contexts
   - Old agent memories (preserve current)
   - Outdated instructions

7. **Unused Assets**:
   - Old icons/images
   - Deprecated logos
   - Unused fonts
   - Old mockups/designs

8. **Historical Analysis**:
   - Old performance reports
   - Previous audit results
   - Superseded assessments
   - Old bug reports

9. **Experimental Features**:
   - POC implementations
   - Abandoned experiments
   - Test harnesses
   - Demo/playground code

10. **Old Dependencies**:
    - Package.json backups
    - Lock file backups
    - Deprecated dependencies docs
    - Migration guides from old versions

## 🎯 SUCCESS CRITERIA

### Archival Complete When:
- [ ] All old files moved to `/Archive/` folder
- [ ] New Super Card documentation created
- [ ] Component mapping documented
- [ ] No broken imports in active code
- [ ] Clean project structure focused on 5 Super Cards

### New Structure Ready When:
- [ ] 5 Super Card blueprints complete
- [ ] Consolidated todo list created
- [ ] Agent assignments clear
- [ ] Development can proceed on Super Cards only

## 📅 TIMELINE

### Phase 1: Analysis (Day 1)
- Sub-agents analyze their domains
- Create keep vs archive lists
- Document component mappings

### Phase 2: Archival (Day 2)
- Move files to Archive folders
- Update imports if needed
- Clean up project structure

### Phase 3: New Documentation (Day 3)
- Create Super Card blueprints
- Create new master todo
- Update orchestration workflow

### Phase 4: Validation (Day 4)
- Verify no broken code
- Test Super Card components
- Confirm clean structure

## 🚀 NEXT STEPS

1. **Assign to Sub-Agents**: Each specialist analyzes their domain
2. **Execute Archival**: Systematically move files
3. **Create New Docs**: Super Card focused documentation
4. **Update Workflow**: New orchestration for 5 cards
5. **Begin Development**: Focus only on Super Cards

---

**IMPORTANT**: This archival preserves all old work for reference while creating a clean, focused development environment for the 5 Super Card architecture.