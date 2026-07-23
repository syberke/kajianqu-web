import { PrismaClient } from '@prisma/client'
import { afterAll, describe, expect, it } from 'vitest'

const prisma = new PrismaClient()

afterAll(async () => {
  await prisma.$disconnect()
})

describe('generated Prisma Client', () => {
  it('contains every delegate used by the ustadz and chat features', () => {
    expect(typeof prisma.conversation.findMany).toBe('function')
    expect(typeof prisma.savedItem.findMany).toBe('function')
    expect(typeof prisma.review.findMany).toBe('function')
  })
})
