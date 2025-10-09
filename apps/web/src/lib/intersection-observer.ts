// Intersection Observer Utility for Lazy Loading and Performance
import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
  skip?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<Element>, boolean, IntersectionObserverEntry | undefined] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    triggerOnce = false,
    skip = false
  } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observer = useRef<IntersectionObserver>()
  const frozen = useRef(false)

  const setNodeRef: React.RefCallback<Element> = (node) => {
    if (observer.current) {
      observer.current.disconnect()
      observer.current = undefined
    }

    // Skip if disabled, no Intersection Observer support, or triggered once
    if (skip || frozen.current || !window.IntersectionObserver) {
      return
    }

    if (node) {
      observer.current = new IntersectionObserver(
        ([entry]: IntersectionObserverEntry[]) => {
          const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0

          setEntry(entry)

          if (isIntersecting) {
            setIsIntersecting(isIntersecting)

            if (triggerOnce) {
              frozen.current = true
              observer.current?.disconnect()
            }
          } else if (!triggerOnce) {
            setIsIntersecting(false)
          }
        },
        { threshold, root, rootMargin }
      )

      observer.current.observe(node)
    }
  }

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return [setNodeRef, isIntersecting, entry]
}

// Hook for tracking multiple elements
export function useMultipleIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [
  (element: Element, id: string) => void,
  (id: string) => void,
  Map<string, boolean>
] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    triggerOnce = false,
    skip = false
  } = options

  const [intersectingElements, setIntersectingElements] = useState(new Map<string, boolean>())
  const observer = useRef<IntersectionObserver>()
  const elementIds = useRef(new Map<Element, string>())

  const observeElement = (element: Element, id: string) => {
    if (skip || !window.IntersectionObserver) return

    if (!observer.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const elementId = elementIds.current.get(entry.target)
            if (elementId) {
              const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0
              
              setIntersectingElements(prev => {
                const newMap = new Map(prev)
                newMap.set(elementId, isIntersecting)
                return newMap
              })

              if (isIntersecting && triggerOnce) {
                observer.current?.unobserve(entry.target)
                elementIds.current.delete(entry.target)
              }
            }
          })
        },
        { threshold, root, rootMargin }
      )
    }

    elementIds.current.set(element, id)
    observer.current.observe(element)
  }

  const unobserveElement = (id: string) => {
    if (observer.current && elementIds.current) {
      for (const [element, elementId] of elementIds.current.entries()) {
        if (elementId === id) {
          observer.current.unobserve(element)
          elementIds.current.delete(element)
          break
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return [observeElement, unobserveElement, intersectingElements]
}

// Hook for infinite scroll
export function useInfiniteScroll(
  callback: () => void,
  options: {
    rootMargin?: string
    threshold?: number
    disabled?: boolean
  } = {}
) {
  const { rootMargin = '100px', threshold = 0.1, disabled = false } = options
  const [isFetching, setIsFetching] = useState(false)

  const [setNodeRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    skip: disabled
  })

  useEffect(() => {
    if (isIntersecting && !isFetching && !disabled) {
      setIsFetching(true)
      callback()
    }
  }, [isIntersecting, isFetching, callback, disabled])

  const resetFetching = () => setIsFetching(false)

  return { setNodeRef, isFetching, resetFetching }
}

// Hook for tracking element visibility for analytics
export function useVisibilityTracking(
  onVisible?: (duration: number) => void,
  options: {
    threshold?: number
    minVisibleTime?: number // minimum time visible to trigger callback
    rootMargin?: string
  } = {}
) {
  const { threshold = 0.5, minVisibleTime = 1000, rootMargin = '0px' } = options
  const visibilityStartTime = useRef<number | null>(null)

  const [setNodeRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin
  })

  useEffect(() => {
    if (isIntersecting && !visibilityStartTime.current) {
      visibilityStartTime.current = Date.now()
    } else if (!isIntersecting && visibilityStartTime.current) {
      const visibilityDuration = Date.now() - visibilityStartTime.current
      if (visibilityDuration >= minVisibleTime) {
        onVisible?.(visibilityDuration)
      }
      visibilityStartTime.current = null
    }
  }, [isIntersecting, minVisibleTime, onVisible])

  return { setNodeRef, isVisible: isIntersecting }
}

// Performance-optimized intersection observer with debouncing
export function useDebouncedIntersectionObserver(
  options: UseIntersectionObserverOptions & {
    debounceMs?: number
  } = {}
) {
  const { debounceMs = 100, ...intersectionOptions } = options
  const [debouncedIsIntersecting, setDebouncedIsIntersecting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const [setNodeRef, isIntersecting] = useIntersectionObserver(intersectionOptions)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedIsIntersecting(isIntersecting)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isIntersecting, debounceMs])

  return [setNodeRef, debouncedIsIntersecting] as const
}

// Batch intersection observer for better performance with many elements
export class BatchIntersectionObserver {
  private observer: IntersectionObserver | null = null
  private callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>()

  constructor(
    private options: IntersectionObserverInit = {}
  ) {
    if (typeof window !== 'undefined' && window.IntersectionObserver) {
      this.observer = new IntersectionObserver(
        this.handleIntersections.bind(this),
        options
      )
    }
  }

  private handleIntersections(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      const callback = this.callbacks.get(entry.target)
      if (callback) {
        callback(entry)
      }
    })
  }

  observe(element: Element, callback: (entry: IntersectionObserverEntry) => void) {
    if (!this.observer) return

    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  unobserve(element: Element) {
    if (!this.observer) return

    this.callbacks.delete(element)
    this.observer.unobserve(element)
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.callbacks.clear()
    }
  }
}

// Global batch observer instance
export const globalBatchObserver = new BatchIntersectionObserver({
  threshold: [0, 0.25, 0.5, 0.75, 1],
  rootMargin: '50px'
})

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalBatchObserver.disconnect()
  })
}

export default useIntersectionObserver