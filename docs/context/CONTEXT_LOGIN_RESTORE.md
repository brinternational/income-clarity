# Login Page Restoration Context

## Current Issue
Users cannot see the login page with "Try Demo Account" button because LOCAL_MODE=true bypasses it entirely.

## Current Flow (BROKEN)
1. User visits `/` 
2. LOCAL_MODE=true detected
3. Auto-redirect to `/super-cards`
4. Login page never shown

## Desired Flow
1. User visits `/`
2. Show login page (even in LOCAL_MODE)
3. User clicks "Try Demo Account" 
4. Redirect to Super Cards dashboard
5. OR user can use real login credentials

## Files to Modify

### 1. `/app/page.tsx`
Change from auto-redirect to showing login page:
```typescript
// Instead of:
if (isLocalMode) {
  router.push('/super-cards')
}

// Change to:
router.push('/auth/login')  // Always show login
```

### 2. `/app/auth/login/page.tsx`
Keep the current bypass but make it optional:
- Remove auto-redirect on line 13-16
- Keep the demo login UI

### 3. `/components/auth/LoginForm.tsx`
Fix the demo button redirect:
- Line 275: Change from `/dashboard/demo` to `/super-cards`
- Add LOCAL_MODE bypass logic

### 4. Create `/app/dashboard/demo/route.ts`
Create a route handler that:
- Sets a demo session cookie/flag
- Redirects to `/super-cards`

## Solution Options

### Option 1: Always Show Login (RECOMMENDED)
- Remove LOCAL_MODE auto-redirect
- Show login page with prominent "Try Demo" button
- Demo button bypasses auth and goes to Super Cards

### Option 2: Add Login Toggle
- Add a "Sign In" button to Super Cards header
- Keep LOCAL_MODE but make login accessible

### Option 3: Environment Variable Control
- Add FORCE_LOGIN_PAGE=true option
- Override LOCAL_MODE when needed

## Success Criteria
- [ ] Login page is visible to users
- [ ] "Try Demo Account" button works
- [ ] Real login still functions
- [ ] Demo mode loads Super Cards
- [ ] No infinite redirect loops
- [ ] Mobile responsive