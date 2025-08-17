# Sync Components Directory

## Overview
This directory contains components for displaying data source indicators, sync status, and freshness information for the dual data source system (Manual vs Yodlee) in Income Clarity.

## Components

### DataSourceBadge.tsx
**Purpose**: Visual indicator showing data origin (Manual, Yodlee, Merged)
**Features**:
- Color-coded badges: Manual (blue), Yodlee (green), Merged (purple)
- Tooltip with last sync time for Yodlee data
- Multiple sizes (sm, md, lg)
- Group component for displaying multiple badges
- Responsive design with accessibility

**Usage**:
```tsx
<DataSourceBadge source="YODLEE" lastSync={new Date()} size="sm" />
<DataSourceBadgeGroup sources={[
  { source: 'MANUAL', count: 12 },
  { source: 'YODLEE', lastSync: new Date(), count: 8 }
]} />
```

### SyncStatusIndicator.tsx
**Purpose**: Shows sync status and controls for premium users
**Features**:
- Real-time sync status (idle, syncing, success, error, rate_limited)
- Animated sync button with rate limiting
- Last sync time display
- Error message handling
- Multiple sizes and configurations
- Custom hook for sync management

**Usage**:
```tsx
<SyncStatusIndicator
  userId={user.id}
  lastSyncTime={lastSyncTime}
  onRefresh={triggerSync}
  size="sm"
/>

// Hook for sync management
const { lastSyncTime, isLoading, triggerSync } = useSyncStatus(userId);
```

### FreshnessIndicator.tsx
**Purpose**: Color-coded dots showing data freshness
**Features**:
- Green dot: < 24 hours old
- Yellow dot: 1-7 days old  
- Red dot: > 7 days old
- Customizable thresholds
- Tooltip with exact timestamp
- Animated pulsing for very stale data

**Usage**:
```tsx
<FreshnessIndicator 
  lastSync={new Date()} 
  size="sm" 
  showLabel={false}
/>
<DetailedFreshnessIndicator
  lastSync={new Date()}
  dataType="Holdings"
  showMetrics={true}
/>
```

## Integration with Super Cards

### PerformanceHub
- **Header**: Freshness indicator and sync status for premium users
- **Holdings**: Data source badges on individual holdings (future enhancement)
- **Price Data**: Source indicator for real-time vs cached prices

### IncomeIntelligenceHub  
- **Header**: Manual and Yodlee data source badges
- **Transactions**: Bank sync prompt for free users
- **Income Data**: Source indicators for dividend payments

### PortfolioStrategyHub
- **Header**: Holdings data source group with reconciliation status
- **Holdings List**: Mixed data source indicators
- **Sync Status**: Reconciliation status for merged data

### TaxStrategyHub
- **Header**: Data accuracy indicators based on subscription tier
- **Calculations**: Accuracy confidence levels
- **Manual Data Warning**: Upgrade prompt for better accuracy

### FinancialPlanningHub
- **Header**: Data completeness indicators
- **Projections**: Accuracy notices for manual vs synced data
- **Upgrade Prompts**: Better projection accuracy with bank sync

## Color Scheme
- **Manual**: #3B82F6 (blue-500) - Hand-entered data
- **Yodlee**: #10B981 (green-500) - Bank synchronized
- **Merged**: #8B5CF6 (purple-500) - Combined sources
- **Fresh**: #10B981 (green-500) - Recently updated
- **Stale**: #F59E0B (yellow-500) - Somewhat outdated  
- **Very Stale**: #EF4444 (red-500) - Significantly outdated

## Accessibility Features
- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast color combinations
- Screen reader compatible tooltips
- Focus indicators for all buttons

## Performance Considerations
- Memoized components to prevent unnecessary re-renders
- Efficient animation using Framer Motion
- Lazy loading of tooltip content
- Debounced sync requests with rate limiting
- Optimized bundle size with tree shaking

## Testing Strategy
- Unit tests for all components
- Integration tests with Super Cards
- Accessibility testing with screen readers
- Performance testing for animation smoothness
- Rate limiting and error handling tests

## Future Enhancements
- Real-time WebSocket updates for sync status
- Bulk reconciliation tools for merged data
- Advanced data quality metrics
- Custom sync schedules for premium users
- Historical sync logs and analytics

---

**Integration Complete**: All Super Cards now display appropriate data source indicators, sync status, and freshness information based on user subscription tier and data sources.