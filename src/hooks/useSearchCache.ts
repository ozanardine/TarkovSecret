import { useState, useCallback, useEffect } from 'react';
import { Item } from '@/types/tarkov';
import { ImageSearchResult } from './useImageSearch';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface SearchCacheOptions {
  maxEntries?: number;
  defaultTTL?: number; // Time to live in milliseconds
  persistToStorage?: boolean;
}

interface UseSearchCacheReturn {
  // Text search cache
  getCachedTextSearch: (query: string) => Item[] | null;
  setCachedTextSearch: (query: string, results: Item[], ttl?: number) => void;
  
  // Image search cache
  getCachedImageSearch: (imageHash: string) => ImageSearchResult[] | null;
  setCachedImageSearch: (imageHash: string, results: ImageSearchResult[], ttl?: number) => void;
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => {
    textSearchEntries: number;
    imageSearchEntries: number;
    totalSize: number;
    hitRate: number;
  };
  
  // Cache optimization
  cleanupExpired: () => void;
  preloadPopularSearches: () => void;
}

const DEFAULT_OPTIONS: Required<SearchCacheOptions> = {
  maxEntries: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  persistToStorage: true
};

const STORAGE_KEYS = {
  TEXT_CACHE: 'tarkov_text_search_cache',
  IMAGE_CACHE: 'tarkov_image_search_cache',
  CACHE_STATS: 'tarkov_cache_stats'
};

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
}

// Utility function to generate hash for images
const generateImageHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Utility function to estimate object size in bytes
const estimateSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size;
};

export const useSearchCache = (options: SearchCacheOptions = {}): UseSearchCacheReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [textCache, setTextCache] = useState<Map<string, CacheEntry<Item[]>>>(new Map());
  const [imageCache, setImageCache] = useState<Map<string, CacheEntry<ImageSearchResult[]>>>(new Map());
  const [stats, setStats] = useState<CacheStats>({ hits: 0, misses: 0, totalRequests: 0 });

  // Load cache from localStorage on mount
  useEffect(() => {
    if (!config.persistToStorage || typeof window === 'undefined') return;

    try {
      // Load text search cache
      const savedTextCache = localStorage.getItem(STORAGE_KEYS.TEXT_CACHE);
      if (savedTextCache) {
        const parsed = JSON.parse(savedTextCache);
        const cacheMap = new Map<string, CacheEntry<Item[]>>();
        
        Object.entries(parsed).forEach(([key, value]) => {
          const entry = value as CacheEntry<Item[]>;
          if (entry.expiresAt > Date.now()) {
            cacheMap.set(key, entry);
          }
        });
        
        setTextCache(cacheMap);
      }

      // Load image search cache
      const savedImageCache = localStorage.getItem(STORAGE_KEYS.IMAGE_CACHE);
      if (savedImageCache) {
        const parsed = JSON.parse(savedImageCache);
        const cacheMap = new Map<string, CacheEntry<ImageSearchResult[]>>();
        
        Object.entries(parsed).forEach(([key, value]) => {
          const entry = value as CacheEntry<ImageSearchResult[]>;
          if (entry.expiresAt > Date.now()) {
            cacheMap.set(key, entry);
          }
        });
        
        setImageCache(cacheMap);
      }

      // Load stats
      const savedStats = localStorage.getItem(STORAGE_KEYS.CACHE_STATS);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
    }
  }, [config.persistToStorage]);

  // Save cache to localStorage when it changes
  useEffect(() => {
    if (!config.persistToStorage || typeof window === 'undefined') return;

    try {
      // Save text cache
      const textCacheObj = Object.fromEntries(textCache.entries());
      localStorage.setItem(STORAGE_KEYS.TEXT_CACHE, JSON.stringify(textCacheObj));

      // Save image cache
      const imageCacheObj = Object.fromEntries(imageCache.entries());
      localStorage.setItem(STORAGE_KEYS.IMAGE_CACHE, JSON.stringify(imageCacheObj));

      // Save stats
      localStorage.setItem(STORAGE_KEYS.CACHE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }, [textCache, imageCache, stats, config.persistToStorage]);

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpired();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const updateStats = useCallback((hit: boolean) => {
    setStats(prev => ({
      hits: hit ? prev.hits + 1 : prev.hits,
      misses: hit ? prev.misses : prev.misses + 1,
      totalRequests: prev.totalRequests + 1
    }));
  }, []);

  const evictLRU = useCallback(<T>(cache: Map<string, CacheEntry<T>>) => {
    if (cache.size <= config.maxEntries) return cache;

    // Sort by last accessed time and remove oldest entries
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    const newCache = new Map<string, CacheEntry<T>>();
    entries.slice(-(config.maxEntries - 1)).forEach(([key, value]) => {
      newCache.set(key, value);
    });
    
    return newCache;
  }, [config.maxEntries]);

  const getCachedTextSearch = useCallback((query: string): Item[] | null => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return null;

    const entry = textCache.get(normalizedQuery);
    
    if (!entry) {
      updateStats(false);
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      setTextCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(normalizedQuery);
        return newCache;
      });
      updateStats(false);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    updateStats(true);
    return entry.data;
  }, [textCache, updateStats]);

  const setCachedTextSearch = useCallback((query: string, results: Item[], ttl?: number) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery || results.length === 0) return;

    const now = Date.now();
    const entry: CacheEntry<Item[]> = {
      data: results,
      timestamp: now,
      expiresAt: now + (ttl || config.defaultTTL),
      accessCount: 1,
      lastAccessed: now
    };

    setTextCache(prev => {
      const newCache = new Map(prev);
      newCache.set(normalizedQuery, entry);
      return evictLRU(newCache);
    });
  }, [config.defaultTTL, evictLRU]);

  const getCachedImageSearch = useCallback((imageHash: string): ImageSearchResult[] | null => {
    if (!imageHash) return null;

    const entry = imageCache.get(imageHash);
    
    if (!entry) {
      updateStats(false);
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      setImageCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(imageHash);
        return newCache;
      });
      updateStats(false);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    updateStats(true);
    return entry.data;
  }, [imageCache, updateStats]);

  const setCachedImageSearch = useCallback((imageHash: string, results: ImageSearchResult[], ttl?: number) => {
    if (!imageHash || results.length === 0) return;

    const now = Date.now();
    const entry: CacheEntry<ImageSearchResult[]> = {
      data: results,
      timestamp: now,
      expiresAt: now + (ttl || config.defaultTTL),
      accessCount: 1,
      lastAccessed: now
    };

    setImageCache(prev => {
      const newCache = new Map(prev);
      newCache.set(imageHash, entry);
      return evictLRU(newCache);
    });
  }, [config.defaultTTL, evictLRU]);

  const clearCache = useCallback(() => {
    setTextCache(new Map());
    setImageCache(new Map());
    setStats({ hits: 0, misses: 0, totalRequests: 0 });
    
    if (config.persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TEXT_CACHE);
      localStorage.removeItem(STORAGE_KEYS.IMAGE_CACHE);
      localStorage.removeItem(STORAGE_KEYS.CACHE_STATS);
    }
  }, [config.persistToStorage]);

  const getCacheStats = useCallback(() => {
    const textSearchEntries = textCache.size;
    const imageSearchEntries = imageCache.size;
    
    // Estimate total cache size
    let totalSize = 0;
    textCache.forEach(entry => {
      totalSize += estimateSize(entry);
    });
    imageCache.forEach(entry => {
      totalSize += estimateSize(entry);
    });

    const hitRate = stats.totalRequests > 0 ? (stats.hits / stats.totalRequests) * 100 : 0;

    return {
      textSearchEntries,
      imageSearchEntries,
      totalSize,
      hitRate
    };
  }, [textCache, imageCache, stats]);

  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    
    setTextCache(prev => {
      const newCache = new Map(prev);
      let hasChanges = false;
      
      prev.forEach((entry, key) => {
        if (entry.expiresAt <= now) {
          newCache.delete(key);
          hasChanges = true;
        }
      });
      
      return hasChanges ? newCache : prev;
    });

    setImageCache(prev => {
      const newCache = new Map(prev);
      let hasChanges = false;
      
      prev.forEach((entry, key) => {
        if (entry.expiresAt <= now) {
          newCache.delete(key);
          hasChanges = true;
        }
      });
      
      return hasChanges ? newCache : prev;
    });
  }, []);

  const preloadPopularSearches = useCallback(() => {
    // Popular search terms that could be preloaded
    const popularSearches = [
      'ak-74m', 'bitcoin', 'ifak', 'paca', 'm4a1',
      'labs keycard', 'red keycard', 'thicc case',
      'graphics card', 'tetriz'
    ];

    // This would typically make API calls to preload popular searches
    // For now, we'll just log the intent
    console.log('Preloading popular searches:', popularSearches);
  }, []);

  return {
    getCachedTextSearch,
    setCachedTextSearch,
    getCachedImageSearch,
    setCachedImageSearch,
    clearCache,
    getCacheStats,
    cleanupExpired,
    preloadPopularSearches
  };
};

export default useSearchCache;

// Utility function to generate hash for multiple images
export const generateImageHashForFiles = async (files: File[]): Promise<string> => {
  const hashes = await Promise.all(
    files.map(file => generateImageHash(file))
  );
  
  // Combine hashes and create a composite hash
  const combinedHash = hashes.sort().join('');
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};