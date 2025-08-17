# 🗂️ Yodlee Integration Index
*Master index of all Yodlee/Freemium integration files and locations*
*Created: 2025-08-16*

## 📍 Quick Navigation Map

```
/income-clarity-app/
├── 📄 YODLEE_FULL_INTEGRATION_PLAN.md    # 5-week roadmap
├── 📄 YODLEE_STATUS.md                   # Current implementation status  
├── 📄 YODLEE_INTEGRATION_PROGRESS.md     # Today's progress report
├── 📄 YODLEE_INTEGRATION_INDEX.md        # THIS FILE - Master index
│
├── /lib/services/
│   ├── 📁 /subscription/                 # Tier management
│   │   ├── subscription.service.ts       # User subscription lifecycle
│   │   ├── feature-gate.service.ts       # Feature access control
│   │   └── CLAUDE.md                     # Subscription docs
│   │
│   ├── 📁 /sync/                         # Data synchronization
│   │   ├── sync-orchestrator.service.ts  # Main sync coordinator
│   │   └── CLAUDE.md                     # Sync documentation
│   │
│   └── 📁 /yodlee/                       # Yodlee integration
│       ├── yodlee-client.service.ts      # API wrapper
│       ├── yodlee-data-mapper.service.ts # Data transformation
│       ├── yodlee-sync.service.ts        # Sync management
│       └── CLAUDE.md                     # Yodlee docs
│
├── /prisma/
│   └── schema.prisma                     # Updated with DataSource enum
│
├── /scripts/
│   ├── test-yodlee-connection.js         # Yodlee auth test
│   ├── test-yodlee-fastlink.js           # FastLink test
│   └── test-subscription-system.js       # Tier system test
│
└── /components/
    └── /yodlee/                          # (Future) UI components
        ├── FastLinkConnect.tsx           # Bank linking UI
        └── ConnectedAccountsList.tsx     # Account management

```

## 🔑 Key Documentation Files

### Primary Documents
| File | Purpose | Location |
|------|---------|----------|
| **YODLEE_FULL_INTEGRATION_PLAN.md** | Complete 5-week implementation roadmap | `/income-clarity-app/` |
| **YODLEE_STATUS.md** | Current Yodlee implementation status | `/income-clarity-app/` |
| **YODLEE_INTEGRATION_PROGRESS.md** | Today's detailed progress report | `/income-clarity-app/` |
| **YODLEE_INTEGRATION_INDEX.md** | This file - master navigation | `/income-clarity-app/` |

### Service Documentation (CLAUDE.md files)
| Service | CLAUDE.md Location | Purpose |
|---------|-------------------|---------|
| **Subscription** | `/lib/services/subscription/CLAUDE.md` | Freemium tiers, feature gating, payment logic |
| **Sync** | `/lib/services/sync/CLAUDE.md` | Data synchronization patterns, rate limiting |
| **Yodlee** | `/lib/services/yodlee/CLAUDE.md` | Yodlee API integration, data flow |
| **Services (Main)** | `/lib/services/CLAUDE.md` | Overview of all services including new ones |

## 🏗️ Database Changes

### Schema Updates (in `/prisma/schema.prisma`)
```prisma
// New enum for data source tracking
enum DataSource {
  MANUAL
  YODLEE
  MERGED
}

// New models
model UserSubscription { ... }
model SyncLog { ... }

// Updated models with dataSource field
model Holding { dataSource DataSource ... }
model Income { dataSource DataSource ... }
model Expense { dataSource DataSource ... }
```

## 🧪 Test Scripts

| Script | Purpose | Run Command |
|--------|---------|-------------|
| `test-yodlee-connection.js` | Test Yodlee authentication | `node scripts/test-yodlee-connection.js` |
| `test-yodlee-fastlink.js` | Test complete FastLink flow | `node scripts/test-yodlee-fastlink.js` |
| `test-subscription-system.js` | Test tier system & features | `node scripts/test-subscription-system.js` |

## 📊 Implementation Status

### ✅ Completed (Phase 1)
- Database schema with DataSource enum
- UserSubscription model
- SyncLog tracking
- Subscription service (tier management)
- Feature gate service (access control)
- Sync orchestrator service
- All documentation

### 🚧 In Progress (Phase 2)
- Reconciliation engine
- Conflict resolution UI
- Premium UI components

### ⏳ Upcoming (Phase 3-5)
- Background job queue
- Nightly sync cron
- Webhook handlers
- Testing & launch

## 🔍 Quick Find Commands

```bash
# Find all Yodlee-related files
find . -name "*yodlee*" -o -name "*subscription*" -o -name "*sync*"

# Find all CLAUDE.md files
find . -name "CLAUDE.md"

# Search for DataSource usage
grep -r "DataSource" --include="*.ts" --include="*.tsx"

# Find sync-related code
grep -r "SyncOrchestrator\|SyncLog" --include="*.ts"

# Find subscription code
grep -r "UserSubscription\|isPremium" --include="*.ts"
```

## 🎯 Key Entry Points

### For Development
1. **Start here**: `/lib/services/CLAUDE.md` - Service overview
2. **Understand tiers**: `/lib/services/subscription/CLAUDE.md`
3. **Learn sync flow**: `/lib/services/sync/CLAUDE.md`
4. **See roadmap**: `YODLEE_FULL_INTEGRATION_PLAN.md`

### For Testing
1. **Test auth**: `node scripts/test-yodlee-connection.js`
2. **Test tiers**: `node scripts/test-subscription-system.js`
3. **Check database**: `npx prisma studio`

### For Implementation
1. **Add feature gate**: Import from `/lib/services/subscription/feature-gate.service.ts`
2. **Check premium**: Use `subscriptionService.isPremiumUser(userId)`
3. **Trigger sync**: Use `syncOrchestrator.performSync(userId, syncType)`

## 📝 Environment Variables

```env
# Yodlee Configuration
YODLEE_API_URL=https://sandbox.api.yodlee.com/ysl
YODLEE_FASTLINK_URL=https://fl4.sandbox.yodlee.com/authenticate/restserver/fastlink
YODLEE_CLIENT_ID=hIMLADvwd0f6Hmu4nuIE4WXdZRdGlrVnfhoGsVfNA19jnMVj
YODLEE_CLIENT_SECRET=[configured]
YODLEE_ADMIN_LOGIN=64258b9a-24a6-4eb8-b2b3-931ee52d16b1_ADMIN
YODLEE_TEST_USER=sbMem68a0d5bfa0b691
```

## 🚀 Next Steps Reference

1. **Build reconciliation engine** → `/lib/services/reconciliation/` (TODO)
2. **Create premium UI** → `/components/premium/` (TODO)
3. **Add background jobs** → `/scripts/cron/` (TODO)
4. **Update Super Cards** → Modify existing components for dataSource

## 📌 Important Notes

- **All new services have CLAUDE.md files** for documentation
- **Database schema is fully updated** with dual-source support
- **Test scripts verify functionality** before UI integration
- **Services are singleton instances** (e.g., `subscriptionService`, `syncOrchestrator`)

---

**Use this index to quickly find any Yodlee/Freemium integration file or documentation!**