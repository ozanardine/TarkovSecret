import { useState, useEffect, useCallback } from 'react';
import { Armor } from '@/types/tarkov';
import { tarkovDevApi } from '@/lib/tarkov-api';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseArmorResult {
  armor: Armor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useArmor(): UseArmorResult {
  const [armor, setArmor] = useState<Armor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const fetchArmor = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await tarkovDevApi.getArmor();
      setArmor(data);
    } catch (err) {
      console.error('Failed to fetch armor:', err);
      setError('Failed to load armor. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArmor();
  }, [fetchArmor, language]);

  return { armor, loading, error, refetch: fetchArmor };
}
