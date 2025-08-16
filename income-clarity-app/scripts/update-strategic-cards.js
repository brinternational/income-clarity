#!/usr/bin/env node
/**
 * Batch script to update all strategic cards with error boundaries and loading states
 */

const fs = require('fs');
const path = require('path');

const strategicCards = [
  {
    path: 'components/income/IncomeStabilityCard.tsx',
    cardName: 'Income Stability Analyzer',
    cardType: 'strategy'
  },
  {
    path: 'components/strategy/StrategyHealthCard.tsx', 
    cardName: 'Strategy Health Monitor',
    cardType: 'strategy'
  },
  {
    path: 'components/dashboard/RebalancingSuggestions.tsx',
    cardName: 'Rebalancing Suggestions',
    cardType: 'strategy'
  },
  {
    path: 'components/strategy/StrategyComparisonEngine.tsx',
    cardName: 'Strategy Comparison Engine', 
    cardType: 'strategy'
  },
  {
    path: 'components/income/IncomeProgressionCard.tsx',
    cardName: 'Income Progression',
    cardType: 'income'
  },
  {
    path: 'components/income/CashFlowProjectionCard.tsx',
    cardName: 'Cash Flow Projection',
    cardType: 'income'
  }
];

const appDir = path.join(__dirname, '..');

function updateCardFile(cardInfo) {
  const filePath = path.join(appDir, cardInfo.path);
  
  if (!fs.existsSync(filePath)) {
    // console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // 1. Add imports for error boundary and skeleton
  const importPattern = /('use client')\s*\n\n(import.*?from.*?)\n/;
  const errorBoundaryImports = `
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'`;
  
  if (!content.includes('WithErrorBoundary') && importPattern.test(content)) {
    content = content.replace(importPattern, `$1\n\n$2${errorBoundaryImports}\n`);
  }
  
  // 2. Add loading states to main component
  const componentPattern = /const (\w+Component) = \(\) => \{/;
  const match = content.match(componentPattern);
  
  if (match) {
    const componentName = match[1];
    const originalComponentName = componentName.replace('Component', '');
    
    // Add loading state logic after hooks
    const hookPattern = /(const \{[^}]*\} = use\w+\([^)]*\))\s*\n/g;
    let lastHookEnd = 0;
    let hookMatch;
    
    while ((hookMatch = hookPattern.exec(content)) !== null) {
      lastHookEnd = hookMatch.index + hookMatch[0].length;
    }
    
    if (lastHookEnd > 0) {
      const loadingCode = `  const [localLoading, setLocalLoading] = useState(true)

  // Simulate initial data loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Handle errors from contexts
  if (profileError) {
    throw new Error(\`Failed to load profile data: \${profileError}\`)
  }
  if (portfolioError) {
    throw new Error(\`Failed to load portfolio data: \${portfolioError}\`)
  }

  const isLoading = profileLoading || portfolioLoading || localLoading

`;
      
      content = content.slice(0, lastHookEnd) + loadingCode + content.slice(lastHookEnd);
    }
    
    // 3. Wrap return statement with skeleton wrapper
    const returnPattern = /(return \()\s*\n(\s*<div className={\`[^`]*\`}>)/;
    if (returnPattern.test(content)) {
      content = content.replace(returnPattern, `$1
    <SkeletonCardWrapper 
      isLoading={isLoading} 
      cardType="${cardInfo.cardType}"
      className={isVisible ? 'animate-slide-up' : 'opacity-0'}
    >
$2`);
      
      // Close the wrapper
      const lastDivPattern = /(\s*<\/div>\s*)\)(\s*}\s*export default)/;
      content = content.replace(lastDivPattern, `$1    </SkeletonCardWrapper>
  )
}

// Wrap with error boundary
const ${originalComponentName} = () => (
  <WithErrorBoundary cardName="${cardInfo.cardName}" showDetails={false}>
    <${componentName} />
  </WithErrorBoundary>
)

export default memo(${originalComponentName}`);
    }
  }
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    // console.log(`✅ Updated: ${cardInfo.path}`);
    return true;
  } else {
    // console.log(`⏭️  Skipped (no changes): ${cardInfo.path}`);
    return false;
  }
}

// Process all cards
// console.log('🚀 Starting strategic card updates...\n');

let updatedCount = 0;
for (const cardInfo of strategicCards) {
  if (updateCardFile(cardInfo)) {
    updatedCount++;
  }
}

// console.log(`\n✨ Update complete! ${updatedCount}/${strategicCards.length} cards updated.`);
// console.log('\n📋 Summary of changes:');
// console.log('- Added error boundaries for crash prevention');
// console.log('- Added skeleton loading states');
// console.log('- Added error handling from context providers');
// console.log('- Wrapped components with WithErrorBoundary HOC');