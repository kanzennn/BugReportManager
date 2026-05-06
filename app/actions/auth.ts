'use server'

import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { z } from 'zod'

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
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user) return { error: 'Invalid email or password' }
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
