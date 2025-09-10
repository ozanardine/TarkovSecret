import { NextRequest, NextResponse } from 'next/server';
import { tarkovDevApi } from '@/lib/tarkov-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = searchParams.get('limit');
    const trader = searchParams.get('trader');
    const minLevel = searchParams.get('minLevel');

    // Get all quests from the API
    const quests = await tarkovDevApi.getQuests();

    // Apply filters if provided
    let filteredQuests = quests;

    if (trader) {
      filteredQuests = filteredQuests.filter(quest => 
        quest.trader?.normalizedName?.toLowerCase() === trader.toLowerCase()
      );
    }

    if (minLevel) {
      const minLevelNum = parseInt(minLevel);
      filteredQuests = filteredQuests.filter(quest => 
        (quest.minPlayerLevel || 0) >= minLevelNum
      );
    }

    if (limit) {
      const limitNum = parseInt(limit);
      filteredQuests = filteredQuests.slice(0, limitNum);
    }

    return NextResponse.json({
      success: true,
      data: filteredQuests,
      count: filteredQuests.length,
      total: quests.length
    });

  } catch (error) {
    console.error('Error in /api/quests:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quests',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
