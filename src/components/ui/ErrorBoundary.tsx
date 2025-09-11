'use client';

import React, { useState, useCallback } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'card';
  showIcon?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = 'Erro ao carregar dados',
  description,
  className,
  variant = 'default',
  showIcon = true,
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  
  const content = (
    <div className={cn(
      'text-center',
      variant === 'minimal' && 'py-4',
      variant === 'default' && 'py-8',
      variant === 'card' && 'p-6',
      className
    )}>
      {showIcon && (
        <ExclamationTriangleIcon className={cn(
          'mx-auto mb-4 text-red-400',
          variant === 'minimal' ? 'w-8 h-8' : 'w-12 h-12'
        )} />
      )}
      
      <h3 className={cn(
        'font-semibold text-white mb-2',
        variant === 'minimal' ? 'text-base' : 'text-lg'
      )}>
        {title}
      </h3>
      
      {description && (
        <p className="text-tarkov-text-secondary mb-4">
          {description}
        </p>
      )}
      
      <p className="text-sm text-red-300 mb-4">
        {errorMessage}
      </p>
      
      {onRetry && (
        <Button
          variant="outline"
          size={variant === 'minimal' ? 'sm' : 'md'}
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry, className }) => (
  <ErrorDisplay
    error="Erro de conexão com o servidor"
    title="Problema de Conectividade"
    description="Verifique sua conexão com a internet e tente novamente."
    onRetry={onRetry}
    className={className}
  />
);

interface NotFoundErrorProps {
  resource?: string;
  onGoBack?: () => void;
  className?: string;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({ 
  resource = 'recurso', 
  onGoBack, 
  className 
}) => (
  <ErrorDisplay
    error={`${resource} não encontrado`}
    title="Não Encontrado"
    description={`O ${resource.toLowerCase()} solicitado não foi encontrado ou não existe.`}
    onRetry={onGoBack}
    className={className}
  />
);

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          title="Algo deu errado"
          description="Ocorreu um erro inesperado. Tente recarregar a página."
          onRetry={this.resetError}
          variant="card"
        />
      );
    }

    return this.props.children;
  }
}

// Hook para tratamento de erros assíncronos
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    setError(message);
    console.error('Error handled:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback((fn: () => void | Promise<void>) => {
    clearError();
    try {
      const result = fn();
      if (result instanceof Promise) {
        result.catch(handleError);
      }
    } catch (err) {
      handleError(err);
    }
  }, [clearError, handleError]);

  return {
    error,
    handleError,
    clearError,
    retry,
  };
}