import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

function getClient() {
  const endpoint = process.env.AWS_S3_ENDPOINT

  return new S3Client({
    // IDCloudHost and most S3-compatible providers still require a region value,
    // even if they ignore it. Falls back to 'us-east-1' when not set.
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(endpoint && {
      endpoint,
      // Path-style URLs (https://endpoint/bucket/key) are required by
      // IDCloudHost and most non-AWS S3-compatible providers.
      forcePathStyle: true,
    }),
  })
}

export function getPublicUrl(key: string): string {
  // Explicit CDN / public base URL always wins (CloudFront, custom domain…)
  const cdn = process.env.AWS_S3_PUBLIC_URL
  if (cdn) return `${cdn.replace(/\/$/, '')}/${key}`

  const endpoint = process.env.AWS_S3_ENDPOINT
  const bucket = process.env.AWS_S3_BUCKET!

  if (endpoint) {
    // IDCloudHost path-style: https://is3.cloudhost.id/{bucket}/{key}
    return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`
  }

  // Standard AWS virtual-hosted URL
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    })
  )
  return getPublicUrl(key)
}

export async function deleteFromS3(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })
  )
}
