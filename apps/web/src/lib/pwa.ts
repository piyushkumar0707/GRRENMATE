// PWA Utilities and Service Worker Management
'use client'

import { useEffect, useState } from 'react'

// PWA Installation and Service Worker Management
export class PWAManager {
  private static instance: PWAManager
  private registration: ServiceWorkerRegistration | null = null
  private installPrompt: BeforeInstallPromptEvent | null = null

  private constructor() {}

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  // Initialize PWA features
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service workers not supported')
      return
    }

    try {
      // Register service worker
      await this.registerServiceWorker()
      
      // Setup install prompt handler
      this.setupInstallPrompt()
      
      // Setup push notifications
      this.setupPushNotifications()
      
      // Setup background sync
      this.setupBackgroundSync()

      console.log('PWA initialized successfully')
    } catch (error) {
      console.error('PWA initialization failed:', error)
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service worker registered:', this.registration.scope)

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                this.showUpdateAvailableNotification()
              } else {
                // App is ready for offline use
                this.showOfflineReadyNotification()
              }
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event)
      })

    } catch (error) {
      console.error('Service worker registration failed:', error)
      throw error
    }
  }

  // Setup install prompt
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      this.installPrompt = event as BeforeInstallPromptEvent
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-install-available'))
    })

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully')
      this.installPrompt = null
      
      // Track installation
      this.trackEvent('pwa_installed')
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'))
    })
  }

  // Check if app can be installed
  canInstall(): boolean {
    return this.installPrompt !== null
  }

  // Trigger install prompt
  async install(): Promise<boolean> {
    if (!this.installPrompt) {
      return false
    }

    try {
      this.installPrompt.prompt()
      const choiceResult = await this.installPrompt.userChoice
      
      this.trackEvent('pwa_install_prompt', {
        outcome: choiceResult.outcome
      })

      if (choiceResult.outcome === 'accepted') {
        this.installPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('Install prompt failed:', error)
      return false
    }
  }

  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://')
  }

  // Setup push notifications
  private setupPushNotifications(): void {
    if (!('PushManager' in window)) {
      console.log('Push notifications not supported')
      return
    }

    // Listen for permission changes
    navigator.permissions?.query({ name: 'notifications' }).then((result) => {
      console.log('Notification permission:', result.state)
      
      result.addEventListener('change', () => {
        console.log('Notification permission changed:', result.state)
      })
    })
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    
    this.trackEvent('notification_permission_requested', {
      result: permission
    })

    return permission
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered')
    }

    try {
      const permission = await this.requestNotificationPermission()
      if (permission !== 'granted') {
        return null
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVapidPublicKey()
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      this.trackEvent('push_subscription_created')
      
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Get VAPID public key (should be from environment)
  private getVapidPublicKey(): string {
    // In production, this should come from environment variables
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY'
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  // Setup background sync
  private setupBackgroundSync(): void {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('Background sync not supported')
      return
    }

    // Background sync will be triggered by the service worker
    console.log('Background sync is available')
  }

  // Schedule background sync
  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered')
    }

    try {
      await this.registration.sync.register(tag)
      console.log('Background sync scheduled:', tag)
    } catch (error) {
      console.error('Background sync scheduling failed:', error)
    }
  }

  // Update service worker
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      return
    }

    try {
      await this.registration.update()
      
      if (this.registration.waiting) {
        // Tell the waiting service worker to skip waiting
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (error) {
      console.error('Service worker update failed:', error)
    }
  }

  // Handle service worker messages
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data || {}
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload)
        break
      case 'SYNC_COMPLETED':
        console.log('Background sync completed:', payload)
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('pwa-sync-completed', { detail: payload }))
        break
      default:
        console.log('Unknown service worker message:', type)
    }
  }

  // Show update available notification
  private showUpdateAvailableNotification(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('pwa-update-available'))
  }

  // Show offline ready notification
  private showOfflineReadyNotification(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('pwa-offline-ready'))
  }

  // Track analytics event
  private trackEvent(eventName: string, properties?: Record<string, any>): void {
    // Integration with analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties)
    }
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track(eventName, properties)
    }
  }

  // Get network status
  getNetworkStatus(): { online: boolean; effectiveType?: string } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType
    }
  }

  // Cache specific URLs
  async cacheUrls(urls: string[]): Promise<void> {
    if (!this.registration || !this.registration.active) {
      return
    }

    this.registration.active.postMessage({
      type: 'CACHE_URLS',
      payload: { urls }
    })
  }

  // Clear specific cache
  async clearCache(cacheName: string): Promise<void> {
    if (!this.registration || !this.registration.active) {
      return
    }

    this.registration.active.postMessage({
      type: 'CLEAR_CACHE',
      payload: { cacheName }
    })
  }
}

// React hooks for PWA functionality
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const pwa = PWAManager.getInstance()
    
    // Initialize PWA
    pwa.initialize()

    // Check installation status
    setIsInstalled(pwa.isInstalled())
    setCanInstall(pwa.canInstall())

    // Setup event listeners
    const handleInstallAvailable = () => setCanInstall(true)
    const handleInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }
    const handleUpdateAvailable = () => setUpdateAvailable(true)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-installed', handleInstalled)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const install = async (): Promise<boolean> => {
    const pwa = PWAManager.getInstance()
    return await pwa.install()
  }

  const updateApp = async (): Promise<void> => {
    const pwa = PWAManager.getInstance()
    await pwa.updateServiceWorker()
    setUpdateAvailable(false)
    // Reload page after update
    window.location.reload()
  }

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    const pwa = PWAManager.getInstance()
    return await pwa.subscribeToPush()
  }

  return {
    isInstalled,
    canInstall,
    isOnline,
    updateAvailable,
    install,
    updateApp,
    subscribeToPush
  }
}

// Hook for offline storage
export function useOfflineStorage() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('indexedDB' in window)
  }, [])

  const saveOfflineData = async (key: string, data: any): Promise<void> => {
    if (!isSupported) return

    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['offline-data'], 'readwrite')
      const store = transaction.objectStore('offline-data')
      
      await store.put({ key, data, timestamp: Date.now() })
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  }

  const getOfflineData = async (key: string): Promise<any> => {
    if (!isSupported) return null

    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['offline-data'], 'readonly')
      const store = transaction.objectStore('offline-data')
      
      const result = await store.get(key)
      return result?.data || null
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return null
    }
  }

  const clearOfflineData = async (): Promise<void> => {
    if (!isSupported) return

    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['offline-data'], 'readwrite')
      const store = transaction.objectStore('offline-data')
      
      await store.clear()
    } catch (error) {
      console.error('Failed to clear offline data:', error)
    }
  }

  return {
    isSupported,
    saveOfflineData,
    getOfflineData,
    clearOfflineData
  }
}

// Open IndexedDB for offline storage
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('greenmate-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = () => {
      const db = request.result
      
      if (!db.objectStoreNames.contains('offline-data')) {
        db.createObjectStore('offline-data', { keyPath: 'key' })
      }
    }
  })
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }
    }

    // Initial status
    updateOnlineStatus()
    updateNetworkInfo()

    // Event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return { isOnline, networkInfo }
}

// Extended BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}