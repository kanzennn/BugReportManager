import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PresenceRefresher } from '@/components/members/presence-refresher'
import { ConfirmButton } from '@/components/ui/confirm-button'
import { revokeInvitationAction } from '@/app/actions/invitations'
import { relativeTime, formatDateTime } from '@/lib/utils'
import { Users, Clock, MailOpen } from 'lucide-react'
import type { MemberRole } from '@prisma/client'
import { getLocale } from '@/lib/locale'
import { createTranslator } from '@/lib/i18n'

const ONLINE_MS = 5 * 60 * 1000
const AWAY_MS   = 30 * 60 * 1000

function presenceState(lastSeenAt: Date | null): 'online' | 'away' | 'offline' {
  if (!lastSeenAt) return 'offline'
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  if (diff < ONLINE_MS) return 'online'
  if (diff < AWAY_MS)   return 'away'
  return 'offline'
}

function PresenceDot({ state }: { state: 'online' | 'away' | 'offline' }) {
  if (state === 'online') {
    return (
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
    )
  }
  if (state === 'away') return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-600" />
}

const roleColors: Record<MemberRole, string> = {
  VIEWER: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  EDITOR: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ADMIN:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColors[role]}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  )
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-indigo-600/20 text-xs font-bold text-indigo-400">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default async function MembersPage() {
  const { userId } = await requireAuth()
  const locale = await getLocale()
  const t = createTranslator(locale)

  const apps = await prisma.application.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true, lastSeenAt: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      invitations: {
        where: { status: 'PENDING', expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, createdAt: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const totalMembers = apps.reduce((s, a) => s + a.members.length, 0)
  const totalPending = apps.reduce((s, a) => s + a.invitations.length, 0)
  const onlineCount  = apps.reduce((s, a) =>
    s + a.members.filter((m) => presenceState(m.user.lastSeenAt) === 'online').length, 0)

  const hasMembersOrInvites = totalMembers > 0 || totalPending > 0

  const memberDesc = locale === 'id'
    ? `${totalMembers} anggota di ${apps.length} aplikasi · `
    : `${totalMembers} member${totalMembers !== 1 ? 's' : ''} across ${apps.length} application${apps.length !== 1 ? 's' : ''} · `

  return (
    <div className="space-y-8">
      <PresenceRefresher intervalMs={30_000} />

      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{t('members.title')}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {memberDesc}
          <span className="text-emerald-400">{t('members.onlineCount', { count: onlineCount })}</span>
        </p>
      </div>

      {!hasMembersOrInvites ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 py-20">
          <Users className="mb-4 h-10 w-10 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-400">{t('members.empty.title')}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {locale === 'id'
              ? <>Gunakan tombol <span className="text-indigo-400">Undang anggota</span> di bilah samping untuk memulai.</>
              : <>Use the <span className="text-indigo-400">Invite member</span> button in the sidebar to get started.</>
            }
          </p>
        </div>
      ) : (
        <>
          {apps.filter((a) => a.members.length > 0).map((app) => {
            const appOnline = app.members.filter((m) => presenceState(m.user.lastSeenAt) === 'online').length
            return (
              <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-zinc-400" />
                    <Link href={`/dashboard/applications/${app.id}`} className="text-sm font-semibold text-zinc-100 hover:text-indigo-400">
                      {app.name}
                    </Link>
                    <span className="text-xs text-zinc-500">
                      {app.members.length} {locale === 'id' ? 'anggota' : `member${app.members.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  {appOnline > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t('members.onlineCount', { count: appOnline })}
                    </span>
                  )}
                </div>

                <div className="divide-y divide-zinc-800">
                  {app.members.map((m) => {
                    const state = presenceState(m.user.lastSeenAt)
                    return (
                      <div key={m.userId} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="relative shrink-0">
                          <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} />
                          <span className="absolute -bottom-0.5 -right-0.5"><PresenceDot state={state} /></span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-100">{m.user.name}</p>
                          <p className="truncate text-xs text-zinc-500">{m.user.email}</p>
                        </div>
                        <RoleBadge role={m.role} />
                        <div className="hidden shrink-0 text-right sm:block">
                          {state === 'online' ? (
                            <span className="text-xs font-medium text-emerald-400">{t('members.online')}</span>
                          ) : state === 'away' ? (
                            <span className="text-xs text-amber-500">{t('members.away')}</span>
                          ) : m.user.lastSeenAt ? (
                            <span className="text-xs text-zinc-600" title={formatDateTime(m.user.lastSeenAt, locale)}>
                              {relativeTime(m.user.lastSeenAt, locale)}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-700">{t('members.neverSeen')}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {totalPending > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5">
                <MailOpen className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-100">{t('members.pendingInvitations')}</h2>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/30">
                  {totalPending}
                </span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/40">
                    {['members.table.email', 'members.table.application', 'members.table.role', 'members.table.sent'].map((k) => (
                      <th key={k} className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">{t(k)}</th>
                    ))}
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {apps.flatMap((app) =>
                    app.invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 text-sm text-zinc-300">{inv.email}</td>
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/applications/${app.id}`} className="text-xs text-zinc-400 hover:text-zinc-100">
                            {app.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3"><RoleBadge role={inv.role} /></td>
                        <td className="px-5 py-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {relativeTime(inv.createdAt, locale)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <ConfirmButton
                            title={t('members.confirmRevokeTitle')}
                            action={revokeInvitationAction.bind(null, inv.id, app.id)}
                            message={locale === 'id' ? `Cabut undangan untuk ${inv.email}?` : `Revoke invitation to ${inv.email}?`}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400"
                          >
                            {t('members.revoke')}
                          </ConfirmButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
