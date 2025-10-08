import { PrismaClient } from '@greenmate/database'
import cron from 'node-cron'

const prisma = new PrismaClient()

export interface NotificationData {
  userId: string
  type: 'reminder' | 'like' | 'comment' | 'follow' | 'marketplace' | 'disease' | 'weather'
  title: string
  message: string
  data?: any
}

export class NotificationService {
  
  async createNotification(notificationData: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          isRead: false
        }
      })

      // In a real application, you would also send push notifications here
      // using services like Firebase Cloud Messaging, OneSignal, etc.
      await this.sendPushNotification(notification)

      return notification
    } catch (error) {
      console.error('Create notification error:', error)
      throw new Error('Failed to create notification')
    }
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      return notifications
    } catch (error) {
      console.error('Get user notifications error:', error)
      throw new Error('Failed to fetch notifications')
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: { 
          id: notificationId, 
          userId 
        },
        data: { isRead: true }
      })

      if (notification.count === 0) {
        throw new Error('Notification not found')
      }

      return { success: true }
    } catch (error) {
      console.error('Mark notification as read error:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      })

      return { success: true }
    } catch (error) {
      console.error('Mark all notifications as read error:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: { 
          id: notificationId, 
          userId 
        }
      })

      if (notification.count === 0) {
        throw new Error('Notification not found')
      }

      return { success: true }
    } catch (error) {
      console.error('Delete notification error:', error)
      throw new Error('Failed to delete notification')
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: { 
          userId, 
          isRead: false 
        }
      })

      return { count }
    } catch (error) {
      console.error('Get unread count error:', error)
      throw new Error('Failed to get unread count')
    }
  }

  // Plant care reminders
  async createCareReminder(userId: string, plantName: string, careType: string, dueDate?: Date) {
    const reminderTypes = {
      'water': { icon: '💧', title: 'Time to Water!' },
      'fertilize': { icon: '🌱', title: 'Time to Fertilize!' },
      'repot': { icon: '🪴', title: 'Time to Repot!' },
      'prune': { icon: '✂️', title: 'Time to Prune!' }
    }

    const reminder = reminderTypes[careType as keyof typeof reminderTypes] || 
                     { icon: '🌿', title: 'Plant Care Reminder' }

    return await this.createNotification({
      userId,
      type: 'reminder',
      title: reminder.title,
      message: `${reminder.icon} Your ${plantName} needs ${careType}ing. Don't forget to take care of your green friend!`,
      data: {
        careType,
        plantName,
        dueDate: dueDate?.toISOString()
      }
    })
  }

  // Social notifications
  async createLikeNotification(userId: string, likerUsername: string, postTitle?: string) {
    return await this.createNotification({
      userId,
      type: 'like',
      title: 'New Like! ❤️',
      message: `${likerUsername} liked your ${postTitle ? `post "${postTitle}"` : 'post'}!`,
      data: { likerUsername, postTitle }
    })
  }

  async createCommentNotification(userId: string, commenterUsername: string, postTitle?: string) {
    return await this.createNotification({
      userId,
      type: 'comment',
      title: 'New Comment! 💬',
      message: `${commenterUsername} commented on your ${postTitle ? `post "${postTitle}"` : 'post'}!`,
      data: { commenterUsername, postTitle }
    })
  }

  async createFollowNotification(userId: string, followerUsername: string) {
    return await this.createNotification({
      userId,
      type: 'follow',
      title: 'New Follower! 👥',
      message: `${followerUsername} is now following you! Check out their plant collection.`,
      data: { followerUsername }
    })
  }

  // Marketplace notifications
  async createPurchaseNotification(sellerId: string, buyerUsername: string, itemTitle: string) {
    return await this.createNotification({
      userId: sellerId,
      type: 'marketplace',
      title: 'New Purchase! 🛒',
      message: `${buyerUsername} wants to purchase your "${itemTitle}". Check your marketplace dashboard!`,
      data: { buyerUsername, itemTitle }
    })
  }

  // Weather-based notifications
  async createWeatherAlertNotification(userId: string, alertType: string, message: string) {
    const alertIcons = {
      'frost': '❄️',
      'heatwave': '🌡️',
      'storm': '⛈️',
      'rain': '🌧️',
      'drought': '☀️'
    }

    return await this.createNotification({
      userId,
      type: 'weather',
      title: `Weather Alert ${alertIcons[alertType as keyof typeof alertIcons] || '🌤️'}`,
      message,
      data: { alertType }
    })
  }

  // Disease detection notifications
  async createDiseaseAlertNotification(userId: string, plantName: string, disease: string, severity: string) {
    const severityIcons = {
      'mild': '🟡',
      'moderate': '🟠', 
      'severe': '🔴'
    }

    return await this.createNotification({
      userId,
      type: 'disease',
      title: `Plant Health Alert ${severityIcons[severity as keyof typeof severityIcons] || '🚨'}`,
      message: `${disease} detected in your ${plantName}. ${severity === 'severe' ? 'Immediate action required!' : 'Check the recommended treatment.'}`,
      data: { plantName, disease, severity }
    })
  }

  // Push notification simulation (in real app, integrate with FCM/OneSignal)
  private async sendPushNotification(notification: any) {
    // This is where you would integrate with actual push notification services
    console.log(`📱 Push notification sent to user ${notification.userId}:`, {
      title: notification.title,
      body: notification.message,
      data: notification.data
    })

    // Example integration with Firebase Cloud Messaging:
    /*
    const message = {
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: notification.data,
      token: userDeviceToken // You would store device tokens in your database
    }
    
    await admin.messaging().send(message)
    */
  }

  // Automated care reminders - runs daily
  async setupCareReminders() {
    // Schedule daily check for plant care reminders at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('🕘 Running daily care reminder check...')
      
      try {
        // Find plants that need watering (example logic)
        const plantsNeedingCare = await prisma.userPlant.findMany({
          where: {
            OR: [
              // Plants not watered in 7 days (adjust based on plant needs)
              {
                lastWatered: {
                  lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              }
            ]
          },
          include: {
            user: { select: { id: true } },
            plant: { select: { name: true } }
          }
        })

        // Send reminders
        for (const userPlant of plantsNeedingCare) {
          await this.createCareReminder(
            userPlant.userId,
            userPlant.nickname || userPlant.plant.name,
            'water'
          )
        }

        console.log(`📬 Sent ${plantsNeedingCare.length} care reminders`)
      } catch (error) {
        console.error('Daily care reminder error:', error)
      }
    })
  }

  // Weather-based reminder system
  async setupWeatherReminders() {
    // Schedule weather check every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('🌤️ Running weather-based reminder check...')
      
      try {
        // This would integrate with your weather service
        // to send location-specific plant care alerts
        
        // Example: Frost warning
        // const users = await getUsersInFrostArea()
        // for (const user of users) {
        //   await this.createWeatherAlertNotification(
        //     user.id,
        //     'frost',
        //     'Frost warning tonight! Bring sensitive plants indoors.'
        //   )
        // }
        
        console.log('🌦️ Weather reminders processed')
      } catch (error) {
        console.error('Weather reminder error:', error)
      }
    })
  }

  // Initialize all scheduled tasks
  init() {
    console.log('🔔 Initializing notification service...')
    this.setupCareReminders()
    this.setupWeatherReminders()
    console.log('✅ Notification service initialized with scheduled tasks')
  }
}

export const notificationService = new NotificationService()