# Implementação Técnica - Sistema de Itens

## Arquitetura de Componentes

### Estrutura de Arquivos
```
src/app/
├── items/
│   └── page.tsx          # Página de listagem
└── item/
    └── [id]/
        └── page.tsx       # Página de detalhes

src/components/ui/
├── Card.tsx               # ItemCard component
├── Badge.tsx              # Badges de raridade e preço
├── Button.tsx             # Botões interativos
├── Input.tsx              # Campos de busca
└── Loading.tsx            # Estados de carregamento

src/hooks/
├── useTarkov.ts           # Hook principal da API
├── useItemUsage.ts        # Hook para uso em quests
├── useItemCrafts.ts       # Hook para receitas
└── useItemBarters.ts      # Hook para trocas
```

## Hooks Customizados

### useTarkov
**Arquivo:** `src/hooks/useTarkov.ts`

```typescript
export const useTarkov = {
  useAllItems: () => {
    // Retorna todos os itens com cache
    return { items: TarkovItem[], loading: boolean, error: Error | null }
  },
  
  useItem: (itemId: string) => {
    // Retorna item específico
    return { item: TarkovItem | null, loading: boolean, error: Error | null }
  },
  
  useFavorites: () => {
    // Gerencia favoritos do usuário
    return {
      favorites: TarkovItem[],
      addToFavorites: (item: TarkovItem) => void,
      removeFromFavorites: (itemId: string) => void
    }
  }
}
```

### useItemUsage
**Arquivo:** `src/hooks/useItemUsage.ts`

```typescript
interface ItemUsage {
  quests: TarkovQuest[];
  hideoutStations: HideoutStation[];
  crafts: Craft[];
}

export function useItemUsage(itemId: string) {
  return {
    itemUsage: ItemUsage | null,
    loading: boolean,
    error: Error | null
  }
}
```

### useItemCrafts
**Arquivo:** `src/hooks/useItemCrafts.ts`

```typescript
interface Craft {
  id: string;
  station: HideoutStation;
  requiredItems: RequiredItem[];
  rewardItems: RewardItem[];
  duration: number;
}

export function useItemCrafts(itemId: string) {
  return {
    crafts: Craft[],
    loading: boolean,
    error: Error | null
  }
}
```

### useItemBarters
**Arquivo:** `src/hooks/useItemBarters.ts`

```typescript
interface Barter {
  id: string;
  trader: Trader;
  requiredItems: RequiredItem[];
  rewardItems: RewardItem[];
  level: number;
}

export function useItemBarters(itemId: string) {
  return {
    barters: Barter[],
    loading: boolean,
    error: Error | null
  }
}
```

## Tipos TypeScript

### TarkovItem
**Arquivo:** `src/types/tarkov.ts`

```typescript
export interface TarkovItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  weight: number;
  width: number;
  height: number;
  basePrice: number;
  avg24hPrice?: number;
  lastLowPrice?: number;
  changeLast48h?: number;
  changeLast48hPercent?: number;
  updated: string;
  types: string[];
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  image?: string;
  gridImageLink?: string;
  iconLink?: string;
  inspectImageLink?: string;
  wikiLink?: string;
  link?: string;
}
```

### TarkovQuest
```typescript
export interface TarkovQuest {
  id: string;
  name: string;
  description: string;
  trader: {
    id: string;
    name: string;
  };
  minPlayerLevel: number;
  requirements: string[];
  rewards: string[];
  objectives: QuestObjective[];
}
```

### HideoutStation
```typescript
export interface HideoutStation {
  id: string;
  name: string;
  level: number;
  crafts: Craft[];
}
```

## Componentes UI

### ItemCard
**Arquivo:** `src/components/ui/Card.tsx`

```typescript
interface ItemCardProps {
  item: TarkovItem;
  onClick?: (itemId: string) => void;
  viewMode?: 'grid' | 'list';
  showPrice?: boolean;
  showRarity?: boolean;
}

export function ItemCard({ 
  item, 
  onClick, 
  viewMode = 'grid',
  showPrice = true,
  showRarity = true 
}: ItemCardProps) {
  // Implementação do card responsivo
}
```

### ItemTypeBadge
**Arquivo:** `src/components/ui/Badge.tsx`

```typescript
interface ItemTypeBadgeProps {
  itemType: string;
  size?: 'sm' | 'md' | 'lg';
}

const typeColors = {
  'Weapon': 'bg-red-500',
  'Armor': 'bg-blue-500',
  'Ammo': 'bg-yellow-500',
  'Medical': 'bg-green-500',
  'Food': 'bg-orange-500',
  'Key': 'bg-purple-500',
  'Container': 'bg-gray-500'
};

export function ItemTypeBadge({ itemType, size = 'md' }: ItemTypeBadgeProps) {
  // Implementação do badge com cores específicas do Tarkov
}
```

### PriceChangeBadge
```typescript
interface PriceChangeBadgeProps {
  change: number;
  changePercent: number;
}

export function PriceChangeBadge({ change, changePercent }: PriceChangeBadgeProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <Badge 
      variant={isPositive ? 'success' : isNegative ? 'destructive' : 'secondary'}
    >
      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
    </Badge>
  );
}
```

## Gerenciamento de Estado

### Estado Local (useState)
```typescript
// Página de listagem
const [currentPage, setCurrentPage] = useState(1);
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState<FilterState>({
  search: '',
  category: 'All',
  priceRange: [0, 1000000],
  sortBy: 'name',
  sortOrder: 'asc',
});

// Página de detalhes
const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'hideout' | 'trades'>('overview');
const [priceHistory, setPriceHistory] = useState<any[]>([]);
```

### Memoização (useMemo)
```typescript
// Filtros e ordenação otimizados
const filteredItems = useMemo(() => {
  let filtered = items.filter(item => {
    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!item.name.toLowerCase().includes(searchLower) &&
          !item.shortName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtro de categoria
    if (filters.category !== 'All') {
      const categoryLower = filters.category.toLowerCase();
      if (!item.types.some(type => type.toLowerCase().includes(categoryLower))) {
        return false;
      }
    }

    // Filtro de preço
    const price = item.avg24hPrice || item.basePrice || 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    return true;
  });

  // Ordenação
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (filters.sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.avg24hPrice || a.basePrice || 0;
        bValue = b.avg24hPrice || b.basePrice || 0;
        break;
      case 'updated':
        aValue = new Date(a.updated || 0).getTime();
        bValue = new Date(b.updated || 0).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
}, [items, filters]);
```

## Tratamento de Erros

### Error Boundaries
```typescript
// Componente de erro para itens não encontrados
if (!item) {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ExclamationTriangleIcon className="w-16 h-16 text-tarkov-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Item não encontrado</h2>
          <p className="text-tarkov-text-secondary mb-6">
            O item solicitado não foi encontrado ou não existe.
          </p>
          <Button onClick={() => router.push('/search')}>
            Voltar à Busca
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
```

### Fallbacks Gracioso
```typescript
// Fallback para dados ausentes
{itemUsage?.quests && itemUsage.quests.length > 0 ? (
  itemUsage.quests.map((quest) => (
    <QuestCard key={quest.id} quest={quest} />
  ))
) : (
  <div className="text-center py-8 text-tarkov-text-secondary">
    Este item não é usado em nenhuma quest conhecida.
  </div>
)}
```

## Otimizações de Performance

### Lazy Loading de Imagens
```typescript
<img 
  src={item.gridImageLink || item.iconLink} 
  alt={item.name}
  loading="lazy"
  className="w-full h-32 object-contain"
  onError={(e) => {
    e.currentTarget.src = '/placeholder-item.png';
  }}
/>
```

### Debounce para Busca
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  updateFilter('search', debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### Paginação Eficiente
```typescript
// Calcular apenas os itens da página atual
const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
```

## Integração com APIs

### Cache Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Error Handling
```typescript
const { data: items, loading, error } = useQuery({
  queryKey: ['items'],
  queryFn: fetchAllItems,
  onError: (error) => {
    console.error('Erro ao carregar itens:', error);
    toast.error('Falha ao carregar itens. Tente novamente.');
  },
});
```

## Testes Unitários

### Exemplo de Teste para ItemCard
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '@/components/ui/Card';
import { mockTarkovItem } from '@/test/mocks';

describe('ItemCard', () => {
  it('should render item information correctly', () => {
    const mockOnClick = jest.fn();
    
    render(
      <ItemCard 
        item={mockTarkovItem} 
        onClick={mockOnClick} 
      />
    );
    
    expect(screen.getByText(mockTarkovItem.name)).toBeInTheDocument();
    expect(screen.getByText(mockTarkovItem.shortName)).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    
    render(
      <ItemCard 
        item={mockTarkovItem} 
        onClick={mockOnClick} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockTarkovItem.id);
  });
});
```

## Configuração de Build

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['assets.tarkov.dev'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### Bundle Analysis
```bash
# Analisar tamanho do bundle
npm run build
npm run analyze
```

## Monitoramento

### Performance Metrics
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Enviar métricas para serviço de analytics
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Novas Funcionalidades (2024)

### Sistema de Traders

#### API de Traders
**Arquivo:** `src/lib/tarkov-api.ts`

```typescript
// Função para buscar dados dos traders da API Tarkov.dev
export async function getTraders(): Promise<Trader[]> {
  const cacheKey = 'traders';
  const cached = await getCachedData<Trader[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  const query = `
    query {
      traders {
        id
        name
        imageLink
      }
    }
  `;

  const response = await fetch(TARKOV_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  await setCachedData(cacheKey, data.data.traders, CACHE_DURATION.LONG);
  
  return data.data.traders;
}
```

#### Integração nos Componentes

Os componentes `ItemTraders`, `ItemQuests` e `ItemBarters` foram atualizados para:

1. **Buscar imagens dinamicamente da API**:
```typescript
// Busca trader na lista de traders da API
const trader = traders.find(t => t.name === barter.trader?.name);
const traderImage = trader?.imageLink || trader?.image4xLink;
```

2. **Usar estado para gerenciar dados dos traders**:
```typescript
const [traders, setTraders] = useState<Trader[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [tradersData, otherData] = await Promise.all([
        tarkovApi.getTraders(),
        // outras chamadas de API
      ]);
      setTraders(tradersData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Sistema de Números Romanos

#### Utilitário de Conversão
**Arquivo:** `src/lib/utils/roman-numerals.ts`

```typescript
// Mapeamento de números para algarismos romanos (1-10)
const romanNumerals: { [key: number]: string } = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
};

/**
 * Converte um número (1-10) para algarismo romano
 */
export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 10 || !Number.isInteger(num)) {
    throw new Error('Número deve ser um inteiro entre 1 e 10');
  }
  return romanNumerals[num];
}

/**
 * Converte um algarismo romano para número
 */
export function fromRomanNumeral(roman: string): number | null {
  const reverseMap = Object.fromEntries(
    Object.entries(romanNumerals).map(([num, rom]) => [rom, parseInt(num)])
  );
  return reverseMap[roman.toUpperCase()] || null;
}
```

#### Uso nos Componentes

```typescript
import { toRomanNumeral } from '@/lib/utils/roman-numerals';

// Conversão de níveis de loyalty/trader
<Badge variant="outline">Nível {toRomanNumeral(barter.level)}</Badge>

// Conversão de níveis de player em quests
<span>Nível mínimo: {toRomanNumeral(quest.minPlayerLevel)}</span>

// Conversão de requisitos de trader
{requirement.type === 'loyaltyLevel' && (
  <span>Loyalty {toRomanNumeral(requirement.value)}</span>
)}
```

### Melhorias de Performance

#### Carregamento Concorrente
```typescript
// Uso de Promise.all para carregar dados simultaneamente
const fetchData = async () => {
  const [questsData, tradersData] = await Promise.all([
    tarkovApi.getQuestsForItem(itemId),
    tarkovApi.getTraders()
  ]);
  setQuests(questsData);
  setTraders(tradersData);
};
```

#### Cache Otimizado
- Traders são carregados uma vez e reutilizados em todos os componentes
- Cache de longa duração para dados de traders (raramente mudam)
- Fallback gracioso para imagens não disponíveis

### Padrões de UX Implementados

1. **Consistência Visual**: Todas as seções usam o mesmo padrão de exibição de traders
2. **Autenticidade**: Níveis exibidos em números romanos como no jogo
3. **Fallback Robusto**: Iniciais do trader quando imagem não disponível
4. **Performance**: Carregamento otimizado com estados de loading