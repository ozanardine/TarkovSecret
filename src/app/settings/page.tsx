'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';

interface UserSettings {
  id?: string;
  user_id: string;
  language: string;
  theme: string;
  timezone: string;
  profile_visibility: string;
  show_activity: boolean;
  allow_messages: boolean;
  discord_user_id?: string;
  discord_username?: string;
  discord_connected: boolean;
  steam_profile?: string;
  twitch_username?: string;
}

type TabType = 'profile' | 'general' | 'privacy' | 'integrations';

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
    { id: 'general' as TabType, label: 'Geral', icon: Globe },
    { id: 'privacy' as TabType, label: 'Privacidade', icon: Shield },
    { id: 'integrations' as TabType, label: 'Integrações', icon: Gamepad2 },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    loadSettings();
  }, [isAuthenticated, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
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
    <div className="min-h-screen bg-tarkov-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-tarkov-light mb-2">Configurações</h1>
            <p className="text-tarkov-muted">Gerencie suas preferências e configurações da conta</p>
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
              <div className="bg-tarkov-secondary/50 rounded-lg p-6 min-h-[600px] transition-all duration-500 ease-in-out">
                {/* Tab: Perfil */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4">Informações do Perfil</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Nome
                        </label>
                        <Input
                          value={user?.name || ''}
                          disabled
                          className="bg-tarkov-dark/50"
                        />
                        <p className="text-xs text-tarkov-muted mt-1">Nome não pode ser alterado aqui</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Email
                        </label>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="bg-tarkov-dark/50"
                        />
                        <p className="text-xs text-tarkov-muted mt-1">Email não pode ser alterado aqui</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Geral */}
                {activeTab === 'general' && settings && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4">Configurações Gerais</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Idioma
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => updateSetting('language', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                        >
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                          <option value="fr-FR">Français</option>
                          <option value="de-DE">Deutsch</option>
                          <option value="ru-RU">Русский</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Tema
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) => updateSetting('theme', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                        >
                          <option value="dark">Escuro</option>
                          <option value="light">Claro</option>
                          <option value="auto">Automático</option>
                        </select>
                      </div>
                      
                      
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Fuso Horário
                        </label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => updateSetting('timezone', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                        >
                          <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                          <option value="America/New_York">Nova York (UTC-5)</option>
                          <option value="Europe/London">Londres (UTC+0)</option>
                          <option value="Europe/Paris">Paris (UTC+1)</option>
                          <option value="Asia/Tokyo">Tóquio (UTC+9)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}


                {/* Tab: Privacidade */}
                {activeTab === 'privacy' && settings && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4">Privacidade</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-tarkov-light mb-2">
                          Visibilidade do Perfil
                        </label>
                        <select
                          value={settings.profile_visibility}
                          onChange={(e) => updateSetting('profile_visibility', e.target.value)}
                          className="w-full px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-lg text-tarkov-light focus:outline-none focus:border-tarkov-accent transition-all duration-300 ease-in-out hover:border-tarkov-accent/50"
                        >
                          <option value="private">Privado</option>
                          <option value="public">Público</option>
                          <option value="friends">Apenas Amigos</option>
                        </select>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-tarkov-dark/30 rounded-lg">
                          <div>
                            <h3 className="font-medium text-tarkov-light">Mostrar Atividade</h3>
                            <p className="text-sm text-tarkov-muted">Permitir que outros vejam sua atividade</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.show_activity}
                              onChange={(e) => updateSetting('show_activity', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-tarkov-dark/30 rounded-lg">
                          <div>
                            <h3 className="font-medium text-tarkov-light">Permitir Mensagens</h3>
                            <p className="text-sm text-tarkov-muted">Permitir que outros usuários enviem mensagens</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.allow_messages}
                              onChange={(e) => updateSetting('allow_messages', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-tarkov-accent"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Integrações */}
                {activeTab === 'integrations' && settings && (
                  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-tarkov-light mb-4">Integrações</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-tarkov-dark/30 rounded-lg transition-all duration-300 ease-in-out hover:bg-tarkov-dark/40 hover:scale-102">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">D</span>
                            </div>
                            <span className="font-medium text-tarkov-light">Discord</span>
                          </div>
                          <Badge variant={settings.discord_connected ? 'success' : 'secondary'}>
                            {settings.discord_connected ? 'Conectado' : 'Desconectado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-tarkov-muted mb-3">
                          Conecte sua conta Discord para sincronizar dados e receber notificações
                        </p>
                        <Button
                          variant={settings.discord_connected ? 'secondary' : 'primary'}
                          size="sm"
                          className="transition-all duration-300 ease-in-out hover:scale-105"
                        >
                          {settings.discord_connected ? 'Desconectar' : 'Conectar Discord'}
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-tarkov-dark/30 rounded-lg transition-all duration-300 ease-in-out hover:bg-tarkov-dark/40 hover:scale-102">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                          </div>
                          <span className="font-medium text-tarkov-light">Steam</span>
                        </div>
                        <p className="text-sm text-tarkov-muted mb-3">
                          Vincule seu perfil Steam para sincronizar dados do jogo
                        </p>
                        <Input
                          placeholder="URL do perfil Steam"
                          value={settings.steam_profile || ''}
                          onChange={(e) => updateSetting('steam_profile', e.target.value)}
                          className="mb-3"
                        />
                      </div>
                      
                      <div className="p-4 bg-tarkov-dark/30 rounded-lg transition-all duration-300 ease-in-out hover:bg-tarkov-dark/40 hover:scale-102">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                          </div>
                          <span className="font-medium text-tarkov-light">Twitch</span>
                        </div>
                        <p className="text-sm text-tarkov-muted mb-3">
                          Conecte sua conta Twitch para streaming e integração
                        </p>
                        <Input
                          placeholder="Nome de usuário Twitch"
                          value={settings.twitch_username || ''}
                          onChange={(e) => updateSetting('twitch_username', e.target.value)}
                          className="mb-3"
                        />
                      </div>
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
    </div>
  );
};

export default SettingsPage;