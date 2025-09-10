import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { tarkovApi } from '@/lib/tarkov-api';
import { SearchParams } from '@/types/api';

// Enhanced search for PLUS users with no rate limits and additional features
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
    
    const params: SearchParams = {
      query: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      trader: searchParams.get('trader') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'name',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50, // Higher limit for PLUS
      filters: {
        types: searchParams.get('types')?.split(',') || undefined,
        fleaMarketOnly: searchParams.get('fleaMarketOnly') === 'true',
        traderOnly: searchParams.get('traderOnly') === 'true',
        inStock: searchParams.get('inStock') === 'true'
      }
    };

    // Enhanced search with additional data for PLUS users
    const results = await tarkovApi.searchItems(params);
    
    // Add PLUS-exclusive data
    const enhancedResults = {
      ...results,
      plusFeatures: {
        detailedAnalytics: true,
        priceHistory: true,
        marketTrends: true,
        profitCalculator: true
      },
      metadata: {
        plan: 'PLUS',
        enhancedData: true,
        processingTime: Date.now() - Date.now() // Will be calculated properly
      }
    };

    // Log API usage for analytics
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'SEARCH',
        data: {
          action: 'PLUS_SEARCH',
          query: params.query,
          filters: params.filters,
          response_size: JSON.stringify(enhancedResults).length
        },
        timestamp: new Date().toISOString()
      });
    
    return NextResponse.json({
      success: true,
      data: enhancedResults
    });
    
  } catch (error) {
    console.error('Erro na API PLUS de busca:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const params: SearchParams = {
      ...body,
      // PLUS users get enhanced limits
      limit: Math.min(body.limit || 50, 100) // Max 100 for PLUS
    };

    const results = await tarkovApi.searchItems(params);
    
    // Enhanced results for PLUS users
    const enhancedResults = {
      ...results,
      plusFeatures: {
        bulkOperations: true,
        advancedFiltering: true,
        exportData: true,
        customSorting: true
      }
    };

    // Log API usage
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        type: 'SEARCH',
        data: {
          action: 'PLUS_SEARCH_POST',
          query: params.query,
          filters: params.filters,
          response_size: JSON.stringify(enhancedResults).length
        },
        timestamp: new Date().toISOString()
      });
    
    return NextResponse.json({
      success: true,
      data: enhancedResults
    });
    
  } catch (error) {
    console.error('Erro na API PLUS de busca (POST):', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}