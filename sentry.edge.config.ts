import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring (lower rate for edge functions)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Only initialize when DSN is set
  enabled: !!process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV,
})
