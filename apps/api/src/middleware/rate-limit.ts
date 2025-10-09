import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'
import { Request, Response } from 'express'

// Create Redis client for rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

// Generic rate limiter creator
export const createRateLimit = (windowMs: number, max: number, skipSuccessfulRequests = false) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs,
    max,
    skipSuccessfulRequests,
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
      limit: max,
      windowMs,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit for this endpoint.',
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max,
        windowMs,
      })
    },
    keyGenerator: (req: Request) => {
      // Use IP address and user ID (if authenticated) for more granular rate limiting
      const ip = req.ip || req.connection.remoteAddress || 'unknown'
      const userId = (req as any).user?.id
      return userId ? `${ip}:${userId}` : ip
    },
  })
}

// Different limits for different endpoint types
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per 15 minutes
  false
)

export const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per 15 minutes
  true // Skip successful requests
)

export const aiLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 AI requests per minute
  false
)

export const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  20, // 20 uploads per hour
  false
)

export const strictAuthLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 failed login attempts per hour
  true // Only count failed requests
)

// Advanced rate limiter with different limits for authenticated vs unauthenticated users
export const createTieredRateLimit = (
  unauthenticatedLimit: { windowMs: number; max: number },
  authenticatedLimit: { windowMs: number; max: number }
) => {
  return (req: Request, res: Response, next: Function) => {
    const isAuthenticated = !!(req as any).user
    
    if (isAuthenticated) {
      const authenticatedLimiter = createRateLimit(
        authenticatedLimit.windowMs,
        authenticatedLimit.max,
        true
      )
      authenticatedLimiter(req, res, next)
    } else {
      const unauthenticatedLimiter = createRateLimit(
        unauthenticatedLimit.windowMs,
        unauthenticatedLimit.max,
        true
      )
      unauthenticatedLimiter(req, res, next)
    }
  }
}

// Plant identification specific limiter
export const plantIdLimiter = createTieredRateLimit(
  { windowMs: 60 * 60 * 1000, max: 5 }, // 5 per hour for unauthenticated
  { windowMs: 60 * 60 * 1000, max: 50 } // 50 per hour for authenticated
)

// Community features limiter
export const communityLimiter = createTieredRateLimit(
  { windowMs: 15 * 60 * 1000, max: 10 }, // 10 per 15 minutes for unauthenticated
  { windowMs: 15 * 60 * 1000, max: 50 } // 50 per 15 minutes for authenticated
)

// Search limiter
export const searchLimiter = createRateLimit(
  60 * 1000, // 1 minute
  30, // 30 searches per minute
  true
)

// Password reset limiter
export const passwordResetLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 password reset attempts per hour
  false
)

// Export Redis client for cleanup
export { redis as rateLimitRedis }