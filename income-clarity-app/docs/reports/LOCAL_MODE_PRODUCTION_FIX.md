# 🚨 CRITICAL: LOCAL_MODE Production Server Fix

## Issue Summary
Production server at **http://137.184.142.42:3000** is showing orange "Local Mode" banner when it should be disabled for production deployment.

## Root Cause
The production server has `LOCAL_MODE=true` or `NEXT_PUBLIC_LOCAL_MODE=true` environment variables set, causing the application to run in offline mock mode instead of using real authentication and data.

## Immediate Fix Required

### Step 1: Connect to Production Server
```bash
# SSH into the production server
ssh your-user@137.184.142.42
```

### Step 2: Navigate to App Directory
```bash
# Navigate to the application directory (adjust path as needed)
cd /var/www/income-clarity
# or
cd /path/to/your/income-clarity-app
```

### Step 3: Fix Environment Variables
```bash
# Option A: Edit .env.production file if it exists
nano .env.production

# OR Option B: Edit .env.local file if used
nano .env.local

# Ensure these lines are set to false:
LOCAL_MODE=false
NEXT_PUBLIC_LOCAL_MODE=false
```

### Step 4: Restart Application
```bash
# If using PM2
pm2 restart income-clarity
pm2 logs income-clarity

# OR if using npm directly
npm run build
npm start

# OR if using systemd service
sudo systemctl restart income-clarity
sudo systemctl status income-clarity
```

### Step 5: Verify Fix
1. Visit http://137.184.142.42:3000
2. Confirm orange "Local Mode" banner is gone
3. Test authentication flow works correctly
4. Verify real data is loaded (not mock data)

## Environment Variable Check

### Correct Production Configuration:
```env
# PRODUCTION ENVIRONMENT - .env.production
NODE_ENV=production
LOCAL_MODE=false
NEXT_PUBLIC_LOCAL_MODE=false

# Real Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_real_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_real_service_role_key

# Real API Keys
POLYGON_API_KEY=your_real_polygon_api_key
```

### Incorrect Configuration (NEVER use in production):
```env
# ❌ DO NOT USE IN PRODUCTION
LOCAL_MODE=true
NEXT_PUBLIC_LOCAL_MODE=true
```

## Technical Details

### How LOCAL_MODE Works
1. **Environment Check**: `lib/config/local-mode.ts` checks:
   - `process.env.LOCAL_MODE === 'true'`
   - `process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'`
   - OR hostname is `localhost` or `127.0.0.1`

2. **Banner Display**: `components/dev/LocalModeIndicator.tsx` shows orange banner when:
   - `LocalModeUtils.isEnabled()` returns `true`
   - Even in production, if LOCAL_MODE env vars are true

3. **Override Behavior**: `DevOnlyLocalModeIndicator` in `app/layout.tsx`:
   - Should only show in development (`NODE_ENV !== 'development'`)
   - BUT LOCAL_MODE env vars override this check

### Files Updated
- ✅ `.env.production` - Added explicit `LOCAL_MODE=false`
- ✅ `.env.production.example` - Added LOCAL_MODE configuration template

## Prevention for Future Deployments

### 1. Environment Variable Validation
Always verify these variables before deployment:
```bash
# Check environment variables
grep -E "(LOCAL_MODE|NEXT_PUBLIC_LOCAL_MODE)" .env*
```

### 2. Deployment Script Enhancement
The SSH deployment script (`scripts/ssh-deploy.sh`) creates environment files from templates. Ensure production templates explicitly set `LOCAL_MODE=false`.

### 3. Pre-deployment Checklist
- [ ] `LOCAL_MODE=false` in production environment
- [ ] `NEXT_PUBLIC_LOCAL_MODE=false` in production environment  
- [ ] Real Supabase URLs and keys configured
- [ ] Real API keys configured
- [ ] No `.env.local` file in production (should be `.env.production`)

## Testing Commands

### Environment Variable Check
```bash
# On production server
echo "LOCAL_MODE: $LOCAL_MODE"
echo "NEXT_PUBLIC_LOCAL_MODE: $NEXT_PUBLIC_LOCAL_MODE"
echo "NODE_ENV: $NODE_ENV"
```

### Application Health Check
```bash
# Test health endpoint
curl http://137.184.142.42:3000/api/health

# Test homepage
curl -I http://137.184.142.42:3000/
```

### PM2 Status Check
```bash
# Check PM2 status
pm2 status
pm2 logs income-clarity --lines 50
```

## Cross-Origin Request Issue
The cross-origin warning from `137.184.142.42` is related but separate:
- `next.config.mjs` already includes `http://137.184.142.42:*` in `allowedDevOrigins`
- This is a development warning and won't affect production functionality
- Fix by ensuring production uses proper domain name instead of IP

## Post-Fix Validation

### ✅ Success Indicators:
- No orange "Local Mode" banner visible
- Real authentication prompts appear
- Database connections work (not using mock data)
- Console shows real Supabase client creation (not mock client)

### ❌ Still Broken Indicators:
- Orange banner still visible
- Console shows "LOCAL_MODE: Using pure offline mock client"
- Mock user data displayed (Demo User, Puerto Rico, 0% tax)
- Authentication bypassed

## Emergency Contact
If fix doesn't work immediately, check:
1. Application restart completed successfully
2. Environment file permissions are correct
3. No other `.env*` files overriding settings
4. PM2 process reloaded the environment variables

**Priority: CRITICAL - Production server must not run in LOCAL_MODE**