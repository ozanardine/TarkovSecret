import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, ...props }, ref) => {
    const baseClasses = [
      'rounded-lg',
      'border border-tarkov-border',
    ].join(' ');

    const variants = {
      default: 'bg-tarkov-secondary/80 backdrop-blur-sm',
      elevated: [
        'bg-tarkov-secondary/90 backdrop-blur-md',
        'shadow-lg shadow-black/20',
        'border-tarkov-border/50',
      ].join(' '),
      outlined: [
        'bg-transparent border-2',
        'border-tarkov-accent/30',
      ].join(' '),
      glass: [
        'bg-tarkov-secondary/20 backdrop-blur-xl',
        'border-tarkov-accent/20',
        'shadow-xl shadow-black/10',
      ].join(' '),
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const hoverClasses = hover
      ? 'hover:shadow-lg hover:shadow-tarkov-accent/10 hover:border-tarkov-accent/50 hover:scale-[1.02] cursor-pointer'
      : '';

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          hoverClasses,
          className
        )}
        ref={ref}
        style={{
          transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out',
          willChange: 'transform, box-shadow, border-color',
          transform: 'translateZ(0)',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-start justify-between gap-4 pb-4 border-b border-tarkov-border/50',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-tarkov-light truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-tarkov-muted mt-1">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('py-4', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Title Component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        className={cn(
          'text-lg font-semibold text-tarkov-light',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Footer Component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = 'right', ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        className={cn(
          'flex items-center gap-3 pt-4 border-t border-tarkov-border/50',
          alignClasses[align],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Item Card Component (specialized for Tarkov items)
interface ItemCardProps extends Omit<CardProps, 'children'> {
  item: {
    id: string;
    name: string;
    shortName?: string;
    image?: string;
    iconLink?: string;
    gridImageLink?: string;
    inspectImageLink?: string;
    image512pxLink?: string;
    image8xLink?: string;
    imageLink?: string;
    imageLinkFallback?: string;
    price?: number;
    change24h?: number;
    rarity?: string;
    category?: string;
  };
  showPrice?: boolean;
  showChange?: boolean;
  onItemClick?: (itemId: string) => void;
  actions?: React.ReactNode;
}

const ItemCard = React.forwardRef<HTMLDivElement, ItemCardProps>(
  ({
    item,
    showPrice = true,
    showChange = true,
    onItemClick,
    actions,
    className,
    ...props
  }, ref) => {
    const handleClick = () => {
      if (onItemClick) {
        onItemClick(item.id);
      }
    };

    const getPriceChangeColor = (change: number) => {
      if (change > 0) return 'text-green-400';
      if (change < 0) return 'text-red-400';
      return 'text-tarkov-muted';
    };

    const getRarityColor = (rarity?: string) => {
      switch (rarity?.toLowerCase()) {
        case 'legendary':
          return 'border-l-orange-500';
        case 'rare':
          return 'border-l-purple-500';
        case 'uncommon':
          return 'border-l-blue-500';
        case 'common':
        default:
          return 'border-l-gray-500';
      }
    };

    return (
      <Card
        className={cn(
          'border-l-4',
          getRarityColor(item.rarity),
          onItemClick && 'cursor-pointer hover:shadow-lg hover:shadow-tarkov-accent/20',
          className
        )}
        padding="sm"
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-start gap-3">
          {(item.image8xLink || item.image512pxLink || item.inspectImageLink || item.gridImageLink || item.imageLink || item.iconLink || item.imageLinkFallback || item.image) && (
            <div className="flex-shrink-0">
              <img
                src={
                  item.image8xLink || 
                  item.image512pxLink || 
                  item.inspectImageLink || 
                  item.gridImageLink || 
                  item.imageLink || 
                  item.iconLink || 
                  item.imageLinkFallback || 
                  item.image
                }
                alt={item.name}
                className="w-12 h-12 object-contain rounded bg-tarkov-dark/50 p-1"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const fallbacks = [
                    item.image8xLink,
                    item.image512pxLink,
                    item.inspectImageLink,
                    item.gridImageLink,
                    item.imageLink,
                    item.iconLink,
                    item.imageLinkFallback,
                    item.image
                  ].filter(Boolean);
                  
                  const currentSrc = img.src;
                  const currentIndex = fallbacks.findIndex(url => url && currentSrc.includes(url));
                  if (currentIndex < fallbacks.length - 1) {
                    img.src = fallbacks[currentIndex + 1]!;
                  }
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-tarkov-light truncate">
              {item.name}
            </h4>
            
            {item.shortName && (
              <p className="text-sm text-tarkov-muted">
                {item.shortName}
              </p>
            )}
            
            {item.category && (
              <span className="inline-block px-2 py-0.5 mt-1 text-xs bg-tarkov-accent/20 text-tarkov-accent rounded">
                {item.category}
              </span>
            )}
            
            {showPrice && item.price && (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-semibold text-tarkov-light">
                  ₽{item.price.toLocaleString()}
                </span>
                
                {showChange && item.change24h !== undefined && (
                  <span className={cn(
                    'text-sm font-medium',
                    getPriceChangeColor(item.change24h)
                  )}>
                    {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
          </div>
          
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

ItemCard.displayName = 'ItemCard';

export { Card, CardHeader, CardContent, CardTitle, CardFooter, ItemCard };
export type { CardProps, CardHeaderProps, CardContentProps, CardTitleProps, CardFooterProps, ItemCardProps };