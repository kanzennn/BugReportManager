'use client'

import { useTransition } from 'react'
import { removeMemberAction, updateMemberRoleAction, revokeInvitationAction } from '@/app/actions/invitations'
import { Crown, X, Clock } from 'lucide-react'
import type { MemberRole } from '@prisma/client'

const ROLE_OPTIONS: MemberRole[] = ['VIEWER', 'EDITOR', 'ADMIN']

const roleColors: Record<MemberRole | 'OWNER', string> = {
  OWNER: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  ADMIN: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  EDITOR: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  VIEWER: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

interface Member {
  userId: string
  role: MemberRole
  user: { id: string; name: string; email: string }
}

interface PendingInvitation {
  id: string
  email: string
  role: MemberRole
  expiresAt: Date
}

interface Props {
  appId: string
  owner: { name: string; email: string }
  members: Member[]
  pendingInvitations: PendingInvitation[]
  isOwner: boolean
}

function RoleBadge({ role }: { role: MemberRole | 'OWNER' }) {
  const label = role === 'OWNER' ? 'Owner' : role.charAt(0) + role.slice(1).toLowerCase()
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColors[role]}`}>
      {role === 'OWNER' && <Crown className="mr-1 h-3 w-3" />}
      {label}
    </span>
  )
}

function MemberRow({ member, appId, isOwner }: { member: Member; appId: string; isOwner: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
        {member.user.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100">{member.user.name}</p>
        <p className="truncate text-xs text-zinc-500">{member.user.email}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isOwner ? (
          <select
            value={member.role}
            disabled={pending}
            onChange={(e) =>
              startTransition(() =>
                updateMemberRoleAction(appId, member.userId, e.target.value as MemberRole)
              )
            }
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
            ))}
          </select>
        ) : (
          <RoleBadge role={member.role} />
        )}
        {isOwner && (
          <button
            onClick={() => startTransition(() => removeMemberAction(appId, member.userId))}
            disabled={pending}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400 disabled:opacity-50"
            title="Remove member"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function InvitationRow({ inv, appId }: { inv: PendingInvitation; appId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-3 py-3 opacity-60">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-600 text-zinc-500">
        <Clock className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-zinc-300">{inv.email}</p>
        <p className="text-xs text-zinc-600">Invitation pending</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RoleBadge role={inv.role} />
        <button
          onClick={() => startTransition(() => revokeInvitationAction(inv.id, appId))}
          disabled={pending}
          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400 disabled:opacity-50"
          title="Revoke invitation"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function MembersList({ appId, owner, members, pendingInvitations, isOwner }: Props) {
  const total = 1 + members.length + pendingInvitations.length

  return (
    <div>
      <p className="mb-0.5 text-xs text-zinc-500">{total} member{total !== 1 ? 's' : ''}</p>
      <div className="divide-y divide-zinc-800">
        {/* Owner row */}
        <div className="flex items-center gap-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
            {owner.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-100">{owner.name}</p>
            <p className="truncate text-xs text-zinc-500">{owner.email}</p>
          </div>
          <RoleBadge role="OWNER" />
        </div>

        {members.map((m) => (
          <MemberRow key={m.userId} member={m} appId={appId} isOwner={isOwner} />
        ))}

        {isOwner && pendingInvitations.map((inv) => (
          <InvitationRow key={inv.id} inv={inv} appId={appId} />
        ))}
      </div>
    </div>
  )
}
