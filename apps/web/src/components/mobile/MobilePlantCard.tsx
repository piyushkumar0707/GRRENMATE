// Mobile Plant Card Component with Offline Sync Support
import React, { useState } from 'react'
import { useSwipeGesture } from '@/lib/mobile-gestures'
import { useOfflineSync, offlineHelpers } from '@/lib/offline-sync'
import { useTranslation } from '@/lib/i18n'
import { analytics } from '@/lib/analytics'

interface Plant {
  id: string
  name: string
  species?: string
  image?: string
  lastWatered?: string
  nextWateringDate?: string
  healthScore?: number
  isOffline?: boolean
  syncId?: string
}

interface MobilePlantCardProps {
  plant: Plant
  onTap?: (plant: Plant) => void
  onSwipeLeft?: (plant: Plant) => void
  onSwipeRight?: (plant: Plant) => void
  onLongPress?: (plant: Plant) => void
}

export const MobilePlantCard: React.FC<MobilePlantCardProps> = ({
  plant,
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onLongPress
}) => {
  const { t } = useTranslation()
  const { isOnline, hasPendingItems } = useOfflineSync()
  const [isLoading, setIsLoading] = useState(false)
  
  // Set up gesture handling
  const { swipeHandlers, dragHandlers } = useSwipeGesture({
    onSwipeLeft: onSwipeLeft ? () => onSwipeLeft(plant) : undefined,
    onSwipeRight: onSwipeRight ? () => onSwipeRight(plant) : undefined,
    onTap: onTap ? () => onTap(plant) : undefined,
    onLongPress: onLongPress ? () => onLongPress(plant) : undefined,
    threshold: 50,
    velocityThreshold: 0.3
  })

  const handleQuickWater = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

    try {
      // Log care action using offline-first helper
      const result = await offlineHelpers.logCareAction(
        plant.id,
        'water',
        'Quick watered from mobile card'
      )

      // Track analytics
      analytics.track({
        event: 'plant_quick_watered',
        properties: {
          category: 'plant_care',
          plantId: plant.id,
          offline: result.offline,
          source: 'mobile_card'
        }
      })

      console.log('Water logged:', result)
    } catch (error) {
      console.error('Failed to log watering:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPhoto = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Trigger camera/photo picker
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use rear camera on mobile
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsLoading(true)
        try {
          // Convert to base64 or upload to temp storage
          const photoUrl = URL.createObjectURL(file)
          
          const result = await offlineHelpers.addPhoto(
            plant.id,
            photoUrl,
            `Photo taken on ${new Date().toLocaleDateString()}`
          )

          analytics.track({
            event: 'plant_photo_added',
            properties: {
              category: 'plant_care',
              plantId: plant.id,
              offline: result.offline,
              source: 'mobile_card'
            }
          })

          console.log('Photo added:', result)
        } catch (error) {
          console.error('Failed to add photo:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    input.click()
  }

  const getHealthColor = (score?: number) => {
    if (!score) return '#9ca3af'
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getWateringStatus = () => {
    if (!plant.nextWateringDate) return null
    
    const nextDate = new Date(plant.nextWateringDate)
    const today = new Date()
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return { text: t('plant.overdue'), color: '#ef4444' }
    if (diffDays === 0) return { text: t('plant.due_today'), color: '#f59e0b' }
    if (diffDays <= 2) return { text: t('plant.due_soon'), color: '#059669' }
    return { text: `${diffDays} ${t('plant.days_until')}`, color: '#6b7280' }
  }

  const wateringStatus = getWateringStatus()

  return (
    <div
      className={`mobile-card relative overflow-hidden transition-transform duration-200 ${
        plant.isOffline ? 'border-l-4 border-orange-500' : ''
      }`}
      {...swipeHandlers}
      {...dragHandlers}
    >
      {/* Offline indicator */}
      {plant.isOffline && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          {t('common.offline')}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="flex gap-3">
        {/* Plant image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {plant.image ? (
            <img 
              src={plant.image} 
              alt={plant.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Plant info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate text-base">
                {plant.name}
              </h3>
              {plant.species && (
                <p className="text-sm text-gray-600 truncate">
                  {plant.species}
                </p>
              )}
            </div>

            {/* Health score */}
            {plant.healthScore !== undefined && (
              <div className="flex items-center gap-1 ml-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getHealthColor(plant.healthScore) }}
                />
                <span className="text-xs font-medium" style={{ color: getHealthColor(plant.healthScore) }}>
                  {plant.healthScore}%
                </span>
              </div>
            )}
          </div>

          {/* Watering status */}
          {wateringStatus && (
            <div className="mt-2">
              <span 
                className="text-sm font-medium"
                style={{ color: wateringStatus.color }}
              >
                {wateringStatus.text}
              </span>
            </div>
          )}

          {/* Last watered */}
          {plant.lastWatered && (
            <p className="text-xs text-gray-500 mt-1">
              {t('plant.last_watered')}: {new Date(plant.lastWatered).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3 -mb-2">
        <button
          onClick={handleQuickWater}
          disabled={isLoading}
          className="touch-button bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm flex-1 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          {t('plant.water')}
        </button>
        
        <button
          onClick={handleAddPhoto}
          disabled={isLoading}
          className="touch-button bg-green-50 text-green-700 hover:bg-green-100 text-sm flex-1 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          {t('plant.photo')}
        </button>
      </div>

      {/* Swipe hints */}
      <div className="swipe-hint absolute inset-0 pointer-events-none" />
    </div>
  )
}

// Mobile Plant List Component
interface MobilePlantListProps {
  plants: Plant[]
  loading?: boolean
  onRefresh?: () => Promise<void>
  onPlantSelect?: (plant: Plant) => void
  onPlantEdit?: (plant: Plant) => void
  onPlantDelete?: (plant: Plant) => void
}

export const MobilePlantList: React.FC<MobilePlantListProps> = ({
  plants,
  loading = false,
  onRefresh,
  onPlantSelect,
  onPlantEdit,
  onPlantDelete
}) => {
  const { t } = useTranslation()
  const { isOnline, hasPendingItems, isSyncing } = useOfflineSync()

  // Pull-to-refresh handling
  const { pullToRefreshHandlers } = useSwipeGesture({
    onPullRefresh: onRefresh,
    pullRefreshThreshold: 80
  })

  if (loading && plants.length === 0) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mobile-card">
            <div className="flex gap-3">
              <div className="w-16 h-16 mobile-skeleton rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="mobile-skeleton-text w-3/4" />
                <div className="mobile-skeleton-text w-1/2" />
                <div className="mobile-skeleton-text w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (plants.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('plant.no_plants')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('plant.add_first_plant')}
        </p>
      </div>
    )
  }

  return (
    <div {...pullToRefreshHandlers} className="relative">
      {/* Pull-to-refresh indicator */}
      <div className={`pull-refresh-indicator ${isSyncing ? 'pull-refresh-active' : ''}`}>
        <svg className="pull-refresh-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Sync status */}
      {(hasPendingItems || !isOnline) && (
        <div className="mobile-toast mb-4" style={{ position: 'relative', top: 'auto' }}>
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm">
            {!isOnline ? t('common.offline_mode') : t('common.syncing_changes')}
          </span>
        </div>
      )}

      {/* Plant cards */}
      <div className="space-y-3 p-4">
        {plants.map(plant => (
          <MobilePlantCard
            key={plant.id}
            plant={plant}
            onTap={onPlantSelect}
            onSwipeLeft={onPlantDelete}
            onSwipeRight={onPlantEdit}
            onLongPress={onPlantEdit}
          />
        ))}
      </div>
    </div>
  )
}

export default MobilePlantCard