import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FeedbackType, FeedbackStatus } from '@prisma/client'

const feedbackSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required'),
  type: z.nativeEnum(FeedbackType).optional().default('GENERAL'),
  rating: z.number().int().min(1).max(5).optional(),
  appVersion: z.string().max(50).optional(),
  reporterEmail: z.string().email().optional().or(z.literal('')),
})

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401, headers: cors })
  }

  const app = await prisma.application.findUnique({ where: { apiKey } })
  if (!app) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: cors })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: cors })
  }

  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, details: parsed.error.issues },
      { status: 400, headers: cors }
    )
  }

  const { reporterEmail, ...data } = parsed.data

  const feedback = await prisma.feedback.create({
    data: {
      ...data,
      reporterEmail: reporterEmail || null,
      applicationId: app.id,
    },
    select: { id: true, type: true, status: true, createdAt: true },
  })

  return NextResponse.json(
    { id: feedback.id, type: feedback.type, status: feedback.status, createdAt: feedback.createdAt },
    { status: 201, headers: cors }
  )
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401, headers: cors })
  }

  const app = await prisma.application.findUnique({ where: { apiKey } })
  if (!app) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: cors })
  }

  const { searchParams } = req.nextUrl
  const type = Object.values(FeedbackType).find((t) => t === searchParams.get('type')?.toUpperCase())
  const status = Object.values(FeedbackStatus).find((s) => s === searchParams.get('status')?.toUpperCase())
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where: {
        applicationId: app.id,
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        status: true,
        rating: true,
        appVersion: true,
        reporterEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.feedback.count({
      where: {
        applicationId: app.id,
        ...(type && { type }),
        ...(status && { status }),
      },
    }),
  ])

  return NextResponse.json({ feedback: items, total, limit, offset }, { headers: cors })
}
