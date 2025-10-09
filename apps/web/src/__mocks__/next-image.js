// Mock for Next.js Image component
import React from 'react'

const NextImage = (props) => {
  const { src, alt, width, height, fill, sizes, priority, quality, ...rest } = props
  
  return (
    <img
      src={typeof src === 'string' ? src : src.src || src.default}
      alt={alt}
      width={width}
      height={height}
      data-testid="next-image"
      {...rest}
    />
  )
}

export default NextImage