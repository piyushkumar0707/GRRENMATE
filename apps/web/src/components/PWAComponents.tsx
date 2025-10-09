// PWA UI Components
'use client'

import { useState, useEffect } from 'react'
import { usePWA, useNetworkStatus } from '@/lib/pwa'
import { 
  Download, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  X, 
  Bell, 
  BellOff,
  Smartphone,
  Monitor,
  AlertTriangle
} from 'lucide-react'

// PWA Install Prompt Component
export function PWAInstallPrompt() {
  const { canInstall, install, isInstalled } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Show install prompt after a delay if not installed and can install
    if (!isInstalled && canInstall) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000) // Show after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const success = await install()
      if (success) {
        setIsVisible(false)
      }
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, can't install, dismissed, or not visible
  if (isInstalled || !canInstall || !isVisible) {
    return null
  }

  // Check if previously dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Smartphone className="h-5 w-5 text-green-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Install GreenMate
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Get the full app experience with offline access and notifications.
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                {isInstalling ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isInstalling ? 'Installing...' : 'Install'}</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// App Update Available Component
export function AppUpdatePrompt() {
  const { updateAvailable, updateApp } = usePWA()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateApp()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  if (!updateAvailable || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-900">
              Update Available
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              A new version of GreenMate is ready to install.
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-blue-600 hover:text-blue-800 px-3 py-1.5 text-sm font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Network Status Indicator
export function NetworkStatusIndicator() {
  const { isOnline, networkInfo } = useNetworkStatus()
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true)
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  // Don't show anything if online and no offline message to show
  if (isOnline && !showOfflineMessage) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className="flex items-center space-x-2 text-sm font-medium">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Back online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You're offline</span>
            </>
          )}
          
          {networkInfo?.effectiveType && (
            <span className="text-xs opacity-75">
              ({networkInfo.effectiveType})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Push Notification Prompt
export function PushNotificationPrompt() {
  const { subscribeToPush } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Show prompt if permission is default and user has been active
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10000) // Show after 10 seconds
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubscribe = async () => {
    setIsSubscribing(true)
    try {
      const subscription = await subscribeToPush()
      if (subscription) {
        setPermission('granted')
        setIsVisible(false)
      }
    } catch (error) {
      console.error('Push subscription failed:', error)
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('push-notification-dismissed', 'true')
  }

  // Don't show if already granted/denied, dismissed, or not visible
  if (permission !== 'default' || !isVisible) {
    return null
  }

  // Check if previously dismissed
  if (localStorage.getItem('push-notification-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <Bell className="h-5 w-5 text-yellow-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Get notified about plant care reminders and community updates.
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                {isSubscribing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                <span>{isSubscribing ? 'Enabling...' : 'Allow'}</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 px-3 py-1.5 text-sm font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// PWA Status Bar (shows PWA-related information)
export function PWAStatusBar() {
  const { isInstalled, canInstall, isOnline } = usePWA()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isInstalled && !canInstall) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isInstalled ? (
                <Monitor className="h-4 w-4 text-green-400" />
              ) : (
                <Smartphone className="h-4 w-4 text-blue-400" />
              )}
              
              <span className="text-sm">
                {isInstalled ? 'PWA Mode' : 'Web Mode'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              
              <span className="text-sm">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? 'Hide' : 'Info'}
          </button>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-700 py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-gray-400">Status</div>
                <div className="font-medium">
                  {isInstalled ? 'Installed' : 'Web App'}
                </div>
              </div>
              
              <div>
                <div className="text-gray-400">Connection</div>
                <div className="font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              
              <div>
                <div className="text-gray-400">Cache</div>
                <div className="font-medium">Active</div>
              </div>
              
              <div>
                <div className="text-gray-400">Notifications</div>
                <div className="font-medium">
                  {Notification.permission === 'granted' ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Offline Fallback Page Component
export function OfflineFallback({ 
  title = "You're offline", 
  message = "Please check your internet connection and try again.",
  showRetry = true 
}: {
  title?: string
  message?: string
  showRetry?: boolean
}) {
  const { isOnline } = useNetworkStatus()
  
  const handleRetry = () => {
    if (isOnline) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500">
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {showRetry && (
            <button
              onClick={handleRetry}
              disabled={!isOnline}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {isOnline ? 'Try Again' : 'Waiting for connection...'}
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Some features may be available offline. 
              <br />
              Your data will sync when you're back online.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// PWA Feature Detection Component
export function PWAFeatureSupport() {
  const [features, setFeatures] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setFeatures({
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      webShare: 'share' in navigator,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      fullscreen: 'requestFullscreen' in document.documentElement,
      orientation: 'orientation' in screen,
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      indexedDB: 'indexedDB' in window,
      webLocks: 'locks' in navigator,
      wakeLock: 'wakeLock' in navigator
    })
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        PWA Feature Support
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(features).map(([feature, supported]) => (
          <div key={feature} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700 capitalize">
              {feature.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            
            <div className={`w-2 h-2 rounded-full ${
              supported ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        ))}
      </div>
    </div>
  )
}