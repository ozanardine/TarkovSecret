'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  Ticket,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expires_at: string | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  is_active: boolean;
  created_at: string;
  usage_stats: {
    total_uses: number;
    user_uses: number;
    remaining_uses: number | null;
    user_remaining_uses: number | null;
    last_used_at: string | null;
  };
}

interface CouponsData {
  coupons: Coupon[];
  meta: {
    total: number;
    available: number;
    used: number;
  };
}

export default function CouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPlus, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [couponsData, setCouponsData] = useState<CouponsData | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'all'>('available');
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading' || subscriptionLoading) return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCoupons();
  }, [session, status, subscriptionLoading, router, activeTab]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plus/coupons?type=${activeTab}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar cupons');
      }

      setCouponsData({
        coupons: result.data,
        meta: result.meta
      });
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    setValidatingCoupon(true);
    setValidationResult(null);
    setError(null);

    try {
      const response = await fetch('/api/plus/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          action: 'validate'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na validação');
      }

      setValidationResult(result.data);
      toast.success('Cupom válido!');
    } catch (error) {
      console.error('Erro na validação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro na validação';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const applyCoupon = async () => {
    if (!validationResult) {
      toast.error('Valide o cupom primeiro');
      return;
    }

    setApplyingCoupon(true);

    try {
      const response = await fetch('/api/plus/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          action: 'apply'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao aplicar cupom');
      }

      // Redirect to checkout with coupon applied
      if (result.data.checkout_url) {
        window.location.href = result.data.checkout_url;
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao aplicar cupom';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado!');
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `R$ ${coupon.discount_value.toFixed(2)} OFF`;
    }
  };

  const getDiscountIcon = (coupon: Coupon) => {
    return coupon.discount_type === 'percentage' ? Percent : DollarSign;
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at) < new Date();
  };

  const isUsable = (coupon: Coupon) => {
    return !isExpired(coupon) && 
           (coupon.usage_stats.user_remaining_uses === null || coupon.usage_stats.user_remaining_uses > 0);
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-tarkov-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tarkov-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tarkov-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-8 h-8 text-tarkov-accent" />
            <h1 className="text-3xl font-bold text-tarkov-light">Cupons de Desconto</h1>
            <Badge className="bg-tarkov-accent/20 text-tarkov-accent border-tarkov-accent/30">
              <Sparkles className="w-4 h-4 mr-1" />
              Promoções
            </Badge>
          </div>
          <p className="text-tarkov-muted max-w-2xl">
            Aproveite cupons de desconto exclusivos para sua assinatura PLUS. 
            Economize em renovações e upgrades!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Apply Coupon Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-tarkov-accent" />
                Aplicar Cupom
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Código do Cupom
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite o código do cupom"
                      className="flex-1 px-3 py-2 bg-tarkov-dark border border-tarkov-border rounded-md text-tarkov-light placeholder-tarkov-muted focus:outline-none focus:ring-2 focus:ring-tarkov-accent"
                      disabled={validatingCoupon || applyingCoupon}
                    />
                    <Button
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || validatingCoupon || applyingCoupon}
                      variant="outline"
                    >
                      {validatingCoupon ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tarkov-accent" />
                      ) : (
                        'Validar'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-green-400 mb-1">
                          {validationResult.coupon.name}
                        </h3>
                        <p className="text-sm text-tarkov-muted mb-2">
                          {validationResult.coupon.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-400 font-medium">
                            Desconto: {formatDiscount(validationResult.coupon)}
                          </span>
                          {validationResult.coupon.expires_at && (
                            <span className="text-tarkov-muted">
                              Expira: {new Date(validationResult.coupon.expires_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={applyCoupon}
                        disabled={applyingCoupon}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {applyingCoupon ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Aplicando...
                          </>
                        ) : (
                          <>
                            Aplicar Cupom
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-1 bg-tarkov-dark p-1 rounded-lg">
              {[
                { id: 'available', label: 'Disponíveis', count: couponsData?.meta.available || 0 },
                { id: 'used', label: 'Utilizados', count: couponsData?.meta.used || 0 },
                { id: 'all', label: 'Todos', count: couponsData?.meta.total || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-tarkov-accent text-white'
                      : 'text-tarkov-muted hover:text-tarkov-light'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
              {couponsData?.coupons.length === 0 ? (
                <Card className="p-8 text-center">
                  <Ticket className="w-12 h-12 text-tarkov-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-tarkov-light mb-2">
                    Nenhum cupom encontrado
                  </h3>
                  <p className="text-tarkov-muted">
                    {activeTab === 'available' 
                      ? 'Você não possui cupons disponíveis no momento.'
                      : activeTab === 'used'
                      ? 'Você ainda não utilizou nenhum cupom.'
                      : 'Nenhum cupom encontrado.'}
                  </p>
                </Card>
              ) : (
                couponsData?.coupons.map((coupon) => {
                  const DiscountIcon = getDiscountIcon(coupon);
                  const expired = isExpired(coupon);
                  const usable = isUsable(coupon);
                  
                  return (
                    <Card key={coupon.id} className={`p-6 ${expired ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              usable ? 'bg-tarkov-accent/20' : 'bg-gray-500/20'
                            }`}>
                              <DiscountIcon className={`w-5 h-5 ${
                                usable ? 'text-tarkov-accent' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-tarkov-light">{coupon.name}</h3>
                              <p className="text-sm text-tarkov-muted">{coupon.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <Badge className={`${
                              usable 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {formatDiscount(coupon)}
                            </Badge>
                            
                            {coupon.expires_at && (
                              <div className="flex items-center gap-1 text-sm text-tarkov-muted">
                                <Calendar className="w-4 h-4" />
                                Expira: {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            
                            {expired && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                <XCircle className="w-4 h-4 mr-1" />
                                Expirado
                              </Badge>
                            )}
                            
                            {coupon.usage_stats.user_uses > 0 && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Utilizado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-tarkov-muted">
                            <span>Usos: {coupon.usage_stats.user_uses}/{coupon.max_uses_per_user || '∞'}</span>
                            {coupon.usage_stats.last_used_at && (
                              <span>
                                Último uso: {new Date(coupon.usage_stats.last_used_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            {coupon.code}
                          </Button>
                          
                          {usable && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setCouponCode(coupon.code);
                                setValidationResult(null);
                              }}
                            >
                              Usar Cupom
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-tarkov-light mb-4">Estatísticas</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-tarkov-muted">Total de cupons:</span>
                  <span className="text-tarkov-light font-medium">{couponsData?.meta.total || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-tarkov-muted">Disponíveis:</span>
                  <span className="text-green-400 font-medium">{couponsData?.meta.available || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-tarkov-muted">Utilizados:</span>
                  <span className="text-blue-400 font-medium">{couponsData?.meta.used || 0}</span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-tarkov-light mb-4">Dicas</h3>
              
              <div className="space-y-3 text-sm text-tarkov-muted">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-tarkov-accent mt-0.5 flex-shrink-0" />
                  <span>Cupons podem ter limite de uso por usuário</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-tarkov-accent mt-0.5 flex-shrink-0" />
                  <span>Verifique sempre a data de expiração</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-tarkov-accent mt-0.5 flex-shrink-0" />
                  <span>Alguns cupons são exclusivos para novos usuários</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}