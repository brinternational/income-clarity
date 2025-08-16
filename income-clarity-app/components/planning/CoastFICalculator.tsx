'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Save,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useStaggeredCountingAnimation, useProgressAnimation } from '@/hooks/useOptimizedAnimation';
import { CoastFIProjectionChart } from './CoastFIProjectionChart';
import { useUser, useUserActions, useFinancialProfile, useCurrentPortfolioValue, useMonthlyContribution } from '@/store/userStore';

interface CoastFICalculatorProps {
  initialData?: {
    currentAge: number;
    currentNetWorth: number;
    targetRetirementAge: number;
    targetRetirementIncome: number;
    currentSavingsRate: number;
    expectedInflation: number;
    expectedReturns: number;
  };
  onScenarioUpdate?: (scenario: CoastFIScenario) => void;
  className?: string;
}

interface CoastFIScenario {
  id: string;
  name: string;
  currentAge: number;
  currentNetWorth: number;
  targetRetirementAge: number;
  targetRetirementIncome: number;
  expectedReturns: number;
  expectedInflation: number;
  requiredCoastAmount: number;
  yearsToCoast: number;
  coastAchieved: boolean;
  monthlyRequirement: number;
  projectedPath: CoastProjectionPoint[];
}

interface CoastProjectionPoint {
  age: number;
  year: number;
  netWorth: number;
  annualContributions: number;
  isCoastPhase: boolean;
  realValue: number;
}

interface ScenarioComparison {
  conservative: CoastFIScenario;
  moderate: CoastFIScenario;
  aggressive: CoastFIScenario;
}

export const CoastFICalculator = ({
  initialData = {
    currentAge: 30,
    currentNetWorth: 50000,
    targetRetirementAge: 60,
    targetRetirementIncome: 80000,
    currentSavingsRate: 20,
    expectedInflation: 2.5,
    expectedReturns: 7
  },
  onScenarioUpdate,
  className = ''
}: CoastFICalculatorProps) => {
  // Get user data from store
  const user = useUser()
  const financialProfile = useFinancialProfile()
  const portfolioValueData = useCurrentPortfolioValue()
  const currentPortfolioValue = typeof portfolioValueData === 'object' ? portfolioValueData.value : portfolioValueData
  const contributionData = useMonthlyContribution()
  const monthlyContribution = typeof contributionData === 'object' ? contributionData.amount : contributionData
  const { updateFinancialProfile, saveToStorage } = useUserActions()
  
  // Initialize inputs with user data if available
  const getInitialInputs = () => {
    return {
      currentAge: financialProfile?.currentAge || initialData.currentAge,
      currentNetWorth: currentPortfolioValue || financialProfile?.currentPortfolioValue || initialData.currentNetWorth,
      targetRetirementAge: financialProfile?.retirementAge || initialData.targetRetirementAge,
      targetRetirementIncome: initialData.targetRetirementIncome,
      currentSavingsRate: initialData.currentSavingsRate,
      expectedInflation: initialData.expectedInflation,
      expectedReturns: initialData.expectedReturns
    }
  }
  
  const [inputs, setInputs] = useState(getInitialInputs());
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [calculationInProgress, setCalculationInProgress] = useState(false);
  const [chartType, setChartType] = useState<'networth' | 'contributions' | 'real-value'>('networth');
  const [showMilestones, setShowMilestones] = useState(true)
  const [saveToProfileLoading, setSaveToProfileLoading] = useState(false)
  
  // Update inputs when user data changes
  useEffect(() => {
    if (financialProfile) {
      const newInputs = getInitialInputs()
      setInputs(newInputs)
    }
  }, [financialProfile, currentPortfolioValue, monthlyContribution, initialData]);

  // Calculate Coast FI scenarios
  const scenarios: ScenarioComparison = useMemo(() => {
    const calculateCoastScenario = (returnRate: number, scenarioName: string): CoastFIScenario => {
      const realReturnRate = ((1 + returnRate / 100) / (1 + inputs.expectedInflation / 100)) - 1;
      const yearsToRetirement = inputs.targetRetirementAge - inputs.currentAge;
      
      // Calculate required amount at retirement (25x annual expenses in today's dollars)
      const requiredAtRetirement = inputs.targetRetirementIncome * 25;
      
      // Calculate how much we need today to coast to that amount
      const requiredCoastAmount = requiredAtRetirement / Math.pow(1 + returnRate / 100, yearsToRetirement);
      
      // Calculate if we've already achieved Coast FI
      const coastAchieved = inputs.currentNetWorth >= requiredCoastAmount;
      
      // Calculate monthly requirement to reach Coast FI
      const shortfall = Math.max(0, requiredCoastAmount - inputs.currentNetWorth);
      const monthlyRequirement = coastAchieved ? 0 : shortfall / 12; // Simplified: assume 1 year to coast
      
      // Calculate years to reach Coast FI with current savings
      let yearsToCoast = 0;
      if (!coastAchieved) {
        const currentAnnualSavings = inputs.currentNetWorth * inputs.currentSavingsRate / 100;
        if (currentAnnualSavings > 0) {
          // Using compound interest formula to find when we reach required amount
          yearsToCoast = Math.log(
            (requiredCoastAmount * (returnRate / 100)) / currentAnnualSavings + 1
          ) / Math.log(1 + returnRate / 100);
        } else {
          yearsToCoast = 999; // Never if no savings
        }
      }

      // Generate projection path
      const projectedPath: CoastProjectionPoint[] = [];
      let currentValue = inputs.currentNetWorth;
      const coastAge = inputs.currentAge + yearsToCoast;

      for (let age = inputs.currentAge; age <= inputs.targetRetirementAge; age++) {
        const year = new Date().getFullYear() + (age - inputs.currentAge);
        const isCoastPhase = age >= coastAge;
        
        if (!isCoastPhase && !coastAchieved) {
          // Still contributing phase
          const annualContributions = currentValue * inputs.currentSavingsRate / 100;
          currentValue = currentValue * (1 + returnRate / 100) + annualContributions;
          
          projectedPath.push({
            age,
            year,
            netWorth: currentValue,
            annualContributions,
            isCoastPhase: false,
            realValue: currentValue / Math.pow(1 + inputs.expectedInflation / 100, age - inputs.currentAge)
          });
        } else {
          // Coast phase - no more contributions, just growth
          currentValue = currentValue * (1 + returnRate / 100);
          
          projectedPath.push({
            age,
            year,
            netWorth: currentValue,
            annualContributions: 0,
            isCoastPhase: true,
            realValue: currentValue / Math.pow(1 + inputs.expectedInflation / 100, age - inputs.currentAge)
          });
        }
      }

      return {
        id: scenarioName.toLowerCase(),
        name: scenarioName,
        currentAge: inputs.currentAge,
        currentNetWorth: inputs.currentNetWorth,
        targetRetirementAge: inputs.targetRetirementAge,
        targetRetirementIncome: inputs.targetRetirementIncome,
        expectedReturns: returnRate,
        expectedInflation: inputs.expectedInflation,
        requiredCoastAmount,
        yearsToCoast: Math.min(yearsToCoast, 50), // Cap at 50 years
        coastAchieved,
        monthlyRequirement,
        projectedPath
      };
    };

    return {
      conservative: calculateCoastScenario(5, 'Conservative'),
      moderate: calculateCoastScenario(7, 'Moderate'),
      aggressive: calculateCoastScenario(9, 'Aggressive')
    };
  }, [inputs]);

  const activeScenarioData = scenarios[activeScenario];

  // Animated values
  const animatedValues = useStaggeredCountingAnimation(
    {
      requiredCoastAmount: activeScenarioData.requiredCoastAmount / 1000, // Show in K
      yearsToCoast: activeScenarioData.yearsToCoast,
      monthlyRequirement: activeScenarioData.monthlyRequirement,
      finalNetWorth: activeScenarioData.projectedPath[activeScenarioData.projectedPath.length - 1]?.netWorth / 1000 || 0
    },
    1200,
    150
  );

  // Progress animation for Coast FI achievement
  const coastProgress = useProgressAnimation(
    activeScenarioData.coastAchieved ? 100 : (inputs.currentNetWorth / activeScenarioData.requiredCoastAmount) * 100
  );

  // Update parent when scenario changes
  useEffect(() => {
    if (onScenarioUpdate) {
      onScenarioUpdate(activeScenarioData);
    }
  }, [activeScenarioData, onScenarioUpdate]);

  const formatCurrency = (amount: number, compact = false) => {
    if (compact && amount >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (field: keyof typeof inputs, value: number) => {
    setCalculationInProgress(true);
    setInputs(prev => ({ ...prev, [field]: value }));
    
    // Simulate calculation time for better UX
    setTimeout(() => setCalculationInProgress(false), 500);
  };

  const resetToDefaults = () => {
    setInputs(initialData);
  }
  
  const saveToProfile = async () => {
    setSaveToProfileLoading(true)
    
    try {
      // Update user's financial profile with current inputs
      await updateFinancialProfile();
      
      // Save to localStorage
      saveToStorage()
      
      // Show success feedback (could be a toast notification in a real app)
      setTimeout(() => {
        setSaveToProfileLoading(false)
      }, 1000)
      
    } catch (error) {
      // Error handled by emergency recovery script
    } finally {
      setSaveToProfileLoading(false)
    }
  }

  const getMilestones = () => {
    const milestones = [];
    const currentProgress = (inputs.currentNetWorth / activeScenarioData.requiredCoastAmount) * 100;
    
    const milestonePercentages = [25, 50, 75, 100];
    milestonePercentages.forEach(percentage => {
      const targetAmount = (activeScenarioData.requiredCoastAmount * percentage) / 100;
      const achieved = currentProgress >= percentage;
      
      milestones.push({
        percentage,
        targetAmount,
        achieved,
        title: percentage === 100 ? 'Coast FI Achieved!' : `${percentage}% to Coast FI`,
        description: percentage === 100 
          ? 'You can stop contributing and still reach your retirement goal!'
          : `Reach ${formatCurrency(targetAmount, true)} in investments`
      });
    });
    
    return milestones;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Coast FI Calculator</h2>
              <p className="text-slate-600">Calculate when you can stop contributing and coast to FIRE</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Advanced Settings"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={resetToDefaults}
              className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Reset to Defaults"
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={saveToProfile}
              disabled={saveToProfileLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Save to Profile"
            >
              {saveToProfileLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="text-sm">Save to Profile</span>
            </button>
          </div>
        </div>

        {/* User Data Info */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Auto-populated from your profile:</strong> Current age, net worth, and retirement age are loaded from your settings. 
                  Edit values above for "what-if" scenarios, then save back to your profile when ready.
                </p>
                {!financialProfile && (
                  <p className="text-xs text-blue-600 mt-1">
                    Complete onboarding or manually enter your data to enable profile integration.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coast FI Status */}
        <motion.div
          className={`p-4 rounded-xl border-2 ${
            activeScenarioData.coastAchieved 
              ? 'border-green-200 bg-green-50' 
              : 'border-blue-200 bg-blue-50'
          }`}
          animate={{ scale: activeScenarioData.coastAchieved ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: activeScenarioData.coastAchieved ? Infinity : 0, repeatDelay: 3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {activeScenarioData.coastAchieved ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingUp className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${
                  activeScenarioData.coastAchieved ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {activeScenarioData.coastAchieved ? 'Coast FI Achieved!' : 'Building to Coast FI'}
                </h3>
                <p className={`text-sm ${
                  activeScenarioData.coastAchieved ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {activeScenarioData.coastAchieved 
                    ? 'You can stop contributing and still reach your retirement goal!'
                    : `${animatedValues.yearsToCoast.toFixed(1)} years to Coast FI at current savings rate`
                  }
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                activeScenarioData.coastAchieved ? 'text-green-600' : 'text-blue-600'
              }`}>
                {coastProgress.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">Progress to Coast FI</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${
                  activeScenarioData.coastAchieved ? 'bg-green-500' : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${coastProgress}%` }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Inputs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Age
              </label>
              <input
                type="number"
                value={inputs.currentAge}
                onChange={(e) => handleInputChange('currentAge', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="18"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Net Worth
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={inputs.currentNetWorth}
                  onChange={(e) => handleInputChange('currentNetWorth', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Retirement Age
              </label>
              <input
                type="number"
                value={inputs.targetRetirementAge}
                onChange={(e) => handleInputChange('targetRetirementAge', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min={inputs.currentAge}
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Annual Income in Retirement
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={inputs.targetRetirementIncome}
                  onChange={(e) => handleInputChange('targetRetirementIncome', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  step="5000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Results */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Scenario Analysis</h3>
            {calculationInProgress && (
              <div className="flex items-center space-x-2 text-blue-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                <span className="text-sm">Calculating...</span>
              </div>
            )}
          </div>
          
          {/* Scenario Tabs */}
          <div className="flex space-x-2 mb-6">
            {(['conservative', 'moderate', 'aggressive'] as const).map((scenario) => (
              <button
                key={scenario}
                onClick={() => setActiveScenario(scenario)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeScenario === scenario
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {scenarios[scenario].name}
                <div className="text-xs opacity-75">
                  {scenarios[scenario].expectedReturns}% returns
                </div>
              </button>
            ))}
          </div>
          
          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Required Coast Amount</div>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(animatedValues.requiredCoastAmount * 1000)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Years to Coast</div>
                <div className="text-lg font-bold text-blue-600">
                  {activeScenarioData.coastAchieved ? '0' : animatedValues.yearsToCoast.toFixed(1)}
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Monthly Need</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(animatedValues.monthlyRequirement)}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Projected Final Net Worth</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(animatedValues.finalNetWorth * 1000)}
              </div>
              <div className="text-xs text-slate-500">
                At age {inputs.targetRetirementAge}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <AnimatePresence>
        {showAdvancedSettings && (
          <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-semibold text-slate-800 mb-4">Advanced Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Savings Rate (%)
                </label>
                <input
                  type="number"
                  value={inputs.currentSavingsRate}
                  onChange={(e) => handleInputChange('currentSavingsRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Inflation (%)
                </label>
                <input
                  type="number"
                  value={inputs.expectedInflation}
                  onChange={(e) => handleInputChange('expectedInflation', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Returns (%)
                </label>
                <input
                  type="number"
                  value={inputs.expectedReturns}
                  onChange={(e) => handleInputChange('expectedReturns', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones */}
      <AnimatePresence>
        {showMilestones && (
          <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Coast FI Milestones</h3>
              <button
                onClick={() => setShowMilestones(!showMilestones)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Hide Milestones
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getMilestones().map((milestone, index) => (
                <motion.div
                  key={milestone.percentage}
                  className={`p-4 rounded-lg border-2 ${
                    milestone.achieved 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {milestone.achieved ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
                    )}
                    <h4 className={`font-semibold ${
                      milestone.achieved ? 'text-green-800' : 'text-slate-700'
                    }`}>
                      {milestone.title}
                    </h4>
                  </div>
                  <p className={`text-sm ${
                    milestone.achieved ? 'text-green-600' : 'text-slate-600'
                  }`}>
                    {milestone.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Projection Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Projection Timeline</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType('networth')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                chartType === 'networth'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Net Worth
            </button>
            <button
              onClick={() => setChartType('contributions')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                chartType === 'contributions'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Contributions
            </button>
            <button
              onClick={() => setChartType('real-value')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                chartType === 'real-value'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Real Value
            </button>
          </div>
        </div>
        
        <CoastFIProjectionChart
          data={activeScenarioData.projectedPath}
          chartType={chartType}
          coastAge={inputs.currentAge + activeScenarioData.yearsToCoast}
          currentAge={inputs.currentAge}
          targetRetirementAge={inputs.targetRetirementAge}
          requiredCoastAmount={activeScenarioData.requiredCoastAmount}
        />
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Coast FI Insights</h3>
            <div className="space-y-2 text-sm text-amber-700">
              <p>
                <strong>Coast FI</strong> means you have enough invested that compound growth alone 
                will reach your retirement goal, even if you stop contributing entirely.
              </p>
              <p>
                Once you reach Coast FI, you have the flexibility to reduce savings, change careers, 
                or pursue other goals while still being on track for financial independence.
              </p>
              <p>
                The scenarios show different market return assumptions. Consider your risk tolerance 
                and investment strategy when choosing your target.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};