'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RequireGuest } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  
  // Check LOCAL_MODE and redirect to Super Cards if enabled
  useEffect(() => {
    const isLocalMode = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true';
    if (isLocalMode) {
      // In LOCAL_MODE, go directly to Super Cards
      router.replace('/dashboard/super-cards');
    }
  }, [router]);
  
  // Show loading while redirecting in LOCAL_MODE
  const isLocalMode = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true';
  if (isLocalMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="glass backdrop-blur-xl bg-white/10 shadow-2xl rounded-3xl px-8 py-10 border border-white/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Development Mode</h2>
              <p className="text-slate-200 mt-2">Redirecting to dashboard...</p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              </div>
              <div className="mt-4 text-xs text-slate-300">
                <p>If not redirected, <a href="/dashboard" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">click here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-16 w-16 h-16 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        <LoginForm />
      </div>
    </RequireGuest>
  );
}