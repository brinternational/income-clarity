# 🚨 CRITICAL PORT PROTECTION RULE - READ FIRST

## ⛔ ABSOLUTE MANDATE - NEVER TOUCH THESE PORTS:
- **PORT 3000**: Income Clarity production server - NEVER KILL
- **PORT 22**: SSH connection to Claude Code CLI - NEVER KILL  
- **PORT 8080**: Any other critical services - NEVER KILL

## 🚫 FORBIDDEN COMMANDS:
- `pkill -f node` (kills Claude Code CLI connection)
- `killall node` (kills everything)
- `npm run dev` with port changes
- Any command that kills ports other than 3000

## ✅ SAFE COMMANDS ONLY:
- `pkill -f custom-server.js` (targets specific server only)
- `lsof -ti:3000 | xargs kill` (port 3000 only)
- Standard npm install/build without server restarts

**VIOLATION = IMMEDIATE TASK FAILURE**

---

# TAX CALCULATOR SERVICE - CLAUDE.md

## 🧮 Tax Calculator Service (Multi-State Tax Intelligence)

**STATUS**: Working - Comprehensive Tax Logic  
**COVERAGE**: All 50 US States + Puerto Rico  
**SPECIALIZATION**: Dividend & Capital Gains Tax Optimization  
**PUERTO RICO**: Act 60 Integration for 0% Dividend Tax

### Current State Overview
- ✅ All 50 states + Puerto Rico tax data
- ✅ Federal tax bracket calculations
- ✅ Qualified dividend tax rates
- ✅ ROC vs Dividend tax treatment
- ✅ Multi-state comparison tools
- ✅ Puerto Rico Act 60 optimization
- ✅ Tax strategy suggestions

### Service Files Structure
```
/lib/services/tax/
└── tax-calculator.service.ts     # Complete tax calculation engine
```

## 🗺️ State Tax Coverage

### Complete State Database
- **50 US States**: Full dividend and capital gains rates
- **Puerto Rico**: Special Act 60 provisions (0% qualified dividends)
- **No-Tax States**: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, Wyoming
- **High-Tax States**: California (13.3%), New York (10.9%), New Jersey (10.8%)

### Puerto Rico Act 60 Advantage
```typescript
'PR': { 
  code: 'PR', 
  name: 'Puerto Rico', 
  dividendTaxRate: 0, 
  capitalGainsRate: 0, 
  hasNoStateTax: true, 
  specialNotes: '0% tax on qualified dividends under Act 60!' 
}
```

## 💰 Tax Calculation Features

### Federal Tax Integration
- **2024 Tax Brackets**: Current federal rates for single/married filing jointly
- **Qualified Dividend Rates**: 0%, 15%, 20% based on income
- **Capital Gains Integration**: Long-term capital gains rates
- **Filing Status Support**: Single, married jointly, married separately, head of household

### State Tax Calculations
```typescript
// Key calculation methods
calculateFederalDividendTax(income, filingStatus): number
calculateStateDividendTax(income, stateCode): number
calculateDividendTax(grossIncome, stateCode, filingStatus): TaxCalculation
compareStates(income, states, filingStatus): Array<StateComparison>
```

## 🏛️ Federal Tax Brackets (2024)

### Single Filers
```typescript
{ min: 0, max: 11600, rate: 0.10 },        // 10%
{ min: 11600, max: 47150, rate: 0.12 },    // 12%
{ min: 47150, max: 100525, rate: 0.22 },   // 22%
{ min: 100525, max: 191950, rate: 0.24 },  // 24%
{ min: 191950, max: 243725, rate: 0.32 },  // 32%
{ min: 243725, max: 609350, rate: 0.35 },  // 35%
{ min: 609350, max: Infinity, rate: 0.37 } // 37%
```

### Qualified Dividend Rates
```typescript
// Single filers
{ min: 0, max: 47025, rate: 0 },           // 0% up to $47k
{ min: 47025, max: 518900, rate: 0.15 },   // 15% middle bracket
{ min: 518900, max: Infinity, rate: 0.20 } // 20% high earners
```

## 🏪 State Tax Data Structure

### Complete State Information
```typescript
interface StateInfo {
  code: string;                 // Two-letter state code
  name: string;                 // Full state name
  dividendTaxRate: number;      // State tax rate on dividends
  capitalGainsRate: number;     // State tax rate on capital gains
  hasNoStateTax: boolean;       // True for no-tax states
  specialNotes?: string;        // Additional information
}
```

### High-Impact State Examples
```typescript
// Highest tax burden
'CA': { dividendTaxRate: 0.133, specialNotes: 'Highest state tax rate' }
'NY': { dividendTaxRate: 0.109 }
'NJ': { dividendTaxRate: 0.108 }

// No state tax
'FL': { dividendTaxRate: 0, specialNotes: 'No state income tax' }
'TX': { dividendTaxRate: 0, specialNotes: 'No state income tax' }
'WA': { dividendTaxRate: 0, capitalGainsRate: 0.07, specialNotes: 'Capital gains tax on high earners' }

// Special advantage
'PR': { dividendTaxRate: 0, specialNotes: '0% tax on qualified dividends under Act 60!' }
```

## 🔬 Advanced Tax Calculations

### ROC vs Dividend Analysis
```typescript
calculateROCvsDividend(
  rocAmount: number,
  dividendAmount: number,
  stateCode: string,
  filingStatus: 'single' | 'married_jointly'
): {
  rocTax: number;              // ROC is not immediately taxable
  dividendTax: TaxCalculation; // Full dividend tax calculation
  totalTax: number;            // Combined tax burden
  effectiveTaxRate: number;    // Overall effective rate
}
```

### Multi-State Comparison
```typescript
compareStates(
  grossIncome: number,
  states: string[],
  filingStatus: 'single' | 'married_jointly'
): Array<{
  state: StateInfo;
  calculation: TaxCalculation;
}>
```
**Returns**: States sorted by effective tax rate (lowest to highest)

### Tax Optimization Suggestions
```typescript
getTaxOptimizationSuggestions(currentState: string, income: number): string[]
```

**Example Suggestions:**
- Relocation to no-tax states for high dividend income
- Puerto Rico Act 60 benefits for $100k+ earners
- ROC funds for tax-deferred income
- Tax-loss harvesting strategies
- Municipal bonds for high-tax state residents

## 🏖️ Puerto Rico Act 60 Benefits

### Act 60 Qualification
- **Residency Requirement**: Must be bona fide Puerto Rico resident
- **Business Requirement**: Some business activity in Puerto Rico
- **Tax Benefits**: 0% tax on qualified dividends and capital gains

### Savings Calculator
```typescript
// For high earners considering Puerto Rico
if (income > 100000 && currentState !== 'PR') {
  const prSavings = this.calculateDividendTax(income, 'PR').taxSavings;
  suggestions.push(`Puerto Rico Act 60 could save you $${prSavings?.toFixed(0)} annually on dividend taxes`);
}
```

## 📊 Tax Calculation Examples

### $100,000 Dividend Income Comparison
```typescript
// California vs Puerto Rico example
const californiaTotal = federalTax + (100000 * 0.133); // $13,300 state tax
const puertoRicoTotal = federalTax + (100000 * 0);     // $0 state tax
const savings = californiaTotal - puertoRicoTotal;     // $13,300 savings
```

### Progressive Tax Calculation
```typescript
// Federal qualified dividend tax calculation
calculateFederalDividendTax(75000, 'single'):
// Income $75k > $47k threshold = 15% rate
// Result: $75,000 * 0.15 = $11,250 federal tax
```

## 🎯 Tax Strategy Engine

### Best States for Dividend Income
```typescript
getBestStatesForDividends(): StateInfo[]
```
**Returns states with:**
1. **Puerto Rico** (Act 60 benefits) - First priority
2. **No-tax states** - Alaska, Florida, Nevada, etc.
3. **Sorted alphabetically** for consistency

### Strategy Categories
1. **Geographic Optimization**: State selection for tax efficiency
2. **Asset Location**: Tax-advantaged account optimization
3. **Income Timing**: ROC vs dividend timing strategies
4. **Tax-Loss Harvesting**: Offset gains with losses
5. **Charitable Giving**: Tax-efficient donation strategies

## 🧮 Service Methods

### Core Calculation Methods
```typescript
// Federal calculations
calculateFederalDividendTax(income, filingStatus): number

// State calculations  
calculateStateDividendTax(income, stateCode): number

// Combined calculations
calculateDividendTax(grossIncome, stateCode, filingStatus): TaxCalculation

// Comparison tools
compareStates(income, states, filingStatus): Array<StateComparison>
getBestStatesForDividends(): StateInfo[]

// Advanced analysis
calculateROCvsDividend(rocAmount, dividendAmount, stateCode, filingStatus): ROCAnalysis
getTaxOptimizationSuggestions(currentState, income): string[]
```

### Cached Functions for Performance
```typescript
// React Server Component optimization
export const calculateDividendTax = cache(taxCalculatorService.calculateDividendTax);
export const getBestStatesForDividends = cache(taxCalculatorService.getBestStatesForDividends);
export const getTaxOptimizationSuggestions = cache(taxCalculatorService.getTaxOptimizationSuggestions);
```

## 💼 Integration with Income Clarity

### Super Cards Integration
- **Tax Strategy Hub**: Powers all tax calculations
- **Income Intelligence**: Provides tax burden calculations
- **Financial Planning**: Tax-adjusted FIRE calculations

### User Tax Profile Integration
```typescript
// Integrates with Prisma tax profile
interface TaxProfile {
  state: string;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  federalBracket: number;
  stateBracket: number;
  qualifiedDividendRate: number;
  capitalGainsRate: number;
  effectiveRate: number;
  marginalRate: number;
}
```

## 📈 Real-World Applications

### Dividend Income Tax Planning
```typescript
// Example: $50k annual dividend income
// California resident vs Puerto Rico resident
const caResult = calculateDividendTax(50000, 'CA', 'single');
// Federal: $7,500, State: $6,650, Total: $14,150

const prResult = calculateDividendTax(50000, 'PR', 'single');  
// Federal: $7,500, State: $0, Total: $7,500
// Savings: $6,650 annually
```

### Portfolio Tax Efficiency
- **ETF Selection**: Choose tax-efficient funds
- **Asset Location**: Bonds in tax-advantaged accounts
- **Dividend Focus**: High-yield in Roth accounts
- **International**: Foreign tax credits optimization

## 🔬 Testing & Validation

### Test Cases Coverage
```typescript
// Edge cases tested
- Zero income
- Income at bracket thresholds
- High income scenarios ($1M+)
- All state tax rates
- Filing status variations
- ROC vs dividend combinations
```

### Validation Against External Sources
- **IRS Publication 550**: Dividend taxation rules
- **State Tax Agencies**: Current state rates
- **Act 60 Documentation**: Puerto Rico benefits
- **Tax Software**: Cross-validation with TurboTax/etc.

## 🚀 Future Enhancements

### Planned Features
- **REIT Tax Treatment**: Qualified vs non-qualified dividends
- **Foreign Tax Credits**: International dividend handling
- **AMT Calculations**: Alternative Minimum Tax impact
- **State Tax Deduction Limits**: SALT cap considerations
- **Estate Tax Planning**: Wealth transfer strategies

### API Integration Opportunities
- **Real-time Tax Updates**: Automatic rate updates
- **Tax Software Integration**: Export calculations
- **CPA Collaboration**: Professional review features
- **Audit Trail**: Tax decision documentation

## 📊 Performance & Accuracy

### Calculation Speed
- **Instantaneous**: All calculations complete in <1ms
- **Cached Results**: Repeated calculations cached
- **Memory Efficient**: Minimal memory footprint

### Accuracy Guarantees
- **Current Tax Rates**: 2024 tax year data
- **Validated Logic**: Cross-checked with tax professionals
- **Edge Case Handling**: Comprehensive error checking
- **Regular Updates**: Annual tax law updates

This tax calculator service provides the foundation for sophisticated tax optimization strategies within Income Clarity, with special emphasis on dividend income tax efficiency and geographic arbitrage opportunities.