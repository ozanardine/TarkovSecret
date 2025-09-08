import { useState, useEffect, useCallback } from 'react';
import { ImageRequest, ImagesResponse, ImageData, ImageType } from '@/types/api';

interface UseImagesOptions {
  type: 'items' | 'traders' | 'quests' | 'maps' | 'skills' | 'all';
  ids?: string[];
  names?: string[];
  limit?: number;
  imageTypes?: ImageType[];
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseImagesReturn {
  data: ImageData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  metadata: {
    total: number;
    type: string;
    processingTime: number;
    cached: boolean;
  } | null;
}

export function useImages(options: UseImagesOptions): UseImagesReturn {
  const [data, setData] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UseImagesReturn['metadata']>(null);

  const fetchImages = useCallback(async () => {
    if (!options.enabled && options.enabled !== undefined) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('type', options.type);
      
      if (options.ids && options.ids.length > 0) {
        queryParams.append('ids', options.ids.join(','));
      }
      
      if (options.names && options.names.length > 0) {
        queryParams.append('names', options.names.join(','));
      }
      
      if (options.limit) {
        queryParams.append('limit', options.limit.toString());
      }
      
      if (options.imageTypes && options.imageTypes.length > 0) {
        queryParams.append('imageTypes', options.imageTypes.join(','));
      }

      const response = await fetch(`/api/images?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ImagesResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch images');
      }
      
      setData(result.data);
      setMetadata(result.metadata);
    } catch (err) {
      console.error('Error fetching images:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    options.type,
    options.ids?.join(','),
    options.names?.join(','),
    options.limit,
    options.imageTypes?.join(','),
    options.enabled
  ]);

  const refetch = useCallback(async () => {
    await fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (options.refetchOnMount !== false) {
      fetchImages();
    }
  }, [
    options.type,
    options.ids?.join(','),
    options.names?.join(','),
    options.limit,
    options.imageTypes?.join(','),
    options.enabled,
    options.refetchOnMount
  ]);

  return {
    data,
    loading,
    error,
    refetch,
    metadata
  };
}

// Hook específico para imagens de itens
export function useItemImages(options: {
  ids?: string[];
  names?: string[];
  limit?: number;
  imageTypes?: ImageType[];
  enabled?: boolean;
}) {
  return useImages({
    ...options,
    type: 'items'
  });
}

// Hook específico para imagens de traders
export function useTraderImages(options: {
  ids?: string[];
  names?: string[];
  imageTypes?: ImageType[];
  enabled?: boolean;
} = {}) {
  return useImages({
    ...options,
    type: 'traders'
  });
}

// Hook específico para imagens de quests
export function useQuestImages(options: {
  ids?: string[];
  names?: string[];
  limit?: number;
  imageTypes?: ImageType[];
  enabled?: boolean;
} = {}) {
  return useImages({
    ...options,
    type: 'quests'
  });
}

// Hook específico para imagens de mapas
export function useMapImages(options: {
  ids?: string[];
  names?: string[];
  imageTypes?: ImageType[];
  enabled?: boolean;
} = {}) {
  return useImages({
    ...options,
    type: 'maps'
  });
}

// Hook específico para imagens de skills
export function useSkillImages(options: {
  ids?: string[];
  names?: string[];
  limit?: number;
  imageTypes?: ImageType[];
  enabled?: boolean;
} = {}) {
  return useImages({
    ...options,
    type: 'skills'
  });
}

// Hook para buscar uma imagem específica por ID
export function useImageById(id: string, type: 'items' | 'traders' | 'quests' | 'maps' | 'skills') {
  const { data, loading, error, refetch, metadata } = useImages({
    type,
    ids: [id],
    enabled: !!id
  });

  return {
    image: data[0] || null,
    loading,
    error,
    refetch,
    metadata
  };
}

// Hook para buscar múltiplas imagens por nome
export function useImagesByName(names: string[], type: 'items' | 'traders' | 'quests' | 'maps' | 'skills') {
  return useImages({
    type,
    names,
    enabled: names.length > 0
  });
}

// Hook para buscar todas as imagens de um tipo específico
export function useAllImages(type: 'items' | 'traders' | 'quests' | 'maps' | 'skills', limit?: number) {
  return useImages({
    type,
    limit
  });
}

export default useImages;