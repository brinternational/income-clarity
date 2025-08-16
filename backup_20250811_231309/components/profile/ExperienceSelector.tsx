'use client';

import React, { useState } from 'react';
import { BookOpen, TrendingUp, Target, Crown, HelpCircle } from 'lucide-react';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface ExperienceOption {
  level: ExperienceLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  timeFrame: string;
}

interface ExperienceSelectorProps {
  value?: ExperienceLevel;
  onChange: (level: ExperienceLevel) => void;
  className?: string;
  disabled?: boolean;
}

const experienceOptions: ExperienceOption[] = [
  {
    level: 'beginner',
    label: 'Beginner',
    description: 'New to investing and dividend income strategies',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-300',
    timeFrame: '< 1 year experience',
    features: [
      'Basic portfolio guidance',
      'Educational content priority',
      'Conservative recommendations',
      'Step-by-step tutorials'
    ]
  },
  {
    level: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience with stocks and dividend investing',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-300',
    timeFrame: '1-3 years experience',
    features: [
      'Balanced growth strategies',
      'Sector diversification tips',
      'Performance optimization',
      'Tax efficiency guidance'
    ]
  },
  {
    level: 'advanced',
    label: 'Advanced',
    description: 'Experienced investor with solid market knowledge',
    icon: <Target className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-300',
    timeFrame: '3+ years experience',
    features: [
      'Advanced analytics access',
      'Options strategies guidance',
      'Market timing insights',
      'Complex portfolio structures'
    ]
  },
  {
    level: 'expert',
    label: 'Expert',
    description: 'Professional or highly experienced dividend investor',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200 hover:border-orange-300',
    timeFrame: '5+ years experience',
    features: [
      'Professional-grade tools',
      'Advanced risk management',
      'Institutional strategies',
      'Custom algorithm access'
    ]
  }
];

export function ExperienceSelector({ value = 'intermediate', onChange, className = '', disabled = false }: ExperienceSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(value);
  const [showTooltip, setShowTooltip] = useState<ExperienceLevel | null>(null);

  const handleSelect = (level: ExperienceLevel) => {
    if (disabled) return;
    
    setSelectedLevel(level);
    onChange(level);
  };

  const currentOption = experienceOptions.find(option => option.level === selectedLevel) || experienceOptions[1];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Selection Display */}
      <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${currentOption.bgColor} ${currentOption.borderColor.split(' ')[0]}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className={currentOption.color}>
            {currentOption.icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-medium ${currentOption.color}`}>
              {currentOption.label} Investor
            </h3>
            <p className="text-sm text-gray-600">
              {currentOption.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {currentOption.timeFrame}
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {currentOption.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${currentOption.color.replace('text-', 'bg-')}`} />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Level Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {experienceOptions.map((option) => {
          const isSelected = selectedLevel === option.level;
          
          return (
            <button
              key={option.level}
              onClick={() => handleSelect(option.level)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:shadow-md'
                }
                ${isSelected 
                  ? `${option.borderColor.split(' ')[0]} ${option.bgColor} shadow-md ring-2 ring-offset-2 ${option.color.replace('text-', 'ring-')}`
                  : `border-gray-200 bg-white hover:${option.bgColor} hover:${option.borderColor.split(' ')[1]}`
                }
              `}
            >
              {/* Icon and Label */}
              <div className="flex items-center space-x-3 mb-2">
                <div className={isSelected ? option.color : 'text-gray-400'}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm ${isSelected ? option.color : 'text-gray-900'}`}>
                    {option.label}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {option.timeFrame}
                  </p>
                </div>
                
                {/* Help Icon */}
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(option.level)}
                  onMouseLeave={() => setShowTooltip(null)}
                  onFocus={() => setShowTooltip(option.level)}
                  onBlur={() => setShowTooltip(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {option.description}
              </p>

              {/* Selected Indicator */}
              {isSelected && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${option.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}

              {/* Tooltip */}
              {showTooltip === option.level && (
                <div className="absolute z-10 top-full mt-2 left-0 right-0 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                  <div className="space-y-1">
                    <p className="font-medium">What you get:</p>
                    {option.features.map((feature, index) => (
                      <p key={index} className="opacity-90">• {feature}</p>
                    ))}
                  </div>
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Experience Level Impact */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-900">
            How this affects your recommendations:
          </h4>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          {selectedLevel === 'beginner' && (
            <>
              <p>• We'll focus on blue-chip dividend aristocrats</p>
              <p>• Educational content will be prioritized in your dashboard</p>
              <p>• Conservative position sizing recommendations</p>
            </>
          )}
          {selectedLevel === 'intermediate' && (
            <>
              <p>• Balanced growth and dividend stock recommendations</p>
              <p>• Sector rotation and diversification strategies</p>
              <p>• Moderate position sizing with risk management tips</p>
            </>
          )}
          {selectedLevel === 'advanced' && (
            <>
              <p>• Access to covered call and REIT strategies</p>
              <p>• Advanced technical analysis and market timing insights</p>
              <p>• Higher risk tolerance assumptions in recommendations</p>
            </>
          )}
          {selectedLevel === 'expert' && (
            <>
              <p>• Professional-grade analytics and backtesting tools</p>
              <p>• Complex strategies including margin and derivatives</p>
              <p>• Institutional-level portfolio construction methods</p>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Experience Level</span>
          <span className={currentOption.color}>{currentOption.label}</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${currentOption.color.replace('text-', 'bg-')}`}
            style={{ 
              width: selectedLevel === 'beginner' 
                ? '25%' 
                : selectedLevel === 'intermediate' 
                  ? '50%' 
                  : selectedLevel === 'advanced'
                    ? '75%'
                    : '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
}