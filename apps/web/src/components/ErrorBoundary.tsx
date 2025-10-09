// React Error Boundary with Sentry Integration
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Monitoring, ErrorCategory, ErrorSeverity } from '@/lib/monitoring'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: 'page' | 'component'
  identifier?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to Sentry with context
    const eventId = Monitoring.captureError(error, {
      category: ErrorCategory.UI,
      action: 'error_boundary',
      resource: this.props.identifier || 'unknown_component',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.level || 'component',
        props: this.props.identifier,
      },
    }, ErrorSeverity.HIGH)

    this.setState({
      error,
      errorInfo,
      eventId: eventId as string,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isPageLevel = this.props.level === 'page'

      return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${
          isPageLevel ? 'min-h-screen bg-gray-50' : 'min-h-[400px] bg-white rounded-lg shadow-sm border'
        }`}>
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {isPageLevel ? 'Something went wrong' : 'Component Error'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isPageLevel 
                ? 'We encountered an unexpected error. Our team has been notified and is working on a fix.'
                : 'This component encountered an error. You can try reloading or continue using other features.'
              }
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <details className="text-sm">
                  <summary className="font-medium text-gray-700 cursor-pointer mb-2">
                    <Bug className="inline h-4 w-4 mr-1" />
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600 text-xs overflow-auto max-h-40">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-blue-600 text-xs overflow-auto max-h-40 mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              </div>
            )}

            <div className="space-y-3">
              {isPageLevel ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={this.handleReload}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </button>
                  <Link
                    href="/"
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={this.handleReset}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Reload Page
                  </button>
                </div>
              )}
            </div>

            {/* Feedback link */}
            <p className="text-xs text-gray-500 mt-4">
              Still having issues?{' '}
              <a 
                href="mailto:support@greenmate.app?subject=Error Report"
                className="text-green-600 hover:underline"
              >
                Contact Support
              </a>
              {this.state.eventId && (
                <>
                  {' '}(Error ID: <code className="bg-gray-100 px-1 rounded">{this.state.eventId.slice(0, 8)}</code>)
                </>
              )}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children, identifier }: { children: ReactNode; identifier?: string }) {
  return (
    <ErrorBoundary level="page" identifier={identifier}>
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children, identifier }: { children: ReactNode; identifier?: string }) {
  return (
    <ErrorBoundary level="component" identifier={identifier}>
      {children}
    </ErrorBoundary>
  )
}

// Custom hook for manual error reporting
export function useErrorReporting() {
  return {
    reportError: (error: Error, context?: string) => {
      Monitoring.captureError(error, {
        category: ErrorCategory.UI,
        action: 'manual_report',
        resource: context || 'unknown',
      })
    },
    
    reportMessage: (message: string, level: ErrorSeverity = ErrorSeverity.MEDIUM) => {
      Monitoring.captureMessage(message, ErrorCategory.UI, level)
    }
  }
}