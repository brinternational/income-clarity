// User store stub
export const useUserStore = () => ({
  user: null,
  setUser: (user: any) => {},
  clearUser: () => {},
  isAuthenticated: false
});

export const useCurrentPortfolioValue = () => ({
  value: 0,
  loading: false,
  error: null
});

export const useUserGoals = () => ({
  goals: [],
  setGoals: (goals: any[]) => {},
  addGoal: (goal: any) => {},
  removeGoal: (id: string) => {},
  monthlyExpenses: 0,
  stressFreeLiving: 0
});

export const useUser = () => ({
  user: null,
  loading: false,
  error: null,
  location: 'CA'
});

export const useUserActions = () => ({
  login: () => {},
  logout: () => {},
  update: () => {},
  updateFinancialProfile: () => {},
  saveToStorage: () => {}
});

export const useFinancialProfile = () => ({
  profile: null,
  loading: false,
  currentAge: 35,
  currentPortfolioValue: 0,
  retirementAge: 65
});

export const useMonthlyContribution = () => ({
  amount: 0,
  setAmount: () => {}
});

export const useCurrentAge = () => 35;

export default useUserStore;