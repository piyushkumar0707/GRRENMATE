import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from './config'
import { errorHandler, notFoundHandler } from './middleware/error'
import authRoutes from './routes/auth'
import plantRoutes from './routes/plants'
import recognitionRoutes from './routes/recognition'
import userRoutes from './routes/user'
import diseaseDetectionRoutes from './routes/diseaseDetection'
import weatherCareRoutes from './routes/weatherCare'
import communityRoutes from './routes/community'
import marketplaceRoutes from './routes/marketplace'
import notificationsRoutes from './routes/notifications'
import chatRoutes from './routes/chat'
import socialRoutes from './routes/social'
import { notificationService } from './services/notifications'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// API rate limiting (stricter for API endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Too many API requests from this IP, please try again later.',
  },
})

// Middleware
app.use(limiter)
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  })
})

// API Routes
app.use('/api', apiLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/recognition', recognitionRoutes)
app.use('/api/user', userRoutes)
app.use('/api/disease-detection', diseaseDetectionRoutes)
app.use('/api/weather-care', weatherCareRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/marketplace', marketplaceRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/social', socialRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Create HTTP server and Socket.IO
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Socket.IO Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                 socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                 socket.handshake.query.token as string
    
    if (!token) {
      return next(new Error('Authentication token required'))
    }

    // Verify JWT token using the same secret as your API
    const jwtSecret = config.jwt.secret
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string }
    
    // Store authenticated user data in socket
    const user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.email.split('@')[0] // Extract username from email
    }

    socket.data = { 
      user,
      authenticated: true 
    }
    
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  const user = socket.data.user
  console.log(`User connected: ${user.username} (${user.id})`)
  
  // Join user to personal room for notifications
  socket.join(`user:${user.id}`)
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${user.username} - ${reason}`)
  })
  
  // Handle basic chat events
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', {
      userId: user.id,
      username: user.username,
      timestamp: new Date()
    })
  })
  
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user-left', {
      userId: user.id,
      username: user.username,
      timestamp: new Date()
    })
  })
  
  socket.on('chat-message', (data: { roomId: string; message: string }) => {
    const messageData = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      content: data.message,
      timestamp: new Date(),
      roomId: data.roomId
    }
    
    io.to(data.roomId).emit('chat-message', messageData)
  })
})

server.listen(config.port, () => {
  console.log(`
🌱 GreenMate API Server
🚀 Running on port ${config.port}
📱 Environment: ${config.nodeEnv}
🔗 CORS origin: ${config.cors.origin}
🔌 Socket.IO enabled
⚡ Ready to handle requests!
  `)
  
  // Initialize notification service with scheduled tasks
  notificationService.init()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app