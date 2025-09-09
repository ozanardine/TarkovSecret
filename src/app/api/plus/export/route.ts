import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { tarkovApi } from '@/lib/tarkov-api';

// Data export functionality for PLUS users
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    const { exportType, format, filters } = await request.json();

    if (!exportType || !format) {
      return NextResponse.json(
        { error: 'Tipo de exportação e formato são obrigatórios' },
        { status: 400 }
      );
    }

    let exportData;
    let filename;

    switch (exportType) {
      case 'watchlist':
        exportData = await exportWatchlist(user.id, filters);
        filename = `watchlist_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'search_history':
        exportData = await exportSearchHistory(user.id, filters);
        filename = `search_history_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'api_usage':
        exportData = await exportApiUsage(user.id, filters);
        filename = `api_usage_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'price_alerts':
        exportData = await exportPriceAlerts(user.id, filters);
        filename = `price_alerts_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'analytics':
        exportData = await exportAnalytics(user.id, filters);
        filename = `analytics_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de exportação inválido' },
          { status: 400 }
        );
    }

    let responseData;
    let contentType;
    let fileExtension;

    switch (format) {
      case 'json':
        responseData = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      case 'csv':
        responseData = convertToCSV(exportData);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'xlsx':
        // For now, return JSON with instructions to convert
        responseData = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      default:
        return NextResponse.json(
          { error: 'Formato de exportação inválido' },
          { status: 400 }
        );
    }

    // Log export activity
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'SEARCH', // Using SEARCH as closest available type
        data: {
          action: 'EXPORT',
          exportType,
          format,
          filters,
          response_size: responseData.length
        },
        timestamp: new Date().toISOString()
      });

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}.${fileExtension}"`,
        'X-Export-Type': exportType,
        'X-Export-Format': format,
        'X-Export-Records': exportData.length?.toString() || '0'
      }
    });
    
  } catch (error) {
    console.error('Erro na API PLUS de exportação:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Get available export types and formats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    const exportOptions = {
      types: [
        {
          id: 'watchlist',
          name: 'Lista de Favoritos',
          description: 'Exportar todos os itens da sua lista de favoritos'
        },
        {
          id: 'search_history',
          name: 'Histórico de Buscas',
          description: 'Exportar seu histórico completo de buscas'
        },
        {
          id: 'api_usage',
          name: 'Uso da API',
          description: 'Exportar estatísticas de uso da API'
        },
        {
          id: 'price_alerts',
          name: 'Alertas de Preço',
          description: 'Exportar configurações de alertas de preço'
        },
        {
          id: 'analytics',
          name: 'Analytics Completo',
          description: 'Exportar dados completos de analytics'
        }
      ],
      formats: [
        {
          id: 'json',
          name: 'JSON',
          description: 'Formato JSON estruturado'
        },
        {
          id: 'csv',
          name: 'CSV',
          description: 'Planilha CSV compatível com Excel'
        },
        {
          id: 'xlsx',
          name: 'Excel',
          description: 'Arquivo Excel nativo (em desenvolvimento)'
        }
      ],
      limits: {
        maxRecords: 10000,
        maxFileSize: '50MB',
        dailyExports: 10
      }
    };

    return NextResponse.json({
      success: true,
      data: exportOptions
    });
    
  } catch (error) {
    console.error('Erro ao obter opções de exportação:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Export functions
async function exportWatchlist(userId: string, filters: any) {
  const { data: watchlists } = await supabaseAdmin
    .from('watchlists')
    .select(`
      *,
      items:watchlist_items(
        *,
        item_data
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return watchlists || [];
}

async function exportSearchHistory(userId: string, filters: any) {
  const startDate = filters?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = filters?.endDate || new Date().toISOString();

  const { data: activities } = await supabaseAdmin
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'SEARCH')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })
    .limit(filters?.limit || 1000);

  return activities || [];
}

async function exportApiUsage(userId: string, filters: any) {
  const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = filters?.endDate || new Date().toISOString();

  const { data: activities } = await supabaseAdmin
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })
    .limit(filters?.limit || 1000);

  return activities || [];
}

async function exportPriceAlerts(userId: string, filters: any) {
  const { data: alerts } = await supabaseAdmin
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return alerts || [];
}

async function exportAnalytics(userId: string, filters: any) {
  const period = filters?.period || '30d';
  
  // This would call the analytics functions from the analytics API
  // For now, return a summary as an array
  return [{
    exportedAt: new Date().toISOString(),
    period,
    note: 'Analytics export functionality - detailed implementation would include all analytics data'
  }];
}

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}