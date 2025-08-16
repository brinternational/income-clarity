# localStorage to Supabase Migration Test Guide

## Current Status
✅ **Syntax errors fixed** - App now runs without errors
✅ **Dev server running** - http://localhost:3010
✅ **Migration UI integrated** - Banner on dashboard, controls in settings

## Test Steps

### 1. Create Test Data in Demo Mode
1. Go to http://localhost:3010
2. Click "Try Demo Account" 
3. Add some test data:
   - Add 2-3 holdings (e.g., SCHD, VTI, AAPL)
   - Add 2-3 expenses (e.g., Rent, Food, Utilities)
   - Update profile settings
4. Verify data saves (refresh page, data should persist)

### 2. Check Migration Banner
1. Look for migration banner on dashboard
2. Should show: "You have X portfolios and Y expenses saved locally"
3. Should have "Sync to Cloud" button

### 3. Test Migration Flow
1. Click "Sync to Cloud" on banner
2. Migration wizard should open:
   - Step 1: Detect data
   - Step 2: Preview what will migrate
   - Step 3: Migrate with progress bar
   - Step 4: Success confirmation

### 4. Alternative: Settings Migration
1. Go to Settings page
2. Find "Data & Sync" section
3. Should show migration status
4. Can trigger migration from here too

## Expected Results

### If Migration Works:
- Progress bar shows items migrating
- Success message appears
- Data moves from localStorage to Supabase
- Can access from any device

### Current Limitation:
- Using mock user ID (mock-user-1)
- Need real Supabase auth for production
- But migration flow should work for testing

## What to Look For

✅ **Good Signs:**
- Migration banner appears
- Wizard opens and shows data
- Progress indicators work
- No console errors

❌ **Issues:**
- Banner doesn't appear (no localStorage data?)
- Wizard crashes
- Migration fails
- Console errors

## Next Steps

1. **If migration UI works**: Configure real Supabase
2. **If issues found**: Report specific errors
3. **After Supabase setup**: Test real cloud sync