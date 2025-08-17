# Scripts Directory

## 🚀 NEW YODLEE TEST SCRIPTS (2025-08-16)

### Subscription & Tier Testing
- **test-subscription-system.js** - Tests user tier system (FREE/PREMIUM/ENTERPRISE)
  ```bash
  node scripts/test-subscription-system.js
  ```
  Tests: User upgrades, feature access, resource limits, sync logging, data sources

### Yodlee Integration Testing  
- **test-yodlee-connection.js** - Tests Yodlee authentication
  ```bash
  node scripts/test-yodlee-connection.js
  ```
  
- **test-yodlee-fastlink.js** - Tests complete FastLink flow & account retrieval
  ```bash
  node scripts/test-yodlee-fastlink.js
  ```

## Core Setup Scripts

### User & Data Management
- **setup-test-user.js** - Creates test user account (test@example.com / password123)
- **seed-demo-data.js** - Seeds realistic portfolio data with 8-10 dividend stocks
- **backup-database.js** - Creates database backups

### Testing & Validation
- **test-polygon-integration.js** - Tests Polygon API for market data
- **verify-environment.js** - Checks environment configuration
- **test-super-cards.js** - Tests Super Cards data services

### Server Management
- **kill-port-3000.sh** - Clears port conflicts
- **meta-startup-check.sh** - Loads context and system health on startup
- **meta-context-health-check.sh** - Verifies all context files exist

## Quick Commands

```bash
# Setup & Initialize
npm run setup:test-user      # Create test account
npm run seed:demo            # Add demo portfolio data

# Testing
npm run test:subscription    # Test tier system
npm run test:yodlee         # Test Yodlee connection
npm run test:polygon        # Test market data API

# Server Management  
npm run port:kill           # Kill port 3000
npm run server:prod         # Start production server

# Database
npm run db:backup          # Backup database
npx prisma studio          # Visual database browser
```

## Environment Requirements

Required `.env` variables:
```env
# Database
DATABASE_URL="file:./prisma/income_clarity.db"

# Yodlee (Sandbox)
YODLEE_API_URL=https://sandbox.api.yodlee.com/ysl
YODLEE_CLIENT_ID=[your-client-id]
YODLEE_CLIENT_SECRET=[your-secret]
YODLEE_ADMIN_LOGIN=[admin-login]

# Market Data
POLYGON_API_KEY=[your-key]

# Email (Optional)
SENDGRID_API_KEY=[your-key]
```

## Troubleshooting

### Port Already in Use
```bash
./scripts/kill-port-3000.sh
# or
npm run port:kill
```

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset

# View database
npx prisma studio
```

### Test User Issues
```bash
# Recreate test user
node scripts/setup-test-user.js

# Verify login
# Email: test@example.com
# Password: password123
```

---

**Note**: All scripts assume you're in `/income-clarity-app/` directory