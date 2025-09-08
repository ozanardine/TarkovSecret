import { useState, useEffect, useCallback } from 'react';
import { TarkovItem, TarkovQuest, HideoutStation, Barter } from '@/types/tarkov';
import { SearchParams, SearchResponse } from '@/types/api';
import { tarkovApi, tarkovDevApi } from '@/lib/tarkov-api';
import { debounce } from '@/lib/utils';
import { useNetworkRetry } from './useRetry';
import { useApiLanguage } from './useApiLanguage';

// Hook for searching items
export function useItemSearch() {
  const [items, setItems] = useState<TarkovItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResponse<TarkovItem> | null>(null);

  const searchItems = useCallback(
    debounce(async (params: SearchParams) => {
      if (!params.query && !params.category && !params.trader) {
        setItems([]);
        setSearchResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await tarkovApi.searchItems(params);
        setSearchResults(results);
        setItems(results.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar itens');
        setItems([]);
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const clearSearch = useCallback(() => {
    setItems([]);
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    items,
    searchResults,
    loading,
    error,
    searchItems,
    clearSearch,
  };
}

// Hook for getting a single item
export function useItem(itemId: string | null) {
  const fetchItem = useCallback(async () => {
    if (!itemId) {
      throw new Error('ID do item não fornecido');
    }
    return await tarkovDevApi.getItemById(itemId);
  }, [itemId]);

  const { data: item, loading, error, retry } = useNetworkRetry(
    fetchItem,
    [itemId]
  );

  // Se não há itemId, retorna estado vazio
  if (!itemId) {
    return { item: null, loading: false, error: null, retry: () => {} };
  }

  return { item, loading, error, retry };
}

// Hook for getting all items
export function useAllItems() {
  const [items, setItems] = useState<TarkovItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage, isLanguageLoading } = useApiLanguage();

  useEffect(() => {
    if (isLanguageLoading) return;

    const fetchAllItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const allItems = await tarkovDevApi.getItems();
        setItems(allItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, [currentLanguage, isLanguageLoading]);

  return { items, loading, error };
}

// Hook for getting popular items
export function usePopularItems(limit = 10) {
  const [items, setItems] = useState<TarkovItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const popularItems = await tarkovApi.getPopularItems(limit);
        setItems(popularItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar itens populares');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularItems();
  }, [limit]);

  return { items, loading, error };
}

// Hook for getting trending items
export function useTrendingItems(limit = 10) {
  const [items, setItems] = useState<TarkovItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingItems = async () => {
      try {
        const trendingItems = await tarkovApi.getTrendingItems(limit);
        setItems(trendingItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar itens em alta');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingItems();
  }, [limit]);

  return { items, loading, error };
}

// Hook for quest search with debounce
export function useQuestSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TarkovQuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allQuests, setAllQuests] = useState<TarkovQuest[]>([]);
  const { currentLanguage, isLanguageLoading } = useApiLanguage();

  // Load all quests when language changes
  useEffect(() => {
    if (isLanguageLoading) return;

    const fetchAllQuests = async () => {
      try {
        const quests = await tarkovDevApi.getQuests();
        setAllQuests(quests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar quests');
      }
    };

    fetchAllQuests();
  }, [currentLanguage, isLanguageLoading]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const filtered = allQuests.filter(quest => {
          const searchLower = term.toLowerCase();
          return (
            quest.name.toLowerCase().includes(searchLower) ||
            quest.trader?.name.toLowerCase().includes(searchLower) ||
            quest.map?.name.toLowerCase().includes(searchLower) ||
            quest.objectives?.some(obj => 
              obj.description?.toLowerCase().includes(searchLower) ||
              obj.type.toLowerCase().includes(searchLower)
            )
          );
        });

        setSearchResults(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro na busca');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [allQuests]
  );

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchTerm,
    searchResults,
    loading,
    error,
    search,
    clearSearch,
    hasResults: searchResults.length > 0,
    totalResults: searchResults.length,
  };
}

// Hook for getting quests
export function useQuests() {
  const [quests, setQuests] = useState<TarkovQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage, isLanguageLoading } = useApiLanguage();

  useEffect(() => {
    if (isLanguageLoading) return;

    const fetchQuests = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedQuests = await tarkovDevApi.getQuests();
        setQuests(fetchedQuests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar missões');
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [currentLanguage, isLanguageLoading]);

  return { quests, loading, error };
}

// Hook for getting hideout stations
export function useHideoutStations() {
  const [stations, setStations] = useState<HideoutStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const fetchedStations = await tarkovDevApi.getHideoutStations();
        setStations(fetchedStations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estações do esconderijo');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return { stations, loading, error };
}

// Hook for managing favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('tarkov-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const addToFavorites = useCallback((itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) return prev;
      const newFavorites = [...prev, itemId];
      localStorage.setItem('tarkov-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const removeFromFavorites = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(id => id !== itemId);
      localStorage.setItem('tarkov-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    if (favorites.includes(itemId)) {
      removeFromFavorites(itemId);
    } else {
      addToFavorites(itemId);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((itemId: string) => {
    return favorites.includes(itemId);
  }, [favorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  };
}

// Hook for managing quest favorites
export function useQuestFavorites() {
  const [questFavorites, setQuestFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load quest favorites from localStorage
    const savedFavorites = localStorage.getItem('tarkov-quest-favorites');
    if (savedFavorites) {
      try {
        setQuestFavorites(JSON.parse(savedFavorites));
      } catch {
        setQuestFavorites([]);
      }
    }
  }, []);

  const addToFavorites = useCallback((questId: string) => {
    setQuestFavorites(prev => {
      if (prev.includes(questId)) return prev;
      const newFavorites = [...prev, questId];
      localStorage.setItem('tarkov-quest-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const removeFromFavorites = useCallback((questId: string) => {
    setQuestFavorites(prev => {
      const newFavorites = prev.filter(id => id !== questId);
      localStorage.setItem('tarkov-quest-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const toggleFavorite = useCallback((questId: string) => {
    if (questFavorites.includes(questId)) {
      removeFromFavorites(questId);
    } else {
      addToFavorites(questId);
    }
  }, [questFavorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((questId: string) => {
    return questFavorites.includes(questId);
  }, [questFavorites]);

  const getFavoriteQuests = useCallback((allQuests: TarkovQuest[]) => {
    return allQuests.filter(quest => questFavorites.includes(quest.id));
  }, [questFavorites]);

  return {
    favorites: questFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteQuests,
    totalFavorites: questFavorites.length,
  };
}

// Hook for quest comparison
export function useQuestComparison() {
  const [questsInComparison, setQuestsInComparison] = useState<TarkovQuest[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  useEffect(() => {
    // Load comparison list from localStorage
    const savedComparison = localStorage.getItem('tarkov-quest-comparison');
    if (savedComparison) {
      try {
        const questIds = JSON.parse(savedComparison);
        // We'll need to get the actual quest objects from the API
        // For now, just store the IDs and let the component handle the conversion
        setQuestsInComparison([]);
      } catch {
        setQuestsInComparison([]);
      }
    }
  }, []);

  const addToComparison = useCallback((quest: TarkovQuest) => {
    setQuestsInComparison(prev => {
      if (prev.find(q => q.id === quest.id) || prev.length >= 3) return prev; // Max 3 quests for comparison
      const newComparison = [...prev, quest];
      const questIds = newComparison.map(q => q.id);
      localStorage.setItem('tarkov-quest-comparison', JSON.stringify(questIds));
      return newComparison;
    });
  }, []);

  const removeFromComparison = useCallback((questId: string) => {
    setQuestsInComparison(prev => {
      const newComparison = prev.filter(quest => quest.id !== questId);
      const questIds = newComparison.map(q => q.id);
      localStorage.setItem('tarkov-quest-comparison', JSON.stringify(questIds));
      return newComparison;
    });
  }, []);

  const toggleComparison = useCallback((quest: TarkovQuest) => {
    if (questsInComparison.find(q => q.id === quest.id)) {
      removeFromComparison(quest.id);
    } else {
      addToComparison(quest);
    }
  }, [questsInComparison, addToComparison, removeFromComparison]);

  const isInComparison = useCallback((questId: string) => {
    return questsInComparison.some(quest => quest.id === questId);
  }, [questsInComparison]);

  const canAddToComparison = useCallback(() => {
    return questsInComparison.length < 3;
  }, [questsInComparison]);

  const clearComparison = useCallback(() => {
    setQuestsInComparison([]);
    localStorage.removeItem('tarkov-quest-comparison');
  }, []);

  const openComparisonModal = useCallback(() => {
    setIsComparisonModalOpen(true);
  }, []);

  const closeComparisonModal = useCallback(() => {
    setIsComparisonModalOpen(false);
  }, []);

  return {
    questsInComparison,
    isComparisonModalOpen,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    isInComparison,
    canAddToComparison,
    clearComparison,
    openComparisonModal,
    closeComparisonModal,
  };
}

// Hook for price comparison
export function usePriceComparison(itemId: string | null) {
  const [priceData, setPriceData] = useState<{
    fleaPrice?: number;
    traderPrices: { trader: string; price: number; currency: string }[];
    bestBuy?: { source: string; price: number; currency: string };
    bestSell?: { source: string; price: number; currency: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setPriceData(null);
      return;
    }

    const fetchPriceData = async () => {
      setLoading(true);
      setError(null);

      try {
        const item = await tarkovDevApi.getItemById(itemId);
        if (!item) {
          throw new Error('Item não encontrado');
        }

        const fleaPrice = item.avg24hPrice;
        const traderPrices = item.sellFor.map(sell => ({
          trader: sell.source,
          price: sell.price,
          currency: sell.currency,
        }));

        // Find best buy and sell prices
        const buyPrices = item.buyFor.filter(buy => buy.price > 0);
        const sellPrices = item.sellFor.filter(sell => sell.price > 0);

        const bestBuy = buyPrices.reduce((best, current) => {
          if (!best || current.price < best.price) {
            return current;
          }
          return best;
        }, buyPrices[0]);

        const bestSell = sellPrices.reduce((best, current) => {
          if (!best || current.price > best.price) {
            return current;
          }
          return best;
        }, sellPrices[0]);

        setPriceData({
          fleaPrice,
          traderPrices,
          bestBuy,
          bestSell,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados de preço');
        setPriceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [itemId]);

  return { priceData, loading, error };
}

// Hook for getting item usage data (quests, hideout, barters)
export function useItemUsage(itemId: string | null) {
  const [itemUsage, setItemUsage] = useState<{
    quests: {
      asRequirement: TarkovQuest[];
      asReward: TarkovQuest[];
    };
    hideoutStations: {
      asRequirement: HideoutStation[];
      asReward: HideoutStation[];
    };
    barterTrades: {
      asRequirement: Barter[];
      asReward: Barter[];
    };
  }>({
    quests: { asRequirement: [], asReward: [] },
    hideoutStations: { asRequirement: [], asReward: [] },
    barterTrades: { asRequirement: [], asReward: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setItemUsage({
        quests: { asRequirement: [], asReward: [] },
        hideoutStations: { asRequirement: [], asReward: [] },
        barterTrades: { asRequirement: [], asReward: [] }
      });
      return;
    }

    const fetchItemUsage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [quests, hideoutStations, barters] = await Promise.all([
          tarkovDevApi.getQuests(),
          tarkovDevApi.getHideoutStations(),
          tarkovDevApi.getBarters()
        ]);

        // Separate quests by usage type
        const questsAsReward = quests.filter(quest => {
          // Check if item is in start rewards
          const inStartRewards = quest.startRewards?.items?.some(reward => 
            reward.item.id === itemId
          );
          
          // Check if item is in finish rewards
          const inFinishRewards = quest.finishRewards?.items?.some(reward => 
            reward.item.id === itemId
          );
          
          return inStartRewards || inFinishRewards;
        });

        // For now, quests don't have requirements (only rewards)
        const questsAsRequirement: TarkovQuest[] = [];

        // Separate hideout stations by usage type
        const hideoutAsRequirement = hideoutStations.filter(station => {
          return station.levels?.some(level => {
            // Check if item is required for construction
            const inRequirements = level.itemRequirements?.some(req => 
              req.item.id === itemId
            );
            
            // Check if item is required for crafts
            const inCraftRequirements = level.crafts?.some(craft => {
              return craft.requiredItems?.some(req => req.item.id === itemId);
            });
            
            return inRequirements || inCraftRequirements;
          });
        });

        const hideoutAsReward = hideoutStations.filter(station => {
          return station.levels?.some(level => {
            // Check if item is produced by crafts
            const inCraftRewards = level.crafts?.some(craft => {
              return craft.rewardItems?.some(reward => reward.item.id === itemId);
            });
            
            return inCraftRewards;
          });
        });

        // Separate barters by usage type
        const bartersAsRequirement = barters.filter(barter => {
          return barter.requiredItems?.some(req => req.item.id === itemId);
        });

        const bartersAsReward = barters.filter(barter => {
          return barter.rewardItems?.some(reward => reward.item.id === itemId);
        });

        setItemUsage({
          quests: {
            asRequirement: questsAsRequirement,
            asReward: questsAsReward
          },
          hideoutStations: {
            asRequirement: hideoutAsRequirement,
            asReward: hideoutAsReward
          },
          barterTrades: {
            asRequirement: bartersAsRequirement,
            asReward: bartersAsReward
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados de uso do item');
        setItemUsage({
          quests: { asRequirement: [], asReward: [] },
          hideoutStations: { asRequirement: [], asReward: [] },
          barterTrades: { asRequirement: [], asReward: [] }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItemUsage();
  }, [itemId]);

  return { itemUsage, loading, error };
}

// Hook for getting barters
export function useBarters() {
  const [barters, setBarters] = useState<Barter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarters = async () => {
      try {
        const fetchedBarters = await tarkovDevApi.getBarters();
        setBarters(fetchedBarters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar trocas');
      } finally {
        setLoading(false);
      }
    };

    fetchBarters();
  }, []);

  return { barters, loading, error };
}

// Export all hooks as a single object
const useTarkov = {
  useItemSearch,
  useItem,
  useAllItems,
  usePopularItems,
  useTrendingItems,
  useQuestSearch,
  useQuests,
  useHideoutStations,
  useFavorites,
  useQuestFavorites,
  useQuestComparison,
  usePriceComparison,
  useItemUsage,
  useBarters,
};

export default useTarkov;
export { useTarkov };