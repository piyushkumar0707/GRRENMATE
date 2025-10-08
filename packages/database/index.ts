export { PrismaClient } from '@prisma/client'
export * from '@prisma/client'

// Re-export commonly used types
export type {
  User,
  UserProfile,
  Plant,
  PlantCare,
  UserPlant,
  Post,
  Comment,
  Like,
  PlantRecognition,
  DiseaseDetection,
  UserGamification,
  Achievement,
  UserAchievement,
  MarketplaceListing,
  Notification,
  // Enums
  UserRole,
  ExperienceLevel,
  PlantDifficulty,
  PlantSize,
  LightRequirement,
  WateringFrequency,
  PlantPurpose,
  PostType,
} from '@prisma/client'

// Create singleton instance for database client
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma