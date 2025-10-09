'use client'

import React, { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { analytics, PerformanceMonitor } from '@/lib/analytics'
import { useRouter } from 'next/router'
import { useUser } from '@/hooks/useUser' // Assuming you have a user hook

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const router = useRouter()
  const { user } = useUser() // Replace with your actual user hook

  useEffect(() => {
    // Initialize analytics
    analytics.initialize({
      userId: user?.id,
      enableDebug: process.env.NODE_ENV === 'development'
    })

    // Track Web Vitals
    PerformanceMonitor.trackWebVitals()
  }, [user?.id])

  useEffect(() => {
    // Update user when it changes
    if (user?.id) {
      analytics.setUser(user.id, {
        email: user.email,
        username: user.username,
        experience: user.profile?.experience,
        plantsCount: user.userPlants?.length || 0,
        createdAt: user.createdAt
      })
    }
  }, [user])

  useEffect(() => {
    // Track page views on route changes
    const handleRouteChange = (url: string) => {
      // Extract page name from URL
      const pageName = url.split('?')[0].split('/').filter(Boolean).join('/') || 'home'
      
      analytics.trackPageView(pageName, {
        fullUrl: url,
        referrer: document.referrer
      })
    }

    // Track initial page view
    handleRouteChange(router.asPath)

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, router.asPath])

  useEffect(() => {
    // Global error tracking
    const handleError = (event: ErrorEvent) => {
      analytics.trackError({
        message: event.error?.message || event.message,
        stack: event.error?.stack,
        page: router.asPath,
        severity: 'high'
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        page: router.asPath,
        severity: 'medium'
      })
    }

    // Add global error listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router.asPath])

  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  )
}

// HOC for tracking component usage
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    useEffect(() => {
      analytics.trackFeatureUsage(componentName, {
        timestamp: Date.now()
      })
    }, [])

    return <WrappedComponent {...props} />
  }
}

// Hook for tracking component interactions
export function useAnalyticsTracking() {
  const trackInteraction = (event: string, properties?: Record<string, any>) => {
    analytics.track({
      event,
      properties: {
        ...properties,
        timestamp: Date.now()
      }
    })
  }

  const trackPlantInteraction = (
    action: 'viewed' | 'added' | 'edited' | 'removed',
    plantData: {
      plantId: string
      plantName: string
      difficulty?: string
    }
  ) => {
    analytics.track({
      event: `plant_${action}`,
      properties: {
        category: 'plant_interaction',
        action,
        plantId: plantData.plantId,
        plantName: plantData.plantName,
        difficulty: plantData.difficulty,
        value: 1
      }
    })
  }

  const trackCareInteraction = (
    action: 'watered' | 'fertilized' | 'repotted' | 'pruned',
    data: {
      plantId: string
      userPlantId: string
      reminderTriggered?: boolean
    }
  ) => {
    analytics.trackCareAction({
      plantId: data.plantId,
      action,
      reminderCompleted: data.reminderTriggered,
      userPlantId: data.userPlantId
    })
  }

  const trackUIInteraction = (
    component: string,
    action: string,
    details?: Record<string, any>
  ) => {
    analytics.track({
      event: 'ui_interaction',
      properties: {
        category: 'ui',
        component,
        action,
        ...details,
        value: 1
      }
    })
  }

  return {
    trackInteraction,
    trackPlantInteraction,
    trackCareInteraction,
    trackUIInteraction
  }
}