#!/bin/bash
# Script to remove ALL console.log, console.warn, console.error statements

echo "🧹 Removing ALL console statements from the codebase..."

# Find all TypeScript/JavaScript files and comment out console statements
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./coverage/*" \
  -not -path "./dist/*" \
  -exec sed -i 's/^\(\s*\)console\.\(log\|warn\|error\)/\1\/\/ console.\2/g' {} \;

echo "✅ All console statements have been commented out"
echo "📊 Summary of changes:"

# Show count of remaining uncommented console statements (should be 0)
REMAINING=$(grep -r "^\s*console\.\(log\|warn\|error\)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage | wc -l)

echo "   Remaining uncommented console statements: $REMAINING"

if [ "$REMAINING" -eq 0 ]; then
  echo "   ✅ SUCCESS: No console statements found!"
else
  echo "   ⚠️ WARNING: Still found $REMAINING console statements"
  echo "   Showing first 5:"
  grep -r "^\s*console\.\(log\|warn\|error\)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage | head -5
fi