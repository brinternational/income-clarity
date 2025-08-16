'use client';

import { useState, useEffect, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Zap, Award, Target, BarChart3, Activity, Calendar,
  Download, PieChart, ToggleLeft, ToggleRight, Info, ArrowDown, Layers, Eye
} from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import ShareButton from '@/components/shared/ShareButton';
import { generateShareContent } from '@/utils/shareContent';
import { exportElementAsImage } from '@/utils/exportUtils';

type TimePeriod = '1M' | '3M' | '6M' | '1Y';

interface TimePeriodData {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
  maxDrawdown?: number;
  volatility?: number;
}

interface SectorWeighting {
  sector: string;
  portfolioWeight: number;
  spyWeight: number;
  difference: number;
  color: string;
}

interface EnhancedSPYComparisonProps {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
  maxDrawdown?: number;
  volatility?: number;
  sectorWeightings?: SectorWeighting[];
  timePeriodData?: {
    [key in TimePeriod]: TimePeriodData;
  };
}

// Generate mock sector weightings if not provided
const generateMockSectorWeightings = (): SectorWeighting[] => [
  { sector: 'Technology', portfolioWeight: 35, spyWeight: 28, difference: 7, color: '#3b82f6' },
  { sector: 'Financial', portfolioWeight: 20, spyWeight: 13, difference: 7, color: '#059669' },
  { sector: 'Healthcare', portfolioWeight: 15, spyWeight: 13, difference: 2, color: '#dc2626' },
  { sector: 'Consumer Disc.', portfolioWeight: 10, spyWeight: 11, difference: -1, color: '#7c3aed' },
  { sector: 'Communication', portfolioWeight: 8, spyWeight: 8, difference: 0, color: '#ea580c' },
  { sector: 'Real Estate', portfolioWeight: 6, spyWeight: 3, difference: 3, color: '#0891b2' },
  { sector: 'Energy', portfolioWeight: 3, spyWeight: 4, difference: -1, color: '#65a30d' },
  { sector: 'Other', portfolioWeight: 3, spyWeight: 20, difference: -17, color: '#6b7280' }
];

const EnhancedSPYComparisonComponent = ({ 
  portfolioReturn, 
  spyReturn, 
  outperformance, 
  maxDrawdown = -8.5,
  volatility = 12.3,
  sectorWeightings,
  timePeriodData 
}: EnhancedSPYComparisonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');
  const [showSectorWeighting, setShowSectorWeighting] = useState(false);
  const [showTooltip, setShowTooltip] = useState<{ show: boolean; content: string; x: number; y: number }>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });
  const cardRef = useRef<HTMLDivElement>(null);
  
  const sectors = sectorWeightings || generateMockSectorWeightings();
  
  // Get current period data
  const getCurrentPeriodData = (): TimePeriodData => {
    if (timePeriodData && selectedPeriod !== '1Y') {
      return timePeriodData[selectedPeriod];
    }
    return { 
      portfolioReturn, 
      spyReturn, 
      outperformance, 
      maxDrawdown,
      volatility 
    };
  };

  const currentData = getCurrentPeriodData();
  const isBeating = currentData.outperformance > 0;
  const performanceLevel = Math.abs(currentData.outperformance);
  const isSignificantOutperformance = performanceLevel > 0.05;

  // Export functionality
  const handleExport = async (format: 'png' | 'svg') => {
    if (cardRef.current) {
      if (format === 'png') {
        await exportElementAsImage(cardRef.current, {
          filename: 'spy-comparison-chart',
          format: 'png',
          scale: 2
        });
      } else {
        // For SVG, try to find chart SVG element
        const svgElement = cardRef.current.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'spy-comparison-chart.svg';
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }
    }
  };

  // Tooltip handlers
  const handleMouseEnter = (event: React.MouseEvent, content: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({
      show: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setShowTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  // Use optimized animation system
  const animatedValues = useStaggeredCountingAnimation(
    {
      portfolio: currentData.portfolioReturn * 100,
      spy: currentData.spyReturn * 100,
      outperformance: currentData.outperformance * 100,
      maxDrawdown: Math.abs(currentData.maxDrawdown || maxDrawdown),
      volatility: currentData.volatility || volatility,
    },
    1200,
    200
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Generate chart data
  const chartBars = {
    portfolioHeight: Math.abs(animatedValues.portfolio) * 2.5 + 10,
    spyHeight: Math.abs(animatedValues.spy) * 2.5 + 10,
  };

  // Time period labels
  const periodLabels = {
    '1M': { label: '1M', description: '1 Month' },
    '3M': { label: '3M', description: '3 Months' },
    '6M': { label: '6M', description: '6 Months' },
    '1Y': { label: '1Y', description: 'Year-to-Date' }
  };

  return (
    <motion.div 
      ref={cardRef}
      className="premium-card hover-lift animate-on-mount p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced Header with Export and Sector Toggle */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800">
              Enhanced Portfolio Performance
            </h3>
            
            {/* Performance Badge */}
            <motion.div 
              className={`px-3 py-1 rounded-full flex items-center space-x-2 ${
                isBeating 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200'
                  : 'bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isBeating ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <Target className="w-4 h-4 text-orange-600" />
              )}
              <span className={`text-sm font-semibold ${isBeating ? 'text-green-700' : 'text-orange-700'}`}>
                {isBeating ? 'Outperforming' : 'Tracking'}
              </span>
            </motion.div>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500">
            Your strategy vs SPY benchmark with enhanced analytics
          </p>
        </div>
        
        {/* Control Panel */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Sector Weighting Toggle */}
          <motion.button
            onClick={() => setShowSectorWeighting(!showSectorWeighting)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            whileTap={{ scale: 0.95 }}
            title="Toggle sector weighting view"
          >
            {showSectorWeighting ? <ToggleRight className="w-4 h-4 text-primary-600" /> : <ToggleLeft className="w-4 h-4" />}
            <PieChart className="w-4 h-4" />
          </motion.button>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-primary-600">
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 py-2 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleExport('png')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export as PNG
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export as SVG
              </button>
            </div>
          </div>
          
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
            isBeating 
              ? 'bg-gradient-to-br from-prosperity-50 to-prosperity-100' 
              : 'bg-gradient-to-br from-wealth-50 to-wealth-100'
          }`}>
            {isBeating ? (
              <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-prosperity-600" />
            ) : (
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-wealth-600" />
            )}
          </div>
        </div>
      </div>

      {/* Max Drawdown Indicator */}
      <motion.div 
        className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ArrowDown className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Max Drawdown</h4>
            <div 
              className="cursor-help"
              onMouseEnter={(e) => handleMouseEnter(e, 'Maximum peak-to-trough decline during the period')}
              onMouseLeave={handleMouseLeave}
            >
              <Info className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <button
            onClick={() => setShowTooltip(prev => ({ ...prev, show: false }))}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <Eye className="w-4 h-4 text-red-600" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-red-900">
              -{animatedValues.maxDrawdown.toFixed(1)}%
            </div>
            <div className="text-sm text-red-700">
              Peak-to-trough decline
            </div>
          </div>
          
          {/* Risk comparison bar */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-600">vs SPY: -12.4%</div>
              <div className="text-xs text-green-600 font-medium">
                {animatedValues.maxDrawdown < 12.4 ? 'Lower Risk' : 'Higher Risk'}
              </div>
            </div>
            <div className="w-24 bg-slate-200 rounded-full h-2">
              <motion.div 
                className="bg-red-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((animatedValues.maxDrawdown / 15) * 100, 100)}%` }}
                transition={{ delay: 0.6 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sector Weighting Analysis */}
      <AnimatePresence>
        {showSectorWeighting && (
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Sector Weighting Comparison</h4>
            </div>
            
            <div className="space-y-3">
              {sectors.slice(0, 6).map((sector, index) => (
                <motion.div
                  key={sector.sector}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: sector.color }}
                    />
                    <span className="font-medium text-slate-800">{sector.sector}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-800">
                        {sector.portfolioWeight}% / {sector.spyWeight}%
                      </div>
                      <div className={`text-xs font-medium ${
                        sector.difference > 0 ? 'text-green-600' : 
                        sector.difference < 0 ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {sector.difference > 0 ? '+' : ''}{sector.difference}% vs SPY
                      </div>
                    </div>
                    
                    {/* Visual difference indicator */}
                    <div className="w-16 bg-slate-200 rounded-full h-2 relative">
                      <div 
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 h-2 rounded-full ${
                          sector.difference > 0 ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.abs(sector.difference) * 2, 32)}px`,
                          left: sector.difference > 0 ? '50%' : `${50 - Math.abs(sector.difference) * 2}%`
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Period Selector */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Time Period</span>
          </div>
        </div>
        
        <div className="flex bg-slate-50 rounded-lg p-1 gap-1 touch-friendly">
          {(['1M', '3M', '6M', '1Y'] as TimePeriod[]).map((period) => (
            <motion.button
              key={period}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              onClick={() => setSelectedPeriod(period)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <div className="font-semibold">{periodLabels[period].label}</div>
                <div className={`text-xs ${
                  selectedPeriod === period ? 'text-primary-100' : 'text-slate-500'
                }`}>
                  {period === '1Y' ? 'YTD' : periodLabels[period].description.split(' ')[0]}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Enhanced Performance Metrics with Interactive Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div 
          className="relative p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all duration-300 cursor-pointer"
          onMouseEnter={(e) => handleMouseEnter(e, `Portfolio performance for ${periodLabels[selectedPeriod].description.toLowerCase()}`)}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm" />
              <span className="text-sm sm:text-base font-medium text-slate-700">Your Strategy</span>
            </div>
            <div className="p-1 sm:p-1.5 bg-primary-50 rounded-lg">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <motion.div 
              className="currency-display font-bold text-xl sm:text-2xl text-primary-600 animate-currency"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              {animatedValues.portfolio >= 0 ? '+' : ''}{animatedValues.portfolio.toFixed(1)}%
            </motion.div>
            <div className="flex items-center space-x-1">
              {currentData.portfolioReturn >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-prosperity-600" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-alert-600" />
              )}
            </div>
          </div>
          
          <div className="mt-2 sm:mt-3 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              {periodLabels[selectedPeriod].description} performance
            </div>
            <div className="text-xs text-slate-400">
              σ: {animatedValues.volatility.toFixed(1)}%
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="relative p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-100 hover:border-wealth-200 hover:shadow-sm transition-all duration-300 cursor-pointer"
          onMouseEnter={(e) => handleMouseEnter(e, `S&P 500 benchmark performance for ${periodLabels[selectedPeriod].description.toLowerCase()}`)}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-wealth-500 to-wealth-600 rounded-full shadow-sm" />
              <span className="text-sm sm:text-base font-medium text-slate-700">SPY Benchmark</span>
            </div>
            <div className="p-1 sm:p-1.5 bg-wealth-50 rounded-lg">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-wealth-600" />
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <motion.div 
              className="currency-display font-bold text-xl sm:text-2xl text-wealth-600 animate-currency"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              {animatedValues.spy >= 0 ? '+' : ''}{animatedValues.spy.toFixed(1)}%
            </motion.div>
            <div className="flex items-center space-x-1">
              {currentData.spyReturn >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-prosperity-600" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-alert-600" />
              )}
            </div>
          </div>
          
          <div className="mt-2 sm:mt-3 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              S&P 500 market performance
            </div>
            <div className="text-xs text-slate-400">
              σ: 16.2%
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Enhanced Performance Comparison Visualization with Animations */}
      <div className="mb-6 sm:mb-8" id="performance-chart">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h4 className="text-sm sm:text-base font-display font-semibold text-slate-800">Performance Comparison</h4>
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live Data</span>
          </div>
        </div>
        
        <div className="relative h-24 sm:h-32 bg-gradient-to-b from-slate-50 to-slate-25 rounded-lg sm:rounded-xl border border-slate-100 p-3 sm:p-4 overflow-hidden">
          {/* Enhanced background grid */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i} 
                className="absolute w-full border-t border-slate-200" 
                style={{ top: `${i * 25}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
          
          {/* Enhanced performance bars */}
          <div className="relative h-full flex items-end justify-center space-x-4 sm:space-x-8">
            <motion.div 
              className="flex flex-col items-center space-y-1 sm:space-y-2"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-xs font-medium text-slate-600 text-center leading-tight">Your Portfolio</div>
              <motion.div 
                className="w-12 sm:w-16 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg shadow-sm relative overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(chartBars.portfolioHeight, 10)}%` }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <motion.div 
                className="text-xs font-bold text-primary-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {animatedValues.portfolio.toFixed(1)}%
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center space-y-1 sm:space-y-2"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-xs font-medium text-slate-600 text-center leading-tight">SPY Benchmark</div>
              <motion.div 
                className="w-12 sm:w-16 bg-gradient-to-t from-wealth-500 to-wealth-400 rounded-t-lg shadow-sm relative overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(chartBars.spyHeight, 10)}%` }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <motion.div 
                className="text-xs font-bold text-wealth-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                {animatedValues.spy.toFixed(1)}%
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Performance Status */}
      <motion.div 
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
          isBeating 
            ? 'bg-gradient-to-br from-prosperity-50 via-prosperity-25 to-white border-2 border-prosperity-200' 
            : 'bg-gradient-to-br from-wealth-50 via-wealth-25 to-white border-2 border-wealth-200'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="absolute inset-0 opacity-5"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" />
        </motion.div>
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
              <motion.div 
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                  isBeating 
                    ? 'bg-prosperity-100 text-prosperity-700' 
                    : 'bg-wealth-100 text-wealth-700'
                }`}
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                {isBeating ? (
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.div>
              <div>
                <h4 className="font-display font-semibold text-base sm:text-lg text-slate-800">
                  {isBeating ? 'Outperforming Market' : 'Market Alignment Opportunity'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  {isBeating 
                    ? 'Your strategy is generating alpha' 
                    : 'Room for strategy optimization'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <motion.div 
                className={`currency-display font-bold text-2xl sm:text-3xl animate-currency ${
                  isBeating 
                    ? 'text-gradient-prosperity' 
                    : 'text-gradient-wealth'
                }`}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              >
                {isBeating ? '+' : ''}{animatedValues.outperformance.toFixed(1)}%
              </motion.div>
              <div className={`text-xs sm:text-sm font-medium mt-1 ${
                isBeating ? 'text-prosperity-600' : 'text-wealth-600'
              }`}>
                vs SPY Benchmark
              </div>
            </div>
          </div>
          
          {/* Enhanced status details */}
          <motion.div 
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              isBeating 
                ? 'bg-prosperity-100/50 border border-prosperity-200' 
                : 'bg-wealth-100/50 border border-wealth-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <motion.div 
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  isBeating ? 'bg-prosperity-500' : 'bg-wealth-500'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={`text-sm font-medium ${
                isBeating ? 'text-prosperity-700' : 'text-wealth-700'
              }`}>
                {isBeating 
                  ? `Beating market by ${Math.abs(currentData.outperformance * 100).toFixed(1)}%` 
                  : `Tracking ${Math.abs(currentData.outperformance * 100).toFixed(1)}% behind market`
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2 justify-center sm:justify-end">
              {isBeating && isSignificantOutperformance && (
                <motion.div 
                  className="text-xs font-bold text-prosperity-600 bg-prosperity-50 px-2 sm:px-3 py-1 rounded-full border border-prosperity-200"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆 Significant Alpha
                </motion.div>
              )}
              <ShareButton
                shareType="spy-performance"
                shareData={generateShareContent('spy-performance', { 
                  portfolioData: { 
                    portfolioReturn: currentData.portfolioReturn, 
                    spyReturn: currentData.spyReturn, 
                    outperformance: currentData.outperformance 
                  }
                })}
                variant="ghost"
                size="sm"
                className={isBeating ? 'text-prosperity-600 hover:text-prosperity-700 hover:bg-prosperity-50' : 'text-wealth-600 hover:text-wealth-700 hover:bg-wealth-50'}
              />
              <div className="text-xs font-medium text-slate-600 bg-slate-50 px-2 sm:px-3 py-1 rounded-full">
                Updated: Now
              </div>
            </div>
          </motion.div>
          
          {/* Enhanced performance insights with animations */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Risk-Adjusted', value: isBeating ? 'Optimal' : 'Reviewing', good: isBeating },
              { label: 'Volatility', value: animatedValues.volatility < 16 ? 'Lower' : 'Higher', good: animatedValues.volatility < 16 },
              { label: 'Strategy Health', value: isBeating ? 'Strong' : 'Stable', good: isBeating }
            ].map((insight, index) => (
              <motion.div 
                key={insight.label}
                className="text-center p-2 sm:p-3 bg-white/50 rounded-lg border border-slate-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xs text-slate-500 font-medium mb-1">{insight.label}</div>
                <div className={`text-xs sm:text-sm font-semibold ${
                  insight.good ? 'text-prosperity-600' : 'text-slate-800'
                }`}>
                  {insight.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Optimization suggestions with enhanced animations */}
      {!isBeating && (
        <motion.div 
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-primary-50 rounded-lg sm:rounded-xl border border-slate-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <div className="flex items-start space-x-3">
            <motion.div 
              className="p-2 bg-primary-100 rounded-lg flex-shrink-0"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm sm:text-base font-semibold text-slate-800 mb-1">Strategy Optimization Opportunity</h5>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Consider reviewing your portfolio allocation to capture additional market gains. 
                Small adjustments could help close the {Math.abs(currentData.outperformance * 100).toFixed(1)}% gap.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Interactive Tooltip */}
      <AnimatePresence>
        {showTooltip.show && (
          <motion.div
            className="fixed z-50 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg pointer-events-none"
            style={{
              left: showTooltip.x,
              top: showTooltip.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {showTooltip.content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const EnhancedSPYComparison = memo(EnhancedSPYComparisonComponent, (prevProps, nextProps) => {
  return (
    prevProps.portfolioReturn === nextProps.portfolioReturn &&
    prevProps.spyReturn === nextProps.spyReturn &&
    prevProps.outperformance === nextProps.outperformance &&
    prevProps.maxDrawdown === nextProps.maxDrawdown &&
    prevProps.volatility === nextProps.volatility
  );
});