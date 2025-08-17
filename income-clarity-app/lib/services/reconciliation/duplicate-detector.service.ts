/**
 * Duplicate Detector Service
 * Advanced duplicate detection using multiple matching algorithms
 */

import { Holding, Income, Expense } from '@prisma/client';

export enum MatchConfidence {
  HIGH = 'HIGH',     // 90%+ match - very likely same item
  MEDIUM = 'MEDIUM', // 70-89% match - possibly same item
  LOW = 'LOW',       // 50-69% match - uncertain match
}

export interface MatchResult {
  yodleeData: any;
  confidence: MatchConfidence;
  score: number;
  reasons: string[];
  matchedFields: string[];
}

export interface MatchCriteria {
  exactTicker?: boolean;
  fuzzyName?: boolean;
  cusipMatch?: boolean;
  isinMatch?: boolean;
  dateRange?: number; // days
  amountTolerance?: number; // percentage
}

export class DuplicateDetector {
  /**
   * Find potential holding matches
   */
  async findHoldingMatches(
    manualHolding: Holding,
    yodleeHoldings: any[],
    criteria: MatchCriteria = {}
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];

    for (const yodleeHolding of yodleeHoldings) {
      const matchResult = await this.analyzeHoldingMatch(manualHolding, yodleeHolding, criteria);
      
      if (matchResult.score >= 0.5) { // 50% minimum threshold
        matches.push(matchResult);
      }
    }

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Find potential income matches
   */
  async findIncomeMatches(
    manualIncome: Income,
    yodleeIncomes: any[],
    criteria: MatchCriteria = {}
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];

    for (const yodleeIncome of yodleeIncomes) {
      const matchResult = await this.analyzeIncomeMatch(manualIncome, yodleeIncome, criteria);
      
      if (matchResult.score >= 0.5) {
        matches.push(matchResult);
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Find potential expense matches
   */
  async findExpenseMatches(
    manualExpense: Expense,
    yodleeExpenses: any[],
    criteria: MatchCriteria = {}
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];

    for (const yodleeExpense of yodleeExpenses) {
      const matchResult = await this.analyzeExpenseMatch(manualExpense, yodleeExpense, criteria);
      
      if (matchResult.score >= 0.5) {
        matches.push(matchResult);
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Analyze holding match using multiple criteria
   */
  private async analyzeHoldingMatch(
    manualHolding: Holding,
    yodleeHolding: any,
    criteria: MatchCriteria
  ): Promise<MatchResult> {
    let score = 0;
    const reasons: string[] = [];
    const matchedFields: string[] = [];

    // 1. Exact ticker match (highest weight: 40%)
    if (this.isExactTickerMatch(manualHolding.ticker, yodleeHolding.symbol)) {
      score += 0.4;
      reasons.push('Exact ticker symbol match');
      matchedFields.push('ticker');
    }

    // 2. CUSIP match (high weight: 35%)
    if (this.isCusipMatch(manualHolding, yodleeHolding)) {
      score += 0.35;
      reasons.push('CUSIP identifier match');
      matchedFields.push('cusip');
    }

    // 3. ISIN match (high weight: 35%)
    if (this.isIsinMatch(manualHolding, yodleeHolding)) {
      score += 0.35;
      reasons.push('ISIN identifier match');
      matchedFields.push('isin');
    }

    // 4. Fuzzy name matching (medium weight: 25%)
    const nameScore = this.calculateNameSimilarity(manualHolding.name, yodleeHolding.description || yodleeHolding.securityName);
    if (nameScore > 0.7) {
      score += nameScore * 0.25;
      reasons.push(`Company name similarity: ${Math.round(nameScore * 100)}%`);
      matchedFields.push('name');
    }

    // 5. Sector/security type match (low weight: 10%)
    if (this.isSectorMatch(manualHolding.sector, yodleeHolding.securityType)) {
      score += 0.1;
      reasons.push('Security type match');
      matchedFields.push('sector');
    }

    // 6. Quantity proximity (low weight: 10%)
    const quantityScore = this.calculateQuantitySimilarity(manualHolding.shares, yodleeHolding.quantity);
    if (quantityScore > 0.5) {
      score += quantityScore * 0.1;
      reasons.push(`Quantity similarity: ${Math.round(quantityScore * 100)}%`);
      matchedFields.push('quantity');
    }

    // 7. Price proximity (low weight: 5%)
    const priceScore = this.calculatePriceSimilarity(manualHolding.currentPrice, yodleeHolding.price?.amount);
    if (priceScore > 0.8) {
      score += priceScore * 0.05;
      reasons.push(`Price similarity: ${Math.round(priceScore * 100)}%`);
      matchedFields.push('price');
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    return {
      yodleeData: yodleeHolding,
      confidence: this.determineConfidence(score),
      score,
      reasons,
      matchedFields,
    };
  }

  /**
   * Analyze income match
   */
  private async analyzeIncomeMatch(
    manualIncome: Income,
    yodleeIncome: any,
    criteria: MatchCriteria
  ): Promise<MatchResult> {
    let score = 0;
    const reasons: string[] = [];
    const matchedFields: string[] = [];

    // 1. Amount match (highest weight: 50%)
    const amountTolerance = criteria.amountTolerance || 5; // 5% tolerance
    const amountScore = this.calculateAmountSimilarity(
      manualIncome.amount,
      Math.abs(yodleeIncome.amount?.amount || 0),
      amountTolerance
    );
    
    if (amountScore > 0.9) {
      score += amountScore * 0.5;
      reasons.push(`Amount match within ${amountTolerance}%`);
      matchedFields.push('amount');
    }

    // 2. Date proximity (high weight: 30%)
    const dateRange = criteria.dateRange || 7; // 7 days tolerance
    const dateScore = this.calculateDateSimilarity(
      manualIncome.date,
      new Date(yodleeIncome.transactionDate || yodleeIncome.date),
      dateRange
    );
    
    if (dateScore > 0.7) {
      score += dateScore * 0.3;
      reasons.push(`Date within ${dateRange} days`);
      matchedFields.push('date');
    }

    // 3. Source/description similarity (medium weight: 20%)
    const sourceScore = this.calculateStringSimilarity(
      manualIncome.source || '',
      yodleeIncome.merchant?.name || yodleeIncome.description || ''
    );
    
    if (sourceScore > 0.6) {
      score += sourceScore * 0.2;
      reasons.push(`Source similarity: ${Math.round(sourceScore * 100)}%`);
      matchedFields.push('source');
    }

    // 4. Category match (low weight: 10%)
    if (this.isIncomeCategoryMatch(manualIncome.category, yodleeIncome)) {
      score += 0.1;
      reasons.push('Category match');
      matchedFields.push('category');
    }

    score = Math.min(score, 1.0);

    return {
      yodleeData: yodleeIncome,
      confidence: this.determineConfidence(score),
      score,
      reasons,
      matchedFields,
    };
  }

  /**
   * Analyze expense match
   */
  private async analyzeExpenseMatch(
    manualExpense: Expense,
    yodleeExpense: any,
    criteria: MatchCriteria
  ): Promise<MatchResult> {
    let score = 0;
    const reasons: string[] = [];
    const matchedFields: string[] = [];

    // 1. Amount match (highest weight: 50%)
    const amountTolerance = criteria.amountTolerance || 5;
    const amountScore = this.calculateAmountSimilarity(
      manualExpense.amount,
      Math.abs(yodleeExpense.amount?.amount || 0),
      amountTolerance
    );
    
    if (amountScore > 0.9) {
      score += amountScore * 0.5;
      reasons.push(`Amount match within ${amountTolerance}%`);
      matchedFields.push('amount');
    }

    // 2. Date proximity (high weight: 30%)
    const dateRange = criteria.dateRange || 7;
    const dateScore = this.calculateDateSimilarity(
      manualExpense.date,
      new Date(yodleeExpense.transactionDate || yodleeExpense.date),
      dateRange
    );
    
    if (dateScore > 0.7) {
      score += dateScore * 0.3;
      reasons.push(`Date within ${dateRange} days`);
      matchedFields.push('date');
    }

    // 3. Merchant similarity (medium weight: 15%)
    if (manualExpense.merchant && yodleeExpense.merchant?.name) {
      const merchantScore = this.calculateStringSimilarity(
        manualExpense.merchant,
        yodleeExpense.merchant.name
      );
      
      if (merchantScore > 0.6) {
        score += merchantScore * 0.15;
        reasons.push(`Merchant similarity: ${Math.round(merchantScore * 100)}%`);
        matchedFields.push('merchant');
      }
    }

    // 4. Description similarity (medium weight: 15%)
    if (manualExpense.description && yodleeExpense.description) {
      const descScore = this.calculateStringSimilarity(
        manualExpense.description,
        yodleeExpense.description
      );
      
      if (descScore > 0.6) {
        score += descScore * 0.15;
        reasons.push(`Description similarity: ${Math.round(descScore * 100)}%`);
        matchedFields.push('description');
      }
    }

    // 5. Category match (low weight: 10%)
    if (this.isExpenseCategoryMatch(manualExpense.category, yodleeExpense.category)) {
      score += 0.1;
      reasons.push('Category match');
      matchedFields.push('category');
    }

    score = Math.min(score, 1.0);

    return {
      yodleeData: yodleeExpense,
      confidence: this.determineConfidence(score),
      score,
      reasons,
      matchedFields,
    };
  }

  /**
   * Check exact ticker match
   */
  private isExactTickerMatch(manualTicker: string, yodleeTicker?: string): boolean {
    if (!manualTicker || !yodleeTicker) return false;
    return manualTicker.toUpperCase() === yodleeTicker.toUpperCase();
  }

  /**
   * Check CUSIP match
   */
  private isCusipMatch(manualHolding: Holding, yodleeHolding: any): boolean {
    const manualCusip = this.extractCusip(manualHolding);
    const yodleeCusip = yodleeHolding.cusipNumber || this.extractCusip(yodleeHolding);
    
    if (!manualCusip || !yodleeCusip) return false;
    return manualCusip === yodleeCusip;
  }

  /**
   * Check ISIN match
   */
  private isIsinMatch(manualHolding: Holding, yodleeHolding: any): boolean {
    const manualIsin = this.extractIsin(manualHolding);
    const yodleeIsin = yodleeHolding.isin || this.extractIsin(yodleeHolding);
    
    if (!manualIsin || !yodleeIsin) return false;
    return manualIsin === yodleeIsin;
  }

  /**
   * Extract CUSIP from holding metadata
   */
  private extractCusip(holding: any): string | null {
    if (holding.cusipNumber) return holding.cusipNumber;
    
    try {
      const metadata = typeof holding.metadata === 'string' 
        ? JSON.parse(holding.metadata) 
        : holding.metadata;
      return metadata?.cusip || metadata?.cusipNumber || null;
    } catch {
      return null;
    }
  }

  /**
   * Extract ISIN from holding metadata
   */
  private extractIsin(holding: any): string | null {
    if (holding.isin) return holding.isin;
    
    try {
      const metadata = typeof holding.metadata === 'string' 
        ? JSON.parse(holding.metadata) 
        : holding.metadata;
      return metadata?.isin || null;
    } catch {
      return null;
    }
  }

  /**
   * Calculate name similarity using fuzzy matching
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    if (!name1 || !name2) return 0;

    // Normalize names
    const normalize = (str: string) => str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const norm1 = normalize(name1);
    const norm2 = normalize(name2);

    // Check for exact match
    if (norm1 === norm2) return 1.0;

    // Check for one name contained in another
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;

    // Calculate Levenshtein distance
    return this.calculateStringSimilarity(norm1, norm2);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Check sector match
   */
  private isSectorMatch(manualSector?: string, yodleeSecurityType?: string): boolean {
    if (!manualSector || !yodleeSecurityType) return false;

    const sectorMapping: Record<string, string[]> = {
      'Technology': ['EQUITY', 'TECH'],
      'Healthcare': ['EQUITY', 'HEALTHCARE'],
      'Financial': ['EQUITY', 'FINANCIAL'],
      'Energy': ['EQUITY', 'ENERGY'],
      'Diversified': ['ETF', 'MUTUAL_FUND'],
      'Fixed Income': ['BOND', 'CD', 'FIXED_INCOME'],
      'Real Estate': ['REIT', 'REAL_ESTATE'],
      'Utilities': ['EQUITY', 'UTILITIES'],
      'Consumer': ['EQUITY', 'CONSUMER'],
      'Other': ['EQUITY', 'OTHER'],
    };

    const mappedTypes = sectorMapping[manualSector] || [];
    return mappedTypes.includes(yodleeSecurityType.toUpperCase());
  }

  /**
   * Calculate quantity similarity
   */
  private calculateQuantitySimilarity(manual: number | null, yodlee: number | null): number {
    if (!manual || !yodlee) return 0;
    if (manual === yodlee) return 1.0;

    const difference = Math.abs(manual - yodlee);
    const average = (manual + yodlee) / 2;
    const percentageDiff = difference / average;

    if (percentageDiff <= 0.05) return 0.95; // 5% difference
    if (percentageDiff <= 0.1) return 0.85;  // 10% difference
    if (percentageDiff <= 0.25) return 0.7;  // 25% difference
    if (percentageDiff <= 0.5) return 0.5;   // 50% difference

    return 0.2; // Over 50% difference
  }

  /**
   * Calculate price similarity
   */
  private calculatePriceSimilarity(manual: number | null, yodlee: number | null): number {
    if (!manual || !yodlee) return 0;
    if (manual === yodlee) return 1.0;

    const difference = Math.abs(manual - yodlee);
    const average = (manual + yodlee) / 2;
    const percentageDiff = difference / average;

    if (percentageDiff <= 0.02) return 1.0;   // 2% difference
    if (percentageDiff <= 0.05) return 0.9;   // 5% difference
    if (percentageDiff <= 0.1) return 0.8;    // 10% difference
    if (percentageDiff <= 0.2) return 0.6;    // 20% difference

    return 0.3; // Over 20% difference
  }

  /**
   * Calculate amount similarity for transactions
   */
  private calculateAmountSimilarity(manual: number, yodlee: number, tolerancePercent: number): number {
    if (manual === yodlee) return 1.0;

    const difference = Math.abs(manual - yodlee);
    const average = (manual + yodlee) / 2;
    const percentageDiff = (difference / average) * 100;

    if (percentageDiff <= tolerancePercent) {
      return 1.0 - (percentageDiff / tolerancePercent) * 0.2; // Scale from 1.0 to 0.8
    }

    return 0.0; // Outside tolerance
  }

  /**
   * Calculate date similarity
   */
  private calculateDateSimilarity(manualDate: Date, yodleeDate: Date, toleranceDays: number): number {
    const diffInTime = Math.abs(manualDate.getTime() - yodleeDate.getTime());
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    if (diffInDays === 0) return 1.0;
    if (diffInDays <= toleranceDays) {
      return 1.0 - (diffInDays / toleranceDays) * 0.3; // Scale from 1.0 to 0.7
    }

    return 0.0; // Outside tolerance
  }

  /**
   * Check income category match
   */
  private isIncomeCategoryMatch(manualCategory: string, yodleeIncome: any): boolean {
    const description = (yodleeIncome.description || '').toLowerCase();
    const category = (yodleeIncome.category || '').toLowerCase();

    const categoryMatches: Record<string, string[]> = {
      'DIVIDEND': ['dividend', 'div'],
      'SALARY': ['salary', 'payroll', 'wages'],
      'INTEREST': ['interest'],
      'BUSINESS': ['business', 'freelance'],
      'RENTAL': ['rental', 'rent'],
      'OTHER': [],
    };

    const keywords = categoryMatches[manualCategory] || [];
    return keywords.some(keyword => description.includes(keyword) || category.includes(keyword));
  }

  /**
   * Check expense category match
   */
  private isExpenseCategoryMatch(manualCategory: string, yodleeCategory?: string): boolean {
    if (!yodleeCategory) return false;

    const categoryMapping: Record<string, string[]> = {
      'FOOD': ['Food and Dining', 'Groceries', 'Restaurants'],
      'TRANSPORTATION': ['Auto & Transport', 'Gas & Fuel', 'Transportation'],
      'UTILITIES': ['Bills & Utilities'],
      'ENTERTAINMENT': ['Shopping', 'Entertainment'],
      'HEALTHCARE': ['Healthcare'],
      'INSURANCE': ['Insurance'],
      'RENT': ['Home', 'Mortgage'],
      'OTHER': [],
    };

    const mappedCategories = categoryMapping[manualCategory] || [];
    return mappedCategories.some(cat => 
      yodleeCategory.toLowerCase().includes(cat.toLowerCase())
    );
  }

  /**
   * Determine confidence level based on score
   */
  private determineConfidence(score: number): MatchConfidence {
    if (score >= 0.9) return MatchConfidence.HIGH;
    if (score >= 0.7) return MatchConfidence.MEDIUM;
    return MatchConfidence.LOW;
  }

  /**
   * Prevent duplicate entries by checking existing reconciled data
   */
  async isDuplicate(
    dataType: 'holding' | 'income' | 'expense',
    yodleeId: string,
    userId: string
  ): Promise<boolean> {
    const prisma = new (require('@prisma/client').PrismaClient)();

    try {
      switch (dataType) {
        case 'holding':
          const existingHolding = await prisma.holding.findFirst({
            where: {
              portfolio: { userId },
              OR: [
                { yodleeAccountId: yodleeId },
                { metadata: { contains: `"id":"${yodleeId}"` } },
              ],
            },
          });
          return !!existingHolding;

        case 'income':
          const existingIncome = await prisma.income.findFirst({
            where: {
              userId,
              yodleeTransactionId: yodleeId,
            },
          });
          return !!existingIncome;

        case 'expense':
          const existingExpense = await prisma.expense.findFirst({
            where: {
              userId,
              yodleeTransactionId: yodleeId,
            },
          });
          return !!existingExpense;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Get duplicate statistics for user
   */
  async getDuplicateStats(userId: string): Promise<{
    totalDuplicates: number;
    holdingDuplicates: number;
    incomeDuplicates: number;
    expenseDuplicates: number;
  }> {
    const prisma = new (require('@prisma/client').PrismaClient)();

    try {
      const [holdingDuplicates, incomeDuplicates, expenseDuplicates] = await Promise.all([
        prisma.holding.count({
          where: {
            portfolio: { userId },
            isReconciled: true,
            dataSource: { not: 'MANUAL' },
          },
        }),
        prisma.income.count({
          where: {
            userId,
            isReconciled: true,
            dataSource: { not: 'MANUAL' },
          },
        }),
        prisma.expense.count({
          where: {
            userId,
            isReconciled: true,
            dataSource: { not: 'MANUAL' },
          },
        }),
      ]);

      return {
        totalDuplicates: holdingDuplicates + incomeDuplicates + expenseDuplicates,
        holdingDuplicates,
        incomeDuplicates,
        expenseDuplicates,
      };
    } catch (error) {
      console.error('Error getting duplicate stats:', error);
      return {
        totalDuplicates: 0,
        holdingDuplicates: 0,
        incomeDuplicates: 0,
        expenseDuplicates: 0,
      };
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Export singleton instance
export const duplicateDetector = new DuplicateDetector();