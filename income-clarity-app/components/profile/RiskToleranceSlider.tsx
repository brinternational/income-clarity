'use client';

import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle } from 'lucide-react';

export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

interface RiskToleranceSliderProps {
  value?: number;
  onChange: (value: number, level: RiskLevel) => void;
  className?: string;
  disabled?: boolean;
}

interface RiskZone {
  min: number;
  max: number;
  level: RiskLevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const riskZones: RiskZone[] = [
  {
    min: 0,
    max: 33,
    level: 'conservative',
    label: 'Conservative',
    description: 'Safety first, lower returns',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: <Shield className="w-5 h-5" />
  },
  {
    min: 34,
    max: 66,
    level: 'moderate',
    label: 'Moderate',
    description: 'Balanced approach',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    min: 67,
    max: 100,
    level: 'aggressive',
    label: 'Aggressive',
    description: 'Higher risk, higher potential returns',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: <AlertTriangle className="w-5 h-5" />
  }
];

const getRiskZone = (value: number): RiskZone => {
  return riskZones.find(zone => value >= zone.min && value <= zone.max) || riskZones[1];
};

export function RiskToleranceSlider({ value = 50, onChange, className = '', disabled = false }: RiskToleranceSliderProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const currentZone = getRiskZone(currentValue);

  const handleChange = (newValue: number) => {
    if (disabled) return;
    
    setCurrentValue(newValue);
    const zone = getRiskZone(newValue);
    onChange(newValue, zone.level);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    handleChange(newValue);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Risk Level Display */}
      <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${currentZone.bgColor}`}>
        <div className="flex items-center space-x-3">
          <div className={currentZone.color}>
            {currentZone.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${currentZone.color}`}>
                {currentZone.label} Risk Tolerance
              </h3>
              <span className={`text-sm font-medium ${currentZone.color}`}>
                {currentValue}/100
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {currentZone.description}
            </p>
          </div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Background Track with Zone Colors */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Conservative Zone */}
          <div 
            className="absolute h-full bg-gradient-to-r from-green-300 to-green-400"
            style={{ left: '0%', width: '33.33%' }}
          />
          
          {/* Moderate Zone */}
          <div 
            className="absolute h-full bg-gradient-to-r from-yellow-300 to-yellow-400"
            style={{ left: '33.33%', width: '33.33%' }}
          />
          
          {/* Aggressive Zone */}
          <div 
            className="absolute h-full bg-gradient-to-r from-red-300 to-red-400"
            style={{ left: '66.66%', width: '33.34%' }}
          />

          {/* Zone Separators */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm" style={{ left: '33.33%' }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm" style={{ left: '66.66%' }} />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className={`
            absolute top-0 w-full h-3 opacity-0 cursor-pointer
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ margin: 0 }}
        />

        {/* Custom Thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg
            transition-all duration-200 pointer-events-none z-10
            ${isDragging ? 'scale-110' : 'scale-100'}
            ${disabled ? 'bg-gray-400 cursor-not-allowed' : currentZone.color.replace('text-', 'bg-')}
          `}
          style={{ 
            left: `calc(${currentValue}% - 12px)`,
            backgroundColor: disabled 
              ? '#9ca3af' 
              : currentZone.level === 'conservative' 
                ? '#059669' 
                : currentZone.level === 'moderate' 
                  ? '#d97706' 
                  : '#dc2626'
          }}
        />
      </div>

      {/* Zone Labels */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span className="flex flex-col items-center">
          <Shield className="w-3 h-3 text-green-600 mb-1" />
          <span>Conservative</span>
          <span className="text-gray-400">0-33</span>
        </span>
        <span className="flex flex-col items-center">
          <TrendingUp className="w-3 h-3 text-yellow-600 mb-1" />
          <span>Moderate</span>
          <span className="text-gray-400">34-66</span>
        </span>
        <span className="flex flex-col items-center">
          <AlertTriangle className="w-3 h-3 text-red-600 mb-1" />
          <span>Aggressive</span>
          <span className="text-gray-400">67-100</span>
        </span>
      </div>

      {/* Risk Level Explanation */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          What this means for your portfolio:
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          {currentZone.level === 'conservative' && (
            <>
              <p>• Focus on dividend aristocrats and utilities</p>
              <p>• Lower volatility, steady income stream</p>
              <p>• May miss some growth opportunities</p>
            </>
          )}
          {currentZone.level === 'moderate' && (
            <>
              <p>• Mix of growth and dividend stocks</p>
              <p>• Balanced risk-reward approach</p>
              <p>• Suitable for most long-term investors</p>
            </>
          )}
          {currentZone.level === 'aggressive' && (
            <>
              <p>• Higher allocation to growth stocks</p>
              <p>• More volatile but higher potential returns</p>
              <p>• Requires strong conviction and patience</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}