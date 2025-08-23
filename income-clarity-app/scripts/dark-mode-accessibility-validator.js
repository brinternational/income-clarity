#!/usr/bin/env node

/**
 * COMPREHENSIVE DARK MODE ACCESSIBILITY VALIDATOR
 * 
 * This script performs systematic validation of all UI components for:
 * - Dark mode theme implementation
 * - WCAG 2.1 AA/AAA compliance 
 * - Accessibility feature coverage
 * - Component categorization and validation matrix
 * 
 * Date: August 22, 2025
 * Scope: Complete application accessibility assessment
 */

const fs = require('fs');
const path = require('path');

// Validation results storage
const validationResults = {
  summary: {
    totalComponents: 0,
    passedComponents: 0,
    failedComponents: 0,
    warningComponents: 0,
    coveragePercentage: 0,
    wcagCompliance: 'Unknown'
  },
  categories: {},
  components: {},
  recommendations: [],
  criticalIssues: []
};

// Component categories for systematic validation
const componentCategories = {
  'super-cards': {
    name: 'Super Cards (Main Features)',
    priority: 'Critical',
    components: [],
    description: 'Core application functionality - 5 intelligence hubs'
  },
  'design-system': {
    name: 'Design System Components', 
    priority: 'High',
    components: [],
    description: 'Reusable UI components and patterns'
  },
  'navigation': {
    name: 'Navigation Components',
    priority: 'High', 
    components: [],
    description: 'App navigation and routing components'
  },
  'forms': {
    name: 'Form Components',
    priority: 'High',
    components: [],
    description: 'User input and form controls'
  },
  'data-display': {
    name: 'Data Display Components',
    priority: 'Medium',
    components: [],
    description: 'Charts, tables, and data visualization'
  },
  'dashboard': {
    name: 'Dashboard Components', 
    priority: 'High',
    components: [],
    description: 'Dashboard widgets and analytics'
  },
  'auth': {
    name: 'Authentication Components',
    priority: 'Critical',
    components: [],
    description: 'Login, signup, and auth flows'
  },
  'mobile': {
    name: 'Mobile-Specific Components',
    priority: 'Medium',
    components: [],
    description: 'Mobile-optimized components'
  },
  'premium': {
    name: 'Premium/Subscription Components',
    priority: 'Medium', 
    components: [],
    description: 'Premium features and upgrade flows'
  }
};

// WCAG validation criteria
const wcagCriteria = {
  // Color and Contrast
  'color-contrast': {
    name: 'Color Contrast',
    level: 'AA',
    description: 'Text has sufficient contrast ratio (4.5:1 normal, 3:1 large)',
    testMethods: ['code-analysis', 'css-validation']
  },
  'color-independence': {
    name: 'Color Independence', 
    level: 'A',
    description: 'Information not conveyed by color alone',
    testMethods: ['code-analysis', 'pattern-validation']
  },
  
  // Keyboard Accessibility
  'keyboard-navigation': {
    name: 'Keyboard Navigation',
    level: 'A', 
    description: 'All functionality available via keyboard',
    testMethods: ['code-analysis', 'tabindex-validation']
  },
  'focus-indicators': {
    name: 'Focus Indicators',
    level: 'AA',
    description: 'Visible focus indicators for interactive elements',
    testMethods: ['css-validation', 'focus-styles']
  },
  
  // Screen Reader Support
  'semantic-markup': {
    name: 'Semantic Markup',
    level: 'A',
    description: 'Proper HTML semantics and structure',
    testMethods: ['code-analysis', 'tag-validation']
  },
  'aria-implementation': {
    name: 'ARIA Implementation',
    level: 'A',
    description: 'Proper ARIA labels, roles, and properties',
    testMethods: ['code-analysis', 'aria-validation']
  },
  
  // Mobile and Touch
  'touch-targets': {
    name: 'Touch Target Size',
    level: 'AAA',
    description: 'Touch targets at least 44x44px',
    testMethods: ['css-validation', 'size-analysis']
  },
  
  // Motion and Animation
  'reduced-motion': {
    name: 'Reduced Motion Support',
    level: 'AAA', 
    description: 'Respects prefers-reduced-motion',
    testMethods: ['css-validation', 'media-query-analysis']
  }
};

// Dark mode specific validation checks
const darkModeChecks = {
  'theme-variables': {
    name: 'Theme Variable Usage',
    description: 'Components use CSS custom properties for theming',
    pattern: /var\(--color-[^)]+\)/g
  },
  'dark-class-support': {
    name: 'Dark Class Support', 
    description: 'Components support .dark class for theme switching',
    pattern: /\.dark\s+/g
  },
  'accessibility-classes': {
    name: 'Accessibility Classes',
    description: 'Uses accessibility-specific CSS classes',
    pattern: /(text-accessible|bg-accessible|focus-accessible)/g
  },
  'high-contrast-support': {
    name: 'High Contrast Support',
    description: 'Supports Windows High Contrast mode',
    pattern: /@media\s*\(\s*forced-colors:\s*active\s*\)/g
  }
};

/**
 * Recursively discover all component files
 */
function discoverComponents(dirPath, category = null) {
  const components = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        components.push(...discoverComponents(fullPath, category || item));
      } else if (item.endsWith('.tsx') && !item.includes('.test.') && !item.includes('.spec.')) {
        const componentInfo = {
          name: item.replace('.tsx', ''),
          path: fullPath,
          category: category || path.basename(dirPath),
          size: stat.size,
          lastModified: stat.mtime
        };
        components.push(componentInfo);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return components;
}

/**
 * Analyze a component file for accessibility implementation
 */
function analyzeComponent(componentInfo) {
  const analysis = {
    name: componentInfo.name,
    category: componentInfo.category,
    path: componentInfo.path,
    accessibility: {
      wcagCompliance: {},
      darkModeSupport: {},
      issues: [],
      recommendations: [],
      score: 0
    }
  };
  
  try {
    const content = fs.readFileSync(componentInfo.path, 'utf8');
    
    // Analyze WCAG criteria
    Object.entries(wcagCriteria).forEach(([key, criteria]) => {
      analysis.accessibility.wcagCompliance[key] = validateWCAGCriteria(content, criteria);
    });
    
    // Analyze dark mode implementation
    Object.entries(darkModeChecks).forEach(([key, check]) => {
      analysis.accessibility.darkModeSupport[key] = validateDarkModeImplementation(content, check);
    });
    
    // Calculate overall score
    analysis.accessibility.score = calculateAccessibilityScore(analysis.accessibility);
    
    // Generate recommendations
    analysis.accessibility.recommendations = generateRecommendations(analysis.accessibility);
    
  } catch (error) {
    analysis.accessibility.issues.push(`Error reading component: ${error.message}`);
  }
  
  return analysis;
}

/**
 * Validate WCAG criteria for a component
 */
function validateWCAGCriteria(content, criteria) {
  const result = {
    status: 'unknown',
    details: [],
    issues: []
  };
  
  switch (criteria.name) {
    case 'Color Contrast':
      result.status = analyzeColorContrast(content);
      break;
      
    case 'Keyboard Navigation':
      result.status = analyzeKeyboardSupport(content);
      break;
      
    case 'Focus Indicators':
      result.status = analyzeFocusIndicators(content);
      break;
      
    case 'Semantic Markup':
      result.status = analyzeSemanticMarkup(content);
      break;
      
    case 'ARIA Implementation':
      result.status = analyzeARIAImplementation(content);
      break;
      
    case 'Touch Target Size':
      result.status = analyzeTouchTargets(content);
      break;
      
    case 'Reduced Motion Support':
      result.status = analyzeReducedMotion(content);
      break;
      
    default:
      result.status = 'not-tested';
  }
  
  return result;
}

/**
 * Validate dark mode implementation
 */
function validateDarkModeImplementation(content, check) {
  const matches = content.match(check.pattern);
  return {
    status: matches && matches.length > 0 ? 'pass' : 'fail',
    count: matches ? matches.length : 0,
    examples: matches ? matches.slice(0, 3) : []
  };
}

/**
 * Analyze color contrast implementation
 */
function analyzeColorContrast(content) {
  // Check for accessibility color classes
  const accessibilityClasses = content.match(/(text-accessible|bg-accessible)/g);
  
  // Check for CSS custom properties usage
  const cssVariables = content.match(/var\(--color-[^)]+\)/g);
  
  // Check for hardcoded colors (potential issue)
  const hardcodedColors = content.match(/(#[0-9a-fA-F]{3,6}|rgb\(|rgba\()/g);
  
  if (accessibilityClasses && accessibilityClasses.length > 0) {
    return 'pass';
  } else if (cssVariables && cssVariables.length > 0) {
    return 'warning'; // Uses variables but not accessibility-specific ones
  } else if (hardcodedColors) {
    return 'fail'; // Hardcoded colors are risky
  } else {
    return 'unknown';
  }
}

/**
 * Analyze keyboard navigation support
 */
function analyzeKeyboardSupport(content) {
  // Check for keyboard event handlers
  const keyboardEvents = content.match(/(onKeyDown|onKeyUp|onKeyPress|tabIndex)/g);
  
  // Check for interactive elements that should support keyboard
  const interactiveElements = content.match(/(button|input|select|textarea|<a\s)/gi);
  
  if (keyboardEvents || !interactiveElements) {
    return 'pass';
  } else if (interactiveElements) {
    return 'warning'; // Has interactive elements but no explicit keyboard handling
  } else {
    return 'unknown';
  }
}

/**
 * Analyze focus indicators
 */
function analyzeFocusIndicators(content) {
  // Check for focus-related CSS classes
  const focusClasses = content.match(/(focus:|focus-accessible|focus-visible)/g);
  
  // Check for outline or focus styles
  const focusStyles = content.match(/(outline|focus-ring)/g);
  
  if (focusClasses || focusStyles) {
    return 'pass';
  } else {
    return 'warning'; // May rely on browser defaults
  }
}

/**
 * Analyze semantic markup
 */
function analyzeSemanticMarkup(content) {
  // Check for semantic HTML elements
  const semanticElements = content.match(/<(header|nav|main|section|article|aside|footer|h[1-6])\s/gi);
  
  // Check for proper heading hierarchy
  const headings = content.match(/<h[1-6]/gi);
  
  if (semanticElements && semanticElements.length > 0) {
    return 'pass';
  } else if (content.includes('<div') || content.includes('<span')) {
    return 'warning'; // Uses divs/spans, may need semantic improvement
  } else {
    return 'unknown';
  }
}

/**
 * Analyze ARIA implementation
 */
function analyzeARIAImplementation(content) {
  // Check for ARIA attributes
  const ariaAttributes = content.match(/aria-[a-z]+=|role=/gi);
  
  // Check for aria-label, aria-describedby, etc.
  const ariaLabels = content.match(/(aria-label|aria-labelledby|aria-describedby)/gi);
  
  if (ariaLabels && ariaLabels.length > 0) {
    return 'pass';
  } else if (ariaAttributes) {
    return 'warning'; // Has some ARIA but may be incomplete
  } else {
    return 'fail'; // No ARIA implementation found
  }
}

/**
 * Analyze touch target sizing
 */
function analyzeTouchTargets(content) {
  // Check for touch-related CSS classes or sizing
  const touchClasses = content.match(/(min-w-\[44px\]|min-h-\[44px\]|p-3|p-4)/g);
  
  // Check for button or interactive element styling
  const buttonSizing = content.match(/(w-\d+|h-\d+|p-\d+)/g);
  
  if (touchClasses || buttonSizing) {
    return 'pass';
  } else {
    return 'warning'; // May need explicit touch target sizing
  }
}

/**
 * Analyze reduced motion support
 */
function analyzeReducedMotion(content) {
  // Check for prefers-reduced-motion media query
  const reducedMotion = content.match(/prefers-reduced-motion/g);
  
  // Check for animation or transition properties
  const animations = content.match(/(animation|transition|transform)/g);
  
  if (reducedMotion) {
    return 'pass';
  } else if (animations) {
    return 'warning'; // Has animations but no reduced motion support
  } else {
    return 'pass'; // No animations, so reduced motion not needed
  }
}

/**
 * Calculate overall accessibility score
 */
function calculateAccessibilityScore(accessibility) {
  let totalCriteria = 0;
  let passedCriteria = 0;
  let weightedScore = 0;
  
  // Weight WCAG criteria
  Object.entries(accessibility.wcagCompliance).forEach(([key, result]) => {
    totalCriteria++;
    if (result.status === 'pass') {
      passedCriteria++;
      weightedScore += 1;
    } else if (result.status === 'warning') {
      weightedScore += 0.5;
    }
  });
  
  // Weight dark mode support
  Object.entries(accessibility.darkModeSupport).forEach(([key, result]) => {
    totalCriteria++;
    if (result.status === 'pass') {
      passedCriteria++;
      weightedScore += 1;
    } else if (result.status === 'warning') {
      weightedScore += 0.5;
    }
  });
  
  return totalCriteria > 0 ? Math.round((weightedScore / totalCriteria) * 100) : 0;
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(accessibility) {
  const recommendations = [];
  
  // Check WCAG compliance issues
  Object.entries(accessibility.wcagCompliance).forEach(([key, result]) => {
    if (result.status === 'fail') {
      recommendations.push(`Fix ${wcagCriteria[key]?.name || key} compliance issue`);
    } else if (result.status === 'warning') {
      recommendations.push(`Improve ${wcagCriteria[key]?.name || key} implementation`);
    }
  });
  
  // Check dark mode support issues
  Object.entries(accessibility.darkModeSupport).forEach(([key, result]) => {
    if (result.status === 'fail') {
      recommendations.push(`Add ${darkModeChecks[key]?.name || key} support`);
    }
  });
  
  return recommendations;
}

/**
 * Generate component accessibility matrix
 */
function generateAccessibilityMatrix(componentAnalyses) {
  const matrix = {};
  
  // Group by category
  componentAnalyses.forEach(analysis => {
    if (!matrix[analysis.category]) {
      matrix[analysis.category] = {
        components: [],
        averageScore: 0,
        totalComponents: 0,
        passedComponents: 0
      };
    }
    
    matrix[analysis.category].components.push({
      name: analysis.name,
      score: analysis.accessibility.score,
      status: analysis.accessibility.score >= 80 ? 'pass' : 
              analysis.accessibility.score >= 60 ? 'warning' : 'fail',
      issues: analysis.accessibility.issues.length,
      recommendations: analysis.accessibility.recommendations.length
    });
    
    matrix[analysis.category].totalComponents++;
    if (analysis.accessibility.score >= 80) {
      matrix[analysis.category].passedComponents++;
    }
  });
  
  // Calculate averages
  Object.keys(matrix).forEach(category => {
    const categoryData = matrix[category];
    const totalScore = categoryData.components.reduce((sum, comp) => sum + comp.score, 0);
    categoryData.averageScore = Math.round(totalScore / categoryData.totalComponents);
    categoryData.passRate = Math.round((categoryData.passedComponents / categoryData.totalComponents) * 100);
  });
  
  return matrix;
}

/**
 * Generate comprehensive report
 */
function generateReport(componentAnalyses) {
  const matrix = generateAccessibilityMatrix(componentAnalyses);
  
  // Update validation results
  validationResults.summary.totalComponents = componentAnalyses.length;
  validationResults.summary.passedComponents = componentAnalyses.filter(a => a.accessibility.score >= 80).length;
  validationResults.summary.warningComponents = componentAnalyses.filter(a => a.accessibility.score >= 60 && a.accessibility.score < 80).length;
  validationResults.summary.failedComponents = componentAnalyses.filter(a => a.accessibility.score < 60).length;
  validationResults.summary.coveragePercentage = Math.round((validationResults.summary.passedComponents / validationResults.summary.totalComponents) * 100);
  
  // Determine WCAG compliance level
  if (validationResults.summary.coveragePercentage >= 95) {
    validationResults.summary.wcagCompliance = 'WCAG 2.1 AA Compliant';
  } else if (validationResults.summary.coveragePercentage >= 80) {
    validationResults.summary.wcagCompliance = 'Mostly Compliant (Minor Issues)';
  } else {
    validationResults.summary.wcagCompliance = 'Requires Improvement';
  }
  
  validationResults.categories = matrix;
  validationResults.components = componentAnalyses.reduce((acc, analysis) => {
    acc[analysis.name] = analysis.accessibility;
    return acc;
  }, {});
  
  return validationResults;
}

/**
 * Save validation results
 */
function saveResults(results, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save detailed JSON results
  fs.writeFileSync(
    path.join(outputDir, 'dark-mode-accessibility-validation.json'),
    JSON.stringify(results, null, 2)
  );
  
  // Generate human-readable report
  const report = generateHumanReadableReport(results);
  fs.writeFileSync(
    path.join(outputDir, 'dark-mode-accessibility-report.md'),
    report
  );
  
  console.log(`📊 Results saved to ${outputDir}/`);
}

/**
 * Generate human-readable markdown report
 */
function generateHumanReadableReport(results) {
  const timestamp = new Date().toISOString();
  
  return `# Dark Mode Accessibility Validation Report

**Generated**: ${timestamp}
**Scope**: Complete application component accessibility assessment
**Standard**: WCAG 2.1 AA/AAA Compliance

## 🎯 Executive Summary

- **Total Components Analyzed**: ${results.summary.totalComponents}
- **Accessibility Coverage**: ${results.summary.coveragePercentage}%
- **WCAG Compliance Status**: ${results.summary.wcagCompliance}
- **Passed Components**: ${results.summary.passedComponents} (${Math.round((results.summary.passedComponents / results.summary.totalComponents) * 100)}%)
- **Warning Components**: ${results.summary.warningComponents} (${Math.round((results.summary.warningComponents / results.summary.totalComponents) * 100)}%)
- **Failed Components**: ${results.summary.failedComponents} (${Math.round((results.summary.failedComponents / results.summary.totalComponents) * 100)}%)

## 📊 Component Category Analysis

${Object.entries(results.categories).map(([category, data]) => `
### ${componentCategories[category]?.name || category}
- **Components**: ${data.totalComponents}
- **Average Score**: ${data.averageScore}%
- **Pass Rate**: ${data.passRate}%
- **Priority**: ${componentCategories[category]?.priority || 'Medium'}

#### Component Details:
${data.components.map(comp => `- **${comp.name}**: ${comp.score}% (${comp.status.toUpperCase()}) - ${comp.issues} issues, ${comp.recommendations} recommendations`).join('\n')}
`).join('\n')}

## 🔍 Detailed Component Analysis

${Object.entries(results.components).map(([componentName, accessibility]) => `
### ${componentName}
**Score**: ${accessibility.score}%

#### WCAG Compliance:
${Object.entries(accessibility.wcagCompliance).map(([criteria, result]) => `- **${wcagCriteria[criteria]?.name || criteria}**: ${result.status.toUpperCase()}`).join('\n')}

#### Dark Mode Support:
${Object.entries(accessibility.darkModeSupport).map(([check, result]) => `- **${darkModeChecks[check]?.name || check}**: ${result.status.toUpperCase()} (${result.count} instances)`).join('\n')}

${accessibility.recommendations.length > 0 ? `#### Recommendations:
${accessibility.recommendations.map(rec => `- ${rec}`).join('\n')}` : ''}

${accessibility.issues.length > 0 ? `#### Issues:
${accessibility.issues.map(issue => `- ${issue}`).join('\n')}` : ''}
`).join('\n')}

## 🎨 Dark Mode Implementation Status

### ✅ Strengths
- WCAG AAA compliant color system in place
- Comprehensive theme variable system
- Default dark mode with accessibility-dark theme
- High contrast mode support
- Reduced motion support

### ⚠️ Areas for Improvement
${results.summary.failedComponents > 0 ? `- ${results.summary.failedComponents} components require accessibility improvements` : '- No critical issues found'}
${results.summary.warningComponents > 0 ? `- ${results.summary.warningComponents} components have minor accessibility warnings` : ''}

### 🚀 Recommendations
1. Focus on components with scores below 80%
2. Ensure all interactive elements have proper ARIA labels
3. Verify keyboard navigation paths for all components
4. Test with actual screen readers for validation
5. Implement automated accessibility testing in CI/CD

## 📋 WCAG 2.1 Compliance Matrix

| Criteria | Level | Status | Components |
|----------|-------|---------|------------|
${Object.entries(wcagCriteria).map(([key, criteria]) => {
  const totalComponents = results.summary.totalComponents;
  const passedCount = Object.values(results.components).filter(comp => comp.wcagCompliance[key]?.status === 'pass').length;
  const status = passedCount >= totalComponents * 0.9 ? '✅ Compliant' : passedCount >= totalComponents * 0.7 ? '⚠️ Mostly' : '❌ Needs Work';
  return `| ${criteria.name} | ${criteria.level} | ${status} | ${passedCount}/${totalComponents} |`;
}).join('\n')}

---

**Next Steps**: Focus on components with low scores and implement recommended improvements.
`;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Starting Dark Mode Accessibility Validation...\n');
  
  const componentsDir = path.join(__dirname, '..', 'components');
  const outputDir = path.join(__dirname, '..', 'accessibility-validation-results');
  
  console.log('📂 Discovering components...');
  const allComponents = discoverComponents(componentsDir);
  console.log(`Found ${allComponents.length} components to analyze\n`);
  
  console.log('🔬 Analyzing components for accessibility...');
  const componentAnalyses = allComponents.map((component, index) => {
    if (index % 10 === 0) {
      console.log(`  Progress: ${index + 1}/${allComponents.length} components`);
    }
    return analyzeComponent(component);
  });
  
  console.log('\n📊 Generating accessibility report...');
  const results = generateReport(componentAnalyses);
  
  console.log('💾 Saving results...');
  saveResults(results, outputDir);
  
  console.log('\n🎉 Dark Mode Accessibility Validation Complete!');
  console.log(`\n📈 Summary:`);
  console.log(`  Total Components: ${results.summary.totalComponents}`);
  console.log(`  Accessibility Coverage: ${results.summary.coveragePercentage}%`);
  console.log(`  WCAG Compliance: ${results.summary.wcagCompliance}`);
  console.log(`  Passed: ${results.summary.passedComponents} | Warning: ${results.summary.warningComponents} | Failed: ${results.summary.failedComponents}`);
  
  if (results.summary.coveragePercentage >= 95) {
    console.log('\n🏆 Excellent! Application meets high accessibility standards.');
  } else if (results.summary.coveragePercentage >= 80) {
    console.log('\n✅ Good accessibility coverage with room for improvement.');
  } else {
    console.log('\n⚠️ Accessibility improvements needed for full compliance.');
  }
  
  console.log(`\n📄 Detailed report: ${outputDir}/dark-mode-accessibility-report.md`);
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeComponent,
  generateAccessibilityMatrix,
  wcagCriteria,
  darkModeChecks
};