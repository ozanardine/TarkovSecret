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
    refresh_interval: number;
  };
}

interface UserProfile {
  id?: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  level?: number;
  experience?: number;
  favorite_map?: string;
  main_weapon?: string;
  play_style?: 'AGGRESSIVE' | 'PASSIVE' | 'BALANCED' | 'SUPPORT';
  region?: string;
  timezone?: string;
  discord_username?: string;
  twitch_username?: string;
  youtube_channel?: string;
  is_public: boolean;
}

type TabType = 'profile' | 'general' | 'notifications' | 'privacy' | 'display' | 'integrations';

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [settings, setSettings] = useState<UserSettings>({
    user_id: '',
    theme: 'DARK',
    language: 'PT',
    currency: 'RUB',
    notifications: {
      price_alerts: true,
      quest_updates: true,
      market_updates: true,
      news_updates: true,
      email_notifications: true,
      push_notifications: false,
    },
    privacy: {
      profile_visibility: 'public',
      show_activity: true,
      allow_messages: true,
      show_online_status: true,
    },
    display: {
      items_per_page: 20,
      show_images: true,
      compact_mode: false,
      auto_refresh: true,
      refresh_interval: 30,
    },
  });
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    display_name: '',
    bio: '',
    level: 1,
    experience: 0,
    favorite_map: '',
    main_weapon: '',
    play_style: 'BALANCED',
    region: '',
    timezone: 'UTC+3',
    discord_username: '',
    twitch_username: '',
    youtube_channel: '',
    is_public: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
    { id: 'general' as TabType, label: 'Geral', icon: Globe },
    { id: 'notifications' as TabType, label: 'Notificações', icon: Bell },
    { id: 'privacy' as TabType, label: 'Privacidade', icon: Shield },
    { id: 'display' as TabType, label: 'Exibição', icon: Monitor },
    { id: 'integrations' as TabType, label: 'Integrações', icon: Gamepad2 },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    if (user) {
      loadSettings();
    }
  }, [isAuthenticated, router, user]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setSettings(prev => ({
            ...prev,
            ...data.preferences,
            user_id: user?.id || '',
          }));
        }
        if (data.profile) {
          setProfile(prev => ({
            ...prev,
            ...data.profile,
            user_id: user?.id || '',
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    // Profile is now loaded together with settings
    return;
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            user_id: user?.id,
          },
          preferences: {
            ...settings,
            user_id: user?.id,
          },
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const updateNestedSettings = (section: 'notifications' | 'privacy' | 'display', field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
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
            {/* Sidebar com Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-tarkov-secondary/50 rounded-lg p-4 sticky top-24">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ease-in-out transform ${
                          activeTab === tab.id
                            ? 'bg-tarkov-accent text-white shadow-lg shadow-tarkov-accent/25 scale-105'
                            : 'text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-accent/10 hover:scale-102'
                        }`}
                      >
                        <Icon className={`w-5 h-5 transition-transform duration-300 ${
                          activeTab === tab.id ? 'scale-110' : ''
                        }`} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="lg:col-span-3">
              <Card className="min-h-[600px] transition-all duration-500 ease-in-out p-6">
                {/* Tab: Perfil */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações do Perfil
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Nome de Exibição
                        </label>
                        <Input
                          type="text"
                          value={profile.display_name || ''}
                          onChange={(e) => updateProfile('display_name', e.target.value)}
                          placeholder="Seu nome de exibição"
                          className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Nível
                        </label>
                        <Input
                          type="number"
                          value={profile.level || 1}
                          onChange={(e) => updateProfile('level', parseInt(e.target.value))}
                          min="1"
                          max="79"
                          className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profile.bio || ''}
                          onChange={(e) => updateProfile('bio', e.target.value)}
                          placeholder="Conte um pouco sobre você..."
                          rows={3}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light placeholder-tarkov-muted focus:outline-none focus:border-tarkov-accent transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Mapa Favorito
                        </label>
                        <select
                          value={profile.favorite_map || ''}
                          onChange={(e) => updateProfile('favorite_map', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300"
                        >
                          <option value="">Selecione um mapa</option>
                          <option value="customs">Customs</option>
                          <option value="woods">Woods</option>
                          <option value="shoreline">Shoreline</option>
                          <option value="interchange">Interchange</option>
                          <option value="reserve">Reserve</option>
                          <option value="lighthouse">Lighthouse</option>
                          <option value="streets">Streets of Tarkov</option>
                          <option value="factory">Factory</option>
                          <option value="labs">The Lab</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Arma Principal
                        </label>
                        <Input
                          type="text"
                          value={profile.main_weapon || ''}
                          onChange={(e) => updateProfile('main_weapon', e.target.value)}
                          placeholder="Ex: AK-74M, M4A1, etc."
                          className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Estilo de Jogo
                        </label>
                        <select
                          value={profile.play_style || 'BALANCED'}
                          onChange={(e) => updateProfile('play_style', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300"
                        >
                          <option value="AGGRESSIVE">Agressivo</option>
                          <option value="PASSIVE">Passivo</option>
                          <option value="BALANCED">Equilibrado</option>
                          <option value="SUPPORT">Suporte</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Região
                        </label>
                        <Input
                          type="text"
                          value={profile.region || ''}
                          onChange={(e) => updateProfile('region', e.target.value)}
                          placeholder="Ex: Brasil, Europa, etc."
                          className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Fuso Horário
                        </label>
                        <select
                          value={profile.timezone || 'UTC+3'}
                          onChange={(e) => updateProfile('timezone', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300"
                        >
                          <option value="UTC-3">UTC-3 (Brasil)</option>
                          <option value="UTC+0">UTC+0 (Londres)</option>
                          <option value="UTC+1">UTC+1 (Europa Central)</option>
                          <option value="UTC+3">UTC+3 (Moscou)</option>
                          <option value="UTC+8">UTC+8 (China)</option>
                          <option value="UTC-5">UTC-5 (Nova York)</option>
                          <option value="UTC-8">UTC-8 (Los Angeles)</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_public"
                            checked={profile.is_public}
                            onChange={(e) => updateProfile('is_public', e.target.checked)}
                            className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                          />
                          <label htmlFor="is_public" className="text-sm text-tarkov-light">
                            Tornar perfil público
                          </label>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Tab: Geral */}
                {activeTab === 'general' && settings && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Configurações Gerais
                    </h2>
                    
                    <div className="space-y-6">
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4">Preferências Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-tarkov-light mb-2 flex items-center gap-2">
                              <Languages className="w-4 h-4" />
                              Idioma
                            </label>
                            <select
                              value={settings.language}
                              onChange={(e) => updateSetting('language', e.target.value)}
                              className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
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
                            <label className="block text-sm font-medium text-tarkov-light mb-2 flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              Tema
                            </label>
                            <select
                              value={settings.theme}
                              onChange={(e) => updateSetting('theme', e.target.value)}
                              className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                            >
                              <option value="DARK">Escuro</option>
                              <option value="LIGHT">Claro</option>
                              <option value="AUTO">Automático</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-tarkov-light mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Moeda
                            </label>
                            <select
                              value={settings.currency}
                              onChange={(e) => updateSetting('currency', e.target.value)}
                              className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                            >
                              <option value="RUB">Rublo Russo (₽)</option>
                              <option value="USD">Dólar Americano ($)</option>
                              <option value="EUR">Euro (€)</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}


                {/* Tab: Notificações */}
                {activeTab === 'notifications' && settings && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notificações
                    </h2>
                    
                    <div className="space-y-6">
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4">Notificações do Jogo</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">Alertas de Preço</h4>
                              <p className="text-sm text-tarkov-muted">Receba notificações quando itens atingirem o preço desejado</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.price_alerts}
                                onChange={(e) => updateNestedSettings('notifications', 'price_alerts', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">Atualizações de Quest</h4>
                              <p className="text-sm text-tarkov-muted">Notificações sobre novas quests e atualizações</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.quest_updates}
                                onChange={(e) => updateNestedSettings('notifications', 'quest_updates', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">Atualizações do Mercado</h4>
                              <p className="text-sm text-tarkov-muted">Mudanças importantes no mercado e preços</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.market_updates}
                                onChange={(e) => updateNestedSettings('notifications', 'market_updates', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">Notícias e Atualizações</h4>
                              <p className="text-sm text-tarkov-muted">Novidades sobre o jogo e atualizações do sistema</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.news_updates}
                                onChange={(e) => updateNestedSettings('notifications', 'news_updates', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4">Métodos de Notificação</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">Notificações por Email</h4>
                              <p className="text-sm text-tarkov-muted">Receber notificações no seu email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.email_notifications}
                                onChange={(e) => updateNestedSettings('notifications', 'email_notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-tarkov-light">Notificações Push</h4>
                              <p className="text-sm text-tarkov-muted">Notificações no navegador (quando disponível)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.push_notifications}
                                onChange={(e) => updateNestedSettings('notifications', 'push_notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                            </label>
                          </div>
                        </div>
                      </Card>
                    </div>
                    </div>
                  </div>
                )}

                {/* Tab: Privacidade */}
                {activeTab === 'privacy' && settings && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacidade
                    </h2>
                    
                    <div className="space-y-6">
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4">Configurações de Perfil</h3>
                        <div>
                          <label className="block text-sm font-medium text-tarkov-light mb-2">
                            Visibilidade do Perfil
                          </label>
                          <select
                            value={settings.privacy.profile_visibility}
                            onChange={(e) => updateNestedSettings('privacy', 'profile_visibility', e.target.value)}
                            className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                          >
                            <option value="private">Privado</option>
                            <option value="public">Público</option>
                            <option value="friends">Apenas Amigos</option>
                          </select>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4">Configurações de Interação</h3>
                        <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-tarkov-light">Mostrar Atividade</h4>
                            <p className="text-sm text-tarkov-muted">Permitir que outros vejam sua atividade</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy.show_activity}
                              onChange={(e) => updateNestedSettings('privacy', 'show_activity', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-tarkov-light">Permitir Mensagens</h4>
                            <p className="text-sm text-tarkov-muted">Permitir que outros usuários enviem mensagens</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy.allow_messages}
                              onChange={(e) => updateNestedSettings('privacy', 'allow_messages', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-tarkov-dark/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-tarkov-light">Mostrar Status Online</h4>
                            <p className="text-sm text-tarkov-muted">Permitir que outros vejam quando você está online</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy.show_online_status}
                              onChange={(e) => updateNestedSettings('privacy', 'show_online_status', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Exibição */}
                 {activeTab === 'display' && settings && (
                   <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                     <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                       <Monitor className="w-5 h-5" />
                       Configurações de Exibição
                     </h2>
                     
                     <div className="space-y-6">
                       <Card className="p-4">
                         <h3 className="text-lg font-medium text-tarkov-light mb-4">Interface</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-tarkov-light mb-2">
                               Itens por Página
                             </label>
                             <select
                               value={settings.display.items_per_page}
                               onChange={(e) => updateNestedSettings('display', 'items_per_page', parseInt(e.target.value))}
                               className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300"
                             >
                               <option value={10}>10 itens</option>
                               <option value={20}>20 itens</option>
                               <option value={50}>50 itens</option>
                               <option value={100}>100 itens</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-tarkov-light mb-2">
                               Intervalo de Atualização (segundos)
                             </label>
                             <select
                               value={settings.display.refresh_interval}
                               onChange={(e) => updateNestedSettings('display', 'refresh_interval', parseInt(e.target.value))}
                               className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300"
                             >
                               <option value={15}>15 segundos</option>
                               <option value={30}>30 segundos</option>
                               <option value={60}>1 minuto</option>
                               <option value={300}>5 minutos</option>
                             </select>
                           </div>
                         </div>
                       </Card>
                       
                       <Card className="p-4">
                         <h3 className="text-lg font-medium text-tarkov-light mb-4">Preferências Visuais</h3>
                         <div className="space-y-4">
                           <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                             <div>
                               <h4 className="font-medium text-tarkov-light">Mostrar Imagens</h4>
                               <p className="text-sm text-tarkov-muted">Exibir imagens dos itens nas listas</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input
                                 type="checkbox"
                                 checked={settings.display.show_images}
                                 onChange={(e) => updateNestedSettings('display', 'show_images', e.target.checked)}
                                 className="sr-only peer"
                               />
                               <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                             </label>
                           </div>
                           
                           <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                             <div>
                               <h4 className="font-medium text-tarkov-light">Modo Compacto</h4>
                               <p className="text-sm text-tarkov-muted">Usar layout mais compacto para economizar espaço</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input
                                 type="checkbox"
                                 checked={settings.display.compact_mode}
                                 onChange={(e) => updateNestedSettings('display', 'compact_mode', e.target.checked)}
                                 className="sr-only peer"
                               />
                               <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                             </label>
                           </div>
                           
                           <div className="flex items-center justify-between p-3 bg-tarkov-dark/50 rounded-lg">
                             <div>
                               <h4 className="font-medium text-tarkov-light">Atualização Automática</h4>
                               <p className="text-sm text-tarkov-muted">Atualizar dados automaticamente em intervalos regulares</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input
                                 type="checkbox"
                                 checked={settings.display.auto_refresh}
                                 onChange={(e) => updateNestedSettings('display', 'auto_refresh', e.target.checked)}
                                 className="sr-only peer"
                               />
                               <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                             </label>
                           </div>
                         </div>
                       </Card>
                     </div>
                   </div>
                 )}

                 {/* Tab: Integrações */}
                 {activeTab === 'integrations' && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      Integrações
                    </h2>
                    
                    <div className="space-y-6">
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4 flex items-center gap-2">
                          <Gamepad className="w-5 h-5 text-purple-400" />
                          Discord
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-tarkov-light mb-2">
                              Nome de Usuário do Discord
                            </label>
                            <Input
                              type="text"
                              placeholder="SeuUsuario#1234"
                              value={profile.discord_username || ''}
                              onChange={(e) => updateProfile('discord_username', e.target.value)}
                              className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                            />
                            <p className="text-xs text-tarkov-muted mt-1">
                              Inclua o número discriminador (ex: #1234)
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4 flex items-center gap-2">
                          <Twitch className="w-5 h-5 text-purple-500" />
                          Twitch
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-tarkov-light mb-2">
                              Nome de Usuário do Twitch
                            </label>
                            <Input
                              type="text"
                              placeholder="seu_usuario"
                              value={profile.twitch_username || ''}
                              onChange={(e) => updateProfile('twitch_username', e.target.value)}
                              className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                            />
                            {profile.twitch_username && (
                              <p className="text-xs text-green-400 mt-1">
                                Canal: twitch.tv/{profile.twitch_username}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="text-lg font-medium text-tarkov-light mb-4 flex items-center gap-2">
                          <Youtube className="w-5 h-5 text-red-500" />
                          YouTube
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-tarkov-light mb-2">
                              Canal do YouTube
                            </label>
                            <Input
                              type="url"
                              placeholder="https://youtube.com/@seucanal"
                              value={profile.youtube_channel || ''}
                              onChange={(e) => updateProfile('youtube_channel', e.target.value)}
                              className="bg-tarkov-dark border-tarkov-border text-tarkov-light"
                            />
                            {profile.youtube_channel && (
                              <p className="text-xs text-green-400 mt-1">
                                Canal configurado
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-tarkov-accent hover:bg-tarkov-accent/90 text-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-tarkov-accent/25 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;