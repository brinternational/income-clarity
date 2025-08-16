# Supabase Integration Testing Guide

This guide outlines how to test the Supabase backend integration with the Income Clarity frontend.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `lib/schema.sql` in your Supabase SQL Editor
   - Configure authentication providers (Email/Password, Google, GitHub, Apple)

2. **Environment Configuration**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase project URL and keys
   - Set `NEXT_PUBLIC_SITE_URL` to your local development URL

## Testing Checklist

### ✅ Authentication Flow
- [ ] **Sign Up**: Create a new account via email/password
- [ ] **Email Verification**: Check email confirmation flow
- [ ] **Sign In**: Login with email/password
- [ ] **Magic Link**: Test passwordless authentication
- [ ] **OAuth Providers**: Test Google/GitHub/Apple sign-in
- [ ] **Password Reset**: Test forgot password flow
- [ ] **Sign Out**: Ensure proper session cleanup

### ✅ Route Protection
- [ ] **Protected Routes**: Verify `/dashboard`, `/profile`, `/onboarding` require authentication
- [ ] **Auth Routes**: Verify `/auth/login`, `/auth/signup` redirect when authenticated
- [ ] **Root Redirect**: Test `/` redirects appropriately based on auth state
- [ ] **Middleware**: Confirm middleware handles auth state correctly

### ✅ Data Integration
- [ ] **User Profile**: Test profile creation and updates
- [ ] **Portfolio Management**: Create/read/update portfolio data
- [ ] **Holdings**: Add/remove holdings and verify calculations
- [ ] **Expenses**: Track expenses and verify monthly totals
- [ ] **Real-time Updates**: Test live data synchronization

### ✅ Dashboard Functionality
- [ ] **Loading States**: Verify spinners show during data fetching
- [ ] **Error Handling**: Test error states when data fails to load
- [ ] **Data Display**: Confirm real data displays correctly
- [ ] **Fallback to Mock**: Verify mock data shows when no real data exists
- [ ] **Pull to Refresh**: Test manual data refresh functionality

### ✅ User Experience
- [ ] **Onboarding Flow**: Complete new user setup process
- [ ] **Profile Management**: Update user information and goals
- [ ] **Mobile Responsiveness**: Test on mobile devices
- [ ] **Performance**: Verify fast loading times
- [ ] **Offline Handling**: Test app behavior without internet

## Test Data Setup

### Sample User Profile
```json
{
  "full_name": "Test User",
  "phone": "+1234567890",
  "risk_tolerance": "moderate",
  "financial_goals": {
    "monthlyExpenses": 3800,
    "targetCoverage": 1.0,
    "stressFreeLiving": 5000
  }
}
```

### Sample Portfolio
```json
{
  "name": "Test Investment Portfolio",
  "portfolio_type": "investment",
  "total_value": 400000,
  "is_primary": true
}
```

### Sample Holdings
```json
[
  {
    "symbol": "JEPI",
    "name": "JPMorgan Equity Premium Income ETF",
    "asset_type": "etf",
    "quantity": 1200,
    "average_cost": 100,
    "current_price": 100,
    "current_value": 120000,
    "dividend_yield": 0.085
  },
  {
    "symbol": "SCHD",
    "name": "Schwab US Dividend Equity ETF",
    "asset_type": "etf",
    "quantity": 800,
    "average_cost": 100,
    "current_price": 100,
    "current_value": 80000,
    "dividend_yield": 0.038
  }
]
```

## Common Issues & Solutions

### Authentication Issues
- **Problem**: OAuth redirect not working
- **Solution**: Check redirect URLs in Supabase Auth settings match your domain

### Data Loading Issues
- **Problem**: Data not loading or showing errors
- **Solution**: Verify RLS policies allow user access to their own data

### Real-time Updates Not Working
- **Problem**: Changes not reflected immediately
- **Solution**: Check if real-time is enabled for tables in Supabase

### Performance Issues
- **Problem**: Slow loading times
- **Solution**: Check database indexes and query efficiency

## Database Verification

After setting up test data, verify in Supabase dashboard:

1. **Users Table**: Check user profile is created
2. **Portfolios Table**: Verify portfolios are linked to user
3. **Holdings Table**: Confirm holdings calculations are correct
4. **Real-time**: Test real-time subscriptions in Supabase logs

## Production Readiness

Before deploying to production:

- [ ] Environment variables configured for production
- [ ] RLS policies thoroughly tested
- [ ] Error handling covers all edge cases
- [ ] Performance optimized for expected user load
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery procedures in place

## Support

If you encounter issues during testing:

1. Check Supabase logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure database schema matches the latest version
4. Test with a fresh database to rule out data issues
5. Check browser console for client-side errors

## Next Steps

After successful integration testing:

1. Set up staging environment for further testing
2. Implement additional features (expense tracking, goal setting)
3. Add external API integrations for real-time market data
4. Enhance real-time features and notifications
5. Prepare for production deployment