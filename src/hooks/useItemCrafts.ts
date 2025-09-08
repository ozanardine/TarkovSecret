import { useState, useEffect } from 'react';
import { tarkovApi } from '@/lib/tarkov-api';
import { Craft } from '@/types/tarkov';

export function useItemCrafts(itemId: string | null) {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setCrafts([]);
      return;
    }

    const fetchCrafts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const craftsData = await tarkovApi.getCraftsForItem(itemId);
        setCrafts(craftsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch crafts');
        setCrafts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCrafts();
  }, [itemId]);

  return { crafts, loading, error };
}