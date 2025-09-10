import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { tarkovApi, tarkovDevApi } from '@/lib/tarkov-api';

// Advanced price alerts management for PLUS users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Check if user has PLUS subscription
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          type,
          status
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .eq('user_subscriptions.status', 'ACTIVE')
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Acesso negado. Assinatura PLUS necessária.' },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const itemId = searchParams.get('itemId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('price_alerts')
      .select(`
        id,
        user_id,
        item_id,
        target_price,
        condition,
        is_active,
        triggered,
        triggered_at,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('is_active', status === 'active');
    }

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data: alerts, error } = await query;

    if (error) {
      throw error;
    }

    // Enrich alerts with current item data
    const enrichedAlerts = await Promise.all(
      (alerts || []).map(async (alert) => {
        try {
          const itemData = await tarkovDevApi.getItemById(alert.item_id);
          return {
            ...alert,
            item: itemData,
            priceChange: itemData?.avg24hPrice ? 
              ((itemData.avg24hPrice - alert.target_price) / alert.target_price * 100) : 0
          };
        } catch {
          return alert;
        }
      })
    );

    // Log API usage
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'SEARCH',
        data: {
          action: 'PRICE_ALERTS_GET',
          status,
          itemId,
          limit,
          response_size: JSON.stringify(enrichedAlerts).length
        },
        timestamp: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: enrichedAlerts,
      meta: {
        total: enrichedAlerts.length,
        active: enrichedAlerts.filter(a => a.is_active).length,
        triggered: enrichedAlerts.filter(a => a.triggered).length
      }
    });
    
  } catch (error) {
    console.error('Erro na API PLUS de alertas de preço:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Create advanced price alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Check if user has PLUS subscription
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          type,
          status
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .eq('user_subscriptions.status', 'ACTIVE')
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Acesso negado. Assinatura PLUS necessária.' },
        { status: 403 }
      );
    }

    const {
      itemId,
      alertType,
      targetPrice,
      conditions,
      notificationMethods,
      expiresAt
    } = await request.json();

    if (!itemId || !alertType || !targetPrice) {
      return NextResponse.json(
        { error: 'Item ID, tipo de alerta e preço alvo são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate alert type
    const validAlertTypes = ['price_drop', 'price_rise', 'price_range', 'percentage_change'];
    if (!validAlertTypes.includes(alertType)) {
      return NextResponse.json(
        { error: 'Tipo de alerta inválido' },
        { status: 400 }
      );
    }

    // Get current item price
    const itemData = await tarkovDevApi.getItemById(itemId);
    if (!itemData) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    // Check user's alert limit (PLUS users get more alerts)
    const { count: existingAlerts } = await supabaseAdmin
      .from('price_alerts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true);

    const maxAlerts = 100; // PLUS users get 100 active alerts
    if ((existingAlerts || 0) >= maxAlerts) {
      return NextResponse.json(
        { error: `Limite de ${maxAlerts} alertas ativos atingido` },
        { status: 400 }
      );
    }

    // Create the alert
    const { data: newAlert, error } = await supabaseAdmin
      .from('price_alerts')
      .insert({
        user_id: user.id,
        item_id: itemId,
        target_price: targetPrice,
        condition: alertType,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log API usage
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'PRICE_ALERT',
        data: {
          action: 'CREATE_ALERT',
          itemId,
          alertType,
          targetPrice,
          response_size: JSON.stringify(newAlert).length
        },
        timestamp: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: {
        ...newAlert,
        item: itemData
      },
      message: 'Alerta de preço criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar alerta de preço:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Update price alert
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Check if user has PLUS subscription
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          type,
          status
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .eq('user_subscriptions.status', 'ACTIVE')
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Acesso negado. Assinatura PLUS necessária.' },
        { status: 403 }
      );
    }

    const {
      alertId,
      targetPrice,
      conditions,
      notificationMethods,
      isActive,
      expiresAt
    } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: 'ID do alerta é obrigatório' },
        { status: 400 }
      );
    }

    // Verify alert ownership
    const { data: existingAlert } = await supabaseAdmin
      .from('price_alerts')
      .select('*')
      .eq('id', alertId)
      .eq('user_id', user.id)
      .single();

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      );
    }

    // Update the alert
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (targetPrice !== undefined) updateData.target_price = targetPrice;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (notificationMethods !== undefined) updateData.notification_methods = notificationMethods;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (expiresAt !== undefined) updateData.expires_at = expiresAt;

    const { data: updatedAlert, error } = await supabaseAdmin
      .from('price_alerts')
      .update(updateData)
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log API usage
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'PRICE_ALERT',
        data: {
          action: 'UPDATE_ALERT',
          alertId,
          targetPrice,
          isActive,
          response_size: JSON.stringify(updatedAlert).length
        },
        timestamp: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: updatedAlert,
      message: 'Alerta de preço atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar alerta de preço:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Delete price alert
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Check if user has PLUS subscription
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          type,
          status
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .eq('user_subscriptions.status', 'ACTIVE')
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Acesso negado. Assinatura PLUS necessária.' },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { error: 'ID do alerta é obrigatório' },
        { status: 400 }
      );
    }

    // Verify alert ownership and delete
    const { data: deletedAlert, error } = await supabaseAdmin
      .from('price_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!deletedAlert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      );
    }

    // Log API usage
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'PRICE_ALERT',
        data: {
          action: 'DELETE_ALERT',
          alertId,
          response_size: JSON.stringify(deletedAlert).length
        },
        timestamp: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: deletedAlert,
      message: 'Alerta de preço removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover alerta de preço:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}