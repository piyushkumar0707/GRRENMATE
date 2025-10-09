import express from 'express'
import { validateBody, validateQuery, validateParams } from '../lib/validation'
import { z } from 'zod'
import { 
  QueueManager, 
  emailQueue, 
  aiProcessingQueue, 
  notificationQueue, 
  plantCareQueue, 
  reportQueue, 
  cleanupQueue 
} from '../lib/queue'
import { TaskManager, getScheduledTasksHealth } from '../lib/scheduled-tasks'

const router = express.Router()

// Validation schemas
const queueNameSchema = z.object({
  queueName: z.enum(['email', 'ai', 'notification', 'plantcare', 'report', 'cleanup'])
})

const addJobSchema = z.object({
  jobType: z.string().min(1).max(50),
  data: z.record(z.any()),
  options: z.object({
    delay: z.number().optional(),
    priority: z.number().optional(),
    attempts: z.number().optional(),
  }).optional()
})

const taskNameSchema = z.object({
  taskName: z.string().min(1).max(50)
})

// Queue management routes

// Get all queue statistics
router.get('/stats', async (req, res) => {
  try {
    const queueNames = ['email', 'ai', 'notification', 'plantcare', 'report', 'cleanup']
    const stats = {}
    
    for (const queueName of queueNames) {
      stats[queueName] = await QueueManager.getQueueStats(queueName)
    }
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get queue stats:', error)
    res.status(500).json({
      error: 'Failed to retrieve queue statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get specific queue statistics
router.get('/stats/:queueName', validateParams(queueNameSchema), async (req, res) => {
  try {
    const { queueName } = req.params
    const stats = await QueueManager.getQueueStats(queueName)
    
    res.json({
      success: true,
      queueName,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get queue stats:', error)
    res.status(500).json({
      error: 'Failed to retrieve queue statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Add job to queue
router.post('/jobs/:queueName', 
  validateParams(queueNameSchema),
  validateBody(addJobSchema),
  async (req, res) => {
    try {
      const { queueName } = req.params
      const { jobType, data, options } = req.body
      
      const job = await QueueManager.addJob(queueName, jobType, data, options)
      
      res.json({
        success: true,
        jobId: job.id,
        queueName,
        jobType,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to add job:', error)
      res.status(500).json({
        error: 'Failed to add job to queue',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
)

// Get jobs in queue
router.get('/jobs/:queueName', validateParams(queueNameSchema), async (req, res) => {
  try {
    const { queueName } = req.params
    const { status = 'waiting', limit = 20 } = req.query
    
    const queues = {
      email: emailQueue,
      ai: aiProcessingQueue,
      notification: notificationQueue,
      plantcare: plantCareQueue,
      report: reportQueue,
      cleanup: cleanupQueue,
    }
    
    const queue = queues[queueName as keyof typeof queues]
    if (!queue) {
      return res.status(400).json({
        error: 'Invalid queue name',
        message: `Queue ${queueName} not found`
      })
    }
    
    let jobs = []
    const limitNum = parseInt(limit as string)
    
    switch (status) {
      case 'waiting':
        jobs = await queue.getWaiting(0, limitNum - 1)
        break
      case 'active':
        jobs = await queue.getActive(0, limitNum - 1)
        break
      case 'completed':
        jobs = await queue.getCompleted(0, limitNum - 1)
        break
      case 'failed':
        jobs = await queue.getFailed(0, limitNum - 1)
        break
      case 'delayed':
        jobs = await queue.getDelayed(0, limitNum - 1)
        break
      default:
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Status must be one of: waiting, active, completed, failed, delayed'
        })
    }
    
    const jobsData = jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      opts: job.opts,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    }))
    
    res.json({
      success: true,
      queueName,
      status,
      jobs: jobsData,
      count: jobs.length
    })
  } catch (error) {
    console.error('Failed to get jobs:', error)
    res.status(500).json({
      error: 'Failed to retrieve jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Clean failed jobs
router.delete('/jobs/:queueName/failed', validateParams(queueNameSchema), async (req, res) => {
  try {
    const { queueName } = req.params
    
    await QueueManager.cleanFailedJobs(queueName)
    
    res.json({
      success: true,
      message: `Failed jobs cleaned for queue: ${queueName}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to clean jobs:', error)
    res.status(500).json({
      error: 'Failed to clean failed jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Queue health check
router.get('/health', async (req, res) => {
  try {
    const queueNames = ['email', 'ai', 'notification', 'plantcare', 'report', 'cleanup']
    const health = {
      status: 'healthy',
      queues: {} as Record<string, any>,
      issues: [] as string[]
    }
    
    for (const queueName of queueNames) {
      const stats = await QueueManager.getQueueStats(queueName)
      const queueHealth = {
        ...stats,
        status: 'healthy'
      }
      
      // Check for issues
      if (stats.failed > 100) {
        queueHealth.status = 'warning'
        health.issues.push(`Queue ${queueName} has ${stats.failed} failed jobs`)
      }
      
      if (stats.active > 50) {
        queueHealth.status = 'warning'
        health.issues.push(`Queue ${queueName} has ${stats.active} active jobs (high load)`)
      }
      
      health.queues[queueName] = queueHealth
    }
    
    if (health.issues.length > 0) {
      health.status = 'warning'
    }
    
    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Queue health check failed:', error)
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 'unhealthy'
    })
  }
})

// Scheduled tasks management routes

// Get all scheduled tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = TaskManager.getAllTasks()
    const stats = TaskManager.getTaskStats()
    
    res.json({
      success: true,
      tasks,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get tasks:', error)
    res.status(500).json({
      error: 'Failed to retrieve scheduled tasks',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get specific task
router.get('/tasks/:taskName', validateParams(taskNameSchema), async (req, res) => {
  try {
    const { taskName } = req.params
    const task = TaskManager.getTask(taskName)
    
    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task ${taskName} does not exist`
      })
    }
    
    res.json({
      success: true,
      task: {
        name: taskName,
        ...task
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get task:', error)
    res.status(500).json({
      error: 'Failed to retrieve task',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Toggle task enabled/disabled
router.patch('/tasks/:taskName/toggle', validateParams(taskNameSchema), async (req, res) => {
  try {
    const { taskName } = req.params
    const { enabled } = req.body
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'enabled field must be a boolean'
      })
    }
    
    TaskManager.toggleTask(taskName, enabled)
    
    res.json({
      success: true,
      message: `Task ${taskName} ${enabled ? 'enabled' : 'disabled'}`,
      taskName,
      enabled,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to toggle task:', error)
    res.status(500).json({
      error: 'Failed to toggle task',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Force run a task
router.post('/tasks/:taskName/run', validateParams(taskNameSchema), async (req, res) => {
  try {
    const { taskName } = req.params
    
    await TaskManager.forceRun(taskName)
    
    res.json({
      success: true,
      message: `Task ${taskName} execution forced`,
      taskName,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to force run task:', error)
    res.status(500).json({
      error: 'Failed to force run task',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get scheduled tasks health
router.get('/tasks/health', async (req, res) => {
  try {
    const health = getScheduledTasksHealth()
    
    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Scheduled tasks health check failed:', error)
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Utility endpoints for testing

// Send test email
router.post('/test/email', async (req, res) => {
  try {
    const { to, type = 'welcome_email' } = req.body
    
    if (!to) {
      return res.status(400).json({
        error: 'Missing recipient',
        message: 'to field is required'
      })
    }
    
    const job = await emailQueue.add(type, {
      to,
      subject: 'Test Email',
      template: type,
      data: {
        name: 'Test User',
        plantName: 'Test Plant'
      }
    })
    
    res.json({
      success: true,
      message: 'Test email queued',
      jobId: job.id,
      type,
      to
    })
  } catch (error) {
    console.error('Failed to send test email:', error)
    res.status(500).json({
      error: 'Failed to queue test email',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Test AI processing
router.post('/test/ai', async (req, res) => {
  try {
    const { imageUrl, type = 'plant_identification', userId } = req.body
    
    if (!imageUrl) {
      return res.status(400).json({
        error: 'Missing image URL',
        message: 'imageUrl field is required'
      })
    }
    
    const job = await aiProcessingQueue.add(type, {
      type,
      imageUrl,
      userId,
      metadata: { test: true }
    })
    
    res.json({
      success: true,
      message: 'AI processing queued',
      jobId: job.id,
      type,
      imageUrl
    })
  } catch (error) {
    console.error('Failed to queue AI processing:', error)
    res.status(500).json({
      error: 'Failed to queue AI processing',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Test notification
router.post('/test/notification', async (req, res) => {
  try {
    const { userId, title = 'Test Notification', message = 'This is a test notification' } = req.body
    
    if (!userId) {
      return res.status(400).json({
        error: 'Missing user ID',
        message: 'userId field is required'
      })
    }
    
    const job = await notificationQueue.add('test_notification', {
      userId,
      type: 'test',
      title,
      message,
      channels: ['in_app'],
      priority: 'normal'
    })
    
    res.json({
      success: true,
      message: 'Test notification queued',
      jobId: job.id,
      userId,
      title
    })
  } catch (error) {
    console.error('Failed to queue test notification:', error)
    res.status(500).json({
      error: 'Failed to queue test notification',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get system overview
router.get('/overview', async (req, res) => {
  try {
    const queueNames = ['email', 'ai', 'notification', 'plantcare', 'report', 'cleanup']
    const queueStats = {}
    let totalJobs = 0
    let totalFailed = 0
    
    for (const queueName of queueNames) {
      const stats = await QueueManager.getQueueStats(queueName)
      queueStats[queueName] = stats
      totalJobs += stats.waiting + stats.active + stats.completed + stats.delayed
      totalFailed += stats.failed
    }
    
    const taskStats = TaskManager.getTaskStats()
    const taskHealth = getScheduledTasksHealth()
    
    res.json({
      success: true,
      overview: {
        queues: {
          total: queueNames.length,
          totalJobs,
          totalFailed,
          stats: queueStats
        },
        tasks: {
          ...taskStats,
          health: taskHealth.status
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Failed to get system overview:', error)
    res.status(500).json({
      error: 'Failed to get system overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router