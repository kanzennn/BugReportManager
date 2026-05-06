'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateApiKey } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { AppType } from '@prisma/client'

const appSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.nativeEnum(AppType),
  description: z.string().max(500).optional(),
})

type ActionState = { error: string } | null

export async function createApplicationAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth()
  const parsed = appSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const app = await prisma.application.create({
    data: { ...parsed.data, userId: session.userId, apiKey: generateApiKey() },
  })

  redirect(`/dashboard/applications/${app.id}?flash=app-created`)
}

export async function updateApplicationAction(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth()
  const parsed = appSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const app = await prisma.application.findFirst({ where: { id, userId: session.userId } })
  if (!app) return { error: 'Application not found' }

  await prisma.application.update({ where: { id }, data: parsed.data })
  revalidatePath(`/dashboard/applications/${id}`)
  redirect(`/dashboard/applications/${id}?flash=app-updated`)
}

export async function deleteApplicationAction(id: string) {
  const session = await requireAuth()
  await prisma.application.deleteMany({ where: { id, userId: session.userId } })
  revalidatePath('/dashboard/applications')
  redirect('/dashboard/applications?flash=app-deleted')
}

export async function regenerateApiKeyAction(id: string) {
  const session = await requireAuth()
  const app = await prisma.application.findFirst({ where: { id, userId: session.userId } })
  if (!app) return

  await prisma.application.update({ where: { id }, data: { apiKey: generateApiKey() } })
  revalidatePath(`/dashboard/applications/${id}`)
}
