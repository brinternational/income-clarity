import { Logger } from '@/lib/logger';
import type { 
  YodleeTransaction, 
  YodleeAccount, 
  YodleeHolding 
} from './yodlee-client.service';

const logger = new Logger('YodleeDataMapper');

export interface MappedTransaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  category: string;
  type: 'income' | 'expense';
  accountId: string;
  merchantName?: string;
}

export interface MappedHolding {
  ticker: string;
  shares: number;
  costBasis?: number;
  currentPrice: number;
  currentValue: number;
  accountId: string;
  name: string;
}

export interface MappedAccount {
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit' | 'other';
  balance: number;
  currency: string;
  lastUpdated: Date;
  yodleeAccountId: string;
}

export class YodleeDataMapper {
  /**
   * Map Yodlee account type to our internal type
   */
  private mapAccountType(yodleeType: string): MappedAccount['type'] {
    const typeMap: Record<string, MappedAccount['type']> = {
      'CHECKING': 'checking',
      'SAVINGS': 'savings',
      'INVESTMENT': 'investment',
      'CREDIT_CARD': 'credit',
      'BROKERAGE': 'investment',
      'IRA': 'investment',
      '401K': 'investment',
      'ROTH_IRA': 'investment',
    };

    return typeMap[yodleeType] || 'other';
  }

  /**
   * Map Yodlee category to our simplified categories
   */
  private mapCategory(categories: string[]): string {
    if (!categories || categories.length === 0) return 'Other';

    // Take the most specific (last) category
    const category = categories[categories.length - 1];
    
    // Map to our simplified categories
    const categoryMap: Record<string, string> = {
      'Groceries': 'Food & Dining',
      'Restaurants': 'Food & Dining',
      'Fast Food': 'Food & Dining',
      'Coffee Shops': 'Food & Dining',
      'Gas & Fuel': 'Transportation',
      'Auto & Transport': 'Transportation',
      'Public Transportation': 'Transportation',
      'Mortgage & Rent': 'Housing',
      'Home Services': 'Housing',
      'Utilities': 'Housing',
      'Shopping': 'Shopping',
      'Clothing': 'Shopping',
      'Electronics': 'Shopping',
      'Entertainment': 'Entertainment',
      'Movies & DVDs': 'Entertainment',
      'Music': 'Entertainment',
      'Healthcare': 'Healthcare',
      'Pharmacy': 'Healthcare',
      'Doctor': 'Healthcare',
      'Income': 'Income',
      'Salary': 'Income',
      'Investment Income': 'Investment',
      'Dividend': 'Investment',
      'Interest Income': 'Investment',
      'Transfer': 'Transfer',
      'Deposit': 'Transfer',
      'Withdrawal': 'Transfer',
    };

    // Find matching category
    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'Other';
  }

  /**
   * Map Yodlee transactions to Income Clarity format
   */
  mapTransactions(yodleeTransactions: YodleeTransaction[]): MappedTransaction[] {
    return yodleeTransactions.map(tx => {
      const mappedTransaction: MappedTransaction = {
        id: tx.id,
        amount: Math.abs(tx.amount.amount),
        date: new Date(tx.transactionDate),
        description: tx.description.simple || tx.description.original,
        category: this.mapCategory(tx.category),
        type: tx.baseType === 'CREDIT' ? 'income' : 'expense',
        accountId: tx.accountId,
        merchantName: tx.merchantName,
      };

      logger.debug(`Mapped transaction: ${tx.description.original} -> ${mappedTransaction.category}`);
      return mappedTransaction;
    });
  }

  /**
   * Map investment holdings to Income Clarity format
   */
  mapHoldings(yodleeHoldings: YodleeHolding[]): MappedHolding[] {
    return yodleeHoldings.map(holding => {
      const mappedHolding: MappedHolding = {
        ticker: holding.symbol,
        shares: holding.quantity,
        costBasis: holding.costBasis,
        currentPrice: holding.price,
        currentValue: holding.value,
        accountId: holding.accountId,
        name: holding.description,
      };

      logger.debug(`Mapped holding: ${holding.symbol} - ${holding.quantity} shares`);
      return mappedHolding;
    });
  }

  /**
   * Map account balances to Income Clarity format
   */
  mapAccounts(yodleeAccounts: YodleeAccount[]): MappedAccount[] {
    return yodleeAccounts.map(account => {
      const mappedAccount: MappedAccount = {
        name: account.accountName,
        type: this.mapAccountType(account.accountType),
        balance: account.balance.amount,
        currency: account.balance.currency,
        lastUpdated: new Date(account.lastUpdated),
        yodleeAccountId: account.id,
      };

      logger.debug(`Mapped account: ${account.accountName} (${account.accountType}) - ${account.balance.amount}`);
      return mappedAccount;
    });
  }

  /**
   * Categorize transactions for Income Intelligence
   */
  categorizeIncome(transactions: MappedTransaction[]): {
    salary: number;
    dividends: number;
    interest: number;
    other: number;
  } {
    const income = transactions.filter(t => t.type === 'income');
    
    const categorized = {
      salary: 0,
      dividends: 0,
      interest: 0,
      other: 0,
    };

    income.forEach(transaction => {
      const desc = transaction.description.toLowerCase();
      
      if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wages')) {
        categorized.salary += transaction.amount;
      } else if (desc.includes('dividend') || desc.includes('div')) {
        categorized.dividends += transaction.amount;
      } else if (desc.includes('interest')) {
        categorized.interest += transaction.amount;
      } else {
        categorized.other += transaction.amount;
      }
    });

    logger.info(`Categorized income: Salary=${categorized.salary}, Dividends=${categorized.dividends}, Interest=${categorized.interest}, Other=${categorized.other}`);
    return categorized;
  }

  /**
   * Categorize expenses for spending analysis
   */
  categorizeExpenses(transactions: MappedTransaction[]): Record<string, number> {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categorized: Record<string, number> = {};

    expenses.forEach(transaction => {
      if (!categorized[transaction.category]) {
        categorized[transaction.category] = 0;
      }
      categorized[transaction.category] += transaction.amount;
    });

    logger.info(`Categorized ${Object.keys(categorized).length} expense categories`);
    return categorized;
  }

  /**
   * Calculate portfolio metrics from holdings
   */
  calculatePortfolioMetrics(holdings: MappedHolding[]): {
    totalValue: number;
    totalCost: number;
    totalGain: number;
    gainPercent: number;
    byTicker: Record<string, {
      value: number;
      shares: number;
      price: number;
    }>;
  } {
    let totalValue = 0;
    let totalCost = 0;
    const byTicker: Record<string, any> = {};

    holdings.forEach(holding => {
      totalValue += holding.currentValue;
      
      if (holding.costBasis) {
        totalCost += holding.costBasis;
      }

      if (!byTicker[holding.ticker]) {
        byTicker[holding.ticker] = {
          value: 0,
          shares: 0,
          price: holding.currentPrice,
        };
      }

      byTicker[holding.ticker].value += holding.currentValue;
      byTicker[holding.ticker].shares += holding.shares;
    });

    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    logger.info(`Portfolio metrics: Value=${totalValue}, Cost=${totalCost}, Gain=${totalGain} (${gainPercent.toFixed(2)}%)`);

    return {
      totalValue,
      totalCost,
      totalGain,
      gainPercent,
      byTicker,
    };
  }

  /**
   * Extract dividend transactions
   */
  extractDividends(transactions: MappedTransaction[]): {
    date: Date;
    amount: number;
    ticker?: string;
  }[] {
    const dividends = transactions.filter(t => {
      const desc = t.description.toLowerCase();
      return t.type === 'income' && (
        desc.includes('dividend') ||
        desc.includes('div') ||
        t.category === 'Investment'
      );
    });

    return dividends.map(dividend => {
      // Try to extract ticker from description
      const tickerMatch = dividend.description.match(/\b[A-Z]{1,5}\b/);
      
      return {
        date: dividend.date,
        amount: dividend.amount,
        ticker: tickerMatch ? tickerMatch[0] : undefined,
      };
    });
  }
}

// Export singleton instance
export const yodleeDataMapper = new YodleeDataMapper();