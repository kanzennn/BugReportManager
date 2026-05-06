import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'

const STATE_COOKIE = 'oauth_state'

export function generateState(): string {
  return randomBytes(16).toString('hex')
}

export async function setOAuthState(state: string): Promise<void> {
  const store = await cookies()
  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
}

export async function verifyOAuthState(state: string): Promise<boolean> {
  const store = await cookies()
  const stored = store.get(STATE_COOKIE)?.value
  store.delete(STATE_COOKIE)
  return !!stored && stored === state
}

export async function findOrCreateOAuthUser({
  provider,
  providerId,
  email,
  name,
}: {
  provider: string
  providerId: string
  email: string
  name: string
}) {
  // Existing OAuth account → return its user
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerId: { provider, providerId } },
    include: { user: true },
  })
  if (existing) return existing.user

  // Existing user with matching email → link and return
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    await prisma.oAuthAccount.create({
      data: { provider, providerId, userId: existingUser.id },
    })
    return existingUser
  }

  // Brand-new user
  return prisma.user.create({
    data: {
      email,
      name,
      oauthAccounts: { create: { provider, providerId } },
    },
  })
}
