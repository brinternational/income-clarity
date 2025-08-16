'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Target,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Calculator,
  PiggyBank,
  Home,
  GraduationCap,
  Car,
  Heart,
  Briefcase,
  Globe
} from 'lucide-react';
import { useIncomeHub } from '@/store/superCardStore';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'income' | 'portfolio' | 'fire' | 'expense' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  milestones: Array<{
    percentage: number;
    description: string;
  }>;
}

interface FinancialGoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
}

const GOAL_CATEGORIES = [
  {
    id: 'income' as const,
    label: 'Monthly Income Target',
    description: 'Dividend income milestone',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'portfolio' as const,
    label: 'Portfolio Value',
    description: 'Total investment goal',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'fire' as const,
    label: 'FIRE Number',
    description: 'Financial independence',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'expense' as const,
    label: 'Expense Coverage',
    description: 'Cover specific expenses',
    icon: PiggyBank,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'custom' as const,
    label: 'Custom Goal',
    description: 'Your own financial target',
    icon: Globe,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  }
];

const GOAL_TEMPLATES = {
  income: [
    { title: '$1,000/month Dividend Income', amount: 1000, timeframe: 12, description: 'Cover utilities and insurance' },
    { title: '$2,500/month Dividend Income', amount: 2500, timeframe: 24, description: 'Cover housing expenses' },
    { title: '$5,000/month Dividend Income', amount: 5000, timeframe: 60, description: 'Cover all living expenses' }
  ],
  portfolio: [
    { title: '$100K Portfolio', amount: 100000, timeframe: 36, description: 'First major milestone' },
    { title: '$500K Portfolio', amount: 500000, timeframe: 84, description: 'Substantial wealth building' },
    { title: '$1M Portfolio', amount: 1000000, timeframe: 120, description: 'Millionaire status' }
  ],
  fire: [
    { title: 'Coast FI at 40', amount: 400000, timeframe: 120, description: 'Stop saving, let compound growth work' },
    { title: 'Lean FIRE', amount: 625000, timeframe: 180, description: '$25K annual expenses (4% rule)' },
    { title: 'Fat FIRE', amount: 2500000, timeframe: 300, description: '$100K annual expenses (4% rule)' }
  ],
  expense: [
    { title: 'Emergency Fund', amount: 25000, timeframe: 18, description: '6 months of expenses' },
    { title: 'House Down Payment', amount: 80000, timeframe: 48, description: '20% down on $400K home' },
    { title: 'Child\'s College Fund', amount: 200000, timeframe: 180, description: 'Full 4-year education' }
  ],
  custom: [
    { title: 'Dream Vacation Fund', amount: 15000, timeframe: 24, description: 'European adventure' },
    { title: 'New Car Fund', amount: 35000, timeframe: 36, description: 'Upgrade vehicle' },
    { title: 'Business Investment', amount: 50000, timeframe: 30, description: 'Start side business' }
  ]
};

export const FinancialGoalCreationModal = ({
  isOpen,
  onClose,
  onCreateGoal
}: FinancialGoalCreationModalProps) => {
  const [step, setStep] = useState<'category' | 'template' | 'details'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Goal['category'] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customGoal, setCustomGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    targetDate: '',
    priority: 'medium' as Goal['priority']
  });

  const { monthlyIncome, availableToReinvest } = useIncomeHub();

  // Smart goal suggestions based on user's income data
  const smartSuggestions = useMemo(() => {
    if (!monthlyIncome || !availableToReinvest) return [];

    const monthlyAvailable = availableToReinvest;
    const annualAvailable = monthlyAvailable * 12;

    return [
      {
        title: `${Math.round(monthlyAvailable * 6)}K Emergency Fund`,
        description: '6 months of available income',
        amount: monthlyAvailable * 6,
        timeframe: 12,
        category: 'expense' as const
      },
      {
        title: `$${Math.round(annualAvailable)} Annual Investment Goal`,
        description: 'Invest all available income',
        amount: annualAvailable,
        timeframe: 12,
        category: 'portfolio' as const
      },
      {
        title: `$${Math.round(monthlyAvailable * 0.05)} Monthly Dividend Target`,
        description: 'Start with 5% of available income',
        amount: monthlyAvailable * 0.05,
        timeframe: 24,
        category: 'income' as const
      }
    ];
  }, [monthlyIncome, availableToReinvest]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCustomGoal({
      title: template.title,
      description: template.description,
      targetAmount: template.amount,
      targetDate: new Date(Date.now() + template.timeframe * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium'
    });
    setStep('details');
  };

  const handleCreateGoal = () => {
    if (!selectedCategory || !customGoal.title || !customGoal.targetAmount || !customGoal.targetDate) {
      return;
    }

    const milestones = [
      { percentage: 25, description: 'Quarter progress milestone' },
      { percentage: 50, description: 'Halfway to your goal' },
      { percentage: 75, description: 'Three-quarters complete' }
    ];

    onCreateGoal({
      ...customGoal,
      category: selectedCategory,
      milestones
    });

    // Reset form
    setStep('category');
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setCustomGoal({
      title: '',
      description: '',
      targetAmount: 0,
      targetDate: '',
      priority: 'medium'
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {step === 'category' && 'Choose Goal Category'}
                {step === 'template' && 'Pick a Template'}
                {step === 'details' && 'Goal Details'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Category Selection */}
            {step === 'category' && (
              <div className="space-y-4">
                <p className="text-slate-600 mb-6">
                  What type of financial goal would you like to create?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GOAL_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${category.bgColor} ${category.color} border-transparent hover:border-current`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setStep('template');
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${category.bgColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{category.label}</h3>
                            <p className="text-sm opacity-80">{category.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Smart Suggestions */}
                {smartSuggestions.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-slate-800">Smart Suggestions</h3>
                    </div>
                    <div className="space-y-2">
                      {smartSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          className="w-full p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 text-left hover:from-yellow-100 hover:to-orange-100 transition-all"
                          whileHover={{ scale: 1.01 }}
                          onClick={() => {
                            setSelectedCategory(suggestion.category);
                            handleTemplateSelect(suggestion);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{suggestion.title}</p>
                              <p className="text-sm text-slate-600">{suggestion.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-600">${suggestion.amount.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">{suggestion.timeframe} months</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Template Selection */}
            {step === 'template' && selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <button
                    onClick={() => setStep('category')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ← Back
                  </button>
                  <span className="text-slate-600">Choose a template or create custom</span>
                </div>

                <div className="space-y-3">
                  {GOAL_TEMPLATES[selectedCategory]?.map((template, index) => (
                    <motion.button
                      key={index}
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-left hover:border-primary-300 hover:bg-primary-25 transition-all"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-1">{template.title}</h3>
                          <p className="text-sm text-slate-600">{template.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">${template.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{template.timeframe} months</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {/* Custom Option */}
                  <motion.button
                    className="w-full p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-center hover:from-slate-100 hover:to-slate-200 transition-all"
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setCustomGoal({
                        title: '',
                        description: '',
                        targetAmount: 0,
                        targetDate: '',
                        priority: 'medium'
                      });
                      setStep('details');
                    }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 bg-slate-200 rounded-full">
                        <Calculator className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Create Custom Goal</h3>
                        <p className="text-sm text-slate-600">Set your own target and timeline</p>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Step 3: Goal Details */}
            {step === 'details' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <button
                    onClick={() => setStep('template')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ← Back
                  </button>
                  <span className="text-slate-600">Customize your goal</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={customGoal.title}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={customGoal.description}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Describe what this goal means to you..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Target Amount
                      </label>
                      <input
                        type="number"
                        value={customGoal.targetAmount || ''}
                        onChange={(e) => setCustomGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={customGoal.targetDate}
                        onChange={(e) => setCustomGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority Level
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
                        { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                        { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
                      ].map((priority) => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => setCustomGoal(prev => ({ ...prev, priority: priority.value as Goal['priority'] }))}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                            customGoal.priority === priority.value
                              ? priority.color
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal Preview */}
                  {customGoal.title && customGoal.targetAmount > 0 && customGoal.targetDate && (
                    <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
                      <h4 className="font-semibold text-primary-800 mb-2">Goal Preview</h4>
                      <div className="text-sm text-primary-700 space-y-1">
                        <p><strong>{customGoal.title}</strong> - ${customGoal.targetAmount.toLocaleString()}</p>
                        <p>Target: {new Date(customGoal.targetDate).toLocaleDateString()}</p>
                        <p>Priority: {customGoal.priority}</p>
                        {customGoal.description && <p className="italic">"{customGoal.description}"</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={!customGoal.title || !customGoal.targetAmount || !customGoal.targetDate}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};