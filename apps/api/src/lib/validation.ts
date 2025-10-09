import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address').toLowerCase()
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

// User registration/profile schemas
export const userRegistrationSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
})

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
})

export const userPreferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    careReminders: z.boolean().default(true),
    communityUpdates: z.boolean().default(true),
  }).optional(),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    plantsVisible: z.boolean().default(true),
    allowMessages: z.boolean().default(true),
  }).optional(),
  language: z.enum(['en', 'es']).default('en'),
})

// Plant-related schemas
export const plantSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  scientificName: z.string().min(1).max(100).trim(),
  family: z.string().max(100).trim().optional(),
  commonNames: z.array(z.string().max(50)).max(10).default([]),
  description: z.string().max(2000).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  purposes: z.array(z.enum(['DECORATIVE', 'AIR_FILTERING', 'EDIBLE', 'MEDICINAL', 'AROMATIC'])).default([]),
  climateZones: z.array(z.string().max(20)).max(20).default([]),
  medicinalUses: z.array(z.string().max(100)).max(10).default([]),
  toxicity: z.string().max(500).optional(),
  commonIssues: z.array(z.string().max(200)).max(20).default([]),
})

export const userPlantSchema = z.object({
  plantId: z.string().cuid(),
  nickname: z.string().min(1).max(50).trim().optional(),
  notes: z.string().max(1000).optional(),
  location: z.string().max(50).optional(),
  acquiredDate: z.coerce.date().default(() => new Date()),
})

export const careLogSchema = z.object({
  userPlantId: z.string().cuid(),
  action: z.string().min(1).max(50).trim(),
  notes: z.string().max(500).optional(),
  images: z.array(z.string().url()).max(5).default([]),
})

export const plantReminderSchema = z.object({
  userPlantId: z.string().cuid(),
  type: z.string().min(1).max(50).trim(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']),
  nextDue: z.coerce.date(),
  isActive: z.boolean().default(true),
})

// Community/Social schemas
export const postSchema = z.object({
  title: z.string().min(5).max(200).trim(),
  content: z.string().min(10).max(5000),
  type: z.enum(['GENERAL', 'HELP_REQUEST', 'SUCCESS_STORY', 'PLANT_SHOWCASE']).default('GENERAL'),
  tags: z.array(z.string().min(1).max(30).trim()).max(10).default([]),
  plantId: z.string().cuid().optional(),
  images: z.array(z.string().url()).max(10).default([]),
})

export const commentSchema = z.object({
  postId: z.string().cuid(),
  content: z.string().min(1).max(1000),
  parentId: z.string().cuid().optional(),
})

// AI/Recognition schemas
export const plantRecognitionSchema = z.object({
  imageUrl: z.string().url(),
  userId: z.string().cuid().optional(),
})

export const diseaseDetectionSchema = z.object({
  imageUrl: z.string().url(),
  plantId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
})

// Marketplace schemas
export const marketplaceListingSchema = z.object({
  title: z.string().min(5).max(100).trim(),
  description: z.string().min(20).max(2000),
  price: z.number().positive().max(10000),
  plantId: z.string().cuid().optional(),
  location: z.string().max(100).optional(),
  images: z.array(z.string().url()).min(1).max(10),
})

// Search/Filter schemas
export const plantSearchSchema = z.object({
  query: z.string().min(1).max(100).trim().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  lightRequirement: z.enum(['LOW', 'MEDIUM', 'HIGH', 'DIRECT']).optional(),
  purposes: z.array(z.enum(['DECORATIVE', 'AIR_FILTERING', 'EDIBLE', 'MEDICINAL', 'AROMATIC'])).optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
  sortBy: z.enum(['name', 'difficulty', 'popularity', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export const communitySearchSchema = z.object({
  query: z.string().min(1).max(100).trim().optional(),
  type: z.enum(['GENERAL', 'HELP_REQUEST', 'SUCCESS_STORY', 'PLANT_SHOWCASE']).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
  sortBy: z.enum(['createdAt', 'likes', 'comments']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ID validation schema
export const idSchema = z.string().cuid('Invalid ID format')

// File upload validation
export const imageUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
})

// Sanitization functions
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^https?:\/\/|^\/|\#/,
  })
}

export function sanitizePlainText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that could be used for SQL injection
  return query.replace(/[<>'"%;()&+]/g, '').trim()
}

// Validation middleware creator
export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body)
      req.body = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            received: issue.received,
          })),
        })
      }
      next(error)
    }
  }
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.query)
      req.query = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Query validation failed',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            received: issue.received,
          })),
        })
      }
      next(error)
    }
  }
}

export function validateParams(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.params)
      req.params = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Parameter validation failed',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            received: issue.received,
          })),
        })
      }
      next(error)
    }
  }
}