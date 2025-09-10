import { useState, useEffect } from 'react';
import { SubscriptionPlan, SubscriptionPlansResponse } from '@/types/subscription';

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/subscription/plans');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar planos de subscription');
        }

        const data: SubscriptionPlansResponse = await response.json();
        setPlans(data.plans);
      } catch (err) {
        console.error('Erro ao buscar planos:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading, error };
}
