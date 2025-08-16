// Super Cards Store - Zustand store for managing Super Cards state
import { create } from 'zustand';

// Base interfaces
interface SuperCardData {
  id: string;
  type: 'income' | 'performance' | 'portfolio' | 'tax' | 'financial';
  data: any;
  lastUpdated: Date;
}

// Store state interface
interface SuperCardState {
  // Global state
  loading: boolean;
  error: string | null;
  activeCard: string | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  
  // Income Hub data
  incomeClarityData: any;
  monthlyDividendIncome: number;
  monthlyIncome: number;
  expenseMilestones: any[];
  availableToReinvest: number;
  totalExpenseCoverage: number;
  dividendSchedule: any[];
  
  // Performance Hub data
  performanceData: any;
  spyComparison: any;
  holdings: any[];
  portfolioValue: number;
  timePeriodData: any;
  spyOutperformance: number;
  
  // Portfolio Hub data
  portfolioData: any;
  
  // Tax Hub data
  taxData: any;
  taxSettings: any;
  taxProjections: any;
  currentTaxBill: number;
  
  // Planning Hub data
  planningData: any;
  milestones: any[];
  achievements: any[];
  fireData: any;
  aboveZeroData: any;
  fireProgress: any;
  monthlyInvestment: number;
  netWorth: number;
  aboveZeroStreak: number;
  currentSavingsRate: number;
  isAboveZero: boolean;
  
  // Backup state for optimistic updates
  backupState?: Partial<SuperCardState>;
  
  // Additional state properties
  strategyHealth?: any;
  estimatedQuarterly?: any;
  rebalancingSuggestions?: any;
  chartData?: any;
  performance?: any;
  marginIntelligence?: any;
  taxOptimizationSavings?: any;
  performanceHub?: any;
  incomeHub?: any;
  income?: any;
  portfolioMetrics?: any;
  taxDragAnalysis?: any;
  riskAnalysis?: any;
  withholdingTaxes?: any;
}

// Store actions interface
interface SuperCardActions {
  // Global actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveCard: (card: string | null) => void;
  refreshCard: (card: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Income actions
  updateData: (data: Partial<SuperCardState>) => void;
  
  // Performance actions
  updatePerformanceData: (data: any) => void;
  
  // Portfolio actions
  updatePortfolioData: (data: any) => void;
  
  // Tax actions
  updateTaxData: (data: any) => void;
  
  // Planning actions
  addMilestone: (milestone: any) => void;
  completeMilestone: (id: string) => void;
  celebrate: (type?: string) => void;
  
  // Global fetch methods
  fetchIncomeHub: () => Promise<any>;
  fetchPerformanceHub: () => Promise<any>;
  fetchPortfolioHub: () => Promise<any>;
  fetchTaxHub: () => Promise<any>;
  fetchPlanningHub: () => Promise<any>;
  
  // Optimistic update methods
  optimisticUpdate: (data: Partial<SuperCardState>) => void;
  rollback: () => void;
  commitUpdate: () => void;
}

// Combined store interface
interface SuperCardStore extends SuperCardState, SuperCardActions {}

// Create Zustand store
const useSuperCardStore = create<SuperCardStore>((set, get) => ({
  // Initial state
  loading: false,
  error: null,
  activeCard: null,
  lastUpdated: null,
  isLoading: false,
  incomeClarityData: null,
  monthlyDividendIncome: 0,
  monthlyIncome: 0,
  expenseMilestones: [],
  availableToReinvest: 0,
  totalExpenseCoverage: 0,
  dividendSchedule: [],
  performanceData: null,
  spyComparison: null,
  holdings: [],
  portfolioValue: 0,
  timePeriodData: null,
  spyOutperformance: 0,
  portfolioData: null,
  taxData: null,
  taxSettings: null,
  taxProjections: null,
  currentTaxBill: 0,
  planningData: null,
  milestones: [],
  achievements: [],
  fireData: null,
  aboveZeroData: null,
  fireProgress: null,
  monthlyInvestment: 0,
  netWorth: 0,
  aboveZeroStreak: 0,
  currentSavingsRate: 0,
  isAboveZero: false,

  // Actions
  setLoading: (loading) => set({ loading, isLoading: loading }),
  setError: (error) => set({ error }),
  setActiveCard: (card) => set({ activeCard: card }),
  refreshCard: async (card) => {
    set({ loading: true, isLoading: true });
    // Simulate refresh - in real app would fetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ loading: false, isLoading: false, lastUpdated: new Date() });
  },
  refreshAll: async () => {
    set({ loading: true, isLoading: true });
    // Simulate refresh all - in real app would fetch all data
    await new Promise(resolve => setTimeout(resolve, 2000));
    set({ loading: false, isLoading: false, lastUpdated: new Date() });
  },
  updateData: (data) => set({ ...data }),
  updatePerformanceData: (data) => set({ 
    performanceData: data,
    spyComparison: data.spyComparison,
    holdings: data.holdings,
    portfolioValue: data.portfolioValue,
    timePeriodData: data.timePeriodData,
    spyOutperformance: data.spyOutperformance
  }),
  updatePortfolioData: (data) => set({ portfolioData: data }),
  updateTaxData: (data) => set({ 
    taxData: data,
    taxSettings: data.taxSettings,
    taxProjections: data.taxProjections
  }),
  addMilestone: (milestone) => set((state) => ({ 
    milestones: [...state.milestones, milestone] 
  })),
  completeMilestone: (id) => set((state) => ({
    milestones: state.milestones.map(m => 
      m.id === id ? { ...m, completed: true } : m
    )
  })),
  celebrate: (type) => {
    console.log(`🎉 Celebrating: ${type || 'achievement'}!`);
  },
  
  // Global fetch methods - mock implementations
  fetchIncomeHub: async () => {
    const mockData = {
      monthlyIncome: 4500,
      monthlyDividendIncome: 380,
      incomeClarityData: { grossMonthly: 4500, netMonthly: 3200 },
      expenseMilestones: [],
      availableToReinvest: 800
    };
    return mockData;
  },
  
  fetchPerformanceHub: async () => {
    const mockData = {
      performanceData: { totalReturn: 0.12 },
      spyComparison: { outperformance: 0.03 },
      holdings: []
    };
    return mockData;
  },
  
  fetchPortfolioHub: async () => {
    const mockData = {
      portfolioData: { value: 125000, allocation: {} },
      holdings: []
    };
    return mockData;
  },
  
  fetchTaxHub: async () => {
    const mockData = {
      taxData: { currentBill: 12000 },
      taxSettings: { state: 'CA' },
      taxProjections: { nextYear: 13000 }
    };
    return mockData;
  },
  
  fetchPlanningHub: async () => {
    const mockData = {
      fireProgress: 23.5,
      milestones: [],
      aboveZeroStreak: 8
    };
    return mockData;
  },
  
  // Optimistic update methods
  optimisticUpdate: (data) => {
    const currentState = get();
    set({ backupState: currentState, ...data });
  },
  
  rollback: () => {
    const currentState = get();
    if (currentState.backupState) {
      set({ ...currentState.backupState, backupState: undefined });
    }
  },
  
  commitUpdate: () => {
    set({ backupState: undefined });
  }
}));

// Hook exports for different hubs
export const useIncomeHub = () => {
  const store = useSuperCardStore();
  return {
    incomeClarityData: store.incomeClarityData,
    loading: store.loading,
    expenseMilestones: store.expenseMilestones,
    monthlyDividendIncome: store.monthlyDividendIncome,
    monthlyIncome: store.monthlyIncome,
    availableToReinvest: store.availableToReinvest,
    totalExpenseCoverage: store.totalExpenseCoverage,
    dividendSchedule: store.dividendSchedule,
    fireData: store.fireData,
    aboveZeroData: store.aboveZeroData,
    error: store.error,
    isAboveZero: store.isAboveZero
  };
};

export const useIncomeActions = () => {
  const store = useSuperCardStore();
  return {
    updateData: store.updateData,
    setLoading: store.setLoading,
    setError: store.setError
  };
};

export const usePerformanceHub = () => {
  const store = useSuperCardStore();
  return {
    performanceData: store.performanceData,
    spyComparison: store.spyComparison,
    holdings: store.holdings,
    portfolioValue: store.portfolioValue,
    timePeriodData: store.timePeriodData,
    spyOutperformance: store.spyOutperformance,
    loading: store.loading,
    error: store.error,
    chartData: store.chartData
  };
};

export const usePerformanceActions = () => {
  const store = useSuperCardStore();
  return {
    updateData: store.updateData,
    updatePerformanceData: store.updatePerformanceData,
    setLoading: store.setLoading,
    setError: store.setError
  };
};


export const useTaxHub = () => {
  const store = useSuperCardStore();
  return {
    taxData: store.taxData,
    taxSettings: store.taxSettings,
    taxProjections: store.taxProjections,
    loading: store.loading,
    error: store.error
  };
};

export const useTaxActions = () => {
  const store = useSuperCardStore();
  return {
    updateTaxData: store.updateTaxData,
    updateData: store.updateData,
    setLoading: store.setLoading,
    setError: store.setError
  };
};

export const usePlanningHub = () => {
  const store = useSuperCardStore();
  return {
    milestones: store.milestones,
    achievements: store.achievements,
    fireData: store.fireData,
    aboveZeroData: store.aboveZeroData,
    planningData: store.planningData,
    expenseMilestones: store.expenseMilestones,
    loading: store.loading,
    error: store.error
  };
};

export const usePlanningActions = () => {
  const store = useSuperCardStore();
  return {
    updateData: store.updateData,
    addMilestone: store.addMilestone,
    completeMilestone: store.completeMilestone,
    celebrate: store.celebrate,
    setLoading: store.setLoading,
    setError: store.setError
  };
};

export const usePortfolioHub = () => {
  const store = useSuperCardStore();
  return {
    portfolioData: store.portfolioData,
    holdings: store.holdings,
    portfolioHealth: store.strategyHealth,
    strategyComparison: store.performanceData,
    loading: store.loading,
    error: store.error
  };
};

export const usePortfolioActions = () => {
  const store = useSuperCardStore();
  return {
    updateData: store.updateData,
    updatePortfolioData: store.updatePortfolioData,
    fetchPortfolioHub: store.fetchPortfolioHub,
    setLoading: store.setLoading,
    setError: store.setError
  };
};

export const useExpenseMilestones = () => {
  const store = useSuperCardStore();
  return {
    expenseMilestones: store.expenseMilestones,
    loading: store.loading,
    error: store.error
  };
};

export const useGlobalActions = () => {
  const store = useSuperCardStore();
  return {
    setLoading: store.setLoading,
    setError: store.setError,
    updateData: store.updateData,
    refreshCard: store.refreshCard,
    refreshAll: store.refreshAll,
    setActiveCard: store.setActiveCard,
    fetchIncomeHub: store.fetchIncomeHub,
    fetchPerformanceHub: store.fetchPerformanceHub,
    fetchPortfolioHub: store.fetchPortfolioHub,
    fetchTaxHub: store.fetchTaxHub,
    fetchPlanningHub: store.fetchPlanningHub,
    optimisticUpdate: store.optimisticUpdate,
    rollback: store.rollback,
    commitUpdate: store.commitUpdate
  };
};

export const usePerformanceMetrics = () => {
  const store = useSuperCardStore();
  return {
    performanceData: store.performanceData,
    spyComparison: store.spyComparison,
    holdings: store.holdings,
    portfolioValue: store.portfolioValue,
    spyOutperformance: store.spyOutperformance,
    loading: store.loading,
    error: store.error
  };
};

export const useIncomeMetrics = () => {
  const store = useSuperCardStore();
  return {
    monthlyDividendIncome: store.monthlyDividendIncome,
    monthlyIncome: store.monthlyIncome,
    totalExpenseCoverage: store.totalExpenseCoverage,
    availableToReinvest: store.availableToReinvest,
    loading: store.loading,
    error: store.error
  };
};

// Additional utility hooks
export const useCardSyncStatus = () => {
  const store = useSuperCardStore();
  return {
    loading: store.loading,
    error: store.error,
    lastUpdated: store.lastUpdated,
    activeCard: store.activeCard,
    performance: store.performance,
    income: store.income
  };
};

// Export the main store hook both as named and default export
export { useSuperCardStore };
export default useSuperCardStore;