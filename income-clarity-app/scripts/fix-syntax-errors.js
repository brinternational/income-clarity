#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Pattern to fix malformed catch blocks: "} catch (error) { // comment;" -> "} catch (error) { // comment } };"
function fixCatchBlocks(content) {
  // Fix pattern where catch block comment ends with semicolon and missing closing braces
  content = content.replace(
    /(\} catch \(error[^)]*\) \{[\s]*\/\/[^\n]*);[\s]*\n[\s]*([a-zA-Z])/g,
    '$1\n    }\n  };\n\n  $2'
  );
  
  // Fix pattern where catch block is missing closing brace before next function
  content = content.replace(
    /(\} catch \(error[^)]*\) \{[\s]*\/\/[^\n]*)\n[\s]*(const|let|var|function|export|import|class)/g,
    '$1\n    }\n  };\n\n  $2'
  );
  
  return content;
}

// Fix missing semicolons after closing braces in return statements
function fixReturnStatements(content) {
  content = content.replace(
    /(\s+return[\s]*\([^)]*\)[\s]*\n[\s]*\))\n(\})/g,
    '$1;\n$2'
  );
  
  // Fix closing parenthesis without semicolon
  content = content.replace(
    /(\s+\))\n(\}[\s]*$)/gm,
    '$1;\n$2'
  );
  
  return content;
}

// List of files to fix based on TypeScript errors
const filesToFix = [
  'app/api/cron/refresh-views/route.ts',
  'app/api/cron/stock-price-cache/route.ts',
  'app/api/income-hub/route.ts',
  'app/api/performance-hub/route.ts',
  'app/api/portfolio-hub/route.ts',
  'app/api/portfolios/[id]/route.ts',
  'app/api/security/status/route.ts',
  'app/api/security/test/route.ts',
  'app/api/tax-hub/route.ts',
  'app/api/transactions/route.ts',
  'app/api/v1/dashboard/route.ts',
  'lib/cache/redis-cache.service.ts',
  'lib/storage/form-persistence.ts',
  'lib/storage/hybrid-storage.service.ts',
  'lib/super-cards-client.ts',
  'scripts/health-check.ts',
  'scripts/seed-database.ts',
  'scripts/test-super-cards-api.ts',
  'services/DividendAlertService.ts',
  'utils/backgroundSync.ts'
];

let fixedCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file doesn't exist`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    content = fixCatchBlocks(content);
    content = fixReturnStatements(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nFixed ${fixedCount} files`);
console.log('\nRun "npx tsc --noEmit" to check for remaining errors');