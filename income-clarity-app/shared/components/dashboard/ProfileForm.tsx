'use client';

import React, { useState } from 'react';
import { User, DollarSign, Target, MapPin, Settings } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';

export function ProfileForm() {
  const { profileData, updateProfile } = useUserProfile();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!profileData) return null;

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('goals.')) {
      const goalField = field.split('.')[1];
      updateProfile({
        goals: {
          ...profileData.goals,
          [goalField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      });
    } else if (field.startsWith('taxInfo.')) {
      const taxField = field.split('.')[1];
      updateProfile({
        taxInfo: {
          ...profileData.taxInfo,
          [taxField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      });
    } else if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      updateProfile({
        location: {
          ...profileData.location,
          [locationField]: value
        }
      });
    } else {
      updateProfile({ [field]: value });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Profile</h3>
            <p className="text-sm text-gray-500">
              Adjust your details to see real-time calculations
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">Monthly Expenses:</span>
          <span className="font-semibold text-gray-900">
            ${profileData.goals.monthlyExpenses.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600">Target Coverage:</span>
          <span className="font-semibold text-gray-900">
            {(profileData.goals.targetCoverage * 100).toFixed(0)}%
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600">Location:</span>
          <span className="font-semibold text-gray-900">
            {profileData.location.state}, {profileData.location.country}
          </span>
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={profileData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="WA">Washington</option>
                  <option value="OR">Oregon</option>
                  <option value="NV">Nevada</option>
                </select>
              </div>
            </div>

            {/* Financial Goals */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">Financial Goals</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Expenses ($)
                </label>
                <input
                  type="number"
                  value={profileData.goals.monthlyExpenses}
                  onChange={(e) => handleInputChange('goals.monthlyExpenses', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Coverage Ratio
                </label>
                <input
                  type="number"
                  value={profileData.goals.targetCoverage}
                  onChange={(e) => handleInputChange('goals.targetCoverage', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1.0 = 100% expense coverage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress-Free Living Target ($)
                </label>
                <input
                  type="number"
                  value={profileData.goals.stressFreeLiving}
                  onChange={(e) => handleInputChange('goals.stressFreeLiving', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Tax Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Federal Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={profileData.taxInfo.federalRate}
                  onChange={(e) => handleInputChange('taxInfo.federalRate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={profileData.taxInfo.stateRate}
                  onChange={(e) => handleInputChange('taxInfo.stateRate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital Gains Rate (%)
                </label>
                <input
                  type="number"
                  value={profileData.taxInfo.capitalGainsRate}
                  onChange={(e) => handleInputChange('taxInfo.capitalGainsRate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}