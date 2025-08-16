'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Minimize2, Maximize2, Eye, EyeOff } from 'lucide-react';
import { TouchFeedback } from './TouchFeedback';
import { haptic } from '@/utils/hapticFeedback';

interface CardSection {
  id: string;
  title: string;
  content: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  priority?: 'high' | 'medium' | 'low'; // Determines stacking order on mobile
  minHeight?: number; // Minimum height when collapsed
}

interface MobileCardLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  sections: CardSection[];
  className?: string;
  onSectionToggle?: (sectionId: string, isCollapsed: boolean) => void;
  enableStickyHeader?: boolean;
  compactMode?: boolean;
  showSectionCount?: boolean;
}

/**
 * MobileCardLayout - Optimized card layout for mobile devices
 * 
 * Features:
 * - Vertical stacking optimized for mobile screens
 * - Collapsible sections with smooth animations
 * - Sticky headers that remain visible during scroll
 * - Minimum 44px touch targets
 * - Optimized font sizes (16px+ for body text)
 * - Priority-based section ordering
 * - Compact mode for space-constrained environments
 */
export const MobileCardLayout: React.FC<MobileCardLayoutProps> = ({
  title,
  subtitle,
  icon: Icon,
  sections,
  className = '',
  onSectionToggle,
  enableStickyHeader = true,
  compactMode = false,
  showSectionCount = true
}) => {
  // Track collapsed state for each section
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(section => {
      initial[section.id] = section.defaultCollapsed || false;
    });
    return initial;
  });

  // Track if header is sticky (intersecting with top)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Setup intersection observer for sticky header
  useEffect(() => {
    if (!enableStickyHeader || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -1px 0px' // Trigger just before element leaves viewport
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [enableStickyHeader]);

  // Toggle section collapse state
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newState = { ...prev, [sectionId]: !prev[sectionId] };
      
      // Trigger haptic feedback
      haptic.selection();
      
      // Notify parent component
      onSectionToggle?.(sectionId, newState[sectionId]);
      
      return newState;
    });
  }, [onSectionToggle]);

  // Collapse all sections
  const collapseAll = useCallback(() => {
    const newState: Record<string, boolean> = {};
    sections.forEach(section => {
      if (section.isCollapsible !== false) {
        newState[section.id] = true;
      }
    });
    setCollapsedSections(newState);
    haptic.impact('light');
  }, [sections]);

  // Expand all sections
  const expandAll = useCallback(() => {
    const newState: Record<string, boolean> = {};
    sections.forEach(section => {
      newState[section.id] = false;
    });
    setCollapsedSections(newState);
    haptic.impact('light');
  }, [sections]);

  // Sort sections by priority for optimal mobile display
  const sortedSections = [...sections].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    return aPriority - bPriority;
  });

  // Calculate stats
  const collapsibleSections = sections.filter(s => s.isCollapsible !== false);
  const collapsedCount = collapsibleSections.filter(s => collapsedSections[s.id]).length;
  const expandedCount = collapsibleSections.length - collapsedCount;

  return (
    <div className={`mobile-card-layout bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Sticky Header Sentinel */}
      {enableStickyHeader && <div ref={sentinelRef} className="h-1 -mt-1" />}
      
      {/* Card Header */}
      <motion.div
        ref={headerRef}
        className={`card-header transition-all duration-200 ${
          enableStickyHeader && isHeaderSticky 
            ? 'sticky top-0 z-20 shadow-md bg-white/95 backdrop-blur-sm' 
            : ''
        }`}
        animate={{
          paddingTop: isHeaderSticky ? '0.5rem' : compactMode ? '1rem' : '1.5rem',
          paddingBottom: isHeaderSticky ? '0.5rem' : compactMode ? '0.75rem' : '1rem'
        }}
      >
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {Icon && (
                <div className={`flex-shrink-0 ${isHeaderSticky ? 'w-6 h-6' : compactMode ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  <Icon className={`text-blue-600 ${isHeaderSticky ? 'w-6 h-6' : compactMode ? 'w-8 h-8' : 'w-10 h-10'}`} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <motion.h2 
                  className={`font-bold text-gray-900 truncate transition-all ${
                    isHeaderSticky ? 'text-lg' : compactMode ? 'text-xl' : 'text-2xl'
                  }`}
                  layout
                >
                  {title}
                </motion.h2>
                {subtitle && !isHeaderSticky && (
                  <motion.p 
                    className={`text-gray-600 mt-1 ${compactMode ? 'text-sm' : 'text-base'}`}
                    initial={{ opacity: 1, height: 'auto' }}
                    animate={{ opacity: isHeaderSticky ? 0 : 1, height: isHeaderSticky ? 0 : 'auto' }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center space-x-2 ml-4">
              {showSectionCount && collapsibleSections.length > 0 && (
                <div className={`text-gray-500 ${compactMode || isHeaderSticky ? 'text-xs' : 'text-sm'} hidden sm:block`}>
                  {expandedCount}/{collapsibleSections.length} expanded
                </div>
              )}
              
              {/* Collapse/Expand All Toggle */}
              {collapsibleSections.length > 1 && (
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <TouchFeedback
                    onClick={expandAll}
                    className={`px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors ${
                      compactMode || isHeaderSticky ? 'min-h-[36px]' : 'min-h-[44px]'
                    }`}
                    aria-label="Expand all sections"
                  >
                    <Maximize2 className={`text-gray-600 ${compactMode || isHeaderSticky ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </TouchFeedback>
                  
                  <div className="w-px bg-gray-200" />
                  
                  <TouchFeedback
                    onClick={collapseAll}
                    className={`px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors ${
                      compactMode || isHeaderSticky ? 'min-h-[36px]' : 'min-h-[44px]'
                    }`}
                    aria-label="Collapse all sections"
                  >
                    <Minimize2 className={`text-gray-600 ${compactMode || isHeaderSticky ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </TouchFeedback>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card Sections */}
      <div className="card-sections">
        {sortedSections.map((section, index) => {
          const isCollapsed = collapsedSections[section.id];
          const isCollapsible = section.isCollapsible !== false;
          
          return (
            <div key={section.id} className="section-container">
              {/* Section Header */}
              {isCollapsible ? (
                <TouchFeedback
                  onClick={() => toggleSection(section.id)}
                  className="section-header w-full text-left px-4 sm:px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100 min-h-[44px] flex items-center justify-between"
                  aria-expanded={!isCollapsed}
                  aria-controls={`section-content-${section.id}`}
                >
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">
                    {section.title}
                  </span>
                  <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </TouchFeedback>
              ) : (
                <div className="section-header px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">
                    {section.title}
                  </span>
                </div>
              )}

              {/* Section Content */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    id={`section-content-${section.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: 'auto', 
                      opacity: 1,
                      minHeight: section.minHeight || 0
                    }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth expansion
                    }}
                    className="section-content overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 py-4">
                      {/* Ensure minimum font size for mobile readability */}
                      <div className="text-gray-800 text-base leading-relaxed mobile-optimized-text">
                        {section.content}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Mobile-Optimized Styles */}
      <style jsx>{`
        .mobile-optimized-text {
          /* Ensure minimum 16px font size for mobile readability */
          font-size: max(16px, 1rem);
          line-height: 1.6;
        }
        
        .mobile-optimized-text h1,
        .mobile-optimized-text h2,
        .mobile-optimized-text h3,
        .mobile-optimized-text h4 {
          font-size: max(18px, 1.125rem);
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1f2937;
        }
        
        .mobile-optimized-text p {
          margin-bottom: 1rem;
        }
        
        .mobile-optimized-text ul,
        .mobile-optimized-text ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .mobile-optimized-text li {
          margin-bottom: 0.5rem;
        }
        
        /* Ensure proper touch targets on mobile */
        @media (max-width: 768px) {
          .section-header {
            min-height: 44px;
            padding: 12px 16px;
          }
          
          .card-header {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .section-content {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
        
        /* Smooth scrolling for nested content */
        .section-content {
          scroll-behavior: smooth;
        }
        
        /* Enhanced focus states for accessibility */
        .section-header:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }
      `}</style>
    </div>
  );
};

export default MobileCardLayout;