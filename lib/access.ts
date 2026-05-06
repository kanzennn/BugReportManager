import { prisma } from '@/lib/db'
import type { MemberRole } from '@prisma/client'

export type AppRole = 'OWNER' | MemberRole

const hierarchy: Record<AppRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
}

export async function getAppRole(userId: string, appId: string): Promise<AppRole | null> {
  const app = await prisma.application.findFirst({
    where: { id: appId },
    select: {
      userId: true,
      members: { where: { userId }, select: { role: true } },
    },
  })
  if (!app) return null
  if (app.userId === userId) return 'OWNER'
  const member = app.members[0]
  return member ? (member.role as AppRole) : null
}

export function canEdit(role: AppRole): boolean {
  return hierarchy[role] >= hierarchy.EDITOR
}

export function canAdmin(role: AppRole): boolean {
  return hierarchy[role] >= hierarchy.ADMIN
}

export function isOwner(role: AppRole): boolean {
  return role === 'OWNER'
}

export const ROLE_LABELS: Record<AppRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  VIEWER: 'Can view bug reports and feedback.',
  EDITOR: 'Can view and update status of bug reports and feedback.',
  ADMIN: 'Can view, update, and delete bug reports and feedback.',
}
