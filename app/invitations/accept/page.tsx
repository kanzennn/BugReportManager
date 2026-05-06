import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { acceptInvitationAction, declineInvitationAction } from '@/app/actions/invitations'
import Link from 'next/link'
import { Bug, ShieldCheck, Eye, Pencil, Crown } from 'lucide-react'
import type { MemberRole } from '@prisma/client'

const ROLE_ICONS: Record<MemberRole, typeof Eye> = {
  VIEWER: Eye,
  EDITOR: Pencil,
  ADMIN: ShieldCheck,
}

const ROLE_LABELS: Record<MemberRole, string> = {
  VIEWER: 'Viewer',
  EDITOR: 'Editor',
  ADMIN: 'Admin',
}

const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  VIEWER: 'Can view all bug reports and feedback for this application.',
  EDITOR: 'Can view and update the status of bug reports and feedback.',
  ADMIN: 'Can view, update, and delete bug reports and feedback.',
}

function InvalidPage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Bug className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-zinc-100">Invalid Invitation</h1>
        <p className="mt-2 text-sm text-zinc-400">{message}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}

export default async function InvitationAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) return <InvalidPage message="No invitation token was provided." />

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      application: { select: { id: true, name: true, type: true } },
      invitedBy: { select: { name: true, email: true } },
    },
  })

  if (!invitation) return <InvalidPage message="This invitation link is invalid or has been removed." />

  if (invitation.status !== 'PENDING') {
    return <InvalidPage message={
      invitation.status === 'ACCEPTED'
        ? 'This invitation has already been accepted.'
        : 'This invitation has expired or was declined.'
    } />
  }

  if (invitation.expiresAt < new Date()) {
    return <InvalidPage message="This invitation has expired. Ask the owner to send a new one." />
  }

  // Require login
  const session = await getSession()
  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(`/invitations/accept?token=${token}`)}`)
  }

  const RoleIcon = ROLE_ICONS[invitation.role]
  const acceptAction = acceptInvitationAction.bind(null, token)
  const declineAction = declineInvitationAction.bind(null, token)

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
              <Bug className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">You&apos;re invited!</h1>
          <p className="mt-1 text-sm text-zinc-400">Review the details below before accepting.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-6">
          {/* Inviter */}
          <div className="text-center">
            <p className="text-sm text-zinc-400">
              <span className="font-semibold text-zinc-100">{invitation.invitedBy.name}</span>
              {' '}has invited you to collaborate on
            </p>
            <p className="mt-1 text-lg font-bold text-indigo-400">{invitation.application.name}</p>
          </div>

          {/* Role card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400">
                <RoleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  Role: <span className="text-indigo-400">{ROLE_LABELS[invitation.role]}</span>
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{ROLE_DESCRIPTIONS[invitation.role]}</p>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <p className="text-center text-xs text-zinc-600">
            Expires{' '}
            {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <form action={declineAction} className="flex-1">
              <button
                type="submit"
                className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
              >
                Decline
              </button>
            </form>
            <form action={acceptAction} className="flex-1">
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Accept Invitation
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
