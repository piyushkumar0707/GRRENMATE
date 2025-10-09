// This file configures the initialization of Sentry on the browser/client-side
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,

  // If the entire session is not sampled, use the below sample rate to sample sessions when an error occurs
  replaysOnErrorSampleRate: 1.0,

  // Configure which URLs should be traced
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/[^\/]*\.vercel\.app/,
    /^https:\/\/greenmate/,
  ],

  // Configure beforeSend to filter out unwanted errors
  beforeSend(event, hint) {
    // Filter out non-actionable errors
    const error = hint.originalException
    
    // Skip network errors that are likely due to user network issues
    if (error?.message?.includes('NetworkError') || 
        error?.message?.includes('Failed to fetch')) {
      return null
    }

    // Skip ResizeObserver errors (common browser quirk)
    if (error?.message?.includes('ResizeObserver loop limit exceeded')) {
      return null
    }

    // Skip script loading errors (likely ad blockers)
    if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
      return null
    }

    return event
  },

  // Set context tags
  initialScope: {
    tags: {
      component: 'client',
    },
  },

  // Configure integrations
  integrations: [
    new Sentry.Replay({
      // Capture 10% of all sessions,
      // plus 100% of sessions with an error
      sessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
      errorSampleRate: 1.0,
    }),
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      routingInstrumentation: Sentry.nextRouterInstrumentation,
      
      // Only trace important routes
      tracingOrigins: [
        'localhost',
        /^https:\/\/[^\/]*\.vercel\.app/,
        /^https:\/\/greenmate/,
      ],
    }),
  ],

  // Release information for better error tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Configure performance monitoring
  _experiments: {
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,
  },
})