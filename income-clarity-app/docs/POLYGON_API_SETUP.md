# Polygon.io API Setup Guide

## Overview
Income Clarity uses Polygon.io for real-time stock price data. This guide shows you how to set up your API key.

## Step 1: Get Your Free API Key

1. **Sign up at Polygon.io**
   - Go to https://polygon.io
   - Click "Get Your Free API Key"
   - Create an account (free tier available)

2. **Free Tier Includes:**
   - 5 API calls per minute
   - Real-time stock prices
   - Historical data
   - Perfect for personal use

## Step 2: Store Your API Key

### For Local Development

1. **Create `.env.local` file** in `income-clarity-app/` directory:
   ```bash
   cd income-clarity/income-clarity-app
   cp .env.local.template .env.local
   ```

2. **Add your API key** to `.env.local`:
   ```env
   POLYGON_API_KEY=your_actual_api_key_here
   ```

3. **Verify it works**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Check if stock prices load in portfolio
   ```

### For Production (Vercel)

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" → "Environment Variables"

2. **Add the following variables:**
   ```
   POLYGON_API_KEY = your_actual_api_key
   NODE_ENV = production
   SESSION_SECRET = [generate with: openssl rand -base64 48]
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 3: How It's Used in Code

The API key is accessed securely via environment variables:

```typescript
// lib/stock-price-service.ts
constructor() {
  this.apiKey = process.env.POLYGON_API_KEY || '';
  
  if (!this.apiKey) {
    console.warn('No API key configured');
  }
}
```

## Security Best Practices

### ✅ DO:
- Store API keys in `.env.local` (git-ignored)
- Use environment variables in production
- Rotate keys periodically
- Use different keys for dev/staging/production

### ❌ DON'T:
- Commit API keys to git
- Hardcode keys in source files
- Share keys publicly
- Use production keys in development

## Testing Your Setup

Run the test script to verify your API key works:

```bash
# Test Polygon API connection
node scripts/test-polygon-stock-api.js

# Expected output:
# ✅ Polygon API Key is configured
# ✅ API connection successful
# Current SPY price: $XXX.XX
```

## Troubleshooting

### "No API key configured" warning
- Check `.env.local` exists and contains `POLYGON_API_KEY`
- Restart dev server after adding environment variables

### "Rate limit exceeded" error
- Free tier: 5 calls/minute
- The app implements caching to minimize API calls
- Cache duration: 5 minutes for price data

### "Invalid API key" error
- Verify key is copied correctly (no extra spaces)
- Check key is active in Polygon dashboard
- Ensure you're using the correct environment

## Alternative: Mock Data Mode

For development without an API key:

```typescript
// Use mock data instead of real API
// Set in .env.local:
USE_MOCK_DATA=true
```

This will use sample data from `lib/mock-data.ts`.

## Cache System

The app implements smart caching to minimize API usage:

- **L1 Cache**: In-memory (immediate)
- **L2 Cache**: Redis/Upstash (if configured)
- **L3 Cache**: Database (if configured)
- **Default TTL**: 5 minutes for stock prices

## API Usage Monitoring

Monitor your API usage:
1. Log into Polygon.io dashboard
2. Check "API Usage" section
3. View calls per minute/day
4. Set up usage alerts

## Need Help?

- **Polygon Documentation**: https://polygon.io/docs
- **API Status**: https://status.polygon.io
- **Support**: support@polygon.io

---

**Remember**: Never commit your actual API key to version control!