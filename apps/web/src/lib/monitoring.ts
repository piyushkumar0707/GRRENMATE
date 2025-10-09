// Comprehensive Error Tracking and Monitoring Utilities
import * as Sentry from '@sentry/nextjs'

// Define error severity levels
export enum ErrorSeverity {
  LOW = 'info',
  MEDIUM = 'warning', 
  HIGH = 'error',
  CRITICAL = 'fatal'
}

// Define error categories for better organization
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  API = 'api',
  DATABASE = 'database',
  AI_SERVICE = 'ai_service',
  FILE_UPLOAD = 'file_upload',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UI = 'ui',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

// User context interface
interface UserContext {
  id?: string
  email?: string
  plan?: string
  plantsCount?: number
  joinedAt?: string
}

// Error context interface
interface ErrorContext {
  category: ErrorCategory
  action?: string
  resource?: string
  metadata?: Record<string, any>
  userContext?: UserContext
  requestId?: string
}

// Performance metrics interface
interface PerformanceMetrics {
  operation: string
  duration: number
  metadata?: Record<string, any>
}

// Custom monitoring class
export class Monitoring {
  // Initialize monitoring with user context
  static setUserContext(user: UserContext) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      planType: user.plan,
      plantsCount: user.plantsCount,
      joinedAt: user.joinedAt,
    })
  }

  // Clear user context (on logout)
  static clearUserContext() {
    Sentry.setUser(null)
  }

  // Set additional context
  static setContext(key: string, context: Record<string, any>) {
    Sentry.setContext(key, context)
  }

  // Set tags for filtering
  static setTags(tags: Record<string, string>) {
    Sentry.setTags(tags)
  }

  // Add breadcrumb for debugging
  static addBreadcrumb(message: string, category: string, data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    })
  }

  // Capture and report errors
  static captureError(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.HIGH
  ) {
    Sentry.withScope((scope) => {
      // Set severity level
      scope.setLevel(severity)
      
      // Set error category and context
      scope.setTag('error_category', context.category)
      
      if (context.action) scope.setTag('action', context.action)
      if (context.resource) scope.setTag('resource', context.resource)
      if (context.requestId) scope.setTag('request_id', context.requestId)

      // Add user context if provided
      if (context.userContext) {
        scope.setUser(context.userContext)
      }

      // Add metadata as context
      if (context.metadata) {
        scope.setContext('error_metadata', context.metadata)
      }

      // Add breadcrumb
      scope.addBreadcrumb({
        message: `Error in ${context.category}`,
        category: context.category,
        level: severity,
        data: context.metadata,
      })

      // Capture the error
      Sentry.captureException(error)
    })
  }

  // Capture custom messages
  static captureMessage(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    extra?: Record<string, any>
  ) {
    Sentry.withScope((scope) => {
      scope.setLevel(severity)
      scope.setTag('category', category)
      
      if (extra) {
        scope.setContext('message_context', extra)
      }

      Sentry.captureMessage(message)
    })
  }

  // Track performance metrics
  static trackPerformance(metrics: PerformanceMetrics) {
    const transaction = Sentry.startTransaction({
      name: metrics.operation,
      op: 'custom',
    })

    transaction.setData('duration', metrics.duration)
    
    if (metrics.metadata) {
      Object.entries(metrics.metadata).forEach(([key, value]) => {
        transaction.setData(key, value)
      })
    }

    transaction.finish()

    // Also track as custom metric
    this.addBreadcrumb(
      `Performance: ${metrics.operation} took ${metrics.duration}ms`,
      'performance',
      metrics.metadata
    )
  }

  // Track API responses
  static trackApiResponse(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    error?: Error
  ) {
    const isError = statusCode >= 400
    
    this.addBreadcrumb(
      `API ${method} ${endpoint} - ${statusCode} (${duration}ms)`,
      'api',
      {
        endpoint,
        method,
        statusCode,
        duration,
        error: error?.message,
      }
    )

    if (isError && error) {
      this.captureError(error, {
        category: ErrorCategory.API,
        action: method,
        resource: endpoint,
        metadata: {
          statusCode,
          duration,
        },
      })
    }
  }

  // Track user actions
  static trackUserAction(
    action: string,
    resource: string,
    metadata?: Record<string, any>
  ) {
    this.addBreadcrumb(
      `User action: ${action} on ${resource}`,
      'user_action',
      { action, resource, ...metadata }
    )
  }

  // Track database operations
  static trackDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    error?: Error
  ) {
    if (error) {
      this.captureError(error, {
        category: ErrorCategory.DATABASE,
        action: operation,
        resource: table,
        metadata: { duration },
      })
    } else {
      this.addBreadcrumb(
        `Database ${operation} on ${table} (${duration}ms)`,
        'database',
        { operation, table, duration }
      )
    }
  }

  // Track AI service calls
  static trackAIServiceCall(
    service: string,
    operation: string,
    duration: number,
    tokensUsed?: number,
    error?: Error
  ) {
    const metadata = {
      service,
      operation,
      duration,
      tokensUsed,
    }

    if (error) {
      this.captureError(error, {
        category: ErrorCategory.AI_SERVICE,
        action: operation,
        resource: service,
        metadata,
      })
    } else {
      this.addBreadcrumb(
        `AI Service: ${service} ${operation} (${duration}ms, ${tokensUsed} tokens)`,
        'ai_service',
        metadata
      )
    }
  }

  // Track file uploads
  static trackFileUpload(
    filename: string,
    fileSize: number,
    uploadDuration: number,
    error?: Error
  ) {
    const metadata = {
      filename,
      fileSize,
      uploadDuration,
    }

    if (error) {
      this.captureError(error, {
        category: ErrorCategory.FILE_UPLOAD,
        action: 'upload',
        resource: filename,
        metadata,
      })
    } else {
      this.addBreadcrumb(
        `File upload: ${filename} (${fileSize} bytes, ${uploadDuration}ms)`,
        'file_upload',
        metadata
      )
    }
  }

  // Track security events
  static trackSecurityEvent(
    event: string,
    severity: ErrorSeverity,
    metadata?: Record<string, any>
  ) {
    this.captureMessage(
      `Security Event: ${event}`,
      ErrorCategory.SECURITY,
      severity,
      metadata
    )
  }
}

// Higher-order function for API route error handling
export function withErrorHandling<T extends (...args: any[]) => any>(
  handler: T,
  context: Omit<ErrorContext, 'userContext'>
): T {
  return ((...args: any[]) => {
    try {
      const result = handler(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          Monitoring.captureError(error, context)
          throw error
        })
      }
      
      return result
    } catch (error) {
      Monitoring.captureError(error as Error, context)
      throw error
    }
  }) as T
}

// React Error Boundary integration
export class MonitoringErrorBoundary extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public componentStack: string,
    public errorBoundary: string
  ) {
    super(message)
    this.name = 'MonitoringErrorBoundary'
  }
}

// Hook for React components error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    Monitoring.captureError(error, {
      category: ErrorCategory.UI,
      action: 'component_error',
      metadata: {
        componentStack: errorInfo?.componentStack,
      },
    })
  }
}

// Performance monitoring hooks
export function usePerformanceMonitor(operationName: string) {
  const startTime = Date.now()

  return {
    finish: (metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime
      Monitoring.trackPerformance({
        operation: operationName,
        duration,
        metadata,
      })
      return duration
    }
  }
}

// API middleware for automatic error tracking
export function apiErrorMiddleware(
  handler: any,
  endpoint: string
) {
  return async (req: any, res: any) => {
    const startTime = Date.now()
    const method = req.method || 'UNKNOWN'

    try {
      // Set request context
      Monitoring.setContext('request', {
        url: req.url,
        method,
        userAgent: req.headers?.['user-agent'],
        ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
      })

      const result = await handler(req, res)
      
      // Track successful API call
      const duration = Date.now() - startTime
      Monitoring.trackApiResponse(endpoint, method, res.statusCode || 200, duration)
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      Monitoring.trackApiResponse(
        endpoint,
        method,
        res.statusCode || 500,
        duration,
        error as Error
      )
      throw error
    }
  }
}