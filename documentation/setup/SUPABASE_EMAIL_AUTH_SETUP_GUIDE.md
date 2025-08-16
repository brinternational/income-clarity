# Supabase Email Authentication Setup Guide

## EXACT Steps to Enable Email Authentication in Supabase Dashboard

### Step 1: Access Authentication Settings
1. Open your Supabase project dashboard at https://supabase.com/dashboard
2. Select your `income-clarity` project 
3. In the left sidebar, click **"Authentication"** (shield icon)
4. Click **"Settings"** (under the Authentication section)

### Step 2: Enable Email Authentication Provider
1. In Authentication Settings, scroll to **"Providers"** section
2. Find **"Email"** in the list of providers
3. Click the toggle switch next to **"Email"** to enable it
4. Make sure the toggle is **green/enabled**

### Step 3: Configure Email Settings for Development
1. Still in Authentication Settings, scroll to **"Auth"** section
2. Find **"User Signups"** and ensure it's **enabled**
3. Find **"Confirm email"** setting:
   - **For Development**: Turn OFF (disable email confirmation)
   - **For Production**: Keep ON (require email confirmation)

### Step 4: Disable Email Confirmation for Testing (Development Only)
1. In the same "Auth" section, look for **"Enable email confirmations"**
2. **Turn this OFF** for development testing
3. This allows users to sign up without clicking email confirmation links

### Step 5: Configure SMTP (Optional for Production)
1. Scroll to **"SMTP Settings"** section
2. For development, you can use Supabase's default SMTP
3. For production, configure your own SMTP provider:
   - **SMTP Host**: your.smtp.provider.com
   - **SMTP Port**: 587 (usually)
   - **SMTP User**: your-smtp-username
   - **SMTP Pass**: your-smtp-password

### Step 6: Set Auth URL Redirects
1. Scroll to **"URL Configuration"** section
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Set **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### Step 7: Save All Changes
1. Scroll to bottom of page
2. Click **"Save"** button
3. Wait for "Settings saved" confirmation

## Common Error Solutions

### "Email address is invalid" Error
This usually means:
1. **Email provider not enabled** - Follow Step 2 above
2. **Invalid email format** - Use simple format like `test@example.com`
3. **Domain restrictions** - Check if you have email domain whitelist enabled

### "Email not confirmed" Error
This means:
1. **Email confirmation is required** - Disable in Step 4 for development
2. **User hasn't clicked email link** - Check spam folder or disable confirmation

### "Invalid credentials" Error
This means:
1. **Wrong Supabase URL/Key** - Check your `.env.local` file
2. **RLS policies blocking** - Check Row Level Security settings
3. **Database schema missing** - Run the schema.sql file

## Testing Your Setup

### Test 1: Run the Auth Test Script
```bash
cd income-clarity/income-clarity-app
node scripts/test-auth.js
```

### Test 2: Manual Browser Test
1. Start your app: `npm run dev`
2. Navigate to: `http://localhost:3000/auth/signup`
3. Try signing up with: `test@example.com`
4. Password: `TestPassword123!`

### Test 3: Check Supabase Dashboard
1. Go to Authentication > Users in Supabase dashboard
2. You should see your test user listed
3. Status should show "Confirmed" (if email confirmation disabled)

## Quick Verification Checklist
- [ ] Email provider is enabled (green toggle)
- [ ] User signups are enabled
- [ ] Email confirmation is disabled (for development)
- [ ] Site URL is set to `http://localhost:3000`
- [ ] Redirect URLs include auth callback
- [ ] Settings are saved

## Screenshot Locations for Reference
- **Authentication Settings**: Left sidebar > Authentication > Settings
- **Providers Section**: Scroll down to find "Email" toggle
- **Auth Configuration**: Look for "User Signups" and "Confirm email" options
- **URL Configuration**: Site URL and Redirect URLs at bottom of page

## Development vs Production Settings

### Development (Testing)
- Email confirmation: **DISABLED**
- Site URL: `http://localhost:3000`
- Use simple test emails like `test@example.com`

### Production (Live App)
- Email confirmation: **ENABLED**
- Site URL: `https://yourdomain.com`
- Configure proper SMTP provider
- Use real email addresses only

## Still Getting Errors?

### Check These Common Issues:
1. **Cache**: Clear browser cache and restart Next.js server
2. **Environment**: Verify `.env.local` has correct Supabase URL and key
3. **Schema**: Ensure database schema is applied from `supabase/schema.sql`
4. **Network**: Check if localhost:3000 is accessible

### Debug Commands:
```bash
# Test Supabase connection
node scripts/test-supabase-connection.js

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Verify schema exists
# Go to Supabase Dashboard > Table Editor and check for 'users' table
```

This guide should resolve the "Email address is invalid" error by ensuring email authentication is properly configured in your Supabase project.