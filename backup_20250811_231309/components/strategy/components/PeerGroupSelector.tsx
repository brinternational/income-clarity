/**
 * PeerGroupSelector Component
 * Advanced peer group selection with filtering and smart matching
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  CheckCircle
} from 'lucide-react';

interface PeerGroup {
  id: string;
  name: string;
  description: string;
  size: number;
  memberCount: number;
  avgPortfolioValue: number;
  criteria: string[];
  averageMetrics: {
    totalReturn: number;
    dividendYield: number;
    expenseCoverage: number;
    taxEfficiency: number;
    diversificationScore: number;
    riskAdjustedReturn: number;
    aboveZeroStreak: number;
    incomeStability: number;
  };
}

interface PeerGroupSelectorProps {
  selectedGroup: string;
  peerGroups: PeerGroup[];
  onChange: (groupId: string) => void;
  className?: string;
  userProfile?: {
    portfolioValue: number;
    location: string;
    strategy: string;
    experienceLevel: string;
  };
}

export const PeerGroupSelector: React.FC<PeerGroupSelectorProps> = ({
  selectedGroup,
  peerGroups,
  onChange,
  className = '',
  userProfile
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minSize: 0,
    maxSize: 10000,
    strategy: 'all',
    location: 'all',
    portfolioSize: 'all'
  });

  const currentGroup = useMemo(() => {
    return peerGroups.find(group => group.id === selectedGroup) || peerGroups[0];
  }, [peerGroups, selectedGroup]);

  const filteredGroups = useMemo(() => {
    return peerGroups.filter(group => {
      if (group.size < filters.minSize || group.size > filters.maxSize) return false;
      
      if (filters.strategy !== 'all') {
        const hasStrategy = group.criteria.some(criterion => 
          criterion.toLowerCase().includes(filters.strategy.toLowerCase())
        );
        if (!hasStrategy) return false;
      }
      
      if (filters.location !== 'all') {
        const hasLocation = group.criteria.some(criterion => 
          criterion.toLowerCase().includes(filters.location.toLowerCase())
        );
        if (!hasLocation) return false;
      }
      
      return true;
    });
  }, [peerGroups, filters]);

  const getRecommendedGroups = useMemo(() => {
    if (!userProfile) return [];
    
    return peerGroups
      .map(group => {
        let matchScore = 0;
        
        // Portfolio value matching
        if (userProfile.portfolioValue >= 1000000 && group.id.includes('high_net_worth')) matchScore += 30;
        else if (userProfile.portfolioValue >= 500000 && group.avgPortfolioValue >= 500000) matchScore += 20;
        else if (Math.abs(userProfile.portfolioValue - group.avgPortfolioValue) / group.avgPortfolioValue < 0.5) matchScore += 15;
        
        // Location matching
        if (group.criteria.some(c => c.toLowerCase().includes(userProfile.location.toLowerCase()))) matchScore += 25;
        
        // Strategy matching
        if (group.criteria.some(c => c.toLowerCase().includes(userProfile.strategy.toLowerCase()))) matchScore += 20;
        
        // Experience level matching
        if (group.criteria.some(c => c.toLowerCase().includes(userProfile.experienceLevel.toLowerCase()))) matchScore += 15;
        
        return { group, matchScore };
      })
      .filter(({ matchScore }) => matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map(({ group }) => group);
  }, [peerGroups, userProfile]);

  const formatPortfolioValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getGroupIcon = (group: PeerGroup) => {
    if (group.id.includes('pr') || group.criteria.some(c => c.includes('Puerto Rico'))) {
      return <MapPin className="h-5 w-5 text-green-600" />;
    }
    if (group.id.includes('covered_call')) {
      return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
    if (group.id.includes('fire')) {
      return <Briefcase className="h-5 w-5 text-orange-600" />;
    }
    if (group.id.includes('reit')) {
      return <DollarSign className="h-5 w-5 text-purple-600" />;
    }
    return <Users className="h-5 w-5 text-gray-600" />;
  };

  const clearFilters = () => {
    setFilters({
      minSize: 0,
      maxSize: 10000,
      strategy: 'all',
      location: 'all',
      portfolioSize: 'all'
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Current Selection */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-all hover:bg-white/15"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getGroupIcon(currentGroup)}
            <div className="text-left">
              <p className="font-medium">{currentGroup.name}</p>
              <p className="text-sm text-white/70">
                {currentGroup.size.toLocaleString()} members • Avg: {formatPortfolioValue(currentGroup.avgPortfolioValue)}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Expanded Selection Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Filters Toggle */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Select Peer Group</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 text-sm"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Strategy</label>
                        <select
                          value={filters.strategy}
                          onChange={(e) => setFilters(prev => ({ ...prev, strategy: e.target.value }))}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="all">All Strategies</option>
                          <option value="dividend">Dividend Focus</option>
                          <option value="covered call">Covered Call</option>
                          <option value="fire">FIRE</option>
                          <option value="reit">REIT Focus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                        <select
                          value={filters.location}
                          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="all">All Locations</option>
                          <option value="puerto rico">Puerto Rico</option>
                          <option value="us">US Mainland</option>
                          <option value="california">California</option>
                          <option value="texas">Texas</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">
                        Showing {filteredGroups.length} of {peerGroups.length} groups
                      </span>
                      <button
                        onClick={clearFilters}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recommended Groups */}
            {getRecommendedGroups.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-green-50">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Recommended for You
                </h4>
                <div className="space-y-2">
                  {getRecommendedGroups.slice(0, 2).map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        onChange(group.id);
                        setIsExpanded(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getGroupIcon(group)}
                          <div>
                            <p className="font-medium text-green-900 text-sm">{group.name}</p>
                            <p className="text-xs text-green-700">{group.size.toLocaleString()} members</p>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">Match</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Groups */}
            <div className="max-h-60 overflow-y-auto">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    onChange(group.id);
                    setIsExpanded(false);
                  }}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    group.id === selectedGroup ? 'bg-purple-50 border-purple-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getGroupIcon(group)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm">{group.name}</h4>
                          {group.id === selectedGroup && (
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {group.size.toLocaleString()} members
                          </span>
                          <span className="text-xs text-gray-500">
                            Avg: {formatPortfolioValue(group.avgPortfolioValue)}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            {group.averageMetrics.totalReturn.toFixed(1)}% return
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Criteria Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {group.criteria.slice(0, 3).map((criterion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {criterion}
                      </span>
                    ))}
                    {group.criteria.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{group.criteria.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No matching groups</h3>
                <p className="text-gray-600 text-sm">Try adjusting your filters or clear them to see all groups</p>
                <button
                  onClick={clearFilters}
                  className="mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};