import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { withCache } from '@/lib/cache'
import { getRedis } from '@/lib/redis'
import { randomBytes } from 'crypto'

const secretValue = process.env.JWT_SECRET
if (!secretValue || secretValue.length < 32) {
  throw new Error('JWT_SECRET must be set to a random string of at least 32 characters')
}
const secret = new TextEncoder().encode(secretValue)

const COOKIE = 'brm_session'

export async function createSession(userId: string) {
  const jti = randomBytes(16).toString('hex')
  const token = await new SignJWT({ userId, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  // Store userId→jti mapping in Redis for session revocation on ban
  const redis = getRedis()
  if (redis) {
    try {
      await redis.set(`session:user:${userId}`, jti, 'EX', 60 * 60 * 24 * 7)
    } catch {
      // Redis errors are non-fatal
    }
  }

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<{ userId: string; jti?: string } | null> {
  try {
    const store = await cookies()
    const token = store.get(COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    const userId = payload.userId as string
    const jti = payload.jti as string | undefined

    // Check Redis blacklist for revoked tokens
    if (jti) {
      const redis = getRedis()
      if (redis) {
        try {
          const revoked = await redis.get(`session:revoked:${jti}`)
          if (revoked) return null
        } catch {
          // Redis errors are non-fatal — allow session if Redis is down
        }
      }
    }

    return { userId, jti }
  } catch {
    return null
  }
}

export async function deleteSession() {
  try {
    const store = await cookies()
    const token = store.get(COOKIE)?.value
    if (token) {
      // Revoke the JWT in Redis so it can't be reused before expiry
      try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
        const jti = payload.jti as string | undefined
        const exp = payload.exp as number | undefined
        if (jti && exp) {
          const redis = getRedis()
          if (redis) {
            const ttl = Math.max(1, exp - Math.floor(Date.now() / 1000))
            await redis.set(`session:revoked:${jti}`, '1', 'EX', ttl)
          }
        }
      } catch {
        // Token is already invalid or Redis is down — proceed with cookie deletion
      }
    }
    store.delete(COOKIE)
  } catch {
    // cookies() may throw in edge cases
  }
}

/**
 * Revoke a session by JWT string (e.g., called from ban action).
 * Can also be called with just a userId to revoke by the stored jti mapping.
 */
export async function revokeSessionByUserId(userId: string) {
  const redis = getRedis()
  if (!redis) return

  try {
    const jti = await redis.get(`session:user:${userId}`)
    if (jti) {
      // Blacklist for 7 days (max session TTL)
      await redis.set(`session:revoked:${jti}`, '1', 'EX', 60 * 60 * 24 * 7)
      await redis.del(`session:user:${userId}`)
    }
  } catch {
    // Non-fatal
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isBanned = await withCache(`user:${session.userId}:banned`, 60, async () => {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { bannedAt: true },
    })
    return !user || user.bannedAt !== null
  })

  if (isBanned) {
    await deleteSession()
    redirect('/login?flash=banned')
  }

  // Fetch flags needed for dashboard UI without caching (so banners update promptly)
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { emailVerified: true, deletedAt: true },
  })

  return {
    userId: session.userId,
    emailVerified: user?.emailVerified ?? true,
    pendingDeletion: user?.deletedAt !== null && user?.deletedAt !== undefined,
  }
}
