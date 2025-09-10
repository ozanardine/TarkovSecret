import React from 'react';
// import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
// import { AdSpace } from '@/components/ui/AdSpace';
import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  FireIcon, 
  StarIcon, 
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Search } from 'lucide-react';
import { 
  ArrowTrendingUpIcon as TrendingUpSolid,
  FireIcon as FireSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';

const HomePage: React.FC = () => {

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
    <div className="min-h-screen bg-tarkov-dark">
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
            <Link href="/search">
              <div className="relative cursor-pointer">
                <Input
                  placeholder="Buscar itens, armas, equipamentos..."
                  className="w-full h-12 text-lg"
                  leftIcon={<Search className="w-4 h-4" />}
                  readOnly
                />
                <div className="absolute inset-0 bg-transparent"></div>
              </div>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="px-8"
              >
                Começar Agora
              </Button>
            </Link>
            <Link href="/subscription">
              <Button
                variant="outline"
                size="lg"
                className="px-8"
              >
                Ver Recursos
              </Button>
            </Link>
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

      {/* Ad Banner - Top */}
      <section className="py-8">
        <Card className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-tarkov-accent/10 to-tarkov-secondary/10 border-tarkov-accent/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-tarkov-light mb-2">
              Upgrade para Secret Plus
            </h3>
            <p className="text-tarkov-muted mb-4">
              Remova anúncios e desbloqueie recursos exclusivos
            </p>
            <Link href="/subscription">
              <Button className="bg-tarkov-accent hover:bg-tarkov-accent/90">
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* PLUS User Dashboard Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
            <StarIcon className="inline w-8 h-8 text-tarkov-accent mr-2" />
            Painel PLUS
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
            <Link href="/api-docs">
              <Button
                size="sm"
                className="w-full bg-tarkov-accent/20 hover:bg-tarkov-accent/30 text-tarkov-accent border-tarkov-accent/30"
              >
                Documentação
              </Button>
            </Link>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tarkov-light">Analytics</h3>
              <ChartBarIcon className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-tarkov-muted text-sm mb-4">
              Métricas detalhadas de uso e tendências de mercado
            </p>
            <Link href="/analytics">
              <Button
                size="sm"
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
              >
                Ver Analytics
              </Button>
            </Link>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tarkov-light">Exportar Dados</h3>
              <ShoppingBagIcon className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-tarkov-muted text-sm mb-4">
              Exporte seus dados em múltiplos formatos
            </p>
            <Link href="/export">
              <Button
                size="sm"
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              >
                Exportar
              </Button>
            </Link>
          </Card>
        </div>
      </section>

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
            return (
              <Card 
                key={index} 
                className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-tarkov-light">
                    {feature.title}
                  </h3>
                  {feature.plus && (
                    <Badge 
                      variant="secondary" 
                      size="sm"
                    >
                      Plus
                    </Badge>
                  )}
                </div>
                <p className="text-tarkov-muted text-sm">
                  {feature.description}
                </p>
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
          <Link href="/items">
            <Button variant="outline">
              Ver Todos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens populares serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens populares serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens populares serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens populares serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
        </div>

        {/* Ad Card - Between Popular and Trending */}
        <div className="mt-12">
          <Card className="max-w-md mx-auto p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-tarkov-light mb-2">
                Oferta Especial - Secret Plus
              </h3>
              <p className="text-tarkov-muted mb-4 text-sm">
                Aproveite nossa oferta limitada e remova todos os anúncios
              </p>
              <Link href="/subscription">
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500">
                  Ver Oferta
                </Button>
              </Link>
            </div>
          </Card>
        </div>
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
          <Link href="/items">
            <Button variant="outline">
              Ver Todos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens em alta serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens em alta serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens em alta serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-tarkov-muted">
              <p>Itens em alta serão exibidos aqui</p>
              <p className="text-sm mt-2">Em breve...</p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-tarkov-accent/10 to-tarkov-secondary/20 border-tarkov-accent/20">
          <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
            Pronto para dominar Tarkov?
          </h2>
          <p className="text-lg text-tarkov-muted mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que já estão usando o Secret Tarkov para maximizar seus lucros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="px-8"
              >
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/subscription">
              <Button
                variant="outline"
                size="lg"
                className="px-8"
              >
                Ver Planos
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;