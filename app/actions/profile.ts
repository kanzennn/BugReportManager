'use server'

import { prisma } from '@/lib/db'
import { requireAuth, deleteSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { uploadToS3, deleteFromS3 } from '@/lib/s3'

type State = { error?: string; success?: string } | null

export async function updateProfileAction(_: State, formData: FormData): Promise<State> {
  const { userId } = await requireAuth()

  const name = (formData.get('name') as string)?.trim()
  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' }
  if (name.length > 100) return { error: 'Name must be 100 characters or fewer.' }

  await prisma.user.update({ where: { id: userId }, data: { name } })
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: 'Profile updated.' }
}

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Current password is required.'),
    next: z.string().min(8, 'New password must be at least 8 characters.'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: 'Passwords do not match.', path: ['confirm'] })

export async function changePasswordAction(_: State, formData: FormData): Promise<State> {
  const { userId } = await requireAuth()

  const parsed = passwordSchema.safeParse({
    current: formData.get('current'),
    next: formData.get('next'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
  if (!user?.password) return { error: 'This account uses social login and has no password.' }

  const match = await bcrypt.compare(parsed.data.current, user.password)
  if (!match) return { error: 'Current password is incorrect.' }

  const hashed = await bcrypt.hash(parsed.data.next, 12)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  return { success: 'Password updated.' }
}

export async function uploadAvatarAction(_: State, formData: FormData): Promise<State> {
  const { userId } = await requireAuth()

  const file = formData.get('avatar')
  if (!file || typeof file === 'string' || file.size === 0) return { error: 'No file selected.' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) return { error: 'Only JPEG, PNG, WebP, and GIF are allowed.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Image must be smaller than 5 MB.' }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const key = `avatars/${userId}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let url: string
  try {
    url = await uploadToS3(key, buffer, file.type)
  } catch (err) {
    console.error('S3 upload error:', err)
    return { error: 'Upload failed. Check your S3 configuration and try again.' }
  }

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } })
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: 'Profile picture updated.' }
}

export async function removeAvatarAction(): Promise<void> {
  const { userId } = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  })
  if (!user?.avatarUrl) return

  // Best-effort delete from S3 (ignore errors if key changed)
  const match = user.avatarUrl.match(/avatars\/[^/?]+/)
  if (match) {
    try { await deleteFromS3(match[0]) } catch { /* ignore */ }
  }

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } })
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
}

export async function deleteAccountAction() {
  const { userId } = await requireAuth()

  // Remove avatar from S3 before deleting account
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } })
  if (user?.avatarUrl) {
    const match = user.avatarUrl.match(/avatars\/[^/?]+/)
    if (match) { try { await deleteFromS3(match[0]) } catch { /* ignore */ } }
  }

  await prisma.user.delete({ where: { id: userId } })
  await deleteSession()
  redirect('/register')
}
