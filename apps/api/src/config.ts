import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/greenmate',
  },

  // External APIs
  plantNet: {
    apiKey: process.env.PLANTNET_API_KEY || '',
    baseUrl: 'https://my-api.plantnet.org/v2/identify',
  },

  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },

  openAI: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  // Google Maps
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
} as const

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET']

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.warn(
    `Warning: Missing environment variables: ${missingEnvVars.join(', ')}`
  )
  if (config.nodeEnv === 'production') {
    console.error('Required environment variables missing in production!')
    process.exit(1)
  }
}