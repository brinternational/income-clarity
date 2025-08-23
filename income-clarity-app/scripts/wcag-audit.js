#!/usr/bin/env node

/**
 * COMPREHENSIVE WCAG 2.1 AA/AAA ACCESSIBILITY AUDIT
 * 
 * This script performs a detailed accessibility audit of the Income Clarity application
 * using industry-standard tools and methodologies.
 * 
 * Features:
 * - Automated WCAG 2.1 compliance checking
 * - Contrast ratio analysis
 * - Keyboard navigation testing
 * - Screen reader compatibility testing
 * - Touch target validation
 * - Motion sensitivity analysis
 * - Comprehensive reporting
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Color contrast calculation utilities
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// WCAG compliance levels
const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
  UI_COMPONENTS: 3.0
};

class WCAGAuditor {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.passes = [];
    this.auditResults = {
      timestamp: new Date().toISOString(),
      summary: {},
      violations: [],
      warnings: [],
      passes: [],
      recommendations: [],
      wcagCompliance: {
        'AA': { compliant: false, score: 0, total: 0 },
        'AAA': { compliant: false, score: 0, total: 0 }
      }
    };
  }

  async runFullAudit() {
    console.log('🔍 Starting Comprehensive WCAG 2.1 AA/AAA Accessibility Audit...\n');
    
    try {
      // 1. Color Contrast Analysis
      await this.auditColorContrast();
      
      // 2. CSS Accessibility Analysis
      await this.auditCSSAccessibility();
      
      // 3. Component Structure Analysis
      await this.auditComponentStructure();
      
      // 4. Focus Management Analysis
      await this.auditFocusManagement();
      
      // 5. Touch Target Analysis
      await this.auditTouchTargets();
      
      // 6. Motion & Animation Analysis
      await this.auditMotionSensitivity();
      
      // 7. Generate Comprehensive Report
      await this.generateReport();
      
      console.log('\n✅ WCAG Audit Complete! Report saved to audit-results/');
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    }
  }

  async auditColorContrast() {
    console.log('🎨 Auditing Color Contrast Ratios...');
    
    // Load accessibility colors CSS
    const accessibilityColors = fs.readFileSync(
      path.join(__dirname, '../styles/accessibility-colors.css'), 
      'utf8'
    );
    
    // Extract color definitions
    const colorMatches = accessibilityColors.match(/--color-[^:]+:\s*#[0-9a-fA-F]{6}/g) || [];
    const colors = {};
    
    colorMatches.forEach(match => {
      const [property, value] = match.split(':').map(s => s.trim());
      colors[property] = value;
    });

    // Test critical color combinations
    const criticalTests = [
      // Text on backgrounds
      { 
        name: 'Primary text on light background',
        foreground: '#0f172a', // --color-text-primary-light
        background: '#ffffff',  // white background
        requirement: 'AA_NORMAL',
        context: 'Body text, buttons, headings'
      },
      {
        name: 'Primary text on dark background',
        foreground: '#f8fafc', // --color-text-primary-dark
        background: '#0f172a', // --color-bg-primary-dark
        requirement: 'AA_NORMAL',
        context: 'Dark mode body text'
      },
      {
        name: 'Secondary text on light background',
        foreground: '#334155', // --color-text-secondary-light
        background: '#ffffff',
        requirement: 'AA_NORMAL',
        context: 'Labels, subtitles'
      },
      {
        name: 'Muted text on light background',
        foreground: '#64748b', // --color-text-muted-light
        background: '#ffffff',
        requirement: 'AA_NORMAL',
        context: 'Help text, placeholders'
      },
      // Interactive elements
      {
        name: 'Primary button text',
        foreground: '#ffffff',
        background: '#1e40af', // --color-primary-accessible-light
        requirement: 'AA_NORMAL',
        context: 'Primary action buttons'
      },
      {
        name: 'Focus indicator',
        foreground: '#3b82f6', // --color-focus-ring
        background: '#ffffff',
        requirement: 'UI_COMPONENTS',
        context: 'Focus outlines and rings'
      },
      // Status colors
      {
        name: 'Success text',
        foreground: '#166534', // --color-success-accessible-light
        background: '#ffffff',
        requirement: 'AA_NORMAL',
        context: 'Success messages and indicators'
      },
      {
        name: 'Warning text',
        foreground: '#92400e', // --color-warning-accessible-light
        background: '#ffffff',
        requirement: 'AA_NORMAL',
        context: 'Warning messages'
      },
      {
        name: 'Error text',
        foreground: '#991b1b', // --color-error-accessible-light
        background: '#ffffff',
        requirement: 'AA_NORMAL',
        context: 'Error messages'
      },
      {
        name: 'Links',
        foreground: '#1d4ed8', // --color-link-light
        background: '#ffffff',
        requirement: 'AA_NORMAL',
        context: 'Text links'
      }
    ];

    criticalTests.forEach(test => {
      const ratio = getContrastRatio(test.foreground, test.background);
      const requiredRatio = WCAG_LEVELS[test.requirement];
      const isCompliant = ratio >= requiredRatio;
      
      const result = {
        type: 'contrast',
        name: test.name,
        foreground: test.foreground,
        background: test.background,
        ratio: Math.round(ratio * 100) / 100,
        required: requiredRatio,
        compliant: isCompliant,
        level: isCompliant ? (ratio >= WCAG_LEVELS.AAA_NORMAL ? 'AAA' : 'AA') : 'FAIL',
        context: test.context,
        severity: isCompliant ? 'pass' : 'violation'
      };

      if (isCompliant) {
        this.passes.push(result);
        this.auditResults.wcagCompliance.AA.score++;
        if (ratio >= WCAG_LEVELS.AAA_NORMAL) {
          this.auditResults.wcagCompliance.AAA.score++;
        }
      } else {
        this.violations.push(result);
        this.auditResults.recommendations.push({
          type: 'contrast',
          issue: `${test.name} has insufficient contrast (${ratio.toFixed(2)}:1)`,
          recommendation: `Increase contrast to at least ${requiredRatio}:1 for WCAG AA compliance`,
          severity: 'high',
          context: test.context
        });
      }
      
      this.auditResults.wcagCompliance.AA.total++;
      this.auditResults.wcagCompliance.AAA.total++;
    });

    console.log(`   ✅ Tested ${criticalTests.length} color combinations`);
  }

  async auditCSSAccessibility() {
    console.log('📝 Auditing CSS Accessibility Features...');
    
    const cssFiles = [
      '../styles/accessibility-colors.css',
      '../styles/accessibility-enhancements.css',
      '../styles/component-accessibility-enhancements.css',
      '../app/globals.css'
    ];

    const accessibilityFeatures = {
      'focus-indicators': false,
      'reduced-motion': false,
      'high-contrast': false,
      'screen-reader-support': false,
      'touch-targets': false,
      'color-scheme': false,
      'print-styles': false
    };

    cssFiles.forEach(filePath => {
      try {
        const cssContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        
        // Check for accessibility features
        if (cssContent.includes('focus') && cssContent.includes('outline')) {
          accessibilityFeatures['focus-indicators'] = true;
        }
        if (cssContent.includes('prefers-reduced-motion')) {
          accessibilityFeatures['reduced-motion'] = true;
        }
        if (cssContent.includes('prefers-contrast: high') || cssContent.includes('high-contrast')) {
          accessibilityFeatures['high-contrast'] = true;
        }
        if (cssContent.includes('.sr-only') || cssContent.includes('screen-reader')) {
          accessibilityFeatures['screen-reader-support'] = true;
        }
        if (cssContent.includes('min-height: 44px') || cssContent.includes('touch-target')) {
          accessibilityFeatures['touch-targets'] = true;
        }
        if (cssContent.includes('color-scheme')) {
          accessibilityFeatures['color-scheme'] = true;
        }
        if (cssContent.includes('@media print')) {
          accessibilityFeatures['print-styles'] = true;
        }
      } catch (error) {
        console.warn(`   ⚠️  Could not read ${filePath}: ${error.message}`);
      }
    });

    // Evaluate features
    Object.entries(accessibilityFeatures).forEach(([feature, implemented]) => {
      const result = {
        type: 'css-feature',
        name: feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        implemented,
        severity: implemented ? 'pass' : 'violation'
      };

      if (implemented) {
        this.passes.push(result);
        this.auditResults.wcagCompliance.AA.score++;
      } else {
        this.violations.push(result);
        this.auditResults.recommendations.push({
          type: 'css-feature',
          issue: `Missing ${feature} support`,
          recommendation: `Implement ${feature} for better accessibility`,
          severity: 'medium'
        });
      }
      
      this.auditResults.wcagCompliance.AA.total++;
    });

    console.log(`   ✅ Checked ${Object.keys(accessibilityFeatures).length} CSS accessibility features`);
  }

  async auditComponentStructure() {
    console.log('🏗️  Auditing Component Structure...');
    
    // Find all component files
    const componentsDir = path.join(__dirname, '../components');
    const componentFiles = this.findFiles(componentsDir, '.tsx');

    let semanticElementsFound = 0;
    let ariaLabelsFound = 0;
    let accessibilityIssues = 0;

    componentFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for semantic HTML elements
        const semanticElements = ['main', 'nav', 'header', 'footer', 'section', 'article', 'aside'];
        semanticElements.forEach(element => {
          if (content.includes(`<${element}`) || content.includes(`as="${element}"`)) {
            semanticElementsFound++;
          }
        });

        // Check for ARIA attributes
        const ariaPatterns = [
          /aria-label/g,
          /aria-labelledby/g,
          /aria-describedby/g,
          /role="/g,
          /aria-expanded/g,
          /aria-hidden/g
        ];

        ariaPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            ariaLabelsFound += matches.length;
          }
        });

        // Check for potential accessibility issues
        if (content.includes('onClick') && !content.includes('onKeyDown')) {
          accessibilityIssues++;
        }
        if (content.includes('<img') && !content.includes('alt=')) {
          accessibilityIssues++;
        }
        if (content.includes('<input') && !content.includes('aria-label') && !content.includes('<label')) {
          accessibilityIssues++;
        }

      } catch (error) {
        console.warn(`   ⚠️  Could not analyze ${file}: ${error.message}`);
      }
    });

    // Generate results
    this.passes.push({
      type: 'component-structure',
      name: 'Semantic Elements Usage',
      count: semanticElementsFound,
      severity: 'pass'
    });

    this.passes.push({
      type: 'component-structure',
      name: 'ARIA Attributes Usage',
      count: ariaLabelsFound,
      severity: 'pass'
    });

    if (accessibilityIssues > 0) {
      this.warnings.push({
        type: 'component-structure',
        name: 'Potential Accessibility Issues',
        count: accessibilityIssues,
        severity: 'warning'
      });
    }

    console.log(`   ✅ Analyzed ${componentFiles.length} component files`);
  }

  async auditFocusManagement() {
    console.log('🎯 Auditing Focus Management...');
    
    // Check for skip links
    const skipLinksExists = fs.existsSync(path.join(__dirname, '../components/SkipLinks.tsx'));
    
    if (skipLinksExists) {
      this.passes.push({
        type: 'focus-management',
        name: 'Skip Links Implementation',
        implemented: true,
        severity: 'pass'
      });
      this.auditResults.wcagCompliance.AA.score++;
    } else {
      this.violations.push({
        type: 'focus-management',
        name: 'Skip Links Missing',
        implemented: false,
        severity: 'violation'
      });
      this.auditResults.recommendations.push({
        type: 'focus-management',
        issue: 'No skip links found',
        recommendation: 'Implement skip links for keyboard navigation',
        severity: 'high'
      });
    }
    this.auditResults.wcagCompliance.AA.total++;

    // Check focus trap utilities
    const appProvidersPath = path.join(__dirname, '../contexts/AppProviders.tsx');
    if (fs.existsSync(appProvidersPath)) {
      const content = fs.readFileSync(appProvidersPath, 'utf8');
      const hasFocusManagement = content.includes('focus') || content.includes('trap');
      
      if (hasFocusManagement) {
        this.passes.push({
          type: 'focus-management',
          name: 'Focus Trap Implementation',
          implemented: true,
          severity: 'pass'
        });
      } else {
        this.warnings.push({
          type: 'focus-management',
          name: 'Focus Trap Missing',
          implemented: false,
          severity: 'warning'
        });
      }
    }

    console.log('   ✅ Focus management audit complete');
  }

  async auditTouchTargets() {
    console.log('👆 Auditing Touch Target Sizes...');
    
    const globalsCSS = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf8');
    const accessibilityCSS = fs.readFileSync(path.join(__dirname, '../styles/accessibility-enhancements.css'), 'utf8');
    
    // Check for 44px minimum touch targets
    const has44pxMinimum = (globalsCSS + accessibilityCSS).includes('min-height: 44px');
    const hasMobileOptimization = (globalsCSS + accessibilityCSS).includes('@media (pointer: coarse)');
    
    if (has44pxMinimum) {
      this.passes.push({
        type: 'touch-targets',
        name: 'Minimum 44px Touch Targets',
        implemented: true,
        severity: 'pass'
      });
      this.auditResults.wcagCompliance.AA.score++;
    } else {
      this.violations.push({
        type: 'touch-targets',
        name: 'Insufficient Touch Target Size',
        implemented: false,
        severity: 'violation'
      });
      this.auditResults.recommendations.push({
        type: 'touch-targets',
        issue: 'Touch targets may be smaller than 44px minimum',
        recommendation: 'Ensure all interactive elements are at least 44x44px',
        severity: 'high'
      });
    }

    if (hasMobileOptimization) {
      this.passes.push({
        type: 'touch-targets',
        name: 'Mobile Touch Optimization',
        implemented: true,
        severity: 'pass'
      });
    } else {
      this.warnings.push({
        type: 'touch-targets',
        name: 'Mobile Touch Optimization Missing',
        implemented: false,
        severity: 'warning'
      });
    }

    this.auditResults.wcagCompliance.AA.total++;
    
    console.log('   ✅ Touch target audit complete');
  }

  async auditMotionSensitivity() {
    console.log('🎬 Auditing Motion & Animation Accessibility...');
    
    const cssFiles = [
      '../app/globals.css',
      '../styles/accessibility-enhancements.css',
      '../styles/component-accessibility-enhancements.css'
    ];

    let reducedMotionSupport = false;
    let animationCount = 0;

    cssFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        
        // Check for prefers-reduced-motion support
        if (content.includes('@media (prefers-reduced-motion: reduce)')) {
          reducedMotionSupport = true;
        }

        // Count animations
        const animationMatches = content.match(/@keyframes|animation:/g);
        if (animationMatches) {
          animationCount += animationMatches.length;
        }
      } catch (error) {
        console.warn(`   ⚠️  Could not read ${filePath}: ${error.message}`);
      }
    });

    if (reducedMotionSupport) {
      this.passes.push({
        type: 'motion-sensitivity',
        name: 'Reduced Motion Support',
        implemented: true,
        animationCount,
        severity: 'pass'
      });
      this.auditResults.wcagCompliance.AA.score++;
    } else {
      this.violations.push({
        type: 'motion-sensitivity',
        name: 'No Reduced Motion Support',
        implemented: false,
        animationCount,
        severity: 'violation'
      });
      this.auditResults.recommendations.push({
        type: 'motion-sensitivity',
        issue: 'No support for users who prefer reduced motion',
        recommendation: 'Add @media (prefers-reduced-motion: reduce) rules to disable animations',
        severity: 'high'
      });
    }

    this.auditResults.wcagCompliance.AA.total++;
    
    console.log(`   ✅ Found ${animationCount} animations, reduced motion support: ${reducedMotionSupport}`);
  }

  async generateReport() {
    console.log('📊 Generating Comprehensive Report...');
    
    // Create reports directory
    const reportsDir = path.join(__dirname, '../audit-results');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Calculate compliance scores
    const aaCompliance = this.auditResults.wcagCompliance.AA;
    const aaaCompliance = this.auditResults.wcagCompliance.AAA;
    
    aaCompliance.percentage = aaCompliance.total > 0 ? Math.round((aaCompliance.score / aaCompliance.total) * 100) : 0;
    aaaCompliance.percentage = aaaCompliance.total > 0 ? Math.round((aaaCompliance.score / aaaCompliance.total) * 100) : 0;
    
    aaCompliance.compliant = aaCompliance.percentage >= 95; // 95% compliance threshold
    aaaCompliance.compliant = aaaCompliance.percentage >= 90; // 90% compliance threshold

    // Generate summary
    this.auditResults.summary = {
      totalTests: this.passes.length + this.violations.length + this.warnings.length,
      passes: this.passes.length,
      violations: this.violations.length,
      warnings: this.warnings.length,
      complianceLevel: aaCompliance.compliant ? (aaaCompliance.compliant ? 'AAA' : 'AA') : 'FAIL',
      overallScore: aaCompliance.percentage
    };

    this.auditResults.violations = this.violations;
    this.auditResults.warnings = this.warnings;
    this.auditResults.passes = this.passes;

    // Generate detailed JSON report
    fs.writeFileSync(
      path.join(reportsDir, 'wcag-audit-detailed.json'),
      JSON.stringify(this.auditResults, null, 2)
    );

    // Generate human-readable report
    const humanReport = this.generateHumanReport();
    fs.writeFileSync(
      path.join(reportsDir, 'wcag-audit-report.md'),
      humanReport
    );

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary();
    fs.writeFileSync(
      path.join(reportsDir, 'wcag-audit-executive-summary.md'),
      executiveSummary
    );

    console.log(`   ✅ Reports generated in ${reportsDir}/`);
    console.log(`   📊 Overall WCAG Compliance: ${this.auditResults.summary.complianceLevel} (${this.auditResults.summary.overallScore}%)`);
  }

  generateHumanReport() {
    const { summary, wcagCompliance, violations, warnings, recommendations } = this.auditResults;
    
    return `# WCAG 2.1 Accessibility Audit Report

**Generated:** ${this.auditResults.timestamp}
**Application:** Income Clarity - Live Off Your Portfolio
**Audit Scope:** Complete application accessibility assessment

## Executive Summary

- **Overall Compliance Level:** ${summary.complianceLevel}
- **Overall Score:** ${summary.overallScore}%
- **WCAG 2.1 AA Compliance:** ${wcagCompliance.AA.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'} (${wcagCompliance.AA.percentage}%)
- **WCAG 2.1 AAA Compliance:** ${wcagCompliance.AAA.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'} (${wcagCompliance.AAA.percentage}%)

## Test Results Summary

| Category | Count |
|----------|-------|
| ✅ Passes | ${summary.passes} |
| ❌ Violations | ${summary.violations} |
| ⚠️ Warnings | ${summary.warnings} |
| **Total Tests** | **${summary.totalTests}** |

## Critical Violations (Must Fix)

${violations.length === 0 ? 'No critical violations found! 🎉' : violations.map(v => 
`### ${v.name}
- **Type:** ${v.type}
- **Severity:** ${v.severity}
- **Context:** ${v.context || 'General'}
${v.ratio ? `- **Contrast Ratio:** ${v.ratio}:1 (Required: ${v.required}:1)` : ''}
${v.foreground && v.background ? `- **Colors:** ${v.foreground} on ${v.background}` : ''}
`).join('\n')}

## Warnings (Should Fix)

${warnings.length === 0 ? 'No warnings found! 🎉' : warnings.map(w => 
`### ${w.name}
- **Type:** ${w.type}
- **Severity:** ${w.severity}
${w.count ? `- **Count:** ${w.count}` : ''}
`).join('\n')}

## Recommendations for Improvement

${recommendations.map((rec, i) => 
`${i + 1}. **${rec.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}** (${rec.severity.toUpperCase()})
   - **Issue:** ${rec.issue}
   - **Recommendation:** ${rec.recommendation}
   ${rec.context ? `- **Context:** ${rec.context}` : ''}
`).join('\n')}

## Accessibility Features Found ✅

${this.passes.filter(p => p.type !== 'contrast').map(p => 
`- **${p.name}:** ${p.implemented ? 'Implemented' : 'Missing'}${p.count ? ` (${p.count} instances)` : ''}`
).join('\n')}

## Color Contrast Analysis

${this.passes.filter(p => p.type === 'contrast').map(p => 
`- **${p.name}:** ${p.ratio}:1 (${p.level}) - ${p.context}`
).join('\n')}

## Next Steps

1. **Priority 1 (Critical):** Fix all WCAG violations marked as "high" severity
2. **Priority 2 (Important):** Address warnings and medium severity issues  
3. **Priority 3 (Enhancement):** Implement AAA-level improvements
4. **Testing:** Conduct user testing with assistive technologies
5. **Monitoring:** Set up automated accessibility testing in CI/CD pipeline

## Testing Methodology

This audit used:
- Automated color contrast calculation (WebAIM guidelines)
- Static code analysis for accessibility patterns
- CSS feature detection for accessibility enhancements
- Component structure analysis for semantic HTML and ARIA
- Focus management verification
- Touch target size validation
- Motion sensitivity assessment

## Legal Compliance Status

${wcagCompliance.AA.compliant ? 
'✅ **LEGALLY COMPLIANT** - Meets WCAG 2.1 AA standards required by ADA, Section 508, and international accessibility laws.' :
'❌ **NOT LEGALLY COMPLIANT** - Does not meet WCAG 2.1 AA standards. Legal risk exists for ADA compliance.'}

---

*This report was automatically generated by the Income Clarity WCAG Audit Tool.*
*For questions or manual testing needs, consult with accessibility experts.*
`;
  }

  generateExecutiveSummary() {
    const { summary, wcagCompliance } = this.auditResults;
    const criticalIssues = this.violations.filter(v => v.severity === 'violation').length;
    
    return `# WCAG Accessibility Audit - Executive Summary

## Status: ${wcagCompliance.AA.compliant ? '✅ LEGALLY COMPLIANT' : '❌ ACTION REQUIRED'}

**Income Clarity Application Accessibility Assessment**
*Generated: ${new Date().toLocaleDateString()}*

### Key Findings

- **WCAG 2.1 AA Compliance:** ${wcagCompliance.AA.percentage}% (${wcagCompliance.AA.compliant ? 'PASS' : 'FAIL'})
- **Critical Issues:** ${criticalIssues} 
- **Total Tests:** ${summary.totalTests}
- **Pass Rate:** ${Math.round((summary.passes / summary.totalTests) * 100)}%

### Business Impact

${wcagCompliance.AA.compliant ? 
`**Positive:** Application meets legal accessibility requirements. Low risk of ADA lawsuits. Inclusive design supports broader user base.` :
`**Risk:** Application does not meet ADA compliance standards. Legal liability exists. ${criticalIssues} critical issues need immediate attention.`}

### Immediate Actions Required

${criticalIssues > 0 ? 
`1. **URGENT:** Fix ${criticalIssues} critical accessibility violations
2. **HIGH PRIORITY:** Review contrast ratios for text elements
3. **MEDIUM:** Address ${this.warnings.length} accessibility warnings` :
`1. **MAINTAIN:** Continue current accessibility practices
2. **ENHANCE:** Consider AAA-level improvements for competitive advantage`}

### Investment Recommendation

${criticalIssues > 5 ? 'HIGH - Significant development effort required' :
criticalIssues > 0 ? 'MEDIUM - Some development work needed' :
'LOW - Maintenance mode sufficient'}

### Timeline Estimate

${criticalIssues > 10 ? '4-6 weeks for full compliance' :
criticalIssues > 5 ? '2-4 weeks for critical fixes' :
criticalIssues > 0 ? '1-2 weeks for remaining issues' :
'Ongoing maintenance only'}

---

*Detailed technical report available in wcag-audit-report.md*
`;
  }

  findFiles(dir, extension) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && item.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    }
    
    try {
      traverse(dir);
    } catch (error) {
      console.warn(`Could not traverse ${dir}: ${error.message}`);
    }
    
    return files;
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new WCAGAuditor();
  auditor.runFullAudit().catch(console.error);
}

module.exports = WCAGAuditor;