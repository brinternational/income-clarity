#!/usr/bin/env node

/**
 * LITE-041: Mobile Responsive Verification & Enhancement
 * Tests and optimizes all 5 Super Cards for mobile responsiveness
 */

const fs = require('fs');
const path = require('path');

class MobileOptimizationVerifier {
  constructor() {
    this.results = {
      touchTargets: [],
      responsiveness: [],
      performance: [],
      accessibility: [],
      summary: {}
    };
    
    this.superCards = [
      'PerformanceHub',
      'IncomeIntelligenceHub', 
      'PortfolioStrategyHub',
      'TaxStrategyHub',
      'FinancialPlanningHub'
    ];

    this.mobileBreakpoints = {
      mobile: 375,
      tablet: 768,
      desktop: 1024
    };
  }

  async verifyMobileOptimization() {
    // console.log('📱 Starting Mobile Optimization Verification...');
    // console.log('═'.repeat(60));

    await this.checkTouchTargets();
    await this.checkResponsiveBreakpoints();
    await this.checkPerformanceOptimizations();
    await this.checkAccessibility();
    await this.generateEnhancements();
    
    this.generateReport();
    return this.results;
  }

  async checkTouchTargets() {
    // console.log('🎯 Checking Touch Targets...');
    
    const touchTargetResults = {
      compliant: 0,
      nonCompliant: 0,
      issues: []
    };

    // Check component files for touch target compliance
    for (const card of this.superCards) {
      const mobileComponentPath = path.join(__dirname, `../components/super-cards/Mobile${card}.tsx`);
      const componentPath = path.join(__dirname, `../components/super-cards/${card}.tsx`);
      
      if (fs.existsSync(mobileComponentPath)) {
        // console.log(`✅ ${card}: Has mobile-optimized component`);
        touchTargetResults.compliant++;
      } else if (fs.existsSync(componentPath)) {
        // console.log(`⚠️  ${card}: Missing mobile-specific component`);
        touchTargetResults.nonCompliant++;
        touchTargetResults.issues.push(`${card} needs mobile-optimized version`);
      }
    }

    // Check CSS for touch-friendly classes
    const cssPath = path.join(__dirname, '../styles/mobile-optimizations.css');
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      if (cssContent.includes('min-height: 44px')) {
        // console.log('✅ Touch-friendly CSS classes defined');
        touchTargetResults.compliant++;
      }
    }

    this.results.touchTargets = touchTargetResults;
  }

  async checkResponsiveBreakpoints() {
    // console.log('\n📐 Checking Responsive Breakpoints...');
    
    const responsiveResults = {
      mobile: { compliant: 0, issues: [] },
      tablet: { compliant: 0, issues: [] },
      desktop: { compliant: 0, issues: [] }
    };

    // Check Tailwind config for proper breakpoints
    const tailwindConfigPath = path.join(__dirname, '../tailwind.config.ts');
    if (fs.existsSync(tailwindConfigPath)) {
      const config = fs.readFileSync(tailwindConfigPath, 'utf8');
      
      if (config.includes('sm:') && config.includes('md:') && config.includes('lg:')) {
        // console.log('✅ Responsive breakpoints configured in Tailwind');
        responsiveResults.mobile.compliant++;
        responsiveResults.tablet.compliant++;
        responsiveResults.desktop.compliant++;
      }
    }

    // Check for mobile-first design patterns
    for (const card of this.superCards) {
      const mobileComponentPath = path.join(__dirname, `../components/super-cards/Mobile${card}.tsx`);
      
      if (fs.existsSync(mobileComponentPath)) {
        const content = fs.readFileSync(mobileComponentPath, 'utf8');
        
        // Check for responsive classes
        const hasResponsiveClasses = content.match(/(?:sm|md|lg|xl):/g);
        if (hasResponsiveClasses) {
          // console.log(`✅ ${card}: Uses responsive classes`);
          responsiveResults.mobile.compliant++;
        } else {
          // console.log(`⚠️  ${card}: May need more responsive classes`);
          responsiveResults.mobile.issues.push(`${card} needs responsive enhancement`);
        }

        // Check for mobile-specific optimizations
        if (content.includes('MobileCardLayout') || content.includes('TouchFeedback')) {
          // console.log(`✅ ${card}: Has mobile-specific optimizations`);
          responsiveResults.mobile.compliant++;
        }
      }
    }

    this.results.responsiveness = responsiveResults;
  }

  async checkPerformanceOptimizations() {
    // console.log('\n⚡ Checking Performance Optimizations...');
    
    const performanceResults = {
      lazyLoading: 0,
      caching: 0,
      bundleOptimization: 0,
      issues: []
    };

    // Check for React.lazy usage
    for (const card of this.superCards) {
      const componentPath = path.join(__dirname, `../components/super-cards/${card}.tsx`);
      const mobileComponentPath = path.join(__dirname, `../components/super-cards/Mobile${card}.tsx`);
      
      for (const filePath of [componentPath, mobileComponentPath]) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (content.includes('React.lazy') || content.includes('dynamic(')) {
            // console.log(`✅ ${card}: Uses lazy loading`);
            performanceResults.lazyLoading++;
            break;
          }
        }
      }
    }

    // Check for memoization
    const hookFiles = fs.readdirSync(path.join(__dirname, '../hooks'));
    const memoizedHooks = hookFiles.filter(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(path.join(__dirname, '../hooks', file), 'utf8');
        return content.includes('useMemo') || content.includes('useCallback');
      }
      return false;
    });

    if (memoizedHooks.length > 0) {
      // console.log(`✅ Performance hooks with memoization: ${memoizedHooks.length}`);
      performanceResults.caching = memoizedHooks.length;
    }

    this.results.performance = performanceResults;
  }

  async checkAccessibility() {
    // console.log('\n♿ Checking Accessibility Features...');
    
    const a11yResults = {
      semanticHTML: 0,
      keyboardNavigation: 0,
      screenReaderSupport: 0,
      issues: []
    };

    for (const card of this.superCards) {
      const mobileComponentPath = path.join(__dirname, `../components/super-cards/Mobile${card}.tsx`);
      
      if (fs.existsSync(mobileComponentPath)) {
        const content = fs.readFileSync(mobileComponentPath, 'utf8');
        
        // Check for semantic elements
        if (content.includes('role=') || content.includes('aria-')) {
          // console.log(`✅ ${card}: Has ARIA attributes`);
          a11yResults.screenReaderSupport++;
        }

        // Check for keyboard navigation
        if (content.includes('onKeyDown') || content.includes('tabIndex')) {
          // console.log(`✅ ${card}: Supports keyboard navigation`);
          a11yResults.keyboardNavigation++;
        }

        // Check for semantic HTML
        if (content.includes('<button') || content.includes('<nav') || content.includes('<main')) {
          // console.log(`✅ ${card}: Uses semantic HTML`);
          a11yResults.semanticHTML++;
        }
      }
    }

    this.results.accessibility = a11yResults;
  }

  async generateEnhancements() {
    // console.log('\n🔧 Generating Mobile Enhancements...');

    // Create enhanced mobile navigation component
    const mobileNavEnhancement = `
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Grid3X3, Smartphone } from 'lucide-react';
import { TouchFeedback } from '../mobile/TouchFeedback';
import { haptic } from '@/utils/hapticFeedback';

interface EnhancedMobileNavigationProps {
  activeCard: string;
  onCardChange: (cardId: string) => void;
  cards: Array<{
    id: string;
    title: string;
    icon: React.ComponentType<any>;
    ready: boolean;
  }>;
}

/**
 * LITE-041: Enhanced Mobile Navigation for Super Cards
 * - Minimum 44px touch targets
 * - Haptic feedback on all interactions
 * - Optimized for one-handed use
 * - Clear visual feedback
 */
export const EnhancedMobileNavigation: React.FC<EnhancedMobileNavigationProps> = ({
  activeCard,
  onCardChange,
  cards
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCardGrid, setShowCardGrid] = useState(false);

  const handleCardSelect = async (cardId: string) => {
    if (cardId !== activeCard) {
      await haptic('medium');
      onCardChange(cardId);
      setIsExpanded(false);
      setShowCardGrid(false);
    }
  };

  const toggleExpanded = async () => {
    await haptic('light');
    setIsExpanded(!isExpanded);
  };

  const toggleCardGrid = async () => {
    await haptic('light');
    setShowCardGrid(!showCardGrid);
  };

  const activeCardData = cards.find(card => card.id === activeCard);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
      {/* Quick Card Grid Toggle */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: showCardGrid ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 grid grid-cols-3 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            const isActive = card.id === activeCard;
            
            return (
              <TouchFeedback
                key={card.id}
                onPress={() => handleCardSelect(card.id)}
                className={\`
                  flex flex-col items-center justify-center p-3 rounded-lg min-h-[64px]
                  \${isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                  \${!card.ready && 'opacity-50'}
                \`}
                disabled={!card.ready}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {card.title}
                </span>
                {!card.ready && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full" />
                )}
              </TouchFeedback>
            );
          })}
        </div>
      </motion.div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between min-h-[60px]">
        {/* Current Card Info */}
        <div className="flex-1 flex items-center">
          {activeCardData && (
            <>
              <activeCardData.icon className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeCardData.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCardData.ready ? 'Ready' : 'Loading...'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          {/* Card Grid Toggle */}
          <TouchFeedback
            onPress={toggleCardGrid}
            className={\`
              p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center
              \${showCardGrid 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            \`}
            accessibilityLabel="Toggle card grid"
          >
            <Grid3X3 className="h-5 w-5" />
          </TouchFeedback>

          {/* Expand/Collapse Toggle */}
          <TouchFeedback
            onPress={toggleExpanded}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            accessibilityLabel={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </TouchFeedback>
        </div>
      </div>

      {/* Extended Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 p-4"
          >
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <TouchFeedback
                onPress={() => {/* Navigate to dashboard */}}
                className="flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px]"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Dashboard</span>
              </TouchFeedback>

              <TouchFeedback
                onPress={() => {/* Refresh current card */}}
                className="flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px]"
              >
                <ChevronUp className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Refresh</span>
              </TouchFeedback>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

    // Write enhanced mobile navigation component
    const navPath = path.join(__dirname, '../components/navigation/EnhancedMobileNavigation.tsx');
    fs.writeFileSync(navPath, mobileNavEnhancement);
    // console.log('✅ Created Enhanced Mobile Navigation component');

    // Create mobile optimization utility
    const mobileOptimizationUtility = `
/**
 * LITE-041: Mobile Optimization Utilities
 * Comprehensive mobile UX enhancements
 */

export class MobileOptimizationManager {
  private static instance: MobileOptimizationManager;
  
  private constructor() {}
  
  static getInstance(): MobileOptimizationManager {
    if (!MobileOptimizationManager.instance) {
      MobileOptimizationManager.instance = new MobileOptimizationManager();
    }
    return MobileOptimizationManager.instance;
  }

  /**
   * Verify touch target compliance
   */
  verifyTouchTargets(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // 44px minimum per Apple/Google guidelines
    
    return rect.width >= minSize && rect.height >= minSize;
  }

  /**
   * Add touch-friendly classes to elements
   */
  enhanceTouchTargets(container: HTMLElement): void {
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]'
    );

    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      if (!this.verifyTouchTargets(htmlElement)) {
        htmlElement.classList.add('touch-friendly');
        htmlElement.style.minHeight = '44px';
        htmlElement.style.minWidth = '44px';
        htmlElement.style.touchAction = 'manipulation';
      }
    });
  }

  /**
   * Optimize card layout for mobile
   */
  optimizeCardForMobile(cardElement: HTMLElement): void {
    // Add mobile-friendly scrolling
    cardElement.style.webkitOverflowScrolling = 'touch';
    cardElement.style.overscrollBehaviorY = 'contain';
    
    // Enable hardware acceleration
    cardElement.style.transform = 'translateZ(0)';
    
    // Enhance touch targets
    this.enhanceTouchTargets(cardElement);
    
    // Add mobile-specific event listeners
    this.addMobileEventListeners(cardElement);
  }

  /**
   * Add mobile-specific event listeners
   */
  private addMobileEventListeners(element: HTMLElement): void {
    // Prevent zoom on double-tap for buttons
    const buttons = element.querySelectorAll('button, [role="button"]');
    buttons.forEach((button) => {
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
      }, { passive: false });
    });

    // Add pull-to-refresh prevention where not wanted
    element.addEventListener('touchstart', (e) => {
      if (element.scrollTop === 0) {
        element.classList.add('prevent-pull-refresh');
      }
    });
  }

  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }

  /**
   * Get safe area values for devices with notches
   */
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    const style = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0')
    };
  }
}

// Export singleton instance
export const mobileOptimizer = MobileOptimizationManager.getInstance();
`;

    const utilPath = path.join(__dirname, '../utils/mobileOptimization.ts');
    fs.writeFileSync(utilPath, mobileOptimizationUtility);
    // console.log('✅ Created Mobile Optimization utility');
  }

  generateReport() {
    // console.log('\n📊 Mobile Optimization Report');
    // console.log('═'.repeat(60));
    
    const { touchTargets, responsiveness, performance, accessibility } = this.results;
    
    // console.log('🎯 Touch Targets:');
    // console.log(`   ✅ Compliant: ${touchTargets.compliant}`);
    // console.log(`   ❌ Non-compliant: ${touchTargets.nonCompliant}`);
    if (touchTargets.issues.length > 0) {
      touchTargets.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }

    // console.log('\n📐 Responsiveness:');
    // console.log(`   📱 Mobile: ${responsiveness.mobile.compliant} compliant`);
    // console.log(`   📟 Tablet: ${responsiveness.tablet.compliant} compliant`);
    // console.log(`   🖥️  Desktop: ${responsiveness.desktop.compliant} compliant`);

    // console.log('\n⚡ Performance:');
    // console.log(`   🔄 Lazy Loading: ${performance.lazyLoading} components`);
    // console.log(`   🧠 Memoization: ${performance.caching} hooks`);

    // console.log('\n♿ Accessibility:');
    // console.log(`   🏷️  Semantic HTML: ${accessibility.semanticHTML} components`);
    // console.log(`   ⌨️  Keyboard Nav: ${accessibility.keyboardNavigation} components`);
    // console.log(`   🔊 Screen Reader: ${accessibility.screenReaderSupport} components`);

    // Calculate overall score
    const totalChecks = 20;
    const passedChecks = touchTargets.compliant + 
                        responsiveness.mobile.compliant + 
                        responsiveness.tablet.compliant + 
                        responsiveness.desktop.compliant +
                        performance.lazyLoading + 
                        performance.caching +
                        accessibility.semanticHTML +
                        accessibility.keyboardNavigation +
                        accessibility.screenReaderSupport;

    const score = Math.round((passedChecks / totalChecks) * 100);
    
    // console.log(`\n🏆 Overall Mobile Optimization Score: ${score}%`);
    
    if (score >= 90) {
      // console.log('🎉 Excellent mobile optimization!');
    } else if (score >= 75) {
      // console.log('👍 Good mobile optimization, minor improvements possible');
    } else if (score >= 50) {
      // console.log('⚠️  Moderate mobile optimization, several areas need attention');
    } else {
      // console.log('❌ Poor mobile optimization, significant improvements needed');
    }

    this.results.summary = {
      score,
      totalChecks,
      passedChecks,
      recommendations: this.generateRecommendations(score)
    };
  }

  generateRecommendations(score) {
    const recommendations = [];

    if (score < 90) {
      recommendations.push('Ensure all interactive elements meet 44px minimum touch target size');
      recommendations.push('Test on actual mobile devices with different screen sizes');
      recommendations.push('Verify haptic feedback is working on supported devices');
    }

    if (score < 75) {
      recommendations.push('Implement lazy loading for better performance');
      recommendations.push('Add proper ARIA labels for screen reader support');
      recommendations.push('Test keyboard navigation on all interactive elements');
    }

    if (score < 50) {
      recommendations.push('Create mobile-specific components for all Super Cards');
      recommendations.push('Implement proper responsive breakpoints');
      recommendations.push('Add comprehensive accessibility features');
    }

    return recommendations;
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new MobileOptimizationVerifier();
  verifier.verifyMobileOptimization()
    .then((results) => {
      if (results.summary.score >= 75) {
        // console.log('\n✅ Mobile optimization verification passed!');
        process.exit(0);
      } else {
        // console.log('\n❌ Mobile optimization needs improvement');
        // console.log('\n📝 Recommendations:');
        results.summary.recommendations.forEach(rec => {
          // console.log(`   • ${rec}`);
        });
        process.exit(1);
      }
    })
    .catch((error) => {
      // console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { MobileOptimizationVerifier };