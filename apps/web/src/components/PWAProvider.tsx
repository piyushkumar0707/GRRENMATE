// PWA Provider - Context provider for PWA functionality
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  PWAInstallPrompt, 
  AppUpdatePrompt, 
  NetworkStatusIndicator, 
  PushNotificationPrompt 
} from './PWAComponents'

interface PWAProviderState {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  updateAvailable: boolean
  pushSubscription: PushSubscription | null
}

interface PWAProviderActions {
  install: () => Promise<boolean>
  updateApp: () => Promise<void>
  subscribeToPush: () => Promise<PushSubscription | null>
}

const PWAContext = createContext<PWAProviderState & PWAProviderActions | null>(null)

export function usePWAContext() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWAContext must be used within PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
  showInstallPrompt?: boolean
  showUpdatePrompt?: boolean
  showNetworkStatus?: boolean
  showPushPrompt?: boolean
  vapidPublicKey?: string
}

export function PWAProvider({ 
  children, 
  showInstallPrompt = true,
  showUpdatePrompt = true,
  showNetworkStatus = true,
  showPushPrompt = true,
  vapidPublicKey
}: PWAProviderProps) {
  const [state, setState] = useState<PWAProviderState>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator?.onLine ?? true,
    updateAvailable: false,
    pushSubscription: null
  })

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Check if running as PWA
  useEffect(() => {
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setState(prev => ({ 
        ...prev, 
        isInstalled: isStandalone || isIOSStandalone 
      }))
    }

    checkPWAStatus()

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkPWAStatus)
    
    return () => mediaQuery.removeEventListener('change', checkPWAStatus)
  }, [])

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setState(prev => ({ ...prev, canInstall: true }))
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Register service worker and handle updates
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js')
          setRegistration(reg)

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, updateAvailable: true }))
                }
              })
            }
          })

          // Handle controlled page updates
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload()
          })

        } catch (error) {
          console.error('Service worker registration failed:', error)
        }
      }
    }

    registerServiceWorker()
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Get existing push subscription
  useEffect(() => {
    const getPushSubscription = async () => {
      if (registration) {
        try {
          const subscription = await registration.pushManager.getSubscription()
          setState(prev => ({ ...prev, pushSubscription: subscription }))
        } catch (error) {
          console.error('Failed to get push subscription:', error)
        }
      }
    }

    getPushSubscription()
  }, [registration])

  // PWA Actions
  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      const result = await deferredPrompt.prompt()
      const { outcome } = await result.userChoice
      
      setDeferredPrompt(null)
      setState(prev => ({ ...prev, canInstall: false }))
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }

  const updateApp = async (): Promise<void> => {
    if (!registration || !registration.waiting) {
      return
    }

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    setState(prev => ({ ...prev, updateAvailable: false }))
  }

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!registration || !vapidPublicKey) {
      throw new Error('Service worker or VAPID key not available')
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })

      setState(prev => ({ ...prev, pushSubscription: subscription }))

      // Send subscription to server (you'll need to implement this endpoint)
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      })

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      throw error
    }
  }

  const contextValue = {
    ...state,
    install,
    updateApp,
    subscribeToPush
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      
      {/* PWA UI Components */}
      {showInstallPrompt && <PWAInstallPrompt />}
      {showUpdatePrompt && <AppUpdatePrompt />}
      {showNetworkStatus && <NetworkStatusIndicator />}
      {showPushPrompt && <PushNotificationPrompt />}
    </PWAContext.Provider>
  )
}

// Hook for accessing PWA context
export function usePWA() {
  return usePWAContext()
}

// PWA Layout Component - wraps your app layout
interface PWALayoutProps {
  children: ReactNode
  vapidPublicKey?: string
  enableInstallPrompt?: boolean
  enableUpdatePrompt?: boolean
  enableNetworkStatus?: boolean
  enablePushPrompt?: boolean
}

export function PWALayout({
  children,
  vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  enableInstallPrompt = true,
  enableUpdatePrompt = true,
  enableNetworkStatus = true,
  enablePushPrompt = true
}: PWALayoutProps) {
  return (
    <PWAProvider
      vapidPublicKey={vapidPublicKey}
      showInstallPrompt={enableInstallPrompt}
      showUpdatePrompt={enableUpdatePrompt}
      showNetworkStatus={enableNetworkStatus}
      showPushPrompt={enablePushPrompt}
    >
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </PWAProvider>
  )
}

// PWA Status Hook - provides detailed PWA status information
export function usePWAStatus() {
  const context = usePWAContext()
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'installing' | 'installed' | 'activated' | 'redundant' | 'none'>('none')
  const [cacheStatus, setCacheStatus] = useState<'available' | 'unavailable'>('unavailable')

  useEffect(() => {
    // Check service worker status
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setServiceWorkerStatus('activated')
      
      navigator.serviceWorker.ready.then(() => {
        setCacheStatus('available')
      })
    }
  }, [])

  return {
    ...context,
    serviceWorkerStatus,
    cacheStatus,
    features: {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      webShare: 'share' in navigator,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      fullscreen: 'requestFullscreen' in document.documentElement,
      wakeLock: 'wakeLock' in navigator
    }
  }
}

// PWA Analytics Hook - tracks PWA usage
export function usePWAAnalytics() {
  const { isInstalled, isOnline } = usePWAContext()

  useEffect(() => {
    // Track PWA installation
    if (isInstalled) {
      // Send analytics event for PWA usage
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_usage', {
          event_category: 'PWA',
          event_label: 'installed',
          value: 1
        })
      }
    }
  }, [isInstalled])

  useEffect(() => {
    // Track online/offline status
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'network_status', {
        event_category: 'PWA',
        event_label: isOnline ? 'online' : 'offline',
        value: isOnline ? 1 : 0
      })
    }
  }, [isOnline])

  return {
    trackInstallPromptShown: () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'install_prompt_shown', {
          event_category: 'PWA',
          event_label: 'prompt_displayed'
        })
      }
    },
    trackInstallPromptAccepted: () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'install_prompt_accepted', {
          event_category: 'PWA',
          event_label: 'user_installed'
        })
      }
    },
    trackInstallPromptDismissed: () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'install_prompt_dismissed', {
          event_category: 'PWA',
          event_label: 'user_dismissed'
        })
      }
    },
    trackOfflineUsage: (feature: string) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'offline_usage', {
          event_category: 'PWA',
          event_label: feature,
          value: 1
        })
      }
    }
  }
}