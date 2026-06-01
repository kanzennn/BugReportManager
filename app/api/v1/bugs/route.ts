import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { BugStatus, Priority } from '@prisma/client'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const cors = { 'Access-Control-Allow-Origin': '*' }

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const rl = await rateLimit(`bugs:${apiKey}`, 60, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter, cors)
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401, headers: cors })
  }

  const app = await prisma.application.findUnique({ where: { apiKey } })
  if (!app) {
    console.warn('[security] invalid API key on GET /api/v1/bugs', { keyPrefix: apiKey.slice(0, 8) })
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: cors })
  }

  const { searchParams } = req.nextUrl
  const status = Object.values(BugStatus).find((s) => s === searchParams.get('status')?.toUpperCase())
  const priority = Object.values(Priority).find((p) => p === searchParams.get('priority')?.toUpperCase())
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const [bugs, total] = await Promise.all([
    prisma.bugReport.findMany({
      where: {
        applicationId: app.id,
        ...(status && { status }),
        ...(priority && { priority }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        appVersion: true,
        deviceInfo: true,
        reporterEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.bugReport.count({
      where: {
        applicationId: app.id,
        ...(status && { status }),
        ...(priority && { priority }),
      },
    }),
  ])

  return NextResponse.json({ bugs, total, limit, offset }, { headers: cors })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}
