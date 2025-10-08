import express from 'express'
import { notificationService } from '../services/notifications.js'

const router = express.Router()

/**
 * @route GET /api/notifications/:userId
 * @desc Get user notifications
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { limit, offset } = req.query

    const notifications = await notificationService.getUserNotifications(
      userId,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    )

    res.json({
      success: true,
      data: notifications
    })

  } catch (error: any) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    })
  }
})

/**
 * @route GET /api/notifications/:userId/unread-count
 * @desc Get unread notification count
 */
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params
    const result = await notificationService.getUnreadCount(userId)

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Get unread count error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    })
  }
})

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    await notificationService.markAsRead(id, userId)

    res.json({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error: any) {
    console.error('Mark notification as read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    })
  }
})

/**
 * @route PUT /api/notifications/:userId/read-all
 * @desc Mark all notifications as read
 */
router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params
    await notificationService.markAllAsRead(userId)

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error: any) {
    console.error('Mark all notifications as read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    })
  }
})

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    await notificationService.deleteNotification(id, userId)

    res.json({
      success: true,
      message: 'Notification deleted'
    })

  } catch (error: any) {
    console.error('Delete notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    })
  }
})

/**
 * @route POST /api/notifications/care-reminder
 * @desc Create a care reminder notification (for testing)
 */
router.post('/care-reminder', async (req, res) => {
  try {
    const { userId, plantName, careType, dueDate } = req.body

    if (!userId || !plantName || !careType) {
      return res.status(400).json({
        success: false,
        message: 'User ID, plant name, and care type are required'
      })
    }

    const notification = await notificationService.createCareReminder(
      userId,
      plantName,
      careType,
      dueDate ? new Date(dueDate) : undefined
    )

    res.status(201).json({
      success: true,
      data: notification
    })

  } catch (error: any) {
    console.error('Create care reminder error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create care reminder'
    })
  }
})

/**
 * @route POST /api/notifications/weather-alert
 * @desc Create a weather alert notification (for testing)
 */
router.post('/weather-alert', async (req, res) => {
  try {
    const { userId, alertType, message } = req.body

    if (!userId || !alertType || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, alert type, and message are required'
      })
    }

    const notification = await notificationService.createWeatherAlertNotification(
      userId,
      alertType,
      message
    )

    res.status(201).json({
      success: true,
      data: notification
    })

  } catch (error: any) {
    console.error('Create weather alert error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create weather alert'
    })
  }
})

/**
 * @route POST /api/notifications/disease-alert
 * @desc Create a disease alert notification (for testing)
 */
router.post('/disease-alert', async (req, res) => {
  try {
    const { userId, plantName, disease, severity } = req.body

    if (!userId || !plantName || !disease || !severity) {
      return res.status(400).json({
        success: false,
        message: 'User ID, plant name, disease, and severity are required'
      })
    }

    const notification = await notificationService.createDiseaseAlertNotification(
      userId,
      plantName,
      disease,
      severity
    )

    res.status(201).json({
      success: true,
      data: notification
    })

  } catch (error: any) {
    console.error('Create disease alert error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create disease alert'
    })
  }
})

export default router