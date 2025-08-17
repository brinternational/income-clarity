# 🧪 Yodlee Integration Testing Guide
*Complete guide for testing the freemium platform with Yodlee integration*

## ✅ Current Status

### Test User Ready
- **Email**: test@example.com  
- **Password**: password123
- **Status**: PREMIUM (14-day trial)
- **Features**: All 8 premium features unlocked
- **Server**: Running at http://localhost:3000

## 📋 Step-by-Step Testing Process

### Step 1: Login & Verify Premium Status

1. **Navigate to**: http://localhost:3000
2. **Login with**: test@example.com / password123
3. **Verify you see**:
   - ✅ Premium badge in header
   - ✅ Sync status indicator
   - ✅ Trial countdown (14 days remaining)
   - ✅ "Bank Connections" in Settings menu

### Step 2: Connect Bank Account (Yodlee)

1. **Navigate to**: Settings → Bank Connections
2. **Click**: "Connect Bank Account" button
3. **In FastLink popup, enter**:
   ```
   Provider: Dag Site
   Username: YodTest.site16441.2
   Password: site16441.2
   ```
4. **Expected Result**:
   - 3 accounts should be linked:
     - Checking: $44.78
     - Savings: $9,044.78
     - Credit Card: $1,636.44

### Step 3: Test Data Synchronization

1. **Manual Sync**:
   - Click "Sync Now" button in header
   - Should see loading animation
   - Rate limited to once per hour
   - Check sync status indicator updates

2. **View Sync Results**:
   - Go to Super Cards
   - Look for data source badges:
     - 🏦 = Yodlee data
     - ✋ = Manual entry
     - 🔄 = Merged data

3. **Check Freshness Indicators**:
   - 🟢 Green = <24 hours old
   - 🟡 Yellow = 1-7 days old
   - 🔴 Red = >7 days old

### Step 4: Test Premium Features

#### A. Pricing Page (`/pricing`)
- [ ] Three-tier pricing cards display correctly
- [ ] Monthly/Annual toggle works
- [ ] Current plan (PREMIUM) is highlighted
- [ ] "Current Plan" button shows for PREMIUM tier

#### B. Billing Management (`/settings/billing`)
- [ ] Shows current subscription (PREMIUM TRIAL)
- [ ] Trial end date displays correctly
- [ ] Payment methods section visible
- [ ] Invoice history section present
- [ ] Cancel subscription option available

#### C. Admin Monitoring (`/admin/monitoring`)
- [ ] System health dashboard loads
- [ ] Active alerts display
- [ ] Error logs visible
- [ ] Metrics charts render

#### D. Super Cards with Data Sources
- [ ] All 5 Super Cards load
- [ ] Data source badges appear on holdings
- [ ] Sync status shows in header
- [ ] Freshness indicators visible

### Step 5: Test Data Reconciliation

1. **Add Manual Holding**:
   - Go to Portfolio page
   - Add a holding manually (e.g., AAPL, 100 shares)

2. **Trigger Sync**:
   - If Yodlee has same ticker, reconciliation prompt appears
   - Choose between:
     - Keep Manual
     - Replace with Yodlee
     - Merge Quantities

3. **Verify Result**:
   - Check data source badge updates
   - Verify quantities are correct
   - Confirm reconciliation logged

### Step 6: Test API Endpoints

```bash
# Health Check
curl http://localhost:3000/api/health

# Detailed Health (includes dependencies)
curl http://localhost:3000/api/health/detailed

# Sync Status (need auth cookie)
curl http://localhost:3000/api/sync/status \
  -H "Cookie: [get-from-browser-devtools]"

# Manual Sync Trigger (need auth cookie)
curl -X POST http://localhost:3000/api/sync/manual \
  -H "Cookie: [get-from-browser-devtools]"
```

### Step 7: Test Error Handling

1. **Rate Limiting**:
   - Try manual sync twice within an hour
   - Should see rate limit error message

2. **Error Boundaries**:
   - Components should gracefully handle errors
   - Error messages should be user-friendly

3. **Fallback States**:
   - Disconnect internet briefly
   - App should show cached data

## 🔍 What to Look For

### ✅ Visual Indicators

**Premium User Indicators**:
- Premium badge in navigation
- Sync status in header
- Bank Connections in Settings
- No upgrade prompts on premium features

**Data Source Badges**:
- Manual entries show ✋ icon
- Yodlee synced data shows 🏦 icon
- Merged data shows 🔄 icon

**Sync Status**:
- Last sync time displayed
- Next sync countdown (if scheduled)
- Sync in progress animation
- Error states clearly shown

### ⚠️ Common Issues & Solutions

**Issue**: "Bank Connections" not visible in Settings
**Solution**: Ensure user is premium (run `node scripts/onboard-premium-user.js`)

**Issue**: FastLink doesn't open
**Solution**: Check browser console for errors, ensure popup blocker disabled

**Issue**: Sync fails with rate limit
**Solution**: Wait 1 hour between manual syncs (or check rate limit in response)

**Issue**: No data source badges showing
**Solution**: Verify holdings exist and have dataSource field in database

## 📊 Database Verification

Open Prisma Studio to verify data:
```bash
npx prisma studio
```

Check these tables:
1. **User**: isPremium = true
2. **UserSubscription**: plan = PREMIUM, status = TRIAL
3. **SyncLog**: Recent sync attempts logged
4. **Holding**: dataSource field populated (MANUAL/YODLEE/MERGED)

## 🎯 Success Criteria

The integration is working correctly if:
- ✅ User can login and see premium status
- ✅ Bank Connection option appears in Settings
- ✅ Yodlee FastLink opens and accepts test credentials
- ✅ Sync operations complete successfully
- ✅ Data source badges appear throughout UI
- ✅ Rate limiting prevents excessive API calls
- ✅ Reconciliation handles duplicate data
- ✅ Health checks return positive status
- ✅ Error handling gracefully manages failures

## 🚀 Advanced Testing

### Load Testing
```bash
# Run multiple syncs with different users
node scripts/load-test-sync.js
```

### Performance Monitoring
- Check `/admin/monitoring` for:
  - API response times
  - Sync success rates
  - Error frequencies
  - Queue depths

### Background Jobs
```bash
# Start worker to process background jobs
node scripts/worker.js --queue=sync
```

## 📝 Reporting Issues

If you encounter issues:
1. Check browser console for errors
2. Check server logs in terminal
3. Verify database state in Prisma Studio
4. Check health endpoints for system status
5. Review sync logs in database

---

**Happy Testing! The freemium platform with Yodlee integration is ready for comprehensive testing.** 🎉