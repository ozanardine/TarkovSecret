import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className,
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, closeOnEscape]);

  // Handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full mx-4 transition-all duration-300 transform',
          sizes[size],
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
      >
        <div className="bg-tarkov-secondary border border-tarkov-border rounded-lg shadow-2xl shadow-black/50 max-h-[90vh] overflow-hidden">
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-tarkov-border">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 className="text-xl font-semibold text-tarkov-light truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-tarkov-muted mt-1">
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-4 flex-shrink-0"
                  aria-label="Fechar modal"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-b border-tarkov-border', className)}>
      {children}
    </div>
  );
};

// Modal Content Component
interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

const ModalContent: React.FC<ModalContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

// Modal Footer Component
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

const ModalFooter: React.FC<ModalFooterProps> = ({ 
  children, 
  className, 
  align = 'right' 
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-6 border-t border-tarkov-border bg-tarkov-secondary/50',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  loading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmVariant: 'danger' as const,
          iconColor: 'text-red-500',
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmVariant: 'primary' as const,
          iconColor: 'text-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          confirmVariant: 'primary' as const,
          iconColor: 'text-blue-500',
        };
    }
  };

  const { icon, confirmVariant, iconColor } = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <ModalContent>
        <div className="flex items-start gap-4">
          <div className={cn('text-2xl', iconColor)}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-tarkov-light">
              {message}
            </p>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { Modal, ModalHeader, ModalContent, ModalFooter, ConfirmModal };
export type { ModalProps, ModalHeaderProps, ModalContentProps, ModalFooterProps, ConfirmModalProps };