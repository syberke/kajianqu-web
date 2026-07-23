import { PrismaClient } from '@prisma/client'

import { getRuntimeDatabaseUrl } from '@/lib/database-url'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const datasourceUrl = getRuntimeDatabaseUrl(process.env.DATABASE_URL)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
