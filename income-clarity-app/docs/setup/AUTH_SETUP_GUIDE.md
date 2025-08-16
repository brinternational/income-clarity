# 🚀 Auth Setup Guide

## Current Status ✅

- ✅ **Supabase Connected**: Real credentials configured
- ✅ **Database Tables**: Users table exists and accessible
- ✅ **Auth Service**: Updated to work with existing tables
- ❌ **Auth Trigger**: Broken trigger preventing signup

## The Issue 🐛

The database has a trigger `on_auth_user_created` that runs when users sign up via `auth.signUp()`. This trigger tries to create records in `profiles` and `user_settings` tables, but these tables don't exist, causing signup to fail with "Database error saving new user".

## Solution Options 🛠️

### Option A: Quick Fix (Recommended for immediate testing)

**What it does**: Removes the broken trigger so auth.signUp() works

**Steps**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `qvvznwotcmnjcbwygxnc`
3. Go to **SQL Editor**
4. Run this SQL:
```sql
-- Remove the broken trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
```
5. Test signup by running: `npm run test:auth`

**Pros**: ✅ Quick, gets auth working immediately
**Cons**: ⚠️ Users won't have profiles created automatically

### Option B: Full Migration (Recommended for production)

**What it does**: Applies the complete database schema with proper tables

**Steps**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) 
2. Select your project: `qvvznwotcmnjcbwygxnc`
3. Go to **SQL Editor**
4. Copy **ALL** content from `migrations/001_initial_schema.sql`
5. Paste and run the entire migration
6. Test signup by running: `npm run test:auth`

**Pros**: ✅ Proper database structure, automatic profile creation
**Cons**: ⚠️ More complex, might have conflicts with existing data

## Testing Instructions 🧪

After applying either fix:

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Test authentication**:
   ```bash
   node scripts/test-auth-final.js
   ```

3. **Manual test**:
   - Go to `http://localhost:3000/auth/signup`
   - Create an account with a real email
   - Check if signup succeeds
   - Try logging in

4. **Verify in Supabase Dashboard**:
   - Go to Authentication → Users
   - See if your new user appears

## Current App Status 📱

- **Auth System**: ✅ Ready (will work after trigger fix)
- **Database**: ✅ Users table working
- **Frontend**: ✅ Login/signup pages exist
- **Real vs Demo**: ✅ Prioritizes real auth over demo

## Files Updated 📝

- `lib/api/auth.service.ts` - Updated to use existing `users` table
- `hooks/useAuth.ts` - Prioritizes real Supabase auth
- `lib/database.types.ts` - Supports both users and profiles tables

## Next Steps After Auth Works 🚀

1. **Test the login flow** - Create account, login, logout
2. **Test the app features** - Dashboard, portfolio, etc.
3. **Apply proper migration** - If you used Quick Fix, consider Full Migration later
4. **Production setup** - Add proper email templates, SMTP, etc.

---

**Need Help?** 
- Check the test output from `node scripts/test-auth-final.js`
- Look at Supabase Dashboard → Authentication → Users
- Check browser console for errors on auth pages