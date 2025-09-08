import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    value,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasValue = value !== undefined && value !== '';
    const showClearButton = clearable && hasValue && !disabled;
    const showPasswordToggle = type === 'password';

    const baseClasses = [
      'w-full rounded-md border transition-all duration-200',
      'bg-tarkov-secondary/50 text-tarkov-light placeholder-tarkov-muted',
      'focus:outline-none focus:ring-2 focus:ring-tarkov-accent/50 focus:border-tarkov-accent',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-tarkov-secondary/30',
    ].join(' ');

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
      : 'border-tarkov-border hover:border-tarkov-accent/50';

    const sizeClasses = leftIcon || rightIcon || showPasswordToggle || showClearButton
      ? 'h-10 pl-10 pr-10'
      : 'h-10 px-3';

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-tarkov-light mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tarkov-muted">
              <span className="w-4 h-4 flex items-center justify-center">
                {leftIcon}
              </span>
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              baseClasses,
              errorClasses,
              sizeClasses,
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle || showClearButton) && 'pr-10',
              className
            )}
            ref={ref}
            value={value}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="text-tarkov-muted hover:text-tarkov-light transition-colors p-0.5 rounded"
                tabIndex={-1}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {showPasswordToggle && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-tarkov-muted hover:text-tarkov-light transition-colors p-0.5 rounded"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}

            {rightIcon && !showPasswordToggle && !showClearButton && (
              <span className="text-tarkov-muted w-4 h-4 flex items-center justify-center">
                {rightIcon}
              </span>
            )}
          </div>
        </div>

        {(error || helperText) && (
          <div className="mt-1.5">
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-tarkov-muted">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void;
  searchDelay?: number;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, searchDelay = 300, ...props }, ref) => {
    const [searchValue, setSearchValue] = React.useState('');
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (onSearch) {
        timeoutRef.current = setTimeout(() => {
          onSearch(searchValue);
        }, searchDelay);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [searchValue, onSearch, searchDelay]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleClear = () => {
      setSearchValue('');
      if (onSearch) {
        onSearch('');
      }
      if (props.onClear) {
        props.onClear();
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={searchValue}
        onChange={handleChange}
        onClear={handleClear}
        leftIcon={<Search className="w-4 h-4" />}
        clearable
        placeholder={props.placeholder || 'Buscar...'}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { Input, SearchInput };
export type { InputProps, SearchInputProps };