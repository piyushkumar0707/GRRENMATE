import { PrismaClient } from '@prisma/client'

// Create singleton instance for database client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Also export as prisma for backwards compatibility
export const prisma = db

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Export all Prisma types
export * from '@prisma/client'
