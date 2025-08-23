'use client';

import React from 'react';
import { SidebarNavigation } from './navigation/SidebarNavigation';

interface SidebarAppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function SidebarAppShell({ children, title }: SidebarAppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarNavigation>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content area with proper spacing */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </SidebarNavigation>
    </div>
  );
}