# Guia de Desenvolvimento - Sistema de Itens

## Introdução

Este guia fornece instruções práticas para desenvolvedores que trabalharão com o sistema de itens do Secret Tarkov. Inclui exemplos de código, padrões recomendados e soluções para problemas comuns.

## Configuração do Ambiente

### Pré-requisitos
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

### Estrutura de Pastas
```
src/
├── app/
│   ├── items/           # Página de listagem
│   └── item/[id]/       # Página de detalhes
├── components/ui/       # Componentes reutilizáveis
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e APIs
└── types/              # Definições TypeScript
```

## Criando Novos Componentes

### 1. Componente de Item Card

```typescript
// src/components/ui/ItemCard.tsx
import { TarkovItem } from '@/types/tarkov';
import { ItemTypeBadge, PriceChangeBadge } from './Badge';
import { formatPrice } from '@/lib/utils';

interface ItemCardProps {
  item: TarkovItem;
  onClick?: (itemId: string) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ItemCard({ 
  item, 
  onClick, 
  viewMode = 'grid',
  className = '' 
}: ItemCardProps) {
  const handleClick = () => {
    onClick?.(item.id);
  };

  const baseClasses = `
    bg-tarkov-dark border border-tarkov-border rounded-lg 
    hover:border-tarkov-accent transition-all duration-200 
    cursor-pointer group
  `;

  const gridClasses = 'p-4 flex flex-col';
  const listClasses = 'p-3 flex flex-row items-center gap-4';

  return (
    <div 
      className={`${baseClasses} ${viewMode === 'grid' ? gridClasses : listClasses} ${className}`}
      onClick={handleClick}
    >
      {/* Imagem */}
      <div className={`${viewMode === 'grid' ? 'mb-3' : 'flex-shrink-0'}`}>
        <img 
          src={item.gridImageLink || item.iconLink || '/placeholder-item.png'}
          alt={item.name}
          className={`
            object-contain bg-tarkov-darker rounded
            ${viewMode === 'grid' ? 'w-full h-32' : 'w-16 h-16'}
          `}
          loading="lazy"
        />
      </div>

      {/* Conteúdo */}
      <div className={`${viewMode === 'grid' ? '' : 'flex-1 min-w-0'}`}>
        <div className="flex items-start justify-between mb-2">
          <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
            <h3 className="font-semibold text-white text-sm group-hover:text-tarkov-accent transition-colors truncate">
              {item.name}
            </h3>
            <p className="text-xs text-tarkov-text-secondary truncate">
              {item.shortName}
            </p>
          </div>
          <ItemTypeBadge itemType={item.types[0]} size="sm" />
        </div>

        {/* Preço */}
        <div className="flex items-center justify-between">
          <span className="text-tarkov-accent font-medium text-sm">
            {formatPrice(item.avg24hPrice || item.basePrice)}
          </span>
          {item.changeLast48hPercent && (
            <PriceChangeBadge 
              change={item.changeLast48h || 0}
              changePercent={item.changeLast48hPercent}
            />
          )}
        </div>

        {/* Tipos (apenas em modo grid) */}
        {viewMode === 'grid' && item.types.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.types.slice(0, 2).map((type, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-tarkov-darker text-xs text-tarkov-text-secondary rounded"
              >
                {type}
              </span>
            ))}
            {item.types.length > 2 && (
              <span className="px-2 py-1 bg-tarkov-darker text-xs text-tarkov-text-secondary rounded">
                +{item.types.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Hook Customizado para Filtros

```typescript
// src/hooks/useItemFilters.ts
import { useState, useMemo, useCallback } from 'react';
import { TarkovItem } from '@/types/tarkov';

interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  sortBy: 'name' | 'price' | 'updated';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'All',
  priceRange: [0, 1000000],
  sortBy: 'name',
  sortOrder: 'asc',
};

export function useItemFilters(items: TarkovItem[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(searchLower);
        const matchesShortName = item.shortName.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesShortName) {
          return false;
        }
      }

      // Filtro de categoria
      if (filters.category !== 'All') {
        const categoryLower = filters.category.toLowerCase();
        const hasCategory = item.types.some(type => 
          type.toLowerCase().includes(categoryLower)
        );
        if (!hasCategory) {
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

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    filteredItems,
    updateFilter,
    clearFilters,
    hasActiveFilters: JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)
  };
}
```

### 3. Componente de Paginação

```typescript
// src/components/ui/Pagination.tsx
import { Button } from './Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems,
  itemsPerPage = 24
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {showInfo && totalItems && (
        <div className="text-sm text-tarkov-text-secondary">
          Mostrando {startItem} a {endItem} de {totalItems} itens
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-tarkov-text-secondary">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Próxima
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

## Padrões de Desenvolvimento

### 1. Tratamento de Estados de Loading

```typescript
// Padrão para componentes com loading
function ItemsPage() {
  const { items, loading, error } = useTarkov.useAllItems();

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorState 
            title="Erro ao carregar itens"
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </div>
      </PageLayout>
    );
  }

  // Renderizar conteúdo normal
  return (
    <PageLayout>
      {/* Conteúdo da página */}
    </PageLayout>
  );
}
```

### 2. Debounce para Busca

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Uso no componente
function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar itens..."
    />
  );
}
```

### 3. Gerenciamento de Favoritos

```typescript
// src/hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import { TarkovItem } from '@/types/tarkov';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<TarkovItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar favoritos do usuário
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/user/favorites');
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (item: TarkovItem) => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });

      if (response.ok) {
        setFavorites(prev => [...prev, item]);
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/favorites/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(item => item.id === itemId);
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
}
```

## Utilitários Comuns

### 1. Formatação de Preços

```typescript
// src/lib/utils.ts
export function formatPrice(price: number, currency: 'RUB' | 'USD' | 'EUR' = 'RUB'): string {
  const symbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€'
  };

  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price) + ' ' + symbols[currency];
}

export function formatPriceChange(change: number, changePercent: number): {
  text: string;
  color: string;
  isPositive: boolean;
} {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return {
    text: `${isPositive ? '+' : ''}${changePercent.toFixed(1)}%`,
    color: isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400',
    isPositive
  };
}
```

### 2. Validação de Imagens

```typescript
// src/lib/imageUtils.ts
export function getItemImage(item: TarkovItem, size: 'icon' | 'grid' | 'inspect' = 'grid'): string {
  const imageMap = {
    icon: item.iconLink,
    grid: item.gridImageLink,
    inspect: item.inspectImageLink
  };

  return imageMap[size] || item.gridImageLink || item.iconLink || '/placeholder-item.png';
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}
```

### 3. Filtros de Categoria

```typescript
// src/lib/categoryUtils.ts
export const ITEM_CATEGORIES = [
  { value: 'All', label: 'Todos', icon: null },
  { value: 'Weapon', label: 'Armas', icon: '🔫' },
  { value: 'Ammo', label: 'Munição', icon: '🔸' },
  { value: 'Armor', label: 'Armadura', icon: '🛡️' },
  { value: 'Backpack', label: 'Mochilas', icon: '🎒' },
  { value: 'Medical', label: 'Médicos', icon: '💊' },
  { value: 'Key', label: 'Chaves', icon: '🔑' },
  { value: 'Barter', label: 'Troca', icon: '💰' },
] as const;

export function getCategoryLabel(category: string): string {
  const found = ITEM_CATEGORIES.find(cat => cat.value === category);
  return found?.label || category;
}

export function getCategoryIcon(category: string): string | null {
  const found = ITEM_CATEGORIES.find(cat => cat.value === category);
  return found?.icon || null;
}
```

## Testes

### 1. Teste de Componente

```typescript
// src/components/ui/__tests__/ItemCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '../ItemCard';
import { mockTarkovItem } from '@/test/mocks';

describe('ItemCard', () => {
  const defaultProps = {
    item: mockTarkovItem,
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render item information correctly', () => {
    render(<ItemCard {...defaultProps} />);
    
    expect(screen.getByText(mockTarkovItem.name)).toBeInTheDocument();
    expect(screen.getByText(mockTarkovItem.shortName)).toBeInTheDocument();
    expect(screen.getByAltText(mockTarkovItem.name)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(<ItemCard {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockTarkovItem.id);
  });

  it('should render in list mode', () => {
    render(<ItemCard {...defaultProps} viewMode="list" />);
    
    const container = screen.getByRole('button');
    expect(container).toHaveClass('flex-row');
  });

  it('should handle missing image gracefully', () => {
    const itemWithoutImage = { ...mockTarkovItem, gridImageLink: undefined, iconLink: undefined };
    render(<ItemCard {...defaultProps} item={itemWithoutImage} />);
    
    const image = screen.getByAltText(mockTarkovItem.name);
    expect(image).toHaveAttribute('src', '/placeholder-item.png');
  });
});
```

### 2. Teste de Hook

```typescript
// src/hooks/__tests__/useItemFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useItemFilters } from '../useItemFilters';
import { mockTarkovItems } from '@/test/mocks';

describe('useItemFilters', () => {
  it('should filter items by search term', () => {
    const { result } = renderHook(() => useItemFilters(mockTarkovItems));
    
    act(() => {
      result.current.updateFilter('search', 'AK');
    });
    
    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems[0].name).toContain('AK');
  });

  it('should filter items by category', () => {
    const { result } = renderHook(() => useItemFilters(mockTarkovItems));
    
    act(() => {
      result.current.updateFilter('category', 'Weapon');
    });
    
    const weaponItems = result.current.filteredItems;
    expect(weaponItems.every(item => item.types.includes('Weapon'))).toBe(true);
  });

  it('should sort items correctly', () => {
    const { result } = renderHook(() => useItemFilters(mockTarkovItems));
    
    act(() => {
      result.current.updateFilter('sortBy', 'price');
      result.current.updateFilter('sortOrder', 'desc');
    });
    
    const prices = result.current.filteredItems.map(item => item.avg24hPrice || item.basePrice);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useItemFilters(mockTarkovItems));
    
    act(() => {
      result.current.updateFilter('search', 'test');
      result.current.updateFilter('category', 'Weapon');
    });
    
    expect(result.current.hasActiveFilters).toBe(true);
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.category).toBe('All');
  });
});
```

## Troubleshooting

### Problemas Comuns

1. **Imagens não carregam**
   ```typescript
   // Verificar se o domínio está configurado no next.config.js
   module.exports = {
     images: {
       domains: ['assets.tarkov.dev', 'static.wikia.nocookie.net']
     }
   };
   ```

2. **Filtros não funcionam**
   ```typescript
   // Verificar se os dados estão sendo passados corretamente
   console.log('Items:', items);
   console.log('Filters:', filters);
   console.log('Filtered:', filteredItems);
   ```

3. **Performance lenta**
   ```typescript
   // Usar React.memo para componentes pesados
   export const ItemCard = React.memo(function ItemCard(props) {
     // ...
   });
   
   // Verificar se useMemo está sendo usado corretamente
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data);
   }, [data]);
   ```

4. **Estados de loading infinitos**
   ```typescript
   // Verificar dependências dos useEffect
   useEffect(() => {
     fetchData();
   }, []); // Array vazio para executar apenas uma vez
   ```

### Debug Tools

```typescript
// src/lib/debug.ts
export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  performance: (label: string, fn: () => any) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label);
      const result = fn();
      console.timeEnd(label);
      return result;
    }
    return fn();
  }
};
```

## Próximos Passos

### Melhorias Planejadas
1. **Infinite Scroll**: Implementar carregamento infinito
2. **Virtual Scrolling**: Para listas muito grandes
3. **Offline Support**: Cache com Service Workers
4. **Advanced Filters**: Filtros por stats específicos
5. **Comparison Tool**: Comparar itens lado a lado

### Contribuindo
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente os testes
4. Faça commit das mudanças
5. Abra um Pull Request

### Recursos Adicionais
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do React Query](https://tanstack.com/query/latest)
- [Guia do Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)