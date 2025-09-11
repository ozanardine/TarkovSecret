'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}>({} as any);

export function Select({ value, onValueChange, children, disabled, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, setOpen, disabled } = useContext(SelectContext);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-tarkov-border bg-tarkov-dark px-3 py-2 text-sm text-tarkov-light placeholder:text-tarkov-muted focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
    >
      {children}
      <ChevronDownIcon className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
    </button>
  );
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = useContext(SelectContext);
  const [displayValue, setDisplayValue] = useState<string>('');

  // Find the display value from the selected item
  useEffect(() => {
    if (value) {
      // This will be set by SelectItem when it renders
      setDisplayValue(value);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  return (
    <span className={cn("block truncate", !value && "text-tarkov-muted", className)}>
      {displayValue || placeholder}
    </span>
  );
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-tarkov-border bg-tarkov-dark py-1 text-base shadow-lg focus:outline-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-tarkov-light outline-none hover:bg-tarkov-accent/10 focus:bg-tarkov-accent/10",
        isSelected && "bg-tarkov-accent/20",
        className
      )}
      onClick={handleClick}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <CheckIcon className="h-4 w-4 text-tarkov-accent" />}
      </span>
      {children}
    </div>
  );
}