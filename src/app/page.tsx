'use client';

import React from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, ItemCard } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading, Skeleton } from '@/components/ui/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTarkov } from '@/hooks/useTarkov';
import { useRouter } from 'next/navigation';
import SubscriptionNotifications from '@/components/subscription/SubscriptionNotifications';
import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  FireIcon, 
  StarIcon, 
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowTrendingUpIcon as TrendingUpSolid,
  FireIcon as FireSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isPlus, isTrial, trialDaysRemaining, isTrialExpiringSoon } = useSubscription();
  const router = useRouter();
  
  const { 
    items: popularItems, 
    loading: popularLoading 
  } = useTarkov.usePopularItems();
  
  const { 
    items: trendingItems, 
    loading: trendingLoading 
  } = useTarkov.useTrendingItems();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const features = [
    {
      icon: ChartBarIcon,
      iconSolid: ChartBarIcon,
      title: 'Análise de Preços',
      description: 'Acompanhe preços em tempo real do mercado de pulgas e traders',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: StarIcon,
      iconSolid: StarSolid,
      title: 'Listas de Favoritos',
      description: 'Organize seus itens favoritos e acompanhe mudanças',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: BoltIcon,
      iconSolid: BoltIcon,
      title: 'Alertas de Preço',
      description: 'Receba notificações quando preços atingirem seus alvos',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      plus: true,
    },
    {
      icon: ChartBarIcon,
      iconSolid: ChartBarIcon,
      title: 'Analytics Avançado',
      description: 'Métricas detalhadas de uso e tendências de mercado',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      plus: true,
    },
    {
      icon: UserGroupIcon,
      iconSolid: UserGroupIcon,
      title: 'Comunidade',
      description: 'Conecte-se com outros jogadores e compartilhe estratégias',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  const stats = [
    {
      label: 'Itens Catalogados',
      value: '2,500+',
      icon: ShoppingBagIcon,
      color: 'text-blue-400',
    },
    {
      label: 'Usuários Ativos',
      value: '15,000+',
      icon: UserGroupIcon,
      color: 'text-green-400',
    },
    {
      label: 'Atualizações Diárias',
      value: '50,000+',
      icon: TrendingUpIcon,
      color: 'text-purple-400',
    },
    {
      label: 'Alertas Enviados',
      value: '100,000+',
      icon: BoltIcon,
      color: 'text-yellow-400',
    },
  ];

  return (
    <PageLayout showFooter={true}>
      {/* Subscription Notifications */}
      {user && <SubscriptionNotifications />}
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-tarkov-accent/20 via-transparent to-tarkov-secondary/20 rounded-3xl" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-tarkov-light mb-6">
            Secret <span className="text-tarkov-accent">Tarkov</span>
          </h1>
          <p className="text-xl md:text-2xl text-tarkov-muted mb-8 max-w-2xl mx-auto">
            Sua ferramenta definitiva para dominar o mercado de Escape from Tarkov
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchInput
              placeholder="Buscar itens, armas, equipamentos..."
              onSearch={handleSearch}
              className="w-full h-12 text-lg"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push('/auth/signin')}
                  className="px-8"
                >
                  Começar Agora
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/features')}
                  className="px-8"
                >
                  Ver Recursos
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                  className="px-8"
                >
                  Ir para Dashboard
                </Button>
                {!isPlus && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/upgrade')}
                    className="px-8 border-tarkov-accent text-tarkov-accent hover:bg-tarkov-accent hover:text-white"
                  >
                    Upgrade para Plus
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-tarkov-secondary/50 mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-tarkov-light mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-tarkov-muted">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PLUS User Dashboard Section */}
      {isPlus && (
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
              <StarIcon className="inline w-8 h-8 text-tarkov-accent mr-2" />
              Painel PLUS
              {isTrial && (
                <Badge className="ml-3 bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Teste - {trialDaysRemaining} dias restantes
                </Badge>
              )}
            </h2>
            <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
              Acesso exclusivo aos recursos premium do Secret Tarkov
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-tarkov-accent/10 to-transparent border-tarkov-accent/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-tarkov-light">API Personalizada</h3>
                <BoltIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <p className="text-tarkov-muted text-sm mb-4">
                Acesso à API avançada sem limitações de rate limit
              </p>
              <Button
                size="sm"
                onClick={() => router.push('/api-docs')}
                className="w-full bg-tarkov-accent/20 hover:bg-tarkov-accent/30 text-tarkov-accent border-tarkov-accent/30"
              >
                Documentação
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-tarkov-light">Analytics</h3>
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-tarkov-muted text-sm mb-4">
                Métricas detalhadas de uso e tendências de mercado
              </p>
              <Button
                size="sm"
                onClick={() => router.push('/analytics')}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
              >
                Ver Analytics
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-tarkov-light">Exportar Dados</h3>
                <ShoppingBagIcon className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-tarkov-muted text-sm mb-4">
                Exporte seus dados em múltiplos formatos
              </p>
              <Button
                size="sm"
                onClick={() => router.push('/export')}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              >
                Exportar
              </Button>
            </Card>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
            Recursos Poderosos
          </h2>
          <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
            Ferramentas profissionais para maximizar seus lucros e otimizar seu gameplay
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLocked = feature.plus && !isPlus;
            return (
              <Card 
                key={index} 
                className={`p-6 hover:scale-105 transition-transform duration-200 ${
                  isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (isLocked) {
                    router.push('/subscription');
                  }
                }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4 relative`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <StarIcon className="w-4 h-4 text-tarkov-accent" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-tarkov-light">
                    {feature.title}
                  </h3>
                  {feature.plus && (
                    <Badge 
                      variant={isPlus ? "primary" : "secondary"} 
                      size="sm"
                      className={isLocked ? 'opacity-60' : ''}
                    >
                      Plus
                    </Badge>
                  )}
                </div>
                <p className="text-tarkov-muted text-sm">
                  {feature.description}
                </p>
                {isLocked && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-tarkov-muted">
                      Clique para fazer upgrade
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-tarkov-light mb-2">
              <FireSolid className="inline w-8 h-8 text-orange-500 mr-2" />
              Itens Populares
            </h2>
            <p className="text-tarkov-muted">
              Os itens mais procurados da comunidade
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/items/popular')}
          >
            Ver Todos
          </Button>
        </div>

        {popularLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems?.slice(0, 8).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onItemClick={() => router.push(`/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trending Items Section */}
      <section className="py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-tarkov-light mb-2">
              <TrendingUpSolid className="inline w-8 h-8 text-green-500 mr-2" />
              Em Alta
            </h2>
            <p className="text-tarkov-muted">
              Itens com maior variação de preço nas últimas 24h
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/items/trending')}
          >
            Ver Todos
          </Button>
        </div>

        {trendingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingItems?.slice(0, 8).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onItemClick={() => router.push(`/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-tarkov-accent/10 to-tarkov-secondary/20 border-tarkov-accent/20">
          {!user ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
                Pronto para dominar Tarkov?
              </h2>
              <p className="text-lg text-tarkov-muted mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de jogadores que já estão usando o Secret Tarkov para maximizar seus lucros
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/auth/signin')}
                  className="px-8"
                >
                  Criar Conta Grátis
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/pricing')}
                  className="px-8"
                >
                  Ver Planos
                </Button>
              </div>
            </>
          ) : !isPlus ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
                Desbloqueie Todo o Potencial
              </h2>
              <p className="text-lg text-tarkov-muted mb-6 max-w-2xl mx-auto">
                Upgrade para PLUS e tenha acesso a recursos exclusivos, API personalizada e analytics avançados
              </p>
              <div className="bg-tarkov-secondary/30 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-tarkov-light mb-2">
                  🎯 Teste Grátis de 7 Dias
                </h3>
                <p className="text-tarkov-muted text-sm">
                  Experimente todos os recursos PLUS sem compromisso
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push('/subscription')}
                className="px-8 bg-tarkov-accent hover:bg-tarkov-accent/90"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                Começar Teste Grátis
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
                <StarIcon className="inline w-8 h-8 text-tarkov-accent mr-2" />
                Bem-vindo ao PLUS!
                {isTrial && (
                  <Badge className="ml-3 bg-orange-500/20 text-orange-400 border-orange-500/30">
                    Teste Ativo
                  </Badge>
                )}
              </h2>
              <p className="text-lg text-tarkov-muted mb-8 max-w-2xl mx-auto">
                {isTrial ? (
                  `Você está aproveitando o teste gratuito! ${trialDaysRemaining} dias restantes para explorar todos os recursos premium.`
                ) : (
                  'Aproveite todos os recursos premium e maximize seus lucros em Tarkov!'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                  className="px-8"
                >
                  Acessar Dashboard
                </Button>
                {isTrial && isTrialExpiringSoon && (
                  <Button
                    size="lg"
                    onClick={() => router.push('/subscription')}
                    className="px-8 bg-tarkov-accent hover:bg-tarkov-accent/90"
                  >
                    Configurar Pagamento
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </section>
    </PageLayout>
  );
};

export default HomePage;