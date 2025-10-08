// Temporary mock database for testing auth integration
// This will be replaced with actual Prisma client once database is properly set up

interface MockUser {
  id: string
  email: string
  username: string
  password: string
  name: string
  bio?: string
  location?: string
  role: string
  avatar?: string
  isExpert?: boolean
  expertiseAreas?: string[]
  lastActiveAt?: Date
  createdAt: Date
}

interface MockRefreshToken {
  id: string
  token: string
  userId: string
  expiresAt: Date
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map()
  private refreshTokens: Map<string, MockRefreshToken> = new Map()
  
  user = {
    findFirst: async (options: any) => {
      console.log('Mock DB: user.findFirst called')
      return null
    },
    findUnique: async (options: any) => {
      console.log('Mock DB: user.findUnique called')
      return null
    },
    create: async (options: any) => {
      console.log('Mock DB: user.create called')
      const user = {
        id: Date.now().toString(),
        email: options.data.email,
        username: options.data.username,
        password: options.data.password,
        name: options.data.name,
        bio: options.data.bio,
        location: options.data.location,
        role: 'USER',
        createdAt: new Date(),
        ...options.data,
      }
      this.users.set(user.id, user)
      return user
    },
    update: async (options: any) => {
      console.log('Mock DB: user.update called')
      return null
    }
  }
  
  refreshToken = {
    create: async (options: any) => {
      console.log('Mock DB: refreshToken.create called')
      const token = {
        id: Date.now().toString(),
        ...options.data
      }
      this.refreshTokens.set(token.id, token)
      return token
    },
    findFirst: async (options: any) => {
      console.log('Mock DB: refreshToken.findFirst called')
      return null
    },
    delete: async (options: any) => {
      console.log('Mock DB: refreshToken.delete called')
      return null
    },
    deleteMany: async (options: any) => {
      console.log('Mock DB: refreshToken.deleteMany called')
      return { count: 0 }
    }
  }
  
  careStreak = {
    create: async (options: any) => {
      console.log('Mock DB: careStreak.create called')
      return { id: Date.now().toString(), ...options.data }
    }
  }
  
  $transaction = async (callback: any) => {
    console.log('Mock DB: $transaction called')
    // Mock transaction - just execute the callback with this mock db
    return callback(this)
  }
}

export const db = new MockDatabase()

// Export mock types
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  EXPERT: 'EXPERT'
} as const

export type PrismaClient = MockDatabase