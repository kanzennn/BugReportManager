import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient }
const g = globalThis as GlobalWithPrisma

function createClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
  return new PrismaClient({ adapter })
}

export const prisma = g.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') g.prisma = prisma
