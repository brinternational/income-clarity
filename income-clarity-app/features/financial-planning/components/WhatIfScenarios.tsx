'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Save,
  Upload,
  Download,
  Copy,
  Eye,
  EyeOff,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  MapPin,
  Target,
  DollarSign,
  Percent,
  Calendar,
  Brain,
  Shuffle,
  LineChart,
  TrendingDown as Risk,
  Building,
  Heart,
  Home,
  GraduationCap,
  Car,
  Plane
} from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { useUser, useUserGoals, useFinancialProfile, useCurrentAge, useCurrentPortfolioValue, useMonthlyContribution } from '@/store/userStore';
import { useSuperCardStore } from '@/store/superCardStore';

interface ScenarioInputs {
  // Core financial parameters
  dividendGrowthRate: number; // -10% to +10% annually
  dividendCutProbability: number; // 0-100%
  expenseInflation: number; // 0-10% annually
  majorExpenseEvents: ExpenseEvent[];
  portfolioReturnRate: number; // -20% to +20%
  marketVolatility: 'low' | 'medium' | 'high';
  rebalancingFrequency: 'monthly' | 'quarterly' | 'annually';
  
  // Location and tax parameters
  location: string; // US state or territory
  taxStrategy: 'standard' | 'optimized' | 'aggressive';
  
  // Contribution parameters
  monthlyContribution: number;
  contributionGrowthRate: number; // Annual increase
  
  // Time parameters
  timeHorizon: number; // Years to model
  retirementAge: number;

  // Legacy parameters (keeping for compatibility)
  incomeChange: number;
  expensesChange: number;
  savingsRateChange: number;
  investmentReturns: number;
  inflationRate: number;
  emergencyFundMonths: number;
  
  // Life events
  careerChange: {
    enabled: boolean;
    incomeChange: number;
    timeToTransition: number;
    transitionCosts: number;
  };
  majorPurchase: {
    enabled: boolean;
    amount: number;
    timeframe: number;
    fundingSource: 'savings' | 'loan' | 'mixed';
    description: string;
  };
  marketCrash: {
    enabled: boolean;
    severity: number;
    recoveryTime: number;
    yearOfCrash: number;
  };
  locationChange: {
    enabled: boolean;
    newLocation: string;
    movingCosts: number;
    timeframe: number;
  };
}

interface ScenarioResults {
  projectedNetWorth: number[];
  projectedIncome: number[];
  expenseCoverage: number[];
  fireDate: string | null;
  totalTaxes: number;
  riskScore: number;
  confidenceLevel: number;
  
  // Legacy results (keeping for compatibility)
  finalNetWorth: number;
  fireAge: number;
  monthlyIncomeAtFire: number;
  totalSaved: number;
  emergencyFundValue: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  keyInsights: string[];
  yearlyBreakdown: YearlyProjection[];
  comparisonToBase: {
    netWorthDifference: number;
    fireAgeChange: number;
    monthlyIncomeChange: number;
  };
  
  // Monte Carlo results
  monteCarloResults?: {
    percentile25: number;
    percentile50: number;
    percentile75: number;
    successRate: number;
    confidenceIntervals: {
      low: number[];
      high: number[];
    };
  };
  
  // AI insights
  aiInsights?: {
    type: 'optimization' | 'risk' | 'opportunity' | 'warning';
    title: string;
    message: string;
    impact: number; // Dollar impact
    confidence: number; // 0-100%
    actionable: boolean;
  }[];
}

interface YearlyProjection {
  year: number;
  age: number;
  grossIncome: number;
  netIncome: number;
  expenses: number;
  savings: number;
  netWorth: number;
  emergencyFund: number;
  investmentValue: number;
  realPurchasingPower: number;
  dividendIncome: number;
  taxesPaid: number;
  expenseCoverage: number;
}

interface ExpenseEvent {
  year: number;
  amount: number;
  description: string;
  recurring: boolean;
}

interface WhatIfScenariosProps {
  baselineData?: {
    currentAge: number;
    currentIncome: number;
    currentExpenses: number;
    currentNetWorth: number;
    currentSavingsRate: number;
  };
  onScenarioSave?: (scenario: ScenarioInputs, results: ScenarioResults) => void;
  className?: string;
}

const defaultBaseline = {
  currentAge: 30,
  currentIncome: 80000,
  currentExpenses: 48000,
  currentNetWorth: 50000,
  currentSavingsRate: 25
};

// US states with their tax profiles for location optimization
const US_STATES = [
  { name: 'Alabama', taxRate: 0.05, qualified: 0.0 },
  { name: 'Alaska', taxRate: 0.0, qualified: 0.0 },
  { name: 'Arizona', taxRate: 0.045, qualified: 0.0 },
  { name: 'Arkansas', taxRate: 0.066, qualified: 0.0 },
  { name: 'California', taxRate: 0.133, qualified: 0.133 },
  { name: 'Colorado', taxRate: 0.0455, qualified: 0.0 },
  { name: 'Connecticut', taxRate: 0.0699, qualified: 0.0699 },
  { name: 'Delaware', taxRate: 0.066, qualified: 0.0 },
  { name: 'Florida', taxRate: 0.0, qualified: 0.0 },
  { name: 'Georgia', taxRate: 0.0575, qualified: 0.0 },
  { name: 'Hawaii', taxRate: 0.11, qualified: 0.0725 },
  { name: 'Idaho', taxRate: 0.0605, qualified: 0.0 },
  { name: 'Illinois', taxRate: 0.0495, qualified: 0.0 },
  { name: 'Indiana', taxRate: 0.0323, qualified: 0.0 },
  { name: 'Iowa', taxRate: 0.0853, qualified: 0.0 },
  { name: 'Kansas', taxRate: 0.057, qualified: 0.0 },
  { name: 'Kentucky', taxRate: 0.05, qualified: 0.0 },
  { name: 'Louisiana', taxRate: 0.0425, qualified: 0.0 },
  { name: 'Maine', taxRate: 0.0715, qualified: 0.0 },
  { name: 'Maryland', taxRate: 0.0575, qualified: 0.0 },
  { name: 'Massachusetts', taxRate: 0.05, qualified: 0.0 },
  { name: 'Michigan', taxRate: 0.0425, qualified: 0.0 },
  { name: 'Minnesota', taxRate: 0.0985, qualified: 0.0 },
  { name: 'Mississippi', taxRate: 0.05, qualified: 0.0 },
  { name: 'Missouri', taxRate: 0.054, qualified: 0.0 },
  { name: 'Montana', taxRate: 0.0675, qualified: 0.0 },
  { name: 'Nebraska', taxRate: 0.0684, qualified: 0.0 },
  { name: 'Nevada', taxRate: 0.0, qualified: 0.0 },
  { name: 'New Hampshire', taxRate: 0.0, qualified: 0.0 },
  { name: 'New Jersey', taxRate: 0.1075, qualified: 0.0 },
  { name: 'New Mexico', taxRate: 0.059, qualified: 0.0 },
  { name: 'New York', taxRate: 0.1090, qualified: 0.0 },
  { name: 'North Carolina', taxRate: 0.0475, qualified: 0.0 },
  { name: 'North Dakota', taxRate: 0.0295, qualified: 0.0 },
  { name: 'Ohio', taxRate: 0.0399, qualified: 0.0 },
  { name: 'Oklahoma', taxRate: 0.05, qualified: 0.0 },
  { name: 'Oregon', taxRate: 0.0999, qualified: 0.0 },
  { name: 'Pennsylvania', taxRate: 0.0307, qualified: 0.0 },
  { name: 'Puerto Rico', taxRate: 0.0, qualified: 0.0 }, // Act 60 advantage
  { name: 'Rhode Island', taxRate: 0.0599, qualified: 0.0 },
  { name: 'South Carolina', taxRate: 0.07, qualified: 0.0 },
  { name: 'South Dakota', taxRate: 0.0, qualified: 0.0 },
  { name: 'Tennessee', taxRate: 0.0, qualified: 0.0 },
  { name: 'Texas', taxRate: 0.0, qualified: 0.0 },
  { name: 'Utah', taxRate: 0.0495, qualified: 0.0 },
  { name: 'Vermont', taxRate: 0.066, qualified: 0.0 },
  { name: 'Virginia', taxRate: 0.0575, qualified: 0.0 },
  { name: 'Washington', taxRate: 0.0, qualified: 0.0 },
  { name: 'West Virginia', taxRate: 0.065, qualified: 0.0 },
  { name: 'Wisconsin', taxRate: 0.0765, qualified: 0.0 },
  { name: 'Wyoming', taxRate: 0.0, qualified: 0.0 },
];

const defaultScenario: ScenarioInputs = {
  // New Income Clarity specific parameters
  dividendGrowthRate: 5, // 5% annual growth
  dividendCutProbability: 15, // 15% chance of cuts
  expenseInflation: 3, // 3% annual inflation
  majorExpenseEvents: [],
  portfolioReturnRate: 7, // 7% annual returns
  marketVolatility: 'medium' as 'low' | 'medium' | 'high',
  rebalancingFrequency: 'quarterly',
  location: 'California',
  taxStrategy: 'standard' as 'standard' | 'optimized' | 'aggressive',
  monthlyContribution: 500,
  contributionGrowthRate: 3, // 3% annual increase
  timeHorizon: 30,
  retirementAge: 60,
  
  // Legacy parameters
  incomeChange: 0,
  expensesChange: 0,
  savingsRateChange: 0,
  investmentReturns: 7,
  inflationRate: 2.5,
  emergencyFundMonths: 6,
  
  careerChange: {
    enabled: false,
    incomeChange: -20,
    timeToTransition: 2,
    transitionCosts: 15000
  },
  majorPurchase: {
    enabled: false,
    amount: 80000,
    timeframe: 3,
    fundingSource: 'savings' as 'savings' | 'loan' | 'mixed',
    description: 'House down payment'
  },
  marketCrash: {
    enabled: false,
    severity: -30,
    recoveryTime: 3,
    yearOfCrash: 5
  },
  locationChange: {
    enabled: false,
    newLocation: 'Puerto Rico',
    movingCosts: 25000,
    timeframe: 2
  }
};

const predefinedScenarios = [
  {
    name: 'Conservative Retiree',
    description: 'Low risk, stable dividend income focus',
    category: 'risk',
    inputs: {
      ...defaultScenario,
      dividendGrowthRate: 3,
      dividendCutProbability: 5,
      portfolioReturnRate: 5,
      marketVolatility: 'low' as 'low' | 'medium' | 'high',
      monthlyContribution: 800
    }
  },
  {
    name: 'Aggressive FIRE',
    description: 'High savings, high growth strategy',
    category: 'fire',
    inputs: {
      ...defaultScenario,
      dividendGrowthRate: 8,
      portfolioReturnRate: 9,
      monthlyContribution: 2500,
      contributionGrowthRate: 5,
      marketVolatility: 'high' as 'low' | 'medium' | 'high',
      retirementAge: 45
    }
  },
  {
    name: 'Market Crash Recovery',
    description: '30% market drop with continued investing',
    category: 'market',
    inputs: {
      ...defaultScenario,
      marketCrash: {
        enabled: true,
        severity: -30,
        recoveryTime: 3,
        yearOfCrash: 3
      },
      monthlyContribution: 750 // Continue investing during crash
    }
  },
  {
    name: 'Puerto Rico Tax Haven',
    description: 'Optimize taxes with Puerto Rico move',
    category: 'location',
    inputs: {
      ...defaultScenario,
      locationChange: {
        enabled: true,
        newLocation: 'Puerto Rico',
        movingCosts: 35000,
        timeframe: 2
      },
      location: 'Puerto Rico',
      taxStrategy: 'optimized' as 'standard' | 'optimized' | 'aggressive'
    }
  },
  {
    name: 'Coast FI Path',
    description: 'Stop contributing at 40, coast to FIRE',
    category: 'fire',
    inputs: {
      ...defaultScenario,
      monthlyContribution: 1200,
      contributionGrowthRate: 0,
      // Stop contributions after 10 years (at age 40)
      careerChange: {
        enabled: true,
        incomeChange: 0,
        timeToTransition: 10,
        transitionCosts: 0
      }
    }
  },
  {
    name: 'Barista FIRE',
    description: 'Part-time work supplement strategy',
    category: 'fire',
    inputs: {
      ...defaultScenario,
      careerChange: {
        enabled: true,
        incomeChange: -60, // Part-time income
        timeToTransition: 15,
        transitionCosts: 5000
      },
      retirementAge: 55,
      dividendGrowthRate: 6
    }
  },
  {
    name: 'High Inflation Period',
    description: 'Extended 6% inflation scenario',
    category: 'economic',
    inputs: {
      ...defaultScenario,
      expenseInflation: 6,
      portfolioReturnRate: 5, // Lower real returns
      dividendGrowthRate: 4,
      contributionGrowthRate: 4 // Wages keep up partially
    }
  },
  {
    name: 'Major Life Purchase',
    description: 'House purchase with higher expenses',
    category: 'life',
    inputs: {
      ...defaultScenario,
      majorPurchase: {
        enabled: true,
        amount: 150000,
        timeframe: 3,
        fundingSource: 'savings' as 'savings' | 'loan' | 'mixed',
        description: 'Dream home down payment'
      },
      expenseInflation: 4, // Higher housing costs
      monthlyContribution: 400 // Reduced savings initially
    }
  }
];

export const WhatIfScenarios = ({
  baselineData = defaultBaseline,
  onScenarioSave,
  className = ''
}: WhatIfScenariosProps) => {
  // Get user data from stores
  const user = useUser();
  const userGoals = useUserGoals();
  const financialProfile = useFinancialProfile();
  const currentAge = useCurrentAge();
  const portfolioValueData = useCurrentPortfolioValue();
  const currentPortfolioValue = typeof portfolioValueData === 'object' ? portfolioValueData.value : portfolioValueData;
  const contributionData = useMonthlyContribution();
  const monthlyContribution = typeof contributionData === 'object' ? contributionData.amount : contributionData;
  
  // Component state
  const [currentScenario, setCurrentScenario] = useState<ScenarioInputs>(() => ({
    ...defaultScenario,
    location: user?.location || 'California',
    monthlyContribution: monthlyContribution ? (typeof monthlyContribution === 'object' ? (monthlyContribution as any).amount : monthlyContribution) : 500,
    timeHorizon: Math.max(1, (financialProfile?.retirementAge || 60) - (currentAge || 30))
  }));
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults | null>(null);
  const [baselineResults, setBaselineResults] = useState<ScenarioResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<ScenarioResults[]>([]);
  const [monteCarloRuns, setMonteCarloRuns] = useState(1000);
  const [showMonteCarloSettings, setShowMonteCarloSettings] = useState(false);
  const [chartView, setChartView] = useState<'networth' | 'income' | 'coverage'>('networth');
  const [savedScenarios, setSavedScenarios] = useState<Array<{
    name: string;
    inputs: ScenarioInputs;
    results: ScenarioResults;
    createdAt: Date;
  }>>([]);
  
  // Update baseline data from user profile
  const actualBaselineData = useMemo(() => ({
    currentAge: currentAge || baselineData.currentAge,
    currentIncome: (monthlyContribution || 500) * 12 * 4, // Estimate from contribution
    currentExpenses: userGoals?.monthlyExpenses || baselineData.currentExpenses,
    currentNetWorth: currentPortfolioValue || baselineData.currentNetWorth,
    currentSavingsRate: baselineData.currentSavingsRate
  }), [currentAge, monthlyContribution, userGoals, currentPortfolioValue]);

  // Monte Carlo simulation for probabilistic analysis
  const runMonteCarloSimulation = useCallback((inputs: ScenarioInputs, runs: number = 1000) => {
    const results: number[] = [];
    
    for (let run = 0; run < runs; run++) {
      // Add randomness to key variables
      const randomInputs = {
        ...inputs,
        portfolioReturnRate: inputs.portfolioReturnRate + (Math.random() - 0.5) * 4, // ±2%
        dividendGrowthRate: inputs.dividendGrowthRate + (Math.random() - 0.5) * 2, // ±1%
        expenseInflation: inputs.expenseInflation + (Math.random() - 0.5) * 2, // ±1%
      };
      
      // Apply volatility multiplier
      const volatilityMultiplier = inputs.marketVolatility === 'high' ? 1.5 : inputs.marketVolatility === 'low' ? 0.5 : 1.0;
      randomInputs.portfolioReturnRate *= volatilityMultiplier;
      
      const result = calculateScenario(randomInputs, true);
      results.push(result.finalNetWorth);
    }
    
    results.sort((a, b) => a - b);
    
    return {
      percentile25: results[Math.floor(runs * 0.25)],
      percentile50: results[Math.floor(runs * 0.50)],
      percentile75: results[Math.floor(runs * 0.75)],
      successRate: results.filter(r => r >= userGoals?.stressFreeLiving * 25 || 1000000).length / runs * 100,
      confidenceIntervals: {
        low: results.slice(0, Math.floor(runs * 0.1)),
        high: results.slice(Math.floor(runs * 0.9))
      }
    };
  }, [userGoals]);
  
  // Generate AI-powered insights
  const generateAIInsights = useCallback((results: ScenarioResults, inputs: ScenarioInputs) => {
    const insights: ScenarioResults['aiInsights'] = [];
    
    // Location optimization insight
    if (inputs.location === 'California' && results.totalTaxes > 50000) {
      const prSavings = results.totalTaxes * 0.7; // Estimate 70% tax savings
      insights.push({
        type: 'optimization',
        title: 'Puerto Rico Tax Opportunity',
        message: `Moving to Puerto Rico could save approximately $${Math.round(prSavings).toLocaleString()} in taxes over ${inputs.timeHorizon} years`,
        impact: prSavings,
        confidence: 85,
        actionable: true
      });
    }
    
    // Contribution increase insight
    if (inputs.monthlyContribution < 1000 && results.fireAge > 60) {
      const additionalContribution = 200;
      const timeReduction = Math.max(1, (results.fireAge - 60) * 0.3);
      insights.push({
        type: 'opportunity',
        title: 'Accelerate FIRE Timeline',
        message: `Increasing monthly contributions by $${additionalContribution} could reduce FIRE timeline by ${timeReduction.toFixed(1)} years`,
        impact: additionalContribution * 12 * timeReduction,
        confidence: 92,
        actionable: true
      });
    }
    
    // Market crash resilience
    if (inputs.marketCrash.enabled && results.riskScore < 0.3) {
      insights.push({
        type: 'risk',
        title: 'Market Crash Resilience',
        message: 'Your continued investing during market downturns actually improves long-term outcomes through dollar-cost averaging',
        impact: 0,
        confidence: 88,
        actionable: false
      });
    }
    
    // Dividend cut risk
    if (inputs.dividendCutProbability > 25) {
      insights.push({
        type: 'warning',
        title: 'Diversification Recommended',
        message: 'High dividend cut probability suggests need for broader diversification beyond dividend-focused investments',
        impact: -results.finalNetWorth * 0.15,
        confidence: 76,
        actionable: true
      });
    }
    
    return insights.slice(0, 4); // Limit to 4 most important insights
  }, []);
  
  // Calculate scenario results with enhanced Income Clarity logic
  const calculateScenario = (inputs: ScenarioInputs, isBaseline = false) => {
    const startingIncome = actualBaselineData.currentIncome;
    const startingExpenses = actualBaselineData.currentExpenses;
    const startingNetWorth = actualBaselineData.currentNetWorth;
    const startingSavingsRate = actualBaselineData.currentSavingsRate;
    
    // Get tax rates for the selected location
    const locationTaxInfo = US_STATES.find(state => state.name === inputs.location) || 
                           US_STATES.find(state => state.name === 'California')!;
    
    // Enhanced tax calculation based on location
    const calculateTaxes = (dividendIncome: number, capitalGains: number) => {
      const federalDividendTax = dividendIncome * 0.15; // Federal qualified dividend rate
      const stateDividendTax = dividendIncome * locationTaxInfo.qualified;
      const federalCapitalGainsTax = capitalGains * 0.15;
      const stateCapitalGainsTax = capitalGains * locationTaxInfo.taxRate;
      
      return federalDividendTax + stateDividendTax + federalCapitalGainsTax + stateCapitalGainsTax;
    };
    
    let currentIncome = startingIncome * (1 + inputs.incomeChange / 100);
    let currentExpenses = startingExpenses * (1 + inputs.expensesChange / 100);
    let currentSavingsRate = Math.max(0, startingSavingsRate + inputs.savingsRateChange);
    let netWorth = startingNetWorth;
    
    const yearlyBreakdown: YearlyProjection[] = [];
    const emergencyFundTarget = currentExpenses * inputs.emergencyFundMonths / 12;
    let emergencyFund = Math.min(startingNetWorth * 0.3, emergencyFundTarget); // Assume 30% of net worth is emergency fund initially
    let investmentValue = netWorth - emergencyFund;
    
    let fireAchieved = false;
    let fireAge = baselineData.currentAge + inputs.timeHorizon;
    
    for (let year = 0; year < inputs.timeHorizon; year++) {
      const currentAge = baselineData.currentAge + year;
      
      // Apply annual inflation
      currentIncome *= (1 + inputs.inflationRate / 100);
      currentExpenses *= (1 + inputs.inflationRate / 100);
      
      // Apply career change
      if (inputs.careerChange.enabled && year === inputs.careerChange.timeToTransition) {
        currentIncome *= (1 + inputs.careerChange.incomeChange / 100);
        netWorth -= inputs.careerChange.transitionCosts;
        investmentValue -= inputs.careerChange.transitionCosts;
      }
      
      // Calculate savings
      // Calculate dividend income based on portfolio value
      const dividendYield = 0.04 + (inputs.dividendGrowthRate / 100) * 0.1; // Base 4% + growth adjustment
      const dividendIncome = investmentValue * dividendYield;
      
      // Apply dividend cuts if probability triggers
      const dividendCutChance = Math.random() * 100;
      const actualDividendIncome = dividendCutChance < inputs.dividendCutProbability 
        ? dividendIncome * 0.7 // 30% cut
        : dividendIncome;
      
      const grossIncome = currentIncome + actualDividendIncome;
      
      // Enhanced tax calculation
      const capitalGains = year > 0 ? investmentValue * 0.02 : 0; // Assume 2% realized gains
      const totalTaxes = calculateTaxes(actualDividendIncome, capitalGains);
      const netIncome = grossIncome - totalTaxes;
      
      const actualExpenses = currentExpenses;
      const maxPossibleSavings = netIncome - actualExpenses;
      const targetSavings = inputs.monthlyContribution * 12;
      const actualSavings = Math.min(maxPossibleSavings, Math.max(0, targetSavings));
      
      // Calculate expense coverage percentage
      const expenseCoveragePercent = (actualDividendIncome / (actualExpenses * 12)) * 100;
      
      // Handle location change
      if (inputs.locationChange.enabled && year === inputs.locationChange.timeframe) {
        netWorth -= inputs.locationChange.movingCosts;
        investmentValue -= inputs.locationChange.movingCosts;
        // Location tax benefits start immediately after move
      }
      
      // Handle major purchase
      let purchaseImpact = 0;
      if (inputs.majorPurchase.enabled && year === inputs.majorPurchase.timeframe) {
        purchaseImpact = inputs.majorPurchase.amount;
        if (inputs.majorPurchase.fundingSource === 'savings') {
          investmentValue -= purchaseImpact;
        }
      }
      
      // Handle major expense events
      inputs.majorExpenseEvents.forEach(event => {
        if (event.year === year) {
          if (event.recurring || year === event.year) {
            currentExpenses += event.amount;
          }
        }
      });
      
      // Update emergency fund
      const emergencyFundShortfall = Math.max(0, emergencyFundTarget - emergencyFund);
      const emergencyFundContribution = Math.min(actualSavings * 0.1, emergencyFundShortfall);
      emergencyFund += emergencyFundContribution;
      
      // Investment contributions and growth
      const investmentContribution = actualSavings - emergencyFundContribution;
      investmentValue += investmentContribution;
      
      // Apply market crash
      if (inputs.marketCrash.enabled && year === inputs.marketCrash.yearOfCrash) {
        investmentValue *= (1 + inputs.marketCrash.severity / 100);
      }
      
      // Apply investment returns (except crash year)
      if (!inputs.marketCrash.enabled || year !== inputs.marketCrash.yearOfCrash) {
        const returnMultiplier = inputs.marketCrash.enabled && 
          year > inputs.marketCrash.yearOfCrash && 
          year <= inputs.marketCrash.yearOfCrash + inputs.marketCrash.recoveryTime
          ? 1 + (inputs.investmentReturns + 2) / 100 // Higher returns during recovery
          : 1 + inputs.investmentReturns / 100;
        
        investmentValue *= returnMultiplier;
        emergencyFund *= 1.02; // Conservative growth for emergency fund
      }
      
      netWorth = investmentValue + emergencyFund;
      
      // Check for FIRE achievement (25x annual expenses)
      const fireTarget = actualExpenses * 25;
      if (!fireAchieved && netWorth >= fireTarget) {
        fireAchieved = true;
        fireAge = currentAge;
      }
      
      const realPurchasingPower = netWorth / Math.pow(1 + inputs.inflationRate / 100, year);
      
      yearlyBreakdown.push({
        year,
        age: currentAge,
        grossIncome,
        netIncome,
        expenses: actualExpenses,
        savings: actualSavings,
        netWorth,
        emergencyFund,
        investmentValue,
        realPurchasingPower,
        dividendIncome: actualDividendIncome,
        taxesPaid: totalTaxes,
        expenseCoverage: expenseCoveragePercent
      });
    }
    
    const finalProjection = yearlyBreakdown[yearlyBreakdown.length - 1];
    const finalNetWorth = finalProjection.netWorth;
    const monthlyIncomeAtFire = (finalNetWorth * 0.04) / 12; // 4% rule
    const totalSaved = yearlyBreakdown.reduce((sum, year) => sum + year.savings, 0);
    const totalTaxesPaid = yearlyBreakdown.reduce((sum, year) => sum + year.taxesPaid, 0);
    
    // Create enhanced results structure
    const projectedNetWorth = yearlyBreakdown.map(y => y.netWorth);
    const projectedIncome = yearlyBreakdown.map(y => y.dividendIncome);
    const expenseCoverage = yearlyBreakdown.map(y => y.expenseCoverage);
    
    // Calculate confidence level based on various factors
    let confidenceLevel = 70; // Base confidence
    if (inputs.marketVolatility === 'low') confidenceLevel += 15;
    if (inputs.marketVolatility === 'high') confidenceLevel -= 10;
    if (inputs.dividendCutProbability < 10) confidenceLevel += 10;
    if (inputs.taxStrategy === 'optimized') confidenceLevel += 5;
    confidenceLevel = Math.min(95, Math.max(50, confidenceLevel));
    
    // Calculate risk level
    let riskLevel: ScenarioResults['riskLevel'] = 'low';
    if (inputs.marketCrash.enabled || inputs.careerChange.enabled) riskLevel = 'medium';
    if (inputs.marketCrash.enabled && inputs.careerChange.enabled) riskLevel = 'high';
    if (inputs.majorPurchase.enabled && inputs.majorPurchase.amount > finalNetWorth * 0.5) riskLevel = 'extreme';
    
    // Generate insights
    const keyInsights: string[] = [];
    
    if (fireAchieved) {
      keyInsights.push(`You could achieve FIRE by age ${fireAge}`);
    } else {
      keyInsights.push(`FIRE not achieved within ${inputs.timeHorizon} years`);
    }
    
    if (inputs.careerChange.enabled) {
      const incomeImpact = (inputs.careerChange.incomeChange / 100) * startingIncome;
      keyInsights.push(`Career change reduces annual income by ${Math.abs(incomeImpact).toLocaleString()}`);
    }
    
    if (inputs.marketCrash.enabled) {
      keyInsights.push(`Market crash could reduce portfolio by ${Math.abs(inputs.marketCrash.severity)}%`);
    }
    
    if (inputs.majorPurchase.enabled) {
      const paybackTime = inputs.majorPurchase.amount / (finalProjection.savings || 1);
      keyInsights.push(`Major purchase payback time: ${paybackTime.toFixed(1)} years`);
    }
    
    const results: ScenarioResults = {
      // New Income Clarity results
      projectedNetWorth,
      projectedIncome,
      expenseCoverage,
      fireDate: fireAchieved ? new Date(Date.now() + (fireAge - actualBaselineData.currentAge) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      totalTaxes: totalTaxesPaid,
      riskScore: inputs.marketVolatility === 'high' ? 0.8 : inputs.marketVolatility === 'low' ? 0.2 : 0.5,
      confidenceLevel,
      
      // Legacy results (for compatibility)
      finalNetWorth,
      fireAge,
      monthlyIncomeAtFire,
      totalSaved,
      emergencyFundValue: finalProjection.emergencyFund,
      riskLevel,
      keyInsights,
      yearlyBreakdown,
      comparisonToBase: {
        netWorthDifference: 0,
        fireAgeChange: 0,
        monthlyIncomeChange: 0
      }
    };
    
    // Add AI insights if not baseline calculation
    if (!isBaseline) {
      results.aiInsights = generateAIInsights(results, inputs);
    }
    
    return results;
  };

  // Calculate baseline on mount
  useEffect(() => {
    const baseline = calculateScenario({
      ...defaultScenario,
      location: user?.location || 'California',
      monthlyContribution: monthlyContribution || 500
    }, true);
    setBaselineResults(baseline);
  }, [actualBaselineData, user, monthlyContribution]);

  // Calculate current scenario with Monte Carlo if enabled
  useEffect(() => {
    setIsCalculating(true);
    
    const timer = setTimeout(() => {
      const results = calculateScenario(currentScenario);
      
      // Add Monte Carlo results
      if (monteCarloRuns > 0) {
        results.monteCarloResults = runMonteCarloSimulation(currentScenario, monteCarloRuns);
      }
      
      if (baselineResults) {
        results.comparisonToBase = {
          netWorthDifference: results.finalNetWorth - baselineResults.finalNetWorth,
          fireAgeChange: results.fireAge - baselineResults.fireAge,
          monthlyIncomeChange: results.monthlyIncomeAtFire - baselineResults.monthlyIncomeAtFire
        };
      }
      
      setScenarioResults(results);
      setIsCalculating(false);
    }, 800); // Longer delay for more complex calculations

    return () => clearTimeout(timer);
  }, [currentScenario, baselineResults, monteCarloRuns, runMonteCarloSimulation]);

  // Animated values
  const animatedResults = useStaggeredCountingAnimation(
    scenarioResults ? {
      finalNetWorth: scenarioResults.finalNetWorth / 1000,
      fireAge: scenarioResults.fireAge,
      monthlyIncome: scenarioResults.monthlyIncomeAtFire,
      totalSaved: scenarioResults.totalSaved / 1000,
      netWorthDiff: Math.abs(scenarioResults.comparisonToBase.netWorthDifference) / 1000
    } : {},
    1200,
    100
  );

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

  const getRiskColor = (riskLevel: ScenarioResults['riskLevel']) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'extreme': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const loadPredefinedScenario = (scenarioName: string) => {
    const scenario = predefinedScenarios.find(s => s.name === scenarioName);
    if (scenario) {
      setCurrentScenario(scenario.inputs);
      setSelectedPredefined(scenarioName);
    }
  };

  const saveCurrentScenario = () => {
    if (scenarioResults) {
      const name = `Scenario ${savedScenarios.length + 1}`;
      const newSavedScenario = {
        name,
        inputs: currentScenario,
        results: scenarioResults,
        createdAt: new Date()
      };
      
      setSavedScenarios(prev => [...prev, newSavedScenario]);
      
      if (onScenarioSave) {
        onScenarioSave(currentScenario, scenarioResults);
      }
    }
  };

  const resetToBaseline = () => {
    setCurrentScenario(defaultScenario);
    setSelectedPredefined(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">What-If Scenarios</h2>
              <p className="text-slate-600">Model different life changes and market conditions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCalculating && (
              <motion.div
                className="flex items-center space-x-2 text-blue-600"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Calculator className="w-5 h-5" />
                <span className="text-sm">Calculating...</span>
              </motion.div>
            )}
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`p-2 rounded-lg border transition-colors ${
                showComparison 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Show Comparison"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={saveCurrentScenario}
              className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Save Scenario"
              disabled={!scenarioResults}
            >
              <Save className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Predefined Scenarios */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Scenarios:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetToBaseline}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedPredefined === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Baseline
            </button>
            {predefinedScenarios.map(scenario => (
              <button
                key={scenario.name}
                onClick={() => loadPredefinedScenario(scenario.name)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedPredefined === scenario.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
                title={scenario.description}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {scenarioResults && (
          <div className={`p-4 rounded-xl border-2 ${getRiskColor(scenarioResults.riskLevel)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Risk Level: {scenarioResults.riskLevel.toUpperCase()}</span>
              </div>
              {showComparison && baselineResults && (
                <div className="text-sm">
                  vs Baseline: {formatCurrency(scenarioResults.comparisonToBase.netWorthDifference, true)} 
                  {scenarioResults.comparisonToBase.netWorthDifference >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600 inline ml-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 inline ml-1" />
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold mb-1">
                  {formatCurrency(animatedResults.finalNetWorth * 1000, true)}
                </div>
                <div className="text-xs opacity-75">Final Net Worth</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold mb-1">
                  {Math.round(animatedResults.fireAge)}
                </div>
                <div className="text-xs opacity-75">FIRE Age</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold mb-1">
                  {formatCurrency(animatedResults.monthlyIncome, true)}
                </div>
                <div className="text-xs opacity-75">Monthly Income</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold mb-1">
                  {formatCurrency(animatedResults.totalSaved * 1000, true)}
                </div>
                <div className="text-xs opacity-75">Total Saved</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Inputs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Basic Adjustments</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Income Change (%)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentScenario(prev => ({
                    ...prev,
                    incomeChange: Math.max(-50, prev.incomeChange - 5)
                  }))}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  value={currentScenario.incomeChange}
                  onChange={(e) => setCurrentScenario(prev => ({
                    ...prev,
                    incomeChange: parseInt(e.target.value)
                  }))}
                  className="flex-1"
                />
                <button
                  onClick={() => setCurrentScenario(prev => ({
                    ...prev,
                    incomeChange: Math.min(100, prev.incomeChange + 5)
                  }))}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="w-12 text-right text-sm font-medium">
                  {currentScenario.incomeChange}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expenses Change (%)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentScenario(prev => ({
                    ...prev,
                    expensesChange: Math.max(-50, prev.expensesChange - 5)
                  }))}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  value={currentScenario.expensesChange}
                  onChange={(e) => setCurrentScenario(prev => ({
                    ...prev,
                    expensesChange: parseInt(e.target.value)
                  }))}
                  className="flex-1"
                />
                <button
                  onClick={() => setCurrentScenario(prev => ({
                    ...prev,
                    expensesChange: Math.min(100, prev.expensesChange + 5)
                  }))}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="w-12 text-right text-sm font-medium">
                  {currentScenario.expensesChange}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Savings Rate Change (%)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentScenario(prev => ({
                    ...prev,
                    savingsRateChange: Math.max(-25, prev.savingsRateChange - 5)
                  }))}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="-25"
                  max="50"
                  value={currentScenario.savingsRateChange}
                  onChange={(e) => setCurrentScenario(prev => ({
                    ...prev,
                    savingsRateChange: parseInt(e.target.value)
                  }))}
                  className="flex-1"
                />
                <button
                  onClick={() => setCurrentScenario(prev => ({
                    ...prev,
                    savingsRateChange: Math.min(50, prev.savingsRateChange + 5)
                  }))}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="w-12 text-right text-sm font-medium">
                  {currentScenario.savingsRateChange}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Investment Returns (%)
                </label>
                <input
                  type="number"
                  value={currentScenario.investmentReturns}
                  onChange={(e) => setCurrentScenario(prev => ({
                    ...prev,
                    investmentReturns: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Inflation Rate (%)
                </label>
                <input
                  type="number"
                  value={currentScenario.inflationRate}
                  onChange={(e) => setCurrentScenario(prev => ({
                    ...prev,
                    inflationRate: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Life Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Life Events</h3>
          <div className="space-y-6">
            {/* Career Change */}
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-700">Career Change</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentScenario.careerChange.enabled}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      careerChange: {
                        ...prev.careerChange,
                        enabled: e.target.checked
                      }
                    }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    currentScenario.careerChange.enabled ? 'bg-primary-600' : 'bg-slate-300'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-1 ${
                      currentScenario.careerChange.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
              
              {currentScenario.careerChange.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Income Change (%)
                    </label>
                    <input
                      type="number"
                      value={currentScenario.careerChange.incomeChange}
                      onChange={(e) => setCurrentScenario(prev => ({
                        ...prev,
                        careerChange: {
                          ...prev.careerChange,
                          incomeChange: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      min="-75"
                      max="100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Years to Transition
                      </label>
                      <input
                        type="number"
                        value={currentScenario.careerChange.timeToTransition}
                        onChange={(e) => setCurrentScenario(prev => ({
                          ...prev,
                          careerChange: {
                            ...prev.careerChange,
                            timeToTransition: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                        min="0"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Transition Costs
                      </label>
                      <input
                        type="number"
                        value={currentScenario.careerChange.transitionCosts}
                        onChange={(e) => setCurrentScenario(prev => ({
                          ...prev,
                          careerChange: {
                            ...prev.careerChange,
                            transitionCosts: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Major Purchase */}
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-700">Major Purchase</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentScenario.majorPurchase.enabled}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      majorPurchase: {
                        ...prev.majorPurchase,
                        enabled: e.target.checked
                      }
                    }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    currentScenario.majorPurchase.enabled ? 'bg-primary-600' : 'bg-slate-300'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-1 ${
                      currentScenario.majorPurchase.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
              
              {currentScenario.majorPurchase.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={currentScenario.majorPurchase.amount}
                      onChange={(e) => setCurrentScenario(prev => ({
                        ...prev,
                        majorPurchase: {
                          ...prev.majorPurchase,
                          amount: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      min="0"
                      step="5000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Years from Now
                      </label>
                      <input
                        type="number"
                        value={currentScenario.majorPurchase.timeframe}
                        onChange={(e) => setCurrentScenario(prev => ({
                          ...prev,
                          majorPurchase: {
                            ...prev.majorPurchase,
                            timeframe: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                        min="0"
                        max="20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Funding Source
                      </label>
                      <select
                        value={currentScenario.majorPurchase.fundingSource}
                        onChange={(e) => setCurrentScenario(prev => ({
                          ...prev,
                          majorPurchase: {
                            ...prev.majorPurchase,
                            fundingSource: e.target.value as 'savings' | 'loan' | 'mixed'
                          }
                        }))}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      >
                        <option value="savings">Savings</option>
                        <option value="loan">Loan</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Market Crash */}
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-700">Market Crash</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentScenario.marketCrash.enabled}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      marketCrash: {
                        ...prev.marketCrash,
                        enabled: e.target.checked
                      }
                    }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    currentScenario.marketCrash.enabled ? 'bg-primary-600' : 'bg-slate-300'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-1 ${
                      currentScenario.marketCrash.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
              
              {currentScenario.marketCrash.enabled && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Severity (%)
                    </label>
                    <input
                      type="number"
                      value={currentScenario.marketCrash.severity}
                      onChange={(e) => setCurrentScenario(prev => ({
                        ...prev,
                        marketCrash: {
                          ...prev.marketCrash,
                          severity: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      min="-75"
                      max="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Recovery Time
                    </label>
                    <input
                      type="number"
                      value={currentScenario.marketCrash.recoveryTime}
                      onChange={(e) => setCurrentScenario(prev => ({
                        ...prev,
                        marketCrash: {
                          ...prev.marketCrash,
                          recoveryTime: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Year of Crash
                    </label>
                    <input
                      type="number"
                      value={currentScenario.marketCrash.yearOfCrash}
                      onChange={(e) => setCurrentScenario(prev => ({
                        ...prev,
                        marketCrash: {
                          ...prev.marketCrash,
                          yearOfCrash: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      min="0"
                      max="20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {scenarioResults && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarioResults.keyInsights.map((insight, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">{insight}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Scenario Projection</h3>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg">
              Net Worth
            </button>
            <button className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-lg">
              Income vs Expenses
            </button>
            <button className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-lg">
              Savings Rate
            </button>
          </div>
        </div>
        
        {/* Chart placeholder */}
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h4 className="font-semibold text-slate-600 mb-2">Interactive Projection Chart</h4>
            <p className="text-sm text-slate-500">
              Visualize how your scenario plays out over {currentScenario.timeHorizon} years
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-slate-500">Scenario</span>
              </div>
              {showComparison && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-slate-500">Baseline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Saved Scenarios</h3>
          <div className="space-y-3">
            {savedScenarios.map((scenario, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-700">{scenario.name}</h4>
                  <p className="text-xs text-slate-500">
                    Created {scenario.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(scenario.results.finalNetWorth, true)}
                  </span>
                  <button
                    onClick={() => setCurrentScenario(scenario.inputs)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};