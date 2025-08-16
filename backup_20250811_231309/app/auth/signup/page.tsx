'use client';

import { RequireGuest } from '@/contexts/AuthContext';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-16 w-16 h-16 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <SignupForm redirectTo="/onboarding" />
      </div>
    </RequireGuest>
  );
}