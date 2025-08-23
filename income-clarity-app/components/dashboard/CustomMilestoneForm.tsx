'use client';

import React, { useState } from 'react';
import { ExpenseMilestone } from '@/types';
import { Button } from '@/components/forms/Button';
import { logger } from '@/lib/logger';
import { 
  GraduationCap, 
  Plane, 
  Car, 
  Heart, 
  Gift, 
  Gamepad2, 
  Coffee, 
  Building,
  Target,
  Plus,
  Check
} from 'lucide-react';

// Available icons for custom milestones
const MILESTONE_ICONS = [
  { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { name: 'Plane', icon: Plane, label: 'Travel' },
  { name: 'Car', icon: Car, label: 'Vehicle' },
  { name: 'Heart', icon: Heart, label: 'Healthcare' },
  { name: 'Gift', icon: Gift, label: 'Special Occasions' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Entertainment' },
  { name: 'Coffee', icon: Coffee, label: 'Daily Expenses' },
  { name: 'Building', icon: Building, label: 'Property' },
  { name: 'Target', icon: Target, label: 'Goal' }
];

export interface CustomMilestoneFormData {
  name: string;
  amount: number;
  icon: string;
}

interface CustomMilestoneFormProps {
  onSubmit: (data: CustomMilestoneFormData) => void;
  onCancel: () => void;
  initialData?: Partial<CustomMilestoneFormData>;
  isEditing?: boolean;
}

export function CustomMilestoneForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false 
}: CustomMilestoneFormProps) {
  const [formData, setFormData] = useState<CustomMilestoneFormData>({
    name: initialData?.name || '',
    amount: initialData?.amount || 0,
    icon: initialData?.icon || 'Target'
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CustomMilestoneFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomMilestoneFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Milestone name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Milestone name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Milestone name must be less than 50 characters';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount >= 50000) {
      newErrors.amount = 'Amount must be less than $50,000';
    }

    if (!formData.icon) {
      newErrors.icon = 'Please select an icon';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        name: formData.name.trim(),
        amount: Number(formData.amount),
        icon: formData.icon
      });
    } catch (error) {
      // logger.error('Error submitting custom milestone:', error);
    // } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomMilestoneFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const selectedIconData = MILESTONE_ICONS.find(icon => icon.name === formData.icon);
  const SelectedIcon = selectedIconData?.icon || Target;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isEditing ? 'Edit Custom Milestone' : 'Create Custom Milestone'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Set a personal financial goal to track alongside your expense milestones.
        </p>
      </div>

      {/* Milestone Name */}
      <div>
        <label htmlFor="milestone-name" className="block text-sm font-medium text-foreground/90 mb-2">
          Milestone Name *
        </label>
        <input
          id="milestone-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., Kids' College Fund, Vacation Budget"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
            errors.name 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-slate-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formData.name.length}/50 characters
        </p>
      </div>

      {/* Target Amount */}
      <div>
        <label htmlFor="milestone-amount" className="block text-sm font-medium text-foreground/90 mb-2">
          Monthly Target Amount *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground sm:text-sm">$</span>
          </div>
          <input
            id="milestone-amount"
            type="number"
            min="1"
            max="50000"
            step="1"
            value={formData.amount || ''}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="1000"
            className={`w-full pl-7 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.amount 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-slate-300'
            }`}
            disabled={isSubmitting}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Amount needed per month to reach this milestone
        </p>
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground/90 mb-3">
          Choose an Icon *
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {MILESTONE_ICONS.map((iconData) => {
            const IconComponent = iconData.icon;
            const isSelected = formData.icon === iconData.name;
            
            return (
              <button
                key={iconData.name}
                type="button"
                onClick={() => handleInputChange('icon', iconData.name)}
                className={`p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-sm group ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                }`}
                disabled={isSubmitting}
                aria-label={`Select ${iconData.label} icon`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <IconComponent className={`w-6 h-6 transition-colors ${
                    isSelected ? 'text-primary-600' : 'text-muted-foreground group-hover:text-primary-500'
                  }`} />
                  <span className={`text-xs font-medium transition-colors ${
                    isSelected ? 'text-primary-700' : 'text-muted-foreground group-hover:text-primary-600'
                  }`}>
                    {iconData.label}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-primary-500 rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.icon && (
          <p className="mt-2 text-sm text-red-600">{errors.icon}</p>
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-slate-50 rounded-lg p-4 border">
        <h4 className="text-sm font-medium text-foreground/90 mb-3">Preview</h4>
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <SelectedIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {formData.name || 'Custom Milestone'}
              </div>
              <div className="text-xs text-muted-foreground">Custom milestone</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-foreground">
              ${formData.amount ? formData.amount.toLocaleString() : '0'}/mo
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:order-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Milestone' : 'Create Milestone'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 sm:order-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}