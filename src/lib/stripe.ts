import Stripe from 'stripe';

// Check if Stripe is configured
const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_');

if (!isStripeConfigured) {
  console.warn('Stripe is not configured. Some features may not work properly.');
}

export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

// Export configuration status
export { isStripeConfigured };

// Stripe configuration
export const STRIPE_CONFIG = {
  // Product IDs - these will be created in Stripe Dashboard
  PRODUCTS: {
    SECRET_TARKOV_PLUS: process.env.STRIPE_PRODUCT_ID_PLUS || 'prod_plus',
  },
  
  // Price IDs - these will be created in Stripe Dashboard
  PRICES: {
    PLUS_MONTHLY: process.env.STRIPE_PRICE_ID_PLUS_MONTHLY || 'price_plus_monthly',
    PLUS_YEARLY: process.env.STRIPE_PRICE_ID_PLUS_YEARLY || 'price_plus_yearly',
  },
  
  // Webhook endpoints
  WEBHOOKS: {
    CHECKOUT_COMPLETED: 'checkout.session.completed',
    SUBSCRIPTION_CREATED: 'customer.subscription.created',
    SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
    INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  },
  
  // Currency and billing
  CURRENCY: 'brl',
  BILLING_COLLECTION: 'charge_automatically',
  
  // Trial period (7 days)
  TRIAL_PERIOD_DAYS: 7,
};

// Helper functions
export const stripeHelpers = {
  // Format price for display
  formatPrice(amount: number, currency: string = 'brl'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  },

  // Get subscription status from Stripe status
  getSubscriptionStatus(stripeStatus: string): 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'UNPAID' {
    switch (stripeStatus) {
      case 'active':
        return 'ACTIVE';
      case 'canceled':
        return 'CANCELLED';
      case 'incomplete':
      case 'incomplete_expired':
        return 'INACTIVE';
      case 'past_due':
        return 'PAST_DUE';
      case 'unpaid':
        return 'UNPAID';
      default:
        return 'INACTIVE';
    }
  },

  // Check if subscription is active
  isSubscriptionActive(status: string): boolean {
    return status === 'active';
  },

  // Get subscription type from price ID
  getSubscriptionType(priceId: string): 'FREE' | 'PLUS' {
    if (priceId === STRIPE_CONFIG.PRICES.PLUS_MONTHLY || priceId === STRIPE_CONFIG.PRICES.PLUS_YEARLY) {
      return 'PLUS';
    }
    return 'FREE';
  },

  // Get billing interval from price ID
  getBillingInterval(priceId: string): 'month' | 'year' {
    if (priceId === STRIPE_CONFIG.PRICES.PLUS_YEARLY) {
      return 'year';
    }
    return 'month';
  },
};

// Stripe API functions
export const stripeApi = {
  // Create or get customer
  async createOrGetCustomer(email: string, name: string, userId: string) {
    try {
      // First, try to find existing customer
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      throw error;
    }
  },

  // Create checkout session
  async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    trialPeriodDays,
  }: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialPeriodDays?: number;
  }) {
    try {
      const sessionConfig: any = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      };

      // Add trial period if specified
      if (trialPeriodDays && trialPeriodDays > 0) {
        sessionConfig.subscription_data = {
          trial_period_days: trialPeriodDays,
          metadata: {
            userId: customerId, // We'll update this with actual userId in webhook
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Create customer portal session
  async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer'],
      });

      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately = false) {
    try {
      if (immediately) {
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        return subscription;
      } else {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        return subscription;
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Reactivate subscription
  async reactivateSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return subscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },

  // Get customer's subscriptions
  async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      return subscriptions.data;
    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      throw error;
    }
  },
};

export default stripe;
