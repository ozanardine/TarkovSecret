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

    // Get user preferences
    const { data: settings, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user settings:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      );
    }

    // If no settings found, create default settings
    if (!settings) {
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('user_preferences')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default settings:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar configurações padrão' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: newSettings,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Error getting user settings:', error);
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

    // Remove user_id from body to prevent tampering
    const { user_id, id, ...settingsData } = body;

    // Validate settings data
    const allowedFields = [
      'language', 'theme', 'timezone', 'profile_visibility', 
      'show_activity', 'allow_messages', 'discord_user_id', 
      'discord_username', 'discord_connected', 'steam_profile', 
      'twitch_username'
    ];

    const filteredData = Object.keys(settingsData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = settingsData[key];
        return obj;
      }, {} as any);

    // Update user preferences
    const { data: updatedSettings, error } = await supabaseAdmin
      .from('user_preferences')
      .update(filteredData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Configurações atualizadas com sucesso',
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
