import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorToast, useSuccessToast } from '@/components/ui/Toast';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
  showToasts?: boolean;
  successMessage?: string;
}

interface UseRetryReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  attempt: number;
  canRetry: boolean;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    onError,
    onSuccess,
    showToasts = false,
    successMessage,
  } = options;

  const showError = useErrorToast();
  const showSuccess = useSuccessToast();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeWithRetry = useCallback(async (currentAttempt: number = 0) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setAttempt(currentAttempt);

    try {
      const result = await asyncFunction();
      
      if (!mountedRef.current) return;
      
      setData(result);
      setError(null);
      setLoading(false);
      onSuccess?.();
      
      if (showToasts && successMessage && currentAttempt > 0) {
        showSuccess('Operação realizada com sucesso', successMessage);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      onError?.(err instanceof Error ? err : new Error(errorMessage), currentAttempt + 1);
      
      if (currentAttempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, currentAttempt);
        
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            executeWithRetry(currentAttempt + 1);
          }
        }, delay);
      } else {
        setError(errorMessage);
        setLoading(false);
        
        if (showToasts) {
          showError(
            'Erro após múltiplas tentativas',
            `Falha ao executar operação: ${errorMessage}`,
            {
              label: 'Tentar novamente',
              onClick: () => retry()
            }
          );
        }
      }
    }
  }, [asyncFunction, maxRetries, retryDelay, backoffMultiplier, onError, onSuccess]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt(0);
    executeWithRetry(0);
  }, [executeWithRetry]);

  useEffect(() => {
    executeWithRetry(0);
  }, dependencies);

  const canRetry = !loading && error !== null && attempt >= maxRetries;

  return {
    data,
    loading,
    error,
    retry,
    attempt,
    canRetry,
  };
}

// Hook específico para operações que podem falhar temporariamente
export function useNetworkRetry<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseRetryReturn<T> {
  return useRetry(asyncFunction, dependencies, {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 1.5,
    onError: (error, attempt) => {
      console.warn(`Network request failed (attempt ${attempt}):`, error.message);
    },
  });
}

// Hook para operações críticas com mais tentativas
export function useCriticalRetry<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseRetryReturn<T> {
  return useRetry(asyncFunction, dependencies, {
    maxRetries: 5,
    retryDelay: 2000,
    backoffMultiplier: 2,
    onError: (error, attempt) => {
      console.error(`Critical operation failed (attempt ${attempt}):`, error.message);
    },
  });
}

// Hook para operações rápidas com retry imediato
export function useQuickRetry<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseRetryReturn<T> {
  return useRetry(asyncFunction, dependencies, {
    maxRetries: 2,
    retryDelay: 500,
    backoffMultiplier: 1,
    onError: (error, attempt) => {
      console.log(`Quick operation failed (attempt ${attempt}):`, error.message);
    },
  });
}