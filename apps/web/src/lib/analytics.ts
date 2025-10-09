// Advanced Analytics Implementation for GreenMate
import { Analytics } from '@vercel/analytics/react'

// Define analytics event types for type safety
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  timestamp?: number
}

// Plant-related events
export interface PlantEvent extends AnalyticsEvent {
  plantId?: string
  plantName?: string
  scientificName?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
}

// User engagement events
export interface EngagementEvent extends AnalyticsEvent {
  sessionId?: string
  pageUrl?: string
  referrer?: string
}

// AI/Recognition events
export interface AIEvent extends AnalyticsEvent {
  confidence?: number
  processingTime?: number
  method?: 'camera' | 'upload'
  success?: boolean
}

// Community events
export interface CommunityEvent extends AnalyticsEvent {
  postId?: string
  commentId?: string
  interactionType?: 'like' | 'comment' | 'share' | 'follow'
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    mixpanel?: {
      track: (event: string, properties?: any) => void
      identify: (userId: string) => void
      people: {
        set: (properties: any) => void
      }
    }
    dataLayer?: any[]
  }
}

export class GreenMateAnalytics {
  private static instance: GreenMateAnalytics
  private initialized = false
  private userId?: string
  private sessionId: string

  private constructor() {
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): GreenMateAnalytics {
    if (!GreenMateAnalytics.instance) {
      GreenMateAnalytics.instance = new GreenMateAnalytics()
    }
    return GreenMateAnalytics.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  initialize(config: {
    userId?: string
    enableDebug?: boolean
  } = {}) {
    if (this.initialized) return

    this.userId = config.userId
    this.initialized = true

    if (config.enableDebug) {
      console.log('GreenMate Analytics initialized', { 
        userId: this.userId, 
        sessionId: this.sessionId 
      })
    }

    // Initialize Google Analytics 4 if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: this.userId,
        session_id: this.sessionId,
        custom_map: {
          custom_parameter_1: 'plant_category',
          custom_parameter_2: 'difficulty_level',
          custom_parameter_3: 'user_experience'
        }
      })
    }

    // Track initialization
    this.track({
      event: 'analytics_initialized',
      properties: {
        timestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null
      }
    })
  }

  setUser(userId: string, properties: Record<string, any> = {}) {
    this.userId = userId

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId
      })
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId)
      window.mixpanel.people.set({
        $last_login: new Date(),
        ...properties
      })
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.initialized) {
      console.warn('Analytics not initialized. Call initialize() first.')
      return
    }

    const enrichedEvent = {
      ...event,
      userId: event.userId || this.userId,
      sessionId: this.sessionId,
      timestamp: event.timestamp || Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : null,
      referrer: typeof window !== 'undefined' ? document.referrer : null
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        event_category: event.properties?.category || 'general',
        event_label: event.properties?.label,
        value: event.properties?.value,
        user_id: enrichedEvent.userId,
        session_id: this.sessionId,
        custom_parameter_1: event.properties?.plantCategory,
        custom_parameter_2: event.properties?.difficulty,
        custom_parameter_3: event.properties?.userExperience
      })
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(event.event, {
        ...event.properties,
        userId: enrichedEvent.userId,
        sessionId: this.sessionId,
        timestamp: enrichedEvent.timestamp
      })
    }

    // Send to custom analytics endpoint
    this.sendToBackend(enrichedEvent)

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', enrichedEvent)
    }
  }

  private async sendToBackend(event: AnalyticsEvent & { sessionId: string }) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Failed to send analytics event to backend:', error)
    }
  }

  // Plant-specific tracking methods
  trackPlantIdentification(data: {
    plantId?: string
    plantName?: string
    confidence: number
    method: 'camera' | 'upload'
    processingTime: number
    success: boolean
  }) {
    this.track({
      event: 'plant_identified',
      properties: {
        category: 'ai_interaction',
        plantId: data.plantId,
        plantName: data.plantName,
        confidence: data.confidence,
        method: data.method,
        processingTime: data.processingTime,
        success: data.success,
        value: data.confidence
      }
    })
  }

  trackPlantAdded(data: {
    plantId: string
    plantName: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    method: 'identification' | 'manual' | 'marketplace'
  }) {
    this.track({
      event: 'plant_added_to_collection',
      properties: {
        category: 'plant_management',
        plantId: data.plantId,
        plantName: data.plantName,
        difficulty: data.difficulty,
        method: data.method,
        value: 1
      }
    })
  }

  trackCareAction(data: {
    plantId: string
    action: string
    reminderCompleted?: boolean
    userPlantId: string
  }) {
    this.track({
      event: 'care_action_completed',
      properties: {
        category: 'plant_care',
        plantId: data.plantId,
        action: data.action,
        reminderCompleted: data.reminderCompleted,
        userPlantId: data.userPlantId,
        value: data.reminderCompleted ? 2 : 1
      }
    })
  }

  trackReminderInteraction(data: {
    action: 'snoozed' | 'completed' | 'dismissed'
    reminderType: string
    plantId: string
  }) {
    this.track({
      event: 'reminder_interaction',
      properties: {
        category: 'engagement',
        action: data.action,
        reminderType: data.reminderType,
        plantId: data.plantId
      }
    })
  }

  // Community tracking methods
  trackCommunityInteraction(data: {
    type: 'post_created' | 'comment_added' | 'like_given' | 'user_followed'
    targetId: string
    targetType: 'post' | 'comment' | 'user'
    contentType?: 'help_request' | 'success_story' | 'general' | 'plant_showcase'
  }) {
    this.track({
      event: 'community_interaction',
      properties: {
        category: 'community',
        interactionType: data.type,
        targetId: data.targetId,
        targetType: data.targetType,
        contentType: data.contentType,
        value: 1
      }
    })
  }

  trackSearch(data: {
    query: string
    type: 'plants' | 'community' | 'marketplace'
    resultsCount: number
    filters?: Record<string, any>
  }) {
    this.track({
      event: 'search_performed',
      properties: {
        category: 'discovery',
        query: data.query,
        searchType: data.type,
        resultsCount: data.resultsCount,
        filters: data.filters,
        value: Math.min(data.resultsCount, 10) // Cap value at 10
      }
    })
  }

  // User engagement tracking
  trackPageView(pageName: string, additionalProps?: Record<string, any>) {
    this.track({
      event: 'page_view',
      properties: {
        category: 'navigation',
        page: pageName,
        ...additionalProps
      }
    })
  }

  trackFeatureUsage(featureName: string, context?: Record<string, any>) {
    this.track({
      event: 'feature_used',
      properties: {
        category: 'feature_adoption',
        feature: featureName,
        ...context,
        value: 1
      }
    })
  }

  trackError(error: {
    message: string
    stack?: string
    page?: string
    component?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }) {
    this.track({
      event: 'error_occurred',
      properties: {
        category: 'error',
        errorMessage: error.message,
        errorStack: error.stack,
        page: error.page,
        component: error.component,
        severity: error.severity
      }
    })
  }

  trackConversion(data: {
    type: 'signup' | 'subscription' | 'marketplace_purchase' | 'plant_goal_achieved'
    value?: number
    currency?: string
    additionalData?: Record<string, any>
  }) {
    this.track({
      event: 'conversion',
      properties: {
        category: 'conversion',
        conversionType: data.type,
        value: data.value || 1,
        currency: data.currency,
        ...data.additionalData
      }
    })
  }

  trackUserRetention(data: {
    daysActive: number
    sessionsThisWeek: number
    plantsInCollection: number
    lastActive: Date
  }) {
    this.track({
      event: 'user_retention_metric',
      properties: {
        category: 'retention',
        daysActive: data.daysActive,
        sessionsThisWeek: data.sessionsThisWeek,
        plantsInCollection: data.plantsInCollection,
        daysSinceLastActive: Math.floor((Date.now() - data.lastActive.getTime()) / (1000 * 60 * 60 * 24)),
        value: data.daysActive
      }
    })
  }

  // A/B Testing support
  trackExperiment(data: {
    experimentName: string
    variant: string
    event: 'view' | 'interact' | 'convert'
  }) {
    this.track({
      event: 'ab_test_event',
      properties: {
        category: 'experiment',
        experimentName: data.experimentName,
        variant: data.variant,
        eventType: data.event,
        value: data.event === 'convert' ? 10 : 1
      }
    })
  }
}

// Performance monitoring class
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map()
  private static analytics = GreenMateAnalytics.getInstance()

  static startTimer(name: string): void {
    this.metrics.set(name, performance.now())
  }

  static endTimer(name: string): number {
    const start = this.metrics.get(name)
    if (!start) return 0

    const duration = performance.now() - start
    this.metrics.delete(name)

    // Send performance metric
    this.analytics.track({
      event: 'performance_metric',
      properties: {
        category: 'performance',
        metric: name,
        duration: Math.round(duration),
        value: Math.round(duration)
      }
    })

    return duration
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name)
    return fn().finally(() => {
      this.endTimer(name)
    })
  }

  static trackWebVitals() {
    if (typeof window === 'undefined') return

    // Track Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        this.analytics.track({
          event: 'web_vital',
          properties: {
            category: 'performance',
            name: metric.name,
            value: Math.round(metric.value * 1000),
            rating: metric.rating
          }
        })
      })

      getFID((metric) => {
        this.analytics.track({
          event: 'web_vital',
          properties: {
            category: 'performance',
            name: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating
          }
        })
      })

      getFCP((metric) => {
        this.analytics.track({
          event: 'web_vital',
          properties: {
            category: 'performance',
            name: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating
          }
        })
      })

      getLCP((metric) => {
        this.analytics.track({
          event: 'web_vital',
          properties: {
            category: 'performance',
            name: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating
          }
        })
      })

      getTTFB((metric) => {
        this.analytics.track({
          event: 'web_vital',
          properties: {
            category: 'performance',
            name: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating
          }
        })
      })
    })
  }
}

// Convenience exports
export const analytics = GreenMateAnalytics.getInstance()
export { Analytics } from '@vercel/analytics/react'
export { SpeedInsights } from '@vercel/speed-insights/next'