import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Advanced analytics for PLUS users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    const type = searchParams.get('type') || 'overview'; // overview, searches, items, performance

    let analytics = {};

    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics(user.id, period);
        break;
      case 'searches':
        analytics = await getSearchAnalytics(user.id, period);
        break;
      case 'items':
        analytics = await getItemAnalytics(user.id, period);
        break;
      case 'performance':
        analytics = await getPerformanceAnalytics(user.id, period);
        break;
      default:
        analytics = await getOverviewAnalytics(user.id, period);
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      metadata: {
        period,
        type,
        generatedAt: new Date().toISOString(),
        plan: 'PLUS'
      }
    });
    
  } catch (error) {
    console.error('Erro na API PLUS de analytics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

async function getOverviewAnalytics(userId: string, period: string) {
  const days = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // API Usage Statistics
  const { data: apiUsage } = await supabaseAdmin
    .from('api_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  // Search Statistics
  const { data: searches } = await supabaseAdmin
    .from('user_searches')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  // Watchlist Statistics
  const { data: watchlist } = await supabaseAdmin
    .from('user_watchlist')
    .select('*')
    .eq('user_id', userId);

  return {
    summary: {
      totalApiCalls: apiUsage?.length || 0,
      totalSearches: searches?.length || 0,
      watchlistItems: watchlist?.length || 0,
      averageResponseTime: calculateAverageResponseTime(apiUsage || []),
      mostActiveDay: getMostActiveDay(apiUsage || [])
    },
    trends: {
      dailyApiCalls: getDailyTrends(apiUsage || [], days),
      dailySearches: getDailyTrends(searches || [], days)
    },
    topEndpoints: getTopEndpoints(apiUsage || []),
    performance: {
      averageResponseTime: calculateAverageResponseTime(apiUsage || []),
      successRate: calculateSuccessRate(apiUsage || [])
    }
  };
}

async function getSearchAnalytics(userId: string, period: string) {
  const days = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: searches } = await supabaseAdmin
    .from('user_searches')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  return {
    totalSearches: searches?.length || 0,
    topQueries: getTopQueries(searches || []),
    searchTypes: getSearchTypeDistribution(searches || []),
    timeDistribution: getTimeDistribution(searches || []),
    resultsAnalysis: getResultsAnalysis(searches || [])
  };
}

async function getItemAnalytics(userId: string, period: string) {
  const days = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: watchlist } = await supabaseAdmin
    .from('user_watchlist')
    .select('*')
    .eq('user_id', userId);

  const { data: searches } = await supabaseAdmin
    .from('user_searches')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  return {
    watchlistStats: {
      totalItems: watchlist?.length || 0,
      categoriesDistribution: getCategoriesDistribution(watchlist || []),
      priceRangeDistribution: getPriceRangeDistribution(watchlist || [])
    },
    searchedItems: {
      mostSearchedCategories: getMostSearchedCategories(searches || []),
      averagePriceRange: getAveragePriceRange(searches || [])
    }
  };
}

async function getPerformanceAnalytics(userId: string, period: string) {
  const days = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: apiUsage } = await supabaseAdmin
    .from('api_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  return {
    responseTime: {
      average: calculateAverageResponseTime(apiUsage || []),
      median: calculateMedianResponseTime(apiUsage || []),
      p95: calculateP95ResponseTime(apiUsage || [])
    },
    throughput: {
      requestsPerHour: calculateRequestsPerHour(apiUsage || []),
      peakHour: getPeakHour(apiUsage || [])
    },
    errors: {
      errorRate: calculateErrorRate(apiUsage || []),
      commonErrors: getCommonErrors(apiUsage || [])
    }
  };
}

// Helper functions
function getPeriodDays(period: string): number {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    default: return 30;
  }
}

function calculateAverageResponseTime(apiUsage: any[]): number {
  if (!apiUsage.length) return 0;
  const total = apiUsage.reduce((sum, usage) => sum + (usage.response_time || 0), 0);
  return Math.round(total / apiUsage.length);
}

function calculateMedianResponseTime(apiUsage: any[]): number {
  if (!apiUsage.length) return 0;
  const times = apiUsage.map(usage => usage.response_time || 0).sort((a, b) => a - b);
  const mid = Math.floor(times.length / 2);
  return times.length % 2 === 0 ? (times[mid - 1] + times[mid]) / 2 : times[mid];
}

function calculateP95ResponseTime(apiUsage: any[]): number {
  if (!apiUsage.length) return 0;
  const times = apiUsage.map(usage => usage.response_time || 0).sort((a, b) => a - b);
  const index = Math.floor(times.length * 0.95);
  return times[index] || 0;
}

function calculateSuccessRate(apiUsage: any[]): number {
  if (!apiUsage.length) return 100;
  const successful = apiUsage.filter(usage => !usage.error).length;
  return Math.round((successful / apiUsage.length) * 100);
}

function calculateErrorRate(apiUsage: any[]): number {
  return 100 - calculateSuccessRate(apiUsage);
}

function getDailyTrends(data: any[], days: number): any[] {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayData = data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate.toDateString() === date.toDateString();
    });
    trends.push({
      date: date.toISOString().split('T')[0],
      count: dayData.length
    });
  }
  return trends;
}

function getTopEndpoints(apiUsage: any[]): any[] {
  const endpointCounts = apiUsage.reduce((acc, usage) => {
    acc[usage.endpoint] = (acc[usage.endpoint] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10);
}

function getTopQueries(searches: any[]): any[] {
  const queryCounts = searches.reduce((acc, search) => {
    const query = search.query || 'empty';
    acc[query] = (acc[query] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10);
}

function getSearchTypeDistribution(searches: any[]): any[] {
  const typeCounts = searches.reduce((acc, search) => {
    const type = search.type || 'text';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
}

function getTimeDistribution(searches: any[]): any[] {
  const hourCounts = searches.reduce((acc, search) => {
    const hour = new Date(search.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourCounts[hour] || 0
  }));
}

function getResultsAnalysis(searches: any[]): any {
  const totalResults = searches.reduce((sum, search) => sum + (search.results_count || 0), 0);
  const avgResults = searches.length ? totalResults / searches.length : 0;
  
  return {
    totalResults,
    averageResults: Math.round(avgResults),
    zeroResultSearches: searches.filter(s => (s.results_count || 0) === 0).length
  };
}

function getMostActiveDay(apiUsage: any[]): string {
  const dayCounts = apiUsage.reduce((acc, usage) => {
    const day = new Date(usage.created_at).toDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  
  const mostActive = Object.entries(dayCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  
  return mostActive ? mostActive[0] : 'N/A';
}

function calculateRequestsPerHour(apiUsage: any[]): number {
  if (!apiUsage.length) return 0;
  const hours = (Date.now() - new Date(apiUsage[0].created_at).getTime()) / (1000 * 60 * 60);
  return Math.round(apiUsage.length / Math.max(hours, 1));
}

function getPeakHour(apiUsage: any[]): number {
  const hourCounts = apiUsage.reduce((acc, usage) => {
    const hour = new Date(usage.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  
  const peakEntry = Object.entries(hourCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  
  return peakEntry ? parseInt(peakEntry[0]) : 0;
}

function getCommonErrors(apiUsage: any[]): any[] {
  const errorCounts = apiUsage
    .filter(usage => usage.error)
    .reduce((acc, usage) => {
      const error = usage.error || 'Unknown error';
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {});
  
  return Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5);
}

function getCategoriesDistribution(watchlist: any[]): any[] {
  const categoryCounts = watchlist.reduce((acc, item) => {
    const category = item.category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
}

function getPriceRangeDistribution(watchlist: any[]): any[] {
  const ranges = [
    { label: '< 10k', min: 0, max: 10000 },
    { label: '10k - 50k', min: 10000, max: 50000 },
    { label: '50k - 100k', min: 50000, max: 100000 },
    { label: '100k - 500k', min: 100000, max: 500000 },
    { label: '> 500k', min: 500000, max: Infinity }
  ];
  
  return ranges.map(range => ({
    label: range.label,
    count: watchlist.filter(item => {
      const price = item.price || 0;
      return price >= range.min && price < range.max;
    }).length
  }));
}

function getMostSearchedCategories(searches: any[]): any[] {
  const categoryCounts = searches.reduce((acc, search) => {
    const category = search.category || 'All';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10);
}

function getAveragePriceRange(searches: any[]): any {
  const priceSearches = searches.filter(s => s.min_price || s.max_price);
  if (!priceSearches.length) return { min: 0, max: 0 };
  
  const avgMin = priceSearches.reduce((sum, s) => sum + (s.min_price || 0), 0) / priceSearches.length;
  const avgMax = priceSearches.reduce((sum, s) => sum + (s.max_price || 0), 0) / priceSearches.length;
  
  return {
    min: Math.round(avgMin),
    max: Math.round(avgMax)
  };
}