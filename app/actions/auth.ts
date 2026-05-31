'use server'

import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

async function getActionIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? '127.0.0.1'
}

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  redirectTo: z.string().optional(),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  redirectTo: z.string().optional(),
})

type ActionState = { error: string } | null

function safeRedirect(url: string | undefined): string {
  if (!url || !url.startsWith('/')) return '/dashboard'
  return url
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await getActionIp()
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60_000)
  if (!rl.allowed) {
    return { error: `Too many login attempts. Try again in ${rl.retryAfter} seconds.` }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user) return { error: 'Invalid email or password' }
  if (user.bannedAt) return { error: 'This account has been suspended.' }
  if (!user.password) {
    return { error: 'This account uses social login. Please sign in with Google or GitHub.' }
  }
  if (!(await bcrypt.compare(parsed.data.password, user.password))) {
    return { error: 'Invalid email or password' }
  }

  await createSession(user.id)
  const dest = safeRedirect(parsed.data.redirectTo)
  redirect(dest.includes('?') ? `${dest}&flash=logged-in` : `${dest}?flash=logged-in`)
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await getActionIp()
  const rl = rateLimit(`register:${ip}`, 10, 60 * 60_000)
  if (!rl.allowed) {
    return { error: `Too many registration attempts. Try again in ${rl.retryAfter} seconds.` }
  }

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { error: 'An account with this email already exists' }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: hashed },
  })

  await createSession(user.id)
  const regDest = safeRedirect(parsed.data.redirectTo)
  redirect(regDest.includes('?') ? `${regDest}&flash=registered` : `${regDest}?flash=registered`)
}

export async function logoutAction() {
  await deleteSession()
  redirect('/login?flash=logged-out')
}

type ForgotState = { error: string } | { sent: true } | null

export async function forgotPasswordAction(_: ForgotState, formData: FormData): Promise<ForgotState> {
  const ip = await getActionIp()
  const rl = rateLimit(`forgot:${ip}`, 3, 60 * 60_000)
  if (!rl.allowed) {
    return { error: `Too many attempts. Try again in ${rl.retryAfter} seconds.` }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Email is required.' }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } })

  // Always return success to not reveal whether the email exists
  if (!user || !user.password) {
    return { sent: true }
  }

  const token = randomBytes(32).toString('hex')
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60_000),
    },
  })

  try {
    await sendPasswordResetEmail({ to: email, resetToken: token })
  } catch (err) {
    console.error('Password reset email failed:', err)
  }

  return { sent: true }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await prisma.user.findUnique({
    where: { resetToken: parsed.data.token },
    select: { id: true, resetTokenExpiresAt: true },
  })

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return { error: 'This reset link is invalid or has expired.' }
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiresAt: null },
  })

  redirect('/login?flash=password-reset')
}
