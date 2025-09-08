import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingFixedProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave' | 'bars' | 'orbit';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'accent';
}

const LoadingFixed: React.FC<LoadingFixedProps> = ({
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

  // CSS inline para garantir que as animações funcionem
  const spinStyle: React.CSSProperties = {
    animation: 'spin 1s linear infinite',
    willChange: 'transform',
    transform: 'translateZ(0)',
  };

  const bounceStyle: React.CSSProperties = {
    animation: 'bounce 1s infinite',
    willChange: 'transform',
    transform: 'translateZ(0)',
  };

  const pulseStyle: React.CSSProperties = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    willChange: 'opacity',
    transform: 'translateZ(0)',
  };

  const renderSpinner = () => (
    <Loader2 
      className={cn(colors[color], sizes[size])} 
      style={spinStyle}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full',
            bgColors[color],
            size === 'sm' && 'w-1 h-1',
            size === 'md' && 'w-1.5 h-1.5',
            size === 'lg' && 'w-2 h-2',
            size === 'xl' && 'w-3 h-3'
          )}
          style={{
            ...bounceStyle,
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'rounded-full',
        bgColors[color],
        sizes[size]
      )}
      style={pulseStyle}
    />
  );

  const renderWave = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-sm',
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
            animation: 'pulse 1.2s ease-in-out infinite',
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
            'rounded-sm',
            bgColors[color],
            size === 'sm' && 'w-1 h-4',
            size === 'md' && 'w-1.5 h-6',
            size === 'lg' && 'w-2 h-8',
            size === 'xl' && 'w-3 h-12'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
            animation: 'pulse 1s ease-in-out infinite',
            willChange: 'opacity',
            transform: 'translateZ(0)',
          }}
        />
      ))}
    </div>
  );

  const renderOrbit = () => (
    <div className={cn('relative', sizes[size])}>
      <div 
        className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-current', colors[color])} 
        style={spinStyle} 
      />
      <div
        className={cn('absolute inset-1 rounded-full border-2 border-transparent border-r-current', colors[color])}
        style={{ 
          ...spinStyle,
          animationDirection: 'reverse', 
          animationDuration: '0.8s' 
        }}
      />
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-2" style={{ willChange: 'opacity', transform: 'translateZ(0)' }}>
      <div 
        className="h-4 bg-tarkov-secondary rounded w-3/4" 
        style={pulseStyle}
      />
      <div 
        className="h-4 bg-tarkov-secondary rounded w-1/2" 
        style={{ ...pulseStyle, animationDelay: '0.2s' }}
      />
      <div 
        className="h-4 bg-tarkov-secondary rounded w-5/6" 
        style={{ ...pulseStyle, animationDelay: '0.4s' }}
      />
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

export { LoadingFixed };
export type { LoadingFixedProps };
