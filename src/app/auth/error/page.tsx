'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Há um problema com a configuração do servidor.';
      case 'AccessDenied':
        return 'Acesso negado. Você não tem permissão para fazer login.';
      case 'Verification':
        return 'O token de verificação expirou ou já foi usado.';
      case 'Default':
      default:
        return 'Ocorreu um erro inesperado durante o login.';
    }
  };

  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Entre em contato com o suporte técnico para resolver este problema.';
      case 'AccessDenied':
        return 'Verifique se você tem permissão para acessar esta aplicação.';
      case 'Verification':
        return 'Tente fazer login novamente ou solicite um novo link de verificação.';
      case 'Default':
      default:
        return 'Tente novamente em alguns minutos. Se o problema persistir, entre em contato com o suporte.';
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
              <AlertCircleIcon className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-tarkov-light">
              Erro de Autenticação
            </h2>
            <p className="mt-2 text-sm text-tarkov-muted">
              Não foi possível completar o login
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">
                  {getErrorMessage(error)}
                </h3>
                <p className="text-sm text-tarkov-muted">
                  {getErrorDescription(error)}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="w-full"
                >
                  Tentar novamente
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Voltar ao início
                </Button>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <p className="text-xs text-tarkov-muted">
              Precisa de ajuda?{' '}
              <a 
                href="mailto:suporte@tarkovsecret.com" 
                className="text-tarkov-accent hover:underline"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
