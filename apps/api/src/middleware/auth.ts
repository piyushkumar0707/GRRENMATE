import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { db } from '@greenmate/database'

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        username: string
        role: string
      }
    }
  }
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Middleware to authenticate JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return res.status(401).json({
        error: 'Access token is required',
        code: 'NO_TOKEN'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Update last active timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid access token',
        code: 'INVALID_TOKEN'
      })
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      })
    }

    console.error('Authentication error:', error)
    return res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    })
  }
}

// Middleware to check if user is an admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    })
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    })
  }

  next()
}

// Middleware to check if user is an expert
export const requireExpert = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { isExpert: true }
    })

    if (!user?.isExpert) {
      return res.status(403).json({
        error: 'Expert access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  } catch (error) {
    console.error('Expert check error:', error)
    return res.status(500).json({
      error: 'Failed to verify expert status',
      code: 'EXPERT_CHECK_ERROR'
    })
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return next()
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    })

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    }

    next()
  } catch (error) {
    // Silently continue without authentication
    next()
  }
}