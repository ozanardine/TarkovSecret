import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave' | 'bars' | 'orbit';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'accent';
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  fullScreen = false,
  color = 'accent',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const colors = {
    primary: 'text-tarkov-primary',
    secondary: 'text-tarkov-secondary',
    accent: 'text-tarkov-accent',
  };

  const bgColors = {
    primary: 'bg-tarkov-primary',
    secondary: 'bg-tarkov-secondary',
    accent: 'bg-tarkov-accent',
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin', colors[color], sizes[size])} style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            bgColors[color],
            size === 'sm' && 'w-1 h-1',
            size === 'md' && 'w-1.5 h-1.5',
            size === 'lg' && 'w-2 h-2',
            size === 'xl' && 'w-3 h-3'
          )}
          style={{
          animationDelay: `${i * 0.15}s`,
          animationDuration: '0.8s',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'rounded-full animate-pulse',
        bgColors[color],
        sizes[size]
      )}
    />
  );

  const renderWave = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-sm animate-pulse',
            bgColors[color],
            size === 'sm' && 'w-0.5',
            size === 'md' && 'w-1',
            size === 'lg' && 'w-1.5',
            size === 'xl' && 'w-2'
          )}
          style={{
            height: `${20 + (i % 3) * 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.2s',
            willChange: 'opacity',
            transform: 'translateZ(0)',
          }}
        />
      ))}
    </div>
  );

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-sm animate-pulse',
            bgColors[color],
            size === 'sm' && 'w-1 h-4',
            size === 'md' && 'w-1.5 h-6',
            size === 'lg' && 'w-2 h-8',
            size === 'xl' && 'w-3 h-12'
          )}
          style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '1s',
          willChange: 'opacity',
          transform: 'translateZ(0)',
        }}
        />
      ))}
    </div>
  );

  const renderOrbit = () => (
    <div className={cn('relative', sizes[size])}>
      <div className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin', colors[color])} style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      <div
        className={cn('absolute inset-1 rounded-full border-2 border-transparent border-r-current animate-spin', colors[color])}
        style={{ animationDirection: 'reverse', animationDuration: '0.8s', willChange: 'transform', transform: 'translateZ(0)' }}
      />
    </div>
  );

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-2" style={{ willChange: 'opacity', transform: 'translateZ(0)' }}>
      <div className="h-4 bg-tarkov-secondary rounded w-3/4" />
      <div className="h-4 bg-tarkov-secondary rounded w-1/2" />
      <div className="h-4 bg-tarkov-secondary rounded w-5/6" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'wave':
        return renderWave();
      case 'bars':
        return renderBars();
      case 'orbit':
        return renderOrbit();
      case 'skeleton':
        return renderSkeleton();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      className
    )}>
      {variant !== 'skeleton' && renderLoader()}
      {variant === 'skeleton' && renderSkeleton()}
      {text && variant !== 'skeleton' && (
        <p className={cn('text-tarkov-muted text-center', textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-tarkov-dark/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Inline Loading Component
interface InlineLoadingProps {
  size?: 'sm' | 'md';
  text?: string;
  className?: string;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'sm',
  text = 'Carregando...',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn(
        'animate-spin text-tarkov-accent',
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
      )} />
      <span className={cn(
        'text-tarkov-muted',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {text}
      </span>
    </div>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Carregando...',
  children,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-tarkov-dark/60 backdrop-blur-sm rounded-lg">
          <Loading text={text} size="lg" />
        </div>
      )}
    </div>
  );
};

// Skeleton Components
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = true,
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-tarkov-secondary/50',
        rounded && 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
};

// Card Skeleton
const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-4 border border-tarkov-border rounded-lg bg-tarkov-secondary/80', className)}>
      <div className="animate-pulse space-y-3" style={{ willChange: 'opacity', transform: 'translateZ(0)' }}>
        <div className="flex items-start gap-3">
          <Skeleton width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="60%" />
            <Skeleton height={12} width="40%" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton height={12} width="80%" />
          <Skeleton height={12} width="60%" />
        </div>
      </div>
    </div>
  );
};

// List Skeleton
interface ListSkeletonProps {
  items?: number;
  className?: string;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  items = 5, 
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

// Progress Loading
interface ProgressLoadingProps {
  progress: number; // 0-100
  text?: string;
  className?: string;
}

const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  text,
  className,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn('w-full space-y-2', className)}>
      {text && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-tarkov-light">{text}</span>
          <span className="text-sm text-tarkov-muted">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-tarkov-secondary rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-tarkov-accent transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export {
  Loading,
  InlineLoading,
  LoadingOverlay,
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  ProgressLoading,
};

export type {
  LoadingProps,
  InlineLoadingProps,
  LoadingOverlayProps,
  SkeletonProps,
  ListSkeletonProps,
  ProgressLoadingProps,
};