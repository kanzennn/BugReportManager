import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
