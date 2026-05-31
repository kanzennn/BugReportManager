import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined
}

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null

  if (!global._redis) {
    global._redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: false,
    })
    global._redis.on('error', (err: Error) => {
      console.error('[Redis]', err.message)
    })
  }

  return global._redis
}
