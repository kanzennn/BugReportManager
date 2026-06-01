import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { toCSV } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const { userId } = await requireAuth()
  const appId = req.nextUrl.searchParams.get('appId')

  const appFilter = appId
    ? {
        id: appId,
        OR: [{ userId }, { members: { some: { userId } } }],
      }
    : { OR: [{ userId }, { members: { some: { userId } } }] }

  const apps = await prisma.application.findMany({
    where: appFilter,
    select: { id: true, name: true },
  })
  const appIds = apps.map((a) => a.id)
  const appNames = Object.fromEntries(apps.map((a) => [a.id, a.name]))

  if (appIds.length === 0) {
    return new NextResponse('No accessible applications found.', { status: 404 })
  }

  const items = await prisma.feedback.findMany({
    where: { applicationId: { in: appIds } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      status: true,
      rating: true,
      appVersion: true,
      reporterEmail: true,
      applicationId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const header = ['ID', 'Application', 'Title', 'Message', 'Type', 'Status', 'Rating', 'App Version', 'Reporter Email', 'Created At', 'Updated At']
  const rows = items.map((f) => [
    f.id,
    appNames[f.applicationId] ?? f.applicationId,
    f.title,
    f.message,
    f.type,
    f.status,
    f.rating != null ? String(f.rating) : '',
    f.appVersion ?? '',
    f.reporterEmail ?? '',
    f.createdAt.toISOString(),
    f.updatedAt.toISOString(),
  ])

  const csv = toCSV([header, ...rows])
  const filename = appId ? `feedback-${appId}.csv` : 'feedback-all.csv'

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
