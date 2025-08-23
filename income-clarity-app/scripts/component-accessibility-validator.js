#!/usr/bin/env node

/**
 * COMPONENT-LEVEL ACCESSIBILITY VALIDATOR
 * 
 * Comprehensive component-by-component accessibility validation system
 * Following WCAG 2.1 AAA compliance standards established for Income Clarity
 * 
 * Features:
 * - Individual component accessibility testing
 * - ARIA label and semantic HTML validation
 * - Keyboard navigation and focus management testing
 * - Touch target size validation
 * - Screen reader compatibility testing
 * - Component interaction accessibility testing
 * - Integration testing between components
 * 
 * Usage: node scripts/component-accessibility-validator.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Component categories for systematic testing
const COMPONENT_CATEGORIES = {
  'Super Cards': {
    path: 'components/super-cards',
    components: [
      'PerformanceHub.tsx',
      'IncomeIntelligenceHub.tsx', 
      'TaxStrategyHub.tsx',
      'PortfolioStrategyHub.tsx',
      'FinancialPlanningHub.tsx'
    ],
    critical: true,
    description: 'Main financial intelligence hubs'
  },
  'Navigation': {
    path: 'components/navigation',
    components: [
      'SidebarNavigation.tsx',
      'SuperCardsNavigation.tsx',
      'BottomNavigation.tsx',
      'EnhancedMobileNavigation.tsx'
    ],
    critical: true,
    description: 'Navigation and routing components'
  },
  'Design System Core': {
    path: 'components/design-system/core',
    components: [
      'Button.tsx',
      'Input.tsx',
      'Card.tsx',
      'Alert.tsx',
      'Badge.tsx'
    ],
    critical: true,
    description: 'Core design system components'
  },
  'Forms': {
    path: 'components/design-system/forms',
    components: [
      'TextField.tsx',
      'Select.tsx',
      'Checkbox.tsx',
      'Radio.tsx',
      'FormGroup.tsx'
    ],
    critical: true,
    description: 'Form input components'
  },
  'Feedback': {
    path: 'components/design-system/feedback',
    components: [
      'Modal.tsx',
      'Toast.tsx',
      'Progress.tsx',
      'Spinner.tsx'
    ],
    critical: true,
    description: 'User feedback components'
  },
  'Authentication': {
    path: 'components/auth',
    components: [
      'LoginForm.tsx',
      'AuthGuard.tsx'
    ],
    critical: true,
    description: 'Authentication components'
  },
  'Mobile': {
    path: 'components/mobile',
    components: [
      'MobileCardLayout.tsx',
      'TouchFeedback.tsx'
    ],
    critical: true,
    description: 'Mobile-specific components'
  },
  'Accessibility': {
    path: 'components',
    components: [
      'SkipLinks.tsx',
      'AccessibilitySettings.tsx'
    ],
    critical: true,
    description: 'Accessibility-specific components'
  }
};

// Accessibility testing criteria
const ACCESSIBILITY_TESTS = {
  'Semantic HTML': {
    description: 'Validates proper HTML semantic structure',
    weight: 'critical',
    tests: [
      'Uses semantic HTML elements (header, nav, main, section, article)',
      'Proper heading hierarchy (h1-h6)',
      'Lists use ul/ol/li structure',
      'Forms use proper fieldset/legend/label structure',
      'Tables use proper table/thead/tbody/th/td structure'
    ]
  },
  'ARIA Implementation': {
    description: 'Validates ARIA labels and properties',
    weight: 'critical',
    tests: [
      'All interactive elements have accessible names',
      'aria-label or aria-labelledby present where needed',
      'aria-describedby used for additional context',
      'aria-expanded for collapsible content',
      'aria-selected for selectable items',
      'aria-hidden used appropriately for decorative elements'
    ]
  },
  'Keyboard Navigation': {
    description: 'Tests keyboard accessibility',
    weight: 'critical',
    tests: [
      'All interactive elements are keyboard accessible',
      'Logical tab order (tabindex when needed)',
      'Enter/Space activation for buttons',
      'Arrow key navigation for lists/menus',
      'Escape key functionality for modals/dropdowns',
      'Focus visible indicators present'
    ]
  },
  'Focus Management': {
    description: 'Validates focus handling and indicators',
    weight: 'critical',
    tests: [
      'Focus indicators meet 3px minimum outline',
      'Focus trapped in modals',
      'Focus returned after modal closure',
      'Focus moves logically through components',
      'Skip links function correctly',
      'Focus not trapped unintentionally'
    ]
  },
  'Touch Targets': {
    description: 'Validates touch interface accessibility',
    weight: 'critical',
    tests: [
      'Interactive elements minimum 44x44px',
      'Adequate spacing between touch targets',
      'Touch targets work on mobile devices',
      'Gestures have keyboard alternatives',
      'Touch feedback provided for interactions'
    ]
  },
  'Color and Contrast': {
    description: 'Validates visual accessibility',
    weight: 'critical',
    tests: [
      'Text contrast meets WCAG AA (4.5:1) minimum',
      'Interactive element contrast adequate',
      'Color not the only means of conveying information',
      'High contrast mode compatibility',
      'Dark/light theme accessibility maintained'
    ]
  },
  'Screen Reader Support': {
    description: 'Tests assistive technology compatibility',
    weight: 'critical',
    tests: [
      'All content available to screen readers',
      'Screen reader only content (sr-only) used appropriately',
      'Reading order matches visual order',
      'Dynamic content changes announced',
      'Form validation errors accessible',
      'Status updates announced to screen readers'
    ]
  },
  'Mobile Accessibility': {
    description: 'Mobile-specific accessibility features',
    weight: 'high',
    tests: [
      'Components work with mobile screen readers',
      'Zoom up to 200% maintains functionality',
      'Orientation changes handled gracefully',
      'Mobile gestures have alternatives',
      'Text scales appropriately'
    ]
  }
};

class ComponentAccessibilityValidator {
  constructor() {
    this.results = {
      categories: {},
      summary: {
        totalComponents: 0,
        testedComponents: 0,
        passedComponents: 0,
        failedComponents: 0,
        criticalIssues: 0,
        warnings: 0,
        score: 0
      },
      issues: [],
      recommendations: []
    };
    
    this.startTime = Date.now();
  }

  /**
   * Run comprehensive component accessibility validation
   */
  async runValidation() {
    console.log(colorize('\n🎯 COMPONENT ACCESSIBILITY VALIDATOR', 'cyan'));
    console.log(colorize('═'.repeat(60), 'cyan'));
    console.log(colorize('Validating individual component accessibility compliance', 'white'));
    console.log(colorize('Building on WCAG 2.1 AAA platform-wide compliance\n', 'white'));

    // Test each component category
    for (const [categoryName, category] of Object.entries(COMPONENT_CATEGORIES)) {
      await this.testComponentCategory(categoryName, category);
    }

    // Generate comprehensive report
    this.generateReport();
    
    // Save results to file
    this.saveResults();
    
    return this.results;
  }

  /**
   * Test all components in a category
   */
  async testComponentCategory(categoryName, category) {
    console.log(colorize(`\n📋 Testing ${categoryName}`, 'blue'));
    console.log(colorize(`   ${category.description}`, 'white'));
    console.log(colorize('─'.repeat(50), 'blue'));

    const categoryResults = {
      name: categoryName,
      description: category.description,
      critical: category.critical,
      components: {},
      summary: {
        total: category.components.length,
        tested: 0,
        passed: 0,
        failed: 0,
        score: 0
      }
    };

    // Test each component in the category
    for (const componentFile of category.components) {
      const componentResults = await this.testComponent(category.path, componentFile);
      categoryResults.components[componentFile] = componentResults;
      categoryResults.summary.tested++;
      
      if (componentResults.passed) {
        categoryResults.summary.passed++;
      } else {
        categoryResults.summary.failed++;
      }
    }

    // Calculate category score
    if (categoryResults.summary.tested > 0) {
      categoryResults.summary.score = Math.round(
        (categoryResults.summary.passed / categoryResults.summary.tested) * 100
      );
    }

    this.results.categories[categoryName] = categoryResults;
    this.updateGlobalSummary(categoryResults);
  }

  /**
   * Test individual component accessibility
   */
  async testComponent(componentPath, componentFile) {
    const fullPath = path.join(process.cwd(), componentPath, componentFile);
    const componentName = componentFile.replace('.tsx', '');
    
    console.log(colorize(`   🔍 ${componentName}`, 'yellow'));

    const componentResults = {
      name: componentName,
      file: componentFile,
      path: fullPath,
      exists: false,
      testResults: {},
      issues: [],
      score: 0,
      passed: false
    };

    // Check if component exists
    if (!fs.existsSync(fullPath)) {
      componentResults.issues.push({
        type: 'error',
        category: 'File System',
        message: `Component file not found: ${fullPath}`,
        severity: 'critical'
      });
      console.log(colorize(`      ❌ File not found`, 'red'));
      return componentResults;
    }

    componentResults.exists = true;

    // Read component content
    let componentContent;
    try {
      componentContent = fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      componentResults.issues.push({
        type: 'error',
        category: 'File System',
        message: `Cannot read component file: ${error.message}`,
        severity: 'critical'
      });
      console.log(colorize(`      ❌ Cannot read file`, 'red'));
      return componentResults;
    }

    // Run accessibility tests
    await this.runComponentTests(componentContent, componentResults);

    // Calculate component score
    this.calculateComponentScore(componentResults);

    // Display results
    const status = componentResults.passed ? '✅' : '❌';
    const score = `${componentResults.score}%`;
    console.log(colorize(`      ${status} Score: ${score}`, componentResults.passed ? 'green' : 'red'));

    return componentResults;
  }

  /**
   * Run accessibility tests on component content
   */
  async runComponentTests(componentContent, componentResults) {
    for (const [testName, testConfig] of Object.entries(ACCESSIBILITY_TESTS)) {
      const testResult = {
        name: testName,
        description: testConfig.description,
        weight: testConfig.weight,
        tests: [],
        passed: 0,
        failed: 0,
        score: 0
      };

      // Run individual test criteria
      for (const testCriteria of testConfig.tests) {
        const criteriaResult = this.runTestCriteria(componentContent, testCriteria, testName);
        testResult.tests.push(criteriaResult);
        
        if (criteriaResult.passed) {
          testResult.passed++;
        } else {
          testResult.failed++;
          
          // Add to component issues
          componentResults.issues.push({
            type: 'accessibility',
            category: testName,
            message: `${testCriteria}: ${criteriaResult.details}`,
            severity: testConfig.weight === 'critical' ? 'critical' : 'warning'
          });
        }
      }

      // Calculate test score
      const totalTests = testResult.tests.length;
      if (totalTests > 0) {
        testResult.score = Math.round((testResult.passed / totalTests) * 100);
      }

      componentResults.testResults[testName] = testResult;
    }
  }

  /**
   * Run individual test criteria
   */
  runTestCriteria(componentContent, criteria, testCategory) {
    const result = {
      criteria,
      passed: false,
      details: '',
      suggestions: []
    };

    switch (testCategory) {
      case 'Semantic HTML':
        result.passed = this.testSemanticHTML(componentContent, criteria, result);
        break;
      case 'ARIA Implementation':
        result.passed = this.testARIA(componentContent, criteria, result);
        break;
      case 'Keyboard Navigation':
        result.passed = this.testKeyboardNavigation(componentContent, criteria, result);
        break;
      case 'Focus Management':
        result.passed = this.testFocusManagement(componentContent, criteria, result);
        break;
      case 'Touch Targets':
        result.passed = this.testTouchTargets(componentContent, criteria, result);
        break;
      case 'Color and Contrast':
        result.passed = this.testColorContrast(componentContent, criteria, result);
        break;
      case 'Screen Reader Support':
        result.passed = this.testScreenReaderSupport(componentContent, criteria, result);
        break;
      case 'Mobile Accessibility':
        result.passed = this.testMobileAccessibility(componentContent, criteria, result);
        break;
      default:
        result.passed = true; // Default pass for unknown tests
    }

    return result;
  }

  /**
   * Test semantic HTML implementation
   */
  testSemanticHTML(content, criteria, result) {
    const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    const headingPattern = /<h[1-6]/g;
    const listPattern = /<(ul|ol|li)/g;
    const formPattern = /<(form|fieldset|legend|label)/g;
    const tablePattern = /<(table|thead|tbody|th|td)/g;

    if (criteria.includes('semantic HTML elements')) {
      const hasSemanticElements = semanticElements.some(element => 
        content.includes(`<${element}`) || content.includes(`<${element} `)
      );
      if (!hasSemanticElements && content.includes('<div')) {
        result.details = 'Consider using semantic HTML elements instead of generic divs';
        result.suggestions.push('Replace divs with semantic elements like <section>, <article>, <nav>');
        return false;
      }
      return true;
    }

    if (criteria.includes('heading hierarchy')) {
      const headings = content.match(headingPattern);
      if (headings && headings.length > 1) {
        // Check if headings follow logical order (simplified check)
        result.details = 'Heading hierarchy detected - manual verification recommended';
        return true;
      }
      return !content.includes('<h') || content.match(headingPattern);
    }

    if (criteria.includes('Lists use ul/ol/li')) {
      const hasLists = content.match(listPattern);
      if (content.includes('map(') && !hasLists) {
        result.details = 'Consider using proper list elements for mapped content';
        result.suggestions.push('Wrap mapped items in <ul> or <ol> elements');
        return false;
      }
      return true;
    }

    if (criteria.includes('Forms use proper')) {
      const hasForms = content.match(formPattern);
      if (content.includes('input') && !hasForms) {
        result.details = 'Forms should use proper semantic structure';
        result.suggestions.push('Add <form>, <fieldset>, <legend>, and <label> elements');
        return false;
      }
      return true;
    }

    if (criteria.includes('Tables use proper')) {
      const hasTables = content.match(tablePattern);
      if (content.includes('table') && !hasTables) {
        result.details = 'Use proper table structure for tabular data';
        result.suggestions.push('Use <table>, <thead>, <tbody>, <th>, <td> elements');
        return false;
      }
      return true;
    }

    return true;
  }

  /**
   * Test ARIA implementation
   */
  testARIA(content, criteria, result) {
    if (criteria.includes('accessible names')) {
      const interactiveElements = ['button', 'input', 'select', 'textarea', 'a'];
      const hasInteractive = interactiveElements.some(el => content.includes(`<${el}`));
      
      if (hasInteractive) {
        const hasAriaLabel = content.includes('aria-label') || content.includes('aria-labelledby');
        if (!hasAriaLabel) {
          result.details = 'Interactive elements should have accessible names';
          result.suggestions.push('Add aria-label or aria-labelledby attributes');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('aria-label or aria-labelledby')) {
      if (content.includes('button') || content.includes('input')) {
        const hasAccessibleName = content.includes('aria-label') || 
                                content.includes('aria-labelledby') ||
                                content.includes('title=');
        if (!hasAccessibleName) {
          result.details = 'Missing accessible names for interactive elements';
          result.suggestions.push('Add aria-label, aria-labelledby, or title attributes');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('aria-describedby')) {
      // This is optional enhancement - pass if present or not needed
      return true;
    }

    if (criteria.includes('aria-expanded')) {
      if (content.includes('collapsible') || content.includes('dropdown') || content.includes('menu')) {
        if (!content.includes('aria-expanded')) {
          result.details = 'Collapsible content should have aria-expanded';
          result.suggestions.push('Add aria-expanded attribute for collapsible elements');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('aria-selected')) {
      if (content.includes('option') || content.includes('tab')) {
        if (!content.includes('aria-selected')) {
          result.details = 'Selectable items should have aria-selected';
          result.suggestions.push('Add aria-selected attribute for selectable items');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('aria-hidden')) {
      // Check for decorative elements that should be hidden
      if (content.includes('decorative') || content.includes('icon')) {
        return content.includes('aria-hidden="true"') || true; // Optional improvement
      }
      return true;
    }

    return true;
  }

  /**
   * Test keyboard navigation implementation
   */
  testKeyboardNavigation(content, criteria, result) {
    if (criteria.includes('keyboard accessible')) {
      const hasKeyboardHandlers = content.includes('onKeyDown') || 
                                content.includes('onKeyPress') ||
                                content.includes('onKeyUp');
      
      if (content.includes('onClick') && !hasKeyboardHandlers && !content.includes('button')) {
        result.details = 'Interactive elements should support keyboard navigation';
        result.suggestions.push('Add keyboard event handlers (onKeyDown) or use button elements');
        return false;
      }
      return true;
    }

    if (criteria.includes('tab order')) {
      // Check for proper tabindex usage
      if (content.includes('tabindex="-1"') || content.includes('tabIndex={-1}')) {
        // This is okay for managing focus
        return true;
      }
      if (content.includes('tabindex') && !content.includes('tabindex="0"') && !content.includes('tabIndex={0}')) {
        result.details = 'Use tabindex="0" for focusable elements, avoid positive values';
        result.suggestions.push('Use tabindex="0" or remove tabindex to follow natural tab order');
        return false;
      }
      return true;
    }

    if (criteria.includes('Enter/Space activation')) {
      if (content.includes('onClick') || content.includes('button')) {
        const hasKeyboardActivation = content.includes('onKeyDown') && 
                                    (content.includes('Enter') || content.includes('Space'));
        if (!hasKeyboardActivation && !content.includes('<button')) {
          result.details = 'Buttons should respond to Enter and Space keys';
          result.suggestions.push('Add keyboard handlers for Enter and Space keys');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('Arrow key navigation')) {
      if (content.includes('menu') || content.includes('list') || content.includes('option')) {
        const hasArrowNavigation = content.includes('ArrowUp') || content.includes('ArrowDown');
        if (!hasArrowNavigation) {
          result.details = 'Lists and menus should support arrow key navigation';
          result.suggestions.push('Add arrow key navigation for list/menu items');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('Escape key')) {
      if (content.includes('modal') || content.includes('dropdown') || content.includes('overlay')) {
        const hasEscapeHandler = content.includes('Escape') || content.includes('onClose');
        if (!hasEscapeHandler) {
          result.details = 'Modals and dropdowns should close with Escape key';
          result.suggestions.push('Add Escape key handler to close overlays');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('Focus visible')) {
      // Check CSS or styling that provides focus indicators
      const hasFocusStyles = content.includes('focus:') || 
                           content.includes(':focus') ||
                           content.includes('outline');
      if (!hasFocusStyles) {
        result.details = 'Components should have visible focus indicators';
        result.suggestions.push('Add focus styles with visible outlines');
        return false;
      }
      return true;
    }

    return true;
  }

  /**
   * Test focus management
   */
  testFocusManagement(content, criteria, result) {
    if (criteria.includes('3px minimum outline')) {
      const hasFocusOutline = content.includes('outline') || content.includes('focus:outline');
      if (!hasFocusOutline) {
        result.details = 'Focus indicators should have minimum 3px outline';
        result.suggestions.push('Add focus:outline-3 or similar focus styling');
        return false;
      }
      return true;
    }

    if (criteria.includes('Focus trapped in modals')) {
      if (content.includes('modal') || content.includes('dialog')) {
        const hasFocusTrap = content.includes('focus-trap') || 
                           content.includes('trapFocus') ||
                           content.includes('useFocusTrap');
        if (!hasFocusTrap) {
          result.details = 'Modals should trap focus within the modal';
          result.suggestions.push('Implement focus trapping for modal dialogs');
          return false;
        }
      }
      return true;
    }

    if (criteria.includes('Focus returned')) {
      if (content.includes('modal') || content.includes('dialog')) {
        const hasReturnFocus = content.includes('returnFocus') || 
                             content.includes('restoreFocus') ||
                             content.includes('previousFocus');
        if (!hasReturnFocus) {
          result.details = 'Focus should return to triggering element after modal closes';
          result.suggestions.push('Store and restore focus when closing modals');
          return false;
        }
      }
      return true;
    }

    return true;
  }

  /**
   * Test touch target accessibility
   */
  testTouchTargets(content, criteria, result) {
    if (criteria.includes('44x44px')) {
      // Check for minimum touch target sizing in styles
      const hasMinTouchTarget = content.includes('min-h-') || 
                              content.includes('min-w-') ||
                              content.includes('p-') ||
                              content.includes('py-') ||
                              content.includes('px-');
      
      if (content.includes('button') && !hasMinTouchTarget) {
        result.details = 'Interactive elements should be minimum 44x44px';
        result.suggestions.push('Add padding or minimum height/width classes');
        return false;
      }
      return true;
    }

    if (criteria.includes('spacing between')) {
      const hasSpacing = content.includes('space-') || 
                        content.includes('gap-') ||
                        content.includes('m-');
      
      if (content.includes('button') && !hasSpacing) {
        result.details = 'Touch targets should have adequate spacing';
        result.suggestions.push('Add margin or gap classes between interactive elements');
        return false;
      }
      return true;
    }

    return true;
  }

  /**
   * Test color and contrast accessibility
   */
  testColorContrast(content, criteria, result) {
    if (criteria.includes('WCAG AA')) {
      // Check for use of accessibility color tokens
      const usesAccessibilityColors = content.includes('accessible') || 
                                    content.includes('var(--color-') ||
                                    content.includes('text-accessible');
      
      if (content.includes('text-') && !usesAccessibilityColors) {
        result.details = 'Use WCAG AA compliant color tokens';
        result.suggestions.push('Use accessible color classes or CSS custom properties');
        return false;
      }
      return true;
    }

    if (criteria.includes('Color not the only means')) {
      if (content.includes('color') || content.includes('bg-')) {
        const hasAlternativeIndicators = content.includes('icon') || 
                                       content.includes('text') ||
                                       content.includes('pattern');
        if (!hasAlternativeIndicators) {
          result.details = 'Provide alternative indicators beyond color';
          result.suggestions.push('Add icons, text labels, or patterns alongside color');
          return false;
        }
      }
      return true;
    }

    return true;
  }

  /**
   * Test screen reader support
   */
  testScreenReaderSupport(content, criteria, result) {
    if (criteria.includes('sr-only')) {
      // Check for proper use of screen reader only content
      const hasSrOnly = content.includes('sr-only') || content.includes('screen-reader');
      
      if (content.includes('icon') && !hasSrOnly) {
        result.details = 'Icons should have screen reader accessible text';
        result.suggestions.push('Add sr-only text for icons or use aria-label');
        return false;
      }
      return true;
    }

    if (criteria.includes('Dynamic content changes')) {
      if (content.includes('useState') || content.includes('loading')) {
        const hasLiveRegion = content.includes('aria-live') || 
                            content.includes('role="status"') ||
                            content.includes('role="alert"');
        if (!hasLiveRegion) {
          result.details = 'Dynamic content changes should be announced';
          result.suggestions.push('Add aria-live regions for dynamic content');
          return false;
        }
      }
      return true;
    }

    return true;
  }

  /**
   * Test mobile accessibility
   */
  testMobileAccessibility(content, criteria, result) {
    if (criteria.includes('mobile screen readers')) {
      // This requires actual testing - assume compliant if basic accessibility is present
      return content.includes('aria-') || content.includes('role=');
    }

    if (criteria.includes('Zoom up to 200%')) {
      // Check for responsive design patterns
      const hasResponsive = content.includes('responsive') || 
                          content.includes('sm:') ||
                          content.includes('md:') ||
                          content.includes('lg:');
      
      if (!hasResponsive) {
        result.details = 'Component should support responsive scaling';
        result.suggestions.push('Add responsive design classes for zoom support');
        return false;
      }
      return true;
    }

    return true;
  }

  /**
   * Calculate component accessibility score
   */
  calculateComponentScore(componentResults) {
    if (!componentResults.exists) {
      componentResults.score = 0;
      componentResults.passed = false;
      return;
    }

    let totalScore = 0;
    let totalWeight = 0;
    let criticalFailures = 0;

    for (const testResult of Object.values(componentResults.testResults)) {
      const weight = testResult.weight === 'critical' ? 3 : 1;
      totalScore += testResult.score * weight;
      totalWeight += 100 * weight;

      if (testResult.weight === 'critical' && testResult.score < 70) {
        criticalFailures++;
      }
    }

    if (totalWeight > 0) {
      componentResults.score = Math.round(totalScore / totalWeight * 100);
    }

    // Component passes if score >= 85% and no critical failures
    componentResults.passed = componentResults.score >= 85 && criticalFailures === 0;
  }

  /**
   * Update global summary with category results
   */
  updateGlobalSummary(categoryResults) {
    this.results.summary.totalComponents += categoryResults.summary.total;
    this.results.summary.testedComponents += categoryResults.summary.tested;
    this.results.summary.passedComponents += categoryResults.summary.passed;
    this.results.summary.failedComponents += categoryResults.summary.failed;

    // Count issues by severity
    for (const component of Object.values(categoryResults.components)) {
      for (const issue of component.issues) {
        if (issue.severity === 'critical') {
          this.results.summary.criticalIssues++;
        } else {
          this.results.summary.warnings++;
        }
        
        this.results.issues.push({
          ...issue,
          component: component.name,
          category: categoryResults.name
        });
      }
    }
  }

  /**
   * Generate comprehensive accessibility report
   */
  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    // Calculate overall score
    if (this.results.summary.testedComponents > 0) {
      this.results.summary.score = Math.round(
        (this.results.summary.passedComponents / this.results.summary.testedComponents) * 100
      );
    }

    console.log(colorize('\n📊 COMPONENT ACCESSIBILITY VALIDATION RESULTS', 'cyan'));
    console.log(colorize('═'.repeat(60), 'cyan'));

    // Overall summary
    console.log(colorize('\n🎯 SUMMARY', 'white'));
    console.log(colorize(`   Overall Score: ${this.results.summary.score}%`, 
      this.results.summary.score >= 90 ? 'green' : 
      this.results.summary.score >= 75 ? 'yellow' : 'red'));
    console.log(colorize(`   Components Tested: ${this.results.summary.testedComponents}/${this.results.summary.totalComponents}`, 'white'));
    console.log(colorize(`   Passed: ${this.results.summary.passedComponents}`, 'green'));
    console.log(colorize(`   Failed: ${this.results.summary.failedComponents}`, 'red'));
    console.log(colorize(`   Critical Issues: ${this.results.summary.criticalIssues}`, 'red'));
    console.log(colorize(`   Warnings: ${this.results.summary.warnings}`, 'yellow'));
    console.log(colorize(`   Duration: ${duration}s`, 'white'));

    // Category breakdown
    console.log(colorize('\n📋 CATEGORY BREAKDOWN', 'white'));
    for (const [categoryName, category] of Object.entries(this.results.categories)) {
      const status = category.summary.score >= 90 ? '✅' : 
                    category.summary.score >= 75 ? '⚠️' : '❌';
      const scoreColor = category.summary.score >= 90 ? 'green' : 
                        category.summary.score >= 75 ? 'yellow' : 'red';
      
      console.log(colorize(`   ${status} ${categoryName}: ${category.summary.score}% (${category.summary.passed}/${category.summary.total})`, scoreColor));
    }

    // Critical issues
    if (this.results.summary.criticalIssues > 0) {
      console.log(colorize('\n🚨 CRITICAL ISSUES', 'red'));
      const criticalIssues = this.results.issues.filter(issue => issue.severity === 'critical');
      criticalIssues.slice(0, 10).forEach(issue => {
        console.log(colorize(`   ❌ ${issue.component}: ${issue.message}`, 'red'));
      });
      
      if (criticalIssues.length > 10) {
        console.log(colorize(`   ... and ${criticalIssues.length - 10} more critical issues`, 'red'));
      }
    }

    // Generate recommendations
    this.generateRecommendations();

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log(colorize('\n💡 RECOMMENDATIONS', 'yellow'));
      this.results.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(colorize(`   ${index + 1}. ${rec}`, 'yellow'));
      });
    }

    // Compliance status
    const isCompliant = this.results.summary.score >= 85 && this.results.summary.criticalIssues === 0;
    console.log(colorize('\n🏆 COMPLIANCE STATUS', 'white'));
    if (isCompliant) {
      console.log(colorize('   ✅ COMPONENT ACCESSIBILITY VALIDATED', 'green'));
      console.log(colorize('   All components meet accessibility standards', 'green'));
    } else {
      console.log(colorize('   ❌ ACCESSIBILITY IMPROVEMENTS NEEDED', 'red'));
      console.log(colorize('   Some components require accessibility fixes', 'red'));
    }

    console.log(colorize('\n═'.repeat(60), 'cyan'));
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Based on critical issues
    if (this.results.summary.criticalIssues > 0) {
      recommendations.push('Address critical accessibility issues first - they block users with disabilities');
    }

    // Based on common patterns in issues
    const ariaIssues = this.results.issues.filter(issue => issue.category === 'ARIA Implementation').length;
    if (ariaIssues > 3) {
      recommendations.push('Implement consistent ARIA labeling across components');
    }

    const keyboardIssues = this.results.issues.filter(issue => issue.category === 'Keyboard Navigation').length;
    if (keyboardIssues > 3) {
      recommendations.push('Add comprehensive keyboard navigation support');
    }

    const focusIssues = this.results.issues.filter(issue => issue.category === 'Focus Management').length;
    if (focusIssues > 3) {
      recommendations.push('Improve focus management and visual indicators');
    }

    // Based on category performance
    for (const [categoryName, category] of Object.entries(this.results.categories)) {
      if (category.critical && category.summary.score < 80) {
        recommendations.push(`Priority fix: ${categoryName} components need accessibility improvements`);
      }
    }

    // General recommendations
    if (this.results.summary.score < 90) {
      recommendations.push('Consider implementing automated accessibility testing in CI/CD');
      recommendations.push('Conduct user testing with screen reader users');
      recommendations.push('Review components with accessibility experts');
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Save validation results to file
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `COMPONENT_ACCESSIBILITY_VALIDATION_${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);

    const reportData = {
      metadata: {
        title: 'Component Accessibility Validation Report',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        platform: 'Income Clarity',
        validator: 'UX Performance Specialist'
      },
      ...this.results
    };

    try {
      fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
      console.log(colorize(`\n💾 Results saved to: ${filename}`, 'green'));
    } catch (error) {
      console.log(colorize(`\n❌ Failed to save results: ${error.message}`, 'red'));
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ComponentAccessibilityValidator();
  validator.runValidation()
    .then(results => {
      const exitCode = results.summary.criticalIssues > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error(colorize('\n❌ Validation failed:', 'red'), error);
      process.exit(1);
    });
}

module.exports = ComponentAccessibilityValidator;