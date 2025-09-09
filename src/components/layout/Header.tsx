'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Badge, SubscriptionBadge, NotificationBadge } from '@/components/ui/Badge';
import LanguageSelector from '@/components/ui/LanguageSelector';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Star,
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isPlus, upgradeToPlus, manageSubscription } = useSubscription();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notifications] = React.useState(3); // Mock notification count

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleUpgrade = () => {
    upgradeToPlus();
  };

  const handleManageSubscription = () => {
    manageSubscription();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-tarkov-border bg-tarkov-secondary/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-tarkov-accent rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-tarkov-light hidden sm:block">
                Secret Tarkov
              </span>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <SearchInput
              placeholder="Buscar itens, armas, equipamentos..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/search')}
              className="md:hidden"
            >
              <Search className="w-5 h-5" />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Subscription Status */}
                <SubscriptionStatus showUpgradeButton={true} className="hidden sm:flex" />

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/notifications')}
                  >
                    <Bell className="w-5 h-5" />
                  </Button>
                  {notifications > 0 && (
                    <NotificationBadge count={notifications} />
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name?.split(' ')[0] || 'Usuário'}
                    </span>
                    {isPlus && (
                      <SubscriptionBadge type="PLUS" size="sm" />
                    )}
                  </Button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-2 w-64 z-20 bg-tarkov-secondary border border-tarkov-border rounded-lg shadow-xl shadow-black/20 py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-tarkov-border">
                          <div className="flex items-center gap-3">
                            {user?.image ? (
                              <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-tarkov-accent/20 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-tarkov-accent" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-tarkov-light truncate">
                                {user?.name || 'Usuário'}
                              </p>
                              <p className="text-sm text-tarkov-muted truncate">
                                {user?.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <SubscriptionBadge type={isPlus ? 'PLUS' : 'FREE'} size="sm" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-tarkov-light hover:bg-tarkov-accent/10 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Meu Perfil
                          </Link>
                          
                          <Link
                            href="/watchlists"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-tarkov-light hover:bg-tarkov-accent/10 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Star className="w-4 h-4" />
                            Listas de Observação
                          </Link>
                          
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-tarkov-light hover:bg-tarkov-accent/10 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Configurações
                          </Link>

                          {!isPlus && (
                            <>
                              <div className="border-t border-tarkov-border my-1" />
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  handleUpgrade();
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-tarkov-accent hover:bg-tarkov-accent/10 transition-colors w-full text-left"
                              >
                                <Crown className="w-4 h-4" />
                                Upgrade para Plus
                              </button>
                            </>
                          )}

                          {isPlus && (
                            <>
                              <div className="border-t border-tarkov-border my-1" />
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  handleManageSubscription();
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-tarkov-accent hover:bg-tarkov-accent/10 transition-colors w-full text-left"
                              >
                                <Settings className="w-4 h-4" />
                                Gerenciar Assinatura
                              </button>
                            </>
                          )}

                          <div className="border-t border-tarkov-border my-1" />
                          
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              handleSignOut();
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/subscription')}
                  className="hidden sm:flex items-center gap-1 text-tarkov-accent hover:text-tarkov-accent/80"
                >
                  <Crown className="w-4 h-4" />
                  PLUS
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/signin')}
                >
                  Entrar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/auth/signin')}
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
export type { HeaderProps };