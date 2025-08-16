# Tax Strategy Components

This directory contains the tax strategy components for Income Clarity's Super Cards system, featuring the **StrategyComparisonEngine** - the application's core competitive moat.

## 🏆 StrategyComparisonEngine

The crown jewel component that compares 4 investment strategies across all tax jurisdictions to show users the optimal approach for maximizing after-tax income.

### Key Features

- **4-Strategy Comparison**: SPY sell, dividend portfolio, covered calls, 60/40 bonds
- **Tax Intelligence**: Real-time calculations for all 50 states + US territories
- **Puerto Rico Advantage**: Special highlighting of 0% qualified dividend rates
- **Winner Detection**: Automatically identifies and celebrates the best strategy
- **10-Year Projections**: Shows cumulative advantage over time
- **Mobile Responsive**: Touch-optimized with smooth animations

### Usage

```tsx
import { StrategyComparisonEngine } from '@/components/super-cards/tax';

<StrategyComparisonEngine
  annualIncome={100000}      // Portfolio value for calculations
  location="CA"              // State/territory code (CA, TX, PR, etc.)
  filingStatus="single"      // 'single' | 'marriedJoint'
  showActions={true}         // Enable export/share buttons
  className="custom-class"   // Additional styling
/>
```

### Strategy Details

| Strategy | Tax Treatment | Risk Level | Best For |
|----------|--------------|------------|----------|
| **Sell SPY** | Capital gains (0%, 15%, 20%) | Medium | Growth investors, low-tax states |
| **Dividends** | Qualified dividends (0%, 15%, 20%) | Low | Long-term wealth builders, PR residents |
| **Covered Calls** | Ordinary income (10%-37%) | Medium | Income-focused, high-yield seekers |
| **60/40 Portfolio** | Mixed (70% qualified, 30% ordinary) | Medium | Balanced approach, diversification |

### Puerto Rico Special Case

The component automatically detects Puerto Rico (PR) location and:
- Displays special celebration animations 🎉
- Highlights the 0% tax advantage under Act 60
- Shows dramatic savings compared to mainland US

### Interactive Features

- **Strategy Cards**: Click to expand detailed breakdowns
- **Winner Badge**: Animated trophy for optimal strategy
- **Tax Breakdown**: Federal vs state tax visualization
- **Pros/Cons**: Balanced analysis of each approach
- **10-Year Chart**: Toggle projection view
- **Export**: Download comparison as CSV
- **Share**: Native sharing functionality

### Real-Time Calculations

The engine performs sophisticated tax calculations:

1. **Federal Taxes**: Uses 2024 tax brackets for qualified/ordinary income
2. **State Taxes**: Applies state-specific rates and rules
3. **Mixed Treatment**: Handles complex scenarios like 60/40 portfolios
4. **Effective Rates**: Shows true tax burden as percentage

### Animation System

- **Winner Celebration**: Trophy rotation and glow effects
- **Puerto Rico Party**: Confetti and special messaging
- **Smooth Transitions**: Framer Motion for professional UX
- **Progressive Disclosure**: Expand/collapse with height animations

### Performance

- **Memoized Calculations**: Prevents unnecessary re-computation
- **Optimized Rendering**: Only re-renders when props change
- **Small Bundle Size**: Tree-shakable, minimal dependencies
- **Mobile Optimized**: Touch targets and responsive design

## 📱 Mobile Considerations

The component is fully mobile-responsive with:
- Stack layout on small screens
- Touch-optimized buttons and interactions
- Condensed information hierarchy
- Swipe-friendly expandable cards

## 🧮 Tax Calculation Engine

Built on top of `/lib/state-tax-rates.ts`:
- Complete state tax rate database
- Federal bracket calculations
- Qualified vs ordinary income handling
- Territory special provisions (PR Act 60)

## 🎨 Design System

Follows Income Clarity design principles:
- **Green**: Success, winning strategies, positive outcomes
- **Amber/Yellow**: Puerto Rico advantage, special alerts
- **Blue**: Information, neutral content
- **Red**: Cautions, lower-performing strategies
- **Tailwind CSS**: Utility-first styling

## 🚀 Integration

This component integrates with:
- **Super Cards System**: Part of the Tax Strategy Hub
- **User Profile Context**: Automatic location detection
- **State Management**: Zustand for data persistence
- **Analytics**: Track strategy comparisons and winners

## 🎯 Business Impact

This is Income Clarity's **primary competitive moat**:
- Unique tax-aware strategy comparison
- No competitor offers location-based optimization
- Drives user retention and premium conversion
- Creates "aha moments" for tax savings

---

*This component represents the core value proposition of Income Clarity - helping users optimize their investment strategy based on their specific tax situation.*