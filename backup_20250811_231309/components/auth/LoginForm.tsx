'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Github, Chrome, Apple } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/super-cards' }: LoginFormProps) {
  const router = useRouter();
  const { signIn, signUp, signInWithMagicLink, signInWithProvider, loading, error } = useAuthContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic-link'>('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (loginMethod === 'magic-link') {
        const result = await signInWithMagicLink(formData.email);
        
        if (result.success) {
          setSuccessMessage('Magic link sent! Check your email and click the link to sign in.');
        } else {
          setErrorMessage(result.error?.message || 'Failed to send magic link');
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        
        if (result.success) {
          router.push(redirectTo);
        } else {
          setErrorMessage(result.error?.message || 'Failed to sign in');
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      // console.error('Login error:', err);
    // } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'github' | 'apple') => {
    setErrorMessage('');
    
    try {
      const result = await signInWithProvider(provider);
      
      if (!result.success && result.error) {
        setErrorMessage(result.error.message || `Failed to sign in with ${provider}`);
      }
      // Note: OAuth redirects happen automatically, so no need to handle success case
    } catch (err) {
      setErrorMessage(`An error occurred during ${provider} sign in`);
      // console.error(`${provider} login error:`, err);
    }
  };

  const isFormValid = formData.email && (loginMethod === 'magic-link' || formData.password);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass backdrop-blur-xl bg-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl mb-4 shadow-2xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Welcome back
          </h2>
          <p className="text-slate-200">
            Sign in to your Income Clarity account
          </p>
        </div>

        {/* Login method toggle */}
        <div className="flex rounded-lg bg-white/10 backdrop-blur-sm p-1 mb-6 border border-white/20">
          <button
            type="button"
            onClick={() => setLoginMethod('password')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
              loginMethod === 'password'
                ? 'bg-white/20 backdrop-blur-sm text-emerald-400 shadow-lg border border-white/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('magic-link')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
              loginMethod === 'magic-link'
                ? 'bg-white/20 backdrop-blur-sm text-emerald-400 shadow-lg border border-white/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Error message */}
        {(errorMessage || error) && (
          <div className="mb-4 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-300">
              {errorMessage || error?.message}
            </p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-300">
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-300 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password field - only show for password login */}
          {loginMethod === 'password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-300 transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword(prev => !prev);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded-sm transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {loginMethod === 'magic-link' ? 'Sending link...' : 'Signing in...'}
              </div>
            ) : (
              <>Sign in {loginMethod === 'magic-link' && 'with magic link'}</>
            )}
          </button>
        </form>

        {/* Forgot password link - only show for password login */}
        {loginMethod === 'password' && (
          <div className="text-center mt-4">
            <a
              href="/auth/forgot-password"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        )}

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-slate-300">Or continue with</span>
            </div>
          </div>
        </div>

        {/* OAuth providers */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleProviderLogin('google')}
            className="flex justify-center items-center py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <Chrome className="w-5 h-5 text-slate-300" />
          </button>
          <button
            type="button"
            onClick={() => handleProviderLogin('github')}
            className="flex justify-center items-center py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <Github className="w-5 h-5 text-slate-300" />
          </button>
          <button
            type="button"
            onClick={() => handleProviderLogin('apple')}
            className="flex justify-center items-center py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <Apple className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Sign up link */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-300">
            Don't have an account?{' '}
            <a
              href="/auth/signup"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Demo login button */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <button
            type="button"
            onClick={() => {
              // Navigate to demo dashboard that doesn't require auth
              router.push('/dashboard/demo');
            }}
            disabled={isSubmitting || loading}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] shadow-lg"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting up demo...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Try Demo Account
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            Click to instantly login with sample data
          </p>
        </div>
      </div>
    </div>
  );
}