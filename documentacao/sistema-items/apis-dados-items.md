# APIs e Estrutura de Dados - Sistema de Itens

## Endpoints da API

### 1. Listagem de Itens
**Endpoint:** `GET /api/items`

#### Parâmetros de Query
```typescript
interface ItemsQueryParams {
  page?: number;           // Página atual (padrão: 1)
  limit?: number;          // Itens por página (padrão: 24)
  search?: string;         // Termo de busca
  category?: string;       // Filtro por categoria
  minPrice?: number;       // Preço mínimo
  maxPrice?: number;       // Preço máximo
  sortBy?: 'name' | 'price' | 'updated'; // Campo de ordenação
  sortOrder?: 'asc' | 'desc'; // Direção da ordenação
}
```

#### Resposta
```typescript
interface ItemsResponse {
  items: TarkovItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}
```

#### Exemplo de Uso
```bash
GET /api/items?page=1&limit=24&search=ak&category=Weapon&sortBy=price&sortOrder=desc
```

### 2. Detalhes do Item
**Endpoint:** `GET /api/items/[id]`

#### Parâmetros
- `id`: Identificador único do item (string)

#### Resposta
```typescript
interface ItemDetailResponse {
  item: TarkovItem;
  relatedItems?: TarkovItem[]; // Itens similares
  priceHistory?: PriceHistoryEntry[];
}
```

### 3. Uso do Item em Quests
**Endpoint:** `GET /api/items/[id]/usage`

#### Resposta
```typescript
interface ItemUsageResponse {
  quests: TarkovQuest[];
  hideoutStations: HideoutUsage[];
  totalUsages: number;
}
```

### 4. Receitas de Craft
**Endpoint:** `GET /api/items/[id]/crafts`

#### Resposta
```typescript
interface ItemCraftsResponse {
  crafts: Craft[];
  totalCrafts: number;
}
```

### 5. Trocas com Traders
**Endpoint:** `GET /api/items/[id]/barters`

#### Resposta
```typescript
interface ItemBartersResponse {
  barters: Barter[];
  totalBarters: number;
}
```

## Estruturas de Dados

### TarkovItem (Principal)
```typescript
export interface TarkovItem {
  // Identificação
  id: string;                    // ID único do item
  name: string;                  // Nome completo
  shortName: string;             // Nome abreviado
  description: string;           // Descrição detalhada
  
  // Propriedades físicas
  weight: number;                // Peso em kg
  width: number;                 // Largura em slots
  height: number;                // Altura em slots
  
  // Preços e economia
  basePrice: number;             // Preço base do jogo
  avg24hPrice?: number;          // Preço médio 24h
  lastLowPrice?: number;         // Último preço baixo
  changeLast48h?: number;        // Mudança absoluta 48h
  changeLast48hPercent?: number; // Mudança percentual 48h
  
  // Metadados
  updated: string;               // Data da última atualização
  types: string[];               // Categorias/tipos do item
  rarity: ItemRarity;            // Raridade do item
  
  // Imagens e links
  image?: string;                // Imagem principal
  gridImageLink?: string;        // Imagem para grid
  iconLink?: string;             // Ícone pequeno
  inspectImageLink?: string;     // Imagem de inspeção
  wikiLink?: string;             // Link para wiki
  link?: string;                 // Link oficial
  
  // Propriedades específicas (opcionais)
  properties?: ItemProperties;
}
```

### ItemRarity
```typescript
type ItemRarity = 
  | 'Common'     // Cinza
  | 'Uncommon'   // Verde
  | 'Rare'       // Azul
  | 'Epic'       // Roxo
  | 'Legendary'; // Laranja
```

### ItemProperties
```typescript
interface ItemProperties {
  // Armas
  caliber?: string;
  fireRate?: number;
  ergonomics?: number;
  recoilVertical?: number;
  recoilHorizontal?: number;
  
  // Armaduras
  armorClass?: number;
  durability?: number;
  material?: string;
  
  // Munição
  damage?: number;
  penetration?: number;
  armorDamage?: number;
  
  // Médicos
  uses?: number;
  useTime?: number;
  
  // Containers
  capacity?: number;
  grids?: Grid[];
}
```

### TarkovQuest
```typescript
export interface TarkovQuest {
  id: string;
  name: string;
  description: string;
  
  // Trader info
  trader: {
    id: string;
    name: string;
    imageLink?: string;
  };
  
  // Requisitos
  minPlayerLevel: number;
  requirements: QuestRequirement[];
  
  // Objetivos
  objectives: QuestObjective[];
  
  // Recompensas
  rewards: QuestReward[];
  
  // Metadados
  wikiLink?: string;
  experience?: number;
}
```

### QuestObjective
```typescript
interface QuestObjective {
  id: string;
  description: string;
  type: 'findInRaid' | 'handover' | 'kill' | 'mark' | 'plantItem' | 'visit';
  target?: string;
  count?: number;
  foundInRaid?: boolean;
  dogTagLevel?: number;
  location?: string;
}
```

### QuestReward
```typescript
interface QuestReward {
  type: 'experience' | 'item' | 'reputation' | 'skill';
  value?: number;
  item?: {
    id: string;
    name: string;
    count: number;
  };
  trader?: string;
  skill?: string;
}
```

### Craft
```typescript
export interface Craft {
  id: string;
  station: HideoutStation;
  duration: number;              // Duração em segundos
  
  // Materiais necessários
  requiredItems: RequiredItem[];
  
  // Itens produzidos
  rewardItems: RewardItem[];
  
  // Requisitos
  requiredQuestItems?: RequiredQuestItem[];
}
```

### HideoutStation
```typescript
export interface HideoutStation {
  id: string;
  name: string;
  level: number;
  imageLink?: string;
  
  // Requisitos para construção
  itemRequirements?: RequiredItem[];
  stationLevelRequirements?: StationLevelRequirement[];
  skillRequirements?: SkillRequirement[];
  traderRequirements?: TraderRequirement[];
}
```

### Barter
```typescript
export interface Barter {
  id: string;
  trader: Trader;
  level: number;                 // Nível do trader necessário
  
  // Itens necessários
  requiredItems: RequiredItem[];
  
  // Itens recebidos
  rewardItems: RewardItem[];
  
  // Metadados
  taskUnlock?: string;           // Quest necessária
}
```

### Trader
```typescript
interface Trader {
  id: string;
  name: string;
  imageLink?: string;
  description?: string;
  location?: string;
  currency?: 'RUB' | 'USD' | 'EUR';
}
```

### RequiredItem / RewardItem
```typescript
interface RequiredItem {
  item: {
    id: string;
    name: string;
    iconLink?: string;
  };
  count: number;
  foundInRaid?: boolean;
}

interface RewardItem {
  item: {
    id: string;
    name: string;
    iconLink?: string;
  };
  count: number;
}
```

### PriceHistoryEntry
```typescript
interface PriceHistoryEntry {
  timestamp: string;
  price: number;
  priceRUB: number;
  source: 'flea' | 'trader';
}
```

## Cache e Performance

### Estratégia de Cache
```typescript
// React Query configuration
const cacheConfig = {
  // Cache de itens (longa duração)
  items: {
    staleTime: 10 * 60 * 1000,    // 10 minutos
    cacheTime: 30 * 60 * 1000,    // 30 minutos
  },
  
  // Cache de preços (curta duração)
  prices: {
    staleTime: 2 * 60 * 1000,     // 2 minutos
    cacheTime: 5 * 60 * 1000,     // 5 minutos
  },
  
  // Cache de quests/crafts (longa duração)
  static: {
    staleTime: 60 * 60 * 1000,    // 1 hora
    cacheTime: 2 * 60 * 60 * 1000, // 2 horas
  }
};
```

### Invalidação de Cache
```typescript
// Invalidar cache quando necessário
queryClient.invalidateQueries(['items']);
queryClient.invalidateQueries(['item', itemId]);
queryClient.invalidateQueries(['item-usage', itemId]);
```

## Tratamento de Erros

### Códigos de Status HTTP
```typescript
const errorHandling = {
  200: 'Sucesso',
  400: 'Parâmetros inválidos',
  404: 'Item não encontrado',
  429: 'Muitas requisições',
  500: 'Erro interno do servidor',
  503: 'Serviço indisponível'
};
```

### Estrutura de Erro
```typescript
interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}
```

### Retry Logic
```typescript
const retryConfig = {
  retry: 3,
  retryDelay: (attemptIndex: number) => 
    Math.min(1000 * 2 ** attemptIndex, 30000),
  retryCondition: (error: any) => {
    // Retry em erros de rede ou 5xx
    return !error.response || error.response.status >= 500;
  }
};
```

## Validação de Dados

### Schema Validation (Zod)
```typescript
import { z } from 'zod';

const TarkovItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  description: z.string(),
  weight: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  basePrice: z.number().nonnegative(),
  avg24hPrice: z.number().nonnegative().optional(),
  types: z.array(z.string()),
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']),
  updated: z.string().datetime(),
});

// Validar dados da API
function validateItem(data: unknown): TarkovItem {
  return TarkovItemSchema.parse(data);
}
```

## Otimizações de Rede

### Compressão
```typescript
// Headers para compressão
const headers = {
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept': 'application/json',
  'Cache-Control': 'max-age=300' // 5 minutos
};
```

### Paginação Eficiente
```typescript
// Cursor-based pagination para grandes datasets
interface PaginationCursor {
  cursor?: string;    // Cursor para próxima página
  limit: number;      // Itens por página
  hasMore: boolean;   // Indica se há mais páginas
}
```

### Prefetching
```typescript
// Prefetch de dados relacionados
const prefetchRelatedData = async (itemId: string) => {
  await Promise.all([
    queryClient.prefetchQuery(['item-usage', itemId]),
    queryClient.prefetchQuery(['item-crafts', itemId]),
    queryClient.prefetchQuery(['item-barters', itemId])
  ]);
};
```

## Monitoramento e Analytics

### Métricas de API
```typescript
interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userAgent?: string;
  userId?: string;
}
```

### Tracking de Uso
```typescript
// Track de visualizações de itens
const trackItemView = (itemId: string, userId?: string) => {
  analytics.track('Item Viewed', {
    itemId,
    userId,
    timestamp: new Date().toISOString(),
    source: 'item-detail-page'
  });
};
```

## Testes de API

### Testes de Integração
```typescript
describe('Items API', () => {
  test('should fetch items with filters', async () => {
    const response = await fetch('/api/items?category=Weapon&limit=10');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(10);
    expect(data.items[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      types: expect.arrayContaining(['Weapon'])
    });
  });
  
  test('should handle item not found', async () => {
    const response = await fetch('/api/items/invalid-id');
    
    expect(response.status).toBe(404);
  });
});
```

### Mock Data para Testes
```typescript
export const mockTarkovItem: TarkovItem = {
  id: '5447a9cd4bdc2dbd208b4567',
  name: 'Kalashnikov AK-74M 5.45x39 assault rifle',
  shortName: 'AK-74M',
  description: 'A modern variant of the famous AK-74...',
  weight: 3.3,
  width: 4,
  height: 1,
  basePrice: 42000,
  avg24hPrice: 45000,
  types: ['Weapon', 'AssaultRifle'],
  rarity: 'Uncommon',
  updated: '2024-01-15T10:30:00Z'
};
```