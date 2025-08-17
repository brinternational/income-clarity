/**
 * Data Reconciler Service
 * Main reconciliation engine for matching manual and Yodlee data
 */

import { PrismaClient, DataSource, Holding, Income, Expense } from '@prisma/client';
import { DuplicateDetector, MatchResult, MatchConfidence } from './duplicate-detector.service';
import { ConflictResolver, ReconciliationStrategy, ReconciliationDecision } from './conflict-resolver.service';

const prisma = new PrismaClient();

export interface ReconciliationContext {
  userId: string;
  manualHoldings: Holding[];
  yodleeHoldings: any[];
  manualIncomes?: Income[];
  yodleeIncomes?: any[];
  manualExpenses?: Expense[];
  yodleeExpenses?: any[];
}

export interface ReconciliationResult {
  holdingsMatched: number;
  holdingsCreated: number;
  incomesMatched: number;
  incomesCreated: number;
  expensesMatched: number;
  expensesCreated: number;
  conflictsResolved: number;
  totalProcessed: number;
  errors: string[];
}

export interface HoldingMatch {
  manualHolding: Holding;
  yodleeHolding: any;
  confidence: MatchConfidence;
  strategy: ReconciliationStrategy;
  decision?: ReconciliationDecision;
}

export class DataReconciler {
  private duplicateDetector: DuplicateDetector;
  private conflictResolver: ConflictResolver;

  constructor() {
    this.duplicateDetector = new DuplicateDetector();
    this.conflictResolver = new ConflictResolver();
  }

  /**
   * Main reconciliation entry point for FREE → PREMIUM upgrade
   */
  async reconcileUserData(context: ReconciliationContext): Promise<ReconciliationResult> {
    const result: ReconciliationResult = {
      holdingsMatched: 0,
      holdingsCreated: 0,
      incomesMatched: 0,
      incomesCreated: 0,
      expensesMatched: 0,
      expensesCreated: 0,
      conflictsResolved: 0,
      totalProcessed: 0,
      errors: [],
    };

    try {
      // 1. Reconcile holdings first (most important)
      const holdingsResult = await this.reconcileHoldings(
        context.userId,
        context.manualHoldings,
        context.yodleeHoldings
      );
      
      result.holdingsMatched = holdingsResult.matched;
      result.holdingsCreated = holdingsResult.created;
      result.conflictsResolved += holdingsResult.conflictsResolved;

      // 2. Reconcile income data
      if (context.manualIncomes && context.yodleeIncomes) {
        const incomesResult = await this.reconcileIncomes(
          context.userId,
          context.manualIncomes,
          context.yodleeIncomes
        );
        
        result.incomesMatched = incomesResult.matched;
        result.incomesCreated = incomesResult.created;
        result.conflictsResolved += incomesResult.conflictsResolved;
      }

      // 3. Reconcile expense data
      if (context.manualExpenses && context.yodleeExpenses) {
        const expensesResult = await this.reconcileExpenses(
          context.userId,
          context.manualExpenses,
          context.yodleeExpenses
        );
        
        result.expensesMatched = expensesResult.matched;
        result.expensesCreated = expensesResult.created;
        result.conflictsResolved += expensesResult.conflictsResolved;
      }

      result.totalProcessed = result.holdingsMatched + result.holdingsCreated +
        result.incomesMatched + result.incomesCreated +
        result.expensesMatched + result.expensesCreated;

      // 4. Mark user as reconciled
      await this.markUserAsReconciled(context.userId);

    } catch (error) {
      result.errors.push(error.message);
      console.error('Reconciliation error:', error);
    }

    return result;
  }

  /**
   * Reconcile holdings between manual and Yodlee data
   */
  private async reconcileHoldings(
    userId: string,
    manualHoldings: Holding[],
    yodleeHoldings: any[]
  ): Promise<{ matched: number; created: number; conflictsResolved: number }> {
    let matched = 0;
    let created = 0;
    let conflictsResolved = 0;

    // Track processed Yodlee holdings to avoid duplicates
    const processedYodleeIds = new Set<string>();

    // Find matches for each manual holding
    for (const manualHolding of manualHoldings) {
      const matchResults = await this.duplicateDetector.findHoldingMatches(
        manualHolding,
        yodleeHoldings.filter(yh => !processedYodleeIds.has(yh.id))
      );

      if (matchResults.length > 0) {
        // Take the best match
        const bestMatch = matchResults[0];
        
        // Resolve the conflict
        const decision = await this.conflictResolver.getDefaultDecision(
          manualHolding,
          bestMatch.yodleeData,
          bestMatch.confidence
        );

        await this.applyHoldingDecision(manualHolding, bestMatch.yodleeData, decision);
        
        processedYodleeIds.add(bestMatch.yodleeData.id);
        matched++;
        conflictsResolved++;
      }
    }

    // Create new holdings for unmatched Yodlee data
    for (const yodleeHolding of yodleeHoldings) {
      if (!processedYodleeIds.has(yodleeHolding.id)) {
        await this.createHoldingFromYodlee(userId, yodleeHolding);
        created++;
      }
    }

    return { matched, created, conflictsResolved };
  }

  /**
   * Reconcile income data
   */
  private async reconcileIncomes(
    userId: string,
    manualIncomes: Income[],
    yodleeIncomes: any[]
  ): Promise<{ matched: number; created: number; conflictsResolved: number }> {
    let matched = 0;
    let created = 0;
    let conflictsResolved = 0;

    const processedYodleeIds = new Set<string>();

    // Find matches for each manual income
    for (const manualIncome of manualIncomes) {
      const matchResults = await this.duplicateDetector.findIncomeMatches(
        manualIncome,
        yodleeIncomes.filter(yi => !processedYodleeIds.has(yi.id))
      );

      if (matchResults.length > 0) {
        const bestMatch = matchResults[0];
        
        const decision = await this.conflictResolver.getDefaultIncomeDecision(
          manualIncome,
          bestMatch.yodleeData,
          bestMatch.confidence
        );

        await this.applyIncomeDecision(manualIncome, bestMatch.yodleeData, decision);
        
        processedYodleeIds.add(bestMatch.yodleeData.id);
        matched++;
        conflictsResolved++;
      }
    }

    // Create new incomes for unmatched Yodlee data
    for (const yodleeIncome of yodleeIncomes) {
      if (!processedYodleeIds.has(yodleeIncome.id)) {
        await this.createIncomeFromYodlee(userId, yodleeIncome);
        created++;
      }
    }

    return { matched, created, conflictsResolved };
  }

  /**
   * Reconcile expense data
   */
  private async reconcileExpenses(
    userId: string,
    manualExpenses: Expense[],
    yodleeExpenses: any[]
  ): Promise<{ matched: number; created: number; conflictsResolved: number }> {
    let matched = 0;
    let created = 0;
    let conflictsResolved = 0;

    const processedYodleeIds = new Set<string>();

    // Find matches for each manual expense
    for (const manualExpense of manualExpenses) {
      const matchResults = await this.duplicateDetector.findExpenseMatches(
        manualExpense,
        yodleeExpenses.filter(ye => !processedYodleeIds.has(ye.id))
      );

      if (matchResults.length > 0) {
        const bestMatch = matchResults[0];
        
        const decision = await this.conflictResolver.getDefaultExpenseDecision(
          manualExpense,
          bestMatch.yodleeData,
          bestMatch.confidence
        );

        await this.applyExpenseDecision(manualExpense, bestMatch.yodleeData, decision);
        
        processedYodleeIds.add(bestMatch.yodleeData.id);
        matched++;
        conflictsResolved++;
      }
    }

    // Create new expenses for unmatched Yodlee data
    for (const yodleeExpense of yodleeExpenses) {
      if (!processedYodleeIds.has(yodleeExpense.id)) {
        await this.createExpenseFromYodlee(userId, yodleeExpense);
        created++;
      }
    }

    return { matched, created, conflictsResolved };
  }

  /**
   * Apply holding reconciliation decision
   */
  private async applyHoldingDecision(
    manualHolding: Holding,
    yodleeHolding: any,
    decision: ReconciliationDecision
  ): Promise<void> {
    switch (decision.strategy) {
      case ReconciliationStrategy.KEEP_MANUAL:
        await prisma.holding.update({
          where: { id: manualHolding.id },
          data: {
            isReconciled: true,
            reconciledAt: new Date(),
            yodleeAccountId: yodleeHolding.accountId?.toString(),
            metadata: JSON.stringify({
              reconciliation: {
                strategy: 'KEEP_MANUAL',
                yodleeData: yodleeHolding,
                reconciledAt: new Date(),
              },
            }),
          },
        });
        break;

      case ReconciliationStrategy.REPLACE_WITH_YODLEE:
        await prisma.holding.update({
          where: { id: manualHolding.id },
          data: {
            shares: yodleeHolding.quantity || manualHolding.shares,
            costBasis: yodleeHolding.costBasis?.amount,
            currentPrice: yodleeHolding.price?.amount,
            dataSource: DataSource.YODLEE,
            yodleeAccountId: yodleeHolding.accountId?.toString(),
            lastSyncedAt: new Date(),
            isReconciled: true,
            reconciledAt: new Date(),
            metadata: JSON.stringify({
              reconciliation: {
                strategy: 'REPLACE_WITH_YODLEE',
                originalManualData: {
                  shares: manualHolding.shares,
                  costBasis: manualHolding.costBasis,
                },
                reconciledAt: new Date(),
              },
            }),
          },
        });
        break;

      case ReconciliationStrategy.MERGE_QUANTITIES:
        const combinedShares = (manualHolding.shares || 0) + (yodleeHolding.quantity || 0);
        await prisma.holding.update({
          where: { id: manualHolding.id },
          data: {
            shares: combinedShares,
            currentPrice: yodleeHolding.price?.amount || manualHolding.currentPrice,
            dataSource: DataSource.MERGED,
            yodleeAccountId: yodleeHolding.accountId?.toString(),
            lastSyncedAt: new Date(),
            isReconciled: true,
            reconciledAt: new Date(),
            metadata: JSON.stringify({
              reconciliation: {
                strategy: 'MERGE_QUANTITIES',
                manualShares: manualHolding.shares,
                yodleeShares: yodleeHolding.quantity,
                combinedShares,
                reconciledAt: new Date(),
              },
            }),
          },
        });
        break;

      case ReconciliationStrategy.KEEP_BOTH:
        // Keep manual as-is, create separate Yodlee entry
        await prisma.holding.update({
          where: { id: manualHolding.id },
          data: {
            isReconciled: true,
            reconciledAt: new Date(),
            metadata: JSON.stringify({
              reconciliation: {
                strategy: 'KEEP_BOTH',
                hasYodleeCounterpart: true,
                reconciledAt: new Date(),
              },
            }),
          },
        });
        
        // Create separate Yodlee holding
        await this.createHoldingFromYodlee(manualHolding.portfolio.userId, yodleeHolding);
        break;
    }

    // Log the reconciliation
    await this.logReconciliation(manualHolding.portfolio.userId, 'HOLDING', decision);
  }

  /**
   * Apply income reconciliation decision
   */
  private async applyIncomeDecision(
    manualIncome: Income,
    yodleeIncome: any,
    decision: ReconciliationDecision
  ): Promise<void> {
    switch (decision.strategy) {
      case ReconciliationStrategy.KEEP_MANUAL:
        await prisma.income.update({
          where: { id: manualIncome.id },
          data: {
            isReconciled: true,
            reconciledAt: new Date(),
            yodleeAccountId: yodleeIncome.accountId?.toString(),
            yodleeTransactionId: yodleeIncome.id?.toString(),
          },
        });
        break;

      case ReconciliationStrategy.REPLACE_WITH_YODLEE:
        await prisma.income.update({
          where: { id: manualIncome.id },
          data: {
            amount: Math.abs(yodleeIncome.amount?.amount || manualIncome.amount),
            source: yodleeIncome.merchant?.name || yodleeIncome.description || manualIncome.source,
            date: new Date(yodleeIncome.transactionDate || yodleeIncome.date),
            dataSource: DataSource.YODLEE,
            yodleeAccountId: yodleeIncome.accountId?.toString(),
            yodleeTransactionId: yodleeIncome.id?.toString(),
            lastSyncedAt: new Date(),
            isReconciled: true,
            reconciledAt: new Date(),
          },
        });
        break;

      case ReconciliationStrategy.KEEP_BOTH:
        await prisma.income.update({
          where: { id: manualIncome.id },
          data: {
            isReconciled: true,
            reconciledAt: new Date(),
          },
        });
        
        await this.createIncomeFromYodlee(manualIncome.userId, yodleeIncome);
        break;
    }

    await this.logReconciliation(manualIncome.userId, 'INCOME', decision);
  }

  /**
   * Apply expense reconciliation decision
   */
  private async applyExpenseDecision(
    manualExpense: Expense,
    yodleeExpense: any,
    decision: ReconciliationDecision
  ): Promise<void> {
    switch (decision.strategy) {
      case ReconciliationStrategy.KEEP_MANUAL:
        await prisma.expense.update({
          where: { id: manualExpense.id },
          data: {
            isReconciled: true,
            reconciledAt: new Date(),
            yodleeAccountId: yodleeExpense.accountId?.toString(),
            yodleeTransactionId: yodleeExpense.id?.toString(),
          },
        });
        break;

      case ReconciliationStrategy.REPLACE_WITH_YODLEE:
        await prisma.expense.update({
          where: { id: manualExpense.id },
          data: {
            amount: Math.abs(yodleeExpense.amount?.amount || manualExpense.amount),
            merchant: yodleeExpense.merchant?.name,
            description: yodleeExpense.description,
            date: new Date(yodleeExpense.transactionDate || yodleeExpense.date),
            dataSource: DataSource.YODLEE,
            yodleeAccountId: yodleeExpense.accountId?.toString(),
            yodleeTransactionId: yodleeExpense.id?.toString(),
            lastSyncedAt: new Date(),
            isReconciled: true,
            reconciledAt: new Date(),
          },
        });
        break;

      case ReconciliationStrategy.KEEP_BOTH:
        await prisma.expense.update({
          where: { id: manualExpense.id },
          data: {
            isReconciled: true,
            reconciledAt: new Date(),
          },
        });
        
        await this.createExpenseFromYodlee(manualExpense.userId, yodleeExpense);
        break;
    }

    await this.logReconciliation(manualExpense.userId, 'EXPENSE', decision);
  }

  /**
   * Create holding from Yodlee data
   */
  private async createHoldingFromYodlee(userId: string, yodleeHolding: any): Promise<void> {
    // Get user's default portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (!portfolio) {
      throw new Error('No portfolio found for user');
    }

    const ticker = yodleeHolding.symbol || yodleeHolding.cusipNumber || `UNKNOWN_${yodleeHolding.id}`;

    await prisma.holding.create({
      data: {
        portfolioId: portfolio.id,
        ticker,
        name: yodleeHolding.description || yodleeHolding.securityName || ticker,
        shares: yodleeHolding.quantity || 0,
        costBasis: yodleeHolding.costBasis?.amount,
        currentPrice: yodleeHolding.price?.amount,
        dataSource: DataSource.YODLEE,
        yodleeAccountId: yodleeHolding.accountId?.toString(),
        lastSyncedAt: new Date(),
        isReconciled: true,
        reconciledAt: new Date(),
        sector: this.mapSector(yodleeHolding.securityType),
        metadata: JSON.stringify(yodleeHolding),
      },
    });
  }

  /**
   * Create income from Yodlee data
   */
  private async createIncomeFromYodlee(userId: string, yodleeIncome: any): Promise<void> {
    const amount = Math.abs(yodleeIncome.amount?.amount || 0);
    const date = new Date(yodleeIncome.transactionDate || yodleeIncome.date);
    
    await prisma.income.create({
      data: {
        userId,
        source: yodleeIncome.merchant?.name || yodleeIncome.description || 'Unknown',
        category: this.isDividendTransaction(yodleeIncome) ? 'DIVIDEND' : 'OTHER',
        amount,
        date,
        description: yodleeIncome.description,
        dataSource: DataSource.YODLEE,
        yodleeAccountId: yodleeIncome.accountId?.toString(),
        yodleeTransactionId: yodleeIncome.id?.toString(),
        lastSyncedAt: new Date(),
        isReconciled: true,
        reconciledAt: new Date(),
        metadata: JSON.stringify(yodleeIncome),
      },
    });
  }

  /**
   * Create expense from Yodlee data
   */
  private async createExpenseFromYodlee(userId: string, yodleeExpense: any): Promise<void> {
    const amount = Math.abs(yodleeExpense.amount?.amount || 0);
    const date = new Date(yodleeExpense.transactionDate || yodleeExpense.date);
    
    await prisma.expense.create({
      data: {
        userId,
        category: this.mapExpenseCategory(yodleeExpense.category),
        merchant: yodleeExpense.merchant?.name,
        amount,
        date,
        description: yodleeExpense.description,
        dataSource: DataSource.YODLEE,
        yodleeAccountId: yodleeExpense.accountId?.toString(),
        yodleeTransactionId: yodleeExpense.id?.toString(),
        lastSyncedAt: new Date(),
        isReconciled: true,
        reconciledAt: new Date(),
        metadata: JSON.stringify(yodleeExpense),
      },
    });
  }

  /**
   * Mark user as reconciled
   */
  private async markUserAsReconciled(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastReconciledAt: new Date(),
      },
    });
  }

  /**
   * Log reconciliation decision
   */
  private async logReconciliation(
    userId: string,
    dataType: string,
    decision: ReconciliationDecision
  ): Promise<void> {
    await prisma.reconciliationLog.create({
      data: {
        userId,
        dataType,
        strategy: decision.strategy,
        confidence: decision.confidence,
        reason: decision.reason,
        appliedAt: new Date(),
        metadata: JSON.stringify(decision.metadata),
      },
    });
  }

  /**
   * Helper methods
   */
  private mapSector(securityType: string): string {
    const sectorMap: Record<string, string> = {
      'EQUITY': 'Technology',
      'ETF': 'Diversified',
      'MUTUAL_FUND': 'Diversified',
      'BOND': 'Fixed Income',
      'CD': 'Fixed Income',
      'OPTION': 'Derivatives',
    };
    return sectorMap[securityType] || 'Other';
  }

  private isDividendTransaction(transaction: any): boolean {
    const description = (transaction.description || '').toLowerCase();
    const category = (transaction.category || '').toLowerCase();
    
    return (
      description.includes('dividend') ||
      description.includes('div') ||
      category.includes('dividend') ||
      transaction.subType === 'DIVIDEND'
    );
  }

  private mapExpenseCategory(yodleeCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Food and Dining': 'FOOD',
      'Bills & Utilities': 'UTILITIES',
      'Shopping': 'ENTERTAINMENT',
      'Transportation': 'TRANSPORTATION',
      'Healthcare': 'HEALTHCARE',
      'Insurance': 'INSURANCE',
      'Home': 'RENT',
    };
    return categoryMap[yodleeCategory] || 'OTHER';
  }

  /**
   * Get reconciliation status for user
   */
  async getReconciliationStatus(userId: string): Promise<{
    isReconciled: boolean;
    lastReconciledAt?: Date;
    pendingItems: number;
    totalItems: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastReconciledAt: true },
    });

    // Count unreconciled items
    const [unreconciledHoldings, unreconciledIncomes, unreconciledExpenses] = await Promise.all([
      prisma.holding.count({
        where: {
          portfolio: { userId },
          isReconciled: false,
          dataSource: DataSource.MANUAL,
        },
      }),
      prisma.income.count({
        where: {
          userId,
          isReconciled: false,
          dataSource: DataSource.MANUAL,
        },
      }),
      prisma.expense.count({
        where: {
          userId,
          isReconciled: false,
          dataSource: DataSource.MANUAL,
        },
      }),
    ]);

    const [totalHoldings, totalIncomes, totalExpenses] = await Promise.all([
      prisma.holding.count({
        where: { portfolio: { userId } },
      }),
      prisma.income.count({
        where: { userId },
      }),
      prisma.expense.count({
        where: { userId },
      }),
    ]);

    const pendingItems = unreconciledHoldings + unreconciledIncomes + unreconciledExpenses;
    const totalItems = totalHoldings + totalIncomes + totalExpenses;

    return {
      isReconciled: pendingItems === 0 && !!user?.lastReconciledAt,
      lastReconciledAt: user?.lastReconciledAt || undefined,
      pendingItems,
      totalItems,
    };
  }
}

// Export singleton instance
export const dataReconciler = new DataReconciler();