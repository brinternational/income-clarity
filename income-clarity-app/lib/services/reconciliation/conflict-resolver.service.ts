/**
 * Conflict Resolver Service
 * Handles conflicts between manual and Yodlee data with strategic decision making
 */

import { Holding, Income, Expense, DataSource } from '@prisma/client';
import { MatchConfidence } from './duplicate-detector.service';

export enum ReconciliationStrategy {
  KEEP_MANUAL = 'KEEP_MANUAL',
  REPLACE_WITH_YODLEE = 'REPLACE_WITH_YODLEE',
  MERGE_QUANTITIES = 'MERGE_QUANTITIES',
  KEEP_BOTH = 'KEEP_BOTH',
}

export interface ReconciliationDecision {
  strategy: ReconciliationStrategy;
  confidence: MatchConfidence;
  reason: string;
  metadata: {
    manualValue?: any;
    yodleeValue?: any;
    combinedValue?: any;
    factors?: string[];
  };
}

export interface ConflictAnalysis {
  hasConflicts: boolean;
  conflicts: {
    field: string;
    manualValue: any;
    yodleeValue: any;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: ReconciliationStrategy;
  }[];
  overallRecommendation: ReconciliationStrategy;
  confidence: MatchConfidence;
}

export class ConflictResolver {
  /**
   * Get default decision for holding reconciliation
   */
  async getDefaultDecision(
    manualHolding: Holding,
    yodleeHolding: any,
    confidence: MatchConfidence
  ): Promise<ReconciliationDecision> {
    const analysis = this.analyzeHoldingConflicts(manualHolding, yodleeHolding, confidence);
    
    return {
      strategy: analysis.overallRecommendation,
      confidence: analysis.confidence,
      reason: this.generateDecisionReason(analysis),
      metadata: {
        manualValue: {
          shares: manualHolding.shares,
          costBasis: manualHolding.costBasis,
          currentPrice: manualHolding.currentPrice,
        },
        yodleeValue: {
          shares: yodleeHolding.quantity,
          costBasis: yodleeHolding.costBasis?.amount,
          currentPrice: yodleeHolding.price?.amount,
        },
        factors: analysis.conflicts.map(c => `${c.field}: ${c.severity}`),
      },
    };
  }

  /**
   * Get default decision for income reconciliation
   */
  async getDefaultIncomeDecision(
    manualIncome: Income,
    yodleeIncome: any,
    confidence: MatchConfidence
  ): Promise<ReconciliationDecision> {
    const analysis = this.analyzeIncomeConflicts(manualIncome, yodleeIncome, confidence);
    
    return {
      strategy: analysis.overallRecommendation,
      confidence: analysis.confidence,
      reason: this.generateDecisionReason(analysis),
      metadata: {
        manualValue: {
          amount: manualIncome.amount,
          source: manualIncome.source,
          date: manualIncome.date,
          category: manualIncome.category,
        },
        yodleeValue: {
          amount: Math.abs(yodleeIncome.amount?.amount || 0),
          source: yodleeIncome.merchant?.name || yodleeIncome.description,
          date: new Date(yodleeIncome.transactionDate || yodleeIncome.date),
          category: this.categorizeYodleeIncome(yodleeIncome),
        },
        factors: analysis.conflicts.map(c => `${c.field}: ${c.severity}`),
      },
    };
  }

  /**
   * Get default decision for expense reconciliation
   */
  async getDefaultExpenseDecision(
    manualExpense: Expense,
    yodleeExpense: any,
    confidence: MatchConfidence
  ): Promise<ReconciliationDecision> {
    const analysis = this.analyzeExpenseConflicts(manualExpense, yodleeExpense, confidence);
    
    return {
      strategy: analysis.overallRecommendation,
      confidence: analysis.confidence,
      reason: this.generateDecisionReason(analysis),
      metadata: {
        manualValue: {
          amount: manualExpense.amount,
          merchant: manualExpense.merchant,
          date: manualExpense.date,
          category: manualExpense.category,
        },
        yodleeValue: {
          amount: Math.abs(yodleeExpense.amount?.amount || 0),
          merchant: yodleeExpense.merchant?.name,
          date: new Date(yodleeExpense.transactionDate || yodleeExpense.date),
          category: this.mapExpenseCategory(yodleeExpense.category),
        },
        factors: analysis.conflicts.map(c => `${c.field}: ${c.severity}`),
      },
    };
  }

  /**
   * Analyze conflicts in holding data
   */
  private analyzeHoldingConflicts(
    manualHolding: Holding,
    yodleeHolding: any,
    confidence: MatchConfidence
  ): ConflictAnalysis {
    const conflicts = [];

    // Check shares/quantity conflicts
    const manualShares = manualHolding.shares || 0;
    const yodleeShares = yodleeHolding.quantity || 0;
    
    if (Math.abs(manualShares - yodleeShares) > 0.01) {
      const percentageDiff = Math.abs((manualShares - yodleeShares) / Math.max(manualShares, yodleeShares)) * 100;
      
      conflicts.push({
        field: 'shares',
        manualValue: manualShares,
        yodleeValue: yodleeShares,
        severity: percentageDiff > 50 ? 'HIGH' : percentageDiff > 10 ? 'MEDIUM' : 'LOW',
        recommendation: percentageDiff > 25 ? ReconciliationStrategy.MERGE_QUANTITIES : ReconciliationStrategy.REPLACE_WITH_YODLEE,
      });
    }

    // Check cost basis conflicts
    const manualCostBasis = manualHolding.costBasis;
    const yodleeCostBasis = yodleeHolding.costBasis?.amount;
    
    if (manualCostBasis && yodleeCostBasis && Math.abs(manualCostBasis - yodleeCostBasis) > 0.01) {
      const percentageDiff = Math.abs((manualCostBasis - yodleeCostBasis) / Math.max(manualCostBasis, yodleeCostBasis)) * 100;
      
      conflicts.push({
        field: 'costBasis',
        manualValue: manualCostBasis,
        yodleeValue: yodleeCostBasis,
        severity: percentageDiff > 30 ? 'HIGH' : percentageDiff > 10 ? 'MEDIUM' : 'LOW',
        recommendation: ReconciliationStrategy.KEEP_MANUAL, // Prefer manual cost basis
      });
    }

    // Check current price conflicts
    const manualPrice = manualHolding.currentPrice;
    const yodleePrice = yodleeHolding.price?.amount;
    
    if (manualPrice && yodleePrice && Math.abs(manualPrice - yodleePrice) > 0.01) {
      const percentageDiff = Math.abs((manualPrice - yodleePrice) / Math.max(manualPrice, yodleePrice)) * 100;
      
      conflicts.push({
        field: 'currentPrice',
        manualValue: manualPrice,
        yodleeValue: yodleePrice,
        severity: percentageDiff > 20 ? 'MEDIUM' : 'LOW',
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE, // Prefer Yodlee prices (more current)
      });
    }

    // Determine overall recommendation
    const overallRecommendation = this.determineHoldingStrategy(conflicts, confidence);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      overallRecommendation,
      confidence,
    };
  }

  /**
   * Analyze conflicts in income data
   */
  private analyzeIncomeConflicts(
    manualIncome: Income,
    yodleeIncome: any,
    confidence: MatchConfidence
  ): ConflictAnalysis {
    const conflicts = [];

    // Check amount conflicts
    const manualAmount = manualIncome.amount || 0;
    const yodleeAmount = Math.abs(yodleeIncome.amount?.amount || 0);
    
    if (Math.abs(manualAmount - yodleeAmount) > 0.01) {
      const percentageDiff = Math.abs((manualAmount - yodleeAmount) / Math.max(manualAmount, yodleeAmount)) * 100;
      
      conflicts.push({
        field: 'amount',
        manualValue: manualAmount,
        yodleeValue: yodleeAmount,
        severity: percentageDiff > 25 ? 'HIGH' : percentageDiff > 5 ? 'MEDIUM' : 'LOW',
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE, // Bank data more accurate
      });
    }

    // Check date conflicts
    const manualDate = new Date(manualIncome.date);
    const yodleeDate = new Date(yodleeIncome.transactionDate || yodleeIncome.date);
    const daysDiff = Math.abs((manualDate.getTime() - yodleeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      conflicts.push({
        field: 'date',
        manualValue: manualDate,
        yodleeValue: yodleeDate,
        severity: daysDiff > 7 ? 'HIGH' : daysDiff > 3 ? 'MEDIUM' : 'LOW',
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE, // Bank dates more accurate
      });
    }

    // Check source/description conflicts
    const manualSource = manualIncome.source?.toLowerCase() || '';
    const yodleeSource = (yodleeIncome.merchant?.name || yodleeIncome.description || '').toLowerCase();
    
    if (manualSource && yodleeSource && !this.isSimilarText(manualSource, yodleeSource)) {
      conflicts.push({
        field: 'source',
        manualValue: manualIncome.source,
        yodleeValue: yodleeIncome.merchant?.name || yodleeIncome.description,
        severity: 'LOW', // Not critical conflict
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE, // More detailed bank description
      });
    }

    const overallRecommendation = this.determineIncomeStrategy(conflicts, confidence);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      overallRecommendation,
      confidence,
    };
  }

  /**
   * Analyze conflicts in expense data
   */
  private analyzeExpenseConflicts(
    manualExpense: Expense,
    yodleeExpense: any,
    confidence: MatchConfidence
  ): ConflictAnalysis {
    const conflicts = [];

    // Check amount conflicts
    const manualAmount = manualExpense.amount || 0;
    const yodleeAmount = Math.abs(yodleeExpense.amount?.amount || 0);
    
    if (Math.abs(manualAmount - yodleeAmount) > 0.01) {
      const percentageDiff = Math.abs((manualAmount - yodleeAmount) / Math.max(manualAmount, yodleeAmount)) * 100;
      
      conflicts.push({
        field: 'amount',
        manualValue: manualAmount,
        yodleeValue: yodleeAmount,
        severity: percentageDiff > 25 ? 'HIGH' : percentageDiff > 5 ? 'MEDIUM' : 'LOW',
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE,
      });
    }

    // Check date conflicts
    const manualDate = new Date(manualExpense.date);
    const yodleeDate = new Date(yodleeExpense.transactionDate || yodleeExpense.date);
    const daysDiff = Math.abs((manualDate.getTime() - yodleeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      conflicts.push({
        field: 'date',
        manualValue: manualDate,
        yodleeValue: yodleeDate,
        severity: daysDiff > 7 ? 'HIGH' : daysDiff > 3 ? 'MEDIUM' : 'LOW',
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE,
      });
    }

    // Check merchant conflicts
    const manualMerchant = manualExpense.merchant?.toLowerCase() || '';
    const yodleeMerchant = (yodleeExpense.merchant?.name || '').toLowerCase();
    
    if (manualMerchant && yodleeMerchant && !this.isSimilarText(manualMerchant, yodleeMerchant)) {
      conflicts.push({
        field: 'merchant',
        manualValue: manualExpense.merchant,
        yodleeValue: yodleeExpense.merchant?.name,
        severity: 'LOW',
        recommendation: ReconciliationStrategy.REPLACE_WITH_YODLEE,
      });
    }

    const overallRecommendation = this.determineExpenseStrategy(conflicts, confidence);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      overallRecommendation,
      confidence,
    };
  }

  /**
   * Determine holding reconciliation strategy
   */
  private determineHoldingStrategy(
    conflicts: any[],
    confidence: MatchConfidence
  ): ReconciliationStrategy {
    if (conflicts.length === 0) {
      return ReconciliationStrategy.REPLACE_WITH_YODLEE; // No conflicts, use more current data
    }

    // High confidence matches with quantity conflicts - merge
    if (confidence === MatchConfidence.HIGH && conflicts.some(c => c.field === 'shares' && c.severity !== 'LOW')) {
      return ReconciliationStrategy.MERGE_QUANTITIES;
    }

    // Multiple high severity conflicts - keep both
    const highSeverityConflicts = conflicts.filter(c => c.severity === 'HIGH');
    if (highSeverityConflicts.length > 1) {
      return ReconciliationStrategy.KEEP_BOTH;
    }

    // Medium confidence with conflicts - keep manual
    if (confidence === MatchConfidence.MEDIUM && conflicts.length > 0) {
      return ReconciliationStrategy.KEEP_MANUAL;
    }

    // Low confidence - keep both for safety
    if (confidence === MatchConfidence.LOW) {
      return ReconciliationStrategy.KEEP_BOTH;
    }

    // Default: replace with Yodlee for most accurate data
    return ReconciliationStrategy.REPLACE_WITH_YODLEE;
  }

  /**
   * Determine income reconciliation strategy
   */
  private determineIncomeStrategy(
    conflicts: any[],
    confidence: MatchConfidence
  ): ReconciliationStrategy {
    if (conflicts.length === 0) {
      return ReconciliationStrategy.REPLACE_WITH_YODLEE;
    }

    // High severity amount conflicts - keep both
    const highAmountConflicts = conflicts.filter(c => c.field === 'amount' && c.severity === 'HIGH');
    if (highAmountConflicts.length > 0) {
      return ReconciliationStrategy.KEEP_BOTH;
    }

    // Low confidence - keep both
    if (confidence === MatchConfidence.LOW) {
      return ReconciliationStrategy.KEEP_BOTH;
    }

    // Medium conflicts - keep manual
    if (conflicts.some(c => c.severity === 'MEDIUM')) {
      return ReconciliationStrategy.KEEP_MANUAL;
    }

    return ReconciliationStrategy.REPLACE_WITH_YODLEE;
  }

  /**
   * Determine expense reconciliation strategy
   */
  private determineExpenseStrategy(
    conflicts: any[],
    confidence: MatchConfidence
  ): ReconciliationStrategy {
    if (conflicts.length === 0) {
      return ReconciliationStrategy.REPLACE_WITH_YODLEE;
    }

    // High severity amount conflicts - keep both
    const highAmountConflicts = conflicts.filter(c => c.field === 'amount' && c.severity === 'HIGH');
    if (highAmountConflicts.length > 0) {
      return ReconciliationStrategy.KEEP_BOTH;
    }

    // Low confidence - keep both
    if (confidence === MatchConfidence.LOW) {
      return ReconciliationStrategy.KEEP_BOTH;
    }

    return ReconciliationStrategy.REPLACE_WITH_YODLEE;
  }

  /**
   * Generate human-readable decision reason
   */
  private generateDecisionReason(analysis: ConflictAnalysis): string {
    if (!analysis.hasConflicts) {
      return 'No conflicts detected. Using Yodlee data for accuracy and real-time updates.';
    }

    const highConflicts = analysis.conflicts.filter(c => c.severity === 'HIGH').length;
    const mediumConflicts = analysis.conflicts.filter(c => c.severity === 'MEDIUM').length;
    const lowConflicts = analysis.conflicts.filter(c => c.severity === 'LOW').length;

    switch (analysis.overallRecommendation) {
      case ReconciliationStrategy.KEEP_MANUAL:
        return `Keeping manual data due to ${mediumConflicts + highConflicts} significant conflicts. Manual data appears more reliable.`;
      
      case ReconciliationStrategy.REPLACE_WITH_YODLEE:
        return `Using Yodlee data for accuracy. Conflicts detected: ${highConflicts} high, ${mediumConflicts} medium, ${lowConflicts} low severity.`;
      
      case ReconciliationStrategy.MERGE_QUANTITIES:
        return `Merging quantities from both sources. High confidence match with quantity differences detected.`;
      
      case ReconciliationStrategy.KEEP_BOTH:
        return `Keeping both entries due to ${highConflicts} high-severity conflicts or low match confidence. Requires manual review.`;
      
      default:
        return 'Default reconciliation strategy applied.';
    }
  }

  /**
   * Check if two text strings are similar
   */
  private isSimilarText(text1: string, text2: string, threshold: number = 0.7): boolean {
    if (!text1 || !text2) return false;
    
    const similarity = this.calculateStringSimilarity(text1.toLowerCase(), text2.toLowerCase());
    return similarity >= threshold;
  }

  /**
   * Calculate string similarity using Jaro-Winkler algorithm
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    // Simple Levenshtein distance approximation
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Categorize Yodlee income transaction
   */
  private categorizeYodleeIncome(yodleeIncome: any): string {
    const description = (yodleeIncome.description || '').toLowerCase();
    const category = (yodleeIncome.category || '').toLowerCase();
    
    if (description.includes('dividend') || description.includes('div') || category.includes('dividend')) {
      return 'DIVIDEND';
    }
    
    if (description.includes('salary') || description.includes('payroll') || category.includes('salary')) {
      return 'SALARY';
    }
    
    if (description.includes('interest') || category.includes('interest')) {
      return 'INTEREST';
    }
    
    return 'OTHER';
  }

  /**
   * Map Yodlee category to expense category
   */
  private mapExpenseCategory(yodleeCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Food and Dining': 'FOOD',
      'Bills & Utilities': 'UTILITIES',
      'Shopping': 'ENTERTAINMENT',
      'Transportation': 'TRANSPORTATION',
      'Healthcare': 'HEALTHCARE',
      'Insurance': 'INSURANCE',
      'Home': 'RENT',
      'Auto & Transport': 'TRANSPORTATION',
      'Gas & Fuel': 'TRANSPORTATION',
      'Groceries': 'FOOD',
      'Restaurants': 'FOOD',
    };
    return categoryMap[yodleeCategory] || 'OTHER';
  }

  /**
   * Get user-friendly strategy description
   */
  static getStrategyDescription(strategy: ReconciliationStrategy): string {
    const descriptions = {
      [ReconciliationStrategy.KEEP_MANUAL]: 'Keep your manually entered data',
      [ReconciliationStrategy.REPLACE_WITH_YODLEE]: 'Replace with bank data',
      [ReconciliationStrategy.MERGE_QUANTITIES]: 'Combine quantities from both sources',
      [ReconciliationStrategy.KEEP_BOTH]: 'Keep both entries separately',
    };
    return descriptions[strategy] || 'Unknown strategy';
  }

  /**
   * Get confidence level description
   */
  static getConfidenceDescription(confidence: MatchConfidence): string {
    const descriptions = {
      [MatchConfidence.HIGH]: 'Very likely the same item',
      [MatchConfidence.MEDIUM]: 'Possibly the same item',
      [MatchConfidence.LOW]: 'Uncertain match',
    };
    return descriptions[confidence] || 'Unknown confidence';
  }
}

// Export singleton instance
export const conflictResolver = new ConflictResolver();