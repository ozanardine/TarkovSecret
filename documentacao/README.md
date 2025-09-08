# Documentação Secret Tarkov

Este diretório contém toda a documentação do projeto Secret Tarkov, organizada por módulos para facilitar a navegação e manutenção.

## Estrutura de Módulos

### 📦 Sistema de Itens (`sistema-items/`)
Documentação completa do sistema de itens, incluindo páginas de listagem, detalhes, APIs e implementação técnica.

### 🔌 APIs (`apis/`)
Documentação de todas as APIs do sistema, endpoints, tipos TypeScript e integrações.

### ⚡ Funcionalidades (`funcionalidades/`)
Documentação de funcionalidades especiais como busca por imagem e recursos avançados.

### 🏗️ Arquitetura (`arquitetura/`)
Documentação da arquitetura geral do sistema, padrões de design e decisões técnicas.

## Navegação Rápida

### 🔍 Por Funcionalidade

#### Sistema de Traders (Novo 2024)
- [API de Traders](./apis/apis-endpoints.md#api-de-traders-tarkovdev)
- [Integração nos Componentes](./sistema-items/implementacao-tecnica-items.md#sistema-de-traders)
- [Tipos de Trader](./apis/tipos-typescript.md#tipos-de-traders)
- [Cache de Traders](./apis/apis-endpoints.md#cache-strategy)

#### Números Romanos (Novo 2024)
- [Utilitário de Conversão](./apis/apis-endpoints.md#roman-numerals-utility)
- [Implementação](./sistema-items/implementacao-tecnica-items.md#sistema-de-números-romanos)
- [Uso nos Componentes](./apis/apis-endpoints.md#integração-nos-componentes)
- [Tipos e Funções](./apis/tipos-typescript.md#números-romanos)

#### Busca e Pesquisa
- [Sistema de Busca por Imagem](./funcionalidades/busca-por-imagem.md#algoritmos-de-busca)
- [API de Busca](./apis/apis-endpoints.md#1-search-api)
- [Cache de Busca](./arquitetura/arquitetura-sistema.md#5-sistema-de-cache)
- [Tipos de Busca](./apis/tipos-typescript.md#tipos-de-busca-por-imagem)

#### Processamento de Imagem
- [Algoritmos de Processamento](./busca-por-imagem.md#processamento-de-imagem)
- [Detecção de Regiões](./busca-por-imagem.md#detecção-de-regiões)
- [Extração de Características](./busca-por-imagem.md#extração-de-características)
- [Tipos de Processamento](./tipos-typescript.md#advanced-image-processing-types)

#### Autenticação e Usuários
- [Sistema de Autenticação](./arquitetura-sistema.md#1-sistema-de-autenticação)
- [API de Usuário](./apis-endpoints.md#3-user-api)
- [Tipos de Usuário](./tipos-typescript.md#supabase-types)
- [Fluxo de Autenticação](./arquitetura-sistema.md#3-autenticação)

#### Performance e Cache
- [Estratégias de Cache](./arquitetura-sistema.md#2-cache-strategies)
- [Otimizações](./arquitetura-sistema.md#performance-e-otimizações)
- [Tipos de Cache](./tipos-typescript.md#cache-types)
- [Monitoramento](./apis-endpoints.md#monitoring-e-observabilidade)

### 🛠️ Por Tecnologia

#### Frontend (React/Next.js)
- [Componentes](./arquitetura-sistema.md#componentes-principais)
- [Hooks Customizados](./arquitetura-sistema.md#1-custom-hooks)
- [Props de Componentes](./tipos-typescript.md#component-props-types)
- [Estado Global](./tipos-typescript.md#state-management-types)

#### Backend (API Routes)
- [Estrutura de APIs](./apis-endpoints.md#apis-internas-nextjs-api-routes)
- [Autenticação](./apis-endpoints.md#autenticação-e-autorização)
- [Rate Limiting](./apis-endpoints.md#rate-limiting)
- [Webhooks](./apis-endpoints.md#webhooks)

#### Banco de Dados (Supabase)
- [Estrutura de Dados](./tipos-typescript.md#supabase-types)
- [Operações](./apis-endpoints.md#database-operations)
- [Autenticação](./apis-endpoints.md#authentication)

#### APIs Externas
- [Tarkov.dev GraphQL](./apis-endpoints.md#1-tarkovdev-graphql-api)
- [Queries Principais](./apis-endpoints.md#queries-principais)
- [Rate Limits](./apis-endpoints.md#rate-limits)

## Guias de Desenvolvimento

### 🚀 Início Rápido

1. **Configuração do Ambiente**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. **Estrutura de Arquivos**
   ```
   src/
   ├── app/          # Next.js App Router
   ├── components/   # Componentes React
   ├── hooks/        # Custom Hooks
   ├── lib/          # Bibliotecas e utilitários
   ├── types/        # Tipos TypeScript
   └── documentacao/ # Esta documentação
   ```

3. **Comandos Principais**
   ```bash
   npm run dev      # Desenvolvimento
   npm run build    # Build de produção
   npm run test     # Executar testes
   npm run lint     # Verificar código
   ```

### 📝 Padrões de Código

#### Nomenclatura
- **Componentes**: PascalCase (`ImageSelector`)
- **Hooks**: camelCase com prefixo `use` (`useImageSearch`)
- **Tipos**: PascalCase (`ImageSearchResult`)
- **Arquivos**: kebab-case (`image-search.ts`)

#### Estrutura de Componentes
```typescript
// Imports
import React from 'react';
import { ComponentProps } from './types';

// Tipos
interface Props {
  // props aqui
}

// Componente
export function Component({ prop }: Props) {
  // lógica aqui
  
  return (
    // JSX aqui
  );
}

// Export default
export default Component;
```

#### Estrutura de Hooks
```typescript
// Imports
import { useState, useEffect } from 'react';
import { HookTypes } from './types';

// Tipos
interface UseHookReturn {
  // return types aqui
}

// Hook
export function useHook(): UseHookReturn {
  // lógica aqui
  
  return {
    // valores de retorno
  };
}
```

### 🧪 Testes

#### Estrutura de Testes
```typescript
// __tests__/component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### Tipos de Teste
- **Unit Tests**: Componentes e funções isoladas
- **Integration Tests**: Fluxos completos
- **E2E Tests**: Jornadas do usuário

### 🔧 Debugging

#### Logs de Desenvolvimento
```typescript
// Use console.log apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Para logs estruturados
import { logger } from '@/lib/logger';
logger.info('Operation completed', { userId, operation });
```

#### Ferramentas de Debug
- **React DevTools**: Inspeção de componentes
- **Network Tab**: Análise de requisições
- **Performance Tab**: Análise de performance
- **Console**: Logs e erros

## Fluxos Principais

### 🔍 Fluxo de Busca por Imagem

1. **Upload de Imagem**
   - Usuário seleciona arquivo
   - Validação de formato e tamanho
   - Conversão para base64

2. **Processamento**
   - Redimensionamento da imagem
   - Detecção de regiões de interesse
   - Extração de características

3. **Busca e Correspondência**
   - Comparação com base de dados
   - Cálculo de similaridade
   - Ranking de resultados

4. **Apresentação de Resultados**
   - Formatação dos dados
   - Aplicação de filtros
   - Exibição na interface

### 🔐 Fluxo de Autenticação

1. **Login**
   - Validação de credenciais
   - Geração de JWT token
   - Armazenamento seguro

2. **Autorização**
   - Verificação de token
   - Validação de permissões
   - Controle de acesso

3. **Refresh**
   - Renovação automática
   - Manutenção de sessão
   - Logout em caso de erro

## Troubleshooting

### ❌ Problemas Comuns

#### Erro de Compilação TypeScript
```bash
# Verificar tipos
npm run type-check

# Limpar cache
rm -rf .next
npm run dev
```

#### Problemas de Performance
```typescript
// Verificar re-renders desnecessários
import { memo } from 'react';
export default memo(Component);

// Otimizar queries
const { data } = useQuery(key, fetcher, {
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

#### Erros de API
```typescript
// Verificar rate limits
if (error.status === 429) {
  // Implementar retry com backoff
}

// Verificar autenticação
if (error.status === 401) {
  // Renovar token ou redirecionar para login
}
```

### 🔍 Debug de Busca por Imagem

#### Problemas de Processamento
```typescript
// Verificar formato da imagem
if (!['image/jpeg', 'image/png'].includes(file.type)) {
  throw new Error('Formato não suportado');
}

// Verificar tamanho
if (file.size > 10 * 1024 * 1024) {
  throw new Error('Arquivo muito grande');
}
```

#### Baixa Precisão nos Resultados
```typescript
// Ajustar parâmetros
const params = {
  minConfidence: 0.7, // Aumentar para mais precisão
  maxResults: 5,      // Reduzir para melhores matches
  enableRegionDetection: true, // Melhorar detecção
};
```

## Contribuição

### 📋 Checklist para Pull Requests

- [ ] Código segue padrões estabelecidos
- [ ] Tipos TypeScript estão corretos
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Performance foi considerada
- [ ] Segurança foi verificada

### 📝 Atualizando Documentação

Quando adicionar novas funcionalidades:

1. **Atualizar tipos** em `tipos-typescript.md`
2. **Documentar APIs** em `apis-endpoints.md`
3. **Explicar arquitetura** em `arquitetura-sistema.md`
4. **Detalhar funcionalidade** em documento específico
5. **Atualizar este README** com links relevantes

## Recursos Adicionais

### 📚 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tarkov.dev API](https://api.tarkov.dev)

### 🛠️ Ferramentas de Desenvolvimento

- **VS Code Extensions**:
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag

- **Chrome Extensions**:
  - React Developer Tools
  - Redux DevTools
  - Lighthouse

### 📊 Monitoramento

- **Performance**: Web Vitals, Lighthouse
- **Errors**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel
- **Uptime**: Pingdom, UptimeRobot

## 📋 Changelog

### 2024-01-22 - Sistema de Traders e Números Romanos

#### ✨ Novas Funcionalidades

**Sistema de Traders**
- Implementada API para buscar imagens dos traders da Tarkov.dev
- Adicionados campos `imageLink` e `image4xLink` à interface `Trader`
- Integração nos componentes `ItemTraders`, `ItemQuests` e `ItemBarters`
- Cache otimizado para dados de traders (24h de duração)
- Fallback gracioso para traders sem imagem disponível

**Números Romanos**
- Criado utilitário `roman-numerals.ts` para conversão de números (1-10)
- Função `toRomanNumeral()` para converter números para algarismos romanos
- Função `fromRomanNumeral()` para conversão reversa
- Integração automática em níveis de loyalty, player level e requisitos

#### 🔧 Melhorias Técnicas

**Performance**
- Carregamento concorrente de dados usando `Promise.all`
- Otimização de consultas da API com cache inteligente
- Redução de re-renders desnecessários nos componentes

**UX/UI**
- Consistência visual em todas as seções de traders
- Autenticidade com números romanos como no jogo original
- Estados de loading melhorados
- Fallbacks robustos para dados indisponíveis

#### 📁 Arquivos Modificados

- `src/types/tarkov.ts` - Adicionados tipos de Trader
- `src/lib/tarkov-api.ts` - Nova função `getTraders()`
- `src/lib/utils/roman-numerals.ts` - Novo utilitário criado
- `src/components/item/ItemTraders.tsx` - Integração completa
- `src/components/item/ItemQuests.tsx` - Integração completa
- `src/components/item/ItemBarters.tsx` - Integração completa

#### 📚 Documentação Atualizada

- `documentacao/apis/tipos-typescript.md` - Novos tipos documentados
- `documentacao/apis/apis-endpoints.md` - API de traders e utilitários
- `documentacao/sistema-items/implementacao-tecnica-items.md` - Implementação detalhada
- `documentacao/README.md` - Navegação atualizada

## Contato e Suporte

Para dúvidas sobre a documentação ou implementação:

1. **Issues**: Criar issue no repositório
2. **Discussions**: Usar GitHub Discussions
3. **Code Review**: Solicitar review em PRs
4. **Documentation**: Atualizar esta documentação

---

**Última atualização**: Janeiro 2024
**Versão da documentação**: 1.0.0
**Compatível com**: Secret Tarkov v1.0.0+