import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
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

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

const server = app.listen(config.port, () => {
  console.log(`
🌱 GreenMate API Server
🚀 Running on port ${config.port}
📱 Environment: ${config.nodeEnv}
🔗 CORS origin: ${config.cors.origin}
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