# 🚀 Income Clarity Development Setup

## Quick Start (Choose One)

### Option 1: RLS Bypass Mode (Recommended) 
**Never worry about RLS policies again!**

1. Get your service role key from Supabase:
   - Go to: Settings → API → service_role key
   - Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key...
   ```

2. Update your imports:
   ```typescript
   // Change this:
   import { supabase } from '@/lib/supabase'
   
   // To this:
   import { supabase } from '@/lib/supabase-dev'
   ```

3. Done! RLS is completely bypassed in development.

### Option 2: One-Time RLS Setup
**If you can't use service key:**

1. Run the SQL in `rls-policies-to-apply.sql` in Supabase dashboard
2. Done forever (unless you reset your database)

## When You Need to Update RLS

| Action | Need RLS Update? | What to Do |
|--------|-----------------|------------|
| Add new column | ❌ No | Nothing |
| Change column type | ❌ No | Nothing |
| Add new table | ✅ Yes (Option 2 only) | Add one policy for new table |
| Delete table | ❌ No | Nothing |
| Add indexes | ❌ No | Nothing |
| Change constraints | ❌ No | Nothing |

## Development vs Production

```typescript
// Development (with service key)
- RLS completely bypassed
- All queries work instantly  
- No 401 errors ever
- Perfect for rapid development

// Production
- RLS fully active
- Real authentication required
- Secure user isolation
- Proper security
```

## Common Issues

**Still getting 401 errors?**
1. Make sure you're using `@/lib/supabase-dev` not `@/lib/supabase`
2. Check your service key is in `.env.local`
3. Restart Next.js dev server

**Can't get service key?**
- Use Option 2 (one-time RLS setup)
- Or ask your Supabase admin for it

## The Bottom Line

- **With service key**: Never think about RLS during development
- **Without service key**: One-time setup, then forget about it
- **Schema changes**: Almost never require RLS updates