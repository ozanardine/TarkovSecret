import { useSession } from 'next-auth/react';
import { User } from '@/types/user';

export function useAuth() {
  const { data: session, status } = useSession();
  
  const user = session?.user as User | undefined;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!user;
  
  // Helper function to check if user has Plus subscription
  const hasPlus = (user: User): boolean => {
    return user.subscription?.type === 'PLUS' && user.subscription?.status === 'ACTIVE';
  };
  
  // Helper function to check if user can access feature
  const canAccess = (user: User, feature: string): boolean => {
    const plusFeatures = [
      'advanced_search',
      'price_alerts',
      'unlimited_watchlists',
      'export_data',
      'priority_support',
      'discord_integration',
      'custom_themes',
      'advanced_analytics',
    ];
    
    if (plusFeatures.includes(feature)) {
      return hasPlus(user);
    }
    
    return true; // Free features
  };
  
  // Helper function to get subscription status
  const getSubscriptionStatus = (user: User): string => {
    if (!user.subscription) return 'free';
    
    const { type, status, end_date } = user.subscription;
    
    if (type === 'FREE') return 'free';
    
    if (status === 'ACTIVE') {
      if (end_date && new Date(end_date) < new Date()) {
        return 'expired';
      }
      return 'plus';
    }
    
    return status;
  };
  
  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated: status === 'unauthenticated',
    hasPlus: user ? hasPlus(user) : false,
    canAccess: (feature: string) => user ? canAccess(user, feature) : false,
    subscriptionStatus: user ? getSubscriptionStatus(user) : 'free',
  };
}