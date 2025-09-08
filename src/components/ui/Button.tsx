import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-md font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tarkov-dark',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
    ].join(' ');

    const variants = {
      primary: [
        'bg-tarkov-accent text-white shadow-lg shadow-tarkov-accent/25',
        'hover:bg-tarkov-accent/90 hover:shadow-tarkov-accent/40',
        'focus:ring-tarkov-accent/50',
      ].join(' '),
      secondary: [
        'bg-tarkov-secondary text-tarkov-light border border-tarkov-border',
        'hover:bg-tarkov-secondary/80 hover:border-tarkov-accent/50',
        'focus:ring-tarkov-secondary/50',
      ].join(' '),
      outline: [
        'border-2 border-tarkov-accent text-tarkov-accent bg-transparent',
        'hover:bg-tarkov-accent hover:text-white',
        'focus:ring-tarkov-accent/50',
      ].join(' '),
      ghost: [
        'text-tarkov-light bg-transparent',
        'hover:bg-tarkov-secondary/50 hover:text-tarkov-accent',
        'focus:ring-tarkov-light/20',
      ].join(' '),
      danger: [
        'bg-red-600 text-white shadow-lg shadow-red-600/25',
        'hover:bg-red-700 hover:shadow-red-600/40',
        'focus:ring-red-500/50',
      ].join(' '),
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    const iconSize = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const renderIcon = (iconElement: React.ReactNode) => (
      <span className={cn('flex-shrink-0', iconSize[size])}>
        {iconElement}
      </span>
    );

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className={cn('animate-spin', iconSize[size])} style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
            {children && <span>Carregando...</span>}
          </>
        );
      }

      if (icon && iconPosition === 'left') {
        return (
          <>
            {renderIcon(icon)}
            {children}
          </>
        );
      }

      if (icon && iconPosition === 'right') {
        return (
          <>
            {children}
            {renderIcon(icon)}
          </>
        );
      }

      return children;
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        style={{
          transition: 'background-color 0.15s ease-out, color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out',
          willChange: 'background-color, color, transform, box-shadow',
          transform: 'translateZ(0)',
          ...props.style
        }}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };