
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
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg min-h-[64px]
                  ${isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                  ${!card.ready && 'opacity-50'}
                `}
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
            className={`
              p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center
              ${showCardGrid 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
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
