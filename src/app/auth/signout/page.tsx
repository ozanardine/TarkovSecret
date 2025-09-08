'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Fazer logout automaticamente
    const handleSignOut = async () => {
      await signOut({
        redirect: false,
        callbackUrl: '/'
      });
      
      // Redirecionar para a página inicial após logout
      router.push('/');
    };

    handleSignOut();
  }, [router]);

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-tarkov-light">
              Saindo da sua conta
            </h2>
            <p className="mt-2 text-sm text-tarkov-muted">
              Você está sendo desconectado...
            </p>
          </div>

          <Card className="p-8">
            <div className="text-center space-y-4">
              <Loading size="lg" />
              <p className="text-tarkov-muted">
                Aguarde enquanto processamos seu logout
              </p>
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
