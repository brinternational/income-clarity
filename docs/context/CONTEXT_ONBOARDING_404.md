# CONTEXT: Onboarding Page 404 Error

## Problem
The "Setup Guide" link in the profile dropdown points to `/onboarding` but the page doesn't exist, resulting in a 404 error.

## Current State
- Link exists in profile dropdown ✅
- Points to: https://incomeclarity.ddns.net/onboarding
- **Page doesn't exist** ❌
- API endpoint exists: `/api/user/complete-onboarding` ✅
- But no UI page at `/app/onboarding/page.tsx` ❌

## Investigation Results
```bash
# Checked /app directory - NO onboarding folder found
# Only found: /app/api/user/complete-onboarding (API only)
# Missing: /app/onboarding/page.tsx
```

## Root Cause
The onboarding page was never created. We have:
- API endpoint for completing onboarding
- Link in navigation pointing to /onboarding
- But NO actual page component

## Solution Required

### 1. Create Onboarding Page Structure
```
/app/onboarding/
├── page.tsx          # Main onboarding page
├── layout.tsx        # Optional layout
└── components/       # Step components
    ├── WelcomeStep.tsx
    ├── PortfolioStep.tsx
    ├── TaxProfileStep.tsx
    ├── HoldingsStep.tsx
    └── CompleteStep.tsx
```

### 2. Multi-Step Wizard Implementation
```typescript
// /app/onboarding/page.tsx
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'Welcome',
    'Portfolio Setup',
    'Tax Profile',
    'Import Holdings',
    'Complete'
  ];
  
  // Step navigation logic
  // Form state management
  // API calls to save progress
}
```

### 3. Fix Navigation Link
Ensure profile dropdown correctly links to `/onboarding`

## Files Affected
- Need to CREATE: `/app/onboarding/page.tsx`
- Need to CREATE: Step components
- Existing API: `/api/user/complete-onboarding/route.ts`
- Navigation: Profile dropdown menu

## Priority
**CRITICAL** - Users clicking "Setup Guide" get 404 error

## Testing
1. Click "Setup Guide" in profile dropdown
2. Verify onboarding page loads (not 404)
3. Test step navigation
4. Verify data saves
5. Complete flow end-to-end

## Status
- Created: 2025-08-13
- Bug: Onboarding page never created (was at 40% but actually 0%)
- Blocks new user experience