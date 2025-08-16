'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star,
  Building,
  DollarSign,
  PieChart,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { Button } from '../forms'

interface PortfolioMetrics {
  totalValue: number
  totalCostBasis: number
  totalGainLoss: number
  totalReturn: number
  holdingsCount: number
}

interface Portfolio {
  id: string
  name: string
  type: string
  institution?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
  holdings: any[]
  metrics: PortfolioMetrics
}

interface PortfolioCardProps {
  portfolio: Portfolio
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function PortfolioCard({ portfolio, onClick, onEdit, onDelete }: PortfolioCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const {
    id,
    name,
    type,
    institution,
    isPrimary,
    createdAt,
    metrics
  } = portfolio

  const {
    totalValue,
    totalCostBasis,
    totalGainLoss,
    totalReturn,
    holdingsCount
  } = metrics

  const isGain = totalGainLoss >= 0
  const formattedReturn = totalReturn.toFixed(1)
  const formattedValue = totalValue.toLocaleString()
  const formattedGainLoss = Math.abs(totalGainLoss).toLocaleString()

  const getTypeColor = (type: string) => {
    switch (type) {
      case '401k': return 'bg-blue-100 text-blue-800'
      case 'IRA': return 'bg-purple-100 text-purple-800'
      case 'Taxable': return 'bg-green-100 text-green-800'
      case 'Crypto': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    
    switch (action) {
      case 'edit':
        onEdit?.()
        break
      case 'delete':
        onDelete?.()
        break
    }
  }

  return (
    <div 
      className={`
        relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer group
        hover:shadow-md hover:border-blue-200
        ${isPrimary ? 'border-yellow-300 bg-gradient-to-br from-white to-yellow-50' : 'border-gray-200'}
      `}
      onClick={onClick}
    >
      {/* Primary Badge */}
      {isPrimary && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg">
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>
      )}

      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <button
                  onClick={(e) => handleMenuAction('edit', e)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Portfolio</span>
                </button>
                <button
                  onClick={(e) => handleMenuAction('delete', e)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Portfolio</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-8">
                {name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                  {type}
                </span>
                {institution && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Building className="w-3 h-3 mr-1" />
                    <span className="truncate">{institution}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Value Section */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${formattedValue}
              </p>
              <p className="text-sm text-gray-600">
                Total Value
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                {isGain ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="font-semibold">
                  {formattedReturn}%
                </span>
              </div>
              <p className={`text-sm ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                {isGain ? '+' : '-'}${formattedGainLoss}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <PieChart className="w-4 h-4 mr-1" />
            <span>{holdingsCount} holdings</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Performance Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Performance</span>
            <span>{formattedReturn}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                isGain ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min(Math.abs(totalReturn) * 2, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Last updated {new Date(portfolio.updatedAt).toLocaleDateString()}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </div>
  )
}