'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun, 
  Zap, 
  X,
  ChevronRight,
  Database,
  Shield,
  Activity,
  HelpCircle,
  Bell,
  Download
} from 'lucide-react';
import { haptic } from '@/utils/hapticFeedback';
import { liveRegionManager } from '@/utils/accessibility';

interface DrawerItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface DrawerSection {
  title: string;
  items: DrawerItem[];
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  sections?: DrawerSection[];
  className?: string;
  placement?: 'left' | 'right';
  backdropBlur?: boolean;
  persistent?: boolean;
}

const MobileDrawerComponent = ({
  isOpen,
  onClose,
  onOpenChange,
  sections = [],
  className = '',
  placement = 'left',
  backdropBlur = true,
  persistent = false
}: MobileDrawerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for dark mode preference
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                   document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };
    
    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    return () => mediaQuery.removeEventListener('change', checkDarkMode);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        if (isOpen && !persistent) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, persistent]);

  // Handle pan gesture for drawer
  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isOpen) return;
    
    const offset = placement === 'left' ? info.offset.x : -info.offset.x;
    if (offset < 0) { // Only allow closing gesture
      setIsDragging(true);
    }
  };

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = placement === 'left' ? info.offset.x : -info.offset.x;
    const velocity = placement === 'left' ? info.velocity.x : -info.velocity.x;
    
    setIsDragging(false);
    
    // Close if dragged far enough or fast enough
    if (offset < -100 || velocity < -500) {
      onClose();
    }
  };

  // Default sections if none provided
  const defaultSections: DrawerSection[] = [
    {
      title: 'Super Cards',
      items: [
        {
          id: 'performance-card',
          label: 'Performance Hub',
          description: 'Portfolio vs SPY analysis',
          icon: () => <span className="text-blue-600">📊</span>,
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard/super-cards?card=performance';
            }
            haptic.selection();
          }
        },
        {
          id: 'income-card', 
          label: 'Income Intelligence',
          description: 'Income clarity & projections',
          icon: () => <span className="text-green-600">💰</span>,
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard/super-cards?card=income';
            }
            haptic.selection();
          }
        },
        {
          id: 'tax-card',
          label: 'Tax Strategy',
          description: 'Tax optimization & planning',
          icon: () => <span className="text-purple-600">🏦</span>,
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard/super-cards?card=tax';
            }
            haptic.selection();
          }
        },
        {
          id: 'portfolio-card',
          label: 'Portfolio Strategy', 
          description: 'Rebalancing & health metrics',
          icon: () => <span className="text-orange-600">📈</span>,
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard/super-cards?card=portfolio';
            }
            haptic.selection();
          }
        },
        {
          id: 'planning-card',
          label: 'Financial Planning',
          description: 'FIRE progress & milestones', 
          icon: () => <span className="text-indigo-600">🎯</span>,
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard/super-cards?card=planning';
            }
            haptic.selection();
          }
        }
      ]
    },
    {
      title: 'Quick Settings',
      items: [
        {
          id: 'theme',
          label: darkMode ? 'Light Mode' : 'Dark Mode',
          description: 'Toggle appearance',
          icon: darkMode ? Sun : Moon,
          onClick: () => {
            setDarkMode(!darkMode);
            haptic.impact('light');
            // Toggle theme implementation would go here
          }
        },
        {
          id: 'refresh',
          label: 'Refresh Data',
          description: lastRefresh ? `Last: ${lastRefresh.toLocaleTimeString()}` : 'Sync all data',
          icon: RefreshCw,
          onClick: () => {
            setLastRefresh(new Date());
            haptic.impact('medium');
            liveRegionManager.announce('Refreshing all data', 'polite');
          }
        }
      ]
    },
    {
      title: 'Performance',
      items: [
        {
          id: 'cache',
          label: 'Clear Cache',
          description: 'Free up storage space',
          icon: Database,
          onClick: () => {
            haptic.impact('medium');
            liveRegionManager.announce('Cache cleared', 'polite');
          }
        },
        {
          id: 'offline',
          label: 'Offline Mode',
          description: isOnline ? 'Available' : 'Offline - limited features',
          icon: isOnline ? Wifi : WifiOff,
          onClick: () => {
            haptic.selection();
          },
          disabled: !isOnline
        }
      ]
    },
    {
      title: 'App Settings',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          description: 'Account and app preferences',
          icon: Settings,
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/settings';
            }
            haptic.selection();
          }
        },
        {
          id: 'notifications',
          label: 'Notifications',
          description: 'Manage alerts and updates',
          icon: Bell,
          onClick: () => {
            haptic.selection();
          }
        },
        {
          id: 'privacy',
          label: 'Privacy & Security',
          description: 'Data protection settings',
          icon: Shield,
          onClick: () => {
            haptic.selection();
          }
        },
        {
          id: 'help',
          label: 'Help & Support',
          description: 'Get assistance',
          icon: HelpCircle,
          onClick: () => {
            haptic.selection();
          }
        }
      ]
    }
  ];

  const activeSections = sections.length > 0 ? sections : defaultSections;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 z-40 ${
              backdropBlur ? 'backdrop-blur-sm bg-black/30' : 'bg-black/50'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !persistent && onClose()}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className={`fixed top-0 ${placement}-0 z-50 h-full w-80 max-w-[85vw] ${className}`}
            style={{
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
            initial={{
              x: placement === 'left' ? '-100%' : '100%'
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: placement === 'left' ? '-100%' : '100%'
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            drag={placement === 'left' ? 'x' : 'x'}
            dragConstraints={{ 
              left: placement === 'left' ? -400 : 0,
              right: placement === 'left' ? 0 : 400
            }}
            dragElastic={{ left: 0, right: 0.2 }}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
          >
            {/* Drawer Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Settings 
                    className="w-5 h-5" 
                    style={{ color: 'var(--color-accent)' }}
                  />
                </div>
                <div>
                  <h2 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Quick Settings
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Performance & preferences
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                }}
                aria-label="Close settings drawer"
              >
                <X 
                  className="w-5 h-5" 
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </button>
            </div>

            {/* Connection Status */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <div 
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {isOnline ? 'Connected' : 'Offline'}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {isOnline ? 'Real-time data available' : 'Using cached data'}
                  </div>
                </div>
                <Activity 
                  className={`w-4 h-4 ${
                    isOnline ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {activeSections.map((section, sectionIndex) => (
                <div key={section.title} className="p-4">
                  <h3 
                    className="text-sm font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {section.title}
                  </h3>
                  
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      
                      return (
                        <motion.button
                          key={item.id}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                            item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                          style={{
                            backgroundColor: 'var(--color-secondary)',
                            color: 'var(--color-text-primary)'
                          }}
                          onClick={() => {
                            if (!item.disabled) {
                              item.onClick();
                              haptic.selection();
                            }
                          }}
                          disabled={item.disabled}
                          onMouseEnter={(e) => {
                            if (!item.disabled) {
                              e.currentTarget.style.backgroundColor = 'var(--color-tertiary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: (sectionIndex * 0.1) + (itemIndex * 0.05),
                            duration: 0.3
                          }}
                          whileHover={!item.disabled ? { scale: 1.02 } : {}}
                          whileTap={!item.disabled ? { scale: 0.98 } : {}}
                        >
                          <div 
                            className="p-2 rounded-lg"
                            style={{ 
                              backgroundColor: item.disabled ? 'var(--color-border)' : 'var(--color-accent)',
                              opacity: item.disabled ? 0.5 : 0.1
                            }}
                          >
                            <Icon 
                              className="w-5 h-5" 
                              style={{ 
                                color: item.disabled ? 'var(--color-text-secondary)' : 'var(--color-accent)'
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div 
                              className="font-medium truncate"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {item.label}
                            </div>
                            {item.description && (
                              <div 
                                className="text-sm truncate"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {item.description}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <div 
                                className="px-2 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: 'var(--color-accent)',
                                  color: 'white',
                                  opacity: 0.9
                                }}
                              >
                                {item.badge}
                              </div>
                            )}
                            <ChevronRight 
                              className="w-4 h-4" 
                              style={{ color: 'var(--color-text-secondary)' }}
                            />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div 
              className="p-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="text-center">
                <div 
                  className="text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Income Clarity v1.0
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Swipe left to close
                </div>
              </div>
            </div>

            {/* Drag indicator */}
            {isDragging && (
              <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Memoize to prevent unnecessary re-renders
export const MobileDrawer = memo(MobileDrawerComponent, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.placement === nextProps.placement &&
    prevProps.persistent === nextProps.persistent &&
    prevProps.sections?.length === nextProps.sections?.length
  );
});

export default MobileDrawer;