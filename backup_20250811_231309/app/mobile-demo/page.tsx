'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Heart, Brain, Zap, Menu, RefreshCw, ArrowLeft } from 'lucide-react';

// Import all our new mobile components
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { SwipeableCards } from '@/components/mobile/SwipeableCards';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { GestureHandler } from '@/components/mobile/GestureHandler';
import { MobileDrawer } from '@/components/mobile/MobileDrawer';
import { TouchFeedback } from '@/components/mobile/TouchFeedback';
import { HapticButton, HapticToggleButton } from '@/components/ui/HapticButton';
import HapticSettings from '@/components/settings/HapticSettings';
import { haptic } from '@/utils/hapticFeedback';

// Import Super Cards for demo (using mobile-optimized versions)
import { MobilePerformanceHub } from '@/components/super-cards/MobilePerformanceHub';
import { MobileIncomeIntelligenceHub } from '@/components/super-cards/MobileIncomeIntelligenceHub';

/**
 * Mobile Navigation Excellence Demo Page
 * Comprehensive showcase of all mobile features: swipe navigation, pull-to-refresh, 
 * gesture shortcuts, touch feedback, mobile drawer, and haptic feedback
 */
export default function MobileDemoPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toggleState, setToggleState] = useState(false);
  const [currentCard, setCurrentCard] = useState('performance');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [gestureLog, setGestureLog] = useState<string[]>([]);

  // Mock data for Super Card demos
  const portfolioData = {
    totalValue: 125000,
    totalReturn: 8.2,
    spyReturn: 6.1,
    outperformance: 2.1
  };

  const clarityData = {
    grossMonthly: 4500,
    taxOwed: 675,
    netMonthly: 3825,
    monthlyExpenses: 3200,
    availableToReinvest: 625,
    aboveZeroLine: true
  };

  // Demo Super Cards for swipeable interface
  const demoCards = [
    {
      id: 'performance',
      title: 'Performance Hub',
      description: 'Portfolio performance vs SPY benchmark',
      icon: BarChart3,
      component: (
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
          <MobilePerformanceHub 
            portfolioData={portfolioData}
            isLoading={false}
          />
        </div>
      )
    },
    {
      id: 'income',
      title: 'Income Intelligence',
      description: 'Dividend income analysis and planning',
      icon: DollarSign,
      component: (
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
          <MobileIncomeIntelligenceHub 
            clarityData={clarityData}
            isLoading={false}
          />
        </div>
      )
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Coverage',
      description: 'Expense coverage and FIRE progress',
      icon: Heart,
      component: (
        <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-16 h-16 text-pink-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-pink-800 mb-2">Lifestyle Coverage</h3>
            <p className="text-pink-700 mb-4">Track your expense milestones and FIRE progress</p>
            <div className="bg-white/80 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">85%</div>
              <div className="text-sm text-pink-600">Expenses Covered</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'strategy',
      title: 'Strategy Optimization',
      description: 'Tax optimization and rebalancing insights',
      icon: Brain,
      component: (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-purple-800 mb-2">Strategy Optimization</h3>
            <p className="text-purple-700 mb-4">AI-powered tax optimization and rebalancing</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">$1,250</div>
                <div className="text-xs text-purple-600">Tax Savings</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-xs text-purple-600">Suggestions</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Handle refresh for pull-to-refresh demo
  const handleRefresh = async () => {
    setLastRefresh(new Date());
    setGestureLog(prev => [...prev, 'Pull-to-refresh triggered']);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Gesture handlers for comprehensive gesture demo
  const gestureHandlers = {
    swipeUp: () => setGestureLog(prev => [...prev, 'Swipe up: Show details']),
    swipeDown: () => setGestureLog(prev => [...prev, 'Swipe down: Hide details']),
    doubleTap: () => setGestureLog(prev => [...prev, 'Double tap: Favorite card']),
    longPress: () => {
      setGestureLog(prev => [...prev, 'Long press: Show context menu']);
      setShowDrawer(true);
    },
    pinchIn: () => setGestureLog(prev => [...prev, 'Pinch in: Zoom out']),
    pinchOut: () => setGestureLog(prev => [...prev, 'Pinch out: Zoom in'])
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Touch Feedback */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <TouchFeedback
            onClick={() => window.history.back()}
            className="p-2 rounded-lg"
            rippleColor="rgba(59, 130, 246, 0.3)"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </TouchFeedback>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">Mobile Excellence Demo</h1>
            <p className="text-xs text-gray-500">Touch-optimized experience</p>
          </div>
          
          <TouchFeedback
            onClick={() => setShowDrawer(true)}
            className="p-2 rounded-lg"
            rippleColor="rgba(59, 130, 246, 0.3)"
            aria-label="Open settings menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </TouchFeedback>
        </div>
      </div>

      {/* Pull-to-Refresh Wrapper */}
      <PullToRefresh onRefresh={handleRefresh}>
        {/* Gesture Handler Wrapper */}
        <GestureHandler gestures={gestureHandlers} className="min-h-screen">
          {/* Main Content */}
          <div className="px-4 py-6">
            {/* Status Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Mobile Features Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">All systems operational</span>
                </div>
              </div>
              
              {lastRefresh && (
                <div className="text-sm text-gray-600">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Feature Showcase Grid */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Mobile Features</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Swipe Navigation', desc: 'Between cards', color: 'blue', status: '✓' },
                  { name: 'Pull to Refresh', desc: 'Drag down', color: 'green', status: '✓' },
                  { name: 'Touch Feedback', desc: 'Ripple effects', color: 'purple', status: '✓' },
                  { name: 'Haptic Feedback', desc: 'Vibration', color: 'amber', status: '✓' },
                  { name: 'Gesture Shortcuts', desc: 'Pinch, double-tap', color: 'red', status: '✓' },
                  { name: 'Mobile Drawer', desc: 'Settings panel', color: 'indigo', status: '✓' }
                ].map((feature) => (
                  <TouchFeedback
                    key={feature.name}
                    onClick={() => setGestureLog(prev => [...prev, `Feature tapped: ${feature.name}`])}
                    className={`text-center p-3 bg-${feature.color}-50 rounded-lg border border-${feature.color}-200`}
                  >
                    <div className={`w-8 h-8 bg-${feature.color}-600 rounded-full mx-auto mb-2 flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{feature.status}</span>
                    </div>
                    <div className={`text-sm font-medium text-${feature.color}-900`}>{feature.name}</div>
                    <div className={`text-xs text-${feature.color}-700`}>{feature.desc}</div>
                  </TouchFeedback>
                ))}
              </div>
            </div>

            {/* Mobile Card Layout Features */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📱 Mobile Card Layout Features</h2>
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
                <p className="mb-2"><strong>✨ New MOB-005 Features:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Collapsible Sections:</strong> Tap section headers to expand/collapse</li>
                  <li><strong>Sticky Headers:</strong> Key metrics stay visible while scrolling</li>
                  <li><strong>44px Touch Targets:</strong> All interactive elements meet accessibility standards</li>
                  <li><strong>16px+ Font Sizes:</strong> Optimized text readability on mobile devices</li>
                  <li><strong>Priority-based Layout:</strong> High-priority sections shown first</li>
                  <li><strong>Auto-collapse:</strong> Low-priority sections collapse during long scrolls</li>
                  <li><strong>Persistent State:</strong> Layout preferences saved across sessions</li>
                </ul>
              </div>
            </div>

            {/* Swipeable Super Cards */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📱 Mobile-Optimized Super Cards</h2>
              <SwipeableCards
                cards={demoCards}
                onCardChange={(cardId, index) => {
                  setCurrentCard(cardId);
                  setGestureLog(prev => [...prev, `Card changed to: ${cardId}`]);
                }}
                enableInfiniteLoop={true}
                className="min-h-[500px]"
              />
            </div>

            {/* Haptic Test Section */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔊 Haptic Testing</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <TouchFeedback
                  onClick={() => {
                    haptic.light();
                    setGestureLog(prev => [...prev, 'Haptic: Light feedback']);
                  }}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="text-center">
                    <div className="font-medium text-blue-900">Light</div>
                    <div className="text-xs text-blue-700">Button tap</div>
                  </div>
                </TouchFeedback>

                <TouchFeedback
                  onClick={() => {
                    haptic.medium();
                    setGestureLog(prev => [...prev, 'Haptic: Medium feedback']);
                  }}
                  className="p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="text-center">
                    <div className="font-medium text-green-900">Medium</div>
                    <div className="text-xs text-green-700">Selection</div>
                  </div>
                </TouchFeedback>

                <TouchFeedback
                  onClick={() => {
                    haptic.strong();
                    setGestureLog(prev => [...prev, 'Haptic: Strong feedback']);
                  }}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="text-center">
                    <div className="font-medium text-red-900">Strong</div>
                    <div className="text-xs text-red-700">Important action</div>
                  </div>
                </TouchFeedback>

                <TouchFeedback
                  onClick={() => {
                    haptic.error();
                    setGestureLog(prev => [...prev, 'Haptic: Error pattern']);
                  }}
                  className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="text-center">
                    <div className="font-medium text-amber-900">Error</div>
                    <div className="text-xs text-amber-700">Multiple pulses</div>
                  </div>
                </TouchFeedback>
              </div>
              
              {/* Settings Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Advanced Settings</span>
                <TouchFeedback
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    showSettings 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {showSettings ? 'Hide' : 'Show'} Settings
                </TouchFeedback>
              </div>
              
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4"
                >
                  <HapticSettings />
                </motion.div>
              )}
            </div>

            {/* Gesture Log */}
            <div className="bg-white rounded-lg p-4 mb-20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">📝 Gesture Activity Log</h2>
                <TouchFeedback
                  onClick={() => setGestureLog([])}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                >
                  Clear Log
                </TouchFeedback>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gestureLog.length === 0 ? (
                  <div className="text-gray-500 text-sm">
                    <p className="mb-2">No gestures detected yet. Try these interactions:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Swipe left/right on cards</li>
                      <li>Double tap anywhere</li>
                      <li>Long press (hold down)</li>
                      <li>Pull down to refresh</li>
                      <li>Pinch in/out on cards</li>
                      <li>Tap any touch feedback element</li>
                    </ul>
                  </div>
                ) : (
                  gestureLog.slice(-10).reverse().map((log, index) => (
                    <motion.div
                      key={`${log}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 border-l-2 border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>{log}</span>
                        <span className="text-xs text-gray-500">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </GestureHandler>
      </PullToRefresh>

      {/* Enhanced Bottom Navigation */}
      <BottomNavigation 
        activeTab={currentCard as any}
        onQuickActionsClick={() => {
          setShowDrawer(true);
          setGestureLog(prev => [...prev, 'Quick Actions opened']);
        }}
      />

      {/* Mobile Settings Drawer */}
      <MobileDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        sections={[
          {
            title: 'Demo Controls',
            items: [
              {
                id: 'refresh',
                label: 'Manual Refresh',
                description: 'Trigger refresh without pull gesture',
                icon: RefreshCw,
                onClick: () => {
                  handleRefresh();
                  setShowDrawer(false);
                  setGestureLog(prev => [...prev, 'Manual refresh triggered']);
                }
              },
              {
                id: 'clear-log',
                label: 'Clear Gesture Log',
                description: 'Reset the gesture activity log',
                icon: Zap,
                onClick: () => {
                  setGestureLog([]);
                  setShowDrawer(false);
                  setGestureLog(prev => [...prev, 'Gesture log cleared']);
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
}