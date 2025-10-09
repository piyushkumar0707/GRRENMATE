import { Router } from 'express'
import { z } from 'zod'
import { db } from '@greenmate/database'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Validation schemas
const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['public', 'private', 'plant_community', 'expert_help']).default('public'),
  plantId: z.string().optional(),
  maxParticipants: z.number().int().min(2).max(100).default(50)
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'image', 'plant_share', 'care_log', 'system']).default('text'),
  metadata: z.any().optional(),
  replyToId: z.string().optional()
})

const reactToMessageSchema = z.object({
  emoji: z.string().min(1).max(10)
})

// Get chat rooms with pagination
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const { page = '1', limit = '20', type, plantId } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    const where: any = { isActive: true }
    if (type) where.type = type
    if (plantId) where.plantId = plantId

    const [rooms, total] = await Promise.all([
      db.chatRoom.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, username: true, avatar: true }
          },
          plant: {
            select: { id: true, name: true }
          },
          _count: {
            select: { participants: true, messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      db.chatRoom.count({ where })
    ])

    res.json({
      success: true,
      rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    res.status(500).json({ error: 'Failed to fetch chat rooms' })
  }
})

// Create new chat room
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    const { name, description, type, plantId, maxParticipants } = createRoomSchema.parse(req.body)
    const userId = req.user!.id

    // Verify plant exists if plantId provided
    if (plantId) {
      const plant = await db.plant.findUnique({ where: { id: plantId } })
      if (!plant) {
        return res.status(400).json({ error: 'Plant not found' })
      }
    }

    const room = await db.chatRoom.create({
      data: {
        name,
        description,
        type,
        plantId,
        maxParticipants,
        createdById: userId
      },
      include: {
        createdBy: {
          select: { id: true, username: true, avatar: true }
        },
        plant: {
          select: { id: true, name: true }
        }
      }
    })

    // Auto-join creator as participant
    await db.chatParticipant.create({
      data: {
        roomId: room.id,
        userId,
        role: 'admin'
      }
    })

    res.status(201).json({
      success: true,
      room
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error creating chat room:', error)
    res.status(500).json({ error: 'Failed to create chat room' })
  }
})

// Get specific room details
router.get('/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        createdBy: {
          select: { id: true, username: true, avatar: true }
        },
        plant: {
          select: { id: true, name: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' })
    }

    res.json({
      success: true,
      room
    })
  } catch (error) {
    console.error('Error fetching chat room:', error)
    res.status(500).json({ error: 'Failed to fetch chat room' })
  }
})

// Join chat room
router.post('/rooms/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user!.id

    // Check if room exists and is active
    const room = await db.chatRoom.findUnique({
      where: { id: roomId, isActive: true },
      include: { _count: { select: { participants: true } } }
    })

    if (!room) {
      return res.status(404).json({ error: 'Chat room not found or inactive' })
    }

    // Check if room is full
    if (room.maxParticipants && room._count.participants >= room.maxParticipants) {
      return res.status(400).json({ error: 'Chat room is full' })
    }

    // Check if already a participant
    const existingParticipant = await db.chatParticipant.findUnique({
      where: { 
        roomId_userId: { roomId, userId }
      }
    })

    if (existingParticipant) {
      // Update last seen
      await db.chatParticipant.update({
        where: { id: existingParticipant.id },
        data: { lastSeen: new Date() }
      })
      
      return res.json({
        success: true,
        message: 'Already a participant',
        participant: existingParticipant
      })
    }

    // Join room
    const participant = await db.chatParticipant.create({
      data: {
        roomId,
        userId
      },
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
    console.error('Error joining chat room:', error)
    res.status(500).json({ error: 'Failed to join chat room' })
  }
})

// Leave chat room
router.post('/rooms/:roomId/leave', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user!.id

    const participant = await db.chatParticipant.findUnique({
      where: { 
        roomId_userId: { roomId, userId }
      }
    })

    if (!participant) {
      return res.status(400).json({ error: 'Not a participant of this room' })
    }

    await db.chatParticipant.delete({
      where: { id: participant.id }
    })

    res.json({
      success: true,
      message: 'Left chat room successfully'
    })
  } catch (error) {
    console.error('Error leaving chat room:', error)
    res.status(500).json({ error: 'Failed to leave chat room' })
  }
})

// Get chat messages with pagination
router.get('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { page = '1', limit = '50', before } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    // Verify user is participant
    const participant = await db.chatParticipant.findUnique({
      where: { 
        roomId_userId: { roomId, userId: req.user!.id }
      }
    })

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant of this room' })
    }

    const where: any = { roomId }
    if (before) {
      where.createdAt = { lt: new Date(before as string) }
    }

    const messages = await db.chatMessage.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        reactions: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            user: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum
    })

    res.json({
      success: true,
      messages: messages.reverse() // Return in chronological order
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// Send message (for REST API, real-time via Socket.IO)
router.post('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { content, type, metadata, replyToId } = sendMessageSchema.parse(req.body)
    const userId = req.user!.id

    // Verify user is participant
    const participant = await db.chatParticipant.findUnique({
      where: { 
        roomId_userId: { roomId, userId }
      }
    })

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant of this room' })
    }

    // Verify reply-to message exists
    if (replyToId) {
      const replyMessage = await db.chatMessage.findUnique({
        where: { id: replyToId, roomId }
      })
      if (!replyMessage) {
        return res.status(400).json({ error: 'Reply-to message not found' })
      }
    }

    const message = await db.chatMessage.create({
      data: {
        content,
        type,
        metadata,
        roomId,
        userId,
        replyToId
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    })

    // Update participant's last seen
    await db.chatParticipant.update({
      where: { id: participant.id },
      data: { lastSeen: new Date() }
    })

    res.status(201).json({
      success: true,
      message
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// React to message
router.post('/messages/:messageId/react', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params
    const { emoji } = reactToMessageSchema.parse(req.body)
    const userId = req.user!.id

    // Verify message exists and user has access
    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
      include: { room: true }
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    // Verify user is participant
    const participant = await db.chatParticipant.findUnique({
      where: { 
        roomId_userId: { roomId: message.roomId, userId }
      }
    })

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant of this room' })
    }

    // Check if reaction already exists
    const existingReaction = await db.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji }
      }
    })

    if (existingReaction) {
      // Remove reaction
      await db.messageReaction.delete({
        where: { id: existingReaction.id }
      })
      
      res.json({
        success: true,
        action: 'removed',
        message: 'Reaction removed'
      })
    } else {
      // Add reaction
      const reaction = await db.messageReaction.create({
        data: { messageId, userId, emoji },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      })
      
      res.json({
        success: true,
        action: 'added',
        reaction
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Error reacting to message:', error)
    res.status(500).json({ error: 'Failed to react to message' })
  }
})

export default router