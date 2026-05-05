import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditApplicationForm } from './form'

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const app = await prisma.application.findFirst({
    where: { id, userId },
    select: { id: true, name: true, type: true, description: true },
  })

  if (!app) notFound()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <EditApplicationForm app={app} />
    </div>
  )
}
