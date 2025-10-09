import Bull from 'bull'
import Redis from 'ioredis'
import nodemailer from 'nodemailer'
import { cache } from './cache'

// Create Redis connection for Bull
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

// Queue configurations
const queueConfig = {
  redis: {
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
}

// Create different queues for different types of jobs
export const emailQueue = new Bull('email processing', queueConfig)
export const aiProcessingQueue = new Bull('ai processing', queueConfig)
export const notificationQueue = new Bull('notifications', queueConfig)
export const plantCareQueue = new Bull('plant care', queueConfig)
export const reportQueue = new Bull('report generation', queueConfig)
export const cleanupQueue = new Bull('data cleanup', queueConfig)

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Job interfaces for type safety
export interface EmailJobData {
  to: string | string[]
  subject: string
  template: string
  data: Record<string, any>
  priority?: 'low' | 'normal' | 'high' | 'critical'
}

export interface AIProcessingJobData {
  type: 'plant_identification' | 'disease_detection' | 'plant_health_analysis'
  imageUrl: string
  userId?: string
  plantId?: string
  metadata?: Record<string, any>
}

export interface NotificationJobData {
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  channels: ('push' | 'email' | 'in_app')[]
  priority?: 'low' | 'normal' | 'high' | 'critical'
}

export interface PlantCareJobData {
  type: 'reminder' | 'health_check' | 'care_suggestion'
  userId: string
  plantId: string
  userPlantId: string
  careType?: 'watering' | 'fertilizing' | 'repotting' | 'pruning'
  scheduledFor?: Date
}

export interface ReportJobData {
  type: 'weekly_summary' | 'monthly_report' | 'plant_progress' | 'care_analytics'
  userId: string
  reportId: string
  parameters: Record<string, any>
}

// Email job processors
emailQueue.process('welcome_email', async (job) => {
  const { to, data } = job.data as EmailJobData
  const transporter = createEmailTransporter()

  try {
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@greenmate.com',
      to,
      subject: 'Welcome to GreenMate! 🌱',
      html: generateWelcomeEmail(data),
    })

    // Log success
    console.log(`Welcome email sent to ${to}:`, result.messageId)
    
    // Track in database if needed
    await trackEmailSent('welcome_email', to, result.messageId)
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
})

emailQueue.process('care_reminder_email', async (job) => {
  const { to, data } = job.data as EmailJobData
  const transporter = createEmailTransporter()

  try {
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@greenmate.com',
      to,
      subject: `🌱 Time to care for your ${data.plantName}`,
      html: generateCareReminderEmail(data),
    })

    console.log(`Care reminder email sent to ${to}:`, result.messageId)
    await trackEmailSent('care_reminder', to, result.messageId)
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Failed to send care reminder email:', error)
    throw error
  }
})

emailQueue.process('password_reset', async (job) => {
  const { to, data } = job.data as EmailJobData
  const transporter = createEmailTransporter()

  try {
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@greenmate.com',
      to,
      subject: 'Reset Your GreenMate Password',
      html: generatePasswordResetEmail(data),
    })

    console.log(`Password reset email sent to ${to}:`, result.messageId)
    await trackEmailSent('password_reset', to, result.messageId)
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw error
  }
})

// AI processing job processors
aiProcessingQueue.process('plant_identification', 5, async (job) => {
  const { imageUrl, userId, metadata } = job.data as AIProcessingJobData

  try {
    // Mock AI processing - replace with actual AI service
    const result = await processPlantIdentification(imageUrl, metadata)
    
    // Store results in database
    if (userId) {
      await storePlantRecognitionResult(userId, imageUrl, result)
    }
    
    // Send notification to user
    if (userId) {
      await notificationQueue.add('ai_result_notification', {
        userId,
        type: 'plant_identified',
        title: 'Plant Identification Complete',
        message: `We identified your plant as ${result.plantName} with ${Math.round(result.confidence * 100)}% confidence.`,
        data: { result },
        channels: ['push', 'in_app'],
        priority: 'normal'
      })
    }
    
    return result
  } catch (error) {
    console.error('Plant identification failed:', error)
    
    if (userId) {
      await notificationQueue.add('ai_error_notification', {
        userId,
        type: 'identification_failed',
        title: 'Plant Identification Failed',
        message: 'We were unable to identify your plant. Please try again with a clearer image.',
        channels: ['push', 'in_app'],
        priority: 'normal'
      })
    }
    
    throw error
  }
})

aiProcessingQueue.process('disease_detection', 3, async (job) => {
  const { imageUrl, userId, plantId, metadata } = job.data as AIProcessingJobData

  try {
    const result = await processDiseaseDetection(imageUrl, metadata)
    
    // Store results
    if (userId) {
      await storeDiseaseDetectionResult(userId, plantId, imageUrl, result)
    }
    
    // Send notification with severity-based priority
    const priority = result.severity === 'severe' ? 'high' : 'normal'
    
    if (userId) {
      await notificationQueue.add('disease_detection_result', {
        userId,
        type: 'disease_detected',
        title: result.disease ? `${result.disease} Detected` : 'Health Check Complete',
        message: result.disease 
          ? `Your plant may have ${result.disease}. ${result.treatment || 'Check the care recommendations.'}`
          : 'Your plant looks healthy!',
        data: { result },
        channels: result.severity === 'severe' ? ['push', 'email', 'in_app'] : ['push', 'in_app'],
        priority
      })
    }
    
    return result
  } catch (error) {
    console.error('Disease detection failed:', error)
    throw error
  }
})

// Notification job processors
notificationQueue.process('care_reminder', async (job) => {
  const { userId, plantId, userPlantId, careType } = job.data as PlantCareJobData

  try {
    // Get plant and user data
    const [plant, userPlant, user] = await Promise.all([
      getPlantById(plantId),
      getUserPlantById(userPlantId),
      getUserById(userId)
    ])

    if (!plant || !userPlant || !user) {
      throw new Error('Required data not found')
    }

    const plantName = userPlant.nickname || plant.name
    const careAction = getCareActionText(careType)

    // Create in-app notification
    await createInAppNotification({
      userId,
      type: 'care_reminder',
      title: `Time to ${careAction.toLowerCase()} ${plantName}`,
      message: `Your ${plantName} needs ${careAction.toLowerCase()}. Keep your plant healthy!`,
      data: {
        plantId,
        userPlantId,
        careType,
        plantName
      }
    })

    // Send push notification if enabled
    if (user.profile?.preferences?.notifications?.push !== false) {
      await sendPushNotification(userId, {
        title: `🌱 ${careAction} ${plantName}`,
        body: `Don't forget to ${careAction.toLowerCase()} your ${plantName}!`,
        data: { plantId, userPlantId, careType }
      })
    }

    // Send email if enabled
    if (user.profile?.preferences?.notifications?.email !== false) {
      await emailQueue.add('care_reminder_email', {
        to: user.email,
        subject: `Time to care for your ${plantName}`,
        template: 'care_reminder',
        data: {
          userName: user.profile?.firstName || user.username,
          plantName,
          careAction,
          careType,
          plantImage: userPlant.images[0] || plant.images[0]
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to process care reminder:', error)
    throw error
  }
})

notificationQueue.process('ai_result_notification', async (job) => {
  const { userId, type, title, message, data, channels } = job.data as NotificationJobData

  try {
    // Create in-app notification
    await createInAppNotification({
      userId,
      type,
      title,
      message,
      data
    })

    // Send push notification if requested
    if (channels.includes('push')) {
      await sendPushNotification(userId, {
        title,
        body: message,
        data
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send AI result notification:', error)
    throw error
  }
})

// Plant care job processors
plantCareQueue.process('daily_care_check', async (job) => {
  try {
    // Get all users with plants that need care reminders
    const usersWithReminders = await getUsersWithUpcomingReminders()

    for (const user of usersWithReminders) {
      // Process reminders for each user
      for (const reminder of user.upcomingReminders) {
        await notificationQueue.add('care_reminder', {
          userId: user.id,
          plantId: reminder.plantId,
          userPlantId: reminder.userPlantId,
          careType: reminder.type,
          scheduledFor: reminder.nextDue
        }, {
          delay: calculateDelayForReminder(reminder.nextDue)
        })
      }
    }

    return { processedUsers: usersWithReminders.length }
  } catch (error) {
    console.error('Daily care check failed:', error)
    throw error
  }
})

plantCareQueue.process('plant_health_analysis', async (job) => {
  const { userId, plantId, userPlantId } = job.data as PlantCareJobData

  try {
    // Analyze plant health based on care history
    const healthAnalysis = await analyzePlantHealth(userId, plantId, userPlantId)
    
    // Send recommendations if needed
    if (healthAnalysis.recommendations.length > 0) {
      await notificationQueue.add('health_recommendation', {
        userId,
        type: 'plant_health_tip',
        title: 'Plant Health Recommendations',
        message: `We have some suggestions to keep your plant healthy!`,
        data: { healthAnalysis },
        channels: ['in_app'],
        priority: 'normal'
      })
    }

    return healthAnalysis
  } catch (error) {
    console.error('Plant health analysis failed:', error)
    throw error
  }
})

// Report generation processors
reportQueue.process('weekly_plant_report', async (job) => {
  const { userId, reportId, parameters } = job.data as ReportJobData

  try {
    const reportData = await generateWeeklyPlantReport(userId, parameters)
    
    // Store report
    await storeGeneratedReport(reportId, reportData)
    
    // Notify user
    await notificationQueue.add('report_ready', {
      userId,
      type: 'weekly_report',
      title: 'Your Weekly Plant Report is Ready!',
      message: 'Check out your plant care progress and achievements this week.',
      data: { reportId, reportData: reportData.summary },
      channels: ['in_app', 'email'],
      priority: 'normal'
    })

    return reportData
  } catch (error) {
    console.error('Weekly report generation failed:', error)
    throw error
  }
})

// Cleanup job processors
cleanupQueue.process('cleanup_old_data', async (job) => {
  try {
    const results = await Promise.allSettled([
      cleanupOldAnalytics(30), // Keep 30 days
      cleanupOldNotifications(90), // Keep 90 days
      cleanupOldEmailLogs(60), // Keep 60 days
      cleanupOldTempFiles(7), // Keep 7 days
    ])

    const summary = results.map((result, index) => ({
      task: ['analytics', 'notifications', 'emails', 'temp_files'][index],
      status: result.status,
      result: result.status === 'fulfilled' ? result.value : result.reason
    }))

    return { summary }
  } catch (error) {
    console.error('Cleanup job failed:', error)
    throw error
  }
})

// Utility functions (these would be implemented based on your database structure)
async function processPlantIdentification(imageUrl: string, metadata?: any) {
  // Mock implementation - replace with actual AI service
  return {
    plantName: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    confidence: 0.95,
    alternatives: [
      { name: 'Monstera Adansonii', confidence: 0.15 },
      { name: 'Philodendron', confidence: 0.10 }
    ]
  }
}

async function processDiseaseDetection(imageUrl: string, metadata?: any) {
  // Mock implementation
  return {
    disease: null, // or disease name if detected
    confidence: 0.85,
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    treatment: 'Monitor plant condition and ensure proper watering.'
  }
}

async function storePlantRecognitionResult(userId: string, imageUrl: string, result: any) {
  // Implementation depends on your database structure
  console.log('Storing plant recognition result for user:', userId)
}

async function storeDiseaseDetectionResult(userId: string, plantId: string | undefined, imageUrl: string, result: any) {
  console.log('Storing disease detection result for user:', userId)
}

async function createInAppNotification(notification: any) {
  // Implementation depends on your database structure
  console.log('Creating in-app notification:', notification)
}

async function sendPushNotification(userId: string, payload: any) {
  // Implementation would integrate with push notification service
  console.log('Sending push notification to user:', userId, payload)
}

async function trackEmailSent(type: string, to: string, messageId: string) {
  // Track email delivery in your database
  console.log('Email tracked:', { type, to, messageId })
}

// Email template generators
function generateWelcomeEmail(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">Welcome to GreenMate! 🌱</h1>
      <p>Hi ${data.name || 'Plant Lover'},</p>
      <p>Welcome to GreenMate, your AI-powered plant care companion! We're excited to help you grow a thriving plant collection.</p>
      <p>Here's what you can do with GreenMate:</p>
      <ul>
        <li>📸 Identify plants with AI-powered recognition</li>
        <li>🗓️ Set up care reminders for watering, fertilizing, and more</li>
        <li>📊 Track your plant's growth and health</li>
        <li>👥 Connect with other plant enthusiasts</li>
        <li>🧠 Get personalized care recommendations</li>
      </ul>
      <p>Ready to get started? <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #16a34a;">Visit your dashboard</a></p>
      <p>Happy growing!</p>
      <p>The GreenMate Team</p>
    </div>
  `
}

function generateCareReminderEmail(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">Time to Care for ${data.plantName}! 🌱</h1>
      <p>Hi ${data.userName},</p>
      <p>This is a friendly reminder that your <strong>${data.plantName}</strong> needs ${data.careAction.toLowerCase()}.</p>
      ${data.plantImage ? `<img src="${data.plantImage}" alt="${data.plantName}" style="max-width: 200px; border-radius: 8px;">` : ''}
      <p>Regular ${data.careType} helps keep your plant healthy and happy. Don't forget to log this care activity in your GreenMate app!</p>
      <p><a href="${process.env.FRONTEND_URL}/plants/${data.plantId}" style="color: #16a34a;">View Plant Details</a></p>
      <p>Happy gardening!</p>
      <p>The GreenMate Team</p>
    </div>
  `
}

function generatePasswordResetEmail(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">Reset Your Password</h1>
      <p>Hi there,</p>
      <p>You requested to reset your password for your GreenMate account.</p>
      <p>Click the button below to create a new password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      </p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>The GreenMate Team</p>
    </div>
  `
}

// Helper functions (mock implementations)
async function getPlantById(id: string) { return { id, name: 'Sample Plant', images: [] } }
async function getUserPlantById(id: string) { return { id, nickname: null, images: [] } }
async function getUserById(id: string) { return { id, email: 'user@example.com', username: 'user', profile: null } }
async function getUsersWithUpcomingReminders() { return [] }
async function calculateDelayForReminder(dueDate: Date) { return Math.max(0, dueDate.getTime() - Date.now()) }
async function analyzePlantHealth(userId: string, plantId: string, userPlantId: string) { return { recommendations: [] } }
async function generateWeeklyPlantReport(userId: string, parameters: any) { return { summary: {} } }
async function storeGeneratedReport(reportId: string, data: any) { console.log('Report stored:', reportId) }
async function cleanupOldAnalytics(days: number) { return { deleted: 0 } }
async function cleanupOldNotifications(days: number) { return { deleted: 0 } }
async function cleanupOldEmailLogs(days: number) { return { deleted: 0 } }
async function cleanupOldTempFiles(days: number) { return { deleted: 0 } }
function getCareActionText(careType?: string) { return careType || 'Care' }

// Export queue management utilities
export const QueueManager = {
  // Add a job to a queue
  addJob: async (queueName: string, jobType: string, data: any, options?: any) => {
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
      throw new Error(`Unknown queue: ${queueName}`)
    }
    
    return await queue.add(jobType, data, options)
  },

  // Get queue stats
  getQueueStats: async (queueName: string) => {
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
      throw new Error(`Unknown queue: ${queueName}`)
    }
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ])
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    }
  },

  // Clean failed jobs
  cleanFailedJobs: async (queueName: string) => {
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
      throw new Error(`Unknown queue: ${queueName}`)
    }
    
    await queue.clean(0, 'failed')
  },
}

// Error handling for queues
const queues = [emailQueue, aiProcessingQueue, notificationQueue, plantCareQueue, reportQueue, cleanupQueue]

queues.forEach(queue => {
  queue.on('error', (error) => {
    console.error(`Queue ${queue.name} error:`, error)
  })
  
  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} in queue ${queue.name} failed:`, error)
  })
  
  queue.on('completed', (job, result) => {
    console.log(`Job ${job.id} in queue ${queue.name} completed:`, result)
  })
})