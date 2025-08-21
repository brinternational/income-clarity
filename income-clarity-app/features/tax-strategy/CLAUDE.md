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

# Tax Strategy Feature - Context Documentation

## Overview
This folder contains all tax strategy and optimization functionality for the Income Clarity application, including multi-state tax comparisons, strategy analysis, and tax-efficient planning tools.

## Folder Structure
```
features/tax-strategy/
├── api/                    # Tax strategy API endpoints
├── components/            # Tax strategy UI components
│   └── strategy/         # Strategy comparison components
├── hooks/                # Tax-specific hooks
├── services/             # Tax calculation services
│   └── tax-calculator.service.ts
└── types/               # Tax strategy type definitions
```

## Key Components
- **TaxStrategyHub.tsx**: Main tax strategy dashboard
- **MultiStateTaxComparison.tsx**: State-by-state tax comparison
- **StrategyComparisonEngine.tsx**: Tax strategy analysis
- **FourStrategyAnalysis.tsx**: Four primary tax strategies comparison
- **LocationBasedWinner.tsx**: Optimal location analysis

## Key Features
1. **Multi-State Tax Comparison**: Compare tax implications across different states
2. **Strategy Analysis**: Traditional vs Roth vs Taxable vs HSA comparisons
3. **Tax Optimization**: Recommendations based on user profile
4. **Location Intelligence**: State tax impact analysis
5. **ROC Tracking**: Return on capital tracking for tax efficiency

## Tax Strategies Analyzed
1. **Traditional IRA/401k**: Tax-deferred growth
2. **Roth IRA/401k**: Tax-free growth
3. **Taxable Accounts**: Flexible access with tax efficiency
4. **HSA Strategy**: Triple tax advantage for healthcare expenses

## Integration Points
- **Portfolio Data**: Holdings analysis for tax-loss harvesting
- **Income Intelligence**: Tax impact on dividend strategies
- **Financial Planning**: Tax-efficient withdrawal strategies
- **User Profile**: Tax bracket and state residency considerations

## Tax Calculation Engine
The `tax-calculator.service.ts` handles:
- Federal and state tax calculations
- Alternative Minimum Tax (AMT) considerations
- Social Security tax implications
- Medicare tax calculations
- State-specific deductions and credits

## Development Notes
- Tax calculations use current tax year brackets
- State tax data is updated annually
- Strategy comparisons use Monte Carlo simulations
- All tax advice is for informational purposes only