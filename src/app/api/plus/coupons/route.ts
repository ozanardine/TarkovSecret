import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

// Coupon and promotion management
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'available', 'used', 'all'
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Get available coupons for user
    let query = supabaseAdmin
      .from('coupons')
      .select(`
        *,
        coupon_usage(
          id,
          used_at,
          subscription_id
        )
      `)
      .or(`user_id.eq.${user.id},user_id.is.null`) // User-specific or global coupons
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!includeExpired) {
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
    }

    const { data: coupons, error } = await query;

    if (error) {
      throw error;
    }

    // Filter based on type and usage
    let filteredCoupons = coupons || [];

    if (type === 'available') {
      filteredCoupons = filteredCoupons.filter(coupon => {
        const usage = coupon.coupon_usage || [];
        const userUsage = usage.filter((u: any) => u.user_id === user.id);
        
        // Check if coupon is still usable
        const isNotExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
        const hasUsageLeft = !coupon.max_uses || usage.length < coupon.max_uses;
        const userCanUse = !coupon.max_uses_per_user || userUsage.length < coupon.max_uses_per_user;
        
        return isNotExpired && hasUsageLeft && userCanUse;
      });
    } else if (type === 'used') {
      filteredCoupons = filteredCoupons.filter(coupon => {
        const usage = coupon.coupon_usage || [];
        return usage.some((u: any) => u.user_id === user.id);
      });
    }

    // Enrich coupons with usage statistics
    const enrichedCoupons = filteredCoupons.map(coupon => {
      const usage = coupon.coupon_usage || [];
      const userUsage = usage.filter((u: any) => u.user_id === user.id);
      
      return {
        ...coupon,
        usage_stats: {
          total_uses: usage.length,
          user_uses: userUsage.length,
          remaining_uses: coupon.max_uses ? coupon.max_uses - usage.length : null,
          user_remaining_uses: coupon.max_uses_per_user ? coupon.max_uses_per_user - userUsage.length : null,
          last_used_at: userUsage.length > 0 ? userUsage[userUsage.length - 1].used_at : null
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedCoupons,
      meta: {
        total: enrichedCoupons.length,
        available: enrichedCoupons.filter(c => c.usage_stats.user_remaining_uses === null || c.usage_stats.user_remaining_uses > 0).length,
        used: enrichedCoupons.filter(c => c.usage_stats.user_uses > 0).length
      }
    });
    
  } catch (error) {
    console.error('Erro ao obter cupons:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Validate and apply coupon
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const { couponCode, action } = await request.json();

    if (!couponCode) {
      return NextResponse.json(
        { error: 'Código do cupom é obrigatório' },
        { status: 400 }
      );
    }

    // Get coupon data
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select(`
        *,
        coupon_usage(
          id,
          user_id,
          used_at
        )
      `)
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado ou inválido' },
        { status: 404 }
      );
    }

    // Validate coupon
    const validationResult = validateCoupon(coupon, user.id);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.reason },
        { status: 400 }
      );
    }

    if (action === 'validate') {
      // Just validate, don't apply
      return NextResponse.json({
        success: true,
        data: {
          coupon: {
            id: coupon.id,
            code: coupon.code,
            name: coupon.name,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            expires_at: coupon.expires_at
          },
          discount: calculateDiscount(coupon, 999), // Assuming 9.99 base price
          valid: true
        },
        message: 'Cupom válido'
      });
    }

    if (action === 'apply') {
      // Apply coupon to create Stripe coupon and return checkout session
      try {
        let stripeCoupon;
        
        // Check if Stripe coupon already exists
        try {
          stripeCoupon = await stripe.coupons.retrieve(coupon.stripe_coupon_id || coupon.code);
        } catch {
          // Create Stripe coupon if it doesn't exist
          const stripeCouponData: any = {
            id: coupon.code,
            name: coupon.name,
            duration: 'once' // Most coupons are one-time use
          };

          if (coupon.discount_type === 'percentage') {
            stripeCouponData.percent_off = coupon.discount_value;
          } else {
            stripeCouponData.amount_off = Math.round(coupon.discount_value * 100); // Convert to cents
            stripeCouponData.currency = 'brl';
          }

          if (coupon.expires_at) {
            stripeCouponData.redeem_by = Math.floor(new Date(coupon.expires_at).getTime() / 1000);
          }

          stripeCoupon = await stripe.coupons.create(stripeCouponData);
          
          // Update coupon with Stripe ID
          await supabaseAdmin
            .from('coupons')
            .update({ stripe_coupon_id: stripeCoupon.id })
            .eq('id', coupon.id);
        }

        // Create checkout session with coupon
        const checkoutSession = await stripe.checkout.sessions.create({
          customer_email: user.email,
          payment_method_types: ['card'],
          line_items: [
            {
              price: process.env.STRIPE_PLUS_PRICE_ID,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
          discounts: [
            {
              coupon: stripeCoupon.id,
            },
          ],
          metadata: {
            user_id: user.id,
            coupon_id: coupon.id,
            coupon_code: coupon.code
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            checkout_url: checkoutSession.url,
            session_id: checkoutSession.id,
            coupon: {
              id: coupon.id,
              code: coupon.code,
              name: coupon.name,
              discount_type: coupon.discount_type,
              discount_value: coupon.discount_value
            }
          },
          message: 'Cupom aplicado com sucesso'
        });
        
      } catch (stripeError) {
        console.error('Erro ao aplicar cupom no Stripe:', stripeError);
        return NextResponse.json(
          { error: 'Erro ao processar cupom no sistema de pagamento' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Ação inválida. Use "validate" ou "apply"' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Erro ao processar cupom:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function validateCoupon(coupon: any, userId: string) {
  const now = new Date();
  
  // Check if coupon is expired
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, reason: 'Cupom expirado' };
  }
  
  // Check if coupon has reached max uses
  const totalUses = coupon.coupon_usage?.length || 0;
  if (coupon.max_uses && totalUses >= coupon.max_uses) {
    return { valid: false, reason: 'Cupom esgotado' };
  }
  
  // Check if user has reached max uses per user
  const userUses = coupon.coupon_usage?.filter((usage: any) => usage.user_id === userId).length || 0;
  if (coupon.max_uses_per_user && userUses >= coupon.max_uses_per_user) {
    return { valid: false, reason: 'Você já utilizou este cupom o máximo de vezes permitido' };
  }
  
  // Check if coupon is user-specific
  if (coupon.user_id && coupon.user_id !== userId) {
    return { valid: false, reason: 'Este cupom não é válido para sua conta' };
  }
  
  return { valid: true };
}

function calculateDiscount(coupon: any, basePrice: number) {
  if (coupon.discount_type === 'percentage') {
    const discountAmount = (basePrice * coupon.discount_value) / 100;
    return {
      type: 'percentage',
      value: coupon.discount_value,
      amount: discountAmount,
      final_price: basePrice - discountAmount
    };
  } else {
    const discountAmount = Math.min(coupon.discount_value, basePrice);
    return {
      type: 'fixed',
      value: coupon.discount_value,
      amount: discountAmount,
      final_price: basePrice - discountAmount
    };
  }
}