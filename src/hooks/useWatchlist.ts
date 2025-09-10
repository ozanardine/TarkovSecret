import { useState, useEffect, useCallback } from 'react';
import { Watchlist, WatchlistItem, PriceAlert } from '@/types/user';
import { db } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

// Hook for managing user watchlists
export function useWatchlists() {
  const { user, isAuthenticated } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlists = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      const userWatchlists = await db.getUserWatchlists(user.id);
      setWatchlists(userWatchlists);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar listas de observação';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const createWatchlist = useCallback(async (name: string, description?: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para criar uma lista');
      return null;
    }

    try {
      const newWatchlist = await db.createWatchlist({
        user_id: user.id,
        name,
        description,
      });
      
      setWatchlists(prev => [...prev, newWatchlist]);
      toast.success('Lista criada com sucesso!');
      return newWatchlist;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lista';
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, user]);

  const updateWatchlist = useCallback(async (id: string, updates: Partial<Watchlist>) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para atualizar a lista');
      return false;
    }

    try {
      const updatedWatchlist = await db.updateWatchlist(id, updates);
      setWatchlists(prev => prev.map(w => w.id === id ? updatedWatchlist : w));
      toast.success('Lista atualizada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lista';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user]);

  const deleteWatchlist = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para deletar a lista');
      return false;
    }

    try {
      await db.deleteWatchlist(id);
      setWatchlists(prev => prev.filter(w => w.id !== id));
      toast.success('Lista deletada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar lista';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user]);

  return {
    watchlists,
    loading,
    error,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    refetch: fetchWatchlists,
  };
}

// Hook for managing watchlist items
export function useWatchlistItems(watchlistId: string | null) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!isAuthenticated || !user || !watchlistId) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const watchlistItems = await db.getWatchlistItems(watchlistId);
      setItems(watchlistItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar itens da lista';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, watchlistId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (itemId: string, notes?: string) => {
    if (!isAuthenticated || !user || !watchlistId) {
      toast.error('Você precisa estar logado para adicionar itens');
      return false;
    }

    try {
      const newItem = await db.addToWatchlist(watchlistId, {
        watchlist_id: watchlistId,
        item_id: itemId,
        notes,
      });
      
      setItems(prev => [...prev, newItem]);
      toast.success('Item adicionado à lista!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar item';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user, watchlistId]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!isAuthenticated || !user || !watchlistId) {
      toast.error('Você precisa estar logado para remover itens');
      return false;
    }

    try {
      await db.removeFromWatchlist(watchlistId, itemId);
      setItems(prev => prev.filter(item => item.item_id !== itemId));
      toast.success('Item removido da lista!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover item';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user, watchlistId]);

  const updateItemNotes = useCallback(async (itemId: string, notes: string) => {
    if (!isAuthenticated || !user || !watchlistId) {
      toast.error('Você precisa estar logado para atualizar notas');
      return false;
    }

    try {
      const updatedItem = await db.updateWatchlistItem(watchlistId, itemId, { notes });
      setItems(prev => prev.map(item => 
        item.item_id === itemId ? { ...item, notes: updatedItem.notes } : item
      ));
      toast.success('Notas atualizadas!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar notas';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user, watchlistId]);

  const isItemInWatchlist = useCallback((itemId: string) => {
    return items.some(item => item.item_id === itemId);
  }, [items]);

  return {
    items,
    loading,
    error,
    addItem,
    removeItem,
    updateItemNotes,
    isItemInWatchlist,
    refetch: fetchItems,
  };
}

// Hook for managing price alerts
export function usePriceAlerts() {
  const { user, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      const userAlerts = await db.getUserPriceAlerts(user.id);
      setAlerts(userAlerts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar alertas de preço';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (data: {
    item_id: string;
    target_price: number;
    condition: 'above' | 'below';
    market_type: 'flea' | 'trader';
  }) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para criar alertas');
      return null;
    }

    try {
      const newAlert = await db.createPriceAlert({
        ...data,
        user_id: user.id,
      });
      
      setAlerts(prev => [...prev, newAlert]);
      toast.success('Alerta de preço criado!');
      return newAlert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar alerta';
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, user]);

  const updateAlert = useCallback(async (id: string, updates: Partial<PriceAlert>) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para atualizar alertas');
      return false;
    }

    try {
      const updatedAlert = await db.updatePriceAlert(id, updates);
      setAlerts(prev => prev.map(alert => alert.id === id ? updatedAlert : alert));
      toast.success('Alerta atualizado!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar alerta';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user]);

  const deleteAlert = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para deletar alertas');
      return false;
    }

    try {
      await db.deletePriceAlert(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      toast.success('Alerta deletado!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar alerta';
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, user]);

  const toggleAlert = useCallback(async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return false;

    return updateAlert(id, { is_active: !alert.is_active });
  }, [alerts, updateAlert]);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => alert.is_active);
  }, [alerts]);

  const getAlertsForItem = useCallback((itemId: string) => {
    return alerts.filter(alert => alert.item_id === itemId);
  }, [alerts]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    getActiveAlerts,
    getAlertsForItem,
    refetch: fetchAlerts,
  };
}