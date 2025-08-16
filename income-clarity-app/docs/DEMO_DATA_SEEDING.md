# Demo Data Seeding - Complete Guide

## Overview
The Income Clarity app includes comprehensive demo data seeding functionality to showcase all features with realistic portfolio data. This system creates a complete dividend-focused investment portfolio with authentic market conditions, transaction history, and FIRE progress tracking.

## Requirements Fulfilled (DEMO-001 through DEMO-008)

| Requirement | Description | Status |
|-------------|-------------|---------|
| **DEMO-001** | Create seed script for realistic portfolio data | ✅ Complete |
| **DEMO-002** | Add 8-10 popular dividend stocks | ✅ 9 stocks implemented |
| **DEMO-003** | Include historical purchase data (various dates/prices) | ✅ 2-year DCA history |
| **DEMO-004** | Add dividend payment history for past 12 months | ✅ 12+ months included |
| **DEMO-005** | Mix sectors for realistic diversification | ✅ 6 sectors covered |
| **DEMO-006** | Include mix of gains/losses for realistic performance | ✅ Mixed performance |
| **DEMO-007** | Add sample transactions and dividend reinvestments | ✅ All transaction types |
| **DEMO-008** | Create "Reset to Demo Data" button for easy refresh | ✅ API + UI ready |

## Demo Portfolio Specifications

### Target Metrics
- **Portfolio Value**: ~$124,000
- **Annual Dividend Income**: ~$4,200
- **Portfolio Yield**: 3.4%
- **FIRE Progress**: 67% dividend coverage of expenses
- **Monthly Dividend Income**: ~$352
- **Monthly Expenses**: ~$525

### Stock Holdings (9 Dividend Stocks)

| Ticker | Company | Sector | Yield | Position | Performance |
|--------|---------|---------|--------|----------|------------|
| **AAPL** | Apple Inc. | Technology | 0.45% | $20,295 | 🟢 +20.5% |
| **MSFT** | Microsoft Corp | Technology | 0.68% | $16,810 | 🟢 +6.4% |
| **JNJ** | Johnson & Johnson | Healthcare | 2.95% | $15,081 | 🔴 -5.5% |
| **KO** | Coca-Cola Co | Consumer Staples | 3.15% | $12,460 | 🟢 +2.0% |
| **VZ** | Verizon | Telecommunications | 6.50% | $11,124 | 🔴 -17.2% |
| **T** | AT&T | Telecommunications | 5.05% | $12,183 | 🔴 -16.1% |
| **PFE** | Pfizer Inc | Healthcare | 5.92% | $10,792 | 🔴 -10.2% |
| **XOM** | Exxon Mobil | Energy | 3.22% | $9,251 | 🟢 +13.8% |
| **O** | Realty Income | Real Estate | 5.65% | $16,019 | 🔴 -2.3% |

### Sector Diversification
- **Technology**: 29.9% (AAPL, MSFT)
- **Telecommunications**: 18.8% (VZ, T)
- **Healthcare**: 20.9% (JNJ, PFE)
- **Real Estate**: 12.9% (O - Monthly REIT)
- **Consumer Staples**: 10.0% (KO)
- **Energy**: 7.5% (XOM)

## Implementation Files

### Core Scripts
```
scripts/
├── seed-demo-data.js          # 🆕 Enhanced demo seeding (Primary)
├── seed-database.js           # Original seeding script
├── setup-test-user.js         # Basic user setup
└── get-test-user-id.js        # User ID utility
```

### API Endpoints
```
app/api/demo/
└── reset/
    └── route.ts               # POST /api/demo/reset
```

### UI Components
```
app/settings/
└── page.tsx                   # Settings page with reset button
```

## Usage Instructions

### 1. Command Line Seeding
```bash
# Navigate to project directory
cd /public/MasterV2/income-clarity/income-clarity-app/

# Run the demo seeding script
node scripts/seed-demo-data.js

# Expected output:
# ✅ Demo data seeding completed successfully!
# Login: test@example.com / password123
```

### 2. API Reset (Development Only)
```bash
# POST request to reset endpoint
curl -X POST http://localhost:3000/api/demo/reset \
  -H "Content-Type: application/json"

# Response includes detailed feature list
```

### 3. UI Reset Button
1. Start development server: `npm run dev`
2. Login as: `test@example.com` / `password123`
3. Navigate to Settings page
4. Scroll to "Advanced" → "Demo Data Management"
5. Click "Reset Demo Data" button
6. Confirm reset and optionally refresh page

## Data Generated

### Holdings & Positions
- **9 dividend stocks** with realistic allocations
- **Mixed performance**: 4 winners, 5 losers (realistic market conditions)
- **Cost basis tracking** with weighted averages
- **Current market prices** with daily variance simulation

### Transaction History (90+ transactions)
- **28 BUY transactions** - Dollar-cost averaging over 2 years
- **59 DIVIDEND transactions** - Quarterly and monthly payments
- **3 Special transactions**:
  - Tax loss harvesting sale (AT&T partial)
  - DRIP reinvestment (Coca-Cola fractional shares)
  - Recent REIT addition (income diversification)

### Dividend Payment History
- **12+ months** of comprehensive dividend history
- **Quarterly payments** for most stocks (Feb/May/Aug/Nov cycles)
- **Monthly payments** for REIT (O - Realty Income)
- **Realistic timing** based on actual company payment schedules

### Income & Expense Tracking
- **12 months** of aggregated dividend income records
- **12 months** of categorized expenses across 8 categories
- **FIRE progress tracking** with 67% dividend coverage
- **Realistic expense categories**: Rent, utilities, insurance, food, transportation, healthcare, entertainment, shopping

### Future Planning
- **44 future dividend schedules** for next 12 months
- **Stock price data** for 13 tickers (including SPY/QQQ benchmarks)
- **Performance comparison** data for benchmarking

## Technical Implementation Details

### Database Schema Usage
```sql
-- Core tables populated:
Users           (1 test user)
Portfolios      (1 main portfolio)
Holdings        (9 dividend stocks)
Transactions    (90+ BUY/SELL/DIVIDEND)
Income          (12 months aggregated)
Expenses        (96 monthly records)
DividendSchedule (44 future payments)
StockPrices     (13 tickers with current data)
```

### Data Integrity Features
- **Foreign key constraints** respected
- **Proper transaction sequencing** (purchases before dividends)
- **Realistic share quantities** for dividend calculations
- **Weighted average cost basis** calculation
- **Date consistency** across all records

### Security & Safety
- **Development-only reset API** (NODE_ENV check)
- **User confirmation** required for UI reset
- **Comprehensive error handling** with detailed logging
- **Graceful fallbacks** for missing data

## Customization Options

### Modify Stock Selection
```javascript
// In scripts/seed-demo-data.js
const DEMO_DIVIDEND_STOCKS = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    currentPrice: 225.50,
    dividendYield: 0.0045,
    quarterlyDividend: 0.25,
    purchases: [/* historical purchases */]
  },
  // Add or modify stocks here
];
```

### Adjust Portfolio Metrics
```javascript
// Target portfolio parameters
const TARGET_PORTFOLIO_VALUE = 250000;  // ~$250K
const TARGET_ANNUAL_DIVIDENDS = 9000;   // ~$9K
const TARGET_FIRE_COVERAGE = 0.67;      // 67%
```

### Customize Expense Categories
```javascript
// Modify expense categories and amounts
const expenseCategories = [
  { category: 'RENT', merchant: 'Apartment Rental', amount: 1950 },
  { category: 'UTILITIES', merchant: 'Electric & Water', amount: 220 },
  // Customize categories here
];
```

## Troubleshooting

### Common Issues

**Issue**: "Database connection failed"
```bash
# Solution: Ensure database is set up
npx prisma generate
npx prisma db push
```

**Issue**: "User not found error"
```bash
# Solution: Create test user first
node scripts/setup-test-user.js
```

**Issue**: "Reset API returns 403"
```bash
# Solution: Only works in development
export NODE_ENV=development
npm run dev
```

### Validation Commands
```bash
# Check if data exists
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM holdings;"
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM transactions;"
sqlite3 prisma/dev.db "SELECT SUM(amount) FROM income WHERE category='DIVIDEND';"

# Verify user exists
sqlite3 prisma/dev.db "SELECT email FROM users WHERE email='test@example.com';"
```

## Benefits for Development & Testing

### Feature Demonstration
- **Income Intelligence Hub**: Real dividend tracking with monthly trends
- **Performance Hub**: Authentic portfolio vs SPY/QQQ comparisons
- **Tax Strategy Hub**: Qualified dividend analysis with actual tax implications
- **FIRE Progress Hub**: Realistic expense coverage tracking
- **Portfolio Insights Hub**: Meaningful sector diversification analysis

### Testing Scenarios
- **Profitable positions** (AAPL, MSFT, XOM) for gain analysis
- **Losing positions** (VZ, T, PFE) for tax loss harvesting
- **High-yield stocks** (VZ, T, PFE) for income focus
- **Monthly vs quarterly** dividends (O vs others)
- **Mixed sectors** for diversification analysis

### Data Quality
- **Realistic market conditions** based on actual stock performance
- **Authentic dividend yields** matching current market rates
- **Proper transaction timing** for accurate calculations
- **FIRE methodology** with expense coverage tracking
- **Tax considerations** with qualified dividend status

## Maintenance & Updates

### Regular Updates
- **Stock prices**: Update quarterly with market conditions
- **Dividend rates**: Adjust when companies change payments
- **Sector allocation**: Rebalance for market reality
- **Performance metrics**: Keep losses/gains realistic

### Version History
- **v1.0** (seed-database.js): Basic portfolio with ETFs
- **v2.0** (seed-demo-data.js): 🆕 Comprehensive dividend stocks with full features

## Future Enhancements

### Potential Additions
- **Options trading** scenarios for income generation
- **International dividends** for global diversification  
- **Crypto staking** rewards for modern portfolios
- **Real estate** crowdfunding income streams
- **Bond ladders** for fixed income allocation

### Advanced Features
- **Monte Carlo** simulation for FIRE projections
- **Tax optimization** strategies with real scenarios
- **Rebalancing alerts** based on allocation drift
- **Dividend growth** analysis with historical trends
- **Sector rotation** strategies based on market cycles

---

## Quick Reference

### Login Credentials
```
Email: test@example.com
Password: password123
```

### Key Commands
```bash
# Seed demo data
node scripts/seed-demo-data.js

# Start development server
npm run dev

# Reset via API (dev only)
curl -X POST http://localhost:3000/api/demo/reset
```

### Important Files
- `scripts/seed-demo-data.js` - Main seeding script
- `app/api/demo/reset/route.ts` - Reset API endpoint
- `app/settings/page.tsx` - UI reset button
- `prisma/schema.prisma` - Database schema
- This file: `docs/DEMO_DATA_SEEDING.md` - Complete documentation

**The demo data seeding system provides a comprehensive, realistic portfolio that showcases all Income Clarity features with authentic market conditions and meaningful financial metrics.**