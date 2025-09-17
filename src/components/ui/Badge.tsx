import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    removable = false,
    onRemove,
    icon,
    children,
    ...props
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200',
      'border',
    ].join(' ');

    const variants = {
      default: [
        'bg-tarkov-secondary/80 text-tarkov-light border-tarkov-border',
        'hover:bg-tarkov-secondary',
      ].join(' '),
      primary: [
        'bg-tarkov-accent/20 text-tarkov-accent border-tarkov-accent/30',
        'hover:bg-tarkov-accent/30',
      ].join(' '),
      secondary: [
        'bg-gray-500/20 text-gray-300 border-gray-500/30',
        'hover:bg-gray-500/30',
      ].join(' '),
      success: [
        'bg-green-500/20 text-green-400 border-green-500/30',
        'hover:bg-green-500/30',
      ].join(' '),
      warning: [
        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'hover:bg-yellow-500/30',
      ].join(' '),
      danger: [
        'bg-red-500/20 text-red-400 border-red-500/30',
        'hover:bg-red-500/30',
      ].join(' '),
      info: [
        'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'hover:bg-blue-500/30',
      ].join(' '),
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-3.5 h-3.5',
      lg: 'w-4 h-4',
    };

    return (
      <span
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <span className={cn('flex-shrink-0', iconSizes[size])}>
            {icon}
          </span>
        )}
        
        {children}
        
        {removable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'flex-shrink-0 rounded-full hover:bg-current/20 transition-colors',
              iconSizes[size],
              'ml-1 -mr-1'
            )}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge Component
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive';
  showDot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, showDot = true, className, ...props }, ref) => {
    const statusConfig = {
      online: { variant: 'success' as const, label: 'Online', dotColor: 'bg-green-500' },
      offline: { variant: 'secondary' as const, label: 'Offline', dotColor: 'bg-gray-500' },
      away: { variant: 'warning' as const, label: 'Ausente', dotColor: 'bg-yellow-500' },
      busy: { variant: 'danger' as const, label: 'Ocupado', dotColor: 'bg-red-500' },
      active: { variant: 'success' as const, label: 'Ativo', dotColor: 'bg-green-500' },
      inactive: { variant: 'secondary' as const, label: 'Inativo', dotColor: 'bg-gray-500' },
    };

    const config = statusConfig[status];

    return (
      <Badge
        variant={config.variant}
        className={className}
        ref={ref}
        icon={showDot ? (
          <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
        ) : undefined}
        {...props}
      >
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Price Change Badge
interface PriceChangeBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  change: number;
  showSign?: boolean;
  showPercentage?: boolean;
}

const PriceChangeBadge = React.forwardRef<HTMLSpanElement, PriceChangeBadgeProps>(
  ({ change, showSign = true, showPercentage = true, className, ...props }, ref) => {
    const getVariant = () => {
      if (change > 0) return 'success';
      if (change < 0) return 'danger';
      return 'secondary';
    };

    const formatChange = () => {
      const sign = showSign ? (change > 0 ? '+' : '') : '';
      const percentage = showPercentage ? '%' : '';
      return `${sign}${change.toFixed(1)}${percentage}`;
    };

    return (
      <Badge
        variant={getVariant()}
        className={className}
        ref={ref}
        {...props}
      >
        {formatChange()}
      </Badge>
    );
  }
);

PriceChangeBadge.displayName = 'PriceChangeBadge';

// Item Type Badge - Tarkov uses item types/categories instead of traditional rarity
interface ItemTypeBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  itemType: string;
  size?: 'sm' | 'md' | 'lg';
}

const ItemTypeBadge = React.forwardRef<HTMLSpanElement, ItemTypeBadgeProps>(
  ({ itemType, size = 'sm', className, ...props }, ref) => {
    // Tarkov-style colors based on item categories
    const getTypeStyle = (type: string) => {
      const normalizedType = type.toLowerCase();
      
      if (normalizedType.includes('weapon')) {
        return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      }
      if (normalizedType.includes('armor') || normalizedType.includes('helmet')) {
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      }
      if (normalizedType.includes('medical') || normalizedType.includes('stim')) {
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      }
      if (normalizedType.includes('key') || normalizedType.includes('keycard')) {
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      }
      if (normalizedType.includes('barter') || normalizedType.includes('loot')) {
        return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      }
      if (normalizedType.includes('ammo') || normalizedType.includes('ammunition')) {
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      }
      // Default for other types
      return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    };

    const sizeClasses = {
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };

    return (
      <span
        className={cn(
          'inline-flex items-center rounded border font-medium',
          getTypeStyle(itemType),
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {itemType}
      </span>
    );
  }
);

ItemTypeBadge.displayName = 'ItemTypeBadge';

// Subscription Badge
interface SubscriptionBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  type: 'FREE' | 'PLUS';
}

const SubscriptionBadge = React.forwardRef<HTMLSpanElement, SubscriptionBadgeProps>(
  ({ type, className, ...props }, ref) => {
    // Não mostrar badge para usuários FREE
    if (type === 'FREE') {
      return null;
    }

    const config = {
      PLUS: { variant: 'primary' as const, label: 'Plus' },
    };

    return (
      <Badge
        variant={config[type].variant}
        className={className}
        ref={ref}
        {...props}
      >
        {config[type].label}
      </Badge>
    );
  }
);

SubscriptionBadge.displayName = 'SubscriptionBadge';

// Notification Badge
interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  className,
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1',
        'bg-red-500 text-white text-xs font-medium',
        'rounded-full flex items-center justify-center',
        'border-2 border-tarkov-dark',
        className
      )}
    >
      {displayCount}
    </span>
  );
};

export {
  Badge,
  StatusBadge,
  PriceChangeBadge,
  ItemTypeBadge,
  SubscriptionBadge,
  NotificationBadge,
};

export type {
  BadgeProps,
  StatusBadgeProps,
  PriceChangeBadgeProps,
  ItemTypeBadgeProps,
  SubscriptionBadgeProps,
  NotificationBadgeProps,
};