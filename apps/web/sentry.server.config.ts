// This file configures the initialization of Sentry for server-side
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // Configure beforeSend to filter out unwanted errors
  beforeSend(event, hint) {
    // Filter out non-actionable errors
    const error = hint.originalException
    
    // Skip database connection timeout errors (handled by retry logic)
    if (error?.message?.includes('connect ETIMEDOUT') || 
        error?.message?.includes('Connection terminated')) {
      return null
    }

    // Skip rate limiting errors (expected behavior)
    if (error?.message?.includes('Rate limit exceeded')) {
      return null
    }

    // Skip validation errors (user input errors, not code bugs)
    if (error?.name === 'ZodError' || error?.name === 'ValidationError') {
      return null
    }

    return event
  },

  // Set context tags for server-side
  initialScope: {
    tags: {
      component: 'server',
    },
  },

  // Configure integrations for server
  integrations: [
    new Sentry.Integrations.Http({ 
      tracing: true,
      breadcrumbs: true,
    }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],

  // Release information
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Configure performance monitoring for server
  _experiments: {
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,
  },
})