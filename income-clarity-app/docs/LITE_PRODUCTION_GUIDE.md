# Lite Production Guide
*Personal Testing Environment for Income Clarity*

## 📋 Overview

**Lite Production** is a simplified production-like environment designed for personal testing and development. It uses SQLite instead of Supabase and runs with minimal external dependencies.

## 🎯 Purpose

- **Personal Testing**: Test features in a production-like environment
- **No External Dependencies**: Uses SQLite and local storage
- **Simplified Setup**: No Supabase, Redis, or monitoring services needed
- **Cost-Effective**: No cloud service costs
- **Quick Deployment**: Fast iteration without complex infrastructure

## 🏗️ Architecture

```
Lite Production Stack:
├── Database: SQLite (local file)
├── Cache: In-memory
├── Storage: Local filesystem
├── Auth: Session-based (no OAuth)
├── API: Polygon.io (stock prices only)
└── Monitoring: None (logs only)
```

## 🚀 Quick Start

**IMPORTANT**: Use the custom server for reliable startup:
```bash
node custom-server.js
```

### 1. Switch to Lite Production Environment
```bash
./scripts/switch-env.sh lite
```

### 2. Generate Prisma Client for SQLite
```bash
npx prisma generate
npx prisma db push
```

### 3. Build the Application
```bash
npm run fix:build
```

### 4. Start the Server
```bash
# For development testing
npm run dev:safe

# For production-like testing
npm run start
```

## 🔧 Configuration

### Environment Variables (.env.lite-production)
- `LITE_PRODUCTION_MODE=true` - Enables Lite Production mode
- `LOCAL_MODE=true` - Uses local storage and SQLite
- `SUPPRESS_ENV_WARNINGS=true` - Suppresses middleware warnings
- `DATABASE_URL=file:./prisma/income_clarity.db` - SQLite database

### Key Differences from Full Production
| Feature | Lite Production | Full Production |
|---------|----------------|-----------------|
| Database | SQLite | Supabase PostgreSQL |
| Cache | In-memory | Redis/Upstash |
| Auth | Session-based | Supabase Auth + OAuth |
| Storage | Local files | Supabase Storage |
| Deployment | Single server | Vercel Edge |

## 🛠️ Common Tasks

### View Logs
```bash
# If running in terminal
# Logs appear directly in console

# If running as systemd service
sudo journalctl -u income-clarity -f
```

### Reset Database
```bash
rm prisma/income_clarity.db
npx prisma db push
```

### Switch Back to Local Development
```bash
./scripts/switch-env.sh local
npm run dev:safe
```

### Upgrade to Full Production
```bash
# 1. Configure Supabase credentials in .env.production
# 2. Switch environment
./scripts/switch-env.sh production
# 3. Run migrations
npx prisma migrate deploy
# 4. Deploy to Vercel
vercel --prod
```

## 📊 Feature Availability

### ✅ Available in Lite Production
- All core Income Clarity features
- SPY comparison
- Income calculations
- Tax intelligence
- Expense tracking
- Portfolio management
- PWA functionality
- Offline mode

### ⏸️ Not Available (Planned for Full Production)
- Multi-user support
- Real-time collaboration
- Cloud backup
- OAuth login (Google, GitHub)
- Advanced monitoring
- Edge caching
- Global CDN

## 🔍 Troubleshooting

### Middleware Warnings
If you see warnings about NODE_ENV or Supabase:
- These are suppressed in Lite Production
- Check that `SUPPRESS_ENV_WARNINGS=true` is set
- Verify `LITE_PRODUCTION_MODE=true` is set

### Database Issues
```bash
# Check if database exists
ls -la prisma/income_clarity.db

# Recreate database
rm prisma/income_clarity.db
npx prisma db push
```

### Build Issues
```bash
# Clean build
npm run clean
npx prisma generate
npm run build
```

### Port Conflicts
```bash
# Check port 3000
npm run port:status

# Kill process on port 3000
npm run port:kill
```

## 📈 Migration Path

### From Lite to Full Production

1. **Setup Supabase**
   - Create Supabase project
   - Get connection strings and API keys
   - Update .env.production

2. **Migrate Data**
   ```bash
   # Export from SQLite
   npx prisma db pull
   
   # Import to Supabase
   npx prisma migrate deploy
   ```

3. **Enable Services**
   - Configure Redis cache
   - Enable OAuth providers

4. **Deploy**
   ```bash
   vercel --prod
   ```

## 🎯 Best Practices

1. **Regular Backups**: Copy `prisma/income_clarity.db` periodically
2. **Test Features**: Use Lite Production for feature validation
3. **Monitor Logs**: Check console output for issues
4. **Clean Builds**: Run `npm run fix:build` for clean deployments
5. **Document Changes**: Update this guide when configuration changes

## 📝 Notes

- Lite Production is perfect for personal use and testing
- No cloud costs or external dependencies (except Polygon API)
- Can run indefinitely on a small VPS or local machine
- Easy to upgrade to Full Production when ready

---

*Last Updated: [Current Date]*
*Version: 1.0.0*