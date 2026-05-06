'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { sendInvitationEmail } from '@/lib/email'
import { MemberRole } from '@prisma/client'
import { z } from 'zod'

type InviteState = { error?: string; success?: string } | null

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(MemberRole),
})

export async function inviteUserAction(appId: string, _: InviteState, formData: FormData): Promise<InviteState> {
  const session = await requireAuth()

  const app = await prisma.application.findFirst({
    where: { id: appId, userId: session.userId },
    select: { name: true, user: { select: { name: true } } },
  })
  if (!app) return { error: 'Application not found or insufficient permissions.' }

  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { email, role } = parsed.data

  // Can't invite yourself
  const self = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } })
  if (self?.email === email) return { error: "You can't invite yourself." }

  // Check if already a member
  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (targetUser) {
    const existing = await prisma.applicationMember.findUnique({
      where: { userId_applicationId: { userId: targetUser.id, applicationId: appId } },
    })
    if (existing) return { error: 'This user is already a member.' }
  }

  // Replace any existing pending invitation
  await prisma.invitation.deleteMany({ where: { email, applicationId: appId, status: 'PENDING' } })

  const token = randomBytes(32).toString('hex')
  await prisma.invitation.create({
    data: {
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      applicationId: appId,
      invitedById: session.userId,
    },
  })

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    await sendInvitationEmail({
      to: email,
      inviterName: app.user.name,
      appName: app.name,
      role,
      invitationLink: `${base}/invitations/accept?token=${token}`,
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }

  revalidatePath(`/dashboard/applications/${appId}`)
  return { success: `Invitation sent to ${email}.` }
}

export async function inviteUserGeneralAction(state: InviteState, formData: FormData): Promise<InviteState> {
  const appId = (formData.get('appId') as string)?.trim()
  if (!appId) return { error: 'Please select an application.' }
  return inviteUserAction(appId, state, formData)
}

export async function removeMemberAction(appId: string, memberId: string) {
  const session = await requireAuth()

  const app = await prisma.application.findFirst({ where: { id: appId, userId: session.userId } })
  if (!app) return

  await prisma.applicationMember.deleteMany({ where: { applicationId: appId, userId: memberId } })
  revalidatePath(`/dashboard/applications/${appId}`)
}

export async function updateMemberRoleAction(appId: string, memberId: string, role: MemberRole) {
  const session = await requireAuth()

  const app = await prisma.application.findFirst({ where: { id: appId, userId: session.userId } })
  if (!app) return

  await prisma.applicationMember.update({
    where: { userId_applicationId: { userId: memberId, applicationId: appId } },
    data: { role },
  })
  revalidatePath(`/dashboard/applications/${appId}`)
}

export async function revokeInvitationAction(invitationId: string, appId: string) {
  const session = await requireAuth()

  const app = await prisma.application.findFirst({ where: { id: appId, userId: session.userId } })
  if (!app) return

  await prisma.invitation.updateMany({
    where: { id: invitationId, applicationId: appId, status: 'PENDING' },
    data: { status: 'EXPIRED' },
  })
  revalidatePath(`/dashboard/applications/${appId}`)
}

export async function acceptInvitationAction(token: string) {
  const session = await requireAuth()

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { application: { select: { id: true, name: true, userId: true } } },
  })

  if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
    redirect('/dashboard?invite=invalid')
  }

  if (invitation.application.userId === session.userId) {
    redirect(`/dashboard/applications/${invitation.application.id}`)
  }

  await prisma.$transaction([
    prisma.applicationMember.upsert({
      where: { userId_applicationId: { userId: session.userId, applicationId: invitation.application.id } },
      create: { userId: session.userId, applicationId: invitation.application.id, role: invitation.role },
      update: { role: invitation.role },
    }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'ACCEPTED' } }),
  ])

  redirect(`/dashboard/applications/${invitation.application.id}`)
}

export async function declineInvitationAction(token: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (invitation?.status === 'PENDING') {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'DECLINED' } })
  }
  redirect('/dashboard')
}
