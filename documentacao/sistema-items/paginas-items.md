# Documentação - Páginas de Itens

## Visão Geral

Este documento descreve a implementação e funcionalidades das páginas relacionadas aos itens do Escape from Tarkov no projeto Secret Tarkov.

## Páginas Implementadas

### 1. Página de Listagem de Itens (`/items`)
**Arquivo:** `src/app/items/page.tsx`

#### Funcionalidades Principais

##### Sistema de Filtros
- **Busca por texto**: Pesquisa no nome e nome curto dos itens
- **Filtro por categoria**: 17 categorias disponíveis (Weapon, Ammo, Armor, etc.)
- **Filtro por faixa de preço**: Range de 0 a 1.000.000 rublos
- **Ordenação**: Por nome, preço ou data de atualização (ascendente/descendente)

##### Interface de Usuário
- **Modos de visualização**: Grid (padrão) e Lista
- **Paginação**: 24 itens por página
- **Filtros expansíveis**: Panel lateral com todos os controles de filtro
- **Navegação**: Botões de página anterior/próxima

##### Estados e Gerenciamento
```typescript
interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  sortBy: 'name' | 'price' | 'updated';
  sortOrder: 'asc' | 'desc';
}
```

##### Categorias Disponíveis
- All (padrão)
- Weapon
- Ammo
- Armor
- Backpack
- Barter
- Container
- Glasses
- Grenade
- Headphones
- Helmet
- Key
- Medical
- Mods
- Provisions
- Rig
- Suppressor

##### Performance
- **Memoização**: Uso de `useMemo` para filtros e ordenação
- **Reset automático**: Página volta para 1 quando filtros mudam
- **Lazy loading**: Carregamento sob demanda dos dados

### 2. Página de Detalhes do Item (`/item/[id]`)
**Arquivo:** `src/app/item/[id]/page.tsx`

#### Funcionalidades Principais

##### Informações Básicas
- **Imagem do item**: Exibição da imagem oficial
- **Nome e nome curto**: Títulos principais
- **Preços**: Preço base e preço médio 24h
- **Raridade**: Badge com cor correspondente
- **Especificações**: Peso, tamanho (largura x altura)
- **Descrição completa**: Texto descritivo do item

##### Sistema de Abas
1. **Visão Geral** (padrão)
   - Descrição detalhada
   - Tipos/categorias do item
   - Links externos (Wiki)

2. **Quests**
   - Lista de missões que utilizam o item
   - Informações do trader e nível mínimo
   - Requisitos e recompensas

3. **Hideout**
   - Receitas de craft que utilizam o item
   - Estações necessárias
   - Materiais requeridos

4. **Trocas**
   - Trocas com traders
   - Itens necessários para troca
   - Valores e quantidades

##### Funcionalidades Interativas
- **Favoritos**: Adicionar/remover dos favoritos (requer autenticação)
- **Compartilhamento**: Botão para compartilhar via Web Share API ou clipboard
- **Navegação**: Botão voltar para página anterior

##### Hooks Utilizados
- `useTarkov.useItem(itemId)`: Dados básicos do item
- `useItemUsage(itemId)`: Informações de uso em quests
- `useItemCrafts(itemId)`: Receitas de craft
- `useItemBarters(itemId)`: Informações de trocas
- `useTarkov.useFavorites()`: Gerenciamento de favoritos

## Componentes Reutilizáveis

### ItemCard
**Localização:** `@/components/ui/Card`
- Exibe informações resumidas do item
- Suporte para modo grid e lista
- Click handler para navegação

### Badges
**Localização:** `@/components/ui/Badge`
- `ItemTypeBadge`: Exibe tipo de item com cores do Tarkov
- `PriceChangeBadge`: Mostra variação de preço
- `Badge`: Badge genérico para categorias

### Loading
**Localização:** `@/components/ui/Loading`
- Estados de carregamento
- Diferentes tamanhos (sm, md, lg)

## Estados de Carregamento e Erro

### Página de Listagem
- **Loading**: Spinner centralizado durante carregamento inicial
- **Erro**: Mensagem de erro com opção de retry
- **Vazio**: Mensagem quando nenhum item corresponde aos filtros

### Página de Detalhes
- **Loading**: Spinner centralizado para item e dados de uso
- **Item não encontrado**: Página 404 customizada com navegação
- **Erro de dados**: Fallback gracioso para seções com erro

## Navegação e Roteamento

### Fluxo de Navegação
1. **Home** → **Items** (via menu ou busca)
2. **Items** → **Item Detail** (click no card)
3. **Item Detail** → **Items** (botão voltar)
4. **Search** → **Items** (com filtros pré-aplicados)

### URLs e Parâmetros
- `/items`: Página de listagem
- `/item/[id]`: Página de detalhes (id = identificador único do item)

## Integração com APIs

### Endpoints Utilizados
- **GET /api/items**: Lista todos os itens
- **GET /api/items/[id]**: Detalhes de um item específico
- **GET /api/items/[id]/usage**: Uso do item em quests
- **GET /api/items/[id]/crafts**: Receitas de craft
- **GET /api/items/[id]/barters**: Informações de trocas

### Tratamento de Dados
- **Cache**: Implementado via React Query/SWR
- **Fallbacks**: Valores padrão para dados ausentes
- **Validação**: TypeScript para tipagem forte

## Responsividade

### Breakpoints
- **Mobile**: Layout em coluna única
- **Tablet**: Grid 2 colunas para items
- **Desktop**: Grid 3-4 colunas, layout em duas colunas para detalhes

### Adaptações Mobile
- Filtros em modal/drawer
- Navegação touch-friendly
- Imagens otimizadas
- Texto legível em telas pequenas

## Acessibilidade

### Implementações
- **Navegação por teclado**: Todos os elementos interativos
- **ARIA labels**: Botões e controles
- **Contraste**: Cores seguem WCAG 2.1
- **Screen readers**: Estrutura semântica adequada

## Performance

### Otimizações
- **Lazy loading**: Imagens carregadas sob demanda
- **Memoização**: Cálculos pesados em useMemo
- **Paginação**: Evita carregar todos os itens de uma vez
- **Debounce**: Busca com delay para evitar requests excessivos

### Métricas
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1

## Testes

### Cenários de Teste
1. **Filtros funcionam corretamente**
2. **Paginação navega entre páginas**
3. **Detalhes do item carregam dados corretos**
4. **Favoritos são salvos/removidos**
5. **Compartilhamento funciona**
6. **Estados de erro são tratados**

## Melhorias Futuras

### Funcionalidades Planejadas
- **Comparação de itens**: Side-by-side comparison
- **Histórico de preços**: Gráficos de variação
- **Filtros avançados**: Por stats específicos
- **Wishlist**: Lista de desejos
- **Notificações**: Alertas de preço

### Otimizações
- **Virtual scrolling**: Para listas muito grandes
- **Service worker**: Cache offline
- **Image optimization**: WebP/AVIF
- **Bundle splitting**: Carregamento incremental