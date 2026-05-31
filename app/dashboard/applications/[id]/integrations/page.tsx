import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getAppRole, isOwner } from '@/lib/access'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TrelloConnect } from './trello-connect'
import { trelloAuthUrl } from '@/lib/trello'

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const role = await getAppRole(userId, id)
  if (!role) notFound()
  if (!isOwner(role)) redirect(`/dashboard/applications/${id}`)

  const app = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      trelloToken: true,
      trelloBoardId: true,
      trelloBoardName: true,
      trelloListId: true,
      trelloListName: true,
    },
  })
  if (!app) notFound()

  if (!process.env.TRELLO_API_KEY) {
    return (
      <div className="max-w-xl space-y-6">
        <Link href={`/dashboard/applications/${id}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Integrations</h1>
        <div className="rounded-xl border border-yellow-800/50 bg-yellow-500/10 p-5 text-sm text-yellow-400">
          <strong>TRELLO_API_KEY</strong> is not set. Add it to your <code>.env</code> file to enable Trello integration.
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const returnUrl = `${baseUrl}/dashboard/applications/${id}/integrations`
  const authUrl = trelloAuthUrl(returnUrl)

  return (
    <div className="max-w-xl space-y-6">
      <Link href={`/dashboard/applications/${id}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
        <ArrowLeft className="h-4 w-4" /> {app.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Integrations</h1>
        <p className="mt-1 text-sm text-zinc-400">Connect external tools to {app.name}.</p>
      </div>

      <TrelloConnect
        appId={id}
        authUrl={authUrl}
        trelloToken={app.trelloToken}
        trelloBoardId={app.trelloBoardId}
        trelloBoardName={app.trelloBoardName}
        trelloListId={app.trelloListId}
        trelloListName={app.trelloListName}
      />
    </div>
  )
}
