'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Globe, 
  Shield, 
  Eye, 
  Gamepad2,
  Save,
  X,
  Check,
  AlertCircle,
  Bell,
  Monitor,
  Palette,
  Languages,
  DollarSign,
  Clock,
  MapPin,
  Gamepad,
  Twitch,
  Youtube,
  Settings
} from 'lucide-react';

interface UserSettings {
  id?: string;
  user_id: string;
  theme: 'DARK' | 'LIGHT' | 'AUTO';
  language: 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE';
  currency: 'RUB' | 'USD' | 'EUR';
  notifications: {
    price_alerts: boolean;
    quest_updates: boolean;
    market_updates: boolean;
    news_updates: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_activity: boolean;
    allow_messages: boolean;
    show_online_status: boolean;
  };
  display: {
    items_per_page: number;
    show_images: boolean;
    compact_mode: boolean;
    auto_refresh: boolean;
  };
  integrations: {
    twitch_connected: boolean;
    youtube_connected: boolean;
    discord_connected: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings();
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    try {
      // Simulated API call - replace with actual API
      const defaultSettings: UserSettings = {
        user_id: user?.id || '',
        theme: 'DARK',
        language: 'PT',
        currency: 'RUB',
        notifications: {
          price_alerts: true,
          quest_updates: true,
          market_updates: false,
          news_updates: true,
          email_notifications: true,
          push_notifications: false
        },
        privacy: {
          profile_visibility: 'public',
          show_activity: true,
          allow_messages: true,
          show_online_status: true
        },
        display: {
          items_per_page: 25,
          show_images: true,
          compact_mode: false,
          auto_refresh: true
        },
        integrations: {
          twitch_connected: false,
          youtube_connected: false,
          discord_connected: false
        }
      };
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Erro ao carregar configurações');
    }
  };

  const loadProfile = async () => {
    try {
      // Simulated API call - replace with actual API
      const defaultProfile: UserProfile = {
        id: user?.id || '',
        username: user?.email?.split('@')[0] || 'user',
        email: user?.email || '',
        display_name: '',
        bio: '',
        location: '',
        website: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(defaultProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage('error', 'Erro ao carregar perfil');
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      showMessage('error', 'Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tarkov-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tarkov-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-tarkov-dark py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-2">
              <Settings className="inline w-8 h-8 text-tarkov-accent mr-3" />
              Configurações
            </h1>
            <p className="text-tarkov-muted">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Perfil', icon: User },
                  { id: 'general', label: 'Geral', icon: Globe },
                  { id: 'notifications', label: 'Notificações', icon: Bell },
                  { id: 'privacy', label: 'Privacidade', icon: Shield },
                  { id: 'display', label: 'Exibição', icon: Monitor },
                  { id: 'integrations', label: 'Integrações', icon: Gamepad2 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-tarkov-accent text-tarkov-dark font-medium'
                          : 'text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-dark/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Tab: Profile */}
              {activeTab === 'profile' && profile && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-tarkov-accent" />
                      Informações do Perfil
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Nome de usuário
                        </label>
                        <Input
                          value={profile.username}
                          onChange={(e) => updateProfile({ username: e.target.value })}
                          placeholder="Seu nome de usuário"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Nome de exibição
                        </label>
                        <Input
                          value={profile.display_name || ''}
                          onChange={(e) => updateProfile({ display_name: e.target.value })}
                          placeholder="Como você quer ser chamado"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Email
                        </label>
                        <Input
                          value={profile.email}
                          onChange={(e) => updateProfile({ email: e.target.value })}
                          type="email"
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profile.bio || ''}
                          onChange={(e) => updateProfile({ bio: e.target.value })}
                          placeholder="Conte um pouco sobre você..."
                          rows={3}
                          className="w-full px-3 py-2 bg-tarkov-dark/50 border border-tarkov-border rounded-lg text-tarkov-light placeholder-tarkov-muted focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Localização
                        </label>
                        <Input
                          value={profile.location || ''}
                          onChange={(e) => updateProfile({ location: e.target.value })}
                          placeholder="Sua cidade/país"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Website
                        </label>
                        <Input
                          value={profile.website || ''}
                          onChange={(e) => updateProfile({ website: e.target.value })}
                          placeholder="https://seusite.com"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={saveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: General */}
              {activeTab === 'general' && settings && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-tarkov-accent" />
                      Preferências Gerais
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Tema
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) => updateSettings({ theme: e.target.value as 'DARK' | 'LIGHT' | 'AUTO' })}
                          className="w-full px-3 py-2 bg-tarkov-dark/50 border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:border-transparent"
                        >
                          <option value="DARK">Escuro</option>
                          <option value="LIGHT">Claro</option>
                          <option value="AUTO">Automático</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Idioma
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => updateSettings({ language: e.target.value as 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE' })}
                          className="w-full px-3 py-2 bg-tarkov-dark/50 border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:border-transparent"
                        >
                          <option value="PT">Português</option>
                          <option value="EN">English</option>
                          <option value="RU">Русский</option>
                          <option value="ES">Español</option>
                          <option value="FR">Français</option>
                          <option value="DE">Deutsch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Moeda
                        </label>
                        <select
                          value={settings.currency}
                          onChange={(e) => updateSettings({ currency: e.target.value as 'RUB' | 'USD' | 'EUR' })}
                          className="w-full px-3 py-2 bg-tarkov-dark/50 border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:border-transparent"
                        >
                          <option value="RUB">₽ Rublo Russo</option>
                          <option value="USD">$ Dólar Americano</option>
                          <option value="EUR">€ Euro</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: Notifications */}
              {activeTab === 'notifications' && settings && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-tarkov-accent" />
                      Configurações de Notificação
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: 'price_alerts', label: 'Alertas de Preço', desc: 'Receba notificações quando os preços mudarem' },
                        { key: 'quest_updates', label: 'Atualizações de Quest', desc: 'Notificações sobre novas quests e mudanças' },
                        { key: 'market_updates', label: 'Atualizações do Mercado', desc: 'Mudanças importantes no mercado' },
                        { key: 'news_updates', label: 'Notícias', desc: 'Últimas notícias e atualizações do jogo' },
                        { key: 'email_notifications', label: 'Notificações por Email', desc: 'Receber notificações por email' },
                        { key: 'push_notifications', label: 'Notificações Push', desc: 'Notificações push no navegador' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-tarkov-light">{item.label}</h4>
                            <p className="text-sm text-tarkov-muted">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                              onChange={(e) => updateSettings({
                                notifications: {
                                  ...settings.notifications,
                                  [item.key]: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-tarkov-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tarkov-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tarkov-accent"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: Privacy */}
              {activeTab === 'privacy' && settings && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-tarkov-accent" />
                      Configurações de Privacidade
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Visibilidade do Perfil
                        </label>
                        <select
                          value={settings.privacy.profile_visibility}
                          onChange={(e) => updateSettings({
                            privacy: {
                              ...settings.privacy,
                              profile_visibility: e.target.value as 'public' | 'private' | 'friends'
                            }
                          })}
                          className="w-full px-3 py-2 bg-tarkov-dark/50 border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:border-transparent"
                        >
                          <option value="public">Público</option>
                          <option value="friends">Apenas Amigos</option>
                          <option value="private">Privado</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'show_activity', label: 'Mostrar Atividade', desc: 'Permitir que outros vejam sua atividade recente' },
                          { key: 'allow_messages', label: 'Permitir Mensagens', desc: 'Receber mensagens de outros usuários' },
                          { key: 'show_online_status', label: 'Mostrar Status Online', desc: 'Exibir quando você está online' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">{item.label}</h4>
                              <p className="text-sm text-tarkov-muted">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                                onChange={(e) => updateSettings({
                                  privacy: {
                                    ...settings.privacy,
                                    [item.key]: e.target.checked
                                  }
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-tarkov-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tarkov-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: Display */}
              {activeTab === 'display' && settings && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-tarkov-accent" />
                      Configurações de Exibição
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Itens por página
                        </label>
                        <select
                          value={settings.display.items_per_page}
                          onChange={(e) => updateSettings({
                            display: {
                              ...settings.display,
                              items_per_page: parseInt(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 bg-tarkov-dark/50 border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:ring-2 focus:ring-tarkov-accent focus:border-transparent"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'show_images', label: 'Mostrar Imagens', desc: 'Exibir imagens dos itens nas listas' },
                          { key: 'compact_mode', label: 'Modo Compacto', desc: 'Interface mais compacta com menos espaçamento' },
                          { key: 'auto_refresh', label: 'Atualização Automática', desc: 'Atualizar dados automaticamente' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">{item.label}</h4>
                              <p className="text-sm text-tarkov-muted">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.display[item.key as keyof typeof settings.display] as boolean}
                                onChange={(e) => updateSettings({
                                  display: {
                                    ...settings.display,
                                    [item.key]: e.target.checked
                                  }
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-tarkov-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tarkov-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: Integrations */}
              {activeTab === 'integrations' && settings && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-tarkov-accent" />
                      Integrações
                    </h3>
                    <div className="space-y-4">
                      {[
                        { 
                          key: 'twitch_connected', 
                          label: 'Twitch', 
                          desc: 'Conecte sua conta Twitch para recursos especiais',
                          icon: Twitch,
                          color: 'text-purple-400'
                        },
                        { 
                          key: 'youtube_connected', 
                          label: 'YouTube', 
                          desc: 'Conecte sua conta YouTube para compartilhar conteúdo',
                          icon: Youtube,
                          color: 'text-red-400'
                        },
                        { 
                          key: 'discord_connected', 
                          label: 'Discord', 
                          desc: 'Conecte sua conta Discord para integração com servidor',
                          icon: Gamepad,
                          color: 'text-blue-400'
                        }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isConnected = settings.integrations[item.key as keyof typeof settings.integrations];
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className={`w-6 h-6 ${item.color}`} />
                              <div>
                                <h4 className="font-medium text-tarkov-light flex items-center gap-2">
                                  {item.label}
                                  {isConnected && (
                                    <Badge variant="success" className="text-xs">
                                      Conectado
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-tarkov-muted">{item.desc}</p>
                              </div>
                            </div>
                            <Button
                              variant={isConnected ? "outline" : "primary"}
                              size="sm"
                              onClick={() => {
                                // Simulate connection toggle
                                updateSettings({
                                  integrations: {
                                    ...settings.integrations,
                                    [item.key]: !isConnected
                                  }
                                });
                                showMessage('success', `${item.label} ${!isConnected ? 'conectado' : 'desconectado'} com sucesso!`);
                              }}
                            >
                              {isConnected ? 'Desconectar' : 'Conectar'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;