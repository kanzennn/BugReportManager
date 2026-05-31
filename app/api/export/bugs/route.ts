import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

function toCSV(rows: string[][]): string {
  return rows.map((r) => r.map((v) => `"${(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
}

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

  const bugs = await prisma.bugReport.findMany({
    where: { applicationId: { in: appIds } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      appVersion: true,
      deviceInfo: true,
      stackTrace: true,
      reporterEmail: true,
      applicationId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const header = ['ID', 'Application', 'Title', 'Description', 'Status', 'Priority', 'App Version', 'Device Info', 'Stack Trace', 'Reporter Email', 'Created At', 'Updated At']
  const rows = bugs.map((b) => [
    b.id,
    appNames[b.applicationId] ?? b.applicationId,
    b.title,
    b.description,
    b.status,
    b.priority,
    b.appVersion ?? '',
    b.deviceInfo ?? '',
    b.stackTrace ?? '',
    b.reporterEmail ?? '',
    b.createdAt.toISOString(),
    b.updatedAt.toISOString(),
  ])

  const csv = toCSV([header, ...rows])
  const filename = appId ? `bugs-${appId}.csv` : 'bugs-all.csv'

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
