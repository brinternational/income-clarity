'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/forms/Button';
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Calculator, 
  Shield, 
  Target,
  ArrowRight,
  Play,
  Star,
  CheckCircle
} from 'lucide-react';

export default function DemoPage() {
  const features = [
    {
      title: "Super Cards Dashboard",
      description: "5 intelligent cards that adapt to your portfolio and provide real-time insights",
      icon: <PieChart className="h-8 w-8" />,
      color: "from-blue-500 to-purple-600",
      demo: "/dashboard/super-cards"
    },
    {
      title: "Income Intelligence",
      description: "Track dividend income, project future earnings, and optimize your portfolio mix",
      icon: <DollarSign className="h-8 w-8" />,
      color: "from-green-500 to-emerald-600",
      demo: "/income"
    },
    {
      title: "Tax Optimization",
      description: "Location-aware tax calculations. Puerto Rico = 0% tax on qualified dividends!",
      icon: <Calculator className="h-8 w-8" />,
      color: "from-orange-500 to-red-600",
      demo: "/profile"
    },
    {
      title: "Performance Tracking",
      description: "Daily SPY comparison and milestone progress toward financial independence",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "from-purple-500 to-pink-600",
      demo: "/dashboard"
    },
    {
      title: "Expense Management",
      description: "Gamified expense tracking with milestone achievements for different spending categories",
      icon: <Target className="h-8 w-8" />,
      color: "from-cyan-500 to-blue-600",
      demo: "/expenses"
    },
    {
      title: "Security & Privacy",
      description: "Multi-factor authentication, session management, and local SQLite storage",
      icon: <Shield className="h-8 w-8" />,
      color: "from-slate-500 to-slate-700",
      demo: "/auth/login"
    }
  ];

  const milestones = [
    { name: "Utilities", amount: "$200-300", icon: "🔌", description: "Power & Internet covered" },
    { name: "Insurance", amount: "$400-600", icon: "🛡️", description: "Health & Auto protected" },
    { name: "Food", amount: "$600-1000", icon: "🍔", description: "Groceries & Dining secured" },
    { name: "Housing", amount: "$1000-2500", icon: "🏠", description: "Rent/Mortgage freedom" },
    { name: "Entertainment", amount: "$500-1000", icon: "🎮", description: "Fun & Hobbies funded" },
    { name: "Full Independence", amount: "100%", icon: "🚀", description: "Complete financial freedom" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Dividend Growth Investor",
      quote: "Finally, a tool that understands dividend investing psychology. The daily SPY validation gives me the confidence boost I need.",
      rating: 5
    },
    {
      name: "Mike R.",
      role: "Early Retiree",
      quote: "The tax intelligence feature saved me thousands by showing the Puerto Rico advantage. Game changer!",
      rating: 5
    },
    {
      name: "Jennifer L.",
      role: "Portfolio Manager",
      quote: "Super Cards dashboard is brilliant. It adapts to my portfolio and shows exactly what I need to know.",
      rating: 5
    }
  ];

  return (
    <AppShell title="Income Clarity - Demo">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20"></div>
          <div className="relative container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Transform Your
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {" "}Dividend Income
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                The only portfolio tool that combines{" "}
                <strong className="text-emerald-400">emotional validation</strong>,{" "}
                <strong className="text-blue-400">tax intelligence</strong>, and{" "}
                <strong className="text-purple-400">milestone gamification</strong>{" "}
                to make dividend investing emotionally rewarding.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  href="/dashboard/super-cards"
                  variant="primary" 
                  size="lg"
                  leftIcon={<Play className="h-5 w-5" />}
                  className="transform hover:scale-105 transition-all duration-300"
                >
                  Try Live Demo
                </Button>
                <Button 
                  href="/auth/signup"
                  variant="secondary" 
                  size="lg"
                  leftIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Create Account
                </Button>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">$0</div>
                  <div className="text-slate-300">Subscription Fee</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-blue-400 mb-2">0%</div>
                  <div className="text-slate-300">Tax in Puerto Rico</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
                  <div className="text-slate-300">Super Cards</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Features That Actually Matter
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Built for dividend investors who want more than just portfolio tracking. 
              Get emotional validation, tax optimization, and clear progress toward financial independence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">{feature.description}</p>
                <Button 
                  href={feature.demo}
                  variant="ghost" 
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="group-hover:bg-white/20"
                >
                  Try Demo
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Gamification */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Gamified Financial Milestones
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Track your progress toward financial independence with clear, achievable milestones 
              that make every dividend payment feel like a victory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{milestone.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{milestone.name}</h3>
                <div className="text-2xl font-bold text-emerald-400 mb-2">{milestone.amount}</div>
                <p className="text-slate-400 text-sm">{milestone.description}</p>
                <div className="mt-4 flex items-center text-emerald-400">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Milestone Unlocked</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              What Dividend Investors Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl p-12 text-center border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Portfolio?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of dividend investors who've discovered the emotional satisfaction 
              of tax-optimized, milestone-driven portfolio management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                href="/auth/signup"
                variant="primary" 
                size="lg"
                leftIcon={<ArrowRight className="h-5 w-5" />}
                className="transform hover:scale-105 transition-all duration-300"
              >
                Start Free Account
              </Button>
              <Button 
                href="/dashboard/super-cards"
                variant="outline" 
                size="lg"
                leftIcon={<Play className="h-5 w-5" />}
              >
                Explore Demo First
              </Button>
            </div>

            <div className="mt-8 text-slate-400 text-sm">
              ✅ No credit card required • ✅ Local SQLite storage • ✅ Full privacy control
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-slate-400">
              <p className="mb-4">
                Income Clarity - Making dividend investing emotionally rewarding since 2024
              </p>
              <div className="flex justify-center space-x-6">
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup" className="hover:text-white transition-colors">
                  Sign Up
                </Link>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}