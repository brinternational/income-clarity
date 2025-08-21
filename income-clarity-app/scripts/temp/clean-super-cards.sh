#!/bin/bash

# Clean Super Cards components from complex dependencies
echo "Cleaning Super Cards components..."

# Array of Super Cards Hub files
SUPER_CARD_FILES=(
    "components/super-cards/IncomeIntelligenceHub.tsx"
    "components/super-cards/TaxStrategyHub.tsx"
    "components/super-cards/PortfolioStrategyHub.tsx"
    "components/super-cards/FinancialPlanningHub.tsx"
)

for file in "${SUPER_CARD_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Cleaning $file..."
        
        # Remove complex imports
        sed -i '/import.*SyncStatusIndicator\|FreshnessIndicator\|useSyncStatus/d' "$file"
        sed -i '/import.*useFeatureAccess.*premium/d' "$file"
        sed -i '/import.*useUser/d' "$file"
        
        # Replace usage with simplified versions
        sed -i '/const { user } = useUser()/c\  // Simplified version - single user, no premium features' "$file"
        sed -i '/const { isPremium } = useFeatureAccess()/d' "$file"
        sed -i '/const { lastSyncTime, triggerSync } = useSyncStatus/d' "$file"
        
        # Remove JSX sync components
        sed -i '/<FreshnessIndicator/,/\/>/d' "$file"
        sed -i '/{isPremium &&/,/})/d' "$file"
        sed -i '/<SyncStatusIndicator/,/\/>/d' "$file"
        
        echo "Cleaned $file"
    else
        echo "File $file not found, skipping..."
    fi
done

echo "Super Cards cleanup completed!"