'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface ExpenseContextType {
  expenses: any[];
  totalMonthlyExpenses: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const expenses: any[] = [];
  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  return (
    <ExpenseContext.Provider value={{ expenses, totalMonthlyExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}

// Alias for backward compatibility
export const useExpense = useExpenses;