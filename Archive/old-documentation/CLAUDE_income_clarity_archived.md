# CLAUDE.md - Income Clarity Project
*AI Agent Instructions for Income Clarity Development*

---

##  PROJECT OVERVIEW

You are working on **Income Clarity**, a dividend income lifestyle management tool that helps people who live off their portfolio optimize their income and track progress toward financial independence.

### Key Context
- **Target**: Dividend income earners (current or aspiring)
- **Problem**: Existing tools like Snowball lack tax awareness and emotional validation
- **Solution**: Daily SPY validation + income clarity + milestone gamification
- **Platform**: Next.js web app (mobile responsive)
- **Differentiator**: Tax-aware calculations with location intelligence (PR advantage)

---

##  USER PSYCHOLOGY

Always consider the emotional needs of dividend income earners:

1. **Daily Validation** 
   - Need to feel their strategy is working
   - SPY comparison provides emotional fuel
   - "Beating the market" validation

2. **Income Clarity** 
   - Gross income isn't enough - need NET after taxes
   - "Above zero line" is critical emotional trigger
   - Clear view of reinvestment capacity

3. **Milestone Achievement** 
   - Gamified progress from utilities  rent  freedom
   - Visual checkmarks and progress bars
   - Celebration of covered expenses

4. **Tax Intelligence** 
   - Feel sophisticated about tax strategies
   - Location-aware recommendations (PR = 0% tax)
   - ROC vs income classification awareness

---

## 🧪 TEST USER LOGIN

**For all developers working on Income Clarity:**

### Test Account Credentials
- **Email**: `test@incomeclarity.com`
- **Password**: `TestPassword123!`
- **Name**: Test User

### Pre-loaded Test Data
The test user comes with realistic financial data:
- **Portfolio Value**: $125,000
- **Monthly Dividend Income**: $650
- **Holdings**: SCHD, VTI, VXUS, BND with realistic prices
- **Expenses**: $4,500/month across all categories
- **Tax Location**: California (high-tax scenario for testing)
- **Milestones**: 3/6 achieved (utilities, insurance, food covered)

### How to Use
1. **Login Page**: Click "Login as Test User" button
2. **Manual Entry**: Use the credentials above
3. **Recreate User**: Run `node scripts/create-test-user.js`

**Purpose**: This allows the next developer to immediately test all app features with realistic data instead of starting with empty states.

---

##  DEVELOPMENT GUIDELINES

### Tech Stack (Implemented)
```
Frontend:  Next.js 14 + React + TypeScript
Styling:   Tailwind CSS
Charts:    Custom SVG components
Backend:   Supabase (planned)
Hosting:   Vercel (planned)
```

### Code Standards
- TypeScript for all new code
- Component-based architecture
- Mobile-first responsive design
- Emotional design principles
- Clean, maintainable code

### **MANDATORY: Blueprint Updates**
- **ALWAYS update `APP_STRUCTURE_BLUEPRINT.md`** after any feature changes
- Mark completed items with ✅ 
- Add new features discovered during development
- This is our single source of truth for macro progress tracking
- Update BEFORE marking todos as complete

### **UI TESTING WORKFLOW**
After ANY UI changes (especially from UI agents):
1. **Manually check browser** - Takes 30 seconds!
   - Open browser console (F12)
   - Look for red errors
   - Verify CSS is working (colors, shadows, spacing)
2. **Common errors to catch**:
   - "Duplicate export 'default'"
   - JSX syntax errors (< and > characters)
   - CSS not loading (all gray/white)
   - Infinite loops (page freezing)
3. **If errors found** - Give back to UI agent with error message
See `UI_TESTING_CHECKLIST.md` for quick checks

### Key Files
- `app/working/page.tsx` - Current working demo with all features
- `APP_STRUCTURE_BLUEPRINT.md` - Complete feature checklist (KEEP UPDATED)
- `INCOME_CLARITY_PROJECT_CONTEXT.md` - Master requirements document
- `components/dashboard/*` - Feature components
- `lib/calculations.ts` - Financial logic
- `lib/mock-data.ts` - Demo data
- `types/index.ts` - TypeScript interfaces

---

##  CURRENT STATUS

###  Completed Features
1. **SPY Comparison Chart** - Daily portfolio validation
2. **Income Clarity Card** - Gross → Tax → Net → Available calculations
3. **Expense Milestones** - Gamified progress tracking  
4. **Holdings Performance** - Individual ETF vs SPY
5. **Tax Calculations** - PR advantage implemented
6. **Responsive Design** - Mobile-first approach
7. **User Input Forms** - Complete profile, tax, portfolio, expenses forms
8. **PWA Integration** - Install button and manifest
9. **Local Data Persistence** - All user inputs stored in React state

###  Next Priorities  
1. **Margin Intelligence** - Risk assessment and acceleration calculator
2. **Dividend Calendar** - Payment schedule and ex-dividend dates
3. **Data Persistence** - Supabase backend integration
4. **API Integrations** - Live stock prices and dividend data
5. **Advanced Analytics** - Tax optimization and performance attribution

---

##  EMOTIONAL DESIGN RULES

### Color Usage
- **Green (#10b981)**: Success, beating market, achievements
- **Blue (#3b82f6)**: Progress, positive direction
- **Orange (#f97316)**: SPY benchmark, optimization alerts
- **Red (#ef4444)**: Use sparingly, only for critical warnings

### Validation Messages
- Always positive framing when possible
- Celebrate achievements immediately
- Clear actionable insights
- Avoid fear-based messaging

### Progress Indicators
- Visual progress bars with percentages
- Checkmarks for completed milestones
- Encouraging messages for partial progress
- Clear next steps

---

##  KEY CALCULATIONS

### Income Clarity Formula
```
Gross Income (from holdings)
- Taxes (based on location & dividend type)
= Net Income
- Monthly Expenses
= Available to Reinvest (The Magic Number)
```

### Tax Treatment by Location
- **Puerto Rico**: 0% on qualified dividends
- **California**: Up to 13.3% state tax
- **Texas**: 0% state tax
- **Default**: 15% qualified, 22%+ ordinary

### Milestone Progression
1. Utilities ($200-300)
2. Insurance ($400-600)
3. Food ($600-1000)
4. Rent/Mortgage ($1000-2500)
5. Entertainment ($500-1000)
6. Full Independence (100% coverage)

---

##  SECURITY CONSIDERATIONS

- No hardcoded financial data
- Secure authentication (when implemented)
- Encrypted data storage
- No logging of sensitive information
- Input validation on all forms

---

##  DEVELOPMENT WORKFLOW

### When Starting Work
1. Review current implementation in `/income-clarity-app/`
2. Check todo list for priorities
3. Test existing features first
4. Follow emotional design principles
5. Update documentation as needed

### Testing Checklist
- [ ] All calculations correct
- [ ] Mobile responsive design
- [ ] Emotional triggers working
- [ ] No console errors
- [ ] Performance acceptable

### Before Committing
- [ ] TypeScript types correct
- [ ] Components follow patterns
- [ ] Calculations tested
- [ ] Mobile view checked
- [ ] Documentation updated

---

##  SUCCESS METRICS

Track progress against these goals:
- **Emotional**: Daily validation working
- **Functional**: All calculations accurate
- **Performance**: <2s load time
- **Design**: Mobile-first responsive
- **User Value**: Better than Snowball

---

## 🚦 ENVIRONMENT PROGRESSION

### Three-Stage Deployment Strategy

**Current Status: LITE PRODUCTION** 🧪

| Stage | Status | Database | Services | Purpose |
|-------|--------|----------|----------|----------|
| **Development** | ✅ Complete | SQLite | None | Local coding |
| **Lite Production** | 🔄 **CURRENT** | SQLite | Polygon API | Personal testing |
| **Full Production** | ⏳ Future | Supabase | All services | Public launch |

### Lite Production Details
- **URL**: https://incomeclarity.ddns.net (live now!)
- **Database**: SQLite (local file at `prisma/income_clarity.db`)
- **Cache**: In-memory (no Redis needed)
- **Auth**: Session-based (no OAuth yet)
- **External APIs**: Polygon.io only
- **Monitoring**: Console logs only
- **Cost**: $0 (except VPS hosting)

### Environment Management
```bash
# Switch environments (automatically updates .env)
./scripts/switch-env.sh local       # Development mode
./scripts/switch-env.sh lite        # Lite Production (CURRENT)
./scripts/switch-env.sh production  # Full Production (FUTURE)

# Check current environment
grep -E "NODE_ENV|LITE_PRODUCTION" .env
```

### Why Lite Production?
1. **Testing**: Real-world testing without complexity
2. **Cost**: No Supabase/Redis/monitoring costs yet
3. **Simplicity**: SQLite + local storage = easy management
4. **Speed**: Faster iteration without cloud delays
5. **Migration Path**: Easy upgrade to Full Production when ready

##  QUICK COMMANDS

```bash
# Development
cd income-clarity/income-clarity-app
npm run dev

# Type checking
npm run type-check

# Quick syntax error check (VERY USEFUL!)
npx tsc --noEmit     # Find all TypeScript/syntax errors without building

# ⚠️ IMPORTANT: NEVER use 2>&1 with any command!
# The 2>&1 redirect causes issues with npx/npm commands
# BAD:  npx tsc --noEmit 2>&1
# GOOD: npx tsc --noEmit

# Build for production
npm run build

# Run tests (when added)
npm test

# Environment switching
./scripts/switch-env.sh lite   # For testing on server
```

---

---

##  FEATURE CHECKLIST

### Core Features (MVP)
- [x] SPY Comparison Chart
- [x] Income Clarity Calculator
- [x] Expense Milestones
- [x] Holdings Performance
- [x] Tax-Aware Calculations
- [x] Mobile Responsive

### Next Phase
- [ ] User Authentication
- [ ] Data Persistence
- [ ] User Input Forms
- [ ] Margin Intelligence
- [ ] Dividend Calendar
- [ ] Historical Tracking

### Future Enhancements
- [ ] Tax Strategy Optimizer
- [ ] 19a Statement Parser
- [ ] Export for Tax Prep
- [ ] Social Comparisons
- [ ] Mobile App

---

## 🚨 CRITICAL: QUALITY-FIRST EXECUTION POLICY

### **MANDATORY FLAGS FOR ALL /sc: COMMANDS**

**ALWAYS USE THESE FLAGS:**
- `--validate` - Validate all changes before considering complete
- `--play` - Test with Playwright to verify functionality  
- `--seq` - Sequential thinking for maximum accuracy
- `--think-hard` or `--ultrathink` - Deep analysis and planning
- `--loop` - Keep fixing until perfect (no partial solutions)

**QUALITY > SPEED > TOKENS**
- Get it right the first time
- Test everything thoroughly
- Validate all changes work
- Loop until 100% resolved
- No shortcuts, no assumptions
- Fix all errors before stopping

**EXAMPLE COMMANDS (Use these patterns):**
```bash
# Bug fixes - MUST validate and test
/sc:troubleshoot "onboarding and portfolio data issues" --seq --ultrathink --validate --play --loop --persona-backend --persona-frontend

# Implementation - MUST test thoroughly  
/sc:implement "API endpoint" --seq --validate --play --c7 --loop --think-hard

# Improvements - MUST verify quality
/sc:improve "data fetching" --seq --validate --play --think-hard --loop
```

---

## 🚨 CRITICAL: FOLDER ORGANIZATION ENFORCEMENT

### **ABSOLUTE RULE: NO CRAP IN ROOT DIRECTORIES**

**ROOT DIRECTORIES MUST STAY CLEAN:**
- `/income-clarity/` - Only essential architecture files
- `/income-clarity-app/` - Only Next.js core files + README.md

### ❌ **FORBIDDEN IN ROOT** (Immediate deletion required)
```bash
# These files MUST BE DELETED or moved immediately:
*.md (except README.md in income-clarity-app)
debug-*.js, test-*.js, *-snippet-*.json, *-batch-*.txt
temp-*, tmp-*, backup-*, old-*, copy-*, draft-*
.tmp, .bak, .old, .copy, .draft files
API_*.md, SETUP_*.md, DEPLOYMENT_*.md, TESTING_*.md
*_GUIDE.md, *_INSTRUCTIONS.md, *_CHECKLIST.md
```

### ✅ **REQUIRED ORGANIZATION** (Use these folders)

#### 📚 Documentation → `/income-clarity/docs/` or `/income-clarity-app/docs/`
```bash
# Project Management & Integration
docs/project-management/API_INTEGRATION_STATUS.md
docs/project-management/PWA_INTEGRATION_COMPLETE.md
docs/project-management/GITHUB_SETUP_INSTRUCTIONS.md

# Development Context & Decisions  
docs/context/CONTEXT_BUILD_ERROR.md
docs/context/CONTEXT_NAV_FIX.md
docs/context/CONTEXT_TAX_EFFICIENCY.md

# Application Setup & Configuration
income-clarity-app/docs/setup/DEVELOPMENT_SETUP.md
income-clarity-app/docs/setup/SUPABASE_SETUP.md
income-clarity-app/docs/setup/AUTH_SETUP_GUIDE.md

# Deployment & Production
income-clarity-app/docs/deployment/DEPLOYMENT_GUIDE.md
income-clarity-app/docs/deployment/PRODUCTION_CHECKLIST.md
income-clarity-app/docs/deployment/SSH_DEPLOYMENT_GUIDE.md

# Testing & Quality Assurance
income-clarity-app/docs/testing/SUPABASE_TEST_RESULTS.md
income-clarity-app/docs/testing/E2E_TEST_RESULTS.md

# Development Resources
income-clarity-app/docs/development/PERFORMANCE_ANALYSIS.md
income-clarity-app/docs/development/THEMES.md

# Technical Reports
income-clarity-app/docs/reports/CONNECTIVITY_ISSUES_RESOLVED.md
income-clarity-app/docs/reports/SUPER_CARDS_LOADING_FIX.md

# Feature & Integration Guides
income-clarity-app/docs/guides/WEB_SHARE_VERIFICATION.md
income-clarity-app/docs/guides/BACKUP_STRATEGY.md
```

#### 🔧 Scripts → `/income-clarity-app/scripts/`
```bash
scripts/build.js                 # Build automation
scripts/deploy.sh                # Deployment scripts  
scripts/test-polygon.js          # API testing
scripts/cleanup.sh               # File cleanup automation
scripts/temp/                    # Temporary files (DELETE after use)
```

#### 🗃️ Archives → `/income-clarity/Archive/`
```bash
Archive/old-documentation/       # Deprecated docs
Archive/legacy-components/       # Old code
Archive/migration-logs/          # Migration history
```

### **ENFORCEMENT ACTIONS** (Execute immediately when found)

#### 🧹 Auto-Cleanup Commands
```bash
# Run BEFORE any development session:
cd /income-clarity/
find . -maxdepth 1 -name "*.md" ! -name "CLAUDE.md" ! -name "SUPER_CARDS_*.md" ! -name "SC_*.md" ! -name "ARCHIVE_*.md" -delete
find . -maxdepth 1 -name "debug-*" -delete
find . -maxdepth 1 -name "test-*" -delete  
find . -maxdepth 1 -name "*-snippet-*" -delete
find . -maxdepth 1 -name "*-batch-*" -delete
find . -maxdepth 1 -name "*.tmp" -delete

cd income-clarity-app/
find . -maxdepth 1 -name "*.md" ! -name "README.md" -delete
find . -maxdepth 1 -name "debug-*" -delete
find . -maxdepth 1 -name "test-*" -delete
find . -maxdepth 1 -name "*-snippet-*" -delete
find . -maxdepth 1 -name "*-batch-*" -delete
find . -maxdepth 1 -name "*.tmp" -delete
```

#### 📂 File Migration Commands (When files found in wrong location)
```bash
# Move documentation to proper folders:
mkdir -p docs/setup docs/deployment docs/testing docs/development docs/reports docs/guides docs/project-management docs/context

# Example migrations:
mv SUPABASE_SETUP.md docs/setup/
mv DEPLOYMENT_GUIDE.md docs/deployment/
mv API_INTEGRATION_STATUS.md docs/project-management/
mv CONTEXT_*.md docs/context/
```

### **AGENT BEHAVIOR RULES**

#### 🚨 **When Creating Files** (MANDATORY)
1. **Never create in root** - Always use appropriate subfolder
2. **Check organization** - Verify docs/ structure exists first
3. **Use descriptive paths** - Clear categorization required
4. **Create directories** - mkdir -p as needed

#### 🔍 **When Finding Misplaced Files** (IMMEDIATE ACTION)
1. **STOP current task** - Address organization first
2. **Move files immediately** - Use mv commands to proper location
3. **Update references** - Fix any broken links
4. **Document migration** - Note in session summary

#### 📝 **When Editing Documentation** (REQUIRED PROCESS)
1. **Check current location** - Is file in proper folder?
2. **Move if wrong** - Relocate before editing
3. **Update index** - Ensure docs/README.md reflects changes
4. **Cross-reference** - Verify links still work

### **FILE NAMING CONVENTIONS** (ENFORCE)

#### ✅ **Approved Patterns**
```bash
# Setup & Configuration
*_SETUP.md, *_SETUP_GUIDE.md, *_CONFIGURATION.md

# Development & Implementation  
*_IMPLEMENTATION.md, *_DEVELOPMENT.md, *_GUIDE.md

# Testing & Quality
*_TEST_RESULTS.md, *_TESTING_GUIDE.md, *_CHECKLIST.md

# Deployment & Production
*_DEPLOYMENT.md, *_DEPLOYMENT_GUIDE.md, *_PRODUCTION_*.md

# Context & Decisions
CONTEXT_*.md, DECISION_*.md, ANALYSIS_*.md

# Reports & Status
*_REPORT.md, *_STATUS.md, *_SUMMARY.md, *_COMPLETE.md
```

#### ❌ **Forbidden Patterns** (DELETE or rename)
```bash
# Temporary patterns (DELETE immediately)
debug-*.*, test-*.*, temp-*.*, tmp-*.*
*-snippet-*.*, *-batch-*.*, draft-*.*

# Vague patterns (RENAME with context)
README_*.md, NOTES.md, TODO.md, TEMP.md, OLD.md
FILE.md, DOCUMENT.md, CONTENT.md
```

### **DIRECTORY STRUCTURE VALIDATION**

#### 🎯 **Required Structure** (Create if missing)
```bash
income-clarity/
├── docs/
│   ├── project-management/    # Status, integrations, planning
│   ├── context/              # Development context & decisions
│   ├── testing-reports/      # QA and testing documentation
│   └── archive/              # Historical documentation
└── income-clarity-app/
    └── docs/
        ├── setup/            # Installation & configuration
        ├── deployment/       # Production deployment
        ├── testing/          # Testing documentation
        ├── development/      # Development resources
        ├── reports/          # Technical reports
        ├── guides/           # Feature & integration guides
        └── architecture/     # System architecture
```

#### 🔍 **Validation Commands** (Run regularly)
```bash
# Check for misplaced files
find /income-clarity/ -maxdepth 1 -name "*.md" ! -name "CLAUDE.md" ! -name "SUPER_CARDS_*.md" ! -name "SC_*.md" ! -name "ARCHIVE_*.md"
find /income-clarity-app/ -maxdepth 1 -name "*.md" ! -name "README.md"

# Check for temporary files  
find . -name "debug-*" -o -name "test-*" -o -name "*-snippet-*" -o -name "*-batch-*" -o -name "*.tmp"

# Verify directory structure
ls -la income-clarity/docs/
ls -la income-clarity-app/docs/
```

---

## 🚨 CRITICAL PORT MANAGEMENT RULE

**ALWAYS USE PORT 3000 FOR DEVELOPMENT** 
- This is the default Next.js port - DO NOT change it
- NEVER use ports 3001-3005 or custom PORT environment variables
- If port 3000 is busy, KILL the existing process first:

### ⚠️ CRITICAL WARNING: NEVER USE taskkill /F /IM node.exe
**This kills ALL Node processes system-wide and can crash other applications!**

### ✅ CORRECT Port Management:
```bash
# Windows - Find and kill ONLY the process on port 3000:
netstat -ano | findstr :3000      # Find the PID in the last column
taskkill /PID [process_id] /F     # Kill ONLY that specific process

# PowerShell alternative:
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess
Stop-Process -Id [process_id] -Force

# Then start fresh:
npm run dev  # Uses port 3000 by default
```

### ❌ FORBIDDEN Commands:
```bash
taskkill /F /IM node.exe          # NEVER! Kills ALL Node processes
taskkill /F /IM node*              # NEVER! Too broad
```

---

## 🎯 **FINAL DIRECTIVE: ENFORCE ORGANIZATION**

### **EVERY AGENT MUST** (No exceptions)

#### 🔍 **On Session Start**
```bash
1. Check root directories for misplaced files
2. Move any .md files (except essential ones) to docs/
3. Delete any debug-*, test-*, *-snippet-*, temp-* files
4. Verify docs/ structure exists and is organized
5. Report cleanup actions taken
```

#### 📝 **Before Creating Files**
```bash
1. NEVER create files in root directories
2. Always use organized docs/ subfolder structure
3. Create directories with mkdir -p as needed
4. Choose descriptive file names with context
5. Update documentation index (docs/README.md)
```

#### 🧹 **Before Ending Session** 
```bash
1. Run cleanup commands to remove temp files
2. Verify no misplaced files in root directories  
3. Check that all documentation is properly organized
4. Update session notes with organization status
5. Leave project cleaner than you found it
```

### **ZERO TOLERANCE POLICY**

**Any agent that leaves files in root directories (other than essential ones) has FAILED their basic responsibility.**

**Any agent that creates debug files, test files, or temporary files without cleaning them up has VIOLATED project standards.**

**Keep it clean. Keep it organized. No exceptions.**

---

##  REMEMBER

1. **Emotional First**: Every feature should create positive emotions
2. **Income Clarity**: The core value prop - show NET income
3. **Tax Awareness**: Location matters enormously
4. **Milestone Gamification**: Progress drives engagement
5. **Daily Validation**: SPY comparison is emotional fuel
6. **PORT 3000 ONLY**: Never use other ports for development

---

*Building the tool that makes dividend income lifestyle emotionally rewarding and financially optimized!* 