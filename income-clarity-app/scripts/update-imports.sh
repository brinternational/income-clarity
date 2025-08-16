#!/bin/bash

# Import Update Script - Updates all import paths after reorganization
echo "========================================="
echo "  Updating Import Paths"
echo "========================================="

# Function to update imports in a file
update_file() {
    local file=$1
    echo "Updating: $file"
    
    # Super Cards imports
    sed -i "s|from '@/components/super-cards/|from '@/features/super-cards/components/|g" "$file"
    sed -i "s|from '../components/super-cards/|from '@/features/super-cards/components/|g" "$file"
    sed -i "s|from '../../components/super-cards/|from '@/features/super-cards/components/|g" "$file"
    
    # Income imports
    sed -i "s|from '@/components/income/|from '@/features/income/components/|g" "$file"
    sed -i "s|from '../components/income/|from '@/features/income/components/|g" "$file"
    sed -i "s|from '../../components/income/|from '@/features/income/components/|g" "$file"
    
    # Portfolio imports
    sed -i "s|from '@/components/portfolio/|from '@/features/portfolio/components/|g" "$file"
    sed -i "s|from '../components/portfolio/|from '@/features/portfolio/components/|g" "$file"
    sed -i "s|from '../../components/portfolio/|from '@/features/portfolio/components/|g" "$file"
    
    # Tax imports
    sed -i "s|from '@/components/tax/|from '@/features/tax-strategy/components/|g" "$file"
    sed -i "s|from '../components/tax/|from '@/features/tax-strategy/components/|g" "$file"
    sed -i "s|from '../../components/tax/|from '@/features/tax-strategy/components/|g" "$file"
    
    # Strategy imports
    sed -i "s|from '@/components/strategy/|from '@/features/tax-strategy/components/strategy/|g" "$file"
    sed -i "s|from '../components/strategy/|from '@/features/tax-strategy/components/strategy/|g" "$file"
    
    # Planning imports
    sed -i "s|from '@/components/planning/|from '@/features/financial-planning/components/|g" "$file"
    sed -i "s|from '../components/planning/|from '@/features/financial-planning/components/|g" "$file"
    
    # Shared components
    sed -i "s|from '@/components/ui/|from '@/shared/components/ui/|g" "$file"
    sed -i "s|from '@/components/forms/|from '@/shared/components/forms/|g" "$file"
    sed -i "s|from '@/components/charts/|from '@/shared/components/charts/|g" "$file"
    sed -i "s|from '@/components/shared/|from '@/shared/components/|g" "$file"
    
    # Infrastructure
    sed -i "s|from '@/components/auth/|from '@/infrastructure/auth/|g" "$file"
    sed -i "s|from '@/components/navigation/|from '@/infrastructure/navigation/|g" "$file"
    sed -i "s|from '@/components/mobile/|from '@/infrastructure/mobile/|g" "$file"
    sed -i "s|from '@/components/theme/|from '@/infrastructure/theme/|g" "$file"
    sed -i "s|from '@/components/pwa/|from '@/infrastructure/pwa/|g" "$file"
    
    # Services updates
    sed -i "s|from '@/lib/services/super-cards-database.service'|from '@/features/super-cards/services/super-cards-database.service'|g" "$file"
    sed -i "s|from '@/lib/services/portfolio-import.service'|from '@/features/portfolio/services/portfolio-import.service'|g" "$file"
    sed -i "s|from '@/lib/services/tax-calculator.service'|from '@/features/tax-strategy/services/tax-calculator.service'|g" "$file"
    sed -i "s|from '@/lib/services/milestone-tracker.service'|from '@/features/financial-planning/services/milestone-tracker.service'|g" "$file"
}

# Find all TypeScript/TSX files and update them
echo "Finding all TypeScript files..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "./node_modules/*" ! -path "./.next/*" | while read file; do
    update_file "$file"
done

echo ""
echo "✅ Import paths updated!"
echo ""
echo "Next steps:"
echo "1. Run: npm run type-check"
echo "2. Fix any remaining import errors manually"
echo "3. Run: npm run build"
echo "========================================="