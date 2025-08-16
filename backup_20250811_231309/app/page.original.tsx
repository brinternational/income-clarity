'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  ChartBar, 
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if LOCAL_MODE for quick access
  const isLocalMode = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'

  const features = [
    {
      icon: TrendingUp,
      title: 'Beat the Market',
      description: 'Daily SPY comparison to validate your strategy',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: 'Income Clarity',
      description: 'See your NET income after taxes and expenses',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Tax Intelligence',
      description: 'Location-aware tax optimization (PR = 0% tax)',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ChartBar,
      title: 'Milestone Tracking',
      description: 'Gamified progress from utilities to freedom',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const benefits = [
    'Real-time portfolio tracking',
    'Tax-optimized strategies',
    'Dividend income projections',
    'FIRE progress monitoring',
    'Mobile-first design',
    'Bank-level security'
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Income Clarity</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isLocalMode && (
                <Link 
                  href="/super-cards"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <Link 
                href={'/auth' + '/login'}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              {isLocalMode && (
                <Link 
                  href="/super-cards"
                  className="block px-3 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <Link 
                href={'/auth' + '/login'}
                className="block px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="block px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Live Off Your
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Portfolio Income
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
          >
            The only dividend tracker that shows your NET income after taxes,
            with daily SPY validation and location-aware tax optimization.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </Link>
            <Link 
              href={isLocalMode ? "/super-cards" : "/demo"}
              className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-slate-400 text-sm"
          >
            <span className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              14-day free trial
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Cancel anytime
            </span>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Everything You Need for
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              Dividend Income Success
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Why Choose Income Clarity?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center space-x-3 bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-slate-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              Dividend Income?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of investors who are already living off their portfolios.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started Today
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2025 Income Clarity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}