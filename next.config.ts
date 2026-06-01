import type { NextConfig } from 'next'

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com",
  "frame-src https://app.midtrans.com https://app.sandbox.midtrans.com",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: CSP },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  experimental: {
    serverActions: {
      // Must be above our 5 MB validation threshold so the action's own
      // error message is shown instead of a framework-level crash.
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      // AWS S3 — standard virtual-hosted URL
      { protocol: 'https', hostname: '**.amazonaws.com' },
      // S3-compatible endpoint (IDCloudHost: is3.cloudhost.id, DigitalOcean, MinIO…)
      ...(process.env.AWS_S3_ENDPOINT
        ? [{ protocol: 'https' as const, hostname: new URL(process.env.AWS_S3_ENDPOINT).hostname }]
        : []),
      // CloudFront or any custom CDN base URL
      ...(process.env.AWS_S3_PUBLIC_URL
        ? [{ protocol: 'https' as const, hostname: new URL(process.env.AWS_S3_PUBLIC_URL).hostname }]
        : []),
    ],
  },
}

export default nextConfig
