import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Priority } from '@prisma/client'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const reportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(10_000),
  priority: z.nativeEnum(Priority).optional().default('MEDIUM'),
  appVersion: z.string().max(50).optional(),
  deviceInfo: z.string().max(255).optional(),
  stackTrace: z.string().max(20_000).optional(),
  reporterEmail: z.string().email().optional().or(z.literal('')),
})

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}

export async function POST(req: NextRequest) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  }

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const rl = await rateLimit(`report:${apiKey}`, 30, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter, cors)
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401, headers: cors })
  }

  const app = await prisma.application.findUnique({ where: { apiKey } })
  if (!app) {
    console.warn('[security] invalid API key on POST /api/v1/report', { keyPrefix: apiKey.slice(0, 8) })
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: cors })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: cors })
  }

  const parsed = reportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, details: parsed.error.issues },
      { status: 400, headers: cors }
    )
  }

  const { reporterEmail, ...data } = parsed.data

  const bug = await prisma.bugReport.create({
    data: {
      ...data,
      reporterEmail: reporterEmail || null,
      applicationId: app.id,
    },
    select: { id: true, status: true, priority: true, createdAt: true },
  })

  return NextResponse.json(
    { id: bug.id, status: bug.status, priority: bug.priority, createdAt: bug.createdAt },
    { status: 201, headers: cors }
  )
}
