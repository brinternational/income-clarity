# Supabase Activation Guide for Income Clarity

## Current Status: 95% Complete! 
The app has full Supabase integration built - it just needs YOUR credentials to activate.

## Step 1: Create Supabase Account (5 minutes)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Email
4. Create a new project:
   - Project name: `income-clarity`
   - Database password: (save this!)
   - Region: Choose closest to you

## Step 2: Get Your Credentials (2 minutes)
1. In Supabase dashboard, go to Settings → API
2. Copy these values:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: `eyJhbGciOiJ...`

## Step 3: Add to Environment (1 minute)
1. Open `/income-clarity/income-clarity-app/.env.local`
2. Add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

## Step 4: Run Database Setup (3 minutes)
1. In Supabase dashboard, click SQL Editor
2. Open `/income-clarity/income-clarity-app/supabase/schema.sql`
3. Copy the entire contents
4. Paste into SQL Editor and click "Run"
5. You should see tables created: users, profiles, holdings, expenses

## Step 5: Test It Works (2 minutes)
1. Restart your Next.js server (Ctrl+C, then npm run dev)
2. Go to http://localhost:3000/auth/simple-login
3. Click "Sign Up" instead of "Start Demo"
4. Create an account and verify data saves!

## What You Get:
- ✅ User authentication (signup/login/logout)
- ✅ Data persistence across sessions
- ✅ Secure row-level security
- ✅ Real-time updates (if needed)
- ✅ Professional production database

## Total Time: ~15 minutes

## Already Built For You:
- Database schema (tables, relationships)
- Row Level Security policies
- Auth flow (signup/login)
- Data models and types
- Client initialization
- Error handling

You literally just need to add the two environment variables and run the schema!