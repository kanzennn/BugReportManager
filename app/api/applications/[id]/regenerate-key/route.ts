import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateApiKey } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await requireAuth()

    const app = await prisma.application.findFirst({ where: { id, userId } })
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.application.update({
      where: { id },
      data: { apiKey: generateApiKey() },
      select: { apiKey: true },
    })

    return NextResponse.json({ apiKey: updated.apiKey })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
