import { Router } from 'express'
import { z } from 'zod'
import { db } from '@greenmate/database'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Validation schemas
const createActivitySchema = z.object({
  type: z.enum(['plant_care', 'achievement', 'post', 'follow', 'like', 'comment']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
  metadata: z.any().optional(),
  plantId: z.string().optional(),
  postId: z.string().optional(),
  isPublic: z.boolean().default(true)
})

const createSessionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  type: z.enum(['plant_tour', 'qa_session', 'care_demo', 'community_chat']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  maxParticipants: z.number().int().min(2).max(50).default(10)
})

const activityCommentSchema = z.object({
  content: z.string().min(1).max(500)
})

// Get social activities feed
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const { page = '1', limit = '20', type, userId: filterUserId } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    const where: any = { isPublic: true }
    if (type) where.type = type
    if (filterUserId) where.userId = filterUserId

    const [activities, total] = await Promise.all([
      db.socialActivity.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, avatar: true }
          },
          plant: {
            select: { id: true, name: true }
          },
          post: {
            select: { id: true, title: true }
          },
          likes: {
            include: {
              user: {
                select: { id: true, username: true }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: { id: true, username: true, avatar: true }
              }
            },
            orderBy: { createdAt: 'asc' },
            take: 3 // Latest 3 comments
          },
          _count: {
            select: { likes: true, comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      db.socialActivity.count({ where })
    ])

    res.json({
      success: true,
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// Create new social activity
router.post('/activities', authenticateToken, async (req, res) => {
  try {
    const data = createActivitySchema.parse(req.body)
    const userId = req.user!.id

    // Verify plant exists if plantId provided
    if (data.plantId) {
      const plant = await db.plant.findUnique({ where: { id: data.plantId } })
      if (!plant) {
        return res.status(400).json({ error: 'Plant not found' })
      }
    }

    // Verify post exists if postId provided
    if (data.postId) {
      const post = await db.post.findUnique({ where: { id: data.postId } })
      if (!post) {
        return res.status(400).json({ error: 'Post not found' })
      }
    }

    const activity = await db.socialActivity.create({
      data: {
        ...data,
        userId
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        plant: {
          select: { id: true, name: true }
        },
        post: {
          select: { id: true, title: true }
        }
      }
    })

    res.status(201).json({
      success: true,
      activity
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error creating activity:', error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

// Like/unlike activity
router.post('/activities/:activityId/like', authenticateToken, async (req, res) => {
  try {
    const { activityId } = req.params
    const userId = req.user!.id

    // Verify activity exists
    const activity = await db.socialActivity.findUnique({
      where: { id: activityId }
    })

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    // Check if already liked
    const existingLike = await db.activityLike.findUnique({
      where: {
        activityId_userId: { activityId, userId }
      }
    })

    if (existingLike) {
      // Unlike
      await db.activityLike.delete({
        where: { id: existingLike.id }
      })
      
      res.json({
        success: true,
        action: 'unliked',
        message: 'Activity unliked'
      })
    } else {
      // Like
      const like = await db.activityLike.create({
        data: { activityId, userId },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      })
      
      res.json({
        success: true,
        action: 'liked',
        like
      })
    }
  } catch (error) {
    console.error('Error liking activity:', error)
    res.status(500).json({ error: 'Failed to like activity' })
  }
})

// Comment on activity
router.post('/activities/:activityId/comments', authenticateToken, async (req, res) => {
  try {
    const { activityId } = req.params
    const { content } = activityCommentSchema.parse(req.body)
    const userId = req.user!.id

    // Verify activity exists
    const activity = await db.socialActivity.findUnique({
      where: { id: activityId }
    })

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    const comment = await db.activityComment.create({
      data: {
        content,
        activityId,
        userId
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    res.status(201).json({
      success: true,
      comment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error creating comment:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

// Get activity comments
router.get('/activities/:activityId/comments', authenticateToken, async (req, res) => {
  try {
    const { activityId } = req.params
    const { page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    const [comments, total] = await Promise.all([
      db.activityComment.findMany({
        where: { activityId },
        include: {
          user: {
            select: { id: true, username: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: limitNum,
        skip: offset
      }),
      db.activityComment.count({ where: { activityId } })
    ])

    res.json({
      success: true,
      comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Get live sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { active, type, hostId } = req.query

    const where: any = {}
    if (active === 'true') where.isActive = true
    if (type) where.type = type
    if (hostId) where.hostId = hostId

    const sessions = await db.liveSession.findMany({
      where,
      include: {
        host: {
          select: { id: true, username: true, avatar: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          },
          where: { leftAt: null }
        },
        _count: {
          select: { participants: true, messages: true }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    res.json({
      success: true,
      sessions
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// Create live session
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, startTime, endTime, maxParticipants } = createSessionSchema.parse(req.body)
    const userId = req.user!.id

    const session = await db.liveSession.create({
      data: {
        title,
        description,
        type,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        maxParticipants,
        hostId: userId,
        isActive: false // Will be activated when host starts
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    // Auto-add host as participant
    await db.sessionParticipant.create({
      data: {
        sessionId: session.id,
        userId
      }
    })

    res.status(201).json({
      success: true,
      session
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error creating session:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Join live session
router.post('/sessions/:sessionId/join', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    // Check if session exists
    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: { select: { participants: true } }
      }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Check if session is full
    const currentParticipants = await db.sessionParticipant.count({
      where: { sessionId, leftAt: null }
    })

    if (currentParticipants >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' })
    }

    // Check if already a participant
    const existingParticipant = await db.sessionParticipant.findFirst({
      where: { sessionId, userId, leftAt: null }
    })

    if (existingParticipant) {
      return res.json({
        success: true,
        message: 'Already a participant',
        participant: existingParticipant
      })
    }

    // Join session
    const participant = await db.sessionParticipant.create({
      data: { sessionId, userId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    res.json({
      success: true,
      participant
    })
  } catch (error) {
    console.error('Error joining session:', error)
    res.status(500).json({ error: 'Failed to join session' })
  }
})

// Leave live session
router.post('/sessions/:sessionId/leave', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    const participant = await db.sessionParticipant.findFirst({
      where: { sessionId, userId, leftAt: null }
    })

    if (!participant) {
      return res.status(400).json({ error: 'Not a participant of this session' })
    }

    // Mark as left
    await db.sessionParticipant.update({
      where: { id: participant.id },
      data: { leftAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Left session successfully'
    })
  } catch (error) {
    console.error('Error leaving session:', error)
    res.status(500).json({ error: 'Failed to leave session' })
  }
})

// Start session (host only)
router.post('/sessions/:sessionId/start', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    const session = await db.liveSession.findUnique({
      where: { id: sessionId, hostId: userId }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found or you are not the host' })
    }

    if (session.isActive) {
      return res.status(400).json({ error: 'Session is already active' })
    }

    const updatedSession = await db.liveSession.update({
      where: { id: sessionId },
      data: { 
        isActive: true,
        startTime: new Date() // Update actual start time
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          },
          where: { leftAt: null }
        }
      }
    })

    res.json({
      success: true,
      session: updatedSession
    })
  } catch (error) {
    console.error('Error starting session:', error)
    res.status(500).json({ error: 'Failed to start session' })
  }
})

// End session (host only)
router.post('/sessions/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    const session = await db.liveSession.findUnique({
      where: { id: sessionId, hostId: userId }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found or you are not the host' })
    }

    const updatedSession = await db.liveSession.update({
      where: { id: sessionId },
      data: { 
        isActive: false,
        endTime: new Date()
      }
    })

    // Mark all participants as left
    await db.sessionParticipant.updateMany({
      where: { sessionId, leftAt: null },
      data: { leftAt: new Date() }
    })

    res.json({
      success: true,
      session: updatedSession
    })
  } catch (error) {
    console.error('Error ending session:', error)
    res.status(500).json({ error: 'Failed to end session' })
  }
})

// Get user presence status
router.get('/presence/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params

    const presence = await db.userPresence.findUnique({
      where: { userId }
    })

    if (!presence) {
      return res.json({
        success: true,
        presence: {
          userId,
          status: 'offline',
          lastSeen: null,
          activity: null
        }
      })
    }

    res.json({
      success: true,
      presence
    })
  } catch (error) {
    console.error('Error fetching presence:', error)
    res.status(500).json({ error: 'Failed to fetch presence' })
  }
})

// Update user presence status
router.put('/presence', authenticateToken, async (req, res) => {
  try {
    const { status, activity } = req.body
    const userId = req.user!.id

    const presence = await db.userPresence.upsert({
      where: { userId },
      update: {
        status,
        activity,
        lastSeen: new Date()
      },
      create: {
        userId,
        status,
        activity,
        lastSeen: new Date()
      }
    })

    res.json({
      success: true,
      presence
    })
  } catch (error) {
    console.error('Error updating presence:', error)
    res.status(500).json({ error: 'Failed to update presence' })
  }
})

export default router