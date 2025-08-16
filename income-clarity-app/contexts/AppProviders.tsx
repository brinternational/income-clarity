'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LoadingProvider>
      <AuthProvider>
        <NotificationProvider>
          <DataPersistenceProvider>
            <ExpenseProvider>
              <PortfolioProvider>
                <UserProfileProvider>
                  {children}
                </UserProfileProvider>
              </PortfolioProvider>
            </ExpenseProvider>
          </DataPersistenceProvider>
        </NotificationProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}