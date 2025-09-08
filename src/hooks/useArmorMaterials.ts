import { useState, useEffect, useCallback } from 'react';
import { tarkovDevApi } from '@/lib/tarkov-api';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArmorMaterial {
  id: string;
  name: string;
  destructibility: number;
  explosionDestructibility: number;
  minRepairDegradation: number;
  maxRepairDegradation: number;
  minRepairKitDegradation: number;
  maxRepairKitDegradation: number;
}

interface UseArmorMaterialsResult {
  materials: ArmorMaterial[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useArmorMaterials(): UseArmorMaterialsResult {
  const [materials, setMaterials] = useState<ArmorMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await tarkovDevApi.getArmorMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Failed to fetch armor materials:', err);
      setError('Failed to load armor materials. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials, language]);

  return { materials, loading, error, refetch: fetchMaterials };
}
