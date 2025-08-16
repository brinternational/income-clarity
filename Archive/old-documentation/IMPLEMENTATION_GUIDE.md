# INCOME CLARITY - IMPLEMENTATION GUIDE
*Technical specifications and implementation details for each feature*

## 📋 TABLE OF CONTENTS
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Feature Specifications](#feature-specifications)
5. [API Integrations](#api-integrations)
6. [Testing Requirements](#testing-requirements)

---

## 🏗️ OVERVIEW

Income Clarity is a dividend income lifestyle management tool built with:
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Hosting**: Vercel
- **Key Libraries**: Recharts (charts), React Hook Form (forms), Zod (validation)

---

## 🎯 ARCHITECTURE

### Component Structure
```
/app
  /working           # Main demo page
  /api              # API routes
/components
  /dashboard        # Dashboard cards
  /forms           # Input forms
  /charts          # Data visualizations
  /ui              # Reusable UI components
/lib
  /calculations    # Financial calculations
  /supabase        # Database client
  /types           # TypeScript types
  /utils           # Helper functions
```

### State Management
- React Context for global state (user profile, settings)
- Local state for component-specific data
- Supabase for persistent storage

---

## 📊 DATA MODELS

### ⭐ Strategic Priority Cards Data Models

#### Tax Savings Analysis
```typescript
interface TaxSavingsAnalysis {
  currentLocation: string
  currentTaxDrag: number // Monthly tax cost in USD
  optimalLocation: string
  potentialSavings: number // Annual savings in USD
  relocationROI: number // Break-even timeline in months
  stateComparison: StateComparison[]
  lastUpdated: Date
}

interface StateComparison {
  state: string
  monthlyTaxDrag: number
  annualSavings: number
  taxEfficiencyScore: number // 0-100
  dividendTaxRate: number
  hasStateTax: boolean
}
```

#### FIRE Progress Calculation
```typescript
interface FIRECalculation {
  fiNumber: number // 25x annual expenses
  currentPortfolio: number
  fiProgress: number // Percentage complete (0-100)
  timeToFI: number // Years remaining
  monthlyContribution: number
  accelerationScenarios: AccelerationScenario[]
  coastFINumber: number // Portfolio value to coast to FI
  coastFIAge: number
}

interface AccelerationScenario {
  additionalMonthly: number
  yearsShaved: number
  newFIDate: Date
  totalContributionNeeded: number
}
```

#### Income Stability Analysis
```typescript
interface IncomeStabilityAnalysis {
  overallStabilityScore: number // 0-100
  incomeVolatility: number // Standard deviation
  dividendCutRisk: DividendRisk[]
  diversificationScore: number // 0-100
  recessionProofPercentage: number
  stabilityTrend: 'improving' | 'stable' | 'declining'
  confidenceLevel: number // Statistical confidence
}

interface DividendRisk {
  symbol: string
  cutProbability: number // 0-100
  sustainabilityScore: number // 0-100
  riskFactors: string[]
  lastCutDate?: Date
  payoutRatio: number
}
```

#### Strategy Health Analysis
```typescript
interface StrategyHealthAnalysis {
  overallScore: number // 0-100
  taxEfficiency: number // 0-100
  incomeReliability: number // 0-100
  riskOptimization: number // 0-100
  diversificationScore: number // 0-100
  recommendedActions: StrategyRecommendation[]
  benchmarkComparison: BenchmarkData
}

interface StrategyRecommendation {
  action: string
  impact: number // Projected score improvement
  priority: 'high' | 'medium' | 'low'
  reasoning: string
  timeframe: string
  effort: 'easy' | 'moderate' | 'complex'
}

interface BenchmarkData {
  peerAverageScore: number
  peerPercentile: number
  industryBenchmark: number
}
```

#### Rebalancing Intelligence
```typescript
interface RebalancingRecommendation {
  isDriftSignificant: boolean
  driftPercentage: number
  recommendedActions: RebalanceAction[]
  taxOptimizedTiming: Date
  projectedImpact: RebalanceImpact
  lastRebalance?: Date
}

interface RebalanceAction {
  action: 'buy' | 'sell' | 'hold'
  symbol: string
  currentAllocation: number
  targetAllocation: number
  amount: number // Dollar amount
  shares?: number
  reasoning: string
  taxImpact: number
  urgency: 'immediate' | 'soon' | 'monitor'
}

interface RebalanceImpact {
  expectedReturn: number
  riskReduction: number
  taxCost: number
  netBenefit: number
}
```

### Core Application Data Models

### User Profile
```typescript
interface UserProfile {
  id: string
  email: string
  name: string
  targetMonthlyIncome: number
  currentAge: number
  retirementGoal: number
  taxLocation: TaxLocation
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  createdAt: Date
  updatedAt: Date
}
```

### Profile Settings (Comprehensive Profile Management)
```typescript
interface ProfileSettings {
  // Personal Information
  personal: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    timezone: string;
  };
  
  // Financial Profile
  financial: {
    monthlyExpenses: number;
    stressFreeLiving: number;
    coverageRatio: number;
    riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
    investmentExperience: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  
  // Tax Settings
  tax: {
    state: string;
    residencyStatus: 'Full-year' | 'Part-year' | 'Non-resident';
    filingStatus: 'Single' | 'MarriedFilingJointly' | 'MarriedFilingSeparately' | 'HeadOfHousehold';
    taxBracket?: string;
    qualifiedDividendOptimization: boolean;
    roc19aTracking: boolean;
    taxLotMethod: 'FIFO' | 'LIFO' | 'SpecificID';
    withholdingPreferences: {
      international: boolean;
      backupWithholding: boolean;
    };
  };
  
  // Account & Security
  security: {
    twoFactorEnabled: boolean;
    connectedAccounts: Array<{
      provider: 'google' | 'github' | 'apple';
      email: string;
      connectedAt: Date;
    }>;
    sessionCount: number;
    lastPasswordChange?: Date;
    securityQuestions: boolean;
    emailVerified: boolean;
  };
  
  // Notification Preferences
  notifications: {
    email: {
      enabled: boolean;
      dividendPayments: boolean;
      priceAlerts: boolean;
      portfolioChanges: boolean;
      taxDeadlines: boolean;
      rebalancingAlerts: boolean;
    };
    push: {
      enabled: boolean;
      criticalAlerts: boolean;
      dailySummary: boolean;
    };
    sms: {
      enabled: boolean;
      securityAlerts: boolean;
      emergencyContacts: boolean;
    };
  };
  
  // App Preferences
  preferences: {
    theme: string;
    currency: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    numberFormat: 'comma' | 'period';
    language: string;
    dashboard: {
      cardOrder: string[];
      hiddenComponents: string[];
    };
  };
  
  // Privacy & Data Management
  privacy: {
    dataSharing: boolean;
    marketingCommunications: boolean;
    analyticsOptOut: boolean;
    dataRetention: 'auto' | 'manual';
    lastDataExport?: Date;
  };
}
```

### Portfolio Holding
```typescript
interface PortfolioHolding {
  id: string
  userId: string
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number              // calculated: shares * currentPrice
  yieldPercentage: number
  annualIncome: number       // calculated: value * (yieldPercentage / 100)
  monthlyIncome: number      // calculated: annualIncome / 12
  dividendType: 'Qualified' | 'Covered-call' | 'REIT' | 'Ordinary'
  sector?: string
  lastDividendDate?: Date
  exDividendDate?: Date
  paymentFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
}
```

### Expense
```typescript
interface Expense {
  id: string
  userId: string
  category: string
  amount: number
  isRecurring: boolean
  frequency?: 'monthly' | 'quarterly' | 'annual'
  dueDate?: number  // day of month
  notes?: string
}
```

### Dividend Payment
```typescript
interface DividendPayment {
  id: string
  holdingId: string
  exDividendDate: Date
  paymentDate: Date
  amount: number
  amountPerShare: number
  dividendType: 'regular' | 'special' | 'return-of-capital'
  taxYear: number
}
```

---

## 🔧 FEATURE SPECIFICATIONS

### 1. SPY COMPARISON CHART
**Purpose**: Daily emotional validation that dividend strategy is working

**Implementation**:
```typescript
// Data points needed
- Portfolio total return (price appreciation + dividends)
- SPY total return for same period
- Time period selector (1M, 3M, 6M, 1Y, 3Y, 5Y)
- Interactive tooltips showing exact values

// Key calculations
portfolioReturn = ((currentValue - startValue + dividends) / startValue) * 100
outperformance = portfolioReturn - spyReturn

// Visual requirements
- Blue line for portfolio, orange for SPY
- Green shading when outperforming
- Responsive chart that works on mobile
```

**API Requirements**:
- Historical SPY prices (Yahoo Finance or Alpha Vantage)
- Portfolio historical values (calculate from transactions)

### 2. INCOME CLARITY ENGINE
**Purpose**: Show NET income after taxes and expenses

**Calculations**:
```typescript
function calculateMonthlyIncome(holdings: PortfolioHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.monthlyIncome, 0)
}

function calculateTaxOwed(holdings: PortfolioHolding[], location: TaxLocation): number {
  const { qualified, ordinary } = categorizeIncome(holdings)
  
  // Puerto Rico special case
  if (location === 'PR') {
    return ordinary * 0.15 / 12 // 0% on qualified
  }
  
  // Federal taxes
  const federalQualified = qualified * 0.15  // simplified
  const federalOrdinary = ordinary * 0.22    // simplified
  
  // State taxes
  const stateTax = (qualified + ordinary) * getStateTaxRate(location) / 100
  
  return (federalQualified + federalOrdinary + stateTax) / 12
}

// Display flow
Gross Income → Tax Owed → Net Income → Expenses → Available to Reinvest
```

### 3. EXPENSE MILESTONES
**Purpose**: Gamified progress tracking

**Implementation**:
```typescript
const milestones = [
  { name: 'Utilities', typical: 200-300, emoji: '💡' },
  { name: 'Insurance', typical: 400-600, emoji: '🏥' },
  { name: 'Food', typical: 600-1000, emoji: '🍕' },
  { name: 'Rent/Mortgage', typical: 1000-2500, emoji: '🏠' },
  { name: 'Entertainment', typical: 500-1000, emoji: '🎮' },
  { name: 'Full Freedom', typical: 'all expenses', emoji: '🎉' }
]

// Progress calculation
coveragePercentage = (netIncome / expenseAmount) * 100
isCovered = coveragePercentage >= 100

// Visual elements
- Progress bars with smooth animations
- Checkmarks for completed milestones
- Celebration animation at 100%
```

### 4. DIVIDEND CALENDAR
**Purpose**: Visual payment schedule

**Features**:
- Monthly calendar grid view
- Ex-dividend dates (orange markers)
- Payment dates (green markers)
- List view of upcoming payments
- Monthly income summary

**Data Requirements**:
```typescript
interface DividendSchedule {
  symbol: string
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
  exDividendDayOfMonth: number  // typical day
  paymentDaysAfterEx: number    // typical delay
  months: number[]              // which months pay
}

// Example schedules
SCHD: quarterly, months [3,6,9,12], ex-day ~15th, pay ~30 days later
JEPI: monthly, all months, ex-day ~5th, pay ~20 days later
```

### 5. MARGIN INTELLIGENCE
**Purpose**: Remove fear through education

**Risk Calculation**:
```typescript
const maxHistoricalDrawdown = 34  // SPY's worst drawdown
const marginPercentage = (marginUsed / portfolioValue) * 100

const riskLevel = 
  marginPercentage > maxHistoricalDrawdown ? 'high' :
  marginPercentage > maxHistoricalDrawdown * 0.5 ? 'moderate' : 
  'low'

// Income acceleration
const marginBoost = (marginUsed * avgYield) / 12
const interestCost = (marginUsed * marginRate) / 12
const netBenefit = marginBoost - interestCost
```

**Visual Requirements**:
- Risk meter (green/yellow/red)
- Historical context (SPY drawdown comparison)
- Cost/benefit analysis
- Warning alerts for high usage

### 6. TAX PLANNING
**Purpose**: Quarterly payment preparation

**Components**:
```typescript
// Quarterly payment dates
const quarterlyDates = [
  { quarter: 'Q1', date: 'April 15' },
  { quarter: 'Q2', date: 'June 15' },
  { quarter: 'Q3', date: 'September 15' },
  { quarter: 'Q4', date: 'January 15' }
]

// Tax brackets (simplified)
const federalBrackets = {
  qualified: { single: 15, married: 15 },  // most users
  ordinary: { single: 22, married: 22 }     // simplified
}

// Optimization strategies
- Tax loss harvesting opportunities
- Qualified vs ordinary dividend comparison
- Location arbitrage calculations
- Municipal bond equivalent yield
```

### 7. TAX INTELLIGENCE ENGINE
**Purpose**: Our competitive edge - show why SCHD beats JEPI in PR but not in CA

**Implementation**: `/app/working/page.tsx:2743-3333` (TaxIntelligence component)

**Core Data Structure**:
```typescript
interface ETFTaxData {
  name: string;
  type: 'Qualified' | 'Covered-call' | 'REIT';
  currentYield: number;
  qualifiedPercent: number;    // % of dividends that qualify for preferential rates
  taxEfficiencyScore: number;  // 0-100 scale
  description: string;
}

const etfTaxDatabase: Record<string, ETFTaxData> = {
  'SCHD': { 
    name: 'Schwab US Dividend Equity ETF', 
    type: 'Qualified', 
    currentYield: 3.5, 
    qualifiedPercent: 100, 
    taxEfficiencyScore: 95,
    description: 'Premium dividend aristocrats, 100% qualified dividends'
  },
  'JEPI': { 
    name: 'JPMorgan Equity Premium Income ETF', 
    type: 'Covered-call', 
    currentYield: 8.0, 
    qualifiedPercent: 35, 
    taxEfficiencyScore: 65,
    description: 'Options income + dividends, mixed tax treatment'
  },
  // ... 7 more ETFs
}
```

**Tax Calculation Algorithm**:
```typescript
const calculateAfterTaxYield = (etf: ETFTaxData, location: TaxLocation) => {
  const federalQualifiedRate = 0.15;   // 15% for most investors
  const federalOrdinaryRate = 0.22;    // 22% bracket assumption
  const stateRate = getStateTaxRate(location) / 100;

  // Split dividend income by tax treatment
  const qualifiedIncome = etf.currentYield * (etf.qualifiedPercent / 100);
  const ordinaryIncome = etf.currentYield * ((100 - etf.qualifiedPercent) / 100);

  // Calculate taxes
  const federalTaxOnQualified = qualifiedIncome * federalQualifiedRate;
  const federalTaxOnOrdinary = ordinaryIncome * federalOrdinaryRate;
  const stateTaxOnAll = etf.currentYield * stateRate;

  const totalTax = federalTaxOnQualified + federalTaxOnOrdinary + stateTaxOnAll;
  return etf.currentYield - totalTax;
}
```

**Key Features Implemented**:
- **ETF Classification Database**: 9 popular dividend ETFs with tax treatment
- **Real-time After-tax Calculations**: Shows true yield in your location
- **Side-by-side Comparisons**: SCHD vs JEPI, VYM vs QYLD, DGRO vs XYLD
- **Location-based Optimization**: PR advantage calculator
- **Smart Recommendations**: Tailored advice based on tax residency
- **Tax Efficiency Scoring**: 0-100 scale for each ETF
- **Premium UI**: Glassmorphism design with animations

**State Tax Integration**:
```typescript
function getStateTaxRate(location: TaxLocation): number {
  switch (location) {
    case 'PR': return 0;      // Puerto Rico - 0% on qualified dividends
    case 'TX': return 0;      // Texas - no state income tax
    case 'FL': return 0;      // Florida - no state income tax
    case 'CA': return 13.3;   // California - highest rate
    case 'NY': return 10.9;   // New York - high rate
    default: return 6;        // Average state tax
  }
}
```

**UI Components**:
- Toggle button in dashboard to show/hide engine
- ETF classification grid with tax efficiency scores
- Interactive comparison selector (3 head-to-head matchups)
- Location-based recommendations section
- Puerto Rico advantage calculator with savings projections

### 8. ADVANCED ANALYTICS (Future)
**Yield on Cost**:
```typescript
yieldOnCost = (annualDividends / totalCostBasis) * 100
// Shows true return on original investment
```

**Dividend Growth Rate**:
```typescript
// Calculate CAGR of dividend payments
const years = 5
const startDividend = holdings[0].dividendHistory[0]
const endDividend = holdings[0].dividendHistory[years-1]
const cagr = Math.pow(endDividend/startDividend, 1/years) - 1
```

**Portfolio Beta**:
```typescript
// Measure volatility vs market
beta = covariance(portfolioReturns, marketReturns) / variance(marketReturns)
```

### 8. NOTIFICATIONS SYSTEM (Future)
**Types**:
- Ex-dividend date reminders (3 days before)
- Payment received confirmations
- Rebalancing suggestions (drift > 5%)
- Tax payment reminders
- Milestone achievements

**Implementation**:
- Web Push API for browser notifications
- Email notifications via SendGrid
- In-app notification center
- User preferences for frequency/types

---

## 🔌 API INTEGRATIONS

### Profile Management APIs
**Endpoints Required**:
```typescript
// Profile Information
GET    /api/profile                    // Get complete profile
PUT    /api/profile                    // Update profile sections
POST   /api/profile/avatar             // Upload profile picture
DELETE /api/profile/avatar             // Remove profile picture

// Security & Authentication
POST   /api/profile/password/change    // Change password
POST   /api/profile/email/change       // Change email
POST   /api/security/2fa/setup         // Setup 2FA
POST   /api/security/2fa/verify        // Verify 2FA code
DELETE /api/security/2fa               // Disable 2FA
GET    /api/security/sessions          // List active sessions
DELETE /api/security/sessions/{id}     // Logout specific session
GET    /api/security/login-history     // Get login history

// Data & Privacy
GET    /api/privacy/data-export        // Export user data (GDPR)
POST   /api/privacy/account-delete     // Delete account
PUT    /api/privacy/settings           // Update privacy settings

// Notifications
GET    /api/notifications/preferences  // Get notification settings
PUT    /api/notifications/preferences  // Update notification settings
POST   /api/notifications/test         // Send test notification
```

**Implementation Examples**:
```typescript
// /api/profile/password/change
export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  
  const { currentPassword, newPassword } = await req.json()
  const user = await getUser(req)
  
  // Verify current password
  const isValid = await verifyPassword(user.id, currentPassword)
  if (!isValid) return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
  
  // Validate new password strength
  if (!validatePasswordStrength(newPassword)) {
    return NextResponse.json({ error: 'Password too weak' }, { status: 400 })
  }
  
  // Update password in Supabase
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ message: 'Password updated successfully' })
}

// /api/profile/avatar
export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  
  const formData = await req.formData()
  const file = formData.get('avatar') as File
  
  // Validate file type and size
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }
  
  // Upload to Supabase Storage
  const fileName = `avatars/${user.id}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(fileName, file)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // Update user profile with avatar URL
  const avatarUrl = supabase.storage.from('profiles').getPublicUrl(fileName).data.publicUrl
  await updateUserProfile(user.id, { avatar: avatarUrl })
  
  return NextResponse.json({ avatarUrl })
}
```

### Stock Data APIs
**Options**:
1. **Yahoo Finance** (unofficial)
   - Free, reliable
   - Use yahoo-finance2 npm package
   - Rate limits apply

2. **Alpha Vantage** (official)
   - Free tier: 5 calls/minute
   - Requires API key
   - Good for dividend data

3. **IEX Cloud**
   - Paid but reliable
   - Real-time prices
   - Comprehensive dividend history

### Implementation Example:
```typescript
// lib/market-data.ts
export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(`/api/quote/${symbol}`)
    const data = await response.json()
    return data.price
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}`)
    return 0
  }
}

export async function getDividendHistory(
  symbol: string, 
  years: number = 5
): Promise<DividendPayment[]> {
  // Fetch from chosen API
  // Transform to our DividendPayment format
  // Cache results for performance
}
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests
```typescript
// Test financial calculations
describe('Tax Calculations', () => {
  test('PR resident pays 0% on qualified dividends', () => {
    const holdings = [{ dividendType: 'Qualified', annualIncome: 10000 }]
    const tax = calculateTaxOwed(holdings, 'PR')
    expect(tax).toBe(0)
  })
  
  test('CA resident pays federal + state tax', () => {
    const holdings = [{ dividendType: 'Qualified', annualIncome: 10000 }]
    const tax = calculateTaxOwed(holdings, 'CA')
    const expected = (10000 * 0.15 + 10000 * 0.133) / 12
    expect(tax).toBeCloseTo(expected)
  })
})
```

### Integration Tests
- Form submissions save to database
- Portfolio calculations update correctly
- API calls handle errors gracefully

### E2E Tests
- Complete user flow from signup to dashboard
- Mobile responsive behavior
- PWA installation process

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
MARKET_DATA_API_KEY=
SENTRY_DSN=
```

### Performance Targets
- Lighthouse score > 90
- First paint < 2s
- Time to interactive < 3s
- Bundle size < 200KB (gzipped)

### Security
- Input validation on all forms
- SQL injection prevention (use Supabase RLS)
- XSS protection (React handles this)
- Rate limiting on API routes
- Secure authentication flow

---

## 📱 MOBILE CONSIDERATIONS

### Navigation Architecture
#### 5-Section Bottom Navigation Structure
```typescript
// Navigation state management
interface NavigationState {
  activeTab: 'dashboard' | 'portfolio' | 'income' | 'expenses' | 'strategy'
  tabHistory: string[]
  swipeEnabled: boolean
  transitionDirection: 'left' | 'right' | 'none'
}

// Tab configuration
const NAV_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'ChartBarIcon',
    description: 'Daily confidence check',
    cardCount: 3
  },
  {
    id: 'portfolio',
    label: 'Portfolio', 
    icon: 'BriefcaseIcon',
    description: 'Holdings management',
    cardCount: 4
  },
  {
    id: 'income',
    label: 'Income',
    icon: 'CurrencyDollarIcon', 
    description: 'Cash flow focus',
    cardCount: 7
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: 'CreditCardIcon',
    description: 'Lifestyle management', 
    cardCount: 2
  },
  {
    id: 'strategy',
    label: 'Strategy',
    icon: 'CogIcon',
    description: 'Research & optimization',
    cardCount: 7
  }
]
```

#### Top Menu + FAB Structure
```typescript
// FAB (Floating Action Button) in top-right corner
interface FABAction {
  id: string
  label: string
  icon: string
  handler: () => void
}

const FAB_ACTIONS = [
  { id: 'add-holding', label: 'Add Holding', icon: 'PlusIcon' },
  { id: 'add-expense', label: 'Add Expense', icon: 'ReceiptTaxIcon' },
  { id: 'log-income', label: 'Log Income', icon: 'BanknotesIcon' },
  { id: 'quick-note', label: 'Quick Note', icon: 'PencilIcon' }
]
```

### Touch Targets
- Minimum 44x44px for all interactive elements
- Proper spacing between buttons
- Swipe gestures for month navigation
- Bottom navigation tabs: 48px height minimum
- FAB: 56x56px with proper touch area

### Responsive Breakpoints
```css
/* Mobile: 0-640px */
/* Tablet: 641-1024px */
/* Desktop: 1025px+ */
```

### Navigation Behavior
- **Swipe gestures**: Left/right swipe between adjacent tabs
- **Deep linking**: Each tab supports URL routing
- **State persistence**: Active tab remembered across sessions
- **Smooth transitions**: 300ms slide animations between tabs
- **Scroll position**: Maintained per tab when switching
- **Auto-hide**: Bottom nav hides on scroll down, shows on scroll up

### PWA Requirements
- manifest.json with all sizes
- Service worker for offline
- App shell caching strategy
- Push notification support

---

This guide should be updated as new features are implemented and technical decisions are made.