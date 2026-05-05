import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production-please'
)

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
    const { payload } = await jwtVerify(token, secret)
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
  return session
}
