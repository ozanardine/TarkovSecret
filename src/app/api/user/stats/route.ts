import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Get user ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Get user stats
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) {
      // Create default stats if they don't exist
      const { data: newStats } = await supabaseAdmin
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_logins: 0,
          total_searches: 0,
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        stats: newStats,
      });
    }

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { total_searches, favorite_items, watched_items, completed_quests, hideout_progress, achievements } = body;

    // Get user ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Update user stats
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (total_searches !== undefined) updateData.total_searches = total_searches;
    if (favorite_items !== undefined) updateData.favorite_items = favorite_items;
    if (watched_items !== undefined) updateData.watched_items = watched_items;
    if (completed_quests !== undefined) updateData.completed_quests = completed_quests;
    if (hideout_progress !== undefined) updateData.hideout_progress = hideout_progress;
    if (achievements !== undefined) updateData.achievements = achievements;

    const { data: stats, error: updateError } = await supabaseAdmin
      .from('user_stats')
      .upsert({
        user_id: user.id,
        ...updateData,
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user stats:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar estatísticas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
      message: 'Estatísticas atualizadas com sucesso',
    });

  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
