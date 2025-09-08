import { NextRequest, NextResponse } from 'next/server';
import { tarkovApi } from '@/lib/tarkov-api';
import { SearchParams } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: SearchParams = {
      query: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      trader: searchParams.get('trader') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'name',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 25,
      filters: {
        types: searchParams.get('types')?.split(',') || undefined,
        fleaMarketOnly: searchParams.get('fleaMarketOnly') === 'true',
        traderOnly: searchParams.get('traderOnly') === 'true',
        inStock: searchParams.get('inStock') === 'true'
      }
    };

    const results = await tarkovApi.searchItems(params);
    
    return NextResponse.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Erro na API de busca:', error);
    
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
    const body = await request.json();
    const params: SearchParams = body;

    const results = await tarkovApi.searchItems(params);
    
    return NextResponse.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Erro na API de busca (POST):', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}