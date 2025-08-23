# Dashboard Components Context

## 🚨 CRITICAL BUG - CONTRAST FAILURE (Aug 23, 2025)
**Components HERE have broken dark mode:**
- **IncomeClarityCard.tsx** - Missing dark:from-slate-800 dark:to-slate-900 on gradients
- **ExpenseMilestones.tsx** - Missing dark variants on bg-gradient classes

**PATTERN TO FIX:**
```tsx
// Add dark variants to ALL gradient backgrounds:
className="bg-gradient-to-br from-primary-50 to-primary-25 dark:from-slate-800 dark:to-slate-900"

// Add dark variants to ALL text colors:
className="text-primary-600 dark:text-white"
```

**DO NOT:** Try to fix with CSS overrides or JavaScript
**DO:** Add dark: variants directly in the component className strings