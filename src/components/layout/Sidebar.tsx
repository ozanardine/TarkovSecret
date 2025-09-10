'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Badge, SubscriptionBadge } from '@/components/ui/Badge';
import {
  Home,
  TrendingUp,
  Search,
  Star,
  User,
  Settings,
  Bell,
  BarChart3,
  Users,
  HelpCircle,
  LogOut,
  Crown,
  Shield,
  Zap,
  Target,
  Package,
  Lock,
  Crosshair,
  Download,
  Map,
  BookOpen,
  Ticket,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  plusOnly?: boolean;
  comingSoon?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const { isAuthenticated, hasPlus } = useAuth();

  const mainNavItems: NavItem[] = [
    {
      label: 'Início',
      href: '/',
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Buscar',
      href: '/search',
      icon: <Search className="w-5 h-5" />,
    },
    {
      label: 'Itens',
      href: '/items',
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Armas',
      href: '/weapons',
      icon: <Target className="w-5 h-5" />,
    },
    {
      label: 'Munições',
      href: '/ammunition',
      icon: <Crosshair className="w-5 h-5" />,
    },
    {
      label: 'Equipamentos',
      href: '/gear',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      label: 'Mapas',
      href: '/maps',
      icon: <Map className="w-5 h-5" />,
    },
    {
      label: 'Missões',
      href: '/quests',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: 'Esconderijo',
      href: '/hideout',
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Secret Plus',
      href: '/subscription',
      icon: <Crown className="w-5 h-5" />,
      badge: 'Premium',
    },
  ];

  const marketNavItems: NavItem[] = [
    {
      label: 'Mercado',
      href: '/market',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Preços em Alta',
      href: '/market/trending',
      icon: <Zap className="w-5 h-5" />,
      badge: 'Hot',
    },
    {
      label: 'Análise de Preços',
      href: '/market/analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      plusOnly: true,
    },
  ];

  const userNavItems: NavItem[] = [
    {
      label: 'Listas de Observação',
      href: '/watchlists',
      icon: <Star className="w-5 h-5" />,
    },
    {
      label: 'Alertas de Preço',
      href: '/alerts',
      icon: <Bell className="w-5 h-5" />,
      plusOnly: true,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      plusOnly: true,
    },
    {
          label: 'Exportar Dados',
          href: '/export',
          icon: <Download className="w-5 h-5" />,
          plusOnly: true
        },
        {
          label: 'Cupons',
          href: '/coupons',
          icon: <Ticket className="w-5 h-5" />,
          plusOnly: true
        },
    {
      label: 'Comunidade',
      href: '/community',
      icon: <Users className="w-5 h-5" />,
      comingSoon: true,
    },
  ];

  const settingsNavItems: NavItem[] = [
    {
      label: 'Configurações',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const canAccess = (item: NavItem) => {
    if (!isAuthenticated && (item.plusOnly || item.href.includes('watchlists') || item.href.includes('alerts'))) {
      return false;
    }
    if (item.plusOnly && !hasPlus) {
      return false;
    }
    return true;
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const accessible = canAccess(item);
    const disabled = item.comingSoon || !accessible;

    const content = (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          active && 'bg-tarkov-accent text-white shadow-lg shadow-tarkov-accent/25',
          !active && !disabled && 'text-tarkov-light hover:bg-tarkov-accent/10 hover:text-tarkov-accent',
          disabled && 'text-tarkov-muted cursor-not-allowed opacity-60'
        )}
      >
        <span className={cn(
          'flex-shrink-0 transition-transform duration-200',
          !disabled && 'group-hover:scale-110'
        )}>
          {item.icon}
        </span>
        
        <span className="flex-1 font-medium">
          {item.label}
        </span>
        
        <div className="flex items-center gap-1">
          {item.badge && (
            <Badge variant="primary" size="sm">
              {item.badge}
            </Badge>
          )}
          
          {item.plusOnly && (
            <Crown className="w-4 h-4 text-tarkov-accent" />
          )}
          
          {item.comingSoon && (
            <Badge variant="secondary" size="sm">
              Em breve
            </Badge>
          )}
          
          {!accessible && item.plusOnly && (
            <Lock className="w-4 h-4" />
          )}
        </div>
      </div>
    );

    if (disabled) {
      return (
        <div key={item.href} className="relative">
          {content}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className="block"
      >
        {content}
      </Link>
    );
  };

  const renderNavSection = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <h3 className="px-3 text-xs font-semibold text-tarkov-muted uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map(renderNavItem)}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          'bg-tarkov-secondary/95 backdrop-blur-md border-r border-tarkov-border',
          'overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tarkov-border',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 space-y-6">
          {/* Subscription Status */}
          {isAuthenticated && (
            <div className="bg-tarkov-accent/10 border border-tarkov-accent/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-tarkov-light">
                  Plano Atual
                </span>
                <SubscriptionBadge type={hasPlus ? 'PLUS' : 'FREE'} size="sm" />
              </div>
              
              {!hasPlus && (
                <div className="space-y-2">
                  <p className="text-xs text-tarkov-muted">
                    Upgrade para Plus e desbloqueie recursos exclusivos!
                  </p>
                  <Link
                    href="/subscription"
                    className="inline-flex items-center gap-1 text-xs text-tarkov-accent hover:text-tarkov-accent/80 transition-colors"
                    onClick={onClose}
                  >
                    <Crown className="w-3 h-3" />
                    Fazer upgrade
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Navigation Sections */}
          {renderNavSection('Principal', mainNavItems)}
          {renderNavSection('Mercado', marketNavItems)}
          
          {isAuthenticated && (
            <>
              {renderNavSection('Pessoal', userNavItems)}
              {renderNavSection('Configurações', settingsNavItems)}
            </>
          )}

          {/* Plus Features Teaser for Free Users */}
          {isAuthenticated && !hasPlus && (
            <div className="bg-gradient-to-br from-tarkov-accent/20 to-purple-500/20 border border-tarkov-accent/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-tarkov-accent" />
                <span className="font-semibold text-tarkov-light">Secret Plus</span>
              </div>
              
              <ul className="text-xs text-tarkov-muted space-y-1 mb-3">
                <li>• Alertas de preço em tempo real</li>
                <li>• Análise avançada de mercado</li>
                <li>• Histórico de preços detalhado</li>
                <li>• Suporte prioritário</li>
              </ul>
              
              <Link
                href="/subscription"
                className="inline-flex items-center gap-1 text-xs bg-tarkov-accent text-white px-3 py-1.5 rounded-md hover:bg-tarkov-accent/90 transition-colors"
                onClick={onClose}
              >
                <Crown className="w-3 h-3" />
                Upgrade agora
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
export type { SidebarProps };