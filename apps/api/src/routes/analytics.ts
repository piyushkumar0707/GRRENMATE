import express from 'express'
import { validateBody } from '../lib/validation'
import { z } from 'zod'
import { cache, cacheKeys } from '../lib/cache'

const router = express.Router()

// Analytics event validation schema
const analyticsEventSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.number(),
  url: z.string().optional(),
  referrer: z.string().optional()
})

// In-memory storage for analytics (in production, use a proper analytics service)
interface AnalyticsEvent {
  id: string
  event: string
  properties?: Record<string, any>
  userId?: string
  sessionId: string
  timestamp: number
  url?: string
  referrer?: string
  ipAddress?: string
  userAgent?: string
}

class AnalyticsStore {
  private events: AnalyticsEvent[] = []
  private readonly maxEvents = 10000 // Keep only last 10k events in memory

  async addEvent(event: AnalyticsEvent): Promise<void> {
    this.events.unshift(event)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // Store in Redis for persistence (optional)
    try {
      const eventKey = `analytics:events:${event.timestamp}`
      await cache.set(eventKey, event, 7 * 24 * 3600) // Keep for 7 days
      
      // Also add to daily aggregation
      const dayKey = new Date(event.timestamp).toISOString().split('T')[0]
      const dailyKey = `analytics:daily:${dayKey}:${event.event}`
      
      // Increment daily counter
      const currentCount = await cache.get<number>(dailyKey) || 0
      await cache.set(dailyKey, currentCount + 1, 30 * 24 * 3600) // Keep for 30 days
    } catch (error) {
      console.error('Failed to cache analytics event:', error)
    }
  }

  async getEvents(filters: {
    userId?: string
    event?: string
    sessionId?: string
    startTime?: number
    endTime?: number
    limit?: number
  } = {}): Promise<AnalyticsEvent[]> {
    let filteredEvents = this.events

    if (filters.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === filters.userId)
    }
    
    if (filters.event) {
      filteredEvents = filteredEvents.filter(e => e.event === filters.event)
    }
    
    if (filters.sessionId) {
      filteredEvents = filteredEvents.filter(e => e.sessionId === filters.sessionId)
    }
    
    if (filters.startTime) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startTime!)
    }
    
    if (filters.endTime) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endTime!)
    }

    const limit = filters.limit || 100
    return filteredEvents.slice(0, limit)
  }

  async getEventCounts(filters: {
    userId?: string
    event?: string
    startTime?: number
    endTime?: number
  } = {}): Promise<Record<string, number>> {
    const events = await this.getEvents(filters)
    const counts: Record<string, number> = {}
    
    events.forEach(event => {
      counts[event.event] = (counts[event.event] || 0) + 1
    })
    
    return counts
  }

  async getDailyStats(days: number = 30): Promise<Record<string, Record<string, number>>> {
    const stats: Record<string, Record<string, number>> = {}
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      
      // Get all daily counters for this day from cache
      try {
        // This is a simplified approach - in production you'd use Redis SCAN
        const dailyStats: Record<string, number> = {}
        
        // Get events for this day from memory
        const dayStart = new Date(dayKey + 'T00:00:00.000Z').getTime()
        const dayEnd = dayStart + 24 * 60 * 60 * 1000
        
        const dayEvents = this.events.filter(e => 
          e.timestamp >= dayStart && e.timestamp < dayEnd
        )
        
        dayEvents.forEach(event => {
          dailyStats[event.event] = (dailyStats[event.event] || 0) + 1
        })
        
        stats[dayKey] = dailyStats
      } catch (error) {
        console.error(`Failed to get stats for ${dayKey}:`, error)
        stats[dayKey] = {}
      }
    }
    
    return stats
  }
}

const analyticsStore = new AnalyticsStore()

// Track analytics event
router.post('/track', validateBody(analyticsEventSchema), async (req, res) => {
  try {
    const eventData = req.body
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...eventData,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }

    await analyticsStore.addEvent(event)

    res.status(200).json({
      success: true,
      eventId: event.id,
      timestamp: event.timestamp
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    res.status(500).json({
      error: 'Failed to track event',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get analytics events (admin endpoint)
router.get('/events', async (req, res) => {
  try {
    const {
      userId,
      event,
      sessionId,
      startTime,
      endTime,
      limit
    } = req.query

    const filters: any = {}
    
    if (userId) filters.userId = userId as string
    if (event) filters.event = event as string
    if (sessionId) filters.sessionId = sessionId as string
    if (startTime) filters.startTime = parseInt(startTime as string)
    if (endTime) filters.endTime = parseInt(endTime as string)
    if (limit) filters.limit = parseInt(limit as string)

    const events = await analyticsStore.getEvents(filters)
    
    res.json({
      events,
      count: events.length,
      filters
    })
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    res.status(500).json({
      error: 'Failed to retrieve events',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get analytics summary
router.get('/summary', async (req, res) => {
  try {
    const { userId, days = '7' } = req.query
    const dayCount = parseInt(days as string)
    
    const now = Date.now()
    const startTime = now - (dayCount * 24 * 60 * 60 * 1000)
    
    const filters: any = { startTime }
    if (userId) filters.userId = userId as string

    // Get event counts
    const eventCounts = await analyticsStore.getEventCounts(filters)
    
    // Get daily stats
    const dailyStats = await analyticsStore.getDailyStats(dayCount)
    
    // Calculate totals
    const totalEvents = Object.values(eventCounts).reduce((sum, count) => sum + count, 0)
    
    // Get unique users and sessions
    const events = await analyticsStore.getEvents(filters)
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size
    
    res.json({
      summary: {
        totalEvents,
        uniqueUsers,
        uniqueSessions,
        dateRange: {
          startTime,
          endTime: now,
          days: dayCount
        }
      },
      eventCounts,
      dailyStats
    })
  } catch (error) {
    console.error('Analytics summary error:', error)
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get user journey/funnel analysis
router.get('/funnel/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { days = '30' } = req.query
    
    const now = Date.now()
    const startTime = now - (parseInt(days as string) * 24 * 60 * 60 * 1000)
    
    const events = await analyticsStore.getEvents({
      userId,
      startTime
    })
    
    // Group events by session
    const sessionMap: Record<string, AnalyticsEvent[]> = {}
    events.forEach(event => {
      if (!sessionMap[event.sessionId]) {
        sessionMap[event.sessionId] = []
      }
      sessionMap[event.sessionId].push(event)
    })
    
    // Sort events within each session by timestamp
    Object.keys(sessionMap).forEach(sessionId => {
      sessionMap[sessionId].sort((a, b) => a.timestamp - b.timestamp)
    })
    
    // Analyze common flows
    const flows: Record<string, number> = {}
    Object.values(sessionMap).forEach(sessionEvents => {
      for (let i = 0; i < sessionEvents.length - 1; i++) {
        const flow = `${sessionEvents[i].event} -> ${sessionEvents[i + 1].event}`
        flows[flow] = (flows[flow] || 0) + 1
      }
    })
    
    res.json({
      userId,
      totalSessions: Object.keys(sessionMap).length,
      totalEvents: events.length,
      sessions: sessionMap,
      commonFlows: flows,
      dateRange: {
        startTime,
        endTime: now,
        days: parseInt(days as string)
      }
    })
  } catch (error) {
    console.error('Analytics funnel error:', error)
    res.status(500).json({
      error: 'Failed to analyze funnel',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'analytics',
    timestamp: Date.now()
  })
})

export default router