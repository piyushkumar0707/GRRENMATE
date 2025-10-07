import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/database.js'

// Import routes
import authRoutes from './src/routes/auth.js'
import plantRoutes from './src/routes/plants.js'
import recognitionRoutes from './src/routes/recognition.js'
import userRoutes from './src/routes/users.js'

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js'
import { notFound } from './src/middleware/notFound.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openweathermap.org", "https://my-api.plantnet.org"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GreenMate API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/recognition', recognitionRoutes)
app.use('/api/users', userRoutes)

// Welcome message for root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌱 Welcome to GreenMate API!',
    version: '1.0.0',
    docs: '/api/health',
    endpoints: {
      auth: '/api/auth',
      plants: '/api/plants',
      recognition: '/api/recognition',
      users: '/api/users'
    }
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`
🌱 GreenMate Server Started Successfully!
   
📍 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/api/health
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Docs: http://localhost:${PORT}/api

${process.env.NODE_ENV === 'development' ? '🔥 Hot reload enabled with nodemon' : '🚀 Production mode'}
  `)
})