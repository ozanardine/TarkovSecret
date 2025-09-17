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

    // Get user profile
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        user_profiles(*),
        user_preferences(*)
      `)
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      profile: user.user_profiles?.[0] || null,
      preferences: user.user_preferences?.[0] || null,
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
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
    const { name, image, profile, preferences } = body;

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

    // Update user basic info
    if (name !== undefined || image !== undefined) {
      await supabaseAdmin
        .from('users')
        .update({
          name: name || undefined,
          image: image || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    // Update profile
    if (profile) {
      await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          location: profile.location,
          website: profile.website,
          is_public: profile.is_public,
          updated_at: new Date().toISOString(),
        });
    }

    // Update preferences
    if (preferences) {
      await supabaseAdmin
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: preferences.theme,
          language: preferences.language,
          currency: preferences.currency,
          notifications: preferences.notifications,
          privacy: preferences.privacy,
          display: preferences.display,
          updated_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
