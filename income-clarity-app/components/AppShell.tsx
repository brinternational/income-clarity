'use client';

import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}