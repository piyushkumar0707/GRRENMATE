import cron from 'node-cron'
import { 
  emailQueue, 
  aiProcessingQueue, 
  notificationQueue, 
  plantCareQueue, 
  reportQueue, 
  cleanupQueue,
  QueueManager 
} from './queue'

// Interface for scheduled task configuration
interface ScheduledTask {
  name: string
  schedule: string
  description: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

// Scheduled tasks registry
export const scheduledTasks: Record<string, ScheduledTask> = {}

// Initialize all scheduled tasks
export function initializeScheduledTasks() {
  console.log('Initializing scheduled tasks...')
  
  // Daily care reminders at 8 AM
  scheduledTasks.dailyCareReminders = {
    name: 'Daily Care Reminders',
    schedule: '0 8 * * *',
    description: 'Send daily care reminders to users',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.dailyCareReminders.schedule, async () => {
    if (!scheduledTasks.dailyCareReminders.enabled) return
    
    try {
      console.log('Running daily care reminders task...')
      scheduledTasks.dailyCareReminders.lastRun = new Date()
      
      // Add job to plant care queue
      await plantCareQueue.add('daily_care_check', {
        type: 'reminder',
        timestamp: Date.now()
      })
      
      console.log('Daily care reminders task completed')
    } catch (error) {
      console.error('Daily care reminders task failed:', error)
    }
  })
  
  // Weekly plant health analysis on Sundays at 10 AM
  scheduledTasks.weeklyHealthAnalysis = {
    name: 'Weekly Plant Health Analysis',
    schedule: '0 10 * * 0',
    description: 'Run weekly health analysis for all plants',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.weeklyHealthAnalysis.schedule, async () => {
    if (!scheduledTasks.weeklyHealthAnalysis.enabled) return
    
    try {
      console.log('Running weekly health analysis task...')
      scheduledTasks.weeklyHealthAnalysis.lastRun = new Date()
      
      const activeUsers = await getActiveUsersWithPlants()
      
      for (const user of activeUsers) {
        for (const plant of user.plants) {
          await plantCareQueue.add('plant_health_analysis', {
            type: 'health_check',
            userId: user.id,
            plantId: plant.plantId,
            userPlantId: plant.id
          }, {
            delay: Math.random() * 3600 * 1000 // Spread over 1 hour
          })
        }
      }
      
      console.log(`Weekly health analysis scheduled for ${activeUsers.length} users`)
    } catch (error) {
      console.error('Weekly health analysis task failed:', error)
    }
  })
  
  // Monthly report generation on 1st at 9 AM
  scheduledTasks.monthlyReports = {
    name: 'Monthly Plant Reports',
    schedule: '0 9 1 * *',
    description: 'Generate monthly plant care reports',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.monthlyReports.schedule, async () => {
    if (!scheduledTasks.monthlyReports.enabled) return
    
    try {
      console.log('Running monthly reports generation task...')
      scheduledTasks.monthlyReports.lastRun = new Date()
      
      const users = await getActiveUsersForReports()
      
      for (const user of users) {
        const reportId = `monthly_${user.id}_${Date.now()}`
        
        await reportQueue.add('weekly_plant_report', {
          type: 'monthly_report',
          userId: user.id,
          reportId,
          parameters: {
            period: 'month',
            includeAnalytics: true,
            includeRecommendations: true
          }
        })
      }
      
      console.log(`Monthly reports scheduled for ${users.length} users`)
    } catch (error) {
      console.error('Monthly reports task failed:', error)
    }
  })
  
  // Daily data cleanup at 2 AM
  scheduledTasks.dataCleanup = {
    name: 'Data Cleanup',
    schedule: '0 2 * * *',
    description: 'Clean up old data and temporary files',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.dataCleanup.schedule, async () => {
    if (!scheduledTasks.dataCleanup.enabled) return
    
    try {
      console.log('Running data cleanup task...')
      scheduledTasks.dataCleanup.lastRun = new Date()
      
      await cleanupQueue.add('cleanup_old_data', {
        timestamp: Date.now()
      })
      
      console.log('Data cleanup task scheduled')
    } catch (error) {
      console.error('Data cleanup task failed:', error)
    }
  })
  
  // Hourly queue health check
  scheduledTasks.queueHealthCheck = {
    name: 'Queue Health Check',
    schedule: '0 * * * *',
    description: 'Monitor queue health and clear stuck jobs',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.queueHealthCheck.schedule, async () => {
    if (!scheduledTasks.queueHealthCheck.enabled) return
    
    try {
      console.log('Running queue health check...')
      scheduledTasks.queueHealthCheck.lastRun = new Date()
      
      const queueNames = ['email', 'ai', 'notification', 'plantcare', 'report', 'cleanup']
      
      for (const queueName of queueNames) {
        const stats = await QueueManager.getQueueStats(queueName)
        
        // Alert if too many failed jobs
        if (stats.failed > 100) {
          console.warn(`Queue ${queueName} has ${stats.failed} failed jobs`)
          
          // Send alert to admin
          await emailQueue.add('admin_alert', {
            to: process.env.ADMIN_EMAIL || 'admin@greenmate.com',
            subject: `Queue Alert: ${queueName} has many failed jobs`,
            template: 'admin_alert',
            data: {
              queueName,
              stats,
              timestamp: new Date().toISOString()
            }
          })
        }
        
        // Clean up old failed jobs if too many
        if (stats.failed > 500) {
          await QueueManager.cleanFailedJobs(queueName)
          console.log(`Cleaned failed jobs for queue: ${queueName}`)
        }
      }
      
      console.log('Queue health check completed')
    } catch (error) {
      console.error('Queue health check failed:', error)
    }
  })
  
  // Weekly newsletter on Fridays at 10 AM
  scheduledTasks.weeklyNewsletter = {
    name: 'Weekly Newsletter',
    schedule: '0 10 * * 5',
    description: 'Send weekly newsletter to subscribers',
    enabled: false, // Disabled by default
  }
  
  cron.schedule(scheduledTasks.weeklyNewsletter.schedule, async () => {
    if (!scheduledTasks.weeklyNewsletter.enabled) return
    
    try {
      console.log('Running weekly newsletter task...')
      scheduledTasks.weeklyNewsletter.lastRun = new Date()
      
      const subscribers = await getNewsletterSubscribers()
      
      for (const subscriber of subscribers) {
        await emailQueue.add('newsletter', {
          to: subscriber.email,
          subject: '🌱 Your Weekly Plant Care Digest',
          template: 'newsletter',
          data: {
            name: subscriber.name,
            personalizedContent: await generatePersonalizedNewsletterContent(subscriber.id)
          }
        })
      }
      
      console.log(`Newsletter scheduled for ${subscribers.length} subscribers`)
    } catch (error) {
      console.error('Weekly newsletter task failed:', error)
    }
  })
  
  // Daily AI model performance check
  scheduledTasks.aiModelCheck = {
    name: 'AI Model Performance Check',
    schedule: '0 6 * * *',
    description: 'Check AI model performance and accuracy',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.aiModelCheck.schedule, async () => {
    if (!scheduledTasks.aiModelCheck.enabled) return
    
    try {
      console.log('Running AI model performance check...')
      scheduledTasks.aiModelCheck.lastRun = new Date()
      
      const performanceMetrics = await checkAIModelPerformance()
      
      // If performance drops below threshold, alert admin
      if (performanceMetrics.accuracy < 0.85) {
        await emailQueue.add('admin_alert', {
          to: process.env.ADMIN_EMAIL || 'admin@greenmate.com',
          subject: 'AI Model Performance Alert',
          template: 'ai_performance_alert',
          data: {
            metrics: performanceMetrics,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      // Store performance metrics for tracking
      await storeAIPerformanceMetrics(performanceMetrics)
      
      console.log('AI model performance check completed:', performanceMetrics)
    } catch (error) {
      console.error('AI model performance check failed:', error)
    }
  })
  
  // Seasonal care recommendations (1st of each season)
  scheduledTasks.seasonalCareUpdate = {
    name: 'Seasonal Care Updates',
    schedule: '0 12 21 3,6,9,12 *', // March 21, June 21, September 21, December 21
    description: 'Update seasonal care recommendations',
    enabled: true,
  }
  
  cron.schedule(scheduledTasks.seasonalCareUpdate.schedule, async () => {
    if (!scheduledTasks.seasonalCareUpdate.enabled) return
    
    try {
      console.log('Running seasonal care update task...')
      scheduledTasks.seasonalCareUpdate.lastRun = new Date()
      
      const currentSeason = getCurrentSeason()
      const users = await getAllActiveUsers()
      
      for (const user of users) {
        await notificationQueue.add('seasonal_care_update', {
          userId: user.id,
          type: 'seasonal_update',
          title: `${currentSeason} Care Tips Available!`,
          message: `Updated care recommendations for the ${currentSeason.toLowerCase()} season are now available.`,
          data: { season: currentSeason },
          channels: ['in_app', 'email'],
          priority: 'normal'
        })
      }
      
      console.log(`Seasonal care updates sent to ${users.length} users for ${currentSeason}`)
    } catch (error) {
      console.error('Seasonal care update task failed:', error)
    }
  })
  
  // Update next run times
  updateNextRunTimes()
  
  console.log('All scheduled tasks initialized:', Object.keys(scheduledTasks))
}

// Update next run times for all tasks
function updateNextRunTimes() {
  for (const taskKey in scheduledTasks) {
    const task = scheduledTasks[taskKey]
    if (task.enabled) {
      try {
        // This is a simplified next run calculation
        // In production, you'd use a proper cron parser library
        const nextRun = getNextRunTime(task.schedule)
        task.nextRun = nextRun
      } catch (error) {
        console.error(`Failed to calculate next run for task ${task.name}:`, error)
      }
    }
  }
}

// Simple next run time calculation (you might want to use a library like cron-parser)
function getNextRunTime(cronExpression: string): Date {
  // This is a simplified implementation
  // For production, use a proper cron parser library
  const now = new Date()
  const nextRun = new Date(now.getTime() + 60000) // Add 1 minute as placeholder
  return nextRun
}

// Get current season based on date
function getCurrentSeason(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  
  if (month >= 3 && month <= 5) return 'Spring'
  if (month >= 6 && month <= 8) return 'Summer'
  if (month >= 9 && month <= 11) return 'Fall'
  return 'Winter'
}

// Mock functions - implement based on your database structure
async function getActiveUsersWithPlants() {
  // Return users who have plants and have been active recently
  return []
}

async function getActiveUsersForReports() {
  // Return users who want to receive reports
  return []
}

async function getNewsletterSubscribers() {
  // Return users subscribed to newsletter
  return []
}

async function getAllActiveUsers() {
  // Return all active users
  return []
}

async function generatePersonalizedNewsletterContent(userId: string) {
  // Generate personalized content for user
  return {
    plantTips: [],
    achievements: [],
    communityHighlights: []
  }
}

async function checkAIModelPerformance() {
  // Check AI model accuracy and performance
  return {
    accuracy: 0.92,
    responseTime: 1.2,
    successRate: 0.98
  }
}

async function storeAIPerformanceMetrics(metrics: any) {
  // Store performance metrics in database
  console.log('Storing AI performance metrics:', metrics)
}

// Task management functions
export const TaskManager = {
  // Enable/disable a task
  toggleTask: (taskName: string, enabled: boolean) => {
    if (scheduledTasks[taskName]) {
      scheduledTasks[taskName].enabled = enabled
      console.log(`Task ${taskName} ${enabled ? 'enabled' : 'disabled'}`)
      updateNextRunTimes()
    } else {
      throw new Error(`Task ${taskName} not found`)
    }
  },

  // Get all tasks status
  getAllTasks: () => {
    return Object.entries(scheduledTasks).map(([key, task]) => ({
      key,
      ...task
    }))
  },

  // Get specific task status
  getTask: (taskName: string) => {
    return scheduledTasks[taskName]
  },

  // Force run a task
  forceRun: async (taskName: string) => {
    const task = scheduledTasks[taskName]
    if (!task) {
      throw new Error(`Task ${taskName} not found`)
    }

    console.log(`Forcing execution of task: ${taskName}`)
    
    // This is a simplified implementation
    // In practice, you'd need to extract the actual task logic
    switch (taskName) {
      case 'dailyCareReminders':
        await plantCareQueue.add('daily_care_check', {
          type: 'reminder',
          timestamp: Date.now(),
          forced: true
        })
        break
      case 'dataCleanup':
        await cleanupQueue.add('cleanup_old_data', {
          timestamp: Date.now(),
          forced: true
        })
        break
      default:
        throw new Error(`Force run not implemented for task: ${taskName}`)
    }

    task.lastRun = new Date()
    console.log(`Task ${taskName} forced execution completed`)
  },

  // Get task statistics
  getTaskStats: () => {
    const enabled = Object.values(scheduledTasks).filter(task => task.enabled).length
    const disabled = Object.values(scheduledTasks).filter(task => !task.enabled).length
    const total = Object.keys(scheduledTasks).length

    return {
      total,
      enabled,
      disabled,
      tasks: Object.entries(scheduledTasks).map(([key, task]) => ({
        name: key,
        enabled: task.enabled,
        lastRun: task.lastRun,
        nextRun: task.nextRun
      }))
    }
  }
}

// Graceful shutdown
export function shutdownScheduledTasks() {
  console.log('Shutting down scheduled tasks...')
  cron.destroy()
  console.log('All scheduled tasks stopped')
}

// Health check for scheduled tasks
export function getScheduledTasksHealth() {
  const now = new Date()
  const health = {
    status: 'healthy',
    tasks: {} as Record<string, any>,
    issues: [] as string[]
  }

  for (const [key, task] of Object.entries(scheduledTasks)) {
    const taskHealth = {
      enabled: task.enabled,
      lastRun: task.lastRun,
      nextRun: task.nextRun,
      status: 'ok'
    }

    // Check if task should have run recently but didn't
    if (task.enabled && task.lastRun) {
      const timeSinceLastRun = now.getTime() - task.lastRun.getTime()
      const maxExpectedInterval = 25 * 60 * 60 * 1000 // 25 hours for daily tasks
      
      if (timeSinceLastRun > maxExpectedInterval) {
        taskHealth.status = 'warning'
        health.issues.push(`Task ${key} hasn't run recently`)
      }
    }

    health.tasks[key] = taskHealth
  }

  if (health.issues.length > 0) {
    health.status = 'warning'
  }

  return health
}