// Virtualized List Component for Performance with Large Datasets
import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { FixedSizeList as List, VariableSizeList, ListChildComponentProps } from 'react-window'
import { useIntersectionObserver } from '@/lib/intersection-observer'
import { performanceMonitor } from '@/lib/performance-monitor'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight?: number
  height?: number
  width?: string | number
  overscan?: number
  itemRenderer: (props: {
    item: T
    index: number
    style: React.CSSProperties
    isScrolling?: boolean
  }) => React.ReactNode
  onScroll?: (scrollTop: number, scrollUpdateWasRequested: boolean) => void
  onItemsRendered?: (visibleItems: { startIndex: number; endIndex: number }) => void
  loading?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => void
  estimateSize?: (index: number) => number
  className?: string
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
}

export function VirtualizedList<T>({
  items,
  itemHeight = 100,
  height = 400,
  width = '100%',
  overscan = 5,
  itemRenderer,
  onScroll,
  onItemsRendered,
  loading = false,
  hasNextPage = false,
  onLoadMore,
  estimateSize,
  className = '',
  loadingComponent,
  emptyComponent
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const renderStartTime = useRef<number>(0)
  
  // Performance tracking
  useEffect(() => {
    renderStartTime.current = performance.now()
    return () => {
      const renderTime = performance.now() - renderStartTime.current
      performanceMonitor.setCustomMetric('virtualized_list_render_time', renderTime, {
        itemCount: items.length,
        listHeight: height
      })
    }
  }, [items.length, height])

  // Memoized row renderer
  const Row = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = items[index]
    if (!item) return null

    return (
      <div style={style}>
        {itemRenderer({ 
          item, 
          index, 
          style: { ...style, width: '100%' }, 
          isScrolling 
        })}
      </div>
    )
  }, [items, itemRenderer, isScrolling])

  // Variable size row renderer
  const VariableRow = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = items[index]
    if (!item) return null

    return (
      <div style={style}>
        {itemRenderer({ 
          item, 
          index, 
          style: { ...style, width: '100%' }, 
          isScrolling 
        })}
      </div>
    )
  }, [items, itemRenderer, isScrolling])

  // Handle scroll events
  const handleScroll = useCallback(({
    scrollTop,
    scrollUpdateWasRequested
  }: {
    scrollTop: number
    scrollUpdateWasRequested: boolean
  }) => {
    setIsScrolling(!scrollUpdateWasRequested)
    onScroll?.(scrollTop, scrollUpdateWasRequested)

    // Clear scrolling state after a delay
    const timer = setTimeout(() => setIsScrolling(false), 150)
    return () => clearTimeout(timer)
  }, [onScroll])

  // Handle items rendered for infinite scroll
  const handleItemsRendered = useCallback(({
    visibleStartIndex,
    visibleStopIndex
  }: {
    visibleStartIndex: number
    visibleStopIndex: number
  }) => {
    onItemsRendered?.({ startIndex: visibleStartIndex, endIndex: visibleStopIndex })
    
    // Load more when near the end
    if (hasNextPage && !loading && onLoadMore && 
        visibleStopIndex >= items.length - overscan) {
      onLoadMore()
    }
  }, [hasNextPage, loading, onLoadMore, items.length, overscan, onItemsRendered])

  // Loading row for infinite scroll
  const LoadingRow = useCallback(({ style }: ListChildComponentProps) => (
    <div style={style} className="flex items-center justify-center">
      {loadingComponent || (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="text-sm text-gray-600">Loading more...</span>
        </div>
      )}
    </div>
  ), [loadingComponent])

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <p>No items to display</p>
          </div>
        )}
      </div>
    )
  }

  // Determine list type and item count
  const useVariableSize = !!estimateSize
  const itemCount = items.length + (hasNextPage && loading ? 1 : 0)

  // Variable size list renderer
  const getItemSize = useCallback((index: number) => {
    if (index >= items.length) return itemHeight // Loading row
    return estimateSize ? estimateSize(index) : itemHeight
  }, [items.length, estimateSize, itemHeight])

  if (useVariableSize) {
    return (
      <div className={className}>
        <VariableSizeList
          ref={listRef as any}
          height={height}
          width={width}
          itemCount={itemCount}
          itemSize={getItemSize}
          onScroll={handleScroll}
          onItemsRendered={handleItemsRendered}
          overscanCount={overscan}
        >
          {({ index, style }: ListChildComponentProps) => {
            if (index >= items.length) {
              return <LoadingRow index={index} style={style} />
            }
            return <VariableRow index={index} style={style} />
          }}
        </VariableSizeList>
      </div>
    )
  }

  return (
    <div className={className}>
      <List
        ref={listRef}
        height={height}
        width={width}
        itemCount={itemCount}
        itemSize={itemHeight}
        onScroll={handleScroll}
        onItemsRendered={handleItemsRendered}
        overscanCount={overscan}
      >
        {({ index, style }: ListChildComponentProps) => {
          if (index >= items.length) {
            return <LoadingRow index={index} style={style} />
          }
          return <Row index={index} style={style} />
        }}
      </List>
    </div>
  )
}

// Plant List specific implementation
interface Plant {
  id: string
  name: string
  species?: string
  image?: string
  lastWatered?: string
  healthScore?: number
}

interface VirtualizedPlantListProps {
  plants: Plant[]
  onPlantClick?: (plant: Plant, index: number) => void
  loading?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => void
  height?: number
}

export const VirtualizedPlantList: React.FC<VirtualizedPlantListProps> = ({
  plants,
  onPlantClick,
  loading = false,
  hasNextPage = false,
  onLoadMore,
  height = 600
}) => {
  const itemRenderer = useCallback(({ 
    item, 
    index, 
    style, 
    isScrolling 
  }: {
    item: Plant
    index: number
    style: React.CSSProperties
    isScrolling?: boolean
  }) => {
    return (
      <div 
        style={style} 
        className="px-4 py-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        onClick={() => onPlantClick?.(item, index)}
      >
        <div className="flex items-center space-x-3">
          {/* Plant image */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {!isScrolling && item.image ? (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="w-6 h-6 text-gray-400">🌱</div>
              </div>
            )}
          </div>
          
          {/* Plant info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            {item.species && (
              <p className="text-sm text-gray-600 truncate">{item.species}</p>
            )}
            {item.lastWatered && (
              <p className="text-xs text-gray-500">
                Last watered: {new Date(item.lastWatered).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Health score */}
          {item.healthScore !== undefined && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-medium text-green-700">
                  {item.healthScore}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }, [onPlantClick])

  return (
    <VirtualizedList
      items={plants}
      itemHeight={80}
      height={height}
      itemRenderer={itemRenderer}
      loading={loading}
      hasNextPage={hasNextPage}
      onLoadMore={onLoadMore}
      className="border border-gray-200 rounded-lg overflow-hidden"
      emptyComponent={
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">🌿</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600">Add your first plant to get started!</p>
        </div>
      }
    />
  )
}

// Grid virtualization for image galleries
interface VirtualizedGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  containerWidth: number
  gap?: number
  overscan?: number
  itemRenderer: (props: {
    item: T
    index: number
    style: React.CSSProperties
    columnIndex: number
    rowIndex: number
  }) => React.ReactNode
  loading?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => void
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  gap = 8,
  overscan = 2,
  itemRenderer,
  loading = false,
  hasNextPage = false,
  onLoadMore
}: VirtualizedGridProps<T>) {
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap))
  const rowsCount = Math.ceil(items.length / columnsCount)
  const rowHeight = itemHeight + gap

  const Row = useCallback(({ index: rowIndex, style }: ListChildComponentProps) => {
    const startIndex = rowIndex * columnsCount
    const endIndex = Math.min(startIndex + columnsCount, items.length)
    
    return (
      <div style={style} className="flex" data-row={rowIndex}>
        {Array.from({ length: columnsCount }, (_, columnIndex) => {
          const itemIndex = startIndex + columnIndex
          const item = items[itemIndex]
          
          if (!item) return <div key={columnIndex} style={{ width: itemWidth, height: itemHeight }} />
          
          const itemStyle: React.CSSProperties = {
            width: itemWidth,
            height: itemHeight,
            marginRight: columnIndex < columnsCount - 1 ? gap : 0
          }
          
          return (
            <div key={itemIndex} style={itemStyle}>
              {itemRenderer({ 
                item, 
                index: itemIndex, 
                style: itemStyle,
                columnIndex,
                rowIndex 
              })}
            </div>
          )
        })}
      </div>
    )
  }, [items, columnsCount, itemWidth, itemHeight, gap, itemRenderer])

  const handleItemsRendered = useCallback(({
    visibleStartIndex,
    visibleStopIndex
  }: {
    visibleStartIndex: number
    visibleStopIndex: number
  }) => {
    const lastVisibleItem = (visibleStopIndex + 1) * columnsCount
    if (hasNextPage && !loading && onLoadMore && 
        lastVisibleItem >= items.length - (overscan * columnsCount)) {
      onLoadMore()
    }
  }, [hasNextPage, loading, onLoadMore, items.length, columnsCount, overscan])

  return (
    <List
      height={Math.min(400, rowsCount * rowHeight)}
      width={containerWidth}
      itemCount={rowsCount}
      itemSize={rowHeight}
      onItemsRendered={handleItemsRendered}
      overscanCount={overscan}
    >
      {Row}
    </List>
  )
}

// Auto-sizing wrapper for responsive lists
interface AutoSizedVirtualListProps<T> extends Omit<VirtualizedListProps<T>, 'height' | 'width'> {
  maxHeight?: number
  minHeight?: number
}

export function AutoSizedVirtualList<T>(props: AutoSizedVirtualListProps<T>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const { maxHeight = 600, minHeight = 200, ...listProps } = props
  const listHeight = Math.min(Math.max(dimensions.height, minHeight), maxHeight)

  return (
    <div ref={containerRef} className="w-full h-full min-h-0">
      {dimensions.width > 0 && (
        <VirtualizedList
          {...listProps}
          width={dimensions.width}
          height={listHeight}
        />
      )}
    </div>
  )
}

export default VirtualizedList