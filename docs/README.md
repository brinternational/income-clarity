# Income Clarity Documentation Index
*Single source of truth for all documentation - Updated 2025-08-13*

## 📋 PRIMARY DOCUMENTS (Use These!)

### Core References
- **[MASTER_TODO_FINAL.md](../MASTER_TODO_FINAL.md)** - ✅ Current task list (65% complete)
- **[SUPER_CARDS_BLUEPRINT.md](../SUPER_CARDS_BLUEPRINT.md)** - Architecture reference
- **[README.md](../README.md)** - Project overview (just updated!)
- **[current_metrics.json](../../ACTIVE_TODOS/current_metrics.json)** - Live metrics (just updated!)

### Quick Start
```bash
cd income-clarity-app/
npm install
npx prisma generate
node scripts/setup-test-user.js
npm run dev

# Login: test@example.com / password123
```

## 📁 ACTIVE DOCUMENTATION

### Essential Guides (Keep Using)
- `/income-clarity-app/docs/deployment/DEPLOYMENT_GUIDE.md` - Main deployment guide
- `/income-clarity-app/docs/deployment/SSH_DEPLOYMENT_GUIDE.md` - SSH deployment
- `/docs/project-management/API_INTEGRATION_STATUS.md` - API documentation

### Development Context
- `/docs/context/*.md` - Feature-specific context files

## 🗑️ ARCHIVED (Don't Use!)

We archived 100+ outdated docs to clean up. They're in:
- `/Archive/old-todos/` - Old TODO lists
- `/Archive/old-documentation/` - Outdated docs
- `/Archive/old-deployment-docs/` - Redundant deployment guides
- `/Archive/old-status-reports/` - Old status files
- `/Archive/old-blueprints/` - Duplicate blueprints

## 📊 CURRENT STATUS: 65% Complete

### ✅ What Works
- Infrastructure: 95%
- Super Cards UI: 90%
- Database: 100%
- Authentication: 85%

### 🚧 What's Missing
- Settings Page: 0%
- Profile Page: 20%
- Onboarding: 40%
- Email Services: 0%

## 🎯 Quick Links

### For Today's Work
1. See `MASTER_TODO_FINAL.md` for tasks
2. Priority: Settings page, Profile page, Onboarding

### Test Account
- Email: test@example.com
- Password: password123

---

**Remember**: Use `MASTER_TODO_FINAL.md` as the single source of truth for tasks!