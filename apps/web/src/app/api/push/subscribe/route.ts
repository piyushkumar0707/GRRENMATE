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

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    // Validate subscription object
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      )
    }

    // Store subscription in your database
    // This is where you would save the subscription to your database
    // For now, we'll just validate and return success
    
    // Example database save (implement with your database):
    // await db.subscription.create({
    //   data: {
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //     userId: getUserIdFromSession(), // Get from authentication
    //   }
    // })

    console.log('Push subscription received:', {
      endpoint: subscription.endpoint,
      keys: subscription.keys ? 'present' : 'missing'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully' 
    })

  } catch (error) {
    console.error('Error processing push subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }

    // Remove subscription from database
    // await db.subscription.deleteMany({
    //   where: {
    //     endpoint: endpoint,
    //     userId: getUserIdFromSession(),
    //   }
    // })

    console.log('Push subscription removed:', endpoint)

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully' 
    })

  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}