'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Notification {
  id: string
  type: 'CARE_REMINDER' | 'WEATHER_ALERT' | 'DISEASE_ALERT' | 'COMMUNITY_UPDATE' | 'MARKETPLACE_UPDATE'
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isRead: boolean
  createdAt: string
  data?: Record<string, any>
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const notificationTypes = [
    { key: 'all', label: 'All Notifications', icon: '🔔' },
    { key: 'CARE_REMINDER', label: 'Care Reminders', icon: '🌱' },
    { key: 'WEATHER_ALERT', label: 'Weather Alerts', icon: '🌤️' },
    { key: 'DISEASE_ALERT', label: 'Disease Alerts', icon: '⚠️' },
    { key: 'COMMUNITY_UPDATE', label: 'Community', icon: '💬' },
    { key: 'MARKETPLACE_UPDATE', label: 'Marketplace', icon: '🛍️' }
  ]

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('type', filter)

      const response = await fetch(`http://localhost:3001/api/notifications?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/unread-count')
      const data = await response.json()
      
      if (data.success) {
        setUnreadCount(data.data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        )
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const testCareReminder = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/test/care-reminder', {
        method: 'POST'
      })
      if (response.ok) {
        fetchNotifications()
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Error testing care reminder:', error)
    }
  }

  const testWeatherAlert = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/test/weather-alert', {
        method: 'POST'
      })
      if (response.ok) {
        fetchNotifications()
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Error testing weather alert:', error)
    }
  }

  const testDiseaseAlert = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/test/disease-alert', {
        method: 'POST'
      })
      if (response.ok) {
        fetchNotifications()
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Error testing disease alert:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [filter])

  const getNotificationIcon = (type: string) => {
    const icons = {
      'CARE_REMINDER': '🌱',
      'WEATHER_ALERT': '🌤️',
      'DISEASE_ALERT': '⚠️',
      'COMMUNITY_UPDATE': '💬',
      'MARKETPLACE_UPDATE': '🛍️'
    }
    return icons[type as keyof typeof icons] || '🔔'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'bg-blue-100 text-blue-800 border-blue-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'HIGH': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔔 Notifications
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Stay updated with care reminders, weather alerts, community updates, and more.
          </p>
          {unreadCount > 0 && (
            <div className="mt-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Filter Types */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Filter Types
              </h3>
              <div className="space-y-2">
                {notificationTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setFilter(type.key)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      filter === type.key
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Test Notifications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🧪 Test Notifications
              </h3>
              <div className="space-y-3">
                <button
                  onClick={testCareReminder}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span>🌱</span>
                  <span>Care Reminder</span>
                </button>
                <button
                  onClick={testWeatherAlert}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>🌤️</span>
                  <span>Weather Alert</span>
                </button>
                <button
                  onClick={testDiseaseAlert}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <span>⚠️</span>
                  <span>Disease Alert</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-gray-500 text-lg">No notifications found</p>
                <p className="text-gray-400">You're all caught up! Check back later for updates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl shadow-xl p-6 border-l-4 ${
                      !notification.isRead 
                        ? 'border-blue-500 bg-blue-50/30' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-3xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            {!notification.isRead && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                NEW
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}