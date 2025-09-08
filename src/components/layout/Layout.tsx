'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showFooter?: boolean;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showSidebar = true,
  showFooter = true,
  fullWidth = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-tarkov-dark flex flex-col">
      {/* Header */}
      <Header
        onMenuToggle={toggleSidebar}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            showSidebar && 'lg:ml-64',
            className
          )}
        >
          <div
            className={cn(
              'min-h-[calc(100vh-4rem)]',
              !fullWidth && 'container mx-auto px-4 py-6',
              fullWidth && 'w-full'
            )}
          >
            {children}
          </div>

          {/* Footer */}
          {showFooter && <Footer />}
        </main>
      </div>
      
    </div>
  );
};

// Page Layout Component (with default settings)
interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showSidebar?: boolean;
  showFooter?: boolean;
  fullWidth?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  className,
  showSidebar = true,
  showFooter = true,
  fullWidth = false,
  maxWidth = 'full',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <Layout
      showSidebar={showSidebar}
      showFooter={showFooter}
      fullWidth={fullWidth}
      className={className}
    >
      <div className={cn(
        'w-full mx-auto',
        !fullWidth && maxWidthClasses[maxWidth]
      )}>
        {/* Page Header */}
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-tarkov-light mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-tarkov-muted text-lg">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </Layout>
  );
};

// Auth Layout Component (for login/register pages)
interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <div className="min-h-screen bg-tarkov-dark flex flex-col">
      {/* Simple Header for Auth Pages */}
      <header className="border-b border-tarkov-border bg-tarkov-secondary/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-tarkov-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="font-bold text-lg text-tarkov-light">
                Secret Tarkov
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Auth Header */}
          {(title || description) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-2xl font-bold text-tarkov-light mb-2">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-tarkov-muted">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Auth Form */}
          <div className={cn(
            'bg-tarkov-secondary/80 border border-tarkov-border rounded-lg p-6 backdrop-blur-sm',
            className
          )}>
            {children}
          </div>
        </div>
      </main>

      {/* Simple Footer for Auth Pages */}
      <footer className="border-t border-tarkov-border bg-tarkov-secondary/50 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-tarkov-muted">
            © {new Date().getFullYear()} Secret Tarkov. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Error Layout Component
interface ErrorLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = false,
}) => {
  return (
    <div className="min-h-screen bg-tarkov-dark flex flex-col">
      {showHeader && (
        <header className="border-b border-tarkov-border bg-tarkov-secondary/95 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-tarkov-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <span className="font-bold text-lg text-tarkov-light">
                  Secret Tarkov
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {children}
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export { Layout, PageLayout, AuthLayout, ErrorLayout };
export type { LayoutProps, PageLayoutProps, AuthLayoutProps, ErrorLayoutProps };