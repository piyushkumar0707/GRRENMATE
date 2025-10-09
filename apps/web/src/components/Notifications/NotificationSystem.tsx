// Integrated Notification System Component
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRealtimeNotifications } from '@/lib/socket-client'
import { usePWA } from '@/components/PWAProvider'
import {
  Bell,
  BellOff,
  X,
  Check,
  CheckCheck,
  Clock,
  Users,
  MessageCircle,
  Heart,
  Star,
  Award,
  Droplets,
  Zap,
  Camera,
  Settings,
  Filter,
  MoreVertical,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Notification {
  id: string
  type: 'plant_care' | 'social' | 'achievement' | 'system' | 'collaboration' | 'live_session' | 'community'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: {
    userId?: string
    plantId?: string
    sessionId?: string
    activityId?: string
    imageUrl?: string
    actionUrl?: string
  }
  deliveryMethod?: 'realtime' | 'push' | 'both'
}

interface NotificationSystemProps {
  currentUser: {
    id: string
    username: string
    avatar?: string
  }
}

export default function NotificationSystem({ currentUser }: NotificationSystemProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([])
  const [notificationSettings, setNotificationSettings] = useState({
    realtime: true,
    push: true,
    sound: true,
    vibration: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  })

  const { 
    notifications: realtimeNotifications, 
    sendNotification, 
    markAsRead, 
    clearNotifications,
    unreadCount 
  } = useRealtimeNotifications()

  const { pushSubscription, subscribeToPush } = usePWA()

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'plant_care',
        title: '🌱 Plant Care Reminder',
        message: 'Your Fiddle Leaf Fig needs water today!',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        actionable: true,
        priority: 'high',
        metadata: {
          plantId: 'plant1',
          actionUrl: '/plants/plant1'
        }
      },
      {
        id: '2',
        type: 'social',
        title: '❤️ New Like',
        message: 'PlantLover liked your post about watering techniques',
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        read: false,
        priority: 'low',
        metadata: {
          userId: 'user2',
          activityId: 'activity1'
        }
      },
      {
        id: '3',
        type: 'achievement',
        title: '🏆 Achievement Unlocked',
        message: 'Congratulations! You\'ve earned the "Green Thumb" badge!',
        timestamp: new Date(Date.now() - 24 * 60 * 60000),
        read: true,
        priority: 'medium',
        metadata: {
          imageUrl: '/badges/green-thumb.png'
        }
      }
    ]

    setLocalNotifications(mockNotifications)
  }, [])

  // Combine realtime and local notifications
  const allNotifications = [
    ...realtimeNotifications.map(n => ({
      id: n.id || `realtime_${Date.now()}`,
      type: n.type as Notification['type'],
      title: n.title,
      message: n.message,
      timestamp: new Date(n.timestamp),
      read: n.read || false,
      priority: 'medium' as const,
      deliveryMethod: 'realtime' as const
    })),
    ...localNotifications
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const filteredNotifications = allNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'important') return ['high', 'urgent'].includes(notification.priority)
    return true
  })

  const totalUnreadCount = allNotifications.filter(n => !n.read).length

  // Handle push notification permission
  const handleEnablePushNotifications = async () => {
    try {
      if (!pushSubscription) {
        await subscribeToPush()
        setNotificationSettings(prev => ({ ...prev, push: true }))
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error)
    }
  }

  // Send test notification
  const sendTestNotification = async () => {
    const testNotification = {
      id: `test_${Date.now()}`,
      type: 'system' as const,
      title: '🧪 Test Notification',
      message: 'This is a test notification from GreenMate!',
      timestamp: new Date(),
      read: false,
      priority: 'low' as const
    }

    setLocalNotifications(prev => [testNotification, ...prev])

    // Also send as PWA notification if enabled
    if (notificationSettings.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(testNotification.title, {
        body: testNotification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'test-notification'
      })
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
    clearNotifications()
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-600' : 
                      priority === 'high' ? 'text-orange-600' : 
                      priority === 'medium' ? 'text-blue-600' : 'text-gray-600'

    switch (type) {
      case 'plant_care': return <Droplets className={`w-4 h-4 ${iconClass}`} />
      case 'social': return <Heart className={`w-4 h-4 ${iconClass}`} />
      case 'achievement': return <Award className={`w-4 h-4 ${iconClass}`} />
      case 'collaboration': return <Users className={`w-4 h-4 ${iconClass}`} />
      case 'live_session': return <Camera className={`w-4 h-4 ${iconClass}`} />
      case 'community': return <MessageCircle className={`w-4 h-4 ${iconClass}`} />
      case 'system': return <Settings className={`w-4 h-4 ${iconClass}`} />
      default: return <Bell className={`w-4 h-4 ${iconClass}`} />
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        
        {totalUnreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={sendTestNotification}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                >
                  Test
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {(['all', 'unread', 'important'] as const).map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`flex-1 px-3 py-1 text-sm font-medium rounded transition-colors ${
                    filter === filterType
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'unread' && totalUnreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getNotificationIcon={getNotificationIcon}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="mb-2">No notifications</p>
                <p className="text-sm">You're all caught up! 🎉</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
                
                <NotificationSettings
                  settings={notificationSettings}
                  onSettingsChange={setNotificationSettings}
                  onEnablePush={handleEnablePushNotifications}
                  pushEnabled={!!pushSubscription}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Individual Notification Item Component
function NotificationItem({
  notification,
  onMarkAsRead,
  formatTimeAgo,
  getNotificationIcon
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  formatTimeAgo: (date: Date) => string
  getNotificationIcon: (type: string, priority: string) => React.ReactNode
}) {
  const [showActions, setShowActions] = useState(false)

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    // Navigate to action URL if available
    if (notification.metadata?.actionUrl) {
      // In a real app, use router.push() or window.location
      console.log('Navigate to:', notification.metadata.actionUrl)
    }
  }

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.read ? 'text-gray-900' : 'text-gray-900'
              }`}>
                {notification.title}
              </p>
              <p className={`text-sm mt-1 ${
                notification.read ? 'text-gray-600' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>
              
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span>{formatTimeAgo(notification.timestamp)}</span>
                
                {notification.deliveryMethod && (
                  <span className="flex items-center space-x-1">
                    {notification.deliveryMethod === 'push' && <Smartphone className="w-3 h-3" />}
                    {notification.deliveryMethod === 'realtime' && <Monitor className="w-3 h-3" />}
                    <span className="capitalize">{notification.deliveryMethod}</span>
                  </span>
                )}
                
                {notification.priority === 'urgent' && (
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Urgent
                  </span>
                )}
                
                {notification.priority === 'high' && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    High
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {showActions && !notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead(notification.id)
                }}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
        )}
      </div>

      {/* Action buttons for actionable notifications */}
      {notification.actionable && !notification.read && (
        <div className="mt-3 flex space-x-2">
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
            Take Action
          </button>
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium hover:bg-gray-300">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

// Notification Settings Component
function NotificationSettings({
  settings,
  onSettingsChange,
  onEnablePush,
  pushEnabled
}: {
  settings: any
  onSettingsChange: (settings: any) => void
  onEnablePush: () => void
  pushEnabled: boolean
}) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded"
      >
        <Settings className="w-4 h-4" />
      </button>

      {showSettings && (
        <div className="absolute right-0 bottom-8 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-60">
          <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Real-time notifications</span>
              <button
                onClick={() => onSettingsChange({ ...settings, realtime: !settings.realtime })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.realtime ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.realtime ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Push notifications</span>
              <div className="flex items-center space-x-2">
                {!pushEnabled && (
                  <button
                    onClick={onEnablePush}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Enable
                  </button>
                )}
                <button
                  onClick={() => onSettingsChange({ ...settings, push: !settings.push })}
                  disabled={!pushEnabled}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    settings.push && pushEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    settings.push && pushEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 flex items-center space-x-1">
                <Volume2 className="w-3 h-3" />
                <span>Sound</span>
              </span>
              <button
                onClick={() => onSettingsChange({ ...settings, sound: !settings.sound })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.sound ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.sound ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Vibration</span>
              <button
                onClick={() => onSettingsChange({ ...settings, vibration: !settings.vibration })}
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.vibration ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.vibration ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Notification Toast Component (for real-time notifications)
export function NotificationToast({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification
  onDismiss: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000) // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-in">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {notification.type === 'plant_care' && <Droplets className="w-5 h-5 text-blue-600" />}
          {notification.type === 'social' && <Heart className="w-5 h-5 text-red-600" />}
          {notification.type === 'achievement' && <Award className="w-5 h-5 text-yellow-600" />}
          {notification.type === 'system' && <Info className="w-5 h-5 text-gray-600" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>

        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Notification Provider Component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([])
  const { notifications } = useRealtimeNotifications()

  // Show toast for new real-time notifications
  useEffect(() => {
    const latestNotification = notifications[0]
    if (latestNotification && !latestNotification.read) {
      const toast: Notification = {
        id: `toast_${Date.now()}`,
        type: latestNotification.type as Notification['type'],
        title: latestNotification.title,
        message: latestNotification.message,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      }
      
      setToastNotifications(prev => [toast, ...prev.slice(0, 2)]) // Limit to 3 toasts
    }
  }, [notifications])

  const dismissToast = (toastId: string) => {
    setToastNotifications(prev => prev.filter(t => t.id !== toastId))
  }

  return (
    <>
      {children}
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toastNotifications.map(toast => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </>
  )
}