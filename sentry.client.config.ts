import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,

  // Replay integration for session recordings (optional)
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only initialize in production or when DSN is explicitly set
  enabled: !!(process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN),

  environment: process.env.NODE_ENV,
})
