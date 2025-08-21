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

# Financial Planning Feature - Context Documentation

## Overview
This folder contains all financial planning and goal-setting functionality for the Income Clarity application, including FIRE calculations, milestone tracking, and scenario modeling.

## Folder Structure
```
features/financial-planning/
├── api/                    # Financial planning API endpoints
├── components/            # Planning UI components
│   ├── hooks/            # Planning-specific hooks
│   └── utils/            # Planning calculations
├── hooks/                # Financial planning hooks
├── services/             # Planning business logic
│   └── milestone-tracker.service.ts
└── types/               # Planning type definitions
```

## Key Components
- **FinancialPlanningHub.tsx**: Main planning dashboard
- **CoastFICalculator.tsx**: Coast FIRE calculations
- **GoalPlanningInterface.tsx**: Goal setting and tracking
- **MilestoneCelebrations.tsx**: Achievement tracking
- **WhatIfScenarios.tsx**: Scenario modeling tool
- **AboveZeroTracker.tsx**: Net worth progression

## Key Features
1. **FIRE Planning**: Financial Independence Retire Early calculations
2. **Goal Tracking**: Custom financial milestones
3. **Scenario Modeling**: What-if analysis for different life events
4. **Coast FIRE**: Calculate when you can stop contributing
5. **Milestone Celebrations**: Gamification of financial progress

## Planning Calculations
- **Traditional FIRE**: 25x annual expenses
- **Coast FIRE**: Amount needed to reach FIRE at retirement age
- **Lean FIRE**: Lower expense FIRE target
- **Fat FIRE**: Higher expense FIRE target
- **Barista FIRE**: Partial financial independence

## Integration Points
- **Portfolio Performance**: Real returns for projections
- **Income Intelligence**: Income growth projections
- **Tax Strategy**: Tax-efficient withdrawal planning
- **Expense Tracking**: Accurate expense ratios for FIRE calculations

## Milestone Categories
1. **Net Worth Milestones**: $10k, $50k, $100k, $500k, $1M+
2. **Income Milestones**: Dividend income targets
3. **Savings Rate**: Percentage of income saved
4. **Emergency Fund**: 3-12 months of expenses
5. **Custom Goals**: User-defined financial targets

## Scenario Modeling
The planning engine supports modeling for:
- Job changes and income variations
- Market downturns and recoveries
- Inflation rate changes
- Life events (marriage, children, home purchase)
- Economic cycles and timing

## Development Notes
- Uses Monte Carlo simulations for probability analysis
- Integrates with real portfolio performance data
- Milestone tracking includes email notifications
- All projections include inflation adjustments