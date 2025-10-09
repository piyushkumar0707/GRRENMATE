// Jest environment variables setup
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Database
process.env.DATABASE_URL = 'file:./test.db'

// Redis (mock)
process.env.REDIS_URL = 'redis://localhost:6379'

// AI/ML services (mock)
process.env.OPENAI_API_KEY = 'test-key'
process.env.GOOGLE_VISION_API_KEY = 'test-key'

// File upload (mock)
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = 'test-key'
process.env.CLOUDINARY_API_SECRET = 'test-secret'

// Email (mock)
process.env.EMAIL_SERVER_HOST = 'localhost'
process.env.EMAIL_SERVER_PORT = '587'
process.env.EMAIL_SERVER_USER = 'test@example.com'
process.env.EMAIL_SERVER_PASSWORD = 'test-password'
process.env.EMAIL_FROM = 'noreply@greenmate.app'

// Analytics (mock)
process.env.GOOGLE_ANALYTICS_ID = 'GA-TEST-ID'
process.env.MIXPANEL_TOKEN = 'test-token'

// Feature flags
process.env.ENABLE_AI_FEATURES = 'true'
process.env.ENABLE_COMMUNITY_FEATURES = 'true'
process.env.ENABLE_PREMIUM_FEATURES = 'false'