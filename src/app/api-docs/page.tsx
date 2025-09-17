'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Code, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/search',
      description: 'Buscar itens do Tarkov',
      example: `curl -X GET "https://tarkovsecret.vercel.app/api/search?q=ak74"`,
      id: 'search'
    },
    {
      method: 'GET',
      path: '/api/items',
      description: 'Listar todos os itens',
      example: `curl -X GET "https://tarkovsecret.vercel.app/api/items?limit=20&offset=0"`,
      id: 'items'
    },
    {
      method: 'GET',
      path: '/api/item/[id]',
      description: 'Obter detalhes de um item específico',
      example: `curl -X GET "https://tarkovsecret.vercel.app/api/item/5c0a794586f7744c505f4163"`,
      id: 'item-detail'
    },
    {
      method: 'GET',
      path: '/api/quests',
      description: 'Listar todas as quests',
      example: `curl -X GET "https://tarkovsecret.vercel.app/api/quests"`,
      id: 'quests'
    },
    {
      method: 'GET',
      path: '/api/ammunition',
      description: 'Listar munições com dados de dano',
      example: `curl -X GET "https://tarkovsecret.vercel.app/api/ammunition"`,
      id: 'ammunition'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-tarkov-dark py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-tarkov-light mb-4">
              <Code className="inline w-10 h-10 text-tarkov-accent mr-3" />
              API Documentation
            </h1>
            <p className="text-xl text-tarkov-muted max-w-3xl mx-auto">
              Acesse programaticamente todos os dados do Secret Tarkov através da nossa API REST
            </p>
          </div>

          {/* API Status */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">
                  API Status: <Badge variant="success">Online</Badge>
                </h3>
                <p className="text-tarkov-muted">
                  Todos os endpoints estão funcionando normalmente
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-tarkov-muted">Uptime: 99.9%</p>
                <p className="text-sm text-tarkov-muted">Response Time: &lt;200ms</p>
              </div>
            </div>
          </Card>

          {/* Authentication */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-tarkov-light mb-4">Autenticação</h2>
            <p className="text-tarkov-muted mb-4">
              A API do Secret Tarkov é pública e não requer autenticação para a maioria dos endpoints.
              Para recursos premium, você precisará de uma conta Plus.
            </p>
            <div className="bg-tarkov-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-tarkov-muted mb-2">
                <strong>Rate Limits:</strong>
              </p>
              <ul className="text-sm text-tarkov-muted space-y-1">
                <li>• Usuários gratuitos: 100 requests/hora</li>
                <li>• Usuários Plus: 1000 requests/hora</li>
                <li>• Sem limite para endpoints públicos</li>
              </ul>
            </div>
          </Card>

          {/* Endpoints */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-tarkov-light mb-6">Endpoints Disponíveis</h2>
            
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant={endpoint.method === 'GET' ? 'success' : 'primary'}
                        className="font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-tarkov-accent font-mono text-lg">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-tarkov-muted">{endpoint.description}</p>
                  </div>
                </div>

                <div className="bg-tarkov-dark/50 p-4 rounded-lg relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-tarkov-muted font-medium">Exemplo de uso:</span>
                    <button
                      onClick={() => copyToClipboard(endpoint.example, endpoint.id)}
                      className="flex items-center gap-1 text-tarkov-muted hover:text-tarkov-accent transition-colors"
                    >
                      {copiedCode === endpoint.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-tarkov-light font-mono overflow-x-auto">
                    <code>{endpoint.example}</code>
                  </pre>
                </div>
              </Card>
            ))}
          </div>

          {/* Response Format */}
          <Card className="p-6 mt-8">
            <h2 className="text-2xl font-bold text-tarkov-light mb-4">Formato de Resposta</h2>
            <p className="text-tarkov-muted mb-4">
              Todas as respostas da API seguem o formato JSON padrão:
            </p>
            <div className="bg-tarkov-dark/50 p-4 rounded-lg">
              <pre className="text-sm text-tarkov-light font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    // Dados da resposta
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}`}
              </pre>
            </div>
          </Card>

          {/* Error Handling */}
          <Card className="p-6 mt-8">
            <h2 className="text-2xl font-bold text-tarkov-light mb-4">Tratamento de Erros</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">Códigos de Status HTTP</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-tarkov-secondary/30 p-3 rounded">
                    <code className="text-green-400">200</code> - Sucesso
                  </div>
                  <div className="bg-tarkov-secondary/30 p-3 rounded">
                    <code className="text-yellow-400">400</code> - Requisição inválida
                  </div>
                  <div className="bg-tarkov-secondary/30 p-3 rounded">
                    <code className="text-red-400">404</code> - Recurso não encontrado
                  </div>
                  <div className="bg-tarkov-secondary/30 p-3 rounded">
                    <code className="text-red-400">429</code> - Rate limit excedido
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-8 mt-8 text-center bg-gradient-to-r from-tarkov-accent/10 to-tarkov-secondary/10 border-tarkov-accent/20">
            <h2 className="text-2xl font-bold text-tarkov-light mb-4">
              Precisa de mais recursos?
            </h2>
            <p className="text-tarkov-muted mb-6">
              Upgrade para Secret Plus e desbloqueie APIs avançadas, webhooks e muito mais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Fazer Upgrade
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Exemplos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
