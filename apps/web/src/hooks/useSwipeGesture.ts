import { useState, useRef, useCallback, useEffect } from 'react'

export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onPinch?: (scale: number) => void
}

export interface SwipeOptions {
  threshold?: number // Minimum distance for swipe
  velocityThreshold?: number // Minimum velocity for swipe
  timeThreshold?: number // Maximum time for swipe
  longPressDelay?: number // Delay for long press detection
  doubleTapDelay?: number // Max delay between taps for double tap
  preventScroll?: boolean // Prevent scrolling during gestures
}

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  isDragging: boolean
  touchCount: number
  lastTapTime?: number
  longPressTimer?: NodeJS.Timeout
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
  threshold: 50,
  velocityThreshold: 0.3,
  timeThreshold: 1000,
  longPressDelay: 500,
  doubleTapDelay: 300,
  preventScroll: true
}

export function useSwipeGesture(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const [touchState, setTouchState] = useState<TouchState | null>(null)
  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options })
  const handlersRef = useRef(handlers)
  
  // Update refs when props change
  useEffect(() => {
    optionsRef.current = { ...DEFAULT_OPTIONS, ...options }
    handlersRef.current = handlers
  }, [handlers, options])

  const calculateDistance = useCallback((
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ) => {
    return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
  }, [])

  const calculateVelocity = useCallback((distance: number, time: number) => {
    return time > 0 ? distance / time : 0
  }, [])

  const getSwipeDirection = useCallback((
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ) => {
    const deltaX = endX - startX
    const deltaY = endY - startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }, [])

  const clearLongPressTimer = useCallback(() => {
    if (touchState?.longPressTimer) {
      clearTimeout(touchState.longPressTimer)
    }
  }, [touchState])

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    const now = Date.now()
    
    clearLongPressTimer()

    const newTouchState: TouchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
      isDragging: false,
      touchCount: event.touches.length,
    }

    // Handle multiple touches (pinch gesture)
    if (event.touches.length === 2) {
      // Store initial distance for pinch detection
      const touch2 = event.touches[1]
      const initialDistance = calculateDistance(
        touch.clientX, touch.clientY,
        touch2.clientX, touch2.clientY
      )
      newTouchState.currentX = initialDistance // Reuse for distance storage
    }

    // Set up long press timer
    if (handlersRef.current.onLongPress) {
      newTouchState.longPressTimer = setTimeout(() => {
        if (touchState && !touchState.isDragging) {
          handlersRef.current.onLongPress?.()
        }
      }, optionsRef.current.longPressDelay)
    }

    setTouchState(newTouchState)

    if (optionsRef.current.preventScroll) {
      event.preventDefault()
    }
  }, [touchState, calculateDistance, clearLongPressTimer])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchState) return

    const touch = event.touches[0]
    const distance = calculateDistance(
      touchState.startX,
      touchState.startY,
      touch.clientX,
      touch.clientY
    )

    // Handle pinch gesture for multi-touch
    if (event.touches.length === 2 && handlersRef.current.onPinch) {
      const touch2 = event.touches[1]
      const currentDistance = calculateDistance(
        touch.clientX, touch.clientY,
        touch2.clientX, touch2.clientY
      )
      const initialDistance = touchState.currentX // Stored in currentX
      const scale = currentDistance / initialDistance
      
      handlersRef.current.onPinch(scale)
      
      if (optionsRef.current.preventScroll) {
        event.preventDefault()
      }
      return
    }

    // Mark as dragging if moved beyond threshold
    const newIsDragging = distance > optionsRef.current.threshold / 2

    if (newIsDragging && !touchState.isDragging) {
      clearLongPressTimer()
    }

    setTouchState(prev => prev ? {
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: newIsDragging
    } : null)

    if (optionsRef.current.preventScroll && newIsDragging) {
      event.preventDefault()
    }
  }, [touchState, calculateDistance, clearLongPressTimer])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchState) return

    clearLongPressTimer()

    const touch = event.changedTouches[0]
    const endTime = Date.now()
    const deltaTime = endTime - touchState.startTime
    const distance = calculateDistance(
      touchState.startX,
      touchState.startY,
      touch.clientX,
      touch.clientY
    )
    const velocity = calculateVelocity(distance, deltaTime)

    // Handle tap gestures
    if (!touchState.isDragging && distance < optionsRef.current.threshold / 4) {
      const timeSinceLastTap = touchState.lastTapTime 
        ? endTime - touchState.lastTapTime 
        : Infinity

      if (timeSinceLastTap < optionsRef.current.doubleTapDelay) {
        // Double tap
        handlersRef.current.onDoubleTap?.()
        setTouchState(null)
        return
      } else {
        // Single tap (delayed to check for double tap)
        const tapTimer = setTimeout(() => {
          handlersRef.current.onTap?.()
        }, optionsRef.current.doubleTapDelay)

        setTouchState(prev => prev ? {
          ...prev,
          lastTapTime: endTime,
          longPressTimer: tapTimer
        } : null)
        return
      }
    }

    // Handle swipe gestures
    if (
      touchState.isDragging &&
      distance > optionsRef.current.threshold &&
      velocity > optionsRef.current.velocityThreshold &&
      deltaTime < optionsRef.current.timeThreshold
    ) {
      const direction = getSwipeDirection(
        touchState.startX,
        touchState.startY,
        touch.clientX,
        touch.clientY
      )

      switch (direction) {
        case 'left':
          handlersRef.current.onSwipeLeft?.()
          break
        case 'right':
          handlersRef.current.onSwipeRight?.()
          break
        case 'up':
          handlersRef.current.onSwipeUp?.()
          break
        case 'down':
          handlersRef.current.onSwipeDown?.()
          break
      }
    }

    setTouchState(null)
  }, [touchState, calculateDistance, calculateVelocity, getSwipeDirection, clearLongPressTimer])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer()
    }
  }, [clearLongPressTimer])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    // Additional utilities
    isGestureActive: !!touchState,
    isDragging: touchState?.isDragging || false,
  }
}

// Hook for drag and drop functionality
export interface DragHandlers {
  onDragStart?: (startPosition: { x: number; y: number }) => void
  onDragMove?: (currentPosition: { x: number; y: number }, delta: { x: number; y: number }) => void
  onDragEnd?: (endPosition: { x: number; y: number }, totalDelta: { x: number; y: number }) => void
  onDrop?: (dropPosition: { x: number; y: number }) => void
}

export function useDragGesture(handlers: DragHandlers, threshold: number = 10) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)

  const swipeHandlers: SwipeHandlers = {
    onTap: () => {
      // Handle tap if no drag occurred
      if (!isDragging) {
        handlers.onDrop?.({
          x: dragStateRef.current?.currentX || 0,
          y: dragStateRef.current?.currentY || 0
        })
      }
    }
  }

  const swipeGesture = useSwipeGesture(swipeHandlers, {
    threshold,
    preventScroll: false
  })

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    dragStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY
    }
    
    handlers.onDragStart?.({ x: touch.clientX, y: touch.clientY })
    swipeGesture.onTouchStart(event)
  }, [handlers, swipeGesture])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!dragStateRef.current) return

    const touch = event.touches[0]
    const distance = Math.sqrt(
      Math.pow(touch.clientX - dragStateRef.current.startX, 2) +
      Math.pow(touch.clientY - dragStateRef.current.startY, 2)
    )

    if (distance > threshold && !isDragging) {
      setIsDragging(true)
    }

    if (isDragging) {
      const delta = {
        x: touch.clientX - dragStateRef.current.currentX,
        y: touch.clientY - dragStateRef.current.currentY
      }

      dragStateRef.current.currentX = touch.clientX
      dragStateRef.current.currentY = touch.clientY

      handlers.onDragMove?.({ x: touch.clientX, y: touch.clientY }, delta)
    }

    swipeGesture.onTouchMove(event)
  }, [isDragging, threshold, handlers, swipeGesture])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (isDragging && dragStateRef.current) {
      const totalDelta = {
        x: dragStateRef.current.currentX - dragStateRef.current.startX,
        y: dragStateRef.current.currentY - dragStateRef.current.startY
      }

      handlers.onDragEnd?.({
        x: dragStateRef.current.currentX,
        y: dragStateRef.current.currentY
      }, totalDelta)
    }

    setIsDragging(false)
    dragStateRef.current = null
    swipeGesture.onTouchEnd(event)
  }, [isDragging, handlers, swipeGesture])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isDragging,
  }
}

// Hook for pull-to-refresh functionality
export interface PullToRefreshOptions {
  threshold?: number // Distance to trigger refresh
  resistance?: number // Resistance factor (0-1)
  onRefresh?: () => Promise<void> | void
}

export function usePullToRefresh(options: PullToRefreshOptions = {}) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  const {
    threshold = 100,
    resistance = 0.5,
    onRefresh
  } = options

  const handleSwipeDown = useCallback(async () => {
    if (pullDistance > threshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
        setIsPulling(false)
      }
    } else {
      // Animate back to original position
      setPullDistance(0)
      setIsPulling(false)
    }
  }, [pullDistance, threshold, onRefresh, isRefreshing])

  const swipeGesture = useSwipeGesture({
    onSwipeDown: handleSwipeDown
  }, {
    threshold: 20,
    preventScroll: false
  })

  // Custom touch handlers for pull distance calculation
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    
    // Only handle vertical pulls from top of screen
    if (window.scrollY === 0 && touch.clientY > touch.clientY) {
      const distance = Math.max(0, touch.clientY - (touch.clientY || 0))
      const resistedDistance = distance * resistance
      
      setPullDistance(resistedDistance)
      setIsPulling(resistedDistance > 10)
      
      if (resistedDistance > threshold * 0.8) {
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10)
        }
      }
    }
    
    swipeGesture.onTouchMove(event)
  }, [resistance, threshold, swipeGesture])

  return {
    ...swipeGesture,
    onTouchMove: handleTouchMove,
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh: pullDistance > threshold
  }
}