# 📋 Documentação Completa - Página de Ammunition

## 🎯 Visão Geral

A página de ammunition (`/ammunition`) é uma das funcionalidades mais avançadas do Secret Tarkov, oferecendo uma interface completa para visualização, filtragem, comparação e análise detalhada de munições do jogo Escape from Tarkov.

## 🏗️ Arquitetura da Página

### Estrutura de Arquivos
```
src/app/ammunition/
└── page.tsx                    # Página principal

src/components/ammunition/
├── AdvancedAmmoFilters.tsx     # Sistema de filtros avançados
├── AmmoTable.tsx               # Tabela de munições
├── AmmoComparison.tsx          # Modal de comparação
├── AmmoQuickPreview.tsx        # Preview rápido
└── ModernAmmoCard.tsx          # Cards modernos

src/hooks/
└── useAmmunition.ts            # Hook para dados de munição
```

### Componentes Principais

#### 1. **AmmunitionPage** (`page.tsx`)
- **Responsabilidade**: Componente principal que orquestra toda a funcionalidade
- **Estados Gerenciados**:
  - `displayedAmmo`: Controle de paginação infinita
  - `quickPreviewAmmo`: Munição selecionada para preview
  - `comparisonAmmo`: Array de munições para comparação
  - `showComparison`: Estado do modal de comparação
  - `favorites`: Lista de munições favoritas
  - `filters`: Estado completo dos filtros
  - `viewMode`: Modo de visualização (table/grid)

#### 2. **AdvancedAmmoFilters** (`AdvancedAmmoFilters.tsx`)
- **Responsabilidade**: Sistema completo de filtros e ordenação
- **Funcionalidades**:
  - Busca por texto (nome, nome curto, calibre, tipo)
  - Filtros por calibre, tipo de munição, trader
  - Ranges de dano, penetração e preço
  - Filtro de tracer (sim/não/todos)
  - Ordenação por múltiplos critérios
  - Interface expansível/colapsável

## 🔧 Funcionalidades Detalhadas

### 1. Sistema de Filtros Avançados

#### Interface de Filtros
```typescript
interface AdvancedAmmoFiltersState {
  search: string;                    // Busca por texto
  caliber: string[];                 // Filtro por calibres
  damageRange: [number, number];     // Range de dano (0-200)
  penetrationRange: [number, number]; // Range de penetração (0-100)
  priceRange: [number, number];      // Range de preço (0-50000)
  trader: string[];                  // Filtro por traders
  ammoType: string[];               // Tipo de munição
  tracer: 'all' | 'tracer' | 'no-tracer'; // Filtro tracer
  sortBy: string;                   // Critério de ordenação
  sortOrder: 'asc' | 'desc';        // Ordem de classificação
}
```

#### Critérios de Ordenação Disponíveis
- **name**: Nome da munição
- **damage**: Dano base
- **penetration**: Poder de penetração
- **armorDamage**: Dano à armadura
- **fragmentation**: Chance de fragmentação
- **accuracy**: Modificador de precisão
- **recoil**: Modificador de recuo
- **velocity**: Velocidade inicial
- **price**: Preço (menor preço entre traders)
- **efficiency**: Eficiência dano/preço

### 2. Modos de Visualização

#### Modo Tabela (`table`)
- **Características**:
  - Visualização compacta e informativa
  - Colunas organizadas por propriedades
  - Ordenação clicável nos cabeçalhos
  - Ações rápidas (preview, comparação, favoritos)

#### Modo Grid (`grid`)
- **Características**:
  - Cards visuais modernos
  - Melhor para navegação visual
  - Hover effects e animações
  - Layout responsivo

### 3. Sistema de Comparação

#### Funcionalidades da Comparação
- **Seleção Múltipla**: Até 4 munições simultaneamente
- **4 Views Especializadas**:
  1. **🔥 DANO**: Análise de dano por parte do corpo
  2. **🛡️ PENETRAÇÃO**: Classificação por classes de armadura
  3. **⚗️ BALÍSTICA**: Propriedades balísticas e modificadores
  4. **💰 ECONOMIA**: Análise de custo-benefício

#### Visualização Corporal
- **Silhueta Anatômica**: Baseada no jogo original
- **Interatividade**: Hover states e tooltips
- **Cálculos Dinâmicos**: Dano efetivo por zona corporal
- **Gradientes Realísticos**: Sombras e profundidade

### 4. Preview Rápido

#### Características
- **Modal Não-Intrusivo**: Overlay com informações essenciais
- **Dados Principais**: Estatísticas, preços, traders
- **Ações Rápidas**: Adicionar à comparação, favoritar
- **Performance**: Carregamento instantâneo

## 🎨 Design System

### Paleta de Cores Temática
- **Laranja Papaia**: `#ff6b35` (accent principal)
- **Gradientes Tarkov**: Tons escuros com destaques
- **Estados Visuais**: Verde=bom, Vermelho=ruim, Azul=neutro
- **Transparências**: Consistentes (10%, 20%, 30%)

### Componentes Visuais
- **Cards Premium**: Gradientes, bordas arredondadas, sombras
- **Badges Informativos**: Status, categorias, preços
- **Hover Effects**: Transformações suaves (300ms)
- **Loading States**: Skeletons e spinners temáticos

## 🚀 Performance e Otimizações

### Técnicas Implementadas

#### 1. Memoização Inteligente
```typescript
// Filtros disponíveis memoizados
const availableCalibers = useMemo(() => {
  const calibers = ammunition.map(ammo => ammo.caliber)
    .filter((caliber): caliber is string => Boolean(caliber));
  return Array.from(new Set(calibers)).sort();
}, [ammunition]);

// Munições filtradas com debounce implícito
const filteredAmmo = useMemo(() => {
  // Lógica de filtro complexa
  return filtered;
}, [ammunition, filters]);
```

#### 2. Scroll Infinito
- **Hook Customizado**: `useInfiniteScroll`
- **Carregamento Progressivo**: 24 itens por vez
- **Performance**: Evita renderização de milhares de itens

#### 3. Debounce de Filtros
- **Indicador Visual**: Estado de filtragem ativa
- **Timeout Inteligente**: 100ms para feedback visual
- **UX Melhorada**: Feedback imediato ao usuário

## 🔌 Integração com API

### Hook useAmmunition
```typescript
export function useAmmunition() {
  const [ammunition, setAmmunition] = useState<Ammo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch automático na montagem
  // Função de refetch disponível
  // Tratamento de erros robusto
  
  return { ammunition, loading, error, refetch };
}
```

### Fonte de Dados
- **API**: TarkovDev GraphQL API
- **Cache**: Implementado no nível da API
- **Fallback**: Tratamento de erros gracioso
- **Retry**: Função de refetch disponível

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px - Layout vertical, filtros colapsados
- **Tablet**: 768px - 1024px - Layout híbrido
- **Desktop**: > 1024px - Layout completo

### Adaptações Mobile
- **Filtros**: Panel deslizante
- **Tabela**: Scroll horizontal
- **Cards**: Stack vertical
- **Comparação**: Layout adaptativo

## 🎯 Casos de Uso Principais

### 1. Pesquisa de Munição Específica
- **Cenário**: Jogador procura munição para calibre específico
- **Fluxo**: Filtro por calibre → Ordenação por dano → Comparação

### 2. Análise de Custo-Benefício
- **Cenário**: Otimização de loadout por orçamento
- **Fluxo**: Filtro por preço → Ordenação por eficiência → Preview

### 3. Comparação Detalhada
- **Cenário**: Escolha entre munições similares
- **Fluxo**: Seleção múltipla → Modal de comparação → Análise por views

### 4. Descoberta de Munições
- **Cenário**: Exploração de opções disponíveis
- **Fluxo**: Navegação por grid → Preview rápido → Favoritos

## 🔧 Manutenção e Extensibilidade

### Pontos de Extensão
- **Novos Filtros**: Interface `AdvancedAmmoFiltersState`
- **Novos Critérios de Ordenação**: Enum `sortBy`
- **Novas Views de Comparação**: Componente `AmmoComparison`
- **Novos Modos de Visualização**: Estado `viewMode`

### Boas Práticas Implementadas
- **Separação de Responsabilidades**: Cada componente tem função específica
- **Tipagem Forte**: TypeScript em todos os componentes
- **Error Boundaries**: Tratamento de erros em cada nível
- **Performance First**: Memoização e otimizações por padrão

## 🎉 Conclusão

A página de ammunition representa o estado da arte em interfaces para jogos, combinando funcionalidade avançada com design moderno e performance otimizada. É um exemplo de como criar experiências de usuário ricas e intuitivas para dados complexos.