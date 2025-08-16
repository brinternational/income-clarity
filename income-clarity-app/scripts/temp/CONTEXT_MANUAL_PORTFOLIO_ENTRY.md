# TASK CONTEXT: Complete Manual Portfolio Entry Feature

## YOUR SINGLE TASK
Implement a complete, accessible, performant Manual Portfolio Entry system that allows users to:
1. **Add new holdings** manually with real-time stock symbol validation
2. **Edit existing holdings** inline or via modal 
3. **Delete holdings** with confirmation
4. **Update quantities and prices** with live validation
5. **Validate stock symbols** against real stocks via Polygon API

## FILE LOCATIONS TO CREATE
- `/components/portfolio/ManualEntryForm.tsx` - Enhanced form with symbol validation
- `/components/portfolio/InlineEditHolding.tsx` - Inline editing capabilities  
- `/components/portfolio/DeleteHoldingModal.tsx` - Enhanced delete confirmation
- `/components/portfolio/SymbolValidator.tsx` - Real-time symbol validation component

## FILE LOCATIONS TO MODIFY
- `/app/portfolio/page.tsx` - Integrate manual entry UI components
- `/components/portfolio/HoldingsList.tsx` - Add inline editing capabilities

## COMPLETE EXISTING PATTERNS TO FOLLOW

### Current Portfolio Page Structure (`/app/portfolio/page.tsx`):
```tsx
// STATE MANAGEMENT PATTERN
const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
const [holdings, setHoldings] = useState<Holding[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

// MODAL STATE PATTERN
const [showHoldingForm, setShowHoldingForm] = useState(false);
const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
const [deleteConfirmation, setDeleteConfirmation] = useState<{
  type: 'portfolio' | 'holding';
  item: Portfolio | Holding;
} | null>(null);

// API HANDLERS PATTERN
const handleHoldingFormSubmit = async (formData: any) => {
  if (!selectedPortfolio) return;
  try {
    const url = editingHolding 
      ? `/api/holdings/${editingHolding.id}`
      : `/api/portfolios/${selectedPortfolio.id}/holdings`;
    
    const method = editingHolding ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save holding');
    }

    setShowHoldingForm(false);
    setEditingHolding(null);
    await loadHoldings(selectedPortfolio.id);
    await loadPortfolios(); // Refresh portfolio totals
  } catch (err) {
    console.error('Error saving holding:', err);
    throw err;
  }
};
```

### HoldingForm Component Pattern (`/components/portfolio/HoldingForm.tsx`):
```tsx
// FORM STATE PATTERN  
const [formData, setFormData] = useState({
  ticker: '',
  shares: '',
  costBasis: '',
  purchaseDate: '',
  currentPrice: '',
  dividendYield: '',
  sector: '',
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// VALIDATION PATTERN
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validate form
    if (!formData.ticker.trim()) {
      throw new Error('Stock ticker is required');
    }

    if (!formData.shares || isNaN(parseFloat(formData.shares)) || parseFloat(formData.shares) <= 0) {
      throw new Error('Valid number of shares is required');
    }

    // Submit form with proper data types
    const submitData: any = {
      ticker: formData.ticker.trim().toUpperCase(),
      shares: parseFloat(formData.shares),
      costBasis: parseFloat(formData.costBasis),
      purchaseDate: formData.purchaseDate,
    };

    // Add optional fields if provided
    if (formData.currentPrice) {
      submitData.currentPrice = parseFloat(formData.currentPrice);
    }

    await onSubmit(submitData);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};

// INPUT COMPONENT PATTERN
<input
  type="text"
  value={formData.ticker}
  onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  placeholder="e.g., AAPL, MSFT, VTI"
  required
  disabled={loading}
/>
```

### API Endpoints Available:

**POST `/api/portfolios/[id]/holdings`** - Add new holding:
```tsx
// Request body validation:
if (!ticker || !shares || !costBasis || !purchaseDate) {
  return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
}

// Duplicate check:
const existingHolding = await prisma.holding.findFirst({
  where: { portfolioId: id, ticker: ticker.toUpperCase() }
});
if (existingHolding) {
  return NextResponse.json({ error: `Holding for ${ticker} already exists` }, { status: 400 });
}

// Creates holding with calculated values
const holding = await prisma.holding.create({
  data: {
    portfolioId: id,
    ticker: ticker.toUpperCase(),
    shares: parseFloat(shares),
    costBasis: parseFloat(costBasis),
    purchaseDate: new Date(purchaseDate),
    currentPrice: currentPrice ? parseFloat(currentPrice) : null,
    dividendYield: dividendYield ? parseFloat(dividendYield) : null,
    sector: sector?.trim() || null,
  },
});
```

**GET `/api/stock-prices?symbol=AAPL`** - Stock validation:
```tsx
// Returns stock data with validation:
{
  symbol: "AAPL",
  price: 150.25,
  valid: true,
  sector: "Technology", 
  dividendYield: 0.52,
  dataSource: "polygon"
}
```

**PUT `/api/holdings/[id]`** - Update holding
**DELETE `/api/holdings/[id]`** - Delete holding

### Database Schema:
```prisma
model Holding {
  id            String   @id @default(uuid())
  portfolioId   String
  ticker        String   // Stock symbol (validated)
  shares        Float    // Number of shares (decimal support)
  costBasis     Float    // Price per share at purchase
  purchaseDate  DateTime // When bought
  currentPrice  Float?   // Latest price (optional)
  dividendYield Float?   // Annual yield % (optional)
  sector        String?  // Stock sector (auto-populated)
  portfolio     Portfolio @relation(...)
}
```

### UI Design System:
```tsx
// Primary button
"bg-blue-600 hover:bg-blue-700 text-white"

// Success button  
"bg-green-600 hover:bg-green-700 text-white"

// Danger button
"bg-red-600 hover:bg-red-700 text-white"

// Form input
"border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"

// Modal backdrop
"bg-black/50"

// Card styling
"bg-white dark:bg-gray-800 rounded-lg shadow"

// Success color
"text-green-600"

// Error color  
"text-red-600"
```

### Super Cards Form Pattern (for advanced features):
```tsx
// Tab-based navigation
const [activeTab, setActiveTab] = useState<TabType>('form');

// Touch/mobile support
const [touchStart, setTouchStart] = useState<number>(0);
const [isMobile, setIsMobile] = useState(false);

// Animation with framer-motion
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

## ENHANCED REQUIREMENTS (BEYOND BASIC FORM)

### 1. Real-time Symbol Validation
- **Debounced API calls** to `/api/stock-prices?symbol=X`
- **Visual feedback**: green checkmark for valid, red X for invalid
- **Auto-populate** sector and dividend yield when symbol is valid
- **Loading spinner** during validation
- **Error handling** for API failures

### 2. Inline Editing Capabilities  
- **Click to edit** shares and cost basis directly in table
- **Save/cancel buttons** appear on edit mode
- **Optimistic updates** with rollback on error
- **Keyboard support**: Enter to save, Escape to cancel
- **Mobile-friendly** touch interactions

### 3. Enhanced Delete Experience
- **Confirmation modal** with holding details
- **Soft delete animation** before removal  
- **Undo option** for 5 seconds after delete
- **Batch delete** option for multiple holdings
- **Warning messages** for important holdings

### 4. Performance Optimizations
- **Lazy load** form components
- **Debounce** all API calls (300ms)
- **Virtual scrolling** for large holdings lists  
- **Code splitting** for manual entry components
- **Memoized calculations** for totals
- **Optimistic UI updates** throughout

### 5. Accessibility Requirements
- **Screen reader** support with proper ARIA labels
- **Keyboard navigation** for all interactions
- **Focus management** in modals
- **High contrast** colors that pass WCAG 2.1 AA
- **Error announcements** via aria-live regions
- **Touch targets** minimum 44x44px
- **Form validation** messages properly associated

### 6. Advanced Features to Implement
- **Duplicate detection** with merge option
- **Bulk import** from CSV data  
- **Quick actions** menu on right-click
- **Keyboard shortcuts** for common actions
- **Auto-save draft** functionality
- **Recent symbols** suggestions
- **Portfolio balancing** recommendations

## ACCEPTANCE CRITERIA CHECKLIST
✅ Users can add holdings with real-time symbol validation
✅ Symbol validation shows loading/success/error states
✅ Auto-populates sector and yield for valid symbols
✅ Users can edit holdings inline (shares, cost basis)
✅ Users can edit all fields via modal
✅ Users can delete holdings with confirmation
✅ All operations show loading/success/error states
✅ Mobile responsive design works perfectly
✅ Keyboard navigation works for all features
✅ Screen reader announces all changes
✅ Performance: <100ms interaction delay
✅ No console errors or warnings
✅ Proper error handling for all edge cases
✅ Works with existing portfolio display
✅ Follows exact UI design system patterns

## TECHNICAL IMPLEMENTATION NOTES
- Use **existing HoldingForm as base** but enhance with validation
- **Reuse existing API endpoints** - no new APIs needed
- **Follow Super Cards patterns** for advanced UI interactions
- **Implement debouncing** for all user inputs
- **Use framer-motion** for smooth animations
- **Implement optimistic updates** with error rollback
- **Add proper TypeScript types** for all components
- **Include comprehensive error boundaries**
- **Add loading skeletons** during data fetches
- **Implement proper cleanup** on component unmount

This is a critical user-facing feature. Build with highest quality standards focusing on user experience, accessibility, and performance.