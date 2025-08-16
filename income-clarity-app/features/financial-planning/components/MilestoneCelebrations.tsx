'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Flame,
  Crown,
  Zap,
  Target,
  Award,
  Medal,
  Sparkles,
  TrendingUp,
  Calendar,
  Gift,
  Share2,
  Download,
  RefreshCw,
  ChevronRight,
  Lock,
  Unlock,
  DollarSign,
  PiggyBank,
  Wallet,
  Coins,
  Banknote,
  CircleDollarSign,
  Percent,
  Shield,
  CheckCircle,
  Vibrate
} from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { useUserStore, useCurrentPortfolioValue, useUserGoals } from '@/store/userStore';
import { usePlanningHub, useSuperCardStore } from '@/store/superCardStore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'income' | 'coverage' | 'portfolio' | 'streak' | 'goal' | 'tax' | 'fire' | 'special' | 'savings' | 'milestone';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: string[];
  reward?: {
    type: 'badge' | 'title' | 'feature' | 'discount';
    value: string;
  };
  animationType: 'bounce' | 'glow' | 'sparkle' | 'fireworks' | 'confetti';
  sound?: string;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
}

interface UserProgress {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  milestonesUnlocked: number;
  savingsRate: number;
  netWorth: number;
  monthsActive: number;
  monthlyIncome: number;
  portfolioValue: number;
  expenseCoverage: number;
  taxSavings: number;
  fireProgress: number;
  customGoalsCompleted: number;
}

interface MilestoneCelebrationsProps {
  userProgress?: UserProgress;
  achievements?: Achievement[];
  onAchievementUnlock?: (achievementId: string) => void;
  onCelebrationShare?: (achievement: Achievement) => void;
  className?: string;
  enableHaptics?: boolean;
  enableSounds?: boolean;
  autoDetectMilestones?: boolean;
  persistAchievements?: boolean;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  life: number;
  maxLife: number;
}

const defaultUserProgress: UserProgress = {
  level: 12,
  totalPoints: 2450,
  pointsToNextLevel: 550,
  currentStreak: 8,
  longestStreak: 12,
  milestonesUnlocked: 15,
  savingsRate: 32,
  netWorth: 125000,
  monthsActive: 18,
  monthlyIncome: 0,
  portfolioValue: 0,
  expenseCoverage: 0,
  taxSavings: 0,
  fireProgress: 0,
  customGoalsCompleted: 0
};

// Confetti Animation Component
const ConfettiCanvas: React.FC<{ isActive: boolean; onComplete: () => void }> = ({ isActive, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.1,
        life: 1,
        maxLife: Math.random() * 60 + 120
      });
    }

    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;
      particlesRef.current.forEach(particle => {
        if (particle.life <= 0) return;

        // Update physics
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.life -= 1;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) {
          particle.vx *= -0.8;
        }

        // Remove particles that fall below screen
        if (particle.y > canvas.height + 50) {
          particle.life = 0;
        }

        if (particle.life > 0) {
          activeParticles++;
          
          // Draw particle
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.globalAlpha = particle.life / particle.maxLife;
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
          ctx.restore();
        }
      });

      if (activeParticles > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 9999 }}
    />
  );
};

const predefinedAchievements: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain positive cash flow for 3 consecutive months',
    category: 'streak',
    difficulty: 'bronze',
    icon: '🔥',
    progress: 8,
    maxProgress: 3,
    isUnlocked: true,
    unlockedAt: new Date('2024-02-15'),
    points: 100,
    rarity: 'common',
    requirements: ['3 months above zero cash flow'],
    reward: {
      type: 'badge',
      value: 'Fire Starter Badge'
    },
    animationType: 'bounce',
    hapticFeedback: 'light'
  },
  {
    id: 'streak-champion',
    title: 'Streak Champion',
    description: 'Achieve a 12-month above-zero streak',
    category: 'streak',
    difficulty: 'gold',
    icon: '👑',
    progress: 8,
    maxProgress: 12,
    isUnlocked: false,
    points: 500,
    rarity: 'rare',
    requirements: ['12 consecutive months above zero'],
    reward: {
      type: 'title',
      value: 'Wealth Champion'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  // Savings Achievements
  {
    id: 'savings-master',
    title: 'Savings Master',
    description: 'Achieve a 25% or higher savings rate',
    category: 'savings',
    difficulty: 'silver',
    icon: '💰',
    progress: 32,
    maxProgress: 25,
    isUnlocked: true,
    unlockedAt: new Date('2024-03-01'),
    points: 250,
    rarity: 'uncommon',
    requirements: ['Maintain 25% savings rate for 3 months'],
    reward: {
      type: 'feature',
      value: 'Advanced Analytics Access'
    },
    animationType: 'sparkle',
    hapticFeedback: 'medium'
  },
  {
    id: 'high-saver',
    title: 'High Saver Elite',
    description: 'Reach 50% savings rate - the elite tier',
    category: 'savings',
    difficulty: 'platinum',
    icon: '💎',
    progress: 32,
    maxProgress: 50,
    isUnlocked: false,
    points: 1000,
    rarity: 'epic',
    requirements: ['Achieve 50% savings rate', 'Maintain for 6 months'],
    reward: {
      type: 'title',
      value: 'Savings Elite'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  // Milestone Achievements
  {
    id: 'milestone-collector',
    title: 'Milestone Collector',
    description: 'Unlock 10 expense coverage milestones',
    category: 'milestone',
    difficulty: 'silver',
    icon: '🏆',
    progress: 15,
    maxProgress: 10,
    isUnlocked: true,
    unlockedAt: new Date('2024-01-20'),
    points: 300,
    rarity: 'uncommon',
    requirements: ['Cover 10 different expense categories'],
    reward: {
      type: 'badge',
      value: 'Milestone Master Badge'
    },
    animationType: 'glow',
    hapticFeedback: 'medium'
  },
  // Net Worth Achievements
  {
    id: 'six-figure-club',
    title: 'Six Figure Club',
    description: 'Reach $100,000+ net worth',
    category: 'milestone',
    difficulty: 'gold',
    icon: '🎯',
    progress: 125000,
    maxProgress: 100000,
    isUnlocked: true,
    unlockedAt: new Date('2024-03-10'),
    points: 750,
    rarity: 'rare',
    requirements: ['Net worth ≥ $100,000'],
    reward: {
      type: 'title',
      value: 'Six Figure Saver'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  {
    id: 'quarter-million',
    title: 'Quarter Million Milestone',
    description: 'Achieve $250,000 net worth',
    category: 'milestone',
    difficulty: 'platinum',
    icon: '💰',
    progress: 125000,
    maxProgress: 250000,
    isUnlocked: false,
    points: 1500,
    rarity: 'epic',
    requirements: ['Net worth ≥ $250,000'],
    reward: {
      type: 'feature',
      value: 'VIP Planning Tools'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  // Special Achievements
  {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'Join the platform in the first 100 users',
    category: 'special',
    difficulty: 'legendary',
    icon: '⭐',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: new Date('2024-01-01'),
    points: 2000,
    rarity: 'legendary',
    requirements: ['Be among first 100 users'],
    reward: {
      type: 'title',
      value: 'Founding Member'
    },
    animationType: 'confetti',
    hapticFeedback: 'heavy'
  },
  {
    id: 'social-sharer',
    title: 'Social Butterfly',
    description: 'Share 5 achievements on social media',
    category: 'special',
    difficulty: 'bronze',
    icon: '🦋',
    progress: 0,
    maxProgress: 5,
    isUnlocked: false,
    points: 150,
    rarity: 'common',
    requirements: ['Share achievements 5 times'],
    reward: {
      type: 'badge',
      value: 'Social Connector Badge'
    },
    animationType: 'bounce',
    hapticFeedback: 'light'
  },
  // Goal Achievement
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'Complete 3 SMART financial goals',
    category: 'goal',
    difficulty: 'gold',
    icon: '🎖️',
    progress: 1,
    maxProgress: 3,
    isUnlocked: false,
    points: 600,
    rarity: 'rare',
    requirements: ['Complete 3 SMART goals'],
    reward: {
      type: 'feature',
      value: 'Advanced Goal Tracking'
    },
    animationType: 'sparkle',
    hapticFeedback: 'medium'
  },
  
  // Income Milestones - Income Clarity Specific
  {
    id: 'first-100-income',
    title: 'First $100/Month',
    description: 'Your first $100 in monthly dividend income! The journey begins!',
    category: 'income',
    difficulty: 'bronze',
    icon: '💰',
    progress: 0,
    maxProgress: 100,
    isUnlocked: false,
    points: 200,
    rarity: 'common',
    requirements: ['Earn $100+ monthly dividend income'],
    reward: {
      type: 'badge',
      value: 'Income Starter Badge'
    },
    animationType: 'confetti',
    hapticFeedback: 'light'
  },
  {
    id: 'income-500',
    title: 'Half-Grand Monthly',
    description: '$500/month in dividends! You are building serious momentum!',
    category: 'income',
    difficulty: 'silver',
    icon: '💵',
    progress: 0,
    maxProgress: 500,
    isUnlocked: false,
    points: 500,
    rarity: 'uncommon',
    requirements: ['Earn $500+ monthly dividend income'],
    reward: {
      type: 'title',
      value: 'Income Builder'
    },
    animationType: 'fireworks',
    hapticFeedback: 'medium'
  },
  {
    id: 'income-1000',
    title: '4-Figure Monthly Income',
    description: '$1,000/month! You have reached 4-figure passive income territory!',
    category: 'income',
    difficulty: 'gold',
    icon: '🏆',
    progress: 0,
    maxProgress: 1000,
    isUnlocked: false,
    points: 1000,
    rarity: 'rare',
    requirements: ['Earn $1,000+ monthly dividend income'],
    reward: {
      type: 'feature',
      value: 'Premium Analytics Access'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  
  // Coverage Milestones
  {
    id: 'coverage-25',
    title: 'Quarter Coverage',
    description: '25% of expenses covered by dividends! Great progress!',
    category: 'coverage',
    difficulty: 'bronze',
    icon: '🛡️',
    progress: 0,
    maxProgress: 25,
    isUnlocked: false,
    points: 300,
    rarity: 'common',
    requirements: ['Cover 25% of monthly expenses with dividends'],
    reward: {
      type: 'badge',
      value: 'Coverage Pioneer Badge'
    },
    animationType: 'glow',
    hapticFeedback: 'light'
  },
  {
    id: 'coverage-50',
    title: 'Halfway Hero',
    description: '50% expense coverage! You are halfway to financial freedom!',
    category: 'coverage',
    difficulty: 'silver',
    icon: '🌟',
    progress: 0,
    maxProgress: 50,
    isUnlocked: false,
    points: 600,
    rarity: 'uncommon',
    requirements: ['Cover 50% of monthly expenses with dividends'],
    reward: {
      type: 'title',
      value: 'Halfway Hero'
    },
    animationType: 'sparkle',
    hapticFeedback: 'medium'
  },
  {
    id: 'coverage-100',
    title: 'Full Coverage Champion',
    description: '100% expense coverage! You have achieved financial independence!',
    category: 'coverage',
    difficulty: 'legendary',
    icon: '👑',
    progress: 0,
    maxProgress: 100,
    isUnlocked: false,
    points: 2000,
    rarity: 'legendary',
    requirements: ['Cover 100% of monthly expenses with dividends'],
    reward: {
      type: 'title',
      value: 'Financial Independence Champion'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  
  // Portfolio Milestones
  {
    id: 'portfolio-10k',
    title: '10K Portfolio',
    description: '$10,000 portfolio milestone! Your money is starting to work for you!',
    category: 'portfolio',
    difficulty: 'bronze',
    icon: '💎',
    progress: 0,
    maxProgress: 10000,
    isUnlocked: false,
    points: 250,
    rarity: 'common',
    requirements: ['Reach $10,000 portfolio value'],
    reward: {
      type: 'badge',
      value: '10K Club Badge'
    },
    animationType: 'bounce',
    hapticFeedback: 'light'
  },
  {
    id: 'portfolio-100k',
    title: 'Six Figure Portfolio',
    description: '$100,000! Welcome to the six-figure club!',
    category: 'portfolio',
    difficulty: 'gold',
    icon: '🎯',
    progress: 0,
    maxProgress: 100000,
    isUnlocked: false,
    points: 1500,
    rarity: 'rare',
    requirements: ['Reach $100,000 portfolio value'],
    reward: {
      type: 'title',
      value: 'Six Figure Investor'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  
  // Tax Savings Achievements
  {
    id: 'tax-savings-1k',
    title: 'Tax Savings Starter',
    description: 'Saved $1,000 in taxes through optimization! Smart moves!',
    category: 'tax',
    difficulty: 'bronze',
    icon: '🧮',
    progress: 0,
    maxProgress: 1000,
    isUnlocked: false,
    points: 400,
    rarity: 'uncommon',
    requirements: ['Save $1,000+ through tax optimization'],
    reward: {
      type: 'feature',
      value: 'Advanced Tax Analytics'
    },
    animationType: 'sparkle',
    hapticFeedback: 'medium'
  },
  {
    id: 'tax-savings-10k',
    title: 'Tax Optimization Master',
    description: '$10,000 in tax savings! You have mastered the tax game!',
    category: 'tax',
    difficulty: 'platinum',
    icon: '📊',
    progress: 0,
    maxProgress: 10000,
    isUnlocked: false,
    points: 2000,
    rarity: 'epic',
    requirements: ['Save $10,000+ through tax optimization'],
    reward: {
      type: 'title',
      value: 'Tax Optimization Guru'
    },
    animationType: 'fireworks',
    hapticFeedback: 'heavy'
  },
  
  // FIRE Progress Achievements
  {
    id: 'fire-progress-10',
    title: 'FIRE Journey Begins',
    description: '10% progress toward Financial Independence! The journey starts!',
    category: 'fire',
    difficulty: 'bronze',
    icon: '🚀',
    progress: 0,
    maxProgress: 10,
    isUnlocked: false,
    points: 300,
    rarity: 'common',
    requirements: ['Reach 10% FIRE progress'],
    reward: {
      type: 'badge',
      value: 'FIRE Starter Badge'
    },
    animationType: 'glow',
    hapticFeedback: 'light'
  },
  {
    id: 'fire-progress-50',
    title: 'Halfway to FIRE',
    description: '50% FIRE progress! You are halfway to financial independence!',
    category: 'fire',
    difficulty: 'gold',
    icon: '🌅',
    progress: 0,
    maxProgress: 50,
    isUnlocked: false,
    points: 1000,
    rarity: 'rare',
    requirements: ['Reach 50% FIRE progress'],
    reward: {
      type: 'title',
      value: 'FIRE Voyager'
    },
    animationType: 'fireworks',
    hapticFeedback: 'medium'
  }
];

export const MilestoneCelebrations = ({
  userProgress = defaultUserProgress,
  achievements = predefinedAchievements,
  onAchievementUnlock,
  onCelebrationShare,
  className = '',
  enableHaptics = true,
  enableSounds = false,
  autoDetectMilestones = true,
  persistAchievements = true
}: MilestoneCelebrationsProps) => {
  // Core state
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'points' | 'progress' | 'date'>('rarity');
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  
  // Animation state
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationQueue, setCelebrationQueue] = useState<Achievement[]>([]);
  
  // Store integration
  const userStore = useUserStore();
  const user = userStore.user;
  const portfolioValueData = useCurrentPortfolioValue();
  const portfolioValue = typeof portfolioValueData === 'object' ? portfolioValueData.value : portfolioValueData;
  const userGoals = useUserGoals();
  const planningData = usePlanningHub();
  
  // Achievement persistence
  const [achievementHistory, setAchievementHistory] = useState<Achievement[]>(() => {
    if (typeof window !== 'undefined' && persistAchievements) {
      const stored = localStorage.getItem('income-clarity-achievements');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Calculate level progress
  const levelProgress = useMemo(() => {
    const levelBasePoints = 1000;
    const levelMultiplier = 1.5;
    const currentLevelPoints = levelBasePoints * Math.pow(levelMultiplier, userProgress.level - 1);
    const nextLevelPoints = levelBasePoints * Math.pow(levelMultiplier, userProgress.level);
    const progressInLevel = userProgress.totalPoints - currentLevelPoints;
    const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;
    const progressPercentage = (progressInLevel / pointsNeededForLevel) * 100;
    
    return {
      currentLevelPoints,
      nextLevelPoints,
      progressInLevel,
      pointsNeededForLevel,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage))
    };
  }, [userProgress.level, userProgress.totalPoints]);

  // Animated values
  const animatedValues = useStaggeredCountingAnimation(
    {
      level: userProgress.level,
      totalPoints: userProgress.totalPoints,
      levelProgress: levelProgress.progressPercentage,
      unlockedCount: achievements.filter(a => a.isUnlocked).length
    },
    1000,
    100
  );

  // Smart milestone detection
  const detectMilestones = useCallback(() => {
    if (!autoDetectMilestones) return [];
    
    const currentData = {
      monthlyIncome: planningData.fireData?.monthlyInvestment || userProgress.monthlyIncome,
      portfolioValue: portfolioValue || userProgress.portfolioValue,
      netWorth: planningData.fireData?.netWorth || userProgress.netWorth,
      currentStreak: planningData.aboveZeroData?.currentStreak || userProgress.currentStreak,
      longestStreak: planningData.aboveZeroData?.longestStreak || userProgress.longestStreak,
      fireProgress: planningData.fireData?.fireProgress || userProgress.fireProgress,
      expenseCoverage: userProgress.expenseCoverage,
      taxSavings: userProgress.taxSavings,
      customGoalsCompleted: userProgress.customGoalsCompleted,
      savingsRate: userProgress.savingsRate
    };
    
    return achievements.filter(achievement => {
      if (achievement.isUnlocked) return false;
      
      switch (achievement.category) {
        case 'income':
          if (achievement.id === 'first-100-income') {
            return currentData.monthlyIncome >= 100;
          }
          if (achievement.id === 'income-500') {
            return currentData.monthlyIncome >= 500;
          }
          if (achievement.id === 'income-1000') {
            return currentData.monthlyIncome >= 1000;
          }
          break;
          
        case 'coverage':
          if (achievement.id === 'coverage-25') {
            return currentData.expenseCoverage >= 25;
          }
          if (achievement.id === 'coverage-50') {
            return currentData.expenseCoverage >= 50;
          }
          if (achievement.id === 'coverage-100') {
            return currentData.expenseCoverage >= 100;
          }
          break;
          
        case 'portfolio':
          if (achievement.id === 'portfolio-10k') {
            return currentData.portfolioValue >= 10000;
          }
          if (achievement.id === 'portfolio-100k') {
            return currentData.portfolioValue >= 100000;
          }
          break;
          
        case 'streak':
          if (achievement.id === 'streak-starter') {
            return currentData.currentStreak >= 3;
          }
          if (achievement.id === 'streak-champion') {
            return currentData.longestStreak >= 12;
          }
          break;
          
        case 'tax':
          if (achievement.id === 'tax-savings-1k') {
            return currentData.taxSavings >= 1000;
          }
          if (achievement.id === 'tax-savings-10k') {
            return currentData.taxSavings >= 10000;
          }
          break;
          
        case 'fire':
          if (achievement.id === 'fire-progress-10') {
            return currentData.fireProgress >= 10;
          }
          if (achievement.id === 'fire-progress-50') {
            return currentData.fireProgress >= 50;
          }
          break;
          
        case 'savings':
          if (achievement.id === 'savings-master') {
            return currentData.savingsRate >= 25;
          }
          if (achievement.id === 'high-saver') {
            return currentData.savingsRate >= 50;
          }
          break;
          
        case 'milestone':
          if (achievement.id === 'six-figure-club') {
            return currentData.netWorth >= 100000;
          }
          if (achievement.id === 'quarter-million') {
            return currentData.netWorth >= 250000;
          }
          if (achievement.id === 'milestone-collector') {
            return userProgress.milestonesUnlocked >= 10;
          }
          break;
      }
      return false;
    });
  }, [achievements, autoDetectMilestones, planningData, portfolioValue, userProgress]);
  
  // Haptic feedback function
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    if (!enableHaptics || typeof navigator === 'undefined' || !navigator.vibrate) return;
    
    const patterns = {
      light: [50],
      medium: [100, 50, 100],
      heavy: [200, 100, 200, 100, 200]
    };
    
    navigator.vibrate(patterns[intensity]);
  }, [enableHaptics]);
  
  // Celebration queue management
  const processCelebrationQueue = useCallback(() => {
    if (celebrationQueue.length === 0 || showCelebration) return;
    
    const nextCelebration = celebrationQueue[0];
    setCelebrationQueue(queue => queue.slice(1));
    setShowCelebration(nextCelebration);
    
    // Trigger effects based on animation type
    if (nextCelebration.animationType === 'confetti' || nextCelebration.animationType === 'fireworks') {
      setShowConfetti(true);
    }
    
    // Trigger haptic feedback
    if (nextCelebration.hapticFeedback) {
      triggerHapticFeedback(nextCelebration.hapticFeedback);
    }
    
    // Auto-dismiss celebration
    setTimeout(() => {
      setShowCelebration(null);
      setShowConfetti(false);
    }, 4000);
  }, [celebrationQueue, showCelebration, triggerHapticFeedback]);
  
  // Process celebration queue
  useEffect(() => {
    processCelebrationQueue();
  }, [processCelebrationQueue]);
  
  // Check for newly unlocked achievements
  useEffect(() => {
    const potentiallyUnlocked = detectMilestones();
    
    if (potentiallyUnlocked.length > 0) {
      // Update achievements as unlocked
      const updatedAchievements = achievements.map(achievement => {
        const isNewlyUnlocked = potentiallyUnlocked.find(a => a.id === achievement.id);
        if (isNewlyUnlocked) {
          const unlockedAchievement = {
            ...achievement,
            isUnlocked: true,
            unlockedAt: new Date()
          };
          
          // Add to persistent storage
          if (persistAchievements) {
            setAchievementHistory(prev => {
              const updated = [...prev.filter(a => a.id !== achievement.id), unlockedAchievement];
              localStorage.setItem('income-clarity-achievements', JSON.stringify(updated));
              return updated;
            });
          }
          
          return unlockedAchievement;
        }
        return achievement;
      });
      
      setNewlyUnlocked(potentiallyUnlocked);
      
      // Add to celebration queue
      setCelebrationQueue(prev => [...prev, ...potentiallyUnlocked]);
      
      // Notify parent component
      potentiallyUnlocked.forEach(achievement => {
        if (onAchievementUnlock) {
          onAchievementUnlock(achievement.id);
        }
      });
    }
  }, [achievements, detectMilestones, onAchievementUnlock, persistAchievements]);

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements.filter(achievement => {
      switch (filter) {
        case 'unlocked': return achievement.isUnlocked;
        case 'locked': return !achievement.isUnlocked;
        case 'recent': return achievement.unlockedAt && 
          new Date().getTime() - achievement.unlockedAt.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days
        default: return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'points':
          return b.points - a.points;
        case 'progress':
          const aProgress = a.progress / a.maxProgress;
          const bProgress = b.progress / b.maxProgress;
          return bProgress - aProgress;
        case 'date':
          if (!a.unlockedAt && !b.unlockedAt) return 0;
          if (!a.unlockedAt) return 1;
          if (!b.unlockedAt) return -1;
          return b.unlockedAt.getTime() - a.unlockedAt.getTime();
        default:
          return 0;
      }
    });
  }, [achievements, filter, sortBy]);

  const getDifficultyColor = (difficulty: Achievement['difficulty']) => {
    switch (difficulty) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'legendary': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const shareAchievement = (achievement: Achievement) => {
    if (onCelebrationShare) {
      onCelebrationShare(achievement);
    }
    // Mock sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `I just unlocked: ${achievement.title}!`,
        text: achievement.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(`I just unlocked: ${achievement.title}! ${achievement.description}`);
      });
    }
  };

  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Confetti Animation */}
      <ConfettiCanvas 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 text-center max-w-md w-full border-4 border-yellow-200"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{
                  scale: showCelebration.animationType === 'bounce' ? [1, 1.3, 1] : [1, 1.2, 1],
                  rotate: showCelebration.animationType === 'sparkle' ? [0, 10, -10, 0] : [0, 5, -5, 0],
                  opacity: showCelebration.animationType === 'glow' ? [1, 0.8, 1] : 1
                }}
                transition={{
                  duration: showCelebration.animationType === 'bounce' ? 0.8 : 0.6,
                  repeat: showCelebration.animationType === 'fireworks' ? 3 : 2
                }}
                style={{
                  filter: showCelebration.animationType === 'glow' ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'none'
                }}
              >
                {showCelebration.icon}
              </motion.div>
              
              <motion.h3
                className="text-2xl font-bold text-orange-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Achievement Unlocked!
              </motion.h3>
              
              <motion.div
                className="text-lg font-semibold text-orange-700 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {showCelebration.title}
              </motion.div>
              
              <motion.p
                className="text-orange-600 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {showCelebration.description}
              </motion.p>
              
              <motion.div
                className="flex items-center justify-center space-x-2 mb-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-yellow-600">+{showCelebration.points} Points</span>
                <Star className="w-5 h-5 text-yellow-500" />
              </motion.div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    shareAchievement(showCelebration);
                    if (enableHaptics) triggerHapticFeedback('light');
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => {
                    setShowCelebration(null);
                    setShowConfetti(false);
                  }}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Level Progress */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Level {Math.round(animatedValues.level)}</h2>
              <p className="text-slate-600">Wealth Building Champion</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(animatedValues.totalPoints).toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Points</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              Level {userProgress.level} Progress
            </span>
            <span className="text-sm text-slate-600">
              {levelProgress.pointsNeededForLevel - levelProgress.progressInLevel} points to next level
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
              initial={{ width: 0 }}
              animate={{ width: `${animatedValues.levelProgress}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              {animatedValues.levelProgress > 15 && (
                <span className="text-xs font-semibold text-white">
                  {animatedValues.levelProgress.toFixed(1)}%
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-green-600 mb-1">
              {Math.round(animatedValues.unlockedCount)}
            </div>
            <div className="text-xs text-slate-600">Unlocked</div>
          </div>
          
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-orange-600 mb-1">
              {achievements.length - Math.round(animatedValues.unlockedCount)}
            </div>
            <div className="text-xs text-slate-600">Remaining</div>
          </div>
          
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-blue-600 mb-1">
              {((Math.round(animatedValues.unlockedCount) / achievements.length) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'unlocked' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'locked' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Locked
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'recent' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recent
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="rarity">Rarity</option>
            <option value="points">Points</option>
            <option value="progress">Progress</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
            const isNearCompletion = !achievement.isUnlocked && progressPercentage >= 80;
            
            return (
              <motion.div
                key={achievement.id}
                className={`relative overflow-hidden rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                  achievement.isUnlocked 
                    ? 'bg-white border-green-200 hover:border-green-300' 
                    : isNearCompletion
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedAchievement(achievement);
                  if (enableHaptics) triggerHapticFeedback('light');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Rarity Indicator */}
                <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full font-semibold ${
                  achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                  achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {achievement.rarity}
                </div>

                {/* Lock/Unlock Status */}
                <div className="absolute top-2 left-2">
                  {achievement.isUnlocked ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Achievement Icon */}
                <div className="text-center mb-4">
                  <motion.div 
                    className={`text-6xl mb-2 ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}
                    whileHover={achievement.isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  >
                    {achievement.icon}
                  </motion.div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(achievement.difficulty)}`}>
                    {achievement.difficulty}
                  </div>
                </div>

                {/* Achievement Info */}
                <div className="text-center mb-4">
                  <h3 className={`font-bold text-lg mb-2 ${
                    achievement.isUnlocked ? 'text-slate-800' : 'text-slate-600'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    achievement.isUnlocked ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-600">Progress</span>
                    <span className="text-xs text-slate-500">
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        achievement.isUnlocked ? 'bg-green-500' :
                        progressPercentage >= 80 ? 'bg-yellow-500' :
                        progressPercentage >= 50 ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, progressPercentage)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Points and Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-600">
                      {achievement.points}
                    </span>
                  </div>
                  
                  {achievement.unlockedAt && (
                    <div className="text-xs text-slate-500">
                      {formatDate(achievement.unlockedAt)}
                    </div>
                  )}
                </div>

                {/* Near Completion Indicator */}
                {isNearCompletion && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(251, 191, 36, 0)',
                        '0 0 0 4px rgba(251, 191, 36, 0.3)',
                        '0 0 0 0 rgba(251, 191, 36, 0)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Achievements Found</h3>
          <p className="text-slate-500">
            {filter === 'all' ? 'Keep building wealth to unlock achievements!' : 
             filter === 'unlocked' ? 'No achievements unlocked yet' :
             filter === 'recent' ? 'No recent achievements' : 
             'Keep working toward your goals!'}
          </p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{selectedAchievement.icon}</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {selectedAchievement.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {selectedAchievement.description}
                </p>
                
                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(selectedAchievement.difficulty)}`}>
                  {selectedAchievement.difficulty} • {selectedAchievement.points} points
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-700 mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  {selectedAchievement.requirements.map((req, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reward */}
              {selectedAchievement.reward && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h4 className="font-semibold text-slate-700 mb-1">Reward:</h4>
                  <p className="text-sm text-slate-600">
                    {selectedAchievement.reward.value}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                {selectedAchievement.isUnlocked && (
                  <button
                    onClick={() => {
                      shareAchievement(selectedAchievement);
                      if (enableHaptics) triggerHapticFeedback('light');
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};