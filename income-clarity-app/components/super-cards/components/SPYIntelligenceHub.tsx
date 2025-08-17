'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Target, 
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useSPYIntelligence } from '@/hooks/useSPYIntelligence';
import { useSPYProjections } from '@/hooks/useSPYProjections';
import { SPYHistoricalTable } from './SPYHistoricalTable';
import { SPYProjectionGraph } from './SPYProjectionGraph';

interface SPYIntelligenceHubProps {
  portfolioReturn?: number;
  spyReturn?: number;
  outperformance?: number;
  className?: string;
}

type ViewMode = 'historical' | 'projections';

const SPYIntelligenceHubComponent = ({
  portfolioReturn = 0.082,
  spyReturn = 0.061,
  outperformance = 0.021,
  className = ''
}: SPYIntelligenceHubProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('historical');
  
  const {
    data: intelligenceData,
    isLoading: intelligenceLoading,
    error: intelligenceError,
    selectedPeriod: historicalPeriod,
    setSelectedPeriod: setHistoricalPeriod,
    refreshData: refreshIntelligence
  } = useSPYIntelligence(portfolioReturn, spyReturn);

  const {
    projections,
    isLoading: projectionsLoading,
    error: projectionsError,
    selectedPeriod: projectionPeriod,
    setSelectedPeriod: setProjectionPeriod,
    refreshProjections,
    getScenarioColor
  } = useSPYProjections(642.69); // Use current SPY price

  const isBeatingMarket = outperformance > 0;
  const hasError = intelligenceError || projectionsError;
  const isLoading = intelligenceLoading || projectionsLoading;

  const handleRefresh = async () => {
    await Promise.all([
      refreshIntelligence(),
      refreshProjections()
    ]);
  };

  if (hasError) {
    return (
      <div className={`bg-alert-50 border border-alert-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-alert-600 text-2xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-alert-800 mb-2">SPY Intelligence Unavailable</h3>
          <p className="text-alert-600 text-sm mb-4">
            {intelligenceError || projectionsError}
          </p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-alert-600 text-white rounded-lg hover:bg-alert-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Key Intelligence */}
      <div className="bg-gradient-to-br from-primary-50 via-primary-25 to-white rounded-xl p-6 border border-primary-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-2">
              SPY Intelligence Hub
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200">
              Comprehensive market analysis with forward-looking projections
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh SPY intelligence data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {/* Current Outperformance */}
          <div className={`text-center p-4 rounded-lg border-2 ${
            isBeatingMarket 
              ? 'bg-prosperity-50 border-prosperity-200' 
              : 'bg-alert-50 border-alert-200'
          }`}>
            <div className="flex items-center justify-center mb-2">
              {isBeatingMarket ? (
                <TrendingUp className="w-5 h-5 text-prosperity-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-alert-600" />
              )}
            </div>
            <div className={`text-xl font-bold mb-1 ${
              isBeatingMarket ? 'text-prosperity-800 dark:text-prosperity-600' : 'text-alert-800 dark:text-alert-600'
            }`}>
              {outperformance >= 0 ? '+' : ''}{(outperformance * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-600">Current Alpha</div>
          </div>

          {/* Trend Direction */}
          <div className="text-center p-4 bg-secondary-50 rounded-lg border-2 border-secondary-200">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-secondary-600" />
            </div>
            <div className="text-xl font-bold text-secondary-800 dark:text-secondary-600 mb-1">
              {intelligenceData?.trends?.direction === 'improving' ? '↗️' :
               intelligenceData?.trends?.direction === 'declining' ? '↘️' : '➡️'}
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-600">
              {intelligenceData?.trends?.direction ? 
                (intelligenceData.trends.direction.charAt(0).toUpperCase() + 
                 intelligenceData.trends.direction.slice(1)) : 
                'Loading...'}
            </div>
          </div>

          {/* Win Rate */}
          <div className="text-center p-4 bg-wealth-50 rounded-lg border-2 border-wealth-200">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-wealth-600" />
            </div>
            <div className="text-xl font-bold text-wealth-800 dark:text-wealth-600 mb-1">
              {intelligenceData?.historicalData ? 
                `${(intelligenceData.historicalData.find(d => d.period === '1Y')?.winRate * 100 || 50).toFixed(0)}%` : 
                'Loading...'
              }
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-600">Success Rate</div>
          </div>

          {/* Information Ratio */}
          <div className="text-center p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-xl font-bold text-primary-800 dark:text-primary-600 mb-1">
              {intelligenceData?.riskMetrics?.informationRatio?.toFixed(2) || 'Loading...'}
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-600">Info Ratio</div>
          </div>
        </div>

        {/* Intelligence Recommendations */}
        {intelligenceData?.recommendations && intelligenceData.recommendations.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center text-sm">
              <Zap className="w-4 h-4 text-primary-600 mr-2" />
              Intelligence Insights
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {intelligenceData.recommendations.slice(0, 2).map((rec, index) => (
                <motion.div
                  key={`spy-rec-${rec.type}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg text-sm ${
                    rec.type === 'outperforming' 
                      ? 'bg-prosperity-50 border border-prosperity-200' 
                      : rec.type === 'underperforming'
                      ? 'bg-alert-50 border border-alert-200'
                      : 'bg-primary-50 border border-primary-200'
                  }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{rec.title}</div>
                  <div className="text-slate-800 dark:text-slate-200 text-xs">{rec.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('historical')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'historical'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Historical Analysis</span>
            </div>
          </button>
          
          <button
            onClick={() => setViewMode('projections')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'projections'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Future Projections</span>
            </div>
          </button>
        </div>

        {/* Mobile navigation indicators */}
        <div className="flex items-center space-x-2 sm:hidden">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {viewMode === 'historical' ? 'Historical' : 'Projections'}
          </span>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Content Views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {viewMode === 'historical' && intelligenceData && (
            <SPYHistoricalTable
              data={intelligenceData.historicalData}
              selectedPeriod={historicalPeriod}
              onPeriodSelect={setHistoricalPeriod}
              isLoading={intelligenceLoading}
            />
          )}

          {viewMode === 'projections' && projections.length > 0 && (
            <SPYProjectionGraph
              projections={projections}
              selectedPeriod={projectionPeriod}
              onPeriodSelect={setProjectionPeriod}
              isLoading={projectionsLoading}
              getScenarioColor={getScenarioColor}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Loading States */}
      {isLoading && !intelligenceData && !projections.length && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-800 dark:text-slate-200 text-sm">Loading SPY intelligence data...</div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-center space-x-2">
          <Activity className="w-3 h-3" />
          <span>Real-time market intelligence • Updated continuously</span>
        </div>
      </div>
    </div>
  );
};

export const SPYIntelligenceHub = memo(SPYIntelligenceHubComponent);