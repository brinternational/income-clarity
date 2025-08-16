# Tax Efficiency Scoring Context - TAX-009

## Task Description
Implement a tax efficiency scoring system that grades portfolio and location combinations, providing clear recommendations for optimization. This is a KEY DIFFERENTIATOR that shows users how tax-smart their current setup is.

## Current State
- Tax Strategy Hub exists at `/components/dashboard/super-cards/TaxStrategyHub.tsx`
- Tax calculations work in `/lib/calculations/taxCalculations.ts`
- Location data available in Zustand store

## Scoring System Design

### Score Components (100 points total)
1. **Location Score** (40 points)
   - Puerto Rico: 40/40 (0% tax on dividends)
   - Texas/Florida/Nevada: 35/40 (0% state tax)
   - Washington/Tennessee: 30/40 (no income tax)
   - Low-tax states: 20-30/40
   - California/NY: 5-15/40 (high tax)

2. **Portfolio Composition Score** (30 points)
   - Qualified dividends %: Up to 20 points
   - Tax-efficient ETFs: Up to 10 points
   - Avoid ordinary dividends: Deduct points

3. **Account Type Score** (20 points)
   - Taxable account: Base score
   - IRA/401k optimization: Bonus points
   - Proper asset location: Full points

4. **Strategy Score** (10 points)
   - Tax loss harvesting: +3 points
   - ROC tracking: +3 points
   - Qualified holding periods: +4 points

### Grade Breakdown
- **A+ (95-100)**: Tax optimization genius! 
- **A (90-94)**: Excellent tax efficiency
- **B (80-89)**: Good, room for improvement
- **C (70-79)**: Average, missing opportunities
- **D (60-69)**: Poor efficiency, action needed
- **F (<60)**: Critical tax inefficiency

## Implementation Requirements

### Component Structure
```tsx
<TaxEfficiencyScore>
  <ScoreGauge score={85} grade="B" />
  <ScoreBreakdown>
    <CategoryScore name="Location" score={35} max={40} />
    <CategoryScore name="Portfolio" score={25} max={30} />
    <CategoryScore name="Accounts" score={15} max={20} />
    <CategoryScore name="Strategy" score={10} max={10} />
  </ScoreBreakdown>
  <Recommendations>
    <Recommendation priority="high">
      "Moving to Puerto Rico would save $12,000/year"
    </Recommendation>
    <Recommendation priority="medium">
      "Switch VXUS to VEU for better tax treatment"
    </Recommendation>
  </Recommendations>
</TaxEfficiencyScore>
```

### Visual Design
- Circular gauge showing score (like credit score)
- Color coding: Green (A), Blue (B), Yellow (C), Orange (D), Red (F)
- Bar charts for category breakdown
- Action items with potential savings

### Data Sources
From Zustand:
```typescript
const { taxState } = useTaxStore()  // User's state
const { holdings } = usePortfolioStore()  // Portfolio composition
const { settings } = useSettingsStore()  // Account types
```

### Calculation Logic
```typescript
function calculateTaxEfficiencyScore(data) {
  const locationScore = getLocationScore(data.state)
  const portfolioScore = getPortfolioScore(data.holdings)
  const accountScore = getAccountScore(data.accounts)
  const strategyScore = getStrategyScore(data.strategies)
  
  const totalScore = locationScore + portfolioScore + accountScore + strategyScore
  const grade = getGrade(totalScore)
  
  return {
    score: totalScore,
    grade,
    breakdown: { location, portfolio, account, strategy },
    recommendations: generateRecommendations(data, scores)
  }
}
```

## Files to Create/Modify
- Create: `/components/dashboard/tax/TaxEfficiencyScore.tsx`
- Create: `/lib/calculations/taxEfficiencyScoring.ts`
- Modify: `/components/dashboard/super-cards/TaxStrategyHub.tsx` (add to Intelligence tab)

## Success Criteria
- [ ] Score calculated accurately based on 4 categories
- [ ] Visual gauge shows score and grade
- [ ] Category breakdown visible
- [ ] Personalized recommendations with savings
- [ ] Mobile responsive design
- [ ] Updates when user changes location/portfolio

## Priority: HIGH
This feature provides immediate value by showing users how tax-efficient they are and what specific actions would improve their score. It's a competitive differentiator that Snowball and other tools don't have.