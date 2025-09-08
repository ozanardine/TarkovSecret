'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

interface ClickableItemImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  showName?: boolean;
  name?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

export default function ClickableItemImage({
  src,
  alt,
  size = 'sm',
  className,
  showName = false,
  name
}: ClickableItemImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleImageError = () => {
    console.log('Image error for:', alt, 'src:', currentSrc);
    setImageError(true);
  };

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setCurrentSrc(src);
  }, [src]);

  // Get size classes or custom size
  const getSizeClass = () => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
    return sizeClasses[size];
  };

  const sizeClass = getSizeClass();
  const customStyle = typeof size === 'number' ? { width: size, height: size } : {};

  const imageContent = (
    <div 
      className={cn(
        'relative overflow-hidden rounded border bg-muted flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all',
        typeof size === 'string' ? sizeClasses[size] : '',
        className
      )}
      style={customStyle}
    >
      {!imageError ? (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className="object-contain p-1"
          onError={handleImageError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="text-xs text-muted-foreground text-center p-1">
          {name ? name.slice(0, 3) : alt.slice(0, 3)}
        </div>
      )}
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2">
          {imageContent}
          {showName && name && (
            <span className="text-sm font-medium">{name}</span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48 overflow-hidden rounded border bg-muted flex items-center justify-center">
            {!imageError ? (
              <Image
                src={currentSrc}
                alt={alt}
                fill
                className="object-contain p-2"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="text-muted-foreground text-center">
                Imagem não disponível
              </div>
            )}
          </div>
          {name && (
            <h3 className="text-lg font-semibold text-center">{name}</h3>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}