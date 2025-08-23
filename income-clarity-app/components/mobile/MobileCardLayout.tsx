'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionData {
  id: string;
  title: string;
  content: ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface MobileCardLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: any;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  compact?: boolean;
  isCollapsible?: boolean;
  initiallyExpanded?: boolean;
  showSectionCount?: boolean;
  sectionCount?: number;
  sections?: SectionData[];
  onSectionToggle?: (sectionId: string, isCollapsed: boolean) => void;
  enableStickyHeader?: boolean;
  compactMode?: boolean;
}

export const MobileCardLayout = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  onSwipeLeft,
  onSwipeRight,
  compact = false,
  isCollapsible = false,
  initiallyExpanded = true,
  showSectionCount = false,
  sectionCount = 0,
  sections,
  onSectionToggle,
  enableStickyHeader = false,
  compactMode = false
}: MobileCardLayoutProps) => {
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
        </div>
      )}
      
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-border overflow-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100 && onSwipeRight) {
            onSwipeRight();
          } else if (info.offset.x < -100 && onSwipeLeft) {
            onSwipeLeft();
          }
        }}
        whileDrag={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MobileCardLayout;