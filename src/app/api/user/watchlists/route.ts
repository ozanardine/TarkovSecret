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

    // Get user watchlists with items
    const { data: watchlists } = await supabaseAdmin
      .from('watchlists')
      .select(`
        *,
        watchlist_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      watchlists: watchlists || [],
    });

  } catch (error) {
    console.error('Error getting user watchlists:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    const body = await request.json();
    const { name, description, is_public } = body;

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

    // Create new watchlist
    const { data: watchlist, error: watchlistError } = await supabaseAdmin
      .from('watchlists')
      .insert({
        user_id: user.id,
        name,
        description,
        is_public: is_public || false,
      })
      .select()
      .single();

    if (watchlistError) {
      console.error('Error creating watchlist:', watchlistError);
      return NextResponse.json(
        { error: 'Erro ao criar lista' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      watchlist,
      message: 'Lista criada com sucesso',
    });

  } catch (error) {
    console.error('Error creating watchlist:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
