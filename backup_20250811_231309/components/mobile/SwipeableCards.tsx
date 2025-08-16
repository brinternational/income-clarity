'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight, Circle, Dot } from 'lucide-react';
import { haptic } from '@/utils/hapticFeedback';
import { liveRegionManager } from '@/utils/accessibility';

interface SwipeableCard {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SwipeableCardsProps {
  cards: SwipeableCard[];
  initialIndex?: number;
  onCardChange?: (cardId: string, index: number) => void;
  className?: string;
  enableInfiniteLoop?: boolean;
  autoAdvance?: boolean;
  autoAdvanceInterval?: number;
}

const SwipeableCardsComponent = ({
  cards,
  initialIndex = 0,
  onCardChange,
  className = '',
  enableInfiniteLoop = false,
  autoAdvance = false,
  autoAdvanceInterval = 5000
}: SwipeableCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-advance
  useEffect(() => {
    if (autoAdvance && cards.length > 1) {
      autoAdvanceRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= cards.length) {
            return enableInfiniteLoop ? 0 : prev;
          }
          return nextIndex;
        });
      }, autoAdvanceInterval);

      return () => {
        if (autoAdvanceRef.current) {
          clearInterval(autoAdvanceRef.current);
        }
      };
    }
  }, [autoAdvance, autoAdvanceInterval, cards.length, enableInfiniteLoop]);

  // Clear auto-advance on user interaction
  const clearAutoAdvance = () => {
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  };

  // Navigate to specific card
  const navigateToCard = (index: number, userInitiated = true) => {
    if (index < 0 || index >= cards.length || index === currentIndex) return;
    
    if (userInitiated) {
      clearAutoAdvance();
      haptic.selection();
    }

    setIsTransitioning(true);
    setCurrentIndex(index);
    
    // Announce to screen readers
    const card = cards[index];
    liveRegionManager.announce(`Switched to ${card.title}: ${card.description}`, 'polite');
    
    onCardChange?.(card.id, index);

    // Reset transition state
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== containerRef.current) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          navigateToCard(currentIndex - 1);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          navigateToCard(currentIndex + 1);
          break;
        case 'Home':
          event.preventDefault();
          navigateToCard(0);
          break;
        case 'End':
          event.preventDefault();
          navigateToCard(cards.length - 1);
          break;
      }
    };

    const container = containerRef.current;
    container?.addEventListener('keydown', handleKeyDown);
    return () => container?.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    clearAutoAdvance();
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    const minSwipeDistance = 75; // Minimum distance for swipe

    if (Math.abs(distance) < minSwipeDistance) return;

    if (isLeftSwipe && currentIndex < cards.length - 1) {
      navigateToCard(currentIndex + 1);
    } else if (isLeftSwipe && enableInfiniteLoop && currentIndex === cards.length - 1) {
      navigateToCard(0);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      navigateToCard(currentIndex - 1);
    } else if (isRightSwipe && enableInfiniteLoop && currentIndex === 0) {
      navigateToCard(cards.length - 1);
    }

    // Reset touch tracking
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Pan gesture handler for more sophisticated drag behavior
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    clearAutoAdvance();
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Determine if swipe was fast enough or far enough
    const shouldSwipe = Math.abs(velocity) > 500 || Math.abs(offset) > 100;
    
    if (shouldSwipe) {
      if (offset > 0 && currentIndex > 0) {
        navigateToCard(currentIndex - 1);
      } else if (offset > 0 && enableInfiniteLoop && currentIndex === 0) {
        navigateToCard(cards.length - 1);
      } else if (offset < 0 && currentIndex < cards.length - 1) {
        navigateToCard(currentIndex + 1);
      } else if (offset < 0 && enableInfiniteLoop && currentIndex === cards.length - 1) {
        navigateToCard(0);
      }
    }
  };

  // Calculate swipe progress for visual feedback
  const getSwipeProgress = () => {
    if (!touchStart || !touchEnd) return 0;
    
    const distance = touchStart - touchEnd;
    const maxDistance = 150; // Maximum distance for full transition
    return Math.max(-1, Math.min(1, distance / maxDistance));
  };

  const swipeProgress = getSwipeProgress();

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      tabIndex={0}
      role="tabpanel"
      aria-live="polite"
      aria-label={`Super Card viewer. ${currentIndex + 1} of ${cards.length}. Use arrow keys or swipe to navigate.`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Card Container */}
      <div className="relative">
        <motion.div
          className="w-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onPanEnd={handlePanEnd}
          animate={controls}
          style={{
            x: swipeProgress * 20 // Subtle visual feedback during swipe
          }}
        >
          <AnimatePresence mode="wait" custom={currentIndex}>
            <motion.div
              key={currentCard.id}
              custom={currentIndex}
              initial={{ opacity: 0, x: 300, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -300, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {currentCard.component}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation Arrows - Desktop */}
        <div className="hidden sm:block">
          {currentIndex > 0 && (
            <motion.button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200"
              onClick={() => navigateToCard(currentIndex - 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to previous card: ${cards[currentIndex - 1]?.title}`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}
          
          {currentIndex < cards.length - 1 && (
            <motion.button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/90 transition-all duration-200"
              onClick={() => navigateToCard(currentIndex + 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to next card: ${cards[currentIndex + 1]?.title}`}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="flex justify-center items-center space-x-2 mt-4">
        {cards.map((card, index) => {
          const isActive = index === currentIndex;
          const Icon = isActive ? Dot : Circle;
          
          return (
            <motion.button
              key={card.id}
              className={`p-1 rounded-full transition-all duration-200 ${
                isActive ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => navigateToCard(index)}
              aria-label={`Go to ${card.title}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            >
              <Icon 
                className={`w-3 h-3 transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600 scale-125' 
                    : 'text-gray-400'
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
        <motion.div
          className="bg-blue-600 h-1 rounded-full"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${((currentIndex + 1) / cards.length) * 100}%` 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Card Info - Mobile */}
      <div className="sm:hidden mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{currentCard.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{currentCard.description}</p>
        <div className="text-xs text-gray-500 mt-2">
          {currentIndex + 1} of {cards.length} • Swipe to navigate
        </div>
      </div>

      {/* Accessibility Info */}
      <div className="sr-only" aria-live="polite">
        {isTransitioning && `Loading ${currentCard.title}`}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const SwipeableCards = memo(SwipeableCardsComponent, (prevProps, nextProps) => {
  return (
    prevProps.cards.length === nextProps.cards.length &&
    prevProps.initialIndex === nextProps.initialIndex &&
    prevProps.cards.every((card, index) => card.id === nextProps.cards[index]?.id)
  );
});

export default SwipeableCards;