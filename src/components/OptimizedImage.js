
'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * OptimizedImage Component
 * Phase 4: Performance - Optimized image loading with next/image
 * Features: lazy loading, blur placeholder, AVIF/WebP, responsive sizes
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className = '',
  style = {},
  objectFit = 'cover',
  borderRadius,
  border,
  boxShadow,
  fallbackSrc = '/file.svg',
  onLoad,
  onError,
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius || undefined,
    border: border || undefined,
    boxShadow: boxShadow || undefined,
    ...style,
  };

  // Generate simple blur placeholder based on dimensions
  const blurDataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width || 100} ${height || 100}"><filter id="b"><feGaussianBlur stdDeviation="20"/></filter><rect width="100%" height="100%" fill="%23f0f4fa" filter="url(%23b)"/></svg>`
  )}`;

  const imageProps = {
    src: imgError ? fallbackSrc : src,
    alt: alt || 'ORLUXUS',
    fill,
    sizes: sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    priority,
    quality: 85,
    placeholder: priority ? undefined : 'blur',
    blurDataURL: priority ? undefined : blurDataURL,
    onLoad: (e) => {
      setImgLoaded(true);
      onLoad?.(e);
    },
    onError: (e) => {
      setImgError(true);
      onError?.(e);
    },
    style: {
      objectFit,
      transition: 'opacity 0.4s ease',
      opacity: imgLoaded ? 1 : 0,
    },
    className,
  };

  if (!fill) {
    imageProps.width = width || 400;
    imageProps.height = height || 300;
  }

  if (fill) {
    return (
      <div style={{ ...containerStyle, width: '100%', height: '100%' }}>
        <Image alt={alt || 'ORLUXUS'} {...imageProps} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Image alt={alt || 'ORLUXUS'} {...imageProps} />
    </div>
  );
}
