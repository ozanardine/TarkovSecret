# ⚙️ Documentação Técnica - Componentes e Hooks de Ammunition

## 🎯 Visão Geral

Este documento detalha a implementação técnica de todos os componentes, hooks e utilitários que compõem o sistema de ammunition do Secret Tarkov, fornecendo uma referência completa para desenvolvedores.

## 🪝 Hooks Customizados

### useAmmunition
**Arquivo**: `src/hooks/useAmmunition.ts`

#### Responsabilidades
- Gerenciamento de estado para dados de munição
- Integração com a API TarkovDev
- Tratamento de erros e loading states
- Função de refetch para atualizações

#### Interface
```typescript
interface UseAmmunitionReturn {
  ammunition: Ammo[];           // Array de munições
  loading: boolean;             // Estado de carregamento
  error: string | null;         // Mensagem de erro
  refetch: () => void;          // Função para recarregar dados
}
```

#### Implementação
```typescript
export function useAmmunition(): UseAmmunitionReturn {
  const [ammunition, setAmmunition] = useState<Ammo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmmunition = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tarkovDevApi.getAmmunition();
      setAmmunition(data);
    } catch (err) {
      console.error('Error fetching ammunition:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar munições');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmmunition();
  }, [fetchAmmunition]);

  return {
    ammunition,
    loading,
    error,
    refetch: fetchAmmunition
  };
}
```

#### Características Técnicas
- **Cache Automático**: Dados persistem durante a sessão
- **Error Recovery**: Função de retry integrada
- **Type Safety**: Tipagem completa com TypeScript
- **Performance**: Memoização com useCallback

### useInfiniteScroll
**Arquivo**: `src/hooks/useInfiniteScroll.ts`

#### Responsabilidades
- Detecção de scroll próximo ao fim da página
- Carregamento progressivo de itens
- Otimização de performance para listas grandes

#### Uso na Página de Ammunition
```typescript
const {
  displayedItems,
  loadMore,
  hasMore,
  isLoading
} = useInfiniteScroll({
  items: filteredAmmo,
  itemsPerLoad: AMMO_PER_LOAD,
  threshold: 200 // pixels do fim da página
});
```

## 🧩 Componentes Principais

### AdvancedAmmoFilters
**Arquivo**: `src/components/ammunition/AdvancedAmmoFilters.tsx`

#### Responsabilidades
- Interface completa de filtros
- Gerenciamento de estado de filtros
- Validação e sanitização de inputs
- Interface expansível/colapsável

#### Props Interface
```typescript
interface AdvancedAmmoFiltersProps {
  filters: AdvancedAmmoFiltersState;
  onFiltersChange: (filters: AdvancedAmmoFiltersState) => void;
  onClearFilters: () => void;
  availableCalibers: string[];
  availableTraders: string[];
  availableAmmoTypes: string[];
  className?: string;
}
```

#### Estado de Filtros
```typescript
interface AdvancedAmmoFiltersState {
  search: string;                           // Busca textual
  caliber: string[];                        // Filtros de calibre
  damageRange: [number, number];            // Range de dano
  penetrationRange: [number, number];       // Range de penetração
  priceRange: [number, number];            // Range de preço
  trader: string[];                        // Filtros de trader
  ammoType: string[];                      // Tipos de munição
  tracer: 'all' | 'tracer' | 'no-tracer'; // Filtro tracer
  sortBy: SortCriteria;                    // Critério de ordenação
  sortOrder: 'asc' | 'desc';               // Ordem de classificação
}
```

#### Funcionalidades Avançadas

##### 1. Limpeza de Nomes de Calibre
```typescript
const cleanCaliberName = (caliber: string) => {
  return caliber
    .replace(/caliber/gi, '')     // Remove "caliber"
    .replace(/mm/gi, '')          // Remove "mm"
    .replace(/\s+/g, '')          // Remove espaços extras
    .replace(/[()]/g, '')         // Remove parênteses
    .replace(/^\.+|\.+$/g, '')   // Remove pontos no início/fim
    .trim();
};
```

##### 2. Contagem de Filtros Ativos
```typescript
const getActiveFiltersCount = () => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.caliber.length > 0) count++;
  if (filters.trader.length > 0) count++;
  if (filters.ammoType.length > 0) count++;
  if (filters.tracer !== 'all') count++;
  if (filters.damageRange[0] > 0 || filters.damageRange[1] < 200) count++;
  if (filters.penetrationRange[0] > 0 || filters.penetrationRange[1] < 100) count++;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
  return count;
};
```

##### 3. Toggle de Filtros Array
```typescript
const toggleArrayFilter = (key: keyof AdvancedAmmoFiltersState, value: string) => {
  const currentArray = filters[key] as string[];
  const newArray = currentArray.includes(value)
    ? currentArray.filter(item => item !== value)
    : [...currentArray, value];
  updateFilters({ [key]: newArray });
};
```

### AmmoTable
**Arquivo**: `src/components/ammunition/AmmoTable.tsx`

#### Responsabilidades
- Renderização tabular de munições
- Ordenação clicável por colunas
- Ações rápidas (preview, comparação, favoritos)
- Layout responsivo

#### Estrutura de Colunas
```typescript
const columns = [
  {
    key: 'name',
    label: 'Nome',
    sortable: true,
    render: (ammo: Ammo) => (
      <div className="flex items-center space-x-3">
        <img src={ammo.item.iconLink} className="w-8 h-8" />
        <div>
          <div className="font-medium">{ammo.item.name}</div>
          <div className="text-sm text-gray-500">{ammo.item.shortName}</div>
        </div>
      </div>
    )
  },
  {
    key: 'damage',
    label: 'Dano',
    sortable: true,
    render: (ammo: Ammo) => (
      <Badge variant={getDamageVariant(ammo.damage)}>
        {ammo.damage}
      </Badge>
    )
  },
  // ... outras colunas
];
```

#### Funcionalidades de Ordenação
```typescript
const handleSort = (columnKey: string) => {
  const newSortOrder = 
    sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
  
  onSortChange({
    sortBy: columnKey as SortCriteria,
    sortOrder: newSortOrder
  });
};
```

### ModernAmmoCard
**Arquivo**: `src/components/ammunition/ModernAmmoCard.tsx`

#### Responsabilidades
- Renderização em formato card
- Hover effects e animações
- Informações condensadas e visuais
- Ações rápidas integradas

#### Props Interface
```typescript
interface ModernAmmoCardProps {
  ammo: Ammo;
  onQuickPreview: (ammo: Ammo) => void;
  onAddToComparison: (ammo: Ammo) => void;
  onToggleFavorite: (ammoId: string) => void;
  isFavorite: boolean;
  isInComparison: boolean;
  className?: string;
}
```

#### Design System
```typescript
const cardVariants = {
  default: 'bg-tarkov-dark/50 border-tarkov-secondary/30',
  hover: 'bg-tarkov-dark/70 border-tarkov-accent/50 shadow-lg',
  selected: 'bg-tarkov-accent/10 border-tarkov-accent ring-2 ring-tarkov-accent/50'
};

const damageColors = {
  low: 'text-green-400',      // < 50 dano
  medium: 'text-yellow-400',  // 50-80 dano
  high: 'text-orange-400',    // 80-120 dano
  extreme: 'text-red-400'     // > 120 dano
};
```

### AmmoQuickPreview
**Arquivo**: `src/components/ammunition/AmmoQuickPreview.tsx`

#### Responsabilidades
- Modal de preview rápido
- Informações essenciais condensadas
- Ações rápidas (comparação, favoritos)
- Performance otimizada

#### Estrutura do Modal
```typescript
const AmmoQuickPreview = ({ ammo, isOpen, onClose, onAddToComparison }) => {
  if (!isOpen || !ammo) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <img src={ammo.item.iconLink} className="w-10 h-10" />
            <div>
              <div>{ammo.item.name}</div>
              <div className="text-sm text-gray-500">{ammo.item.shortName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <StatsGrid ammo={ammo} />
          <PriceInfo ammo={ammo} />
          <QuickActions ammo={ammo} onAddToComparison={onAddToComparison} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### AmmoComparison
**Arquivo**: `src/components/ammunition/AmmoComparison.tsx`

#### Responsabilidades
- Modal de comparação avançada
- 4 views especializadas
- Cálculos complexos memoizados
- Visualização corporal interativa

#### Sistema de Abas
```typescript
const comparisonTabs = [
  {
    id: 'damage',
    label: 'Dano',
    icon: '🔥',
    description: 'Análise de dano por parte do corpo',
    component: DamageView
  },
  {
    id: 'penetration',
    label: 'Penetração',
    icon: '🛡️',
    description: 'Classificação por classes de armadura',
    component: PenetrationView
  },
  {
    id: 'ballistics',
    label: 'Balística',
    icon: '⚗️',
    description: 'Propriedades balísticas e modificadores',
    component: BallisticsView
  },
  {
    id: 'economy',
    label: 'Economia',
    icon: '💰',
    description: 'Análise de custo-benefício',
    component: EconomyView
  }
];
```

#### Cálculos Memoizados
```typescript
const calculations = useMemo(() => {
  // Verificação de segurança
  if (!ammunition || ammunition.length === 0) {
    return {
      bestPrice: null,
      worstPrice: null,
      bestDamage: 0,
      worstDamage: 0,
      bestPenetration: 0,
      worstPenetration: 0,
      priceRange: [0, 0],
      damageRange: [0, 0],
      penetrationRange: [0, 0]
    };
  }
  
  try {
    // Cálculos seguros com validação
    const validAmmo = ammunition.filter(ammo => 
      ammo && 
      typeof ammo.damage === 'number' && 
      typeof ammo.penetrationPower === 'number'
    );
    
    if (validAmmo.length === 0) {
      return defaultCalculationsObject;
    }
    
    // Cálculos de preço
    const prices = validAmmo
      .map(ammo => getBestPrice(ammo)?.price)
      .filter((price): price is number => 
        typeof price === 'number' && 
        !isNaN(price) && 
        price < Infinity
      );
    
    // Cálculos de dano e penetração
    const damages = validAmmo.map(ammo => ammo.damage);
    const penetrations = validAmmo.map(ammo => ammo.penetrationPower);
    
    return {
      bestPrice: prices.length > 0 ? Math.min(...prices) : null,
      worstPrice: prices.length > 0 ? Math.max(...prices) : null,
      bestDamage: damages.length > 0 ? Math.max(...damages) : 0,
      worstDamage: damages.length > 0 ? Math.min(...damages) : 0,
      bestPenetration: penetrations.length > 0 ? Math.max(...penetrations) : 0,
      worstPenetration: penetrations.length > 0 ? Math.min(...penetrations) : 0,
      priceRange: prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
      damageRange: [Math.min(...damages), Math.max(...damages)],
      penetrationRange: [Math.min(...penetrations), Math.max(...penetrations)]
    };
  } catch (error) {
    console.error('Error in calculations:', error);
    return defaultCalculationsObject;
  }
}, [ammunition]);
```

## 🎨 Componentes de UI Especializados

### BodyDamageVisualization
**Arquivo**: `src/components/ammunition/BodyDamageVisualization.tsx`

#### Responsabilidades
- Renderização SVG da silhueta corporal
- Interatividade (hover, click, keyboard)
- Cálculos de dano por zona
- Seletor de armadura integrado

#### Mapeamento de Zonas Corporais
```typescript
const bodyPartZones = {
  'Head': { multiplier: 2.0, name: 'Cabeça' },
  'Thorax': { multiplier: 1.0, name: 'Tórax' },
  'Stomach': { multiplier: 1.5, name: 'Estômago' },
  'LeftArm': { multiplier: 0.7, name: 'Braço Esquerdo' },
  'RightArm': { multiplier: 0.7, name: 'Braço Direito' },
  'LeftLeg': { multiplier: 0.65, name: 'Perna Esquerda' },
  'RightLeg': { multiplier: 0.65, name: 'Perna Direita' }
};
```

#### Cálculo de Dano Efetivo
```typescript
const calculateEffectiveDamage = useCallback((ammo: Ammo, zone: string) => {
  const baseDamage = ammo.damage || 0;
  const zoneData = bodyPartZones[zone];
  
  if (!zoneData) return baseDamage;
  
  let effectiveDamage = baseDamage * zoneData.multiplier;
  
  // Aplicar redução de armadura se selecionada
  if (selectedArmorItems.length > 0) {
    const armorReduction = calculateArmorReduction(ammo, selectedArmorItems, zone);
    effectiveDamage = Math.max(1, effectiveDamage - armorReduction);
  }
  
  return Math.round(effectiveDamage);
}, [selectedArmorItems]);
```

### ArmorItemSelector
**Arquivo**: `src/components/ammunition/ArmorItemSelector.tsx`

#### Responsabilidades
- Seleção de itens de armadura
- Categorização automática
- Interface expansível por categoria
- Integração com cálculos de dano

#### Categorização de Armadura
```typescript
const determineArmorType = (armor: ArmorItem): ArmorCategory => {
  const name = armor.name.toLowerCase();
  const zones = armor.armorZones || [];
  
  if (zones.includes('Head') || name.includes('helmet') || name.includes('cap')) {
    return 'helmet';
  }
  
  if (zones.includes('Thorax') && zones.includes('Stomach')) {
    return 'bodyArmor';
  }
  
  if (zones.includes('Thorax') && !zones.includes('Stomach')) {
    return 'chestRig';
  }
  
  return 'other';
};
```

## 🔧 Utilitários e Helpers

### Formatação de Dados
```typescript
// Formatação de preços
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price);
};

// Formatação de percentuais
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Formatação de modificadores
export const formatModifier = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
};
```

### Validação de Dados
```typescript
// Validação de munição
export const isValidAmmo = (ammo: any): ammo is Ammo => {
  return (
    ammo &&
    typeof ammo.damage === 'number' &&
    typeof ammo.penetrationPower === 'number' &&
    ammo.item &&
    typeof ammo.item.name === 'string'
  );
};

// Validação de preço
export const isValidPrice = (price: any): price is number => {
  return (
    typeof price === 'number' &&
    !isNaN(price) &&
    price > 0 &&
    price < Infinity
  );
};
```

### Cálculos Balísticos
```typescript
// Cálculo de penetração
export const calculatePenetrationChance = (
  penetration: number, 
  armorClass: number
): number => {
  // Fórmula baseada no jogo original
  const basePenetration = penetration / (armorClass * 10);
  return Math.min(1, Math.max(0, basePenetration));
};

// Cálculo de eficiência
export const calculateEfficiency = (
  damage: number, 
  price: number
): number => {
  if (!price || price === 0) return 0;
  return Number((damage / price).toFixed(4));
};

// Cálculo de TTK (Time to Kill)
export const calculateTTK = (
  damage: number, 
  targetHP: number, 
  fireRate: number
): number => {
  const shotsToKill = Math.ceil(targetHP / damage);
  const timeBetweenShots = 60 / fireRate; // em segundos
  return (shotsToKill - 1) * timeBetweenShots;
};
```

## 🚀 Otimizações de Performance

### Memoização Estratégica
```typescript
// Memoização de filtros disponíveis
const availableOptions = useMemo(() => ({
  calibers: Array.from(new Set(
    ammunition.map(ammo => ammo.caliber).filter(Boolean)
  )).sort(),
  
  traders: Array.from(new Set(
    ammunition.flatMap(ammo => 
      (ammo.item.buyFor || []).map(trader => trader.source)
    ).filter(Boolean)
  )).sort(),
  
  ammoTypes: Array.from(new Set(
    ammunition.map(ammo => ammo.ammoType).filter(Boolean)
  )).sort()
}), [ammunition]);

// Memoização de munições filtradas
const filteredAmmo = useMemo(() => {
  return ammunition
    .filter(ammo => applyFilters(ammo, filters))
    .sort((a, b) => applySorting(a, b, filters.sortBy, filters.sortOrder));
}, [ammunition, filters]);
```

### Lazy Loading de Componentes
```typescript
// Carregamento sob demanda de componentes pesados
const AmmoComparison = lazy(() => import('./AmmoComparison'));
const BodyDamageVisualization = lazy(() => import('./BodyDamageVisualization'));

// Wrapper com Suspense
const LazyAmmoComparison = ({ ...props }) => (
  <Suspense fallback={<Loading />}>
    <AmmoComparison {...props} />
  </Suspense>
);
```

### Debounce de Filtros
```typescript
// Hook customizado para debounce
const useDebouncedFilters = (filters: AdvancedAmmoFiltersState, delay: number = 300) => {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [filters, delay]);
  
  return debouncedFilters;
};
```

## 🎯 Conclusão

O sistema de componentes e hooks de ammunition representa uma arquitetura robusta e escalável, com foco em performance, manutenibilidade e experiência do usuário. Cada componente tem responsabilidades bem definidas e interfaces claras, facilitando manutenção e extensão futuras.