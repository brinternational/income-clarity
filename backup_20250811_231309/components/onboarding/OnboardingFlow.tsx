'use client'

/**
 * Enhanced Onboarding Flow - Comprehensive user onboarding experience
 * Implements ONBOARD-001: User Registration Flow with progress tracking
 * 
 * Multi-step registration with progressive data collection and smart defaults
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Star,
  Trophy,
  Target,
  Sparkles,
  MapPin,
  DollarSign,
  PieChart,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { demoMode } from '@/lib/demo-mode'
import { smartDefaults } from '@/lib/smart-defaults'
import { personalizationEngine } from '@/lib/personalization'
import { useUserActions } from '@/store/userStore'
import type { User } from '@/types'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  estimatedTime: string
  optional?: boolean
}

interface OnboardingData {
  // Personal Info
  fullName: string
  email: string
  location: string
  age?: number
  
  // Investment Profile  
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  investmentTimeframe: string
  
  // Financial Goals
  monthlyExpenses: number
  stressFreeLiving: number
  retirementGoal?: number
  currentSavings?: number
  monthlyContribution?: number
  
  // Portfolio Setup
  portfolioName: string
  startWithDemo: boolean
  importMethod?: 'demo' | 'csv' | 'manual' | 'later'
  
  // Preferences
  notifications: boolean
  weeklyReports: boolean
  celebrateAchievements: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

export default function OnboardingFlow() {
  const router = useRouter()
  const { setUser, saveToStorage } = useUserActions()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    location: 'California',
    riskTolerance: 'moderate',
    experienceLevel: 'intermediate',
    investmentTimeframe: '5-10 years',
    monthlyExpenses: 3800,
    stressFreeLiving: 5000,
    portfolioName: 'My Investment Portfolio',
    startWithDemo: false,
    notifications: true,
    weeklyReports: true,
    celebrateAchievements: true
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Income Clarity',
      subtitle: 'Your dividend income lifestyle awaits',
      description: 'Take control of your dividend investments and track your progress toward financial independence.',
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      estimatedTime: '1 min'
    },
    {
      id: 'profile',
      title: 'Your Investment Profile',
      subtitle: 'Help us personalize your experience',
      description: 'Tell us about your background and investment style so we can provide relevant insights.',
      icon: <Shield className="w-8 h-8 text-green-600" />,
      estimatedTime: '2 min'
    },
    {
      id: 'location',
      title: 'Tax Optimization',
      subtitle: 'Location matters for taxes',
      description: 'Your location affects dividend taxes. We\'ll optimize your strategy accordingly.',
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      estimatedTime: '1 min'
    },
    {
      id: 'goals',
      title: 'Financial Goals', 
      subtitle: 'Define your targets',
      description: 'Set your expense coverage goals and stress-free living targets.',
      icon: <Target className="w-8 h-8 text-purple-600" />,
      estimatedTime: '2 min'
    },
    {
      id: 'portfolio',
      title: 'Portfolio Setup',
      subtitle: 'Choose your starting point',
      description: 'Start with demo data, import your holdings, or add manually.',
      icon: <PieChart className="w-8 h-8 text-indigo-600" />,
      estimatedTime: '1 min'
    },
    {
      id: 'complete',
      title: 'Ready to Launch!',
      subtitle: 'Your journey begins now',
      description: 'Everything is set up. Let\'s see your personalized dashboard.',
      icon: <Trophy className="w-8 h-8 text-gold-600" />,
      estimatedTime: 'Done!'
    }
  ]

  // Get smart defaults based on current data
  const taxDefaults = smartDefaults.getTaxDefaults(formData.location)
  const portfolioTemplates = smartDefaults.getPortfolioTemplates(formData.riskTolerance)
  const suggestions = smartDefaults.getPersonalizedSuggestions({
    location: formData.location,
    riskTolerance: formData.riskTolerance,
    monthlyExpenses: formData.monthlyExpenses,
    experienceLevel: formData.experienceLevel
  })

  const handleNext = async () => {
    // Check for achievements before moving to next step
    await checkStepAchievements()
    
    if (currentStep === steps.length - 1) {
      await completeOnboarding()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const checkStepAchievements = async () => {
    const achievements: Achievement[] = []
    
    // Check achievements based on current step and data
    if (currentStep === 1 && formData.experienceLevel === 'expert') {
      achievements.push({
        id: 'expert-investor',
        title: '🧠 Investment Expert',
        description: 'Welcome, expert! You unlock advanced features.',
        icon: '🎓',
        unlocked: true
      })
    }

    if (currentStep === 2 && formData.location === 'Puerto Rico') {
      achievements.push({
        id: 'tax-genius',
        title: '🏝️ Tax Genius!',
        description: 'Puerto Rico = 0% dividend tax! Incredible advantage!',
        icon: '🎉',
        unlocked: true
      })
    }

    if (currentStep === 3 && formData.monthlyExpenses > 0 && formData.stressFreeLiving > 0) {
      achievements.push({
        id: 'goal-setter',
        title: '🎯 Goal Setter',
        description: 'Clear goals are the first step to success!',
        icon: '🌟',
        unlocked: true
      })
    }

    // Show achievement animation
    if (achievements.length > 0) {
      setUnlockedAchievement(achievements[0])
      setShowAchievement(true)
      setTimeout(() => setShowAchievement(false), 3000)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    
    try {
      // Initialize demo data if requested
      if (formData.startWithDemo) {
        const demo = await demoMode.initializeDemoUser({
          name: formData.fullName,
          location: formData.location,
          riskTolerance: formData.riskTolerance,
          experienceLevel: formData.experienceLevel,
          stressFreeLiving: formData.stressFreeLiving
        })
        
        // Store demo data in localStorage
        localStorage.setItem('demo-portfolio', JSON.stringify(demo.portfolio))
        localStorage.setItem('demo-expenses', JSON.stringify(demo.expenses))
        localStorage.setItem('demo-user', JSON.stringify(demo.user))
      }

      // Create user object from onboarding data
      const user: User = {
        id: 'onboarding-user-' + Date.now(),
        email: formData.email,
        name: formData.fullName,
        location: {
          country: formData.location === 'Puerto Rico' ? 'PR' : 'US',
          state: formData.location,
          taxRates: {
            capitalGains: formData.location === 'Puerto Rico' ? 0 : 0.15,
            ordinaryIncome: formData.location === 'Puerto Rico' ? 0 : 0.24,
            qualified: formData.location === 'Puerto Rico' ? 0 : 0.15
          }
        },
        goals: {
          monthlyExpenses: formData.monthlyExpenses,
          targetCoverage: 1.0,
          stressFreeLiving: formData.stressFreeLiving,
          monthlyContribution: formData.monthlyContribution
        },
        financialProfile: {
          currentAge: formData.age,
          retirementAge: 60, // Default retirement age
          currentPortfolioValue: formData.currentSavings || 50000,
          monthlyContribution: formData.monthlyContribution
        }
      }

      // Save to user store
      setUser(user)
      saveToStorage()
      
      // Store onboarding data (legacy)
      localStorage.setItem('onboarding-complete', 'true')
      localStorage.setItem('onboarding-data', JSON.stringify(formData))
      localStorage.setItem('user-preferences', JSON.stringify({
        notifications: formData.notifications,
        weeklyReports: formData.weeklyReports,
        celebrateAchievements: formData.celebrateAchievements
      }))

      // Show completion achievement
      setUnlockedAchievement({
        id: 'onboarding-complete',
        title: '🚀 Ready to Launch!',
        description: 'Onboarding complete! Welcome to Income Clarity!',
        icon: '✅',
        unlocked: true
      })
      setShowAchievement(true)

      // Redirect after achievement animation
      setTimeout(() => {
        router.push('/super-cards?welcome=true')
      }, 2000)

    } catch (error) {
      // console.error('Onboarding completion error:', error)
    // } finally {
      setIsLoading(false)
    }
  }

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: return true // Welcome
      case 1: return formData.fullName.trim().length > 0 && formData.email.trim().length > 0
      case 2: return formData.location.trim().length > 0
      case 3: return formData.monthlyExpenses > 0 && formData.stressFreeLiving > 0
      case 4: return formData.portfolioName.trim().length > 0
      case 5: return true // Complete
      default: return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Income Clarity
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Take control of your dividend income lifestyle. Track your portfolio's ability to cover expenses 
              and build toward financial independence with confidence.
            </p>

            {/* Value propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Dividend Income</h3>
                <p className="text-sm text-gray-600">Monitor your monthly dividend income and watch it grow toward covering your expenses</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reach the Zero Line</h3>
                <p className="text-sm text-gray-600">See exactly when your dividend income will cover 100% of your living expenses</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Beat the Market</h3>
                <p className="text-sm text-gray-600">Compare your performance vs SPY and optimize your dividend strategy</p>
              </div>
            </div>

            {/* Social proof */}
            <div className="text-center mb-6">
              <div className="flex justify-center items-center space-x-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">Join 10,000+ dividend investors tracking their journey to financial independence</p>
            </div>
          </div>
        )

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Investment Profile</h2>
            <p className="text-gray-600 mb-8">
              Tell us about yourself so we can personalize your Income Clarity experience.
            </p>
            
            <div className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age (Optional)
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age || 30}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Risk Tolerance</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                    <button
                      key={risk}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, riskTolerance: risk }))}
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        formData.riskTolerance === risk 
                          ? 'border-blue-500 bg-blue-50 text-blue-900' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium capitalize">{risk}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {risk === 'conservative' && 'Safety first, steady growth'}
                        {risk === 'moderate' && 'Balanced approach, steady income'}
                        {risk === 'aggressive' && 'Higher risk, higher potential returns'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Investment Experience</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, experienceLevel: level }))}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        formData.experienceLevel === level 
                          ? 'border-blue-500 bg-blue-50 text-blue-900' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium capitalize">{level}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Optimization</h2>
            <p className="text-gray-600 mb-8">
              Your location affects dividend taxes. We'll help you optimize accordingly.
            </p>
            
            <div className="space-y-6">
              {/* Location Selection */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location *
                </label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="California">California</option>
                  <option value="Texas">Texas</option>
                  <option value="Florida">Florida</option>
                  <option value="New York">New York</option>
                  <option value="Washington">Washington</option>
                  <option value="Nevada">Nevada</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="Other">Other State</option>
                </select>
              </div>

              {/* Tax Impact Display */}
              <div className={`p-4 rounded-lg border-2 ${
                taxDefaults.color === 'success' ? 'bg-green-50 border-green-200' :
                taxDefaults.color === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <MapPin className={`w-5 h-5 mt-1 ${
                    taxDefaults.color === 'success' ? 'text-green-600' :
                    taxDefaults.color === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {formData.location} Tax Impact
                    </h3>
                    <p className={`text-sm ${
                      taxDefaults.color === 'success' ? 'text-green-700' :
                      taxDefaults.color === 'warning' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {taxDefaults.message}
                    </p>
                    {taxDefaults.optimization && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm text-gray-600">
                          <strong>Optimization tip:</strong> {taxDefaults.optimization}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top suggestions for this location */}
              {suggestions.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-3">💡 Personalized Suggestions</h3>
                  <div className="space-y-2">
                    {suggestions.slice(0, 2).map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">{suggestion.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-blue-900">{suggestion.title}</p>
                          <p className="text-xs text-blue-700">{suggestion.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h2>
            <p className="text-gray-600 mb-8">
              Set your targets so we can track your progress toward financial independence.
            </p>
            
            <div className="space-y-6">
              {/* Monthly Expenses */}
              <div>
                <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Expenses *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="monthlyExpenses"
                    type="number"
                    required
                    min="0"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="3800"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Average monthly spending including housing, food, utilities, etc.
                </p>
              </div>

              {/* Stress-Free Living Target */}
              <div>
                <label htmlFor="stressFreeLiving" className="block text-sm font-medium text-gray-700 mb-2">
                  Stress-Free Living Target *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="stressFreeLiving"
                    type="number"
                    min="0"
                    value={formData.stressFreeLiving}
                    onChange={(e) => setFormData(prev => ({ ...prev, stressFreeLiving: Number(e.target.value) }))}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Monthly dividend income target for comfortable, stress-free living
                </p>
              </div>

              {/* Monthly Contribution */}
              <div>
                <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Contribution (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="monthlyContribution"
                    type="number"
                    min="0"
                    value={formData.monthlyContribution || 500}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: Number(e.target.value) }))}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  How much do you invest each month? This helps with Coast FI calculations.
                </p>
              </div>

              {/* Goal visualization */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">🎯 Your Goal Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zero Line (100% coverage)</span>
                    <span className="font-medium">${formData.monthlyExpenses.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stress-Free Living</span>
                    <span className="font-medium text-purple-600">${formData.stressFreeLiving.toLocaleString()}/month</span>
                  </div>
                  {formData.stressFreeLiving > formData.monthlyExpenses && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Your stress-free target is {((formData.stressFreeLiving / formData.monthlyExpenses) * 100 - 100).toFixed(0)}% above 
                      your basic expenses - great buffer for peace of mind!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Setup</h2>
            <p className="text-gray-600 mb-8">
              Choose how you'd like to get started with Income Clarity.
            </p>
            
            <div className="space-y-6">
              {/* Portfolio Name */}
              <div>
                <label htmlFor="portfolioName" className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Name *
                </label>
                <input
                  id="portfolioName"
                  type="text"
                  required
                  value={formData.portfolioName}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Investment Portfolio"
                />
              </div>

              {/* Starting Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">How would you like to start?</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, startWithDemo: true, importMethod: 'demo' }))}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      formData.startWithDemo 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Start with Demo Portfolio (Recommended)</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Explore all features with realistic sample data. Perfect for learning the platform before adding your real holdings.
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, startWithDemo: false, importMethod: 'manual' }))}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      !formData.startWithDemo 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <PieChart className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Add My Real Holdings</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Start with your actual portfolio data. You can import from CSV, add manually, or upload a screenshot.
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recommended portfolio template preview */}
              {portfolioTemplates.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    💡 Recommended for {formData.riskTolerance} investors:
                  </h3>
                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900">{portfolioTemplates[0].name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{portfolioTemplates[0].description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Target Yield: {(portfolioTemplates[0].targetYield * 100).toFixed(1)}%</span>
                      <span className="text-sm text-gray-500">{portfolioTemplates[0].suggestedETFs.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Ready to Launch!
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your Income Clarity account is all set up! Let's see your personalized dashboard and start tracking your dividend journey.
            </p>

            {/* Personalized preview */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Here's what we've prepared for you:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Monthly Goal: ${formData.monthlyExpenses.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Track progress to zero line</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Stress-Free Target: ${formData.stressFreeLiving.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Ultimate financial freedom</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.location} Tax Optimization</p>
                    <p className="text-sm text-gray-600">Location-aware strategies</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.riskTolerance.charAt(0).toUpperCase() + formData.riskTolerance.slice(1)} Strategy</p>
                    <p className="text-sm text-gray-600">Matched to your profile</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {formData.startWithDemo ? 
                'Starting with demo data - you can add real holdings anytime!' :
                'Ready to add your real portfolio data!'
              }
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      {/* Achievement Popup */}
      {showAchievement && unlockedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center transform animate-pulse">
            <div className="text-6xl mb-4">{unlockedAchievement.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{unlockedAchievement.title}</h3>
            <p className="text-gray-600">{unlockedAchievement.description}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Income Clarity Setup</span>
          </div>
          
          <div className="flex items-center justify-between mb-2 max-w-2xl mx-auto">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          
          <div className="w-full max-w-2xl mx-auto bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center space-x-4 mb-12 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                index < currentStep ? 'bg-green-500 text-white' :
                index === currentStep ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {index < currentStep ? <Check className="w-6 h-6" /> : step.icon}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900 truncate">{step.title}</div>
                <div className="text-xs text-gray-500">{step.estimatedTime}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-lg text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isCurrentStepValid() || isLoading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Launch Dashboard
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}