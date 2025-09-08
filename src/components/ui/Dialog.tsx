'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

const Dialog: React.FC<DialogProps> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, setOpen]);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, className }) => {
  const { setOpen } = React.useContext(DialogContext);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <div onClick={handleClick} className={cn('cursor-pointer', className)}>
      {children}
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ 
  children, 
  className, 
  showCloseButton = true 
}) => {
  const { open, setOpen } = React.useContext(DialogContext);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        className={cn(
          'relative bg-tarkov-secondary border border-tarkov-border rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-thin',
          className
        )}
      >
        {showCloseButton && (
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-tarkov-dark/80 hover:bg-tarkov-dark text-tarkov-light hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export { Dialog, DialogTrigger, DialogContent };