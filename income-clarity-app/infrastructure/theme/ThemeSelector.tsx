'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Palette, ChevronDown, Moon, Sun } from 'lucide-react'

export function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">{currentTheme.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl overflow-hidden z-50 transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 border-b"
            style={{ 
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-secondary)'
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Choose Theme
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Select your preferred visual style
            </p>
          </div>

          {/* Theme Options */}
          <div className="max-h-96 overflow-y-auto">
            {/* Dark Themes Section */}
            <div className="p-2">
              <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                <Moon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Dark Themes
                </span>
              </div>
              {themes
                .filter(theme => theme.type === 'dark')
                .map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all duration-200 ${
                      currentTheme.id === theme.id ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: currentTheme.id === theme.id 
                        ? 'var(--color-accent)' 
                        : 'transparent',
                      color: currentTheme.id === theme.id 
                        ? '#ffffff' 
                        : 'var(--color-text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{theme.name}</div>
                        <div 
                          className="text-xs mt-0.5"
                          style={{ 
                            color: currentTheme.id === theme.id 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : 'var(--color-text-muted)' 
                          }}
                        >
                          {theme.description}
                        </div>
                      </div>
                      {/* Theme Preview Circles */}
                      <div className="flex space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.border
                          }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {/* Light Themes Section */}
            <div className="p-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                <Sun className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Light Themes
                </span>
              </div>
              {themes
                .filter(theme => theme.type === 'light')
                .map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all duration-200 ${
                      currentTheme.id === theme.id ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: currentTheme.id === theme.id 
                        ? 'var(--color-accent)' 
                        : 'transparent',
                      color: currentTheme.id === theme.id 
                        ? '#ffffff' 
                        : 'var(--color-text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{theme.name}</div>
                        <div 
                          className="text-xs mt-0.5"
                          style={{ 
                            color: currentTheme.id === theme.id 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : 'var(--color-text-muted)' 
                          }}
                        >
                          {theme.description}
                        </div>
                      </div>
                      {/* Theme Preview Circles */}
                      <div className="flex space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.border
                          }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}