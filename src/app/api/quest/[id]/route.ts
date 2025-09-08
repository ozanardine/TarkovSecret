import { NextRequest, NextResponse } from 'next/server';
import { tarkovDevApi } from '@/lib/tarkov-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id;

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Get all quests and find the specific one
    const quests = await tarkovDevApi.getQuests();
    const quest = quests.find(q => q.id === questId);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quest
    });

  } catch (error) {
    console.error(`Error in /api/quest/${params.id}:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
