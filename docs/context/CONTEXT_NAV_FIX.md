# Navigation Fix Context - CRITICAL ISSUE

## Problem Statement
The app has Settings, Profile, and Onboarding components built but they are **completely inaccessible** from the current UI. Users auto-login to Demo mode, go straight to Super Cards, and have no way to navigate to other parts of the app.

## Current Broken Flow
1. User visits `/` → Auto-redirects to `/super-cards`
2. Super Cards page loads with `SuperCardsAppShell`
3. PWAHeader is hidden when viewing cards: `showHeader={!selectedCard}`
4. BottomNavigation only has 5 buttons - all route to Super Cards
5. **Result**: No way to access Settings, Profile, or Onboarding

## Files Involved
- `/app/page.tsx` - Auto-redirects to `/super-cards` in LOCAL_MODE
- `/components/SuperCardsAppShell.tsx` - Hides header when cards selected
- `/components/AppShell.tsx` - Has Settings button but never visible
- `/components/navigation/PWAHeader.tsx` - Settings button at line 159-160
- `/components/navigation/BottomNavigation.tsx` - Only routes to Super Cards

## Solution Requirements
1. **Make PWAHeader Always Visible** OR
2. **Add Settings/Profile to BottomNavigation** OR  
3. **Create a hamburger menu** OR
4. **Add user menu to Super Cards view**

## Existing Code to Leverage
PWAHeader already has working Settings button:
```typescript
const handleSettingsClick = useCallback(() => {
  router.push('/settings')
}, [router])
```

Profile dropdown exists in PWAHeader (lines 294-409) with:
- Settings link
- Profile link  
- Logout button

## Success Criteria
- [ ] User can access Settings from Super Cards view
- [ ] User can access Profile from Super Cards view
- [ ] User can logout from Super Cards view
- [ ] Navigation works on both mobile and desktop
- [ ] No regression in existing Super Cards functionality

## Testing Steps
1. Start app with `npm run dev`
2. Navigate to `/` (should redirect to `/super-cards`)
3. Verify Settings is accessible
4. Click Settings and verify `/settings` page loads
5. Return to Super Cards and verify Profile is accessible
6. Test on mobile viewport (responsive)

## Priority: CRITICAL
This blocks users from accessing core app functionality. Without this fix, users cannot:
- Change settings
- View their profile
- Logout of the app
- Access onboarding