import { useState, useEffect } from 'react';
import { tarkovDevApi } from '@/lib/tarkov-api';
import { Barter } from '@/types/tarkov';

export function useItemBarters(itemId: string | null) {
  const [barters, setBarters] = useState<Barter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setBarters([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchBarters = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const bartersData = await tarkovDevApi.getBartersForItem(itemId);
        setBarters(bartersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch barters');
        setBarters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBarters();
  }, [itemId]);

  return { barters, loading, error };
}