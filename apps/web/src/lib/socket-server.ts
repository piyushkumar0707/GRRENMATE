// Socket.IO Server Setup for Real-time Communication
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

// JWT authentication interfaces (matching your API auth system)
interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface SocketUser {
  id: string
  username: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentRoom?: string
}

export interface ChatMessage {
  id: string
  content: string
  userId: string
  username: string
  avatar?: string
  timestamp: Date
  roomId: string
  type: 'text' | 'image' | 'plant_share' | 'care_log' | 'system'
  metadata?: any
  reactions?: { emoji: string; users: string[] }[]
  edited?: boolean
  editedAt?: Date
}

export interface PlantShareActivity {
  id: string
  type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'observation' | 'photo'
  plantId: string
  plantName: string
  userId: string
  username: string
  description: string
  imageUrl?: string
  timestamp: Date
  collaborators?: string[]
}

export interface LiveSession {
  id: string
  hostId: string
  hostName: string
  title: string
  description: string
  type: 'plant_tour' | 'qa_session' | 'care_demo' | 'community_chat'
  participants: string[]
  startTime: Date
  endTime?: Date
  isActive: boolean
  maxParticipants: number
}

class SocketManager {
  private io: SocketIOServer | null = null
  private connectedUsers = new Map<string, SocketUser>()
  private userSockets = new Map<string, string>() // userId -> socketId
  private roomParticipants = new Map<string, Set<string>>() // roomId -> userIds

  initialize(httpServer: HTTPServer) {
    if (this.io) {
      return this.io
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    // JWT Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || 
                     socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                     socket.handshake.query.token as string
        
        if (!token) {
          return next(new Error('Authentication token required'))
        }

        // Verify JWT token using the same secret as your API
        const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload
        
        // TODO: In production, fetch user from your database
        // import { db } from '@greenmate/database'
        // const user = await db.user.findUnique({
        //   where: { id: decoded.userId },
        //   select: {
        //     id: true,
        //     email: true,
        //     username: true,
        //     role: true,
        //     avatar: true,
        //     lastActiveAt: true
        //   }
        // })
        
        // Store authenticated user data in socket
        const user = {
          id: decoded.userId,
          email: decoded.email,
          username: decoded.email.split('@')[0], // Extract username from email
          avatar: undefined
        }

        // Store user info in socket data for use in event handlers
        socket.data = { 
          user,
          authenticated: true 
        }
        
        // TODO: Update user's lastActiveAt in database
        // await db.user.update({
        //   where: { id: user.id },
        //   data: { lastActiveAt: new Date() }
        // })

        console.log(`Socket authenticated for user: ${user.username} (${user.id})`)
        next()
      } catch (err) {
        console.error('Socket authentication error:', err)
        if (err instanceof jwt.JsonWebTokenError) {
          next(new Error('Invalid authentication token'))
        } else if (err instanceof jwt.TokenExpiredError) {
          next(new Error('Authentication token expired'))
        } else {
          next(new Error('Authentication failed'))
        }
      }
    })

    this.setupEventHandlers()
    return this.io
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`)

      // Auto-register authenticated user (no manual registration needed)
      if (socket.data?.authenticated && socket.data?.user) {
        const userData = socket.data.user
        
        const user: SocketUser = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          status: 'online',
          lastSeen: new Date()
        }

        // Store user connection
        this.connectedUsers.set(userData.id, user)
        this.userSockets.set(userData.id, socket.id)

        // Join user to their personal room
        socket.join(`user:${userData.id}`)

        // Notify others about user coming online
        socket.broadcast.emit('user:status', {
          userId: userData.id,
          status: 'online',
          lastSeen: new Date()
        })

        socket.emit('user:registered', { success: true, user })

        console.log(`User auto-registered: ${userData.username} (${userData.id})`)
      }

      // Handle manual user registration (fallback for backward compatibility)
      socket.on('user:register', async (userData: Partial<SocketUser>) => {
        try {
          // If already authenticated via JWT, use that data
          if (socket.data?.authenticated && socket.data?.user) {
            socket.emit('user:registered', { 
              success: true, 
              user: this.connectedUsers.get(socket.data.user.id) 
            })
            return
          }

          if (!userData.id || !userData.username) {
            socket.emit('error', { message: 'Invalid user data' })
            return
          }

          const user: SocketUser = {
            id: userData.id,
            username: userData.username,
            email: userData.email || '',
            avatar: userData.avatar,
            status: 'online',
            lastSeen: new Date()
          }

          // Store user connection
          this.connectedUsers.set(userData.id, user)
          this.userSockets.set(userData.id, socket.id)

          // Join user to their personal room
          socket.join(`user:${userData.id}`)

          // Notify others about user coming online
          socket.broadcast.emit('user:status', {
            userId: userData.id,
            status: 'online',
            lastSeen: new Date()
          })

          socket.emit('user:registered', { success: true, user })

          console.log(`User registered: ${userData.username} (${userData.id})`)
        } catch (error) {
          console.error('Error registering user:', error)
          socket.emit('error', { message: 'Failed to register user' })
        }
      })

      // Handle chat room joining
      socket.on('room:join', (data: { roomId: string; userId: string }) => {
        try {
          const { roomId, userId } = data
          
          socket.join(roomId)
          
          // Track room participants
          if (!this.roomParticipants.has(roomId)) {
            this.roomParticipants.set(roomId, new Set())
          }
          this.roomParticipants.get(roomId)?.add(userId)

          // Update user's current room
          const user = this.connectedUsers.get(userId)
          if (user) {
            user.currentRoom = roomId
            this.connectedUsers.set(userId, user)
          }

          // Notify room about new participant
          socket.to(roomId).emit('room:user_joined', {
            userId,
            username: user?.username,
            avatar: user?.avatar,
            timestamp: new Date()
          })

          // Send current room participants to the new user
          const participants = Array.from(this.roomParticipants.get(roomId) || [])
            .map(id => this.connectedUsers.get(id))
            .filter(Boolean)

          socket.emit('room:participants', { roomId, participants })

          console.log(`User ${userId} joined room: ${roomId}`)
        } catch (error) {
          console.error('Error joining room:', error)
          socket.emit('error', { message: 'Failed to join room' })
        }
      })

      // Handle leaving rooms
      socket.on('room:leave', (data: { roomId: string; userId: string }) => {
        this.handleRoomLeave(socket, data.roomId, data.userId)
      })

      // Handle chat messages
      socket.on('chat:message', async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        try {
          const chatMessage: ChatMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            reactions: []
          }

          // Save message to database (implement your database logic here)
          // await saveMessageToDatabase(chatMessage)

          // Broadcast to room participants
          this.io?.to(message.roomId).emit('chat:message', chatMessage)

          console.log(`Message sent in room ${message.roomId}: ${message.content}`)
        } catch (error) {
          console.error('Error handling chat message:', error)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle typing indicators
      socket.on('chat:typing', (data: { roomId: string; userId: string; username: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('chat:typing', data)
      })

      // Handle message reactions
      socket.on('chat:reaction', (data: { messageId: string; emoji: string; userId: string; roomId: string }) => {
        // Update message reactions (implement database logic)
        this.io?.to(data.roomId).emit('chat:reaction', data)
      })

      // Handle plant care activities
      socket.on('plant:activity', (activity: PlantShareActivity) => {
        try {
          // Broadcast to relevant users (collaborators, followers, etc.)
          if (activity.collaborators) {
            activity.collaborators.forEach(userId => {
              this.io?.to(`user:${userId}`).emit('plant:activity', activity)
            })
          }

          // Broadcast to plant community rooms
          this.io?.to(`plant:${activity.plantId}`).emit('plant:activity', activity)

          console.log(`Plant activity shared: ${activity.type} for ${activity.plantName}`)
        } catch (error) {
          console.error('Error handling plant activity:', error)
        }
      })

      // Handle user status updates
      socket.on('user:status', (data: { userId: string; status: SocketUser['status'] }) => {
        try {
          const user = this.connectedUsers.get(data.userId)
          if (user) {
            user.status = data.status
            user.lastSeen = new Date()
            this.connectedUsers.set(data.userId, user)

            // Broadcast status change
            socket.broadcast.emit('user:status', {
              userId: data.userId,
              status: data.status,
              lastSeen: user.lastSeen
            })
          }
        } catch (error) {
          console.error('Error updating user status:', error)
        }
      })

      // Handle live sessions
      socket.on('session:create', (session: Omit<LiveSession, 'id' | 'participants' | 'startTime' | 'isActive'>) => {
        try {
          const liveSession: LiveSession = {
            ...session,
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            participants: [session.hostId],
            startTime: new Date(),
            isActive: true
          }

          // Create session room
          socket.join(`session:${liveSession.id}`)

          // Broadcast session creation
          socket.broadcast.emit('session:created', liveSession)

          socket.emit('session:created', liveSession)

          console.log(`Live session created: ${liveSession.title}`)
        } catch (error) {
          console.error('Error creating live session:', error)
        }
      })

      // Handle joining live sessions
      socket.on('session:join', (data: { sessionId: string; userId: string }) => {
        try {
          socket.join(`session:${data.sessionId}`)
          
          // Notify session participants
          socket.to(`session:${data.sessionId}`).emit('session:user_joined', {
            userId: data.userId,
            username: this.connectedUsers.get(data.userId)?.username,
            timestamp: new Date()
          })

          console.log(`User ${data.userId} joined session: ${data.sessionId}`)
        } catch (error) {
          console.error('Error joining session:', error)
        }
      })

      // Handle real-time notifications
      socket.on('notification:send', (data: { 
        targetUserIds: string[]
        type: string
        title: string
        message: string
        metadata?: any 
      }) => {
        try {
          data.targetUserIds.forEach(userId => {
            this.io?.to(`user:${userId}`).emit('notification:received', {
              type: data.type,
              title: data.title,
              message: data.message,
              metadata: data.metadata,
              timestamp: new Date()
            })
          })

          console.log(`Notification sent to ${data.targetUserIds.length} users`)
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        try {
          // Find user by socket ID
          let disconnectedUserId: string | null = null
          for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === socket.id) {
              disconnectedUserId = userId
              break
            }
          }

          if (disconnectedUserId) {
            const user = this.connectedUsers.get(disconnectedUserId)
            
            if (user) {
              // Update user status
              user.status = 'offline'
              user.lastSeen = new Date()
              this.connectedUsers.set(disconnectedUserId, user)

              // Remove from current room
              if (user.currentRoom) {
                this.handleRoomLeave(socket, user.currentRoom, disconnectedUserId)
              }

              // Notify others about user going offline
              socket.broadcast.emit('user:status', {
                userId: disconnectedUserId,
                status: 'offline',
                lastSeen: user.lastSeen
              })
            }

            // Clean up connections
            this.userSockets.delete(disconnectedUserId)
            
            console.log(`User disconnected: ${disconnectedUserId}`)
          }

          console.log(`Socket disconnected: ${socket.id}`)
        } catch (error) {
          console.error('Error handling disconnect:', error)
        }
      })
    })

    console.log('Socket.IO server initialized with event handlers')
  }

  private handleRoomLeave(socket: any, roomId: string, userId: string) {
    try {
      socket.leave(roomId)
      
      // Remove from room participants
      this.roomParticipants.get(roomId)?.delete(userId)
      
      // Update user's current room
      const user = this.connectedUsers.get(userId)
      if (user) {
        user.currentRoom = undefined
        this.connectedUsers.set(userId, user)
      }

      // Notify room about user leaving
      socket.to(roomId).emit('room:user_left', {
        userId,
        username: user?.username,
        timestamp: new Date()
      })

      console.log(`User ${userId} left room: ${roomId}`)
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }

  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values())
  }

  getRoomParticipants(roomId: string): SocketUser[] {
    const participantIds = this.roomParticipants.get(roomId) || new Set()
    return Array.from(participantIds)
      .map(id => this.connectedUsers.get(id))
      .filter(Boolean) as SocketUser[]
  }

  broadcastToRoom(roomId: string, event: string, data: any) {
    this.io?.to(roomId).emit(event, data)
  }

  sendToUser(userId: string, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data)
  }

  getIO(): SocketIOServer | null {
    return this.io
  }
}

// Singleton instance
export const socketManager = new SocketManager()

// Helper function to initialize Socket.IO with HTTP server
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  return socketManager.initialize(httpServer)
}