'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useTarkov } from '@/hooks/useTarkov';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAlert?: any;
}

interface AlertForm {
  itemId: string;
  itemName: string;
  alertType: 'price_drop' | 'price_rise' | 'price_range' | 'percentage_change';
  targetPrice: number;
  conditions: {
    percentage?: number;
    minPrice?: number;
    maxPrice?: number;
    timeframe?: '1h' | '6h' | '24h' | '7d';
  };
  notificationMethods: ('email' | 'push' | 'sms')[];
  expiresAt?: string;
}

const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingAlert
}) => {
  const { searchItems, items: searchResults, loading: searchLoading } = useTarkov.useItemSearch();
  
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState<AlertForm>({
    itemId: '',
    itemName: '',
    alertType: 'price_drop',
    targetPrice: 0,
    conditions: {
      timeframe: '24h'
    },
    notificationMethods: ['email']
  });

  useEffect(() => {
    if (editingAlert) {
      setForm({
        itemId: editingAlert.item_id,
        itemName: editingAlert.item?.name || '',
        alertType: editingAlert.alert_type,
        targetPrice: editingAlert.target_price,
        conditions: editingAlert.conditions || { timeframe: '24h' },
        notificationMethods: editingAlert.notification_methods || ['email'],
        expiresAt: editingAlert.expires_at
      });
      setStep(2); // Skip item selection for editing
    } else {
      // Reset form for new alert
      setForm({
        itemId: '',
        itemName: '',
        alertType: 'price_drop',
        targetPrice: 0,
        conditions: { timeframe: '24h' },
        notificationMethods: ['email']
      });
      setStep(1);
    }
  }, [editingAlert, isOpen]);

  const searchForItems = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    searchItems({ query });
  };

  const selectItem = (item: any) => {
    setForm(prev => ({
      ...prev,
      itemId: item.id,
      itemName: item.name,
      targetPrice: item.avg24hPrice || item.basePrice || 0
    }));
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const endpoint = editingAlert ? '/api/plus/price-alerts' : '/api/plus/price-alerts';
      const method = editingAlert ? 'PUT' : 'POST';
      
      const body = editingAlert 
        ? {
            alertId: editingAlert.id,
            targetPrice: form.targetPrice,
            conditions: form.conditions,
            notificationMethods: form.notificationMethods,
            expiresAt: form.expiresAt
          }
        : {
            itemId: form.itemId,
            alertType: form.alertType,
            targetPrice: form.targetPrice,
            conditions: form.conditions,
            notificationMethods: form.notificationMethods,
            expiresAt: form.expiresAt
          };
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(editingAlert ? 'Alerta atualizado com sucesso!' : 'Alerta criado com sucesso!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Erro ao salvar alerta');
      }
    } catch (error) {
      toast.error('Erro ao salvar alerta');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleNotificationMethod = (method: 'email' | 'push' | 'sms') => {
    setForm(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tarkov-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-tarkov-border">
          <h2 className="text-xl font-bold text-tarkov-light flex items-center gap-2">
            <BellIcon className="w-6 h-6 text-tarkov-gold" />
            {editingAlert ? 'Editar Alerta' : 'Criar Novo Alerta'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-tarkov-muted hover:text-tarkov-light"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Step 1: Item Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-tarkov-light mb-4">
                  Selecione o Item
                </h3>
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    searchForItems(value);
                  }}
                  placeholder="Buscar item por nome..."
                  className="mb-4"
                />
              </div>

              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loading />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectItem(item)}
                      className="flex items-center gap-3 p-3 bg-tarkov-secondary/20 hover:bg-tarkov-secondary/40 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-tarkov-secondary/30 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.iconLink ? (
                          <img
                            src={item.iconLink}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ChartBarIcon className="w-6 h-6 text-tarkov-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-tarkov-light">{item.name}</h4>
                        <p className="text-sm text-tarkov-muted">{item.shortName}</p>
                        {item.avg24hPrice && (
                          <p className="text-sm text-tarkov-gold">
                            ₽{item.avg24hPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="text-center py-8 text-tarkov-muted">
                  Nenhum item encontrado. Tente outro termo de busca.
                </div>
              )}
            </div>
          )}

          {/* Step 2: Alert Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Item */}
              {!editingAlert && (
                <div className="bg-tarkov-secondary/20 rounded-lg p-4">
                  <h4 className="font-medium text-tarkov-light mb-2">Item Selecionado</h4>
                  <p className="text-tarkov-muted">{form.itemName}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="mt-2 text-tarkov-gold hover:text-tarkov-gold/80"
                  >
                    Alterar Item
                  </Button>
                </div>
              )}

              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-3">
                  Tipo de Alerta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'price_drop', label: 'Queda de Preço', desc: 'Quando o preço cair abaixo do valor' },
                    { value: 'price_rise', label: 'Alta de Preço', desc: 'Quando o preço subir acima do valor' },
                    { value: 'price_range', label: 'Faixa de Preço', desc: 'Quando o preço estiver na faixa' },
                    { value: 'percentage_change', label: 'Mudança %', desc: 'Quando houver mudança percentual' }
                  ].map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setForm(prev => ({ ...prev, alertType: type.value as any }))}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        form.alertType === type.value
                          ? 'border-tarkov-gold bg-tarkov-gold/10'
                          : 'border-tarkov-border hover:border-tarkov-gold/50'
                      }`}
                    >
                      <h5 className="font-medium text-tarkov-light">{type.label}</h5>
                      <p className="text-xs text-tarkov-muted mt-1">{type.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  {form.alertType === 'price_range' ? 'Preço Mínimo' : 'Preço Alvo'}
                </label>
                <input
                  type="number"
                  value={form.targetPrice}
                  onChange={(e) => setForm(prev => ({ ...prev, targetPrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-tarkov-secondary/30 border border-tarkov-border rounded-lg text-tarkov-light focus:border-tarkov-gold focus:outline-none"
                  placeholder="Digite o preço..."
                />
              </div>

              {/* Additional Conditions */}
              {form.alertType === 'price_range' && (
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Preço Máximo
                  </label>
                  <input
                    type="number"
                    value={form.conditions.maxPrice || 0}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      conditions: { ...prev.conditions, maxPrice: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-tarkov-secondary/30 border border-tarkov-border rounded-lg text-tarkov-light focus:border-tarkov-gold focus:outline-none"
                    placeholder="Digite o preço máximo..."
                  />
                </div>
              )}

              {form.alertType === 'percentage_change' && (
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Mudança Percentual (%)
                  </label>
                  <input
                    type="number"
                    value={form.conditions.percentage || 0}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      conditions: { ...prev.conditions, percentage: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-tarkov-secondary/30 border border-tarkov-border rounded-lg text-tarkov-light focus:border-tarkov-gold focus:outline-none"
                    placeholder="Ex: 10 para 10% de mudança"
                  />
                </div>
              )}

              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-3">
                  Período de Monitoramento
                </label>
                <div className="flex gap-2">
                  {[
                    { value: '1h', label: '1 Hora' },
                    { value: '6h', label: '6 Horas' },
                    { value: '24h', label: '24 Horas' },
                    { value: '7d', label: '7 Dias' }
                  ].map((timeframe) => (
                    <button
                      key={timeframe.value}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, timeframe: timeframe.value as any }
                      }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.conditions.timeframe === timeframe.value
                          ? 'bg-tarkov-gold text-black'
                          : 'bg-tarkov-secondary/30 text-tarkov-light hover:bg-tarkov-secondary/50'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Methods */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-3">
                  Métodos de Notificação
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'email', label: 'Email', icon: EnvelopeIcon, desc: 'Receber por email' },
                    { value: 'push', label: 'Push', icon: DevicePhoneMobileIcon, desc: 'Notificação no navegador' },
                    { value: 'sms', label: 'SMS', icon: ChatBubbleLeftRightIcon, desc: 'Mensagem de texto (em breve)' }
                  ].map((method) => (
                    <div
                      key={method.value}
                      onClick={() => toggleNotificationMethod(method.value as any)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form.notificationMethods.includes(method.value as any)
                          ? 'border-tarkov-gold bg-tarkov-gold/10'
                          : 'border-tarkov-border hover:border-tarkov-gold/50'
                      } ${method.value === 'sms' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <method.icon className="w-5 h-5 text-tarkov-gold" />
                      <div className="flex-1">
                        <h5 className="font-medium text-tarkov-light">{method.label}</h5>
                        <p className="text-xs text-tarkov-muted">{method.desc}</p>
                      </div>
                      {form.notificationMethods.includes(method.value as any) && (
                        <div className="w-2 h-2 bg-tarkov-gold rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Data de Expiração (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-tarkov-secondary/30 border border-tarkov-border rounded-lg text-tarkov-light focus:border-tarkov-gold focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-tarkov-border">
          <div className="flex items-center gap-2">
            {step === 2 && !editingAlert && (
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-tarkov-muted hover:text-tarkov-light"
              >
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-tarkov-muted hover:text-tarkov-light"
            >
              Cancelar
            </Button>
            
            {step === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.itemId || !form.targetPrice}
                className="bg-tarkov-gold hover:bg-tarkov-gold/80 text-black font-semibold"
              >
                {submitting ? (
                  <Loading className="w-4 h-4 mr-2" />
                ) : null}
                {editingAlert ? 'Atualizar Alerta' : 'Criar Alerta'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAlertModal;