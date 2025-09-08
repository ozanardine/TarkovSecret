# Documentação: APIs e Endpoints

## Visão Geral

Esta documentação detalha todas as APIs e endpoints utilizados no sistema Secret Tarkov, incluindo APIs internas, externas e estrutura de dados.

## APIs Internas (Next.js API Routes)

### 1. Search API

**Endpoint**: `/api/search`
**Arquivo**: `src/app/api/search/route.ts`

#### GET /api/search

Busca itens por texto.

**Query Parameters**:
```typescript
interface SearchQuery {
  q: string;                    // Query de busca (obrigatório)
  limit?: number;              // Limite de resultados (padrão: 20)
  offset?: number;             // Offset para paginação (padrão: 0)
  category?: string;           // Filtro por categoria
  rarity?: ItemRarity;         // Filtro por raridade
  minPrice?: number;           // Preço mínimo
  maxPrice?: number;           // Preço máximo
  types?: string;              // Tipos de item (separados por vírgula)
  sort?: 'name' | 'price' | 'rarity'; // Ordenação
  order?: 'asc' | 'desc';      // Direção da ordenação
}
```

**Response**:
```typescript
interface SearchResponse {
  items: TarkovItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata: {
    query: string;
    processingTime: number;
    source: 'cache' | 'api';
  };
}
```

**Exemplo de Uso**:
```bash
GET /api/search?q=ak74&limit=10&category=weapon&sort=price&order=asc
```

#### POST /api/search

Busca avançada com filtros complexos.

**Request Body**:
```typescript
interface AdvancedSearchRequest {
  query: string;
  filters: {
    categories: string[];
    rarity: ItemRarity[];
    priceRange: {
      min: number;
      max: number;
    };
    types: string[];
    properties: {
      [key: string]: any;
    };
  };
  pagination: {
    page: number;
    limit: number;
  };
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}
```

**Response**: Mesmo formato do GET

### 2. Image Search API

**Endpoint**: `/api/image-search`
**Arquivo**: `src/app/api/image-search/route.ts`

#### POST /api/image-search

Busca itens por imagem.

**Request Body** (multipart/form-data):
```typescript
interface ImageSearchRequest {
  image: File;                 // Arquivo de imagem
  algorithm?: 'intelligent' | 'mock'; // Algoritmo de busca
  maxResults?: number;         // Máximo de resultados
  minConfidence?: number;      // Confiança mínima
  enableRegionDetection?: boolean; // Detecção de regiões
  filters?: ImageSearchFilters; // Filtros adicionais
}
```

**Response**:
```typescript
interface ImageSearchResponse {
  results: ImageSearchResult[];
  metadata: {
    processingTime: number;
    algorithm: string;
    imageSize: {
      width: number;
      height: number;
    };
    regionsDetected: number;
    hasMultipleItems: boolean;
  };
}
```

### 3. User API

**Endpoint**: `/api/user`
**Arquivo**: `src/app/api/user/route.ts`

#### GET /api/user

Obter dados do usuário autenticado.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
interface UserResponse {
  user: User;
  subscription: {
    plan: UserPlan;
    expiresAt?: string;
    features: string[];
  };
  usage: {
    searchesThisMonth: number;
    imageSearchesThisMonth: number;
    apiCallsThisMonth: number;
  };
}
```

#### PUT /api/user

Atualizar dados do usuário.

**Request Body**:
```typescript
interface UpdateUserRequest {
  fullName?: string;
  avatarUrl?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
}
```

### 4. Watchlist API

**Endpoint**: `/api/watchlist`
**Arquivo**: `src/app/api/watchlist/route.ts`

#### GET /api/watchlist

Obter lista de favoritos do usuário.

**Response**:
```typescript
interface WatchlistResponse {
  items: Array<{
    id: string;
    item: TarkovItem;
    addedAt: string;
    priceAlerts: boolean;
    targetPrice?: number;
  }>;
  total: number;
}
```

#### POST /api/watchlist

Adicionar item à lista de favoritos.

**Request Body**:
```typescript
interface AddToWatchlistRequest {
  itemId: string;
  priceAlerts?: boolean;
  targetPrice?: number;
}
```

#### DELETE /api/watchlist/[id]

Remover item da lista de favoritos.

### 5. Analytics API

**Endpoint**: `/api/analytics`
**Arquivo**: `src/app/api/analytics/route.ts`

#### POST /api/analytics/event

Registrar evento de analytics.

**Request Body**:
```typescript
interface AnalyticsEvent {
  event: string;
  properties: {
    [key: string]: any;
  };
  userId?: string;
  sessionId: string;
  timestamp: number;
}
```

## APIs Externas

### 1. Tarkov.dev GraphQL API

**Base URL**: `https://api.tarkov.dev/graphql`
**Documentação**: https://api.tarkov.dev/

#### Queries Principais

##### Buscar Itens
```graphql
query SearchItems($name: String, $limit: Int, $offset: Int) {
  items(name: $name, limit: $limit, offset: $offset) {
    id
    name
    shortName
    description
    category {
      id
      name
      normalizedName
    }
    rarity
    basePrice
    fleaMarketFee
    image
    iconLink
    wikiLink
    types
    weight
    width
    height
    backgroundColor
  }
}
```

##### Obter Item por ID
```graphql
query GetItem($id: ID!) {
  item(id: $id) {
    id
    name
    shortName
    description
    category {
      id
      name
      normalizedName
    }
    rarity
    basePrice
    fleaMarketFee
    image
    iconLink
    wikiLink
    types
    weight
    width
    height
    backgroundColor
    properties {
      ... on ItemPropertiesWeapon {
        caliber
        effectiveDistance
        ergonomics
        fireModes
        fireRate
        recoilVertical
        recoilHorizontal
      }
      ... on ItemPropertiesArmor {
        class
        durability
        material
        bluntThroughput
        zones
      }
    }
  }
}
```

##### Obter Categorias
```graphql
query GetCategories {
  itemCategories {
    id
    name
    normalizedName
    children {
      id
      name
      normalizedName
    }
  }
}
```

##### Buscar por Tipo
```graphql
query GetItemsByType($type: ItemType!) {
  items(type: $type) {
    id
    name
    shortName
    image
    iconLink
    basePrice
    rarity
  }
}
```

#### Rate Limits
- **Limite**: 100 requests por minuto
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp do reset

### 2. Supabase API

**Base URL**: `https://[project-id].supabase.co`
**Documentação**: https://supabase.com/docs/reference/api

#### Authentication

##### Login
```typescript
POST /auth/v1/token?grant_type=password

Body: {
  email: string;
  password: string;
}

Response: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
```

##### Refresh Token
```typescript
POST /auth/v1/token?grant_type=refresh_token

Body: {
  refresh_token: string;
}
```

##### Logout
```typescript
POST /auth/v1/logout

Headers: {
  Authorization: 'Bearer <access_token>'
}
```

#### Database Operations

##### Select
```typescript
GET /rest/v1/users?select=*&id=eq.123

Headers: {
  Authorization: 'Bearer <access_token>',
  apikey: '<anon_key>'
}
```

##### Insert
```typescript
POST /rest/v1/watchlists

Headers: {
  Authorization: 'Bearer <access_token>',
  apikey: '<anon_key>',
  'Content-Type': 'application/json'
}

Body: {
  user_id: string;
  item_id: string;
}
```

##### Update
```typescript
PATCH /rest/v1/users?id=eq.123

Body: {
  full_name: string;
}
```

##### Delete
```typescript
DELETE /rest/v1/watchlists?id=eq.123
```

## Estrutura de Resposta Padrão

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp: number;
    requestId: string;
    processingTime: number;
    source?: string;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: number;
    requestId: string;
  };
}
```

### Pagination
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Códigos de Status HTTP

### Success Codes
- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Operação bem-sucedida sem conteúdo

### Client Error Codes
- `400 Bad Request`: Dados inválidos na requisição
- `401 Unauthorized`: Token de autenticação inválido ou ausente
- `403 Forbidden`: Usuário não tem permissão
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito com estado atual do recurso
- `422 Unprocessable Entity`: Dados válidos mas não processáveis
- `429 Too Many Requests`: Rate limit excedido

### Server Error Codes
- `500 Internal Server Error`: Erro interno do servidor
- `502 Bad Gateway`: Erro na API externa
- `503 Service Unavailable`: Serviço temporariamente indisponível
- `504 Gateway Timeout`: Timeout na API externa

## Rate Limiting

### Limites por Plano

#### Free Plan
- **Text Search**: 100 requests/hora
- **Image Search**: 10 requests/hora
- **API Calls**: 500 requests/dia

#### Plus Plan
- **Text Search**: 1000 requests/hora
- **Image Search**: 100 requests/hora
- **API Calls**: 10000 requests/dia

#### Premium Plan
- **Text Search**: Ilimitado
- **Image Search**: 1000 requests/hora
- **API Calls**: 100000 requests/dia

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Type: user
```

## Autenticação e Autorização

### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;          // User ID
  email: string;        // User email
  plan: UserPlan;       // Subscription plan
  iat: number;          // Issued at
  exp: number;          // Expires at
  aud: string;          // Audience
  iss: string;          // Issuer
}
```

### Authorization Headers
```
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>  // Para APIs públicas
```

### Scopes e Permissões
```typescript
type Permission = 
  | 'read:items'
  | 'search:text'
  | 'search:image'
  | 'write:watchlist'
  | 'read:analytics'
  | 'admin:users';

interface UserPermissions {
  userId: string;
  permissions: Permission[];
  plan: UserPlan;
}
```

## Caching Strategy

### Cache Headers
```
Cache-Control: public, max-age=3600
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
Vary: Accept-Encoding, Authorization
```

### Cache Keys
```typescript
interface CacheKey {
  prefix: string;       // 'search', 'item', 'user'
  identifier: string;   // Query hash, item ID, user ID
  version: string;      // API version
  params?: string;      // Serialized parameters
}

// Exemplo: search:ak74:v1:limit=10&sort=price
```

## Monitoring e Observabilidade

### Health Check Endpoint
```typescript
GET /api/health

Response: {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    database: 'up' | 'down';
    external_api: 'up' | 'down';
    cache: 'up' | 'down';
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}
```

### Metrics Endpoint
```typescript
GET /api/metrics

Response: {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  users: {
    active: number;
    new: number;
  };
  searches: {
    text: number;
    image: number;
  };
}
```

## Webhooks

### User Events
```typescript
POST <webhook_url>

Headers: {
  'X-Webhook-Signature': '<signature>',
  'Content-Type': 'application/json'
}

Body: {
  event: 'user.created' | 'user.updated' | 'user.deleted';
  data: User;
  timestamp: number;
}
```

### Search Events
```typescript
Body: {
  event: 'search.performed';
  data: {
    userId: string;
    query: string;
    type: 'text' | 'image';
    resultsCount: number;
    processingTime: number;
  };
  timestamp: number;
}
```

## API de Traders (Tarkov.dev)

### Endpoint: getTraders
**Arquivo**: `src/lib/tarkov-api.ts`
**Função**: `getTraders()`

#### GraphQL Query
```graphql
query {
  traders {
    id
    name
    imageLink
  }
}
```

#### Response Type
```typescript
interface TradersResponse {
  data: {
    traders: Trader[];
  };
}

interface Trader {
  id: string;
  name: string;
  imageLink?: string;
  image4xLink?: string;
}
```

#### Implementação
```typescript
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

#### Cache Strategy
- **Cache Key**: `'traders'`
- **Duration**: `CACHE_DURATION.LONG` (24 horas)
- **Justificativa**: Dados de traders mudam raramente

#### Uso nos Componentes
```typescript
// ItemTraders.tsx
const [traders, setTraders] = useState<Trader[]>([]);

useEffect(() => {
  const fetchTraders = async () => {
    const tradersData = await tarkovApi.getTraders();
    setTraders(tradersData);
  };
  fetchTraders();
}, []);

// Busca de imagem do trader
const getTraderImage = (traderName: string) => {
  const trader = traders.find(t => t.name === traderName);
  return trader?.imageLink || trader?.image4xLink;
};
```

## Utilitários de Sistema

### Roman Numerals Utility
**Arquivo**: `src/lib/utils/roman-numerals.ts`

#### Funções Disponíveis

##### toRomanNumeral(num: number): string
```typescript
/**
 * Converte um número (1-10) para algarismo romano
 * @param num - Número a ser convertido (1-10)
 * @returns String com o algarismo romano correspondente
 * @throws Error se o número estiver fora do intervalo suportado
 */
export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 10 || !Number.isInteger(num)) {
    throw new Error('Número deve ser um inteiro entre 1 e 10');
  }
  return romanNumerals[num];
}
```

**Exemplos de uso**:
```typescript
toRomanNumeral(1);  // 'I'
toRomanNumeral(4);  // 'IV'
toRomanNumeral(10); // 'X'
```

##### fromRomanNumeral(roman: string): number | null
```typescript
/**
 * Converte um algarismo romano para número
 * @param roman - Algarismo romano a ser convertido
 * @returns Número correspondente ou null se inválido
 */
export function fromRomanNumeral(roman: string): number | null {
  const reverseMap = Object.fromEntries(
    Object.entries(romanNumerals).map(([num, rom]) => [rom, parseInt(num)])
  );
  return reverseMap[roman.toUpperCase()] || null;
}
```

**Exemplos de uso**:
```typescript
fromRomanNumeral('I');   // 1
fromRomanNumeral('IV');  // 4
fromRomanNumeral('X');   // 10
fromRomanNumeral('XI');  // null (fora do intervalo)
```

#### Integração nos Componentes
```typescript
import { toRomanNumeral } from '@/lib/utils/roman-numerals';

// Em badges de nível
<Badge variant="outline">Nível {toRomanNumeral(barter.level)}</Badge>

// Em requisitos de quest
<span>Nível mínimo: {toRomanNumeral(quest.minPlayerLevel)}</span>

// Em requisitos de trader
{requirement.type === 'loyaltyLevel' && (
  <span>Loyalty {toRomanNumeral(requirement.value)}</span>
)}
```

## Versionamento de API

### URL Versioning
```
/api/v1/search
/api/v2/search
```

### Header Versioning
```
Accept: application/vnd.secret-tarkov.v1+json
API-Version: 2023-10-01
```

### Backward Compatibility
- Versões antigas suportadas por 12 meses
- Deprecation warnings em headers
- Migration guides na documentação

## Conclusão

Esta documentação fornece uma visão completa de todas as APIs e endpoints utilizados no sistema Secret Tarkov. Para implementações específicas, consulte:

- Código fonte dos endpoints em `src/app/api/`
- Documentação da API externa do Tarkov.dev
- Documentação do Supabase
- Testes de integração em `src/__tests__/api/`