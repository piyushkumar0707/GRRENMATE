// Code Splitting and Lazy Loading Utilities
import React, { Suspense, ComponentType, LazyExoticComponent, ReactNode } from 'react'
import { performanceMonitor } from './performance-monitor'

// Enhanced lazy component wrapper with error boundaries and loading states
interface LazyComponentProps {
  fallback?: ReactNode
  onError?: (error: Error) => void
  onLoad?: (componentName: string, loadTime: number) => void
  componentName: string
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentProps
): LazyExoticComponent<T> {
  const { fallback, onError, onLoad, componentName } = options
  
  const LazyComponent = React.lazy(async () => {
    const startTime = performance.now()
    
    try {
      const module = await importFn()
      const loadTime = performance.now() - startTime
      
      // Track performance metrics
      performanceMonitor.setCustomMetric(`component_load_time_${componentName}`, loadTime, {
        componentName,
        loadType: 'lazy'
      })
      
      onLoad?.(componentName, loadTime)
      
      return module
    } catch (error) {
      performanceMonitor.setCustomMetric(`component_load_error_${componentName}`, 1, {
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      onError?.(error instanceof Error ? error : new Error('Component load failed'))
      throw error
    }
  })
  
  return LazyComponent
}

// Error boundary for lazy components
interface LazyErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  LazyErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
    
    performanceMonitor.setCustomMetric('lazy_component_error', 1, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Component failed to load</h3>
          <p className="text-red-600 text-sm mt-1">
            Please refresh the page and try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// Wrapper component for lazy loaded components
interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ComponentType<{ error: Error }>
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  )
  
  return (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  )
}

// Pre-defined lazy components for common GreenMate features
export const LazyComponents = {
  // Plant identification components
  PlantIdentifier: createLazyComponent(
    () => import('@/components/ai/PlantIdentifier'),
    {
      componentName: 'PlantIdentifier',
      fallback: <div>Loading plant identifier...</div>
    }
  ),
  
  // Plant camera component
  PlantCamera: createLazyComponent(
    () => import('@/components/camera/PlantCamera'),
    {
      componentName: 'PlantCamera',
      fallback: <div>Loading camera...</div>
    }
  ),
  
  // Advanced plant analytics
  PlantAnalytics: createLazyComponent(
    () => import('@/components/analytics/PlantAnalytics'),
    {
      componentName: 'PlantAnalytics',
      fallback: <div>Loading analytics...</div>
    }
  ),
  
  // Community features
  CommunityForum: createLazyComponent(
    () => import('@/components/community/CommunityForum'),
    {
      componentName: 'CommunityForum',
      fallback: <div>Loading community forum...</div>
    }
  ),
  
  // Settings and profile
  UserSettings: createLazyComponent(
    () => import('@/components/settings/UserSettings'),
    {
      componentName: 'UserSettings',
      fallback: <div>Loading settings...</div>
    }
  ),
  
  // Plant care guides
  CareGuides: createLazyComponent(
    () => import('@/components/guides/CareGuides'),
    {
      componentName: 'CareGuides',
      fallback: <div>Loading care guides...</div>
    }
  ),
  
  // Advanced charts and visualizations
  PlantCharts: createLazyComponent(
    () => import('@/components/charts/PlantCharts'),
    {
      componentName: 'PlantCharts',
      fallback: <div>Loading charts...</div>
    }
  )
}

// Route-based code splitting helper
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    componentName: `Route_${routeName}`,
    fallback: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {routeName}...</p>
        </div>
      </div>
    ),
    onLoad: (name, time) => {
      console.log(`Route ${routeName} loaded in ${time.toFixed(2)}ms`)
    }
  })
}

// Preloading utilities
class PreloadManager {
  private preloadedComponents = new Set<string>()
  
  preload(importFn: () => Promise<any>, componentName: string) {
    if (this.preloadedComponents.has(componentName)) {
      return Promise.resolve()
    }
    
    console.log(`Preloading component: ${componentName}`)
    
    return importFn()
      .then(() => {
        this.preloadedComponents.add(componentName)
        performanceMonitor.setCustomMetric(`component_preload_${componentName}`, 1, {
          componentName,
          preloaded: true
        })
      })
      .catch(error => {
        console.error(`Failed to preload ${componentName}:`, error)
        performanceMonitor.setCustomMetric(`component_preload_error_${componentName}`, 1, {
          componentName,
          error: error.message
        })
      })
  }
  
  preloadRoute(routeName: string, importFn: () => Promise<any>) {
    return this.preload(importFn, `Route_${routeName}`)
  }
  
  preloadOnHover(element: HTMLElement, importFn: () => Promise<any>, componentName: string) {
    let preloadTriggered = false
    
    const handleMouseEnter = () => {
      if (!preloadTriggered) {
        preloadTriggered = true
        this.preload(importFn, componentName)
      }
    }
    
    element.addEventListener('mouseenter', handleMouseEnter, { once: true })
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
    }
  }
  
  preloadOnVisible(element: HTMLElement, importFn: () => Promise<any>, componentName: string) {
    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      setTimeout(() => this.preload(importFn, componentName), 2000)
      return () => {}
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.preload(importFn, componentName)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }
}

export const preloadManager = new PreloadManager()

// React hook for preloading components
export function usePreload() {
  const preloadComponent = React.useCallback((
    importFn: () => Promise<any>,
    componentName: string
  ) => {
    return preloadManager.preload(importFn, componentName)
  }, [])
  
  const preloadOnHover = React.useCallback((
    elementRef: React.RefObject<HTMLElement>,
    importFn: () => Promise<any>,
    componentName: string
  ) => {
    React.useEffect(() => {
      const element = elementRef.current
      if (!element) return
      
      return preloadManager.preloadOnHover(element, importFn, componentName)
    }, [elementRef, importFn, componentName])
  }, [])
  
  return { preloadComponent, preloadOnHover }
}

// Bundle size analyzer utility (development only)
export const bundleAnalyzer = {
  trackChunkLoad(chunkName: string, size: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Chunk loaded: ${chunkName} (${(size / 1024).toFixed(2)}KB)`)
      
      performanceMonitor.setCustomMetric(`chunk_size_${chunkName}`, size, {
        chunkName,
        sizeKB: Math.round(size / 1024)
      })
    }
  },
  
  logBundleStats() {
    if (process.env.NODE_ENV === 'development' && 'webpackChunkName' in window) {
      const chunks = (window as any).webpackChunkName || []
      console.group('Bundle Analysis')
      chunks.forEach((chunk: any) => {
        console.log(`${chunk.name}: ${(chunk.size / 1024).toFixed(2)}KB`)
      })
      console.groupEnd()
    }
  }
}

// Lazy loading skeleton components
export const LazySkeletons = {
  PlantCard: () => (
    <div className="animate-pulse bg-white rounded-lg p-4 shadow-sm">
      <div className="flex space-x-3">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  ),
  
  PlantList: () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <LazySkeletons.PlantCard key={i} />
      ))}
    </div>
  ),
  
  PlantDetail: () => (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  ),
  
  CommunityPost: () => (
    <div className="animate-pulse bg-white rounded-lg p-4 shadow-sm">
      <div className="flex space-x-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
      <div className="h-32 bg-gray-200 rounded mt-3"></div>
    </div>
  )
}

export default LazyWrapper