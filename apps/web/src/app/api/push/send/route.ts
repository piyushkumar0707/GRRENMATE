import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'contact@greenmate.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  vibrate?: number[]
}

export async function POST(request: NextRequest) {
  try {
    const { subscriptions, notification, options = {} } = await request.json()

    // Validate input
    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Subscriptions array is required' },
        { status: 400 }
      )
    }

    if (!notification || !notification.title) {
      return NextResponse.json(
        { error: 'Notification with title is required' },
        { status: 400 }
      )
    }

    // Build notification payload
    const payload: NotificationPayload = {
      title: notification.title,
      body: notification.body || '',
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/badge-72x72.png',
      image: notification.image,
      tag: notification.tag || 'general',
      data: notification.data || {},
      actions: notification.actions,
      requireInteraction: notification.requireInteraction || false,
      silent: notification.silent || false,
      timestamp: notification.timestamp || Date.now(),
      vibrate: notification.vibrate || [200, 100, 200]
    }

    const results = []
    const failedSubscriptions = []

    // Send notifications to all subscriptions
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(payload),
          options
        )
        
        results.push({
          endpoint: subscription.endpoint,
          success: true
        })

      } catch (error: any) {
        console.error('Failed to send push notification:', error)
        
        results.push({
          endpoint: subscription.endpoint,
          success: false,
          error: error.message
        })

        // If subscription is invalid (410 Gone, 413 Payload Too Large), mark for removal
        if (error.statusCode === 410 || error.statusCode === 413) {
          failedSubscriptions.push(subscription.endpoint)
        }
      }
    }

    // TODO: Remove failed subscriptions from database
    if (failedSubscriptions.length > 0) {
      console.log('Subscriptions to remove:', failedSubscriptions)
      // await db.subscription.deleteMany({
      //   where: {
      //     endpoint: {
      //       in: failedSubscriptions
      //     }
      //   }
      // })
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} notifications successfully, ${failureCount} failed`,
      results: {
        total: subscriptions.length,
        successful: successCount,
        failed: failureCount,
        removedSubscriptions: failedSubscriptions.length
      }
    })

  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper endpoint to send predefined notification types
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const userId = searchParams.get('userId')

  if (!type) {
    return NextResponse.json(
      { error: 'Notification type is required' },
      { status: 400 }
    )
  }

  try {
    // Get user subscriptions from database
    // const subscriptions = await db.subscription.findMany({
    //   where: userId ? { userId } : {},
    //   select: {
    //     endpoint: true,
    //     p256dh: true,
    //     auth: true
    //   }
    // })

    // Mock subscriptions for demonstration
    const subscriptions: any[] = []

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscriptions found'
      })
    }

    let notification: NotificationPayload

    switch (type) {
      case 'plant-care':
        notification = {
          title: '🌱 Plant Care Reminder',
          body: 'Time to water your plants! Check your plant care schedule.',
          icon: '/icons/plant-icon.png',
          tag: 'plant-care',
          data: { type: 'plant-care', url: '/dashboard/plants' },
          actions: [
            { action: 'view', title: 'View Plants', icon: '/icons/view.png' },
            { action: 'snooze', title: 'Remind Later', icon: '/icons/snooze.png' }
          ],
          vibrate: [200, 100, 200, 100, 200]
        }
        break

      case 'community-update':
        notification = {
          title: '🌿 Community Update',
          body: 'New posts in your plant communities! See what fellow gardeners are sharing.',
          icon: '/icons/community-icon.png',
          tag: 'community',
          data: { type: 'community', url: '/community' },
          actions: [
            { action: 'view', title: 'View Community', icon: '/icons/community.png' }
          ]
        }
        break

      case 'achievement':
        notification = {
          title: '🏆 Achievement Unlocked!',
          body: 'Congratulations! You\'ve earned a new gardening achievement.',
          icon: '/icons/achievement-icon.png',
          tag: 'achievement',
          data: { type: 'achievement', url: '/profile/achievements' },
          requireInteraction: true,
          vibrate: [300, 200, 300]
        }
        break

      case 'weather-alert':
        notification = {
          title: '🌦️ Weather Alert',
          body: 'Weather conditions may affect your plants. Check the forecast.',
          icon: '/icons/weather-icon.png',
          tag: 'weather',
          data: { type: 'weather', url: '/dashboard/weather' },
          actions: [
            { action: 'view', title: 'View Forecast', icon: '/icons/weather.png' }
          ]
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unknown notification type' },
          { status: 400 }
        )
    }

    // Send the notification using the POST endpoint logic
    const payload = JSON.stringify(notification)
    const results = []

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, payload)
        results.push({ endpoint: subscription.endpoint, success: true })
      } catch (error: any) {
        results.push({ 
          endpoint: subscription.endpoint, 
          success: false, 
          error: error.message 
        })
      }
    }

    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} ${type} notifications`,
      type,
      results: {
        total: subscriptions.length,
        successful: successCount,
        failed: results.length - successCount
      }
    })

  } catch (error) {
    console.error('Error sending predefined notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}