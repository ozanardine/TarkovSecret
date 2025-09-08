import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { stripeHelpers } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case STRIPE_CONFIG.WEBHOOKS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object);
        break;

      case STRIPE_CONFIG.WEBHOOKS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object);
        break;

      case STRIPE_CONFIG.WEBHOOKS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object);
        break;

      case STRIPE_CONFIG.WEBHOOKS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object);
        break;

      case STRIPE_CONFIG.WEBHOOKS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case STRIPE_CONFIG.WEBHOOKS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session: any) {
  try {
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (!customerId || !subscriptionId) {
      console.error('Missing customer or subscription ID in checkout session');
      return;
    }

    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', customer.email)
      .single();

    if (!user) {
      console.error('User not found in database');
      return;
    }

    // Update or create subscription
    const subscriptionData = {
      user_id: user.id,
      type: stripeHelpers.getSubscriptionType(subscription.items.data[0].price.id),
      status: stripeHelpers.getSubscriptionStatus(subscription.status),
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      auto_renew: !subscription.cancel_at_period_end,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    };

    // Check if subscription already exists
    const { data: existingSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      await supabaseAdmin
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);
    } else {
      // Create new subscription
      await supabaseAdmin
        .from('user_subscriptions')
        .insert(subscriptionData);
    }

    console.log('Checkout completed and subscription created/updated');

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', customer.email)
      .single();

    if (!user) {
      console.error('User not found in database');
      return;
    }

    // Create subscription record
    const subscriptionData = {
      user_id: user.id,
      type: stripeHelpers.getSubscriptionType(subscription.items.data[0].price.id),
      status: stripeHelpers.getSubscriptionStatus(subscription.status),
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      auto_renew: !subscription.cancel_at_period_end,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    };

    await supabaseAdmin
      .from('user_subscriptions')
      .insert(subscriptionData);

    console.log('Subscription created in database');

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const subscriptionId = subscription.id;

    // Update subscription in database
    const subscriptionData = {
      status: stripeHelpers.getSubscriptionStatus(subscription.status),
      end_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      auto_renew: !subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    };

    await supabaseAdmin
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('stripe_subscription_id', subscriptionId);

    console.log('Subscription updated in database');

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const subscriptionId = subscription.id;

    // Update subscription status to cancelled
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'CANCELLED',
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    console.log('Subscription cancelled in database');

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.log('Invoice not associated with subscription');
      return;
    }

    // Update subscription status to active
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'ACTIVE',
      })
      .eq('stripe_subscription_id', subscriptionId);

    console.log('Invoice payment succeeded, subscription activated');

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.log('Invoice not associated with subscription');
      return;
    }

    // Update subscription status to past due
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'PAST_DUE',
      })
      .eq('stripe_subscription_id', subscriptionId);

    console.log('Invoice payment failed, subscription marked as past due');

  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
