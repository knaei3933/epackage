import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  lowQualitySrc?: string;
  className?: string;
  containerClassName?: string;
  lazy?: boolean;
  critical?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  lowQualitySrc,
  className,
  containerClassName,
  lazy = true,
  critical = false,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {lowQualitySrc && isLoading && (
        <div
          className="absolute inset-0 blur-sm scale-110 filter"
          style={{
            backgroundImage: `url(${lowQualitySrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy && !priority && !critical ? 'lazy' : 'eager'}
        priority={priority || critical}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        {...props}
      />

      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
}
