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
      // Mapear dados do banco para o formato da interface Watchlist
      const mappedWatchlists = userWatchlists.map(watchlist => ({
        id: watchlist.id,
        userId: watchlist.user_id,
        name: watchlist.name,
        description: watchlist.description || undefined,
        isPublic: watchlist.is_public,
        createdAt: new Date(watchlist.created_at),
        updatedAt: new Date(watchlist.updated_at),
        items: watchlist.items?.map(item => ({
          id: item.id,
          watchlistId: item.watchlist_id,
          itemId: item.item_id,
          targetPrice: item.target_price || undefined,
          priceDirection: item.price_direction as 'ABOVE' | 'BELOW',
          notifyOnChange: item.notify_on_change,
          addedAt: new Date(item.added_at),
          notes: item.notes || undefined
        })) || []
      }));
      setWatchlists(mappedWatchlists);
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
      
      // Mapear dados do banco para o formato da interface Watchlist
      const mappedWatchlist = {
        id: newWatchlist.id,
        userId: newWatchlist.user_id,
        name: newWatchlist.name,
        description: newWatchlist.description || undefined,
        isPublic: newWatchlist.is_public,
        createdAt: new Date(newWatchlist.created_at),
        updatedAt: new Date(newWatchlist.updated_at),
        items: []
      };
      
      setWatchlists(prev => [...prev, mappedWatchlist]);
      toast.success('Lista criada com sucesso!');
      return mappedWatchlist;
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
      // Converter campos camelCase para snake_case para o banco
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
      
      const updatedWatchlist = await db.updateWatchlist(id, dbUpdates);
      // Mapear dados do banco para o formato da interface Watchlist
      const mappedWatchlist = {
        id: updatedWatchlist.id,
        userId: updatedWatchlist.user_id,
        name: updatedWatchlist.name,
        description: updatedWatchlist.description || undefined,
        isPublic: updatedWatchlist.is_public,
        createdAt: new Date(updatedWatchlist.created_at),
        updatedAt: new Date(updatedWatchlist.updated_at),
        items: []
      };
      setWatchlists(prev => prev.map(w => w.id === id ? mappedWatchlist : w));
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
      // Mapear dados do banco para o formato da interface WatchlistItem
      const mappedItems = watchlistItems.map(item => ({
        id: item.id,
        watchlistId: item.watchlist_id,
        itemId: item.item_id,
        targetPrice: item.target_price || undefined,
        priceDirection: item.price_direction as 'ABOVE' | 'BELOW',
        notifyOnChange: item.notify_on_change,
        addedAt: new Date(item.added_at),
        notes: item.notes || undefined
      }));
      setItems(mappedItems);
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
        item_id: itemId,
        notes,
      });
      
      // Mapear dados do banco para o formato da interface WatchlistItem
      const mappedItem = {
        id: newItem.id,
        watchlistId: newItem.watchlist_id,
        itemId: newItem.item_id,
        targetPrice: newItem.target_price || undefined,
        priceDirection: newItem.price_direction as 'ABOVE' | 'BELOW',
        notifyOnChange: newItem.notify_on_change,
        addedAt: new Date(newItem.added_at),
        notes: newItem.notes || undefined
      };
      
      setItems(prev => [...prev, mappedItem]);
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
      setItems(prev => prev.filter(item => item.itemId !== itemId));
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
        item.itemId === itemId ? { ...item, notes: updatedItem.notes || undefined } : item
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
    return items.some(item => item.itemId === itemId);
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
      // Mapear dados do banco para o formato da interface PriceAlert
      const mappedAlerts = userAlerts.map(alert => ({
        id: alert.id,
        userId: alert.user_id,
        itemId: alert.item_id,
        targetPrice: alert.target_price,
        condition: alert.condition as 'ABOVE' | 'BELOW' | 'EQUAL',
        isActive: alert.is_active,
        triggered: alert.triggered,
        triggeredAt: alert.triggered_at ? new Date(alert.triggered_at) : undefined,
        createdAt: new Date(alert.created_at),
        updatedAt: new Date(alert.updated_at)
      }));
      setAlerts(mappedAlerts);
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
      
      // Mapear dados do banco para o formato da interface PriceAlert
      const mappedAlert = {
        id: newAlert.id,
        userId: newAlert.user_id,
        itemId: newAlert.item_id,
        targetPrice: newAlert.target_price,
        condition: newAlert.condition as 'ABOVE' | 'BELOW' | 'EQUAL',
        isActive: newAlert.is_active,
        triggered: newAlert.triggered,
        triggeredAt: newAlert.triggered_at ? new Date(newAlert.triggered_at) : undefined,
        createdAt: new Date(newAlert.created_at),
        updatedAt: new Date(newAlert.updated_at)
      };
      
      setAlerts(prev => [...prev, mappedAlert]);
      toast.success('Alerta de preço criado!');
      return mappedAlert;
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
      // Converter campos camelCase para snake_case para o banco
      const dbUpdates: any = {};
      if (updates.targetPrice !== undefined) dbUpdates.target_price = updates.targetPrice;
      if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.triggered !== undefined) dbUpdates.triggered = updates.triggered;
      if (updates.triggeredAt !== undefined) dbUpdates.triggered_at = updates.triggeredAt;
      
      const updatedAlert = await db.updatePriceAlert(id, dbUpdates);
      // Mapear dados do banco para o formato da interface PriceAlert
      const mappedAlert = {
        id: updatedAlert.id,
        userId: updatedAlert.user_id,
        itemId: updatedAlert.item_id,
        targetPrice: updatedAlert.target_price,
        condition: updatedAlert.condition as 'ABOVE' | 'BELOW' | 'EQUAL',
        isActive: updatedAlert.is_active,
        triggered: updatedAlert.triggered,
        triggeredAt: updatedAlert.triggered_at ? new Date(updatedAlert.triggered_at) : undefined,
        createdAt: new Date(updatedAlert.created_at),
        updatedAt: new Date(updatedAlert.updated_at)
      };
      setAlerts(prev => prev.map(alert => alert.id === id ? mappedAlert : alert));
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

    return updateAlert(id, { isActive: !alert.isActive });
  }, [alerts, updateAlert]);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => alert.isActive);
  }, [alerts]);

  const getAlertsForItem = useCallback((itemId: string) => {
    return alerts.filter(alert => alert.itemId === itemId);
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