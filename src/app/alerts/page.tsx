'use client';

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import CreateAlertModal from '@/components/alerts/CreateAlertModal';
import {
  BellIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface PriceAlert {
  id: string;
  item_id: string;
  alert_type: 'price_drop' | 'price_rise' | 'price_range' | 'percentage_change';
  target_price: number;
  current_price: number;
  conditions: {
    percentage?: number;
    minPrice?: number;
    maxPrice?: number;
    timeframe?: '1h' | '6h' | '24h' | '7d';
  };
  notification_methods: ('email' | 'push' | 'sms')[];
  is_active: boolean;
  expires_at?: string;
  last_triggered?: string;
  created_at: string;
  item?: {
    id: string;
    name: string;
    shortName: string;
    iconLink?: string;
    avg_24h_price?: number;
  };
  priceChange?: number;
}

const PriceAlertsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscription, isPlus } = useSubscription();
  const router = useRouter();
  
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  


  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/subscription');
      return;
    }
    
    if (!isPlus) {
      router.push('/subscription');
      return;
    }
    
    fetchAlerts();
  }, [isAuthenticated, isPlus, router]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plus/price-alerts');
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.data);
      } else {
        toast.error(data.error || 'Erro ao carregar alertas');
      }
    } catch (error) {
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertCreated = () => {
    fetchAlerts();
    setShowCreateModal(false);
    setEditingAlert(null);
  };

  const handleEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setShowCreateModal(true);
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/plus/price-alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alertId,
          isActive: !isActive
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(isActive ? 'Alerta desativado' : 'Alerta ativado');
        fetchAlerts();
      } else {
        toast.error(data.error || 'Erro ao atualizar alerta');
      }
    } catch (error) {
      toast.error('Erro ao atualizar alerta');
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/plus/price-alerts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alertId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Alerta removido com sucesso!');
        fetchAlerts();
      } else {
        toast.error(data.error || 'Erro ao remover alerta');
      }
    } catch (error) {
      toast.error('Erro ao remover alerta');
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_drop': return 'Queda de Preço';
      case 'price_rise': return 'Alta de Preço';
      case 'price_range': return 'Faixa de Preço';
      case 'percentage_change': return 'Mudança Percentual';
      default: return type;
    }
  };

  const getAlertStatusColor = (alert: PriceAlert) => {
    if (!alert.is_active) return 'text-gray-400';
    if (alert.last_triggered) return 'text-tarkov-gold';
    return 'text-green-400';
  };

  const getAlertStatusIcon = (alert: PriceAlert) => {
    if (!alert.is_active) return <EyeSlashIcon className="w-5 h-5" />;
    if (alert.last_triggered) return <CheckCircleIcon className="w-5 h-5" />;
    return <EyeIcon className="w-5 h-5" />;
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!searchQuery) return true;
    return alert.item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           alert.item?.shortName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isAuthenticated || !isPlus) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-tarkov-light flex items-center gap-3">
                <BellSolid className="w-8 h-8 text-tarkov-gold" />
                Alertas de Preço Avançados
              </h1>
              <p className="text-tarkov-muted mt-2">
                Configure alertas personalizados e seja notificado sobre mudanças de preço em tempo real
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingAlert(null);
                setShowCreateModal(true);
              }}
              className="bg-tarkov-gold hover:bg-tarkov-gold/80 text-black font-semibold"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Novo Alerta
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-tarkov-card p-6">
            <div className="flex items-center">
              <BellIcon className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-tarkov-muted">Total de Alertas</p>
                <p className="text-2xl font-bold text-tarkov-light">{alerts.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-tarkov-card p-6">
            <div className="flex items-center">
              <EyeIcon className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-sm text-tarkov-muted">Ativos</p>
                <p className="text-2xl font-bold text-tarkov-light">
                  {alerts.filter(a => a.is_active).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-tarkov-card p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-tarkov-gold mr-3" />
              <div>
                <p className="text-sm text-tarkov-muted">Disparados</p>
                <p className="text-2xl font-bold text-tarkov-light">
                  {alerts.filter(a => a.last_triggered).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-tarkov-card p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-orange-400 mr-3" />
              <div>
                <p className="text-sm text-tarkov-muted">Pendentes</p>
                <p className="text-2xl font-bold text-tarkov-light">
                  {alerts.filter(a => a.is_active && !a.last_triggered).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar alertas por nome do item..."
            className="max-w-md"
          />
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card className="bg-tarkov-card p-12 text-center">
            <BellIcon className="w-16 h-16 text-tarkov-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-tarkov-light mb-2">
              {searchQuery ? 'Nenhum alerta encontrado' : 'Nenhum alerta configurado'}
            </h3>
            <p className="text-tarkov-muted mb-6">
              {searchQuery 
                ? 'Tente ajustar sua busca ou criar um novo alerta'
                : 'Configure seu primeiro alerta de preço para começar a monitorar o mercado'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setEditingAlert(null);
                  setShowCreateModal(true);
                }}
                className="bg-tarkov-gold hover:bg-tarkov-gold/80 text-black font-semibold"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Criar Primeiro Alerta
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="bg-tarkov-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-tarkov-secondary/30 rounded-lg flex items-center justify-center overflow-hidden">
                      {alert.item?.iconLink ? (
                        <img
                          src={alert.item.iconLink}
                          alt={alert.item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ChartBarIcon className="w-8 h-8 text-tarkov-muted" />
                      )}
                    </div>
                    
                    {/* Alert Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-tarkov-light">
                          {alert.item?.name || 'Item não encontrado'}
                        </h3>
                        <Badge variant="secondary">
                          {getAlertTypeLabel(alert.alert_type)}
                        </Badge>
                        <div className={`flex items-center gap-1 ${getAlertStatusColor(alert)}`}>
                          {getAlertStatusIcon(alert)}
                          <span className="text-sm font-medium">
                            {alert.is_active ? (alert.last_triggered ? 'Disparado' : 'Ativo') : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-tarkov-muted">
                        <span>Preço Alvo: ₽{alert.target_price.toLocaleString()}</span>
                        {alert.item?.avg_24h_price && (
                          <span>Preço Atual: ₽{alert.item.avg_24h_price.toLocaleString()}</span>
                        )}
                        {alert.priceChange !== undefined && (
                          <span className={alert.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {alert.priceChange >= 0 ? '+' : ''}{alert.priceChange.toFixed(1)}%
                          </span>
                        )}
                        <span>Criado: {new Date(alert.created_at).toLocaleDateString()}</span>
                        {alert.last_triggered && (
                          <span className="text-tarkov-gold">
                            Último disparo: {new Date(alert.last_triggered).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Notification Methods */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-tarkov-muted">Notificações:</span>
                        {alert.notification_methods.map((method) => (
                          <Badge key={method} variant="secondary" className="text-xs">
                            {method === 'email' ? 'Email' : method === 'push' ? 'Push' : 'SMS'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAlert(alert.id, alert.is_active)}
                      className={alert.is_active ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}
                    >
                      {alert.is_active ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAlert(alert)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este alerta?')) {
                          deleteAlert(alert.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Criação/Edição de Alerta */}
        <CreateAlertModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAlert(null);
          }}
          onSuccess={handleAlertCreated}
          editingAlert={editingAlert}
        />
      </div>
    </PageLayout>
  );
};

export default PriceAlertsPage;