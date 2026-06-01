import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { withCache } from '@/lib/cache'

const secretValue = process.env.JWT_SECRET
if (!secretValue || secretValue.length < 32) {
  throw new Error('JWT_SECRET must be set to a random string of at least 32 characters')
}
const secret = new TextEncoder().encode(secretValue)

const COOKIE = 'brm_session'

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<{ userId: string } | null> {
  try {
    const store = await cookies()
    const token = store.get(COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(COOKIE)
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

  return session
}
