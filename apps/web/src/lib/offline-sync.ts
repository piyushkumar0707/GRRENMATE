// Offline Sync System for GreenMate
import { analytics } from './analytics'

// Interfaces for offline data
export interface SyncableData {
  id: string
  type: 'plant' | 'care_log' | 'photo' | 'note' | 'reminder' | 'post' | 'comment'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  userId?: string
  synced: boolean
  retryCount: number
  lastAttempt?: number
  priority: 'low' | 'normal' | 'high'
}

export interface OfflineState {
  isOnline: boolean
  lastSync: number
  pendingItems: number
  syncInProgress: boolean
}

// Configuration
const SYNC_CONFIG = {
  STORAGE_KEY: 'greenmate_offline_data',
  STATE_KEY: 'greenmate_offline_state',
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff
  BATCH_SIZE: 10, // Number of items to sync at once
  SYNC_INTERVAL: 30000, // 30 seconds
  MAX_STORAGE_SIZE: 50 * 1024 * 1024, // 50MB
}

export class OfflineSync {
  private static instance: OfflineSync
  private syncQueue: SyncableData[] = []
  private state: OfflineState = {
    isOnline: navigator.onLine,
    lastSync: 0,
    pendingItems: 0,
    syncInProgress: false
  }
  private syncTimer?: NodeJS.Timeout
  private listeners: Set<(state: OfflineState) => void> = new Set()

  private constructor() {
    this.loadFromStorage()
    this.setupNetworkListeners()
    this.startPeriodicSync()
  }

  static getInstance(): OfflineSync {
    if (!OfflineSync.instance) {
      OfflineSync.instance = new OfflineSync()
    }
    return OfflineSync.instance
  }

  // Public API
  addToQueue(item: Omit<SyncableData, 'timestamp' | 'synced' | 'retryCount' | 'priority'> & { priority?: 'low' | 'normal' | 'high' }): string {
    const syncItem: SyncableData = {
      ...item,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
      priority: item.priority || 'normal'
    }

    this.syncQueue.push(syncItem)
    this.updateState({ pendingItems: this.syncQueue.filter(i => !i.synced).length })
    this.saveToStorage()
    
    // Track analytics
    analytics.track({
      event: 'offline_data_queued',
      properties: {
        category: 'offline',
        dataType: item.type,
        action: item.action,
        priority: syncItem.priority
      }
    })

    // Trigger immediate sync if online
    if (this.state.isOnline && !this.state.syncInProgress) {
      this.syncAll()
    }

    return syncItem.id
  }

  async syncAll(): Promise<{ success: number; failed: number }> {
    if (!this.state.isOnline || this.state.syncInProgress) {
      return { success: 0, failed: 0 }
    }

    this.updateState({ syncInProgress: true })
    
    let successCount = 0
    let failedCount = 0

    try {
      // Get unsynced items sorted by priority and timestamp
      const unsynced = this.syncQueue
        .filter(item => !item.synced)
        .sort((a, b) => {
          // Sort by priority first (high -> normal -> low)
          const priorityOrder = { high: 3, normal: 2, low: 1 }
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }
          // Then by timestamp (oldest first)
          return a.timestamp - b.timestamp
        })

      // Process in batches
      for (let i = 0; i < unsynced.length; i += SYNC_CONFIG.BATCH_SIZE) {
        const batch = unsynced.slice(i, i + SYNC_CONFIG.BATCH_SIZE)
        
        const batchResults = await Promise.allSettled(
          batch.map(item => this.syncItem(item))
        )

        batchResults.forEach((result, index) => {
          const item = batch[index]
          if (result.status === 'fulfilled') {
            item.synced = true
            successCount++
          } else {
            item.retryCount++
            item.lastAttempt = Date.now()
            failedCount++
          }
        })

        // Save progress after each batch
        this.saveToStorage()
      }

      // Clean up old synced items
      this.cleanupSyncedItems()
      
      this.updateState({ 
        lastSync: Date.now(),
        pendingItems: this.syncQueue.filter(i => !i.synced).length
      })

      // Track sync completion
      analytics.track({
        event: 'offline_sync_completed',
        properties: {
          category: 'offline',
          successCount,
          failedCount,
          totalItems: successCount + failedCount
        }
      })

    } catch (error) {
      console.error('Sync batch failed:', error)
      analytics.trackError({
        message: 'Offline sync batch failed',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'medium'
      })
    } finally {
      this.updateState({ syncInProgress: false })
    }

    return { success: successCount, failed: failedCount }
  }

  private async syncItem(item: SyncableData): Promise<void> {
    const endpoint = this.getEndpointForItem(item)
    const method = this.getMethodForAction(item.action)

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: method !== 'DELETE' ? JSON.stringify({
        ...item.data,
        _offline_sync: true,
        _original_timestamp: item.timestamp
      }) : undefined
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private getEndpointForItem(item: SyncableData): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
    
    switch (item.type) {
      case 'plant':
        return item.action === 'create' 
          ? `${baseUrl}/plants`
          : `${baseUrl}/plants/${item.data.id}`
      case 'care_log':
        return item.action === 'create'
          ? `${baseUrl}/care-logs`
          : `${baseUrl}/care-logs/${item.data.id}`
      case 'photo':
        return item.action === 'create'
          ? `${baseUrl}/photos`
          : `${baseUrl}/photos/${item.data.id}`
      case 'note':
        return item.action === 'create'
          ? `${baseUrl}/notes`
          : `${baseUrl}/notes/${item.data.id}`
      case 'reminder':
        return item.action === 'create'
          ? `${baseUrl}/reminders`
          : `${baseUrl}/reminders/${item.data.id}`
      case 'post':
        return item.action === 'create'
          ? `${baseUrl}/posts`
          : `${baseUrl}/posts/${item.data.id}`
      case 'comment':
        return item.action === 'create'
          ? `${baseUrl}/comments`
          : `${baseUrl}/comments/${item.data.id}`
      default:
        throw new Error(`Unknown item type: ${item.type}`)
    }
  }

  private getMethodForAction(action: SyncableData['action']): string {
    switch (action) {
      case 'create': return 'POST'
      case 'update': return 'PUT'
      case 'delete': return 'DELETE'
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  private getAuthToken(): string {
    // Get auth token from your auth system
    return localStorage.getItem('auth_token') || ''
  }

  // Storage management
  private loadFromStorage(): void {
    try {
      const savedQueue = localStorage.getItem(SYNC_CONFIG.STORAGE_KEY)
      const savedState = localStorage.getItem(SYNC_CONFIG.STATE_KEY)
      
      if (savedQueue) {
        this.syncQueue = JSON.parse(savedQueue)
      }
      
      if (savedState) {
        this.state = { ...this.state, ...JSON.parse(savedState) }
      }
      
      this.updateState({ pendingItems: this.syncQueue.filter(i => !i.synced).length })
    } catch (error) {
      console.error('Failed to load offline sync data:', error)
    }
  }

  private saveToStorage(): void {
    try {
      // Check storage size before saving
      const queueSize = JSON.stringify(this.syncQueue).length
      if (queueSize > SYNC_CONFIG.MAX_STORAGE_SIZE) {
        this.cleanupSyncedItems(true) // Force cleanup
      }
      
      localStorage.setItem(SYNC_CONFIG.STORAGE_KEY, JSON.stringify(this.syncQueue))
      localStorage.setItem(SYNC_CONFIG.STATE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save offline sync data:', error)
      // If storage is full, clean up aggressively
      this.cleanupSyncedItems(true)
    }
  }

  private cleanupSyncedItems(force: boolean = false): void {
    const beforeCount = this.syncQueue.length
    
    if (force) {
      // Remove all synced items older than 1 hour
      const cutoff = Date.now() - (60 * 60 * 1000)
      this.syncQueue = this.syncQueue.filter(item => !item.synced || item.timestamp > cutoff)
    } else {
      // Remove synced items older than 24 hours
      const cutoff = Date.now() - (24 * 60 * 60 * 1000)
      this.syncQueue = this.syncQueue.filter(item => !item.synced || item.timestamp > cutoff)
    }
    
    // Remove failed items that have exceeded retry attempts
    this.syncQueue = this.syncQueue.filter(item => 
      item.synced || item.retryCount < SYNC_CONFIG.MAX_RETRY_ATTEMPTS
    )
    
    const afterCount = this.syncQueue.length
    if (beforeCount !== afterCount) {
      console.log(`Cleaned up ${beforeCount - afterCount} offline sync items`)
      this.saveToStorage()
    }
  }

  // Network state management
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.updateState({ isOnline: true })
      console.log('Network reconnected - starting sync')
      this.syncAll()
    })

    window.addEventListener('offline', () => {
      this.updateState({ isOnline: false })
      console.log('Network disconnected - entering offline mode')
    })
  }

  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      if (this.state.isOnline && !this.state.syncInProgress && this.state.pendingItems > 0) {
        this.syncAll()
      }
    }, SYNC_CONFIG.SYNC_INTERVAL)
  }

  private updateState(updates: Partial<OfflineState>): void {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state))
  }

  // Public state management
  getState(): OfflineState {
    return { ...this.state }
  }

  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Manual sync trigger
  forcSync(): Promise<{ success: number; failed: number }> {
    return this.syncAll()
  }

  // Get sync queue info
  getQueueInfo() {
    const unsynced = this.syncQueue.filter(i => !i.synced)
    const failed = unsynced.filter(i => i.retryCount > 0)
    
    return {
      total: this.syncQueue.length,
      unsynced: unsynced.length,
      failed: failed.length,
      synced: this.syncQueue.filter(i => i.synced).length,
      byType: unsynced.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  // Clear all data (useful for logout)
  clearAll(): void {
    this.syncQueue = []
    this.updateState({ pendingItems: 0, lastSync: 0 })
    localStorage.removeItem(SYNC_CONFIG.STORAGE_KEY)
    localStorage.removeItem(SYNC_CONFIG.STATE_KEY)
  }

  // Cleanup on app unload
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
    window.removeEventListener('online', () => {})
    window.removeEventListener('offline', () => {})
  }
}

// React hook for using offline sync
export function useOfflineSync() {
  const [state, setState] = React.useState<OfflineState>(
    OfflineSync.getInstance().getState()
  )

  React.useEffect(() => {
    const offlineSync = OfflineSync.getInstance()
    const unsubscribe = offlineSync.subscribe(setState)
    
    return unsubscribe
  }, [])

  const addToQueue = React.useCallback((item: Parameters<typeof OfflineSync.prototype.addToQueue>[0]) => {
    return OfflineSync.getInstance().addToQueue(item)
  }, [])

  const forceSync = React.useCallback(() => {
    return OfflineSync.getInstance().forcSync()
  }, [])

  const getQueueInfo = React.useCallback(() => {
    return OfflineSync.getInstance().getQueueInfo()
  }, [])

  return {
    state,
    addToQueue,
    forceSync,
    getQueueInfo,
    isOnline: state.isOnline,
    hasPendingItems: state.pendingItems > 0,
    isSyncing: state.syncInProgress
  }
}

// Utility functions for offline-first operations
export const offlineHelpers = {
  // Save plant care action offline-first
  async logCareAction(userPlantId: string, action: string, notes?: string, images?: string[]) {
    const data = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userPlantId,
      action,
      notes,
      images: images || [],
      createdAt: new Date().toISOString()
    }

    // Add to offline queue
    const syncId = OfflineSync.getInstance().addToQueue({
      id: data.id,
      type: 'care_log',
      action: 'create',
      data,
      priority: 'normal'
    })

    // Return optimistic response
    return { ...data, syncId, offline: true }
  },

  // Add plant offline-first
  async addPlant(plantData: any) {
    const data = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...plantData,
      createdAt: new Date().toISOString()
    }

    const syncId = OfflineSync.getInstance().addToQueue({
      id: data.id,
      type: 'plant',
      action: 'create',
      data,
      priority: 'high'
    })

    return { ...data, syncId, offline: true }
  },

  // Update plant notes offline-first
  async updatePlantNotes(plantId: string, notes: string) {
    const data = {
      id: plantId,
      notes,
      updatedAt: new Date().toISOString()
    }

    const syncId = OfflineSync.getInstance().addToQueue({
      id: `update_${plantId}_${Date.now()}`,
      type: 'plant',
      action: 'update',
      data,
      priority: 'normal'
    })

    return { syncId, offline: true }
  },

  // Add photo offline-first
  async addPhoto(userPlantId: string, photoUrl: string, caption?: string) {
    const data = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userPlantId,
      url: photoUrl,
      caption,
      createdAt: new Date().toISOString()
    }

    const syncId = OfflineSync.getInstance().addToQueue({
      id: data.id,
      type: 'photo',
      action: 'create',
      data,
      priority: 'normal'
    })

    return { ...data, syncId, offline: true }
  }
}

// Export singleton instance
export const offlineSync = OfflineSync.getInstance()

// Import React for the hook
import React from 'react'