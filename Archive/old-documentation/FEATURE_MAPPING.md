# FEATURE MAPPING GUIDE
*Links APP_STRUCTURE_BLUEPRINT.md items to implementation details*

## 📍 HOW TO USE THIS GUIDE

1. Find the feature in APP_STRUCTURE_BLUEPRINT.md
2. Look it up here to find:
   - Technical requirements
   - Code location
   - Implementation status
   - Dependencies

---

## ⭐ STRATEGIC PRIORITY CARDS (NEW)
> 📖 **STATUS**: High-priority additions for competitive advantage
> 🎯 **PURPOSE**: Transform app from tracker → advisor with proactive intelligence
> 📊 **IMPACT**: Addresses core customer pain points from Business Strategy Agent analysis

### 💰 Tax Savings Calculator Card
> 💻 **Code Location**: `/components/dashboard/TaxSavingsCalculator.tsx` - **NEEDS IMPLEMENTATION**
> 📊 **Data Model**: TaxSavingsAnalysis interface needed in `/lib/types.ts`
> 🧮 **Logic**: Real-time tax drag comparison across states
> 🎯 **Customer Impact**: "Moving to Puerto Rico saves you $2,400/year" alerts

**Technical Requirements**:
```typescript
interface TaxSavingsAnalysis {
  currentLocation: string
  currentTaxDrag: number // Monthly tax cost
  optimalLocation: string
  potentialSavings: number // Annual savings
  relocationROI: number // Break-even timeline
  stateComparison: StateComparison[]
}

interface StateComparison {
  state: string
  monthlyTaxDrag: number
  annualSavings: number
  taxEfficiencyScore: number
}
```

### 🎯 FIRE Progress Card
> 💻 **Code Location**: `/components/dashboard/FIREProgress.tsx` - **NEEDS IMPLEMENTATION**
> 📊 **Data Model**: FIRECalculation interface needed in `/lib/types.ts`
> 🧮 **Logic**: FI number calculation based on expenses + time projections
> 🎯 **Customer Impact**: "You're 23% to financial independence" progress motivation

**Technical Requirements**:
```typescript
interface FIRECalculation {
  fiNumber: number // 25x annual expenses
  currentPortfolio: number
  fiProgress: number // Percentage complete
  timeToFI: number // Years remaining
  monthlyContribution: number
  accelerationScenarios: AccelerationScenario[]
}

interface AccelerationScenario {
  additionalMonthly: number
  yearsShaved: number
  newFIDate: Date
}
```

### 📊 Income Stability Score Card  
> 💻 **Code Location**: `/components/dashboard/IncomeStability.tsx` - **NEEDS IMPLEMENTATION**
> 📊 **Data Model**: IncomeStabilityAnalysis interface needed in `/lib/types.ts`
> 🧮 **Logic**: Dividend reliability scoring + volatility analysis
> 🎯 **Customer Impact**: "Your income is 87% stable" confidence rating

**Technical Requirements**:
```typescript
interface IncomeStabilityAnalysis {
  overallStabilityScore: number // 0-100
  incomeVolatility: number
  dividendCutRisk: DividendRisk[]
  diversificationScore: number
  recessionProofPercentage: number
  stabilityTrend: 'improving' | 'stable' | 'declining'
}

interface DividendRisk {
  symbol: string
  cutProbability: number // 0-100
  sustainabilityScore: number
  riskFactors: string[]
}
```

### ⚖️ Strategy Health Card
> 💻 **Code Location**: `/components/dashboard/StrategyHealth.tsx` - **NEEDS IMPLEMENTATION**
> 📊 **Data Model**: StrategyHealthAnalysis interface needed in `/lib/types.ts`
> 🧮 **Logic**: Multi-factor strategy efficiency scoring
> 🎯 **Customer Impact**: "Strategy efficiency score 87/100" advisory positioning

**Technical Requirements**:
```typescript
interface StrategyHealthAnalysis {
  overallScore: number // 0-100
  taxEfficiency: number
  incomeReliability: number
  riskOptimization: number
  diversificationScore: number
  recommendedActions: StrategyRecommendation[]
}

interface StrategyRecommendation {
  action: string
  impact: number // Projected score improvement
  priority: 'high' | 'medium' | 'low'
  reasoning: string
}
```

### 🔄 Rebalancing Intelligence Card
> 💻 **Code Location**: `/components/dashboard/RebalancingIntelligence.tsx` - **NEEDS IMPLEMENTATION**
> 📊 **Data Model**: RebalancingRecommendation interface needed in `/lib/types.ts`
> 🧮 **Logic**: Tax-optimized rebalancing timing + drift analysis
> 🎯 **Customer Impact**: "Buy $500 more SCHD" actionable recommendations

**Technical Requirements**:
```typescript
interface RebalancingRecommendation {
  isDriftSignificant: boolean
  driftPercentage: number
  recommendedActions: RebalanceAction[]
  taxOptimizedTiming: Date
  projectedImpact: number
}

interface RebalanceAction {
  action: 'buy' | 'sell'
  symbol: string
  amount: number
  reasoning: string
  taxImpact: number
  urgency: 'immediate' | 'soon' | 'monitor'
}
```

## 🧠 TAX INTELLIGENCE ENGINE
> 📖 **IMPLEMENTED**: One of the key competitive advantages implemented 
> 💻 **Code Location**: `/app/working/page.tsx:2743-3333` (TaxIntelligence component)
> 🎨 **UI Integration**: Toggle button in dashboard to show/hide the engine
> 📊 **Data Structure**: etfTaxDatabase with 9 popular ETFs classified by tax treatment

### Technical Implementation Details
**Database Structure**:
```typescript
// ETF Tax Database - Lines 2750-2820
const etfTaxDatabase = {
  // Qualified Dividend ETFs (0-20% federal tax)
  'SCHD': { 
    name: 'Schwab US Dividend Equity ETF', 
    type: 'Qualified', 
    currentYield: 3.5, 
    qualifiedPercent: 100, 
    taxEfficiencyScore: 95,
    description: 'Premium dividend aristocrats, 100% qualified dividends'
  },
  // ... 8 more ETFs with full tax classification
}
```

**Tax Calculation Formula**:
```typescript
// After-tax yield calculation - Lines 2823-2837
const calculateAfterTaxYield = (etf, location) => {
  const federalQualifiedRate = 0.15 // 15% for most investors
  const federalOrdinaryRate = 0.22 // 22% bracket assumption
  const stateRate = getStateTaxRate(location) / 100

  const qualifiedIncome = etf.currentYield * (etf.qualifiedPercent / 100)
  const ordinaryIncome = etf.currentYield * ((100 - etf.qualifiedPercent) / 100)

  const federalTaxOnQualified = qualifiedIncome * federalQualifiedRate
  const federalTaxOnOrdinary = ordinaryIncome * federalOrdinaryRate
  const stateTaxOnAll = etf.currentYield * stateRate

  const totalTax = federalTaxOnQualified + federalTaxOnOrdinary + stateTaxOnAll
  return etf.currentYield - totalTax
}
```

### Key Features Implemented
- **ETF Classification Database**: 9 ETFs (SCHD, VYM, DGRO, JEPI, QYLD, XYLD, VNQ, SCHH)
- **Tax Efficiency Scoring**: 0-100 scale for each ETF based on tax treatment
- **Side-by-side Comparisons**: SCHD vs JEPI, VYM vs QYLD, DGRO vs XYLD
- **Location-based Optimization**: Shows why SCHD beats JEPI in PR but not in CA
- **Puerto Rico Advantage Calculator**: Shows annual savings potential
- **Smart Recommendations**: Tailored advice based on tax location
- **Premium UI Design**: Glassmorphism cards, gradients, animations

### Dependencies
- **Tax Location**: Uses getStateTaxRate() function for state-specific calculations
- **Portfolio Holdings**: Calculates potential tax savings on user's portfolio
- **Theme System**: Integrates with the app's dynamic theming

---

## 🔐 AUTH FLOW

### Login page with demo button
- **Location**: `/app/login/page.tsx` (to be created)
- **Tech**: Supabase Auth with magic link
- **Demo Mode**: Bypass auth, use mock data
- **Code Example**:
```typescript
const handleDemoLogin = () => {
  setUser({ 
    id: 'demo-user',
    email: 'demo@example.com',
    isDemo: true 
  })
  router.push('/dashboard')
}
```

---

## 📱 MAIN LAYOUT

### Header Components
- **PWA Install Button**: `/app/working/page.tsx:991-1051`
  - Uses beforeinstallprompt event
  - Shows only when installable
  - Hides when already installed

### Enhanced PWA Top Menu (COMPLETED 2025-08-06)
- **Connection Status Indicator**: PWAHeader component - Show online/offline/syncing state
- **Enhanced PWA Install Button**: PWAHeader component - More prominent when not installed
- **Share Button**: ShareButton component - Web Share API integration for portfolio sharing
- **Notification Bell**: PWAHeader component - In-app notification center with badges
- **+ FAB (Floating Action Button)**: **NEEDS IMPLEMENTATION** - Quick actions positioned in top-right corner:
  - Add Holding
  - Add Expense
  - Log Income
  - Quick Note

### Mobile Bottom Navigation (PLANNED 5-SECTION STRUCTURE)
> 💻 **Code Location**: `/components/navigation/BottomNavigation.tsx` - **NEEDS IMPLEMENTATION**
> 🎨 **UI Pattern**: Fixed bottom navigation with 5 tabs
> 📊 **Data Model**: Navigation state management needed

#### Navigation Structure:
- **📊 Dashboard Tab** - Daily confidence check ("Am I winning? Am I covered?")
  - SPY Comparison Card (emotional validation)
  - Income Clarity Card (core anxiety relief)
  - Portfolio Overview Card (quick health check)

- **💼 Portfolio Tab** - Holdings management ("How are my investments performing?")
  - Holdings Performance Card (individual vs SPY)
  - Portfolio Holdings Form (add/edit holdings)
  - Margin Intelligence Card (leverage analysis)
  - **🔄 Rebalancing Intelligence Card** (strategic addition)

- **💰 Income Tab** - Cash flow focus ("How much am I actually making after taxes?")
  - Income Clarity Card (enhanced version)
  - Dividend Calendar Card (payment schedule)
  - Tax Planning Card (quarterly estimates)
  - **🎯 FIRE Progress Card** (strategic addition)
  - **📊 Income Stability Score Card** (strategic addition)

- **💳 Expenses Tab** - Lifestyle management ("What am I spending and what's covered?")
  - Expense Milestones Card (gamification)
  - Expenses Form (input/edit)
  - Above/Below Zero Tracking (future)

- **🧠 Strategy Tab** - Research & tax optimization ("What should I buy next? How do I optimize?")
  - Tax Intelligence Engine (state-specific recommendations)
  - **💰 Tax Savings Calculator Card** (strategic addition)
  - **⚖️ Strategy Health Card** (strategic addition)
  - Tax Settings (moved from profile)
  - Strategy Comparison Engine (future)

### Technical Requirements:
```typescript
interface NavigationState {
  activeTab: 'dashboard' | 'portfolio' | 'income' | 'expenses' | 'strategy'
  tabHistory: string[]
  swipeEnabled: boolean
}

interface TabContent {
  id: string
  label: string
  icon: string
  component: React.ComponentType
  cardCount: number
}
```

### Navigation Toggle
- **Current Implementation**: Simple button toggle
- **Enhancement Needed**: Smooth transitions, mobile drawer

---

## 👤 USER PROFILE SECTION
> 📖 **Comprehensive Profile Management**: All user settings consolidated into modal/page
> 💻 **Code Location**: `/components/profile/ProfileModal.tsx` - **NEEDS IMPLEMENTATION**
> 🎨 **UI Pattern**: Modal overlay with tabbed sections (Personal, Financial, Tax, Security, Privacy)
> 📊 **Data Structure**: ProfileSettings interface with nested objects

### Component Structure Needed
```typescript
/components/profile/
├── ProfileModal.tsx          // Main profile modal container
├── PersonalInfoSection.tsx   // Name, phone, email, avatar, timezone
├── FinancialProfileSection.tsx // Income targets, risk tolerance
├── TaxSettingsSection.tsx    // State selection, filing status, preferences
├── SecuritySection.tsx       // Password, 2FA, sessions, login history
├── NotificationSettings.tsx  // Email/SMS/push notification preferences
├── AppPreferences.tsx        // Theme, currency, date format
└── PrivacySettings.tsx       // Data export, account deletion
```

### Data Model Requirements
```typescript
interface ProfileSettings {
  personal: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    timezone: string;
  };
  financial: {
    monthlyExpenses: number;
    stressFreeLiving: number;
    coverageRatio: number;
    riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  };
  tax: {
    state: string;
    residencyStatus: 'Full-year' | 'Part-year' | 'Non-resident';
    filingStatus: 'Single' | 'MarriedFilingJointly' | 'MarriedFilingSeparately' | 'HeadOfHousehold';
    qualifiedDividendOptimization: boolean;
    taxLotMethod: 'FIFO' | 'LIFO' | 'SpecificID';
  };
  security: {
    twoFactorEnabled: boolean;
    connectedAccounts: string[];
    sessionCount: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    dividendAlerts: boolean;
    taxDeadlines: boolean;
  };
  preferences: {
    theme: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
  privacy: {
    dataSharing: boolean;
    marketingEmails: boolean;
    analyticsOptOut: boolean;
  };
}
```

### API Endpoints Needed
```typescript
// Profile management
POST /api/profile/update
POST /api/profile/avatar/upload
POST /api/profile/password/change
POST /api/profile/email/change

// Security
POST /api/security/2fa/setup
GET /api/security/sessions
DELETE /api/security/sessions/{id}
GET /api/security/login-history

// Privacy
GET /api/privacy/data-export
POST /api/privacy/account-delete
```

### Integration Points
- **Auth System**: Connects to existing SimpleAuth + Supabase
- **Theme System**: Uses existing ThemeSelector component
- **Onboarding**: Migrates data from onboarding flow
- **Dashboard**: Profile icon in header opens modal

### Implementation Priority
1. **Phase 1**: Basic profile modal with personal info and existing data
2. **Phase 2**: Security features (password change, 2FA)
3. **Phase 3**: Advanced settings (notifications, privacy)
4. **Phase 4**: Data management (export, deletion)

---

## 📈 PORTFOLIO HOLDINGS FORM

### Auto-fetch current prices (Not Implemented)
**Requirements**:
```typescript
// When user enters symbol
onSymbolChange = async (symbol: string) => {
  if (symbol.length >= 2) {
    const price = await fetchCurrentPrice(symbol)
    const dividend = await fetchDividendYield(symbol)
    updateHolding({ currentPrice: price, yieldPercentage: dividend })
  }
}
```

### Sector Allocation Display (Not Implemented)
**Visual**: Pie chart showing portfolio diversification
**Calculation**:
```typescript
const sectorBreakdown = holdings.reduce((acc, holding) => {
  const sector = holding.sector || 'Unknown'
  acc[sector] = (acc[sector] || 0) + holding.value
  return acc
}, {})
```

---

## 💰 EXPENSES FORM

### Expense Categories Dropdown (Not Implemented)
**Predefined Categories**:
- Housing (Rent, Mortgage, HOA)
- Utilities (Electric, Gas, Water, Internet)
- Transportation (Car, Insurance, Gas)
- Food (Groceries, Dining)
- Healthcare (Insurance, Medical)
- Entertainment (Subscriptions, Hobbies)
- Other

### Monthly vs Annual Toggle (Not Implemented)
**Implementation**:
```typescript
const monthlyAmount = isAnnual ? amount / 12 : amount
const annualAmount = isAnnual ? amount : amount * 12
```

---

## 📊 DASHBOARD FEATURES

### SPY Comparison Card

#### Time Period Selector (Not Implemented)
**UI**: Button group [1M | 3M | 6M | 1Y | 3Y | 5Y]
**Data Requirements**:
- Store historical portfolio values
- Fetch historical SPY data
- Calculate returns for each period

#### Interactive Chart Tooltips (Not Implemented)
**Library**: Recharts or Chart.js
**Features**:
- Hover to see exact values
- Show date, portfolio value, SPY value
- Display outperformance percentage

### Income Clarity Card

#### Tax Breakdown by Holding Type (Not Implemented)
**Display Format**:
```
Qualified Dividends: $1,200 → Tax: $180 (15%)
Covered Calls:       $400  → Tax: $88 (22%)
REITs:              $200  → Tax: $44 (22%)
Total Tax:          $312
```

#### Monthly vs Quarterly View (Not Implemented)
**Toggle**: Switch between monthly and quarterly tax estimates
**Quarterly**: Shows when taxes are due
**Monthly**: Shows amount to save each month

### Dividend Calendar

#### Dividend Reinvestment Tracking (Not Implemented)
**Features**:
- Track shares purchased with dividends
- Calculate compound growth
- Show reinvestment schedule

#### Tax Withholding Schedule (Not Implemented)
**Display**: When brokers withhold taxes
**International**: Show foreign tax withholding

---

## 🎯 MARGIN INTELLIGENCE

### Margin Call Probability (Not Implemented)
**Monte Carlo Simulation**:
```typescript
function calculateMarginCallProbability(
  marginPercent: number,
  volatility: number,
  timeHorizon: number
): number {
  // Run 10,000 simulations
  // Count how many hit maintenance margin
  // Return probability percentage
}
```

### Advanced Margin Strategies (Not Implemented)
**Comparison Table**:
- Box spread financing rates
- Portfolio line of credit rates
- Margin vs selling covered calls
- Tax implications of each

---

## 📈 ADVANCED ANALYTICS

### Tax Loss Harvesting (Not Implemented)
**Algorithm**:
```typescript
interface HarvestingOpportunity {
  holding: PortfolioHolding
  unrealizedLoss: number
  replacementETF: string
  taxSavings: number
  washSaleRisk: boolean
}

function findHarvestingOpportunities(
  holdings: PortfolioHolding[],
  taxBracket: number
): HarvestingOpportunity[] {
  // Find positions with losses
  // Suggest similar ETFs (avoid wash sale)
  // Calculate tax benefit
}
```

### Monte Carlo Projections (Not Implemented)
**Inputs**:
- Current portfolio value
- Monthly contributions
- Expected returns (with std dev)
- Time horizon

**Outputs**:
- Probability of reaching goal
- Range of possible outcomes
- Recommended adjustments

---

## 🔔 NOTIFICATIONS SYSTEM

### Dividend Payment Alerts (Not Implemented)
**Trigger**: Day of dividend payment
**Message**: "SCHD paid $245 today! 🎉"
**Channel**: Push notification + in-app

### Rebalancing Reminders (Not Implemented)
**Trigger**: When allocation drifts >5% from target
**Calculation**:
```typescript
const targetAllocation = { stocks: 60, bonds: 40 }
const currentAllocation = calculateCurrentAllocation()
const drift = Math.abs(currentAllocation.stocks - targetAllocation.stocks)
if (drift > 5) sendRebalancingAlert()
```

---

## 📱 PWA FEATURES

### Push Notifications (Not Implemented)
**Setup Required**:
1. Service worker registration
2. Notification permission request
3. VAPID keys generation
4. Backend notification service

### Background Sync (Not Implemented)
**Use Cases**:
- Sync portfolio data when connection restored
- Queue form submissions offline
- Update prices in background

### App Shortcuts (Not Implemented)
**manifest.json additions**:
```json
"shortcuts": [
  {
    "name": "View Dashboard",
    "url": "/dashboard",
    "icons": [{ "src": "/icon-96.png", "sizes": "96x96" }]
  },
  {
    "name": "Add Transaction",
    "url": "/add-transaction",
    "icons": [{ "src": "/icon-96.png", "sizes": "96x96" }]
  }
]
```

---

## 🗄️ DATA PERSISTENCE

### Supabase Integration (Not Implemented)
**Tables Needed**:
```sql
-- Users table handled by Supabase Auth

-- Portfolio Holdings
CREATE TABLE holdings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  symbol TEXT NOT NULL,
  shares INTEGER NOT NULL,
  avg_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dividend Payments
CREATE TABLE dividend_payments (
  id UUID PRIMARY KEY,
  holding_id UUID REFERENCES holdings,
  payment_date DATE,
  amount DECIMAL(10,2),
  amount_per_share DECIMAL(10,4)
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  category TEXT,
  amount DECIMAL(10,2),
  frequency TEXT
);
```

### Data Migration Tools (Not Implemented)
**Features**:
- Import from CSV
- Import from brokerage
- Export for taxes
- Backup/restore

---

## 🎨 UI/UX ENHANCEMENTS

### Skeleton Loading Screens (Not Implemented)
**Implementation**: Use react-loading-skeleton
**Apply to**:
- Dashboard cards while data loads
- Form submissions
- Chart rendering

### Smooth Animations (Not Implemented)
**Library**: Framer Motion
**Animations**:
- Card entrance (fade + slide)
- Progress bar fills
- Milestone achievements
- Number count-ups

### Accessibility Features (Not Implemented)
**Requirements**:
- ARIA labels on all interactive elements
- Focus indicators
- Screen reader announcements
- High contrast mode
- Reduced motion option

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (Not Implemented)
**Framework**: Jest + React Testing Library
**Coverage Target**: 80%
**Priority Tests**:
- Tax calculations
- Portfolio calculations
- Date/calendar logic
- Form validations

### E2E Tests (Not Implemented)
**Framework**: Playwright or Cypress
**Critical Paths**:
1. Onboarding flow
2. Add holding → see dashboard update
3. Change tax location → see tax recalculation
4. Mobile navigation

---

## 📈 ANALYTICS & TRACKING

### User Engagement Metrics (Not Implemented)
**Tool**: Mixpanel or Amplitude
**Key Events**:
- Daily active users
- Feature usage (which cards viewed)
- Form completion rates
- Error frequencies

### Performance Monitoring (Not Implemented)
**Tool**: Sentry or LogRocket
**Metrics**:
- Page load times
- API response times
- JavaScript errors
- Failed API calls

---

## 🚀 DEPLOYMENT

### Vercel Configuration
**Environment Variables**:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ALPHA_VANTAGE_API_KEY
SENTRY_DSN
```

**Build Settings**:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

---

This mapping guide should be continuously updated as features move from pending to implemented status.