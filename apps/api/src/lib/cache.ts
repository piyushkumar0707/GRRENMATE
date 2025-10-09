import Redis from 'ioredis'

let redis: Redis | null = null

// Initialize Redis connection
function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }
  return redis
}

export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient()
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  },

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl = 3600): Promise<void> {
    try {
      const client = getRedisClient()
      await client.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient()
      await client.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const client = getRedisClient()
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error)
    }
  },

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient()
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  },

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const client = getRedisClient()
      const values = await client.mget(...keys)
      return values.map(value => value ? JSON.parse(value) : null)
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  },

  /**
   * Set multiple key-value pairs
   */
  async mset(pairs: Array<[string, any, number?]>): Promise<void> {
    try {
      const client = getRedisClient()
      const pipeline = client.pipeline()
      
      for (const [key, value, ttl] of pairs) {
        if (ttl) {
          pipeline.setex(key, ttl, JSON.stringify(value))
        } else {
          pipeline.set(key, JSON.stringify(value))
        }
      }
      
      await pipeline.exec()
    } catch (error) {
      console.error('Cache mset error:', error)
    }
  }
}

// Cache keys generator
export const cacheKeys = {
  plant: (id: string) => `plant:${id}`,
  user: (id: string) => `user:${id}`,
  userPlants: (userId: string) => `user:${userId}:plants`,
  plantCare: (plantId: string) => `plant:${plantId}:care`,
  plantRecognition: (imageHash: string) => `recognition:${imageHash}`,
  posts: (type?: string, page = 1) => `posts:${type || 'all'}:page:${page}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  notifications: (userId: string) => `user:${userId}:notifications`,
  achievements: (userId: string) => `user:${userId}:achievements`,
}

// Cached plant data function
export async function getCachedPlant(id: string) {
  const cacheKey = cacheKeys.plant(id)
  let plant = await cache.get(cacheKey)
  
  if (!plant) {
    // Import here to avoid circular dependencies
    const { db } = await import('@greenmate/database')
    plant = await db.plant.findUnique({
      where: { id },
      include: {
        care: true,
      }
    })
    
    if (plant) {
      await cache.set(cacheKey, plant, 3600) // Cache for 1 hour
    }
  }
  
  return plant
}

// Cached user data function
export async function getCachedUser(id: string) {
  const cacheKey = cacheKeys.user(id)
  let user = await cache.get(cacheKey)
  
  if (!user) {
    const { db } = await import('@greenmate/database')
    user = await db.user.findUnique({
      where: { id },
      include: {
        profile: true,
        gamification: true,
      }
    })
    
    if (user) {
      await cache.set(cacheKey, user, 1800) // Cache for 30 minutes
    }
  }
  
  return user
}

// Cache invalidation helpers
export const cacheInvalidation = {
  /**
   * Invalidate all cache related to a user
   */
  async invalidateUser(userId: string) {
    await Promise.all([
      cache.del(cacheKeys.user(userId)),
      cache.del(cacheKeys.userProfile(userId)),
      cache.del(cacheKeys.userPlants(userId)),
      cache.del(cacheKeys.notifications(userId)),
      cache.del(cacheKeys.achievements(userId)),
    ])
  },

  /**
   * Invalidate all cache related to a plant
   */
  async invalidatePlant(plantId: string) {
    await Promise.all([
      cache.del(cacheKeys.plant(plantId)),
      cache.del(cacheKeys.plantCare(plantId)),
      cache.delPattern(`user:*:plants`), // Invalidate user plants lists
    ])
  },

  /**
   * Invalidate posts cache
   */
  async invalidatePosts() {
    await cache.delPattern('posts:*')
  },
}