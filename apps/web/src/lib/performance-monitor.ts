// Performance Monitoring System for GreenMate Mobile
import { analytics } from './analytics'

interface PerformanceEntry {
  name: string
  startTime: number
  duration?: number
  type: 'navigation' | 'resource' | 'measure' | 'paint' | 'layout-shift' | 'largest-contentful-paint' | 'first-input' | 'custom'
  value?: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  metadata?: Record<string, any>
}

interface VitalScore {
  lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' } | null
  fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' } | null
  cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' } | null
  fcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' } | null
  ttfb: { value: number; rating: 'good' | 'needs-improvement' | 'poor' } | null
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private entries: PerformanceEntry[] = []
  private vitals: VitalScore = { lcp: null, fid: null, cls: null, fcp: null, ttfb: null }
  private observers: PerformanceObserver[] = []
  private customMetrics = new Map<string, number>()
  private isEnabled = true

  private constructor() {
    this.setupPerformanceObservers()
    this.setupVitalsTracking()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Core Web Vitals thresholds
  private readonly THRESHOLDS = {
    LCP: { good: 2500, needsImprovement: 4000 }, // ms
    FID: { good: 100, needsImprovement: 300 },   // ms
    CLS: { good: 0.1, needsImprovement: 0.25 },  // score
    FCP: { good: 1800, needsImprovement: 3000 }, // ms
    TTFB: { good: 800, needsImprovement: 1800 }  // ms
  }

  private getRating(value: number, thresholds: { good: number; needsImprovement: number }): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          const value = lastEntry.startTime
          this.vitals.lcp = {
            value,
            rating: this.getRating(value, this.THRESHOLDS.LCP)
          }
          this.recordEntry({
            name: 'largest-contentful-paint',
            startTime: performance.now(),
            duration: value,
            type: 'largest-contentful-paint',
            value,
            rating: this.vitals.lcp.rating
          })
        }
      })

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(lcpObserver)

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fidEntry = entry as any
          const value = fidEntry.processingStart - fidEntry.startTime
          this.vitals.fid = {
            value,
            rating: this.getRating(value, this.THRESHOLDS.FID)
          }
          this.recordEntry({
            name: 'first-input-delay',
            startTime: entry.startTime,
            duration: value,
            type: 'first-input',
            value,
            rating: this.vitals.fid.rating
          })
        })
      })

      fidObserver.observe({ type: 'first-input', buffered: true })
      this.observers.push(fidObserver)

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        list.getEntries().forEach((entry) => {
          const layoutShiftEntry = entry as any
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
          }
        })

        if (clsValue > 0) {
          this.vitals.cls = {
            value: clsValue,
            rating: this.getRating(clsValue, this.THRESHOLDS.CLS)
          }
          this.recordEntry({
            name: 'cumulative-layout-shift',
            startTime: performance.now(),
            type: 'layout-shift',
            value: clsValue,
            rating: this.vitals.cls.rating
          })
        }
      })

      clsObserver.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(clsObserver)

      // Navigation and Resource Timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordEntry({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            type: entry.entryType as any,
            metadata: {
              transferSize: (entry as any).transferSize,
              encodedBodySize: (entry as any).encodedBodySize,
              decodedBodySize: (entry as any).decodedBodySize
            }
          })
        })
      })

      navigationObserver.observe({ entryTypes: ['navigation', 'resource'] })
      this.observers.push(navigationObserver)

      // Paint Timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime
            this.vitals.fcp = {
              value,
              rating: this.getRating(value, this.THRESHOLDS.FCP)
            }
          }
          
          this.recordEntry({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.startTime,
            type: 'paint',
            value: entry.startTime,
            rating: entry.name === 'first-contentful-paint' ? this.vitals.fcp?.rating : undefined
          })
        })
      })

      paintObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(paintObserver)

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error)
    }
  }

  private setupVitalsTracking(): void {
    if (typeof window === 'undefined') return

    // Track TTFB from Navigation Timing
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        this.vitals.ttfb = {
          value: ttfb,
          rating: this.getRating(ttfb, this.THRESHOLDS.TTFB)
        }
        
        this.recordEntry({
          name: 'time-to-first-byte',
          startTime: navigationEntry.requestStart,
          duration: ttfb,
          type: 'navigation',
          value: ttfb,
          rating: this.vitals.ttfb.rating
        })
      }
    })

    // Report vitals when leaving the page
    const reportVitals = () => {
      this.reportCoreWebVitals()
    }

    window.addEventListener('beforeunload', reportVitals)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportVitals()
      }
    })
  }

  // Custom performance measurement
  mark(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return
    
    try {
      performance.mark(name)
      this.recordEntry({
        name,
        startTime: performance.now(),
        type: 'custom',
        metadata
      })
    } catch (error) {
      console.warn('Performance mark failed:', error)
    }
  }

  measure(name: string, startMark?: string, endMark?: string): number | null {
    if (!this.isEnabled) return null

    try {
      const measureName = `measure-${name}`
      performance.measure(measureName, startMark, endMark)
      
      const measureEntry = performance.getEntriesByName(measureName, 'measure')[0]
      if (measureEntry) {
        this.recordEntry({
          name,
          startTime: measureEntry.startTime,
          duration: measureEntry.duration,
          type: 'measure',
          value: measureEntry.duration
        })
        return measureEntry.duration
      }
    } catch (error) {
      console.warn('Performance measure failed:', error)
    }
    
    return null
  }

  // Time a function execution
  async timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn()

    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      this.recordEntry({
        name,
        startTime,
        duration,
        type: 'custom',
        value: duration
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordEntry({
        name: `${name}-error`,
        startTime,
        duration,
        type: 'custom',
        value: duration,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      throw error
    }
  }

  // Time a synchronous function
  time<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) return fn()

    const startTime = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - startTime
      
      this.recordEntry({
        name,
        startTime,
        duration,
        type: 'custom',
        value: duration
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordEntry({
        name: `${name}-error`,
        startTime,
        duration,
        type: 'custom',
        value: duration,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      throw error
    }
  }

  // Track custom metrics
  setCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return

    this.customMetrics.set(name, value)
    this.recordEntry({
      name: `custom-${name}`,
      startTime: performance.now(),
      type: 'custom',
      value,
      metadata
    })
  }

  // Memory usage tracking
  getMemoryUsage(): any {
    const memory = (performance as any).memory
    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }
    return null
  }

  // Network information
  getNetworkInfo(): any {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      }
    }
    return null
  }

  // Device information
  getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory
    }
  }

  private recordEntry(entry: PerformanceEntry): void {
    this.entries.push(entry)
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.entries.length > 1000) {
      this.entries = this.entries.slice(-1000)
    }
    
    // Report significant performance issues immediately
    if (entry.rating === 'poor' && entry.type !== 'custom') {
      this.reportPerformanceIssue(entry)
    }
  }

  private reportPerformanceIssue(entry: PerformanceEntry): void {
    analytics.track({
      event: 'performance_issue_detected',
      properties: {
        category: 'performance',
        metricName: entry.name,
        metricType: entry.type,
        value: entry.value || entry.duration,
        rating: entry.rating,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    })
  }

  private reportCoreWebVitals(): void {
    if (!this.isEnabled) return

    const vitalsData = {
      lcp: this.vitals.lcp,
      fid: this.vitals.fid,
      cls: this.vitals.cls,
      fcp: this.vitals.fcp,
      ttfb: this.vitals.ttfb,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      customMetrics: Object.fromEntries(this.customMetrics),
      networkInfo: this.getNetworkInfo(),
      memoryInfo: this.getMemoryUsage()
    }

    analytics.track({
      event: 'core_web_vitals_report',
      properties: {
        category: 'performance',
        ...vitalsData
      }
    })
  }

  // Get current performance data
  getPerformanceData() {
    return {
      entries: [...this.entries],
      vitals: { ...this.vitals },
      customMetrics: Object.fromEntries(this.customMetrics),
      memoryUsage: this.getMemoryUsage(),
      networkInfo: this.getNetworkInfo(),
      deviceInfo: this.getDeviceInfo()
    }
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.observers.forEach(observer => observer.disconnect())
      this.observers = []
    } else if (this.observers.length === 0) {
      this.setupPerformanceObservers()
    }
  }

  // Clear collected data
  clear(): void {
    this.entries = []
    this.customMetrics.clear()
  }

  // Generate performance report
  generateReport(): any {
    const now = performance.now()
    const data = this.getPerformanceData()
    
    const report = {
      timestamp: Date.now(),
      sessionDuration: now,
      url: window.location.href,
      vitals: data.vitals,
      customMetrics: data.customMetrics,
      summary: {
        totalEntries: data.entries.length,
        poorPerformanceCount: data.entries.filter(e => e.rating === 'poor').length,
        averageResourceLoadTime: this.calculateAverageResourceTime(data.entries),
        largestResources: this.getLargestResources(data.entries),
        slowestOperations: this.getSlowestOperations(data.entries)
      },
      environment: {
        memory: data.memoryUsage,
        network: data.networkInfo,
        device: data.deviceInfo
      }
    }
    
    return report
  }

  private calculateAverageResourceTime(entries: PerformanceEntry[]): number {
    const resourceEntries = entries.filter(e => e.type === 'resource' && e.duration)
    if (resourceEntries.length === 0) return 0
    
    const totalTime = resourceEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    return totalTime / resourceEntries.length
  }

  private getLargestResources(entries: PerformanceEntry[]): any[] {
    return entries
      .filter(e => e.type === 'resource' && e.metadata?.transferSize)
      .sort((a, b) => (b.metadata?.transferSize || 0) - (a.metadata?.transferSize || 0))
      .slice(0, 5)
      .map(e => ({
        name: e.name,
        size: e.metadata?.transferSize,
        duration: e.duration
      }))
  }

  private getSlowestOperations(entries: PerformanceEntry[]): any[] {
    return entries
      .filter(e => e.duration && e.duration > 0)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10)
      .map(e => ({
        name: e.name,
        type: e.type,
        duration: e.duration,
        rating: e.rating
      }))
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.entries = []
    this.customMetrics.clear()
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  const markRender = React.useCallback((componentName: string) => {
    monitor.mark(`${componentName}-render-start`)
  }, [monitor])

  const measureRender = React.useCallback((componentName: string) => {
    return monitor.measure(`${componentName}-render`, `${componentName}-render-start`)
  }, [monitor])

  const timeOperation = React.useCallback(<T,>(name: string, fn: () => T) => {
    return monitor.time(name, fn)
  }, [monitor])

  const timeAsyncOperation = React.useCallback(<T,>(name: string, fn: () => Promise<T>) => {
    return monitor.timeAsync(name, fn)
  }, [monitor])

  const setMetric = React.useCallback((name: string, value: number, metadata?: Record<string, any>) => {
    monitor.setCustomMetric(name, value, metadata)
  }, [monitor])

  return {
    markRender,
    measureRender,
    timeOperation,
    timeAsyncOperation,
    setMetric,
    getReport: () => monitor.generateReport(),
    getVitals: () => monitor.getPerformanceData().vitals
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Import React for the hook
import React from 'react'