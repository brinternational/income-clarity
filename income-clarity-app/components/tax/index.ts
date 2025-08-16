/**
 * Tax Strategy Hub Components - THE COMPETITIVE MOAT
 * 
 * Tasks TAX-012 through TAX-018 - CRITICAL competitive advantages!
 * 
 * Core Components:
 * - FourStrategyAnalysis: Complete comparison of all 4 investment strategies  
 * - LocationBasedWinner: Interactive visualization showing winners by location
 * - MultiStateTaxComparison: All 50 states + Puerto Rico with savings calculator
 * - ROCTracker: Return of Capital distribution tracking with tax advantages
 * 
 * Key Features:
 * ✨ Puerto Rico's 0% tax advantage prominently displayed throughout
 * 💰 Interactive "Move to PR and save $X" messaging 
 * 🏆 Winner badges and visual indicators
 * 📊 ROC (19a) statement parsing and tax deferral tracking
 * 📱 Mobile-responsive with smooth animations
 * 
 * Supporting Hooks:
 * - useStrategyTaxComparison: Tax impact calculations for each strategy
 * - useMultiStateComparison: All states comparison with migration analysis  
 * - useROCTracking: Return of Capital tracking and tax planning
 */

export { default as StateComparisonVisualization } from './StateComparisonVisualization';
export { StateComparisonVisualization as StateComparison } from './StateComparisonVisualization';
export { StrategyComparisonEngine } from './StrategyComparisonEngine';
export { FourStrategyAnalysis } from './FourStrategyAnalysis';
export { LocationBasedWinner } from './LocationBasedWinner';
export { MultiStateTaxComparison } from './MultiStateTaxComparison';
export { ROCTracker } from './ROCTracker';