import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LoadingFixed } from './LoadingFixed';

interface InfiniteLoadingProps {
  isLoading?: boolean;
  hasMore?: boolean;
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'bars' | 'orbit';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const InfiniteLoading = forwardRef<HTMLDivElement, InfiniteLoadingProps>(
  ({ 
    isLoading = false, 
    hasMore = true, 
    text = "Carregando mais itens...", 
    className,
    variant = 'orbit',
    size = 'md'
  }, ref) => {
    if (!hasMore) {
      return (
        <div className={cn('text-center py-8', className)}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tarkov-secondary/50 rounded-full border border-tarkov-border/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-tarkov-muted text-sm">
              Todos os itens foram carregados
            </span>
          </div>
        </div>
      );
    }

    return (
      <div 
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 min-h-[140px]',
          'transition-all duration-300 ease-out',
          className
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative">
              <LoadingFixed 
                variant={variant} 
                size={size} 
                color="accent"
              />
              <div className="absolute -inset-2 bg-tarkov-accent/10 rounded-full animate-ping"></div>
            </div>
            <p className="text-tarkov-muted text-sm font-medium">
              {text}
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-tarkov-accent rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-tarkov-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-tarkov-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-200">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-tarkov-border border-t-tarkov-accent rounded-full animate-spin"></div>
              <div className="absolute inset-0 border-2 border-transparent border-r-tarkov-accent/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-tarkov-muted text-sm">
              Role para carregar mais itens
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-tarkov-muted rounded-full"></div>
              <div className="w-1 h-1 bg-tarkov-muted rounded-full"></div>
              <div className="w-1 h-1 bg-tarkov-muted rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

InfiniteLoading.displayName = 'InfiniteLoading';

export { InfiniteLoading };
export type { InfiniteLoadingProps };
