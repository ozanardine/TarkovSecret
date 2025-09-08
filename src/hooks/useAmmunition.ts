import { useState, useEffect } from 'react';
import { tarkovDevApi } from '@/lib/tarkov-api';
import { Ammo } from '@/types/tarkov';

export function useAmmunition() {
  const [ammunition, setAmmunition] = useState<Ammo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmmunition = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tarkovDevApi.getAmmunition();
        setAmmunition(data);
      } catch (err) {
        console.error('Error fetching ammunition:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar munições');
      } finally {
        setLoading(false);
      }
    };

    fetchAmmunition();
  }, []);

  return {
    ammunition,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      tarkovDevApi.getAmmunition()
        .then(setAmmunition)
        .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar munições'))
        .finally(() => setLoading(false));
    }
  };
}
