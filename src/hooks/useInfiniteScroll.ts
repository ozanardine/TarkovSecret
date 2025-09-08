import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  delay?: number;
}

interface UseInfiniteScrollReturn {
  ref: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    delay = 100
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    onLoadMore();
    
    // Simular delay para melhor UX
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, delay);
  }, [isLoading, onLoadMore, delay]);

  const reset = useCallback(() => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, threshold, rootMargin, loadMore, isLoading]);

  return {
    ref,
    isLoading,
    loadMore,
    reset
  };
}
