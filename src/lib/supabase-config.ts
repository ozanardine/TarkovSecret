// Configuração do Supabase baseada no schema obtido
// Data de geração: 17 de Setembro de 2025

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database-schema'

// Configurações do Supabase local (desenvolvimento)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Cliente Supabase com tipos tipados
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Configurações específicas do projeto Secret Tarkov
export const SUPABASE_CONFIG = {
  // URLs
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  
  // Configurações de autenticação
  auth: {
    siteUrl: 'http://127.0.0.1:3000',
    redirectUrls: [
      'http://127.0.0.1:3000',
      'https://127.0.0.1:3000'
    ],
    jwtExpiry: 3600, // 1 hora
    refreshTokenRotation: true,
    enableSignup: true,
    enableAnonymousSignIns: false,
    minimumPasswordLength: 6
  },
  
  // Configurações do banco
  database: {
    port: 54322,
    majorVersion: 17
  },
  
  // Configurações da API
  api: {
    port: 54321,
    schemas: ['public', 'graphql_public'],
    maxRows: 1000
  },
  
  // Configurações do Studio
  studio: {
    port: 54323,
    enabled: true
  },
  
  // Configurações de storage
  storage: {
    enabled: true,
    fileSizeLimit: '50MiB'
  },
  
  // Configurações de realtime
  realtime: {
    enabled: true
  }
} as const

// Funções auxiliares para trabalhar com o banco
export const dbHelpers = {
  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
  
  // Obter perfil do usuário
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Obter configurações do usuário
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Atualizar configurações do usuário
  async updateUserSettings(userId: string, settings: Partial<Database['public']['Tables']['user_settings']['Update']>) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  // Criar configurações padrão para usuário
  async createDefaultUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Configurações de RLS (Row Level Security)
export const RLS_POLICIES = {
  users: {
    select: 'Users can view own profile',
    update: 'Users can update own profile',
    publicSelect: 'Users can view public profiles'
  },
  user_settings: {
    select: 'Users can view own settings',
    update: 'Users can update own settings',
    insert: 'Users can insert own settings'
  }
} as const

// Configurações de validação
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  displayName: {
    maxLength: 100
  },
  phone: {
    maxLength: 20
  },
  bio: {
    maxLength: 1000
  },
  language: {
    allowed: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'ru-RU'] as const
  },
  theme: {
    allowed: ['light', 'dark', 'auto'] as const
  },
  profileVisibility: {
    allowed: ['public', 'private', 'friends'] as const
  }
} as const

export default supabase
