'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { CheckCircle, Clock, AlertCircle, Trophy, Target, Zap, Star, Crown, Plus, Edit3, Trash2, GraduationCap, Plane, Car, Heart, Gift, Gamepad2, Coffee, Building } from 'lucide-react';
import { ExpenseMilestone } from '@/types';
import { useProgressAnimation } from '@/hooks/useOptimizedAnimation';
import { FormModal, useModal } from '@/components/forms/FormModal';
import { CustomMilestoneForm, CustomMilestoneFormData } from './CustomMilestoneForm';
import ShareButton from '@/components/shared/ShareButton';
import { generateShareContent } from '@/utils/shareContent';
import { useNotifications } from '@/contexts/NotificationContext';
import { createDemoNotifications } from '@/utils/demoNotifications';

interface ExpenseMilestonesProps {
  milestones?: ExpenseMilestone[];
  totalCoverage: number;
}

// Icon mapping for custom milestones
const CUSTOM_MILESTONE_ICONS = {
  GraduationCap,
  Plane,
  Car,
  Heart,
  Gift,
  Gamepad2,
  Coffee,
  Building,
  Target
};

const ExpenseMilestonesComponent = ({ milestones, totalCoverage }: ExpenseMilestonesProps) => {
  const [celebratingMilestones, setCelebratingMilestones] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [customMilestones, setCustomMilestones] = useState<ExpenseMilestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<ExpenseMilestone | null>(null);
  
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const { addNotification } = useNotifications();

  // Combine predefined and custom milestones with null safety
  const allMilestones = useMemo(() => {
    // Ensure milestones is always an array
    const safeMilestones = Array.isArray(milestones) ? milestones : [];
    const safeCustomMilestones = Array.isArray(customMilestones) ? customMilestones : [];
    
    const combined = [...safeMilestones, ...safeCustomMilestones];
    return combined.sort((a, b) => {
      // Custom milestones with priority come first, then by priority, then by amount
      if (a.isCustom && b.isCustom) {
        return (a.priority || 0) - (b.priority || 0);
      }
      if (a.isCustom && !b.isCustom) return 1; // Custom milestones after predefined
      if (!a.isCustom && b.isCustom) return -1;
      return a.amount - b.amount; // Predefined milestones by amount
    });
  }, [milestones, customMilestones]);

  // Recalculate total coverage including custom milestones
  const adjustedTotalCoverage = useMemo(() => {
    if (customMilestones.length === 0) return totalCoverage;
    
    const totalExpenses = allMilestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    const coveredAmount = allMilestones.reduce((sum, milestone) => {
      return sum + (milestone.covered ? milestone.amount : milestone.amount * (milestone.percentageCovered / 100));
    }, 0);
    
    return totalExpenses > 0 ? (coveredAmount / totalExpenses) * 100 : 0;
  }, [allMilestones, totalCoverage]);

  // Use optimized progress animation
  const animatedCoverage = useProgressAnimation(adjustedTotalCoverage, 1500, 300);

  // Memoize milestone calculations
  const { completedCount, progressLevel } = useMemo(() => {
    const completed = allMilestones.filter(m => m.covered).length;
    return {
      completedCount: completed,
      progressLevel: allMilestones.length > 0 ? completed / allMilestones.length : 0
    };
  }, [allMilestones]);

  useEffect(() => {
    setIsVisible(true);
    
    // Trigger celebration for completed milestones
    allMilestones.forEach((milestone, index) => {
      if (milestone.covered) {
        setTimeout(() => {
          setCelebratingMilestones(prev => new Set([...prev, milestone.id]));
        }, 800 + index * 200);
      }
    });
  }, [allMilestones]);

  // Demo function to add sample notifications
  const addDemoNotifications = () => {
    const demoNotifications = createDemoNotifications();
    
    // Add notifications with a small delay between each for better UX
    demoNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, index * 500); // 500ms delay between each notification
    });
  };

  // Memoize helper functions
  const getStatusIcon = useMemo(() => (milestone: ExpenseMilestone) => {
    if (milestone.covered) {
      return <CheckCircle className="w-5 h-5 text-prosperity-600" />;
    } else if (milestone.percentageCovered > 0) {
      return <Clock className="w-5 h-5 text-wealth-600" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  }, []);

  const getStatusStyle = useMemo(() => (milestone: ExpenseMilestone) => {
    if (milestone.covered) {
      return 'status-positive border-l-4 border-prosperity-400';
    } else if (milestone.percentageCovered > 0) {
      return 'status-premium border-l-4 border-wealth-400';
    } else {
      return 'status-neutral border-l-4 border-slate-300';
    }
  }, []);

  const getMilestoneIcon = useMemo(() => (milestone: ExpenseMilestone, index: number) => {
    if (milestone.isCustom && milestone.icon) {
      const CustomIcon = CUSTOM_MILESTONE_ICONS[milestone.icon as keyof typeof CUSTOM_MILESTONE_ICONS];
      return CustomIcon || Target;
    }
    if (milestone.covered) {
      return index === 0 ? Crown : index < 2 ? Trophy : Star;
    }
    return Target;
  }, []);

  // Custom milestone management functions
  const handleAddCustomMilestone = (data: CustomMilestoneFormData) => {
    const newMilestone: ExpenseMilestone = {
      id: `custom-${Date.now()}`,
      name: data.name,
      amount: data.amount,
      covered: false,
      percentageCovered: 0,
      monthlyIncomeNeeded: data.amount,
      isCustom: true,
      icon: data.icon,
      priority: customMilestones.length
    };
    
    setCustomMilestones(prev => [...prev, newMilestone]);
    closeModal();
    setEditingMilestone(null);
  };

  const handleEditCustomMilestone = (milestone: ExpenseMilestone) => {
    setEditingMilestone(milestone);
    openModal();
  };

  const handleUpdateCustomMilestone = (data: CustomMilestoneFormData) => {
    if (!editingMilestone) return;
    
    setCustomMilestones(prev => 
      prev.map(milestone => 
        milestone.id === editingMilestone.id
          ? {
              ...milestone,
              name: data.name,
              amount: data.amount,
              icon: data.icon,
              monthlyIncomeNeeded: data.amount
            }
          : milestone
      )
    );
    
    closeModal();
    setEditingMilestone(null);
  };

  const handleDeleteCustomMilestone = (milestoneId: string) => {
    setCustomMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
  };

  const openAddModal = () => {
    setEditingMilestone(null);
    openModal();
  };

  return (
    <div className={`premium-card hover-lift animate-on-mount p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Premium header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-display-xs font-display font-semibold text-slate-800 mb-1">
            Financial Freedom Milestones
          </h3>
          <p className="text-sm text-slate-500">
            Your journey to expense coverage mastery
          </p>
        </div>
        <div className={`p-3 rounded-xl ${
          progressLevel >= 0.8 
            ? 'bg-gradient-to-br from-wealth-50 to-wealth-100' 
            : progressLevel >= 0.5 
            ? 'bg-gradient-to-br from-prosperity-50 to-prosperity-100'
            : 'bg-gradient-to-br from-primary-50 to-primary-100'
        }`}>
          {progressLevel >= 0.8 ? (
            <Crown className={`w-6 h-6 ${progressLevel >= 0.8 ? 'text-wealth-600' : 'text-prosperity-600'}`} />
          ) : (
            <Trophy className={`w-6 h-6 ${progressLevel >= 0.5 ? 'text-prosperity-600' : 'text-primary-600'}`} />
          )}
        </div>
      </div>
      
      {/* Enhanced overall progress with celebration */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary-600" />
              <span className="font-display font-semibold text-slate-800">
                Financial Freedom Progress
              </span>
            </div>
            {adjustedTotalCoverage >= 100 && (
              <div className="animate-bounce-subtle">
                <div className="text-xs font-bold text-wealth-600 bg-wealth-50 px-3 py-1 rounded-full border border-wealth-200">
                  ACHIEVED! 🎉
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="currency-display font-bold text-2xl text-gradient-prosperity animate-currency">
              {animatedCoverage.toFixed(0)}%
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <div className="text-xs text-slate-500 font-medium">
                {completedCount} of {allMilestones.length} milestones
              </div>
              {completedCount > 0 && (
                <ShareButton
                  shareType="milestone"
                  shareData={generateShareContent('milestone', { milestones: allMilestones })}
                  variant="ghost"
                  size="sm"
                  className="text-wealth-600 hover:text-wealth-700 hover:bg-wealth-50"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced progress bar */}
        <div className="relative">
          <div className="progress-bar-premium h-4">
            <div 
              className={`progress-fill ${
                animatedCoverage >= 100 
                  ? 'bg-gradient-to-r from-wealth-500 via-prosperity-500 to-primary-500' 
                  : animatedCoverage >= 75
                  ? 'bg-gradient-to-r from-prosperity-500 to-prosperity-600'
                  : 'bg-gradient-to-r from-primary-500 to-prosperity-500'
              } shadow-sm`}
              style={{ 
                width: `${Math.min(animatedCoverage, 100)}%`,
                '--progress-width': `${Math.min(animatedCoverage, 100)}%`
              } as any}
            />
          </div>
          
          {/* Progress milestones markers */}
          <div className="absolute top-0 left-0 w-full h-4 flex items-center">
            {[25, 50, 75, 100].map((marker) => (
              <div
                key={marker}
                className={`absolute w-1 h-6 -mt-1 ${
                  animatedCoverage >= marker ? 'bg-white' : 'bg-slate-300'
                } rounded-full shadow-sm transition-colors duration-500`}
                style={{ left: `${marker}%`, transform: 'translateX(-50%)' }}
              />
            ))}
          </div>
        </div>
        
        {/* Progress level indicator */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">Starting Out</span>
          <span className="text-slate-500">Comfortable</span>
          <span className="text-slate-500">Secure</span>
          <span className="text-wealth-600 font-semibold">Financial Freedom</span>
        </div>
      </div>
      
      {/* Add Custom Milestone & Demo Buttons */}
      <div className="mb-6 space-y-3">
        <button
          onClick={openAddModal}
          className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-slate-100 group-hover:bg-primary-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-slate-600 group-hover:text-primary-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-700 group-hover:text-primary-700">
                Add Custom Milestone
              </div>
              <div className="text-sm text-slate-500 group-hover:text-primary-600">
                Create a personal financial goal to track
              </div>
            </div>
          </div>
        </button>
        
        {/* Demo Notifications Button */}
        <button
          onClick={addDemoNotifications}
          className="w-full p-3 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-25 transition-all duration-200 group"
          title="Add sample notifications to test the notification center"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="p-1.5 bg-slate-50 group-hover:bg-primary-75 rounded transition-colors">
              <Trophy className="w-4 h-4 text-slate-500 group-hover:text-primary-500" />
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-primary-600">
              Add Demo Notifications
            </span>
          </div>
        </button>
      </div>
      
      {/* Enhanced individual milestones */}
      <div className="space-y-4">
        {allMilestones.map((milestone, index) => {
          const MilestoneIcon = getMilestoneIcon(milestone, index);
          const isCelebrating = celebratingMilestones.has(milestone.id);
          
          return (
            <div 
              key={milestone.id}
              className={`group relative p-4 rounded-xl border transition-all duration-500 hover:shadow-sm ${
                getStatusStyle(milestone)
              } ${isCelebrating ? 'animate-milestone' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Achievement glow effect */}
              {milestone.covered && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-prosperity-50 to-transparent opacity-50 pointer-events-none" />
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Enhanced status icon */}
                  <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                    milestone.covered 
                      ? 'bg-prosperity-100 group-hover:bg-prosperity-200' 
                      : milestone.percentageCovered > 0
                      ? 'bg-wealth-100 group-hover:bg-wealth-200'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}>
                    {getStatusIcon(milestone)}
                    {milestone.covered && (
                      <div className="absolute -top-1 -right-1">
                        <MilestoneIcon className="w-3 h-3 text-wealth-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold ${
                        milestone.covered 
                          ? 'text-prosperity-800' 
                          : 'text-slate-700'
                      }`}>
                        {milestone.name}
                      </span>
                      {milestone.isCustom && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full ml-2">
                          Custom
                        </span>
                      )}
                      {milestone.covered && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-prosperity-500 rounded-full animate-glow-pulse" />
                          <span className="text-xs font-medium text-prosperity-600 bg-prosperity-50 px-2 py-0.5 rounded-full">
                            Covered
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress indicator for partial coverage */}
                    {!milestone.covered && milestone.percentageCovered > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            {milestone.percentageCovered.toFixed(0)}% covered
                          </span>
                          <span className="text-wealth-600 font-medium">
                            ${milestone.monthlyIncomeNeeded.toLocaleString()} needed
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-1.5 bg-gradient-to-r from-wealth-400 to-wealth-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${milestone.percentageCovered}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Custom milestone actions */}
                  {milestone.isCustom && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditCustomMilestone(milestone)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        aria-label="Edit milestone"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomMilestone(milestone.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Delete milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="text-right">
                    <div className={`currency-display font-bold text-lg ${
                      milestone.covered ? 'text-prosperity-600' : 'text-slate-800'
                    }`}>
                      ${milestone.amount}/mo
                    </div>
                    {milestone.covered && (
                      <div className="text-xs text-prosperity-600 font-medium mt-1">
                        ✓ Fully Protected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced motivational section */}
      {adjustedTotalCoverage < 100 ? (
        <div className="mt-6 p-6 bg-gradient-to-br from-primary-50 via-primary-25 to-white rounded-xl border border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-semibold text-primary-800 mb-2">
                Your Next Financial Goal
              </h4>
              <p className="text-sm text-primary-700 mb-3">
                You're {(100 - adjustedTotalCoverage).toFixed(0)}% away from complete expense coverage. 
                Add approximately <span className="font-semibold currency-display">
                ${Math.round((100 - adjustedTotalCoverage) * 38).toLocaleString()}</span> in 
                monthly income to achieve financial security.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-xs font-medium text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                  {allMilestones.length - completedCount} milestones remaining
                </div>
                <div className="text-xs font-medium text-slate-600">
                  Estimated: {Math.ceil((100 - adjustedTotalCoverage) / 10)} months at current growth
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-6 bg-gradient-to-br from-wealth-50 via-prosperity-25 to-white rounded-xl border-2 border-wealth-200 achievement-glow achieved">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-wealth-100 rounded-xl">
              <Crown className="w-8 h-8 text-wealth-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-wealth-800 text-xl mb-2">
                🎉 Financial Freedom Achieved!
              </h4>
              <p className="text-wealth-700 mb-3">
                Congratulations! You've reached 100% expense coverage. Your investments now generate 
                enough passive income to cover all your monthly expenses.
              </p>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-bold text-wealth-600 bg-wealth-100 px-4 py-2 rounded-full">
                  Next: Build Your Luxury Buffer
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Milestone Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          setEditingMilestone(null);
        }}
        title={editingMilestone ? 'Edit Custom Milestone' : 'Add Custom Milestone'}
        maxWidth="lg"
      >
        <CustomMilestoneForm
          onSubmit={editingMilestone ? handleUpdateCustomMilestone : handleAddCustomMilestone}
          onCancel={() => {
            closeModal();
            setEditingMilestone(null);
          }}
          initialData={editingMilestone ? {
            name: editingMilestone.name,
            amount: editingMilestone.amount,
            icon: editingMilestone.icon || 'Target'
          } : undefined}
          isEditing={!!editingMilestone}
        />
      </FormModal>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const ExpenseMilestones = memo(ExpenseMilestonesComponent, (prevProps, nextProps) => {
  // Handle undefined/null milestones arrays
  const prevMilestones = prevProps.milestones || [];
  const nextMilestones = nextProps.milestones || [];
  
  return (
    prevProps.totalCoverage === nextProps.totalCoverage &&
    prevMilestones.length === nextMilestones.length &&
    prevMilestones.every((milestone, index) => {
      const nextMilestone = nextMilestones[index];
      return milestone.id === nextMilestone?.id &&
             milestone.covered === nextMilestone?.covered &&
             milestone.percentageCovered === nextMilestone?.percentageCovered &&
             milestone.amount === nextMilestone?.amount;
    })
  );
});