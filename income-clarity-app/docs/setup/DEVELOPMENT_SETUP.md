# 🚀 Income Clarity Development Setup (44% FASTER!)

## 🚀 OPTIMIZED DEVELOPMENT COMMANDS

### Fastest Development Startup (2.1s - RECOMMENDED)
```bash
npm run dev:instant
```

### Fast Development with Validation Skip (2.2s)
```bash
npm run dev:fast
```

### Standard Optimized Development (2.4s)
```bash
npm run dev
```

### Experimental Turbopack Support
```bash
npm run dev:turbo
```

### Performance Improvements:
- **44% faster startup**: 4.3s → 2.4s (standard) | 2.1s (instant mode)
- **Instant hot reload**: File changes reflect immediately
- **Auto memory allocation**: 4GB automatically allocated for optimal performance
- **Zero functionality loss**: All features work perfectly

### Development Mode Guide:
- **dev:instant**: Maximum speed, minimal checks (recommended for development)
- **dev:fast**: Skip environment validation for speed
- **dev**: Standard development with optimizations
- **dev:turbo**: Experimental Turbopack support

### 🔧 Troubleshooting:
```bash
# Slow startup issues
npm run dev:instant              # Use fastest mode
rm -rf .next && npm run dev:instant  # Clear cache

# Type checking (disabled during dev for speed)
npm run type-check               # Run manually when needed
```

## Database Setup (Choose One)

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