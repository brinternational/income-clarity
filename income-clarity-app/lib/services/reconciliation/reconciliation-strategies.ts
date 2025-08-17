/**
 * Reconciliation Strategies
 * Defines strategy patterns and execution logic for data reconciliation
 */

import { DataSource } from '@prisma/client';
import { MatchConfidence } from './duplicate-detector.service';
import { ReconciliationStrategy } from './conflict-resolver.service';

export interface StrategyContext {
  confidence: MatchConfidence;
  conflictSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  dataAge: 'RECENT' | 'OLD';
  userPreference?: 'MANUAL_PRIORITY' | 'BANK_PRIORITY' | 'MERGE_PRIORITY';
}

export interface StrategyExecution {
  strategy: ReconciliationStrategy;
  priority: number;
  reasoning: string;
  safeguards: string[];
  reversible: boolean;
}

export interface HoldingStrategyData {
  manualShares: number;
  yodleeShares: number;
  manualCostBasis?: number;
  yodleeCostBasis?: number;
  manualPrice?: number;
  yodleePrice?: number;
}

export interface TransactionStrategyData {
  manualAmount: number;
  yodleeAmount: number;
  manualDate: Date;
  yodleeDate: Date;
  manualDescription?: string;
  yodleeDescription?: string;
}

/**
 * Strategy Pattern Implementation for Reconciliation
 */
export abstract class BaseReconciliationStrategy {
  abstract execute(data: any, context: StrategyContext): Promise<any>;
  abstract canExecute(data: any, context: StrategyContext): boolean;
  abstract getRisk(): 'LOW' | 'MEDIUM' | 'HIGH';
  abstract isReversible(): boolean;
  abstract getDescription(): string;
}

/**
 * Keep Manual Data Strategy
 */
export class KeepManualStrategy extends BaseReconciliationStrategy {
  async execute(data: any, context: StrategyContext): Promise<any> {
    return {
      action: 'PRESERVE_MANUAL',
      updateFields: {
        isReconciled: true,
        reconciledAt: new Date(),
        yodleeAccountId: data.yodleeAccountId,
        metadata: JSON.stringify({
          reconciliation: {
            strategy: ReconciliationStrategy.KEEP_MANUAL,
            yodleeDataAvailable: true,
            reconciledAt: new Date(),
            confidence: context.confidence,
            reasoning: 'Manual data preserved due to user preference or data quality concerns',
          },
        }),
      },
    };
  }

  canExecute(data: any, context: StrategyContext): boolean {
    // Can always keep manual data
    return true;
  }

  getRisk(): 'LOW' | 'MEDIUM' | 'HIGH' {
    return 'LOW'; // Safe to keep existing data
  }

  isReversible(): boolean {
    return true; // Can always switch to bank data later
  }

  getDescription(): string {
    return 'Preserves your manually entered data while marking it as reconciled with bank data';
  }
}

/**
 * Replace with Yodlee Data Strategy
 */
export class ReplaceWithYodleeStrategy extends BaseReconciliationStrategy {
  async execute(data: HoldingStrategyData | TransactionStrategyData, context: StrategyContext): Promise<any> {
    if ('manualShares' in data) {
      // Holding data
      return {
        action: 'REPLACE_WITH_BANK',
        updateFields: {
          shares: data.yodleeShares,
          costBasis: data.yodleeCostBasis,
          currentPrice: data.yodleePrice,
          dataSource: DataSource.YODLEE,
          lastSyncedAt: new Date(),
          isReconciled: true,
          reconciledAt: new Date(),
          metadata: JSON.stringify({
            reconciliation: {
              strategy: ReconciliationStrategy.REPLACE_WITH_YODLEE,
              originalManualData: {
                shares: data.manualShares,
                costBasis: data.manualCostBasis,
                currentPrice: data.manualPrice,
              },
              reconciledAt: new Date(),
              confidence: context.confidence,
              reasoning: 'Replaced with bank data for accuracy and real-time updates',
            },
          }),
        },
      };
    } else {
      // Transaction data
      return {
        action: 'REPLACE_WITH_BANK',
        updateFields: {
          amount: data.yodleeAmount,
          date: data.yodleeDate,
          description: data.yodleeDescription,
          dataSource: DataSource.YODLEE,
          lastSyncedAt: new Date(),
          isReconciled: true,
          reconciledAt: new Date(),
          metadata: JSON.stringify({
            reconciliation: {
              strategy: ReconciliationStrategy.REPLACE_WITH_YODLEE,
              originalManualData: {
                amount: data.manualAmount,
                date: data.manualDate,
                description: data.manualDescription,
              },
              reconciledAt: new Date(),
              confidence: context.confidence,
              reasoning: 'Replaced with bank data for accuracy',
            },
          }),
        },
      };
    }
  }

  canExecute(data: any, context: StrategyContext): boolean {
    // Should have high confidence or specific conflicts
    return context.confidence === MatchConfidence.HIGH || 
           context.conflictSeverity === 'LOW';
  }

  getRisk(): 'LOW' | 'MEDIUM' | 'HIGH' {
    return 'MEDIUM'; // Overwrites user data
  }

  isReversible(): boolean {
    return true; // Original data stored in metadata
  }

  getDescription(): string {
    return 'Replaces your manual data with bank data for accuracy, while preserving the original values';
  }
}

/**
 * Merge Quantities Strategy (Holdings Only)
 */
export class MergeQuantitiesStrategy extends BaseReconciliationStrategy {
  async execute(data: HoldingStrategyData, context: StrategyContext): Promise<any> {
    const combinedShares = (data.manualShares || 0) + (data.yodleeShares || 0);
    
    // Use weighted average for cost basis if both exist
    let combinedCostBasis = data.manualCostBasis || data.yodleeCostBasis;
    if (data.manualCostBasis && data.yodleeCostBasis) {
      const manualWeight = data.manualShares / combinedShares;
      const yodleeWeight = data.yodleeShares / combinedShares;
      combinedCostBasis = (data.manualCostBasis * manualWeight) + (data.yodleeCostBasis * yodleeWeight);
    }

    return {
      action: 'MERGE_QUANTITIES',
      updateFields: {
        shares: combinedShares,
        costBasis: combinedCostBasis,
        currentPrice: data.yodleePrice || data.manualPrice, // Prefer Yodlee price (more current)
        dataSource: DataSource.MERGED,
        lastSyncedAt: new Date(),
        isReconciled: true,
        reconciledAt: new Date(),
        metadata: JSON.stringify({
          reconciliation: {
            strategy: ReconciliationStrategy.MERGE_QUANTITIES,
            manualShares: data.manualShares,
            yodleeShares: data.yodleeShares,
            combinedShares,
            costBasisCalculation: {
              manual: data.manualCostBasis,
              yodlee: data.yodleeCostBasis,
              combined: combinedCostBasis,
              method: 'weighted_average',
            },
            reconciledAt: new Date(),
            confidence: context.confidence,
            reasoning: 'Combined holdings from manual entry and bank data',
          },
        }),
      },
    };
  }

  canExecute(data: any, context: StrategyContext): boolean {
    // Only for holdings with reasonable quantities
    if (!('manualShares' in data)) return false;
    
    const manual = data.manualShares || 0;
    const yodlee = data.yodleeShares || 0;
    
    // Both should have positive quantities
    return manual > 0 && yodlee > 0 && context.confidence >= MatchConfidence.MEDIUM;
  }

  getRisk(): 'LOW' | 'MEDIUM' | 'HIGH' {
    return 'MEDIUM'; // Creates new combined data
  }

  isReversible(): boolean {
    return true; // Can split back to original components
  }

  getDescription(): string {
    return 'Combines share quantities from both manual and bank data, useful for partial positions';
  }
}

/**
 * Keep Both Entries Strategy
 */
export class KeepBothStrategy extends BaseReconciliationStrategy {
  async execute(data: any, context: StrategyContext): Promise<any> {
    return {
      action: 'KEEP_SEPARATE',
      manualUpdate: {
        isReconciled: true,
        reconciledAt: new Date(),
        metadata: JSON.stringify({
          reconciliation: {
            strategy: ReconciliationStrategy.KEEP_BOTH,
            hasYodleeCounterpart: true,
            conflictSeverity: context.conflictSeverity,
            reconciledAt: new Date(),
            confidence: context.confidence,
            reasoning: 'Significant conflicts detected - keeping both entries for manual review',
          },
        }),
      },
      createYodleeEntry: true,
    };
  }

  canExecute(data: any, context: StrategyContext): boolean {
    // Use when confidence is low or conflicts are high
    return context.confidence === MatchConfidence.LOW || 
           context.conflictSeverity === 'HIGH';
  }

  getRisk(): 'LOW' | 'MEDIUM' | 'HIGH' {
    return 'LOW'; // Preserves all data
  }

  isReversible(): boolean {
    return true; // Can merge or delete later
  }

  getDescription(): string {
    return 'Keeps both manual and bank entries separately when conflicts are too significant to merge';
  }
}

/**
 * Strategy Factory for selecting the best reconciliation approach
 */
export class ReconciliationStrategyFactory {
  private strategies: Map<ReconciliationStrategy, BaseReconciliationStrategy>;

  constructor() {
    this.strategies = new Map([
      [ReconciliationStrategy.KEEP_MANUAL, new KeepManualStrategy()],
      [ReconciliationStrategy.REPLACE_WITH_YODLEE, new ReplaceWithYodleeStrategy()],
      [ReconciliationStrategy.MERGE_QUANTITIES, new MergeQuantitiesStrategy()],
      [ReconciliationStrategy.KEEP_BOTH, new KeepBothStrategy()],
    ]);
  }

  /**
   * Get the best strategy for given context
   */
  getBestStrategy(
    data: any,
    context: StrategyContext
  ): { strategy: ReconciliationStrategy; execution: StrategyExecution } | null {
    const candidates = this.evaluateStrategies(data, context);
    
    if (candidates.length === 0) {
      return null;
    }

    // Sort by priority (highest first)
    candidates.sort((a, b) => b.execution.priority - a.execution.priority);
    
    return candidates[0];
  }

  /**
   * Evaluate all strategies for given context
   */
  private evaluateStrategies(
    data: any,
    context: StrategyContext
  ): Array<{ strategy: ReconciliationStrategy; execution: StrategyExecution }> {
    const candidates = [];

    for (const [strategyType, strategyImpl] of this.strategies) {
      if (strategyImpl.canExecute(data, context)) {
        const execution: StrategyExecution = {
          strategy: strategyType,
          priority: this.calculatePriority(strategyType, context),
          reasoning: this.generateReasoning(strategyType, context),
          safeguards: this.getSafeguards(strategyType),
          reversible: strategyImpl.isReversible(),
        };

        candidates.push({ strategy: strategyType, execution });
      }
    }

    return candidates;
  }

  /**
   * Calculate strategy priority based on context
   */
  private calculatePriority(strategy: ReconciliationStrategy, context: StrategyContext): number {
    let priority = 0;

    // Base priorities
    const basePriorities = {
      [ReconciliationStrategy.REPLACE_WITH_YODLEE]: 100,
      [ReconciliationStrategy.MERGE_QUANTITIES]: 90,
      [ReconciliationStrategy.KEEP_MANUAL]: 80,
      [ReconciliationStrategy.KEEP_BOTH]: 70,
    };

    priority = basePriorities[strategy];

    // Confidence adjustments
    if (context.confidence === MatchConfidence.HIGH) {
      if (strategy === ReconciliationStrategy.REPLACE_WITH_YODLEE) priority += 20;
      if (strategy === ReconciliationStrategy.MERGE_QUANTITIES) priority += 15;
    } else if (context.confidence === MatchConfidence.LOW) {
      if (strategy === ReconciliationStrategy.KEEP_BOTH) priority += 30;
      if (strategy === ReconciliationStrategy.KEEP_MANUAL) priority += 20;
    }

    // Conflict severity adjustments
    if (context.conflictSeverity === 'HIGH') {
      if (strategy === ReconciliationStrategy.KEEP_BOTH) priority += 25;
    } else if (context.conflictSeverity === 'LOW') {
      if (strategy === ReconciliationStrategy.REPLACE_WITH_YODLEE) priority += 15;
    }

    // User preference adjustments
    if (context.userPreference === 'MANUAL_PRIORITY') {
      if (strategy === ReconciliationStrategy.KEEP_MANUAL) priority += 30;
    } else if (context.userPreference === 'BANK_PRIORITY') {
      if (strategy === ReconciliationStrategy.REPLACE_WITH_YODLEE) priority += 30;
    } else if (context.userPreference === 'MERGE_PRIORITY') {
      if (strategy === ReconciliationStrategy.MERGE_QUANTITIES) priority += 30;
    }

    return priority;
  }

  /**
   * Generate reasoning for strategy selection
   */
  private generateReasoning(strategy: ReconciliationStrategy, context: StrategyContext): string {
    const confidence = context.confidence.toLowerCase();
    const conflicts = context.conflictSeverity.toLowerCase();

    const reasonings = {
      [ReconciliationStrategy.KEEP_MANUAL]: 
        `Preserving manual data due to ${conflicts} conflicts or user preference. Confidence: ${confidence}.`,
      
      [ReconciliationStrategy.REPLACE_WITH_YODLEE]: 
        `Using bank data for accuracy and real-time updates. Confidence: ${confidence}, conflicts: ${conflicts}.`,
      
      [ReconciliationStrategy.MERGE_QUANTITIES]: 
        `Combining both data sources for complete picture. Match confidence: ${confidence}.`,
      
      [ReconciliationStrategy.KEEP_BOTH]: 
        `Preserving both entries due to ${conflicts} conflicts or ${confidence} confidence. Manual review recommended.`,
    };

    return reasonings[strategy] || 'Default strategy selected';
  }

  /**
   * Get safeguards for strategy execution
   */
  private getSafeguards(strategy: ReconciliationStrategy): string[] {
    const safeguards = {
      [ReconciliationStrategy.KEEP_MANUAL]: [
        'Original data preserved',
        'Bank relationship maintained',
        'Can switch to bank data later',
      ],
      
      [ReconciliationStrategy.REPLACE_WITH_YODLEE]: [
        'Original manual data stored in metadata',
        'Change is reversible',
        'Bank data validation performed',
      ],
      
      [ReconciliationStrategy.MERGE_QUANTITIES]: [
        'Original quantities stored separately',
        'Weighted average calculations documented',
        'Can split back to original components',
      ],
      
      [ReconciliationStrategy.KEEP_BOTH]: [
        'No data loss - both entries preserved',
        'Can merge manually later',
        'Clear labeling for user identification',
      ],
    };

    return safeguards[strategy] || [];
  }

  /**
   * Execute selected strategy
   */
  async executeStrategy(
    strategy: ReconciliationStrategy,
    data: any,
    context: StrategyContext
  ): Promise<any> {
    const strategyImpl = this.strategies.get(strategy);
    
    if (!strategyImpl) {
      throw new Error(`Strategy ${strategy} not found`);
    }

    if (!strategyImpl.canExecute(data, context)) {
      throw new Error(`Strategy ${strategy} cannot be executed in current context`);
    }

    return await strategyImpl.execute(data, context);
  }

  /**
   * Get strategy description
   */
  getStrategyDescription(strategy: ReconciliationStrategy): string {
    const strategyImpl = this.strategies.get(strategy);
    return strategyImpl?.getDescription() || 'Unknown strategy';
  }

  /**
   * Check if strategy is reversible
   */
  isStrategyReversible(strategy: ReconciliationStrategy): boolean {
    const strategyImpl = this.strategies.get(strategy);
    return strategyImpl?.isReversible() || false;
  }

  /**
   * Get all available strategies
   */
  getAvailableStrategies(): ReconciliationStrategy[] {
    return Array.from(this.strategies.keys());
  }
}

// Export singleton instance
export const strategyFactory = new ReconciliationStrategyFactory();

// Export strategy descriptions for UI
export const STRATEGY_DESCRIPTIONS = {
  [ReconciliationStrategy.KEEP_MANUAL]: {
    title: 'Keep Manual Data',
    description: 'Preserve your manually entered information',
    icon: '✋',
    risk: 'LOW',
    reversible: true,
  },
  [ReconciliationStrategy.REPLACE_WITH_YODLEE]: {
    title: 'Use Bank Data',
    description: 'Replace with accurate bank information',
    icon: '🏦',
    risk: 'MEDIUM',
    reversible: true,
  },
  [ReconciliationStrategy.MERGE_QUANTITIES]: {
    title: 'Merge Both',
    description: 'Combine quantities from both sources',
    icon: '🔗',
    risk: 'MEDIUM',
    reversible: true,
  },
  [ReconciliationStrategy.KEEP_BOTH]: {
    title: 'Keep Separate',
    description: 'Maintain both entries for manual review',
    icon: '📋',
    risk: 'LOW',
    reversible: true,
  },
} as const;