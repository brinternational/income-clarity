# Supabase Setup Steps - Quick Guide

## 1. Create Supabase Account & Project (5 minutes)

### Step 1: Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### Step 2: Create New Project
1. Click "New project"
2. Fill in:
   - **Project name**: `income-clarity` (or any name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., East US)
3. Click "Create new project"
4. Wait ~2 minutes for setup

## 2. Get Your API Keys (1 minute)

Once project is created:
1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long string)
   - **service_role secret**: `eyJhbGc...` (different long string)

## 3. Add to Your App (2 minutes)

### Create .env.local file:
```bash
cd income-clarity/income-clarity-app
cp .env.local.example .env.local
```

### Edit .env.local:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 4. Run Database Setup (3 minutes)

### Option A: Using Supabase Dashboard (Easier)
1. In Supabase Dashboard, click **SQL Editor**
2. Click "New query"
3. Copy ALL contents from: `/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Create another query
6. Copy ALL contents from: `/migrations/002_rls_policies.sql`
7. Paste and click "Run"

### Option B: Using Script (If Available)
```bash
npm run supabase:init
```

## 5. Enable Authentication (2 minutes)

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Under **Email**, set:
   - Enable email confirmations: **OFF** (for testing)
   - Minimum password length: **6**

## 6. Test Your Setup (1 minute)

```bash
# Restart your app
npm run dev

# Visit http://localhost:3000
# Try creating a real account (not demo)
```

## Total Time: ~15 minutes

## What You'll Have:
- ✅ Real user accounts
- ✅ Data saved in cloud
- ✅ Access from any device
- ✅ Automatic backups
- ✅ Production-ready database

## Common Issues:

### "Invalid API key"
- Double-check you copied the keys correctly
- Make sure no extra spaces
- Restart dev server after changing .env.local

### "Table does not exist"
- Run the migration SQL files
- Check for errors in SQL editor

### "Permission denied"
- Make sure you ran 002_rls_policies.sql
- Check Authentication is enabled

## Next Steps:
1. Create account in your app
2. Test data migration from localStorage
3. Deploy to Vercel!

---

That's it! Your app will now save data to the cloud instead of just localStorage.