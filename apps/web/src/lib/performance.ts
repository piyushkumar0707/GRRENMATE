// Performance Monitoring Utilities
import { Monitoring } from './monitoring'

// Web Vitals thresholds (Core Web Vitals)
export const VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    GOOD: 2500,      // <= 2.5s
    POOR: 4000,      // > 4.0s
  },
  // First Input Delay (FID)
  FID: {
    GOOD: 100,       // <= 100ms
    POOR: 300,       // > 300ms
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    GOOD: 0.1,       // <= 0.1
    POOR: 0.25,      // > 0.25
  },
  // First Contentful Paint (FCP)
  FCP: {
    GOOD: 1800,      // <= 1.8s
    POOR: 3000,      // > 3.0s
  },
  // Time to First Byte (TTFB)
  TTFB: {
    GOOD: 800,       // <= 800ms
    POOR: 1800,      // > 1.8s
  }
} as const

// Performance observer for Web Vitals
export class WebVitalsMonitor {
  private static observer: PerformanceObserver | null = null
  private static metrics = new Map<string, number>()

  static initialize() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      // Observe Largest Contentful Paint
      this.observeLCP()

      // Observe First Input Delay
      this.observeFID()

      // Observe Cumulative Layout Shift
      this.observeCLS()

      // Observe First Contentful Paint
      this.observeFCP()

      // Observe Navigation Timing
      this.observeNavigation()

      // Observe Long Tasks
      this.observeLongTasks()

      console.log('Performance monitoring initialized')
    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error)
    }
  }

  private static observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (lastEntry) {
          const lcp = lastEntry.startTime
          this.metrics.set('LCP', lcp)
          this.reportVital('LCP', lcp, VITALS_THRESHOLDS.LCP)
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP observation not supported:', error)
    }
  }

  private static observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime
            this.metrics.set('FID', fid)
            this.reportVital('FID', fid, VITALS_THRESHOLDS.FID)
          }
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID observation not supported:', error)
    }
  }

  private static observeCLS() {
    try {
      let clsValue = 0
      let clsEntries: any[] = []

      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = clsEntries[0]
            const lastSessionEntry = clsEntries[clsEntries.length - 1]

            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds after the first entry in the session,
            // include the entry in the current session. Otherwise, start a new session.
            if (lastSessionEntry && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              clsEntries.push(entry)
            } else {
              clsEntries = [entry]
            }

            // If the current session has more entries than the existing session,
            // update the CLS value.
            const sessionValue = clsEntries.reduce((total, e) => total + (e as any).value, 0)
            if (sessionValue > clsValue) {
              clsValue = sessionValue
              this.metrics.set('CLS', clsValue)
              this.reportVital('CLS', clsValue, VITALS_THRESHOLDS.CLS)
            }
          }
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS observation not supported:', error)
    }
  }

  private static observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime
            this.metrics.set('FCP', fcp)
            this.reportVital('FCP', fcp, VITALS_THRESHOLDS.FCP)
          }
        })
      })

      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('FCP observation not supported:', error)
    }
  }

  private static observeNavigation() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming
          
          const metrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            ttfb: navEntry.responseStart - navEntry.requestStart,
            download: navEntry.responseEnd - navEntry.responseStart,
            domParsing: navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
            resourceLoading: navEntry.loadEventStart - navEntry.domContentLoadedEventEnd
          }

          this.reportNavigationMetrics(metrics)
        })
      })

      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('Navigation observation not supported:', error)
    }
  }

  private static observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.reportLongTask(entry.duration, entry.startTime)
          }
        })
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task observation not supported:', error)
    }
  }

  private static reportVital(name: string, value: number, thresholds: { GOOD: number; POOR: number }) {
    const rating = value <= thresholds.GOOD ? 'good' : 
                   value <= thresholds.POOR ? 'needs-improvement' : 'poor'

    Monitoring.trackPerformance({
      operation: `web-vital-${name.toLowerCase()}`,
      duration: value,
      metadata: {
        metric: name,
        value,
        rating,
        threshold_good: thresholds.GOOD,
        threshold_poor: thresholds.POOR,
        page: window.location.pathname,
      }
    })

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        custom_map: {
          metric_rating: rating
        }
      })
    }
  }

  private static reportNavigationMetrics(metrics: Record<string, number>) {
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        Monitoring.trackPerformance({
          operation: `navigation-${key}`,
          duration: value,
          metadata: {
            page: window.location.pathname,
            metric: key,
          }
        })
      }
    })
  }

  private static reportLongTask(duration: number, startTime: number) {
    Monitoring.trackPerformance({
      operation: 'long-task',
      duration,
      metadata: {
        startTime,
        page: window.location.pathname,
      }
    })
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  static disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Resource monitoring
export class ResourceMonitor {
  static analyzeResources() {
    if (typeof window === 'undefined' || !performance.getEntriesByType) {
      return
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const analysis = {
      totalResources: resources.length,
      scripts: 0,
      styles: 0,
      images: 0,
      fonts: 0,
      other: 0,
      totalSize: 0,
      slowResources: [] as Array<{ name: string; duration: number; size: number }>,
      largeResources: [] as Array<{ name: string; size: number; type: string }>
    }

    resources.forEach(resource => {
      const duration = resource.duration
      const size = resource.transferSize || 0
      const type = this.getResourceType(resource)

      analysis.totalSize += size

      // Categorize by type
      switch (type) {
        case 'script': analysis.scripts++; break
        case 'stylesheet': analysis.styles++; break
        case 'image': analysis.images++; break
        case 'font': analysis.fonts++; break
        default: analysis.other++; break
      }

      // Flag slow resources (>1s)
      if (duration > 1000) {
        analysis.slowResources.push({
          name: resource.name,
          duration: Math.round(duration),
          size
        })
      }

      // Flag large resources (>500KB)
      if (size > 500000) {
        analysis.largeResources.push({
          name: resource.name,
          size,
          type
        })
      }
    })

    this.reportResourceAnalysis(analysis)
    return analysis
  }

  private static getResourceType(resource: PerformanceResourceTiming): string {
    const url = resource.name
    
    if (url.match(/\.(js|mjs)(\?|$)/)) return 'script'
    if (url.match(/\.(css)(\?|$)/)) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)(\?|$)/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) return 'font'
    if (url.match(/\.(json|xml)(\?|$)/)) return 'data'
    
    return 'other'
  }

  private static reportResourceAnalysis(analysis: any) {
    Monitoring.trackPerformance({
      operation: 'resource-analysis',
      duration: 0,
      metadata: {
        ...analysis,
        page: window.location.pathname,
      }
    })

    // Warn about performance issues
    if (analysis.slowResources.length > 0) {
      console.warn('Slow resources detected:', analysis.slowResources)
    }

    if (analysis.largeResources.length > 0) {
      console.warn('Large resources detected:', analysis.largeResources)
    }
  }
}

// Memory monitoring
export class MemoryMonitor {
  static analyzeMemory() {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return null
    }

    const memory = (performance as any).memory
    const analysis = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    }

    this.reportMemoryUsage(analysis)
    return analysis
  }

  private static reportMemoryUsage(analysis: any) {
    Monitoring.trackPerformance({
      operation: 'memory-usage',
      duration: 0,
      metadata: {
        ...analysis,
        page: window.location.pathname,
      }
    })

    // Warn about high memory usage
    if (analysis.usagePercent > 80) {
      console.warn('High memory usage detected:', analysis)
    }
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private static budgets = {
    LCP: 2500,        // 2.5s
    FID: 100,         // 100ms
    CLS: 0.1,         // 0.1
    TTI: 3000,        // 3s
    bundleSize: 250000, // 250KB (gzipped)
    imageSize: 1000000  // 1MB
  }

  static checkBudgets() {
    const metrics = WebVitalsMonitor.getMetrics()
    const violations: string[] = []

    Object.entries(this.budgets).forEach(([metric, budget]) => {
      const value = metrics[metric]
      if (value && value > budget) {
        violations.push(`${metric}: ${value} > ${budget}`)
      }
    })

    if (violations.length > 0) {
      Monitoring.captureMessage(
        `Performance budget violations: ${violations.join(', ')}`,
        'performance' as any,
        'warning' as any,
        { violations, metrics }
      )
    }

    return { violations, metrics }
  }
}

// Initialize performance monitoring when the module loads
if (typeof window !== 'undefined') {
  // Wait for page load to avoid interfering with initial performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      WebVitalsMonitor.initialize()
      
      // Analyze resources after a short delay
      setTimeout(() => {
        ResourceMonitor.analyzeResources()
        MemoryMonitor.analyzeMemory()
      }, 2000)
      
      // Check budgets after core metrics are collected
      setTimeout(() => {
        PerformanceBudget.checkBudgets()
      }, 5000)
    }, 1000)
  })
}