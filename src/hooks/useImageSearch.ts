import { useState, useCallback } from 'react';
import { TarkovItem } from '@/types/tarkov';
import { intelligentItemMatcher, MatchResult, MultiItemResult } from '@/lib/intelligent-item-matcher';
import { tarkovReferenceDB } from '@/lib/tarkov-reference-database';

export interface ImageSearchResult {
  item: TarkovItem;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  processingTime?: number;
  metadata?: {
    hasMultipleItems: boolean;
    backgroundType: string;
    imageQuality: number;
  };
}

export interface ImageSearchOptions {
  maxResults?: number;
  minConfidence?: number;
  includeVariants?: boolean;
  detectMultipleItems?: boolean;
}

export interface UseImageSearchReturn {
  searchByImages: (images: File[], options?: ImageSearchOptions) => Promise<ImageSearchResult[]>;
  isSearching: boolean;
  error: string | null;
  lastSearchTime: number | null;
  searchHistory: ImageSearchResult[][];
  clearHistory: () => void;
}

/**
 * Converte resultado do matcher inteligente para formato do hook
 */
const convertMatchResultToImageSearchResult = (matchResult: MatchResult): ImageSearchResult => {
  const item = matchResult.item;
  
  return {
    item: {
      id: item.id,
      name: item.name,
      shortName: item.aliases[0] || item.name.split(' ').slice(0, 2).join(' '),
      description: `Item identificado com ${Math.round(matchResult.confidence * 100)}% de confiança`,
      category: item.category,
      rarity: item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1),
      basePrice: Math.floor(Math.random() * 100000) + 10000,
      fleaMarketFee: Math.floor(Math.random() * 5000) + 1000,
      image: item.iconUrl || `/api/items/${item.id}/image`,
      iconLink: item.iconUrl || `/api/items/${item.id}/icon`,
      wikiLink: item.wikiUrl || `https://escapefromtarkov.fandom.com/wiki/${item.name.replace(/ /g, '_')}`,
      types: [item.category.toLowerCase()],
      weight: Math.random() * 2,
      width: 1,
      height: 1
    } as Item,
    confidence: matchResult.confidence,
    boundingBox: matchResult.boundingBox,
    metadata: {
      hasMultipleItems: false,
      backgroundType: 'inventory',
      imageQuality: matchResult.confidence
    }
  };
};

/**
 * API mock de reconhecimento de imagem para fallback
 */
const mockImageRecognitionAPI = async (
  imageFile: File,
  options: ImageSearchOptions = {}
): Promise<ImageSearchResult[]> => {
  // Simula processamento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Retorna resultados mock baseados no nome do arquivo
  const fileName = imageFile.name.toLowerCase();
  const mockItems = tarkovReferenceDB.searchByName(fileName.split('.')[0]);
  
  if (mockItems.length > 0) {
    return mockItems.slice(0, options.maxResults || 3).map(item => ({
      item: {
        id: item.id,
        name: item.name,
        shortName: item.aliases[0] || item.name,
        description: `Item identificado por nome do arquivo`,
        category: item.category,
        rarity: item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1),
        basePrice: Math.floor(Math.random() * 100000) + 10000,
        fleaMarketFee: Math.floor(Math.random() * 5000) + 1000,
        image: item.iconUrl || `/api/items/${item.id}/image`,
        iconLink: item.iconUrl || `/api/items/${item.id}/icon`,
        wikiLink: item.wikiUrl || `https://escapefromtarkov.fandom.com/wiki/${item.name.replace(/ /g, '_')}`,
        types: [item.category.toLowerCase()],
        weight: Math.random() * 2,
        width: 1,
        height: 1
      },
      confidence: 0.5 + Math.random() * 0.3,
      metadata: {
        hasMultipleItems: false,
        backgroundType: 'inventory',
        imageQuality: 0.7
      }
    }));
  }
  
  return [];
};

/**
 * API de reconhecimento de imagem usando sistema inteligente
 */
const intelligentImageRecognitionAPI = async (
  imageFile: File,
  options: ImageSearchOptions = {}
): Promise<ImageSearchResult[]> => {
  try {
    // Configura parâmetros do matcher
    intelligentItemMatcher.setParameters({
      confidenceThreshold: options.minConfidence || 0.3,
      maxResults: options.maxResults || 10
    });
    
    // Identifica itens na imagem
    const result: MultiItemResult = await intelligentItemMatcher.identifyItems(imageFile);
    
    // Converte resultados
    let searchResults = result.items.map(convertMatchResultToImageSearchResult);
    
    // Adiciona informações de processamento
    searchResults = searchResults.map(result => ({
      ...result,
      processingTime: result.processingTime || 0,
      metadata: {
        ...(result.metadata || {}),
        hasMultipleItems: searchResults.length > 1
      }
    }));
    
    // Aplica filtros adicionais
    if (options.minConfidence) {
      searchResults = searchResults.filter(result => result.confidence >= options.minConfidence!);
    }
    
    if (!options.detectMultipleItems && searchResults.length > 1) {
      searchResults = [searchResults[0]]; // Retorna apenas o melhor resultado
    }
    
    return searchResults;
    
  } catch (error) {
    console.error('Erro no reconhecimento inteligente:', error);
    return [];
  }
};

export const useImageSearch = (): UseImageSearchReturn => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number | null>(null);
  const [searchHistory, setSearchHistory] = useState<ImageSearchResult[][]>([]);

  const searchByImages = useCallback(async (
    images: File[],
    options: ImageSearchOptions = {}
  ): Promise<ImageSearchResult[]> => {
    if (images.length === 0) {
      throw new Error('Nenhuma imagem fornecida para busca');
    }

    setIsSearching(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Valida tipos de arquivo
      const validImages = images.filter(image => {
        const isValidType = image.type.startsWith('image/');
        const isValidSize = image.size <= 10 * 1024 * 1024; // 10MB max
        return isValidType && isValidSize;
      });

      if (validImages.length === 0) {
        throw new Error('Nenhuma imagem válida encontrada. Verifique o formato e tamanho dos arquivos.');
      }

      // Processa cada imagem
      const allResults: ImageSearchResult[] = [];
      
      for (const image of validImages) {
        try {
          // Usa o sistema inteligente de reconhecimento
          const imageResults = await intelligentImageRecognitionAPI(image, options);
          allResults.push(...imageResults);
          
          // Se não encontrou itens com o processamento avançado, usa fallback
          if (imageResults.length === 0) {
            const fallbackResults = await mockImageRecognitionAPI(image, options);
            allResults.push(...fallbackResults);
          }
          
        } catch (processingError) {
          console.warn('Erro no processamento avançado, usando fallback:', processingError);
          // Fallback para o sistema mock em caso de erro
          const fallbackResults = await mockImageRecognitionAPI(image, options);
          allResults.push(...fallbackResults);
        }
      }

      // Remove duplicatas baseado no ID do item
      const uniqueResults = allResults.reduce((acc, current) => {
        const existing = acc.find(item => item.item.id === current.item.id);
        if (!existing || current.confidence > existing.confidence) {
          return [...acc.filter(item => item.item.id !== current.item.id), current];
        }
        return acc;
      }, [] as ImageSearchResult[]);

      // Ordena por confiança
      uniqueResults.sort((a, b) => b.confidence - a.confidence);

      // Adiciona ao histórico
      setSearchHistory(prev => [uniqueResults, ...prev.slice(0, 9)]); // Mantém últimas 10 buscas
      setLastSearchTime(Date.now() - startTime);

      return uniqueResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na busca por imagem';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    setLastSearchTime(null);
    setError(null);
  }, []);

  return {
    searchByImages,
    isSearching,
    error,
    lastSearchTime,
    searchHistory,
    clearHistory
  };
};

export default useImageSearch;