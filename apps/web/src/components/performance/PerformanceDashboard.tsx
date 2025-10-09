// Performance Dashboard Component with Speed Insights Integration
import React, { useState, useEffect } from 'react'
import { performanceMonitor, usePerformanceMonitor } from '@/lib/performance-monitor'
import { SpeedInsights } from '@vercel/speed-insights/next'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  rating: 'good' | 'needs-improvement' | 'poor'
  description: string
}

interface PerformanceDashboardProps {
  showDetails?: boolean
  showSpeedInsights?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  showDetails = false,
  showSpeedInsights = true,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { getReport, getVitals } = usePerformanceMonitor()

  useEffect(() => {
    const updateData = () => {
      const data = performanceMonitor.getPerformanceData()
      setPerformanceData(data)
    }

    updateData()

    if (autoRefresh) {
      const interval = setInterval(updateData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getMetrics = (): PerformanceMetric[] => {
    if (!performanceData) return []

    const metrics: PerformanceMetric[] = []
    const { vitals, customMetrics } = performanceData

    // Core Web Vitals
    if (vitals.lcp) {
      metrics.push({
        name: 'Largest Contentful Paint',
        value: Math.round(vitals.lcp.value),
        unit: 'ms',
        rating: vitals.lcp.rating,
        description: 'Time until the largest element is rendered'
      })
    }

    if (vitals.fid) {
      metrics.push({
        name: 'First Input Delay',
        value: Math.round(vitals.fid.value),
        unit: 'ms',
        rating: vitals.fid.rating,
        description: 'Time from first user input to browser response'
      })
    }

    if (vitals.cls) {
      metrics.push({
        name: 'Cumulative Layout Shift',
        value: Math.round(vitals.cls.value * 1000) / 1000,
        unit: '',
        rating: vitals.cls.rating,
        description: 'Visual stability of page elements'
      })
    }

    if (vitals.fcp) {
      metrics.push({
        name: 'First Contentful Paint',
        value: Math.round(vitals.fcp.value),
        unit: 'ms',
        rating: vitals.fcp.rating,
        description: 'Time until first content is rendered'
      })
    }

    if (vitals.ttfb) {
      metrics.push({
        name: 'Time to First Byte',
        value: Math.round(vitals.ttfb.value),
        unit: 'ms',
        rating: vitals.ttfb.rating,
        description: 'Time until server responds with first byte'
      })
    }

    // Custom metrics
    Object.entries(customMetrics).forEach(([key, value]) => {
      if (key.includes('image_load_time')) {
        metrics.push({
          name: 'Average Image Load Time',
          value: Math.round(value as number),
          unit: 'ms',
          rating: value < 1000 ? 'good' : value < 2000 ? 'needs-improvement' : 'poor',
          description: 'Average time to load images'
        })
      } else if (key.includes('component_load_time')) {
        metrics.push({
          name: 'Component Load Time',
          value: Math.round(value as number),
          unit: 'ms',
          rating: value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor',
          description: 'Time to load lazy components'
        })
      }
    })

    return metrics
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return '✅'
      case 'needs-improvement': return '⚠️'
      case 'poor': return '❌'
      default: return 'ℹ️'
    }
  }

  const metrics = getMetrics()

  if (!showDetails && !isVisible) {
    return (
      <>
        {showSpeedInsights && <SpeedInsights />}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Show Performance Metrics"
          >
            📊
          </button>
        )}
      </>
    )
  }

  return (
    <>
      {showSpeedInsights && <SpeedInsights />}
      
      <div className={`performance-dashboard ${showDetails ? 'relative' : 'fixed bottom-4 right-4 z-50'} bg-white rounded-lg shadow-lg border max-w-md`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            {!showDetails && (
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {metrics.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>Performance data loading...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getRatingIcon(metric.rating)}</span>
                      <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                    </div>
                    {showDetails && (
                      <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(metric.rating)}`}>
                      {metric.value}{metric.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {performanceData?.memoryInfo && showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Memory Usage</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Used:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(performanceData.memoryInfo.usedJSHeapSize / 1024 / 1024)}MB
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(performanceData.memoryInfo.totalJSHeapSize / 1024 / 1024)}MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {performanceData?.networkInfo && showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Network</h4>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{performanceData.networkInfo.effectiveType}</span>
                </div>
                {performanceData.networkInfo.downlink && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">{performanceData.networkInfo.downlink} Mbps</span>
                  </div>
                )}
                {performanceData.networkInfo.rtt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">RTT:</span>
                    <span className="font-medium">{performanceData.networkInfo.rtt}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const report = getReport()
                  console.log('Performance Report:', report)
                  // Could also download as JSON or send to analytics
                }}
                className="w-full text-sm bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Export Report
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Performance monitoring wrapper for development
export const DevPerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log performance warnings
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            const duration = entry.duration
            if (duration > 100) {
              console.warn(`🐌 Slow operation detected: ${entry.name} took ${duration.toFixed(2)}ms`)
            }
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['measure'] })
      } catch (e) {
        // Observer not supported
      }
      
      return () => observer.disconnect()
    }
  }, [])

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
    </>
  )
}

// Performance optimization suggestions component
export const PerformanceOptimizations: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { getReport } = usePerformanceMonitor()

  useEffect(() => {
    const report = getReport()
    const newSuggestions: string[] = []

    // Analyze performance and generate suggestions
    if (report.vitals.lcp && report.vitals.lcp.rating === 'poor') {
      newSuggestions.push('Consider optimizing images and reducing server response time to improve LCP')
    }

    if (report.vitals.fid && report.vitals.fid.rating === 'poor') {
      newSuggestions.push('Reduce JavaScript execution time and optimize event handlers for better FID')
    }

    if (report.vitals.cls && report.vitals.cls.rating === 'poor') {
      newSuggestions.push('Set explicit dimensions for images and avoid inserting content above existing elements')
    }

    if (report.summary.averageResourceLoadTime > 1000) {
      newSuggestions.push('Enable compression and use a CDN to reduce resource load times')
    }

    if (report.environment.memory && report.environment.memory.usedJSHeapSize > 50 * 1024 * 1024) {
      newSuggestions.push('Consider code splitting and lazy loading to reduce memory usage')
    }

    setSuggestions(newSuggestions)
  }, [getReport])

  if (suggestions.length === 0 || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">⚡ Performance Tips</h4>
      <ul className="text-xs text-yellow-700 space-y-1">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex items-start space-x-1">
            <span>•</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PerformanceDashboard