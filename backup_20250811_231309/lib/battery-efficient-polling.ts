// MPERF-007: Battery-Efficient Polling Strategies for Mobile Performance
// Reduces polling frequency based on battery level, network conditions, and user activity
// Implements intelligent backoff and pause strategies

import { NetworkAdapter, NetworkCondition } from './network-adapter'

export interface BatteryStatus {
  level: number // 0-1 (0% to 100%)
  charging: boolean
  dischargingTime: number // seconds until battery depleted (Infinity if charging)
  chargingTime: number // seconds until fully charged (Infinity if not charging)
}

export interface PollingConfig {
  baseInterval: number // Base polling interval in ms
  maxInterval: number // Maximum polling interval in ms
  minInterval: number // Minimum polling interval in ms
  batteryThresholds: {
    critical: number // Below this level, disable polling (0-1)
    low: number // Below this level, reduce polling significantly (0-1)
    moderate: number // Below this level, reduce polling moderately (0-1)
  }
  networkAdjustments: {
    slow: number // Multiplier for slow networks
    moderate: number // Multiplier for moderate networks
    fast: number // Multiplier for fast networks
  }
  userActivityAdjustments: {
    inactive: number // Multiplier when user is inactive
    background: number // Multiplier when page is in background
    active: number // Multiplier when user is actively using the app
  }
  enabled: boolean
}

export type PollingStrategy = 'realtime' | 'frequent' | 'normal' | 'reduced' | 'minimal' | 'disabled'

export class BatteryEfficientPolling {
  private static instance: BatteryEfficientPolling | null = null
  
  private batteryStatus: BatteryStatus | null = null
  private networkCondition: NetworkCondition | null = null
  private userActivity: 'active' | 'inactive' | 'background' = 'active'
  private lastActivity = Date.now()
  
  private pollers = new Map<string, NodeJS.Timeout>()
  private pollingConfigs = new Map<string, PollingConfig>()
  private listeners = new Map<string, (() => void)[]>()
  
  private batteryMonitoringInterval: NodeJS.Timeout | null = null
  private activityCheckInterval: NodeJS.Timeout | null = null

  // Default polling configurations for different data types
  private static defaultConfigs: Record<string, PollingConfig> = {
    'market-data': {
      baseInterval: 30000, // 30 seconds
      maxInterval: 300000, // 5 minutes
      minInterval: 5000, // 5 seconds
      batteryThresholds: {
        critical: 0.05, // 5%
        low: 0.15, // 15%
        moderate: 0.30 // 30%
      },
      networkAdjustments: {
        slow: 3.0,
        moderate: 1.5,
        fast: 0.8
      },
      userActivityAdjustments: {
        inactive: 4.0,
        background: 8.0,
        active: 1.0
      },
      enabled: true
    },
    
    'portfolio-updates': {
      baseInterval: 60000, // 1 minute
      maxInterval: 600000, // 10 minutes
      minInterval: 10000, // 10 seconds
      batteryThresholds: {
        critical: 0.05,
        low: 0.20,
        moderate: 0.35
      },
      networkAdjustments: {
        slow: 2.5,
        moderate: 1.3,
        fast: 0.9
      },
      userActivityAdjustments: {
        inactive: 3.0,
        background: 6.0,
        active: 1.0
      },
      enabled: true
    },
    
    'notifications': {
      baseInterval: 120000, // 2 minutes
      maxInterval: 900000, // 15 minutes
      minInterval: 30000, // 30 seconds
      batteryThresholds: {
        critical: 0.03, // More critical for notifications
        low: 0.10,
        moderate: 0.25
      },
      networkAdjustments: {
        slow: 4.0,
        moderate: 2.0,
        fast: 1.0
      },
      userActivityAdjustments: {
        inactive: 2.0,
        background: 3.0,
        active: 1.0
      },
      enabled: true
    },
    
    'analytics': {
      baseInterval: 300000, // 5 minutes
      maxInterval: 1800000, // 30 minutes
      minInterval: 60000, // 1 minute
      batteryThresholds: {
        critical: 0.10, // Less critical
        low: 0.25,
        moderate: 0.40
      },
      networkAdjustments: {
        slow: 5.0,
        moderate: 2.0,
        fast: 1.0
      },
      userActivityAdjustments: {
        inactive: 5.0,
        background: 10.0,
        active: 1.0
      },
      enabled: true
    }
  }

  private constructor() {
    this.initializeBatteryMonitoring()
    this.initializeNetworkMonitoring()
    this.initializeActivityMonitoring()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): BatteryEfficientPolling {
    if (!this.instance) {
      this.instance = new BatteryEfficientPolling()
    }
    return this.instance
  }

  /**
   * Start polling for a specific data type
   */
  startPolling(
    dataType: string,
    callback: () => void,
    customConfig?: Partial<PollingConfig>
  ): string {
    const config = {
      ...BatteryEfficientPolling.defaultConfigs[dataType] || BatteryEfficientPolling.defaultConfigs['portfolio-updates'],
      ...customConfig
    }
    
    this.pollingConfigs.set(dataType, config)
    
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, [])
    }
    this.listeners.get(dataType)!.push(callback)

    const pollerId = this.startPollerForDataType(dataType)
    
    // console.log(`Started battery-efficient polling for ${dataType} with strategy: ${this.getCurrentStrategy()}`)

    return pollerId
  }

  /**
   * Stop polling for a specific data type
   */
  stopPolling(dataType: string): void {
    if (this.pollers.has(dataType)) {
      clearInterval(this.pollers.get(dataType)!)
      this.pollers.delete(dataType)
    }
    
    this.listeners.delete(dataType)
    this.pollingConfigs.delete(dataType)
    
    // console.log(`Stopped polling for ${dataType}`)
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    for (const poller of this.pollers.values()) {
      clearInterval(poller)
    }
    
    this.pollers.clear()
    this.listeners.clear()
    this.pollingConfigs.clear()
    
    // console.log('Stopped all battery-efficient polling')
  }

  /**
   * Get current polling strategy based on conditions
   */
  getCurrentStrategy(): PollingStrategy {
    if (!this.batteryStatus) return 'normal'
    
    const { level, charging } = this.batteryStatus
    
    // Always allow normal polling when charging
    if (charging) {
      return this.userActivity === 'active' ? 'normal' : 'reduced'
    }
    
    // Battery level based strategy
    if (level <= 0.05) return 'disabled' // 5% - critical
    if (level <= 0.10) return 'minimal' // 10% - very low
    if (level <= 0.20) return 'reduced' // 20% - low
    if (level <= 0.30) return 'normal' // 30% - moderate
    
    // Network and activity considerations
    if (this.networkCondition?.quality === 'slow' || this.userActivity === 'background') {
      return 'reduced'
    }
    
    if (this.networkCondition?.quality === 'fast' && this.userActivity === 'active') {
      return 'frequent'
    }
    
    return 'normal'
  }

  /**
   * Get current polling intervals for all active pollers
   */
  getPollingStatus(): Record<string, {
    strategy: PollingStrategy
    currentInterval: number
    baseInterval: number
    nextPoll: number
    enabled: boolean
  }> {
    const status: Record<string, any> = {}
    
    for (const [dataType, config] of this.pollingConfigs) {
      const interval = this.calculatePollingInterval(config)
      const strategy = this.getCurrentStrategy()
      
      status[dataType] = {
        strategy,
        currentInterval: interval,
        baseInterval: config.baseInterval,
        nextPoll: interval,
        enabled: config.enabled && strategy !== 'disabled'
      }
    }
    
    return status
  }

  /**
   * Get battery and system status
   */
  getSystemStatus() {
    return {
      battery: this.batteryStatus,
      network: this.networkCondition,
      userActivity: this.userActivity,
      strategy: this.getCurrentStrategy(),
      activePollers: this.pollers.size,
      lastActivity: this.lastActivity,
      timeSinceLastActivity: Date.now() - this.lastActivity
    }
  }

  /**
   * Force refresh of all pollers (emergency update)
   */
  forceRefresh(): void {
    // console.log('Forcing immediate refresh of all pollers')

    for (const [dataType, callbacks] of this.listeners) {
      callbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          // Error handled by emergency recovery script)
    }
  }

  /**
   * Pause polling (e.g., when app goes to background)
   */
  pausePolling(): void {
    for (const poller of this.pollers.values()) {
      clearInterval(poller)
    }
    this.pollers.clear()
    
    // console.log('Paused all polling due to background state')
  }

  /**
   * Resume polling with current strategy
   */
  resumePolling(): void {
    for (const dataType of this.pollingConfigs.keys()) {
      this.startPollerForDataType(dataType)
    }
    
    // console.log('Resumed polling with strategy:', this.getCurrentStrategy())
  }

  // Private methods

  private async initializeBatteryMonitoring() {
    if (typeof window === 'undefined' || !('getBattery' in navigator)) {
      // console.warn('Battery API not supported')
      // return
    }

    try {
      const battery = await (navigator as any).getBattery()
      
      this.batteryStatus = {
        level: battery.level,
        charging: battery.charging,
        dischargingTime: battery.dischargingTime,
        chargingTime: battery.chargingTime
      }

      // Listen for battery events
      battery.addEventListener('levelchange', () => {
        if (this.batteryStatus) {
          this.batteryStatus.level = battery.level
          this.onBatteryChange()
        }
      })

      battery.addEventListener('chargingchange', () => {
        if (this.batteryStatus) {
          this.batteryStatus.charging = battery.charging
          this.onBatteryChange()
        }
      })

      battery.addEventListener('dischargingtimechange', () => {
        if (this.batteryStatus) {
          this.batteryStatus.dischargingTime = battery.dischargingTime
        }
      })

      // console.log('Battery monitoring initialized:', this.batteryStatus)

      // Periodic battery status updates
      this.batteryMonitoringInterval = setInterval(() => {
        if (this.batteryStatus) {
          this.batteryStatus.level = battery.level
          this.batteryStatus.charging = battery.charging
          this.batteryStatus.dischargingTime = battery.dischargingTime
          this.batteryStatus.chargingTime = battery.chargingTime
        }
      }, 30000) // Check every 30 seconds

    } catch (error) {
      // Error handled by emergency recovery script

  private initializeNetworkMonitoring() {
    NetworkAdapter.addListener((condition) => {
      this.networkCondition = condition
      this.onNetworkChange()
    })
    
    this.networkCondition = NetworkAdapter.getCurrentCondition()
  }

  private initializeActivityMonitoring() {
    if (typeof window === 'undefined') return

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const updateActivity = () => {
      this.lastActivity = Date.now()
      if (this.userActivity !== 'active') {
        this.userActivity = 'active'
        this.onActivityChange()
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.userActivity = 'background'
        this.pausePolling()
      } else {
        this.userActivity = 'active'
        this.resumePolling()
      }
      this.onActivityChange()
    })

    // Check for inactivity
    this.activityCheckInterval = setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity
      
      if (timeSinceActivity > 300000 && this.userActivity === 'active') { // 5 minutes
        this.userActivity = 'inactive'
        this.onActivityChange()
      }
    }, 60000) // Check every minute
  }

  private onBatteryChange() {
    // console.log('Battery status changed:', this.batteryStatus)
    // this.restartAllPollers()
  }

  private onNetworkChange() {
    // console.log('Network condition changed:', this.networkCondition)
    // this.restartAllPollers()
  }

  private onActivityChange() {
    // console.log('User activity changed:', this.userActivity)
    // this.restartAllPollers()
  }

  private restartAllPollers() {
    // Restart all pollers with new intervals
    for (const dataType of this.pollingConfigs.keys()) {
      if (this.pollers.has(dataType)) {
        clearInterval(this.pollers.get(dataType)!)
        this.startPollerForDataType(dataType)
      }
    }
  }

  private startPollerForDataType(dataType: string): string {
    const config = this.pollingConfigs.get(dataType)
    if (!config || !config.enabled) return ''

    const strategy = this.getCurrentStrategy()
    
    if (strategy === 'disabled') {
      // console.log(`Polling disabled for ${dataType} due to critical battery`)
      // return ''
    }

    const interval = this.calculatePollingInterval(config)
    const callbacks = this.listeners.get(dataType) || []

    const poller = setInterval(() => {
      // Double-check strategy before polling
      const currentStrategy = this.getCurrentStrategy()
      if (currentStrategy === 'disabled') {
        this.stopPolling(dataType)
        return
      }

      // Execute callbacks
      callbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          // Error handled by emergency recovery script)
    }, interval)

    this.pollers.set(dataType, poller)
    
    // console.log(`Started poller for ${dataType} with ${interval}ms interval (strategy: ${strategy})`)

    return dataType
  }

  private calculatePollingInterval(config: PollingConfig): number {
    let interval = config.baseInterval
    const strategy = this.getCurrentStrategy()

    // Apply strategy multipliers
    const strategyMultipliers = {
      'realtime': 0.5,
      'frequent': 0.7,
      'normal': 1.0,
      'reduced': 2.0,
      'minimal': 4.0,
      'disabled': Infinity
    }

    interval *= strategyMultipliers[strategy] || 1.0

    // Apply network adjustments
    if (this.networkCondition) {
      const networkMultiplier = config.networkAdjustments[this.networkCondition.quality] || 1.0
      interval *= networkMultiplier
    }

    // Apply user activity adjustments
    const activityMultiplier = config.userActivityAdjustments[this.userActivity] || 1.0
    interval *= activityMultiplier

    // Apply battery level adjustments
    if (this.batteryStatus && !this.batteryStatus.charging) {
      const { level } = this.batteryStatus
      const { batteryThresholds } = config
      
      if (level <= batteryThresholds.critical) {
        interval = Infinity // Effectively disabled
      } else if (level <= batteryThresholds.low) {
        interval *= 8.0
      } else if (level <= batteryThresholds.moderate) {
        interval *= 3.0
      }
    }

    // Clamp to min/max intervals
    interval = Math.max(config.minInterval, Math.min(config.maxInterval, interval))

    return Math.round(interval)
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAllPolling()
    
    if (this.batteryMonitoringInterval) {
      clearInterval(this.batteryMonitoringInterval)
    }
    
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval)
    }
    
    BatteryEfficientPolling.instance = null
  }
}

/**
 * Easy-to-use polling hook for React components
 */
export class PollingManager {
  private static batteryPolling = BatteryEfficientPolling.getInstance()

  /**
   * Start polling with automatic battery optimization
   */
  static startPolling(
    dataType: string,
    callback: () => void,
    options?: {
      baseInterval?: number
      priority?: 'high' | 'medium' | 'low'
      respectBattery?: boolean
    }
  ): string {
    const config: Partial<PollingConfig> = {}
    
    if (options?.baseInterval) {
      config.baseInterval = options.baseInterval
    }
    
    if (options?.priority === 'high') {
      config.batteryThresholds = {
        critical: 0.03,
        low: 0.10,
        moderate: 0.25
      }
    } else if (options?.priority === 'low') {
      config.batteryThresholds = {
        critical: 0.15,
        low: 0.30,
        moderate: 0.50
      }
    }
    
    if (options?.respectBattery === false) {
      config.batteryThresholds = {
        critical: 0.01,
        low: 0.05,
        moderate: 0.10
      }
    }

    return this.batteryPolling.startPolling(dataType, callback, config)
  }

  /**
   * Stop specific polling
   */
  static stopPolling(dataType: string): void {
    this.batteryPolling.stopPolling(dataType)
  }

  /**
   * Get current system status
   */
  static getSystemStatus() {
    return this.batteryPolling.getSystemStatus()
  }

  /**
   * Force refresh all data
   */
  static forceRefresh(): void {
    this.batteryPolling.forceRefresh()
  }

  /**
   * Check if polling is recommended
   */
  static isPollingRecommended(): boolean {
    const strategy = this.batteryPolling.getCurrentStrategy()
    return !['disabled', 'minimal'].includes(strategy)
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    BatteryEfficientPolling.getInstance().cleanup()
  })
}

export default BatteryEfficientPolling