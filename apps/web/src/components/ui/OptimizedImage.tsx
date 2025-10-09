// Optimized Image Component with Lazy Loading and Performance Features
import React, { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@/lib/intersection-observer'
import { performanceMonitor } from '@/lib/performance-monitor'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty' | string
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
  srcSet?: string
  webpSrc?: string
  avifSrc?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  aspectRatio?: string
  fallback?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  srcSet,
  webpSrc,
  avifSrc,
  objectFit = 'cover',
  loading,
  aspectRatio,
  fallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadStartTime, setLoadStartTime] = useState<number>(0)

  // Intersection observer for lazy loading
  const [inViewRef, inView] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  })

  // Determine if image should load
  const shouldLoad = priority || !lazy || inView

  // Generate optimized sources
  const generateSrcSet = (baseSrc: string, quality: number = 75): string => {
    if (srcSet) return srcSet
    
    const sizes = [480, 768, 1024, 1280, 1920]
    return sizes.map(size => {
      const optimizedUrl = generateOptimizedUrl(baseSrc, { width: size, quality })
      return `${optimizedUrl} ${size}w`
    }).join(', ')
  }

  const generateOptimizedUrl = (url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: string
  } = {}): string => {
    // If using a CDN like Cloudinary, ImageKit, or Vercel's image optimization
    if (url.startsWith('http')) {
      const params = new URLSearchParams()
      if (options.width) params.set('w', options.width.toString())
      if (options.height) params.set('h', options.height.toString())
      if (options.quality) params.set('q', options.quality.toString())
      if (options.format) params.set('f', options.format)
      
      // For Next.js built-in optimization
      return `/_next/image?url=${encodeURIComponent(url)}&${params.toString()}`
    }
    
    return url
  }

  // Generate blur placeholder
  const generateBlurPlaceholder = (src: string): string => {
    if (blurDataURL) return blurDataURL
    
    // Generate a simple SVG blur placeholder
    const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // Handle image loading
  useEffect(() => {
    if (!shouldLoad) return

    setLoadStartTime(performance.now())
    
    if (webpSrc && supportsWebP()) {
      setCurrentSrc(generateOptimizedUrl(webpSrc, { quality, width, height }))
    } else if (avifSrc && supportsAvif()) {
      setCurrentSrc(generateOptimizedUrl(avifSrc, { quality, width, height }))
    } else {
      setCurrentSrc(generateOptimizedUrl(src, { quality, width, height }))
    }
  }, [shouldLoad, src, webpSrc, avifSrc, quality, width, height])

  const handleLoad = () => {
    setIsLoaded(true)
    setIsError(false)
    
    if (loadStartTime > 0) {
      const loadTime = performance.now() - loadStartTime
      performanceMonitor.setCustomMetric('image_load_time', loadTime, {
        src: currentSrc,
        width,
        height,
        format: getImageFormat(currentSrc)
      })
    }
    
    onLoad?.()
  }

  const handleError = () => {
    setIsError(true)
    
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback)
      return
    }
    
    performanceMonitor.setCustomMetric('image_load_error', 1, {
      src: currentSrc,
      width,
      height
    })
    
    onError?.()
  }

  // Feature detection
  const supportsWebP = (): boolean => {
    if (typeof window === 'undefined') return false
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1
  }

  const supportsAvif = (): boolean => {
    if (typeof window === 'undefined') return false
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/avif').indexOf('avif') !== -1
  }

  const getImageFormat = (url: string): string => {
    if (url.includes('webp')) return 'webp'
    if (url.includes('avif')) return 'avif'
    if (url.includes('jpg') || url.includes('jpeg')) return 'jpeg'
    if (url.includes('png')) return 'png'
    return 'unknown'
  }

  const containerStyle: React.CSSProperties = {
    aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto'
  }

  const imgStyle: React.CSSProperties = {
    objectFit,
    width: '100%',
    height: '100%',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0
  }

  // Render placeholder while loading
  const renderPlaceholder = () => {
    if (placeholder === 'empty') return null
    
    if (typeof placeholder === 'string' && placeholder !== 'blur') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">{placeholder}</span>
        </div>
      )
    }
    
    return (
      <div 
        className="absolute inset-0 bg-gray-100"
        style={{
          backgroundImage: `url(${generateBlurPlaceholder(src)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
          transform: 'scale(1.1)' // Prevent blur edge artifacts
        }}
      />
    )
  }

  // Render error state
  const renderError = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
      <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
      <span className="text-xs">Failed to load</span>
    </div>
  )

  return (
    <div 
      ref={inViewRef}
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* Placeholder */}
      {!isLoaded && !isError && renderPlaceholder()}
      
      {/* Error state */}
      {isError && renderError()}
      
      {/* Main image */}
      {shouldLoad && currentSrc && !isError && (
        <picture>
          {/* AVIF source */}
          {avifSrc && supportsAvif() && (
            <source
              srcSet={generateSrcSet(avifSrc, quality)}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* WebP source */}
          {webpSrc && supportsWebP() && (
            <source
              srcSet={generateSrcSet(webpSrc, quality)}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback image */}
          <img
            ref={imgRef}
            src={currentSrc}
            srcSet={generateSrcSet(currentSrc, quality)}
            sizes={sizes || '100vw'}
            alt={alt}
            width={width}
            height={height}
            loading={loading || (lazy && !priority ? 'lazy' : 'eager')}
            decoding={priority ? 'sync' : 'async'}
            style={imgStyle}
            onLoad={handleLoad}
            onError={handleError}
            className="block"
          />
        </picture>
      )}
    </div>
  )
}

// Progressive Image Component with blur-up effect
export const ProgressiveImage: React.FC<OptimizedImageProps & { 
  lowQualitySrc?: string 
}> = ({ lowQualitySrc, ...props }) => {
  const [highResLoaded, setHighResLoaded] = useState(false)
  
  return (
    <div className="relative">
      {/* Low quality placeholder */}
      {lowQualitySrc && !highResLoaded && (
        <OptimizedImage
          {...props}
          src={lowQualitySrc}
          quality={10}
          className={`${props.className} absolute inset-0`}
          priority={true}
          lazy={false}
        />
      )}
      
      {/* High quality image */}
      <OptimizedImage
        {...props}
        onLoad={() => {
          setHighResLoaded(true)
          props.onLoad?.()
        }}
        className={`${props.className} ${highResLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
    </div>
  )
}

// Image gallery with virtualization for performance
interface ImageGalleryProps {
  images: Array<{
    id: string
    src: string
    alt: string
    width?: number
    height?: number
    thumbnail?: string
  }>
  columns?: number
  gap?: number
  onImageClick?: (image: any, index: number) => void
}

export const VirtualizedImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 8,
  onImageClick
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  
  const itemHeight = 200 // Fixed height for virtualization
  const itemsPerRow = columns
  const rowCount = Math.ceil(images.length / itemsPerRow)
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const startIndex = index * itemsPerRow
    const endIndex = Math.min(startIndex + itemsPerRow, images.length)
    const rowImages = images.slice(startIndex, endIndex)
    
    return (
      <div style={style} className="flex" data-index={index}>
        {rowImages.map((image, colIndex) => (
          <div
            key={image.id}
            className="flex-1 cursor-pointer"
            style={{ 
              marginRight: colIndex < rowImages.length - 1 ? gap : 0,
              height: itemHeight - gap 
            }}
            onClick={() => onImageClick?.(image, startIndex + colIndex)}
          >
            <OptimizedImage
              src={image.thumbnail || image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="w-full h-full rounded-lg"
              objectFit="cover"
              sizes={`${100/columns}vw`}
              lazy={true}
            />
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div ref={setContainerRef} className="w-full h-96 overflow-hidden">
      {containerRef && (
        <div style={{ height: rowCount * itemHeight }}>
          {Array.from({ length: rowCount }, (_, index) => (
            <Row 
              key={index} 
              index={index} 
              style={{
                position: 'absolute',
                top: index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OptimizedImage