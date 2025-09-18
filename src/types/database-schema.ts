// Tipos TypeScript gerados automaticamente baseados no schema do Supabase
// Data de geração: 17 de Setembro de 2025

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified: boolean
          phone: string | null
          phone_verified: boolean
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
          is_active: boolean
          is_banned: boolean
          ban_reason: string | null
          is_public: boolean
          allow_direct_messages: boolean
        }
        Insert: {
          id?: string
          email: string
          email_verified?: boolean
          phone?: string | null
          phone_verified?: boolean
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
          is_active?: boolean
          is_banned?: boolean
          ban_reason?: string | null
          is_public?: boolean
          allow_direct_messages?: boolean
        }
        Update: {
          id?: string
          email?: string
          email_verified?: boolean
          phone?: string | null
          phone_verified?: boolean
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
          is_active?: boolean
          is_banned?: boolean
          ban_reason?: string | null
          is_public?: boolean
          allow_direct_messages?: boolean
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          language: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ru-RU'
          theme: 'light' | 'dark' | 'auto'
          timezone: string
          profile_visibility: 'public' | 'private' | 'friends'
          show_activity: boolean
          allow_messages: boolean
          discord_user_id: string | null
          discord_username: string | null
          discord_connected: boolean
          steam_profile: string | null
          twitch_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          language?: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ru-RU'
          theme?: 'light' | 'dark' | 'auto'
          timezone?: string
          profile_visibility?: 'public' | 'private' | 'friends'
          show_activity?: boolean
          allow_messages?: boolean
          discord_user_id?: string | null
          discord_username?: string | null
          discord_connected?: boolean
          steam_profile?: string | null
          twitch_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          language?: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ru-RU'
          theme?: 'light' | 'dark' | 'auto'
          timezone?: string
          profile_visibility?: 'public' | 'private' | 'friends'
          show_activity?: boolean
          allow_messages?: boolean
          discord_user_id?: string | null
          discord_username?: string | null
          discord_connected?: boolean
          steam_profile?: string | null
          twitch_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_user_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_settings_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_users_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para facilitar o uso
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type UserSettings = Database['public']['Tables']['user_settings']['Row']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

// Tipos para configurações de idioma
export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ru-RU'

// Tipos para configurações de tema
export type SupportedTheme = 'light' | 'dark' | 'auto'

// Tipos para visibilidade do perfil
export type ProfileVisibility = 'public' | 'private' | 'friends'

// Constantes para validação
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'ru-RU']
export const SUPPORTED_THEMES: SupportedTheme[] = ['light', 'dark', 'auto']
export const PROFILE_VISIBILITY_OPTIONS: ProfileVisibility[] = ['public', 'private', 'friends']

// Configurações padrão
export const DEFAULT_USER_SETTINGS: Partial<UserSettingsInsert> = {
  language: 'pt-BR',
  theme: 'dark',
  timezone: 'America/Sao_Paulo',
  profile_visibility: 'private',
  show_activity: false,
  allow_messages: true,
  discord_connected: false
}
