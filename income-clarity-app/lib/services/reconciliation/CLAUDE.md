# 🔄 Data Reconciliation System Documentation

## 📋 Overview

The Data Reconciliation System handles the complex process of merging manual user data with automated Yodlee bank data when FREE users upgrade to PREMIUM. This system ensures data integrity, prevents duplicates, and provides intelligent conflict resolution.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Data Reconciliation Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FREE User Data     →    UPGRADE    →    PREMIUM User Data  │
│  ┌─────────────┐          ┌─────┐         ┌──────────────┐  │
│  │   Manual    │          │ ⚡  │         │ Manual +     │  │
│  │  Holdings   │    ────→ │ 🔄  │  ────→  │ Yodlee       │  │
│  │  Income     │          │ 🧠  │         │ (Reconciled) │  │
│  │  Expenses   │          │     │         │              │  │
│  └─────────────┘          └─────┘         └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components

### 1. Data Reconciler (`data-reconciler.service.ts`)
**Main orchestration engine** - Coordinates the entire reconciliation process.

**Key Methods:**
- `reconcileUserData()` - Main entry point for FREE → PREMIUM upgrade
- `reconcileHoldings()` - Match and merge holding data
- `reconcileIncomes()` - Match and merge income transactions
- `reconcileExpenses()` - Match and merge expense transactions
- `getReconciliationStatus()` - Check user's reconciliation state

**Flow:**
```typescript
// 1. Get user's manual data
const manualHoldings = await getManualHoldings(userId);
const yodleeHoldings = await getYodleeHoldings(userId);

// 2. Find matches using duplicate detector
const matches = await duplicateDetector.findHoldingMatches(
  manualHoldings, 
  yodleeHoldings
);

// 3. Resolve conflicts using conflict resolver
for (const match of matches) {
  const decision = await conflictResolver.getDefaultDecision(match);
  await applyHoldingDecision(match, decision);
}

// 4. Create new entries for unmatched Yodlee data
await createUnmatchedYodleeEntries();
```

### 2. Duplicate Detector (`duplicate-detector.service.ts`)
**Advanced matching algorithms** - Finds potential duplicates using multiple criteria.

**Matching Algorithms:**

#### Holdings Matching
| Criteria | Weight | Description |
|----------|--------|-------------|
| **Exact Ticker** | 40% | Symbol match (AAPL = AAPL) |
| **CUSIP Match** | 35% | Financial identifier |
| **ISIN Match** | 35% | International identifier |
| **Name Similarity** | 25% | Fuzzy name matching |
| **Sector Match** | 10% | Security type alignment |
| **Quantity Proximity** | 10% | Share count similarity |
| **Price Proximity** | 5% | Current price similarity |

#### Income/Expense Matching
| Criteria | Weight | Description |
|----------|--------|-------------|
| **Amount Match** | 50% | Transaction amount (±5% tolerance) |
| **Date Proximity** | 30% | Transaction date (±7 days) |
| **Source Similarity** | 20% | Merchant/source name |
| **Category Match** | 10% | Transaction category |

**Confidence Levels:**
- **HIGH (90%+)**: Very likely the same item
- **MEDIUM (70-89%)**: Possibly the same item  
- **LOW (50-69%)**: Uncertain match

### 3. Conflict Resolver (`conflict-resolver.service.ts`)
**Intelligent decision making** - Analyzes conflicts and selects optimal reconciliation strategy.

**Conflict Analysis:**
```typescript
interface ConflictAnalysis {
  hasConflicts: boolean;
  conflicts: {
    field: string;           // 'shares', 'amount', 'date'
    manualValue: any;
    yodleeValue: any;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: ReconciliationStrategy;
  }[];
  overallRecommendation: ReconciliationStrategy;
  confidence: MatchConfidence;
}
```

**Decision Matrix:**
| Confidence | Conflicts | Strategy |
|------------|-----------|----------|
| HIGH | None/Low | REPLACE_WITH_YODLEE |
| HIGH | Medium | MERGE_QUANTITIES |
| HIGH | High | KEEP_BOTH |
| MEDIUM | Any | KEEP_MANUAL |
| LOW | Any | KEEP_BOTH |

### 4. Reconciliation Strategies (`reconciliation-strategies.ts`)
**Strategy pattern implementation** - Defines how each reconciliation approach works.

## 🎯 Reconciliation Strategies

### KEEP_MANUAL
- **Purpose**: Preserve user's manually entered data
- **Risk**: LOW
- **Reversible**: ✅ Yes
- **Use Case**: User prefers their data or conflicts are concerning

```typescript
// Result: Manual data unchanged, marked as reconciled
{
  shares: manualHolding.shares,        // Original
  costBasis: manualHolding.costBasis,  // Original
  dataSource: DataSource.MANUAL,      // Unchanged
  isReconciled: true,                  // ✅ Marked
  yodleeAccountId: yodleeAccountId,    // Linked
}
```

### REPLACE_WITH_YODLEE
- **Purpose**: Use bank data for accuracy
- **Risk**: MEDIUM
- **Reversible**: ✅ Yes (original stored in metadata)
- **Use Case**: High confidence match with minimal conflicts

```typescript
// Result: Manual data replaced with Yodlee data
{
  shares: yodleeHolding.quantity,      // ✅ Updated
  costBasis: yodleeHolding.costBasis,  // ✅ Updated
  currentPrice: yodleeHolding.price,   // ✅ Updated
  dataSource: DataSource.YODLEE,      // ✅ Changed
  lastSyncedAt: new Date(),            // ✅ Current
  metadata: {
    originalManualData: {...}          // 🔄 Backup
  }
}
```

### MERGE_QUANTITIES
- **Purpose**: Combine quantities from both sources
- **Risk**: MEDIUM
- **Reversible**: ✅ Yes
- **Use Case**: User has partial positions in multiple accounts

```typescript
// Result: Combined quantities with weighted averages
const combinedShares = manualShares + yodleeShares;
const weightedCostBasis = (
  (manualCostBasis * manualShares) + 
  (yodleeCostBasis * yodleeShares)
) / combinedShares;

{
  shares: combinedShares,              // ✅ Combined
  costBasis: weightedCostBasis,        // ✅ Weighted avg
  dataSource: DataSource.MERGED,      // ✅ Marked
  metadata: {
    reconciliation: {
      manualShares,
      yodleeShares,
      combinedShares,
      method: 'weighted_average'
    }
  }
}
```

### KEEP_BOTH
- **Purpose**: Maintain separate entries
- **Risk**: LOW
- **Reversible**: ✅ Yes
- **Use Case**: Significant conflicts or low match confidence

```typescript
// Result: Manual entry preserved + new Yodlee entry created
// Manual entry:
{
  ...originalManualData,
  isReconciled: true,
  metadata: {
    hasYodleeCounterpart: true
  }
}

// New Yodlee entry:
{
  ...yodleeData,
  dataSource: DataSource.YODLEE,
  createdFrom: 'reconciliation'
}
```

## 🔄 Reconciliation Flow

### Phase 1: Data Collection
```typescript
const context: ReconciliationContext = {
  userId: 'user-123',
  manualHoldings: await getManualHoldings(userId),
  yodleeHoldings: await getYodleeHoldings(userId),
  manualIncomes: await getManualIncomes(userId),
  yodleeIncomes: await getYodleeIncomes(userId),
  // ... expenses
};
```

### Phase 2: Duplicate Detection
```typescript
for (const manualHolding of context.manualHoldings) {
  const matches = await duplicateDetector.findHoldingMatches(
    manualHolding,
    context.yodleeHoldings
  );
  
  // matches = [{
  //   yodleeData: {...},
  //   confidence: MatchConfidence.HIGH,
  //   score: 0.92,
  //   reasons: ['Exact ticker symbol match', 'Name similarity: 95%'],
  //   matchedFields: ['ticker', 'name']
  // }]
}
```

### Phase 3: Conflict Resolution
```typescript
for (const match of matches) {
  const decision = await conflictResolver.getDefaultDecision(
    manualHolding,
    match.yodleeData,
    match.confidence
  );
  
  // decision = {
  //   strategy: ReconciliationStrategy.REPLACE_WITH_YODLEE,
  //   confidence: MatchConfidence.HIGH,
  //   reason: 'Using Yodlee data for accuracy...',
  //   metadata: { factors: [...] }
  // }
}
```

### Phase 4: Strategy Execution
```typescript
await dataReconciler.applyHoldingDecision(
  manualHolding,
  yodleeHolding,
  decision
);
```

### Phase 5: Cleanup & Logging
```typescript
// Mark user as reconciled
await markUserAsReconciled(userId);

// Log all decisions
await logReconciliation(userId, 'HOLDING', decision);

// Update cache
await invalidateUserCache(userId);
```

## 📊 Matching Examples

### Example 1: Perfect Match
```typescript
// Manual Entry
{
  ticker: 'AAPL',
  name: 'Apple Inc',
  shares: 100,
  costBasis: 150.00
}

// Yodlee Entry
{
  symbol: 'AAPL',
  description: 'Apple Inc',
  quantity: 100,
  costBasis: { amount: 150.00 }
}

// Result: 100% match → REPLACE_WITH_YODLEE
```

### Example 2: Quantity Conflict
```typescript
// Manual Entry
{
  ticker: 'TSLA',
  shares: 50
}

// Yodlee Entry
{
  symbol: 'TSLA',
  quantity: 75
}

// Result: 95% match → MERGE_QUANTITIES (125 total shares)
```

### Example 3: Low Confidence
```typescript
// Manual Entry
{
  ticker: 'MSFT',
  name: 'Microsoft Corp',
  shares: 200
}

// Yodlee Entry
{
  symbol: 'MSFT',
  description: 'Microsoft Corporation',
  quantity: 50  // Very different quantity
}

// Result: 60% match → KEEP_BOTH
```

## 🛡️ Error Handling

### Reconciliation Safeguards
1. **Data Backup**: Original manual data always preserved in metadata
2. **Reversibility**: All strategies can be undone
3. **Validation**: Data integrity checks before applying changes
4. **Logging**: Complete audit trail of all decisions
5. **Rollback**: Failed reconciliations can be reverted

### Error Scenarios
```typescript
try {
  await dataReconciler.reconcileUserData(context);
} catch (error) {
  // Automatic rollback
  await rollbackReconciliation(userId, reconciliationId);
  
  // Log error
  await logReconciliationError(userId, error);
  
  // Notify user
  await notifyReconciliationFailed(userId, error.message);
}
```

## 📈 Performance Optimization

### Batch Processing
```typescript
// Process in batches to avoid memory issues
const BATCH_SIZE = 50;
const holdingBatches = chunk(holdings, BATCH_SIZE);

for (const batch of holdingBatches) {
  await processBatch(batch);
  await delay(100); // Prevent DB overload
}
```

### Caching Strategy
```typescript
// Cache Yodlee data during reconciliation
const yodleeCache = new Map();

// Cache duplicate detection results
const matchCache = new Map();

// Invalidate after reconciliation
await redis.del(`user:${userId}:holdings`);
```

## 🧪 Testing

### Unit Tests
```typescript
describe('DataReconciler', () => {
  it('should handle exact ticker matches', async () => {
    const result = await duplicateDetector.findHoldingMatches(
      manualHolding,
      [yodleeHolding]
    );
    
    expect(result[0].confidence).toBe(MatchConfidence.HIGH);
    expect(result[0].score).toBeGreaterThan(0.9);
  });
});
```

### Integration Tests
```typescript
describe('Full Reconciliation Flow', () => {
  it('should reconcile FREE to PREMIUM upgrade', async () => {
    // Setup test data
    await seedManualData(testUserId);
    await seedYodleeData(testUserId);
    
    // Run reconciliation
    const result = await dataReconciler.reconcileUserData(context);
    
    // Verify results
    expect(result.holdingsMatched).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
    
    // Check database state
    const holdings = await getHoldings(testUserId);
    expect(holdings.every(h => h.isReconciled)).toBe(true);
  });
});
```

## 📋 Usage Examples

### Basic Reconciliation
```typescript
import { dataReconciler } from '../reconciliation/data-reconciler.service';

// When user upgrades to premium
const result = await dataReconciler.reconcileUserData({
  userId: 'user-123',
  manualHoldings: await getManualHoldings('user-123'),
  yodleeHoldings: await getYodleeHoldings('user-123'),
});

console.log(`Reconciled ${result.totalProcessed} items`);
```

### Check Reconciliation Status
```typescript
const status = await dataReconciler.getReconciliationStatus('user-123');

if (!status.isReconciled) {
  console.log(`${status.pendingItems} items need reconciliation`);
}
```

### Custom Matching Criteria
```typescript
const matches = await duplicateDetector.findHoldingMatches(
  manualHolding,
  yodleeHoldings,
  {
    exactTicker: true,
    fuzzyName: true,
    amountTolerance: 10, // 10% tolerance
    dateRange: 14,       // 14 days
  }
);
```

## 🔧 Configuration

### Environment Variables
```bash
# Reconciliation settings
RECONCILIATION_BATCH_SIZE=50
RECONCILIATION_TIMEOUT=300000  # 5 minutes
RECONCILIATION_RETRY_ATTEMPTS=3

# Match thresholds
MATCH_CONFIDENCE_THRESHOLD=0.5
NAME_SIMILARITY_THRESHOLD=0.7
AMOUNT_TOLERANCE_PERCENT=5
DATE_RANGE_DAYS=7
```

### Database Schema Updates Required
```sql
-- Add reconciliation fields to existing tables
ALTER TABLE holdings ADD COLUMN is_reconciled BOOLEAN DEFAULT FALSE;
ALTER TABLE holdings ADD COLUMN reconciled_at TIMESTAMP NULL;
ALTER TABLE holdings ADD COLUMN yodlee_account_id VARCHAR(255) NULL;

-- Same for income and expense tables
ALTER TABLE income ADD COLUMN is_reconciled BOOLEAN DEFAULT FALSE;
ALTER TABLE income ADD COLUMN reconciled_at TIMESTAMP NULL;
ALTER TABLE income ADD COLUMN yodlee_transaction_id VARCHAR(255) NULL;

-- Add reconciliation log table
CREATE TABLE reconciliation_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  strategy VARCHAR(50) NOT NULL,
  confidence VARCHAR(20) NOT NULL,
  reason TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Add user reconciliation tracking
ALTER TABLE users ADD COLUMN last_reconciled_at TIMESTAMP NULL;
```

## 🚀 Deployment Notes

1. **Database Migration**: Run schema updates before deploying
2. **Feature Flag**: Use feature flag for gradual rollout
3. **Monitoring**: Set up alerts for reconciliation failures
4. **Backup**: Ensure database backups before mass reconciliation
5. **Performance**: Monitor database performance during reconciliation

## 📞 Support & Maintenance

### Monitoring Queries
```sql
-- Check reconciliation health
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN last_reconciled_at IS NOT NULL THEN 1 END) as reconciled_users
FROM users WHERE is_premium = true;

-- Check pending reconciliations
SELECT user_id, COUNT(*) as pending_items
FROM holdings 
WHERE is_reconciled = false AND data_source = 'MANUAL'
GROUP BY user_id;
```

### Troubleshooting
- **High memory usage**: Reduce batch size
- **Slow performance**: Add database indexes
- **Match failures**: Adjust confidence thresholds
- **Data conflicts**: Review conflict resolution logic

---

## 🎯 Summary

The Data Reconciliation System provides:

✅ **Intelligent Matching** - Advanced algorithms for finding duplicates  
✅ **Flexible Strategies** - Multiple approaches for handling conflicts  
✅ **Data Safety** - All changes are reversible with complete audit trails  
✅ **User Control** - Configurable preferences and manual overrides  
✅ **Performance** - Optimized for handling large datasets  
✅ **Reliability** - Comprehensive error handling and recovery

The system ensures a smooth FREE → PREMIUM upgrade experience while maintaining data integrity and giving users control over their financial data.