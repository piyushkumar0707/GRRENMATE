import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db, UserRole } from '@greenmate/database/mock'
import { config } from '../config'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  ),
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  ),
})

// Helper functions
const generateTokens = (user: { id: string; email: string }) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt.refreshSecret,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  await db.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, name, bio, location } = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
        code: existingUser.email === email ? 'EMAIL_EXISTS' : 'USERNAME_EXISTS'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with transaction
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name,
          bio,
          location,
          preferences: {
            create: {},
          },
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          bio: true,
          location: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      })

      // Create care streak record
      await prisma.careStreak.create({
        data: {
          userId: user.id,
        },
      })

      return user
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(result)
    await saveRefreshToken(result.id, refreshToken)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      })
    }
    
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        name: true,
        bio: true,
        location: true,
        role: true,
        avatar: true,
        isExpert: true,
        expertiseAreas: true,
        lastActiveAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS' 
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS' 
      })
    }

    // Update last active
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user)
    await saveRefreshToken(user.id, refreshToken)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      })
    }
    
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string }
    
    // Check if refresh token exists in database
    const tokenRecord = await db.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
          },
        },
      },
    })

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenRecord.user)
    
    // Remove old refresh token and save new one
    await db.$transaction([
      db.refreshToken.delete({
        where: { id: tokenRecord.id },
      }),
      db.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ])

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body
    const userId = req.user!.id

    if (refreshToken) {
      // Remove specific refresh token
      await db.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId,
        },
      })
    } else {
      // Remove all refresh tokens for user (logout from all devices)
      await db.refreshToken.deleteMany({
        where: { userId },
      })
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        location: true,
        role: true,
        avatar: true,
        isExpert: true,
        expertiseAreas: true,
        lastActiveAt: true,
        createdAt: true,
        preferences: true,
        careStreaks: {
          select: {
            currentStreak: true,
            longestStreak: true,
            lastCareDate: true,
          },
        },
        achievements: {
          include: {
            achievement: {
              select: {
                id: true,
                title: true,
                description: true,
                icon: true,
                category: true,
                points: true,
              },
            },
          },
          orderBy: {
            unlockedAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            plants: true,
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ 
      success: true,
      user 
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user data' })
  }
})

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id
    const { name, bio, location, avatar } = updateProfileSchema.parse(req.body)

    const user = await db.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        location,
        avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        location: true,
        role: true,
        avatar: true,
        isExpert: true,
        expertiseAreas: true,
        createdAt: true,
      },
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      })
    }
    
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

    // Get current user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD' 
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password and invalidate all refresh tokens
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      }),
      db.refreshToken.deleteMany({
        where: { userId },
      }),
    ])

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      })
    }
    
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

export default router