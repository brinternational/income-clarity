#!/usr/bin/env node

/**
 * Fix color classes to use shadcn/ui color system instead of hardcoded Tailwind colors
 * This ensures proper contrast in dark mode
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color replacements mapping
const colorReplacements = {
  // Text colors - use foreground/muted-foreground for proper contrast
  'text-slate-900 dark:text-slate-100': 'text-foreground',
  'text-slate-800 dark:text-slate-200': 'text-foreground',
  'text-slate-700 dark:text-slate-300': 'text-foreground/90',
  'text-slate-600 dark:text-slate-400': 'text-muted-foreground',
  'text-slate-500 dark:text-slate-400': 'text-muted-foreground',
  'text-slate-400 dark:text-slate-500': 'text-muted-foreground',
  'text-slate-300 dark:text-slate-600': 'text-muted-foreground',
  
  // Single mode text colors
  'text-slate-900': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-700': 'text-foreground/90',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-300': 'text-muted-foreground',
  'text-slate-200': 'text-muted-foreground',
  'text-slate-100': 'text-foreground',
  
  // Background colors
  'bg-slate-900 dark:bg-slate-100': 'bg-background',
  'bg-slate-800 dark:bg-slate-200': 'bg-secondary',
  'bg-slate-100 dark:bg-slate-800': 'bg-secondary',
  'bg-slate-50 dark:bg-slate-900': 'bg-background',
  
  // Border colors
  'border-slate-200 dark:border-slate-700': 'border-border',
  'border-slate-300 dark:border-slate-600': 'border-border',
  'border-slate-700 dark:border-slate-300': 'border-border',
  
  // Hover states
  'hover:bg-slate-100 dark:hover:bg-slate-800': 'hover:bg-secondary',
  'hover:text-slate-900 dark:hover:text-slate-100': 'hover:text-foreground',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const [oldClass, newClass] of Object.entries(colorReplacements)) {
    if (content.includes(oldClass)) {
      content = content.replace(new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newClass);
      modified = true;
      console.log(`  ✓ Replaced "${oldClass}" with "${newClass}" in ${path.basename(filePath)}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🎨 Fixing color classes to use shadcn/ui color system...\n');
  
  const patterns = [
    'components/**/*.tsx',
    'components/**/*.jsx',
    'app/**/*.tsx',
    'app/**/*.jsx',
  ];
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: path.join(__dirname, '..'),
      absolute: true,
      ignore: ['**/node_modules/**', '**/.next/**']
    });
    
    files.forEach(file => {
      totalFiles++;
      if (processFile(file)) {
        modifiedFiles++;
      }
    });
  });
  
  console.log(`\n✅ Complete! Modified ${modifiedFiles} of ${totalFiles} files.`);
  console.log('\n💡 Note: The shadcn color system automatically handles dark mode contrast.');
  console.log('   - text-foreground: High contrast text color');
  console.log('   - text-muted-foreground: Secondary/muted text color');
  console.log('   - bg-background: Main background color');
  console.log('   - bg-secondary: Secondary background color');
  console.log('   - border-border: Border color with proper contrast');
}

main();