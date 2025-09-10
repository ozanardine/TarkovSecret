export interface SubscriptionFeature {
  key: string;
  title: string;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  stripe: {
    priceIdMonthly: string | null;
    priceIdYearly: string | null;
  };
  isPopular: boolean;
  features: SubscriptionFeature[];
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export type BillingInterval = 'monthly' | 'yearly';

export interface CheckoutSessionRequest {
  planId: string;
  interval: BillingInterval;
  couponCode?: string;
}
