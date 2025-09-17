'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    priceAlerts: true,
    questUpdates: true,
    marketUpdates: false,
    newsUpdates: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: false,
    showStats: false,
    showInventory: false,
    showProgress: false,
  });

  const [display, setDisplay] = useState({
    theme: 'dark',
    language: 'pt',
    currency: 'USD',
    itemsPerPage: 20,
    showImages: true,
    compactMode: false,
    showTooltips: true,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-tarkov-dark py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-2">
              <User className="inline w-8 h-8 text-tarkov-accent mr-3" />
              Configurações
            </h1>
            <p className="text-tarkov-muted">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-2">
                  <a href="#profile" className="flex items-center gap-3 p-3 rounded-lg bg-tarkov-accent/10 text-tarkov-accent">
                    <User className="w-4 h-4" />
                    Perfil
                  </a>
                  <a href="#notifications" className="flex items-center gap-3 p-3 rounded-lg text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/50 transition-colors">
                    <Bell className="w-4 h-4" />
                    Notificações
                  </a>
                  <a href="#privacy" className="flex items-center gap-3 p-3 rounded-lg text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/50 transition-colors">
                    <Shield className="w-4 h-4" />
                    Privacidade
                  </a>
                  <a href="#display" className="flex items-center gap-3 p-3 rounded-lg text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/50 transition-colors">
                    <Palette className="w-4 h-4" />
                    Aparência
                  </a>
                  <a href="#api" className="flex items-center gap-3 p-3 rounded-lg text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/50 transition-colors">
                    <Globe className="w-4 h-4" />
                    API
                  </a>
                  <a href="#data" className="flex items-center gap-3 p-3 rounded-lg text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/50 transition-colors">
                    <Download className="w-4 h-4" />
                    Dados
                  </a>
                </nav>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Settings */}
              <Card className="p-6" id="profile">
                <h2 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome de usuário"
                      placeholder="Seu nome de usuário"
                      defaultValue="Jogador123"
                    />
                    <Input
                      label="Email"
                      placeholder="seu@email.com"
                      defaultValue="usuario@exemplo.com"
                      type="email"
                    />
                  </div>
                  <Input
                    label="Bio"
                    placeholder="Conte um pouco sobre você..."
                    defaultValue="Jogador de Tarkov desde 2017"
                  />
                  <div className="flex items-center gap-4">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                    <Button variant="outline">
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6" id="notifications">
                <h2 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Notificações por Email</div>
                      <div className="text-sm text-tarkov-muted">Receba atualizações importantes por email</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Notificações Push</div>
                      <div className="text-sm text-tarkov-muted">Receba notificações no navegador</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Alertas de Preço</div>
                      <div className="text-sm text-tarkov-muted">Notificações quando preços atingirem seus alvos</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.priceAlerts}
                      onChange={(e) => setNotifications({...notifications, priceAlerts: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Atualizações de Quest</div>
                      <div className="text-sm text-tarkov-muted">Notificações sobre progresso de quests</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.questUpdates}
                      onChange={(e) => setNotifications({...notifications, questUpdates: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                </div>
              </Card>

              {/* Privacy */}
              <Card className="p-6" id="privacy">
                <h2 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacidade
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Mostrar Perfil Público</div>
                      <div className="text-sm text-tarkov-muted">Permitir que outros usuários vejam seu perfil</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showProfile}
                      onChange={(e) => setPrivacy({...privacy, showProfile: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Mostrar Estatísticas</div>
                      <div className="text-sm text-tarkov-muted">Compartilhar suas estatísticas de jogo</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showStats}
                      onChange={(e) => setPrivacy({...privacy, showStats: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Mostrar Inventário</div>
                      <div className="text-sm text-tarkov-muted">Permitir visualização do seu inventário</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showInventory}
                      onChange={(e) => setPrivacy({...privacy, showInventory: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                </div>
              </Card>

              {/* Display Settings */}
              <Card className="p-6" id="display">
                <h2 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-tarkov-light mb-2">
                        Tema
                      </label>
                      <select 
                        value={display.theme}
                        onChange={(e) => setDisplay({...display, theme: e.target.value})}
                        className="w-full p-3 bg-tarkov-secondary/50 border border-tarkov-border rounded-md text-tarkov-light focus:ring-2 focus:ring-tarkov-accent focus:border-tarkov-accent"
                      >
                        <option value="dark">Escuro</option>
                        <option value="light">Claro</option>
                        <option value="auto">Automático</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-tarkov-light mb-2">
                        Idioma
                      </label>
                      <select 
                        value={display.language}
                        onChange={(e) => setDisplay({...display, language: e.target.value})}
                        className="w-full p-3 bg-tarkov-secondary/50 border border-tarkov-border rounded-md text-tarkov-light focus:ring-2 focus:ring-tarkov-accent focus:border-tarkov-accent"
                      >
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-tarkov-light font-medium">Modo Compacto</div>
                      <div className="text-sm text-tarkov-muted">Interface mais compacta para telas menores</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={display.compactMode}
                      onChange={(e) => setDisplay({...display, compactMode: e.target.checked})}
                      className="w-4 h-4 text-tarkov-accent bg-tarkov-dark border-tarkov-border rounded focus:ring-tarkov-accent"
                    />
                  </div>
                </div>
              </Card>

              {/* API Settings */}
              <Card className="p-6" id="api">
                <h2 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  API
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tarkov-light mb-2">
                      Chave da API
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="sk_live_1234567890abcdef"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline">
                        Regenerar
                      </Button>
                    </div>
                    <p className="text-xs text-tarkov-muted mt-1">
                      Use esta chave para acessar a API do Secret Tarkov
                    </p>
                  </div>
                  <div className="bg-tarkov-secondary/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-tarkov-light">Rate Limit</span>
                      <Badge variant="success">1000/hora</Badge>
                    </div>
                    <div className="text-xs text-tarkov-muted">
                      Você tem 1000 requisições por hora disponíveis
                    </div>
                  </div>
                </div>
              </Card>

              {/* Data Management */}
              <Card className="p-6" id="data">
                <h2 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Dados
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-tarkov-secondary/30 rounded-lg">
                    <div>
                      <div className="text-tarkov-light font-medium">Exportar Dados</div>
                      <div className="text-sm text-tarkov-muted">Baixe todos os seus dados em formato JSON</div>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div>
                      <div className="text-red-400 font-medium">Excluir Conta</div>
                      <div className="text-sm text-tarkov-muted">Esta ação não pode ser desfeita</div>
                    </div>
                    <Button variant="danger">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
