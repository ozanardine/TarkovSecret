'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:ring-offset-2 cursor-pointer",
        checked
          ? "bg-tarkov-accent border-tarkov-accent text-white"
          : "border-tarkov-border bg-transparent hover:border-tarkov-accent/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={disabled ? -1 : 0}
      id={id}
      {...props}
    >
      {checked && (
        <CheckIcon className="h-3 w-3" strokeWidth={3} />
      )}
      {/* Hidden input for form compatibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}} // Controlled by the div click handler
        disabled={disabled}
        name={name}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
}

export default Checkbox;