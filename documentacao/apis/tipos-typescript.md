# Documentação: Tipos TypeScript do Sistema

## Visão Geral

Esta documentação detalha todos os tipos TypeScript utilizados no sistema Secret Tarkov, organizados por módulo e funcionalidade. Os tipos garantem type safety e melhor experiência de desenvolvimento.

## Tipos de API e Dados Externos

### Tarkov.dev API Types

```typescript
// Tipos base da API do Tarkov.dev
interface TarkovItem {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  category?: ItemCategory;
  rarity: ItemRarity;
  basePrice: number;
  fleaMarketFee?: number;
  image?: string;
  iconLink?: string;
  wikiLink?: string;
  types: string[];
  weight: number;
  width: number;
  height: number;
  backgroundColor?: string;
}

// Tipos de Traders
interface Trader {
  id: string;
  name: string;
  normalizedName: string;
  imageLink?: string;
  image4xLink?: string;
}

interface TraderPrice {
  price: number;
  currency: string;
  priceRUB: number;
  vendor: Trader;
}

interface TraderLevelRequirement {
  level: number;
  trader: Trader;
}

interface TraderStandingReward {
  standing: number;
  trader: Trader;
}

interface TraderRequirement {
  trader: Trader;
  loyaltyLevel: number;
}

interface ItemCategory {
  id: string;
  name: string;
  normalizedName: string;
}

type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'not_exist';

// Tipos de resposta da API GraphQL
interface TarkovApiResponse {
  data: {
    items: TarkovItem[];
  };
  errors?: GraphQLError[];
}

interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
}
```

### Supabase Types

```typescript
// Tipos do banco de dados Supabase
interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      watchlists: {
        Row: WatchlistRow;
        Insert: WatchlistInsert;
        Update: WatchlistUpdate;
      };
      search_history: {
        Row: SearchHistoryRow;
        Insert: SearchHistoryInsert;
        Update: SearchHistoryUpdate;
      };
    };
  };
}

interface UserRow {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

type UserPlan = 'free' | 'plus' | 'premium';

interface WatchlistRow {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

interface SearchHistoryRow {
  id: string;
  user_id: string;
  query: string;
  search_type: SearchType;
  results_count: number;
  created_at: string;
}

type SearchType = 'text' | 'image' | 'advanced';
```

## Tipos de Busca por Imagem

### Core Image Search Types

```typescript
// Resultado de busca por imagem
interface ImageSearchResult {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  category?: string;
  rarity: ItemRarity;
  basePrice: number;
  fleaMarketFee?: number;
  image?: string;
  iconLink?: string;
  wikiLink?: string;
  types: string[];
  weight: number;
  width: number;
  confidence: number;
  similarity: number;
  metadata?: ImageSearchMetadata;
}

interface ImageSearchMetadata {
  processingTime: number;
  algorithm: string;
  hasMultipleItems?: boolean;
  regionDetected?: boolean;
  manualSelection?: boolean;
  [key: string]: any;
}

// Parâmetros de busca por imagem
interface ImageSearchParams {
  maxResults?: number;
  minConfidence?: number;
  algorithm?: ImageSearchAlgorithm;
  enableRegionDetection?: boolean;
  enableMultiItemDetection?: boolean;
  filters?: ImageSearchFilters;
}

type ImageSearchAlgorithm = 'intelligent' | 'mock' | 'advanced';

interface ImageSearchFilters {
  categories?: string[];
  rarity?: ItemRarity[];
  priceRange?: {
    min: number;
    max: number;
  };
  types?: string[];
}
```

### Intelligent Item Matcher Types

```typescript
// Resultado de correspondência inteligente
interface MatchResult {
  item: TarkovItem;
  confidence: number;
  similarity: number;
  region?: DetectedRegion;
  features?: ExtractedFeatures;
  metadata?: MatchMetadata;
}

interface MultiItemResult {
  items: MatchResult[];
  processingTime: number;
  algorithm: string;
  metadata: {
    totalRegions: number;
    successfulMatches: number;
    averageConfidence: number;
    hasMultipleItems: boolean;
  };
}

// Região detectada na imagem
interface DetectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: RegionType;
}

type RegionType = 'item' | 'inventory_slot' | 'container' | 'unknown';

// Características extraídas
interface ExtractedFeatures {
  colorHistogram: number[];
  edgeFeatures: number[];
  textureFeatures: number[];
  shapeFeatures: number[];
  dominantColors: string[];
  averageBrightness: number;
  contrast: number;
  saturation: number;
}

interface MatchMetadata {
  processingSteps: ProcessingStep[];
  performance: PerformanceMetrics;
  debugInfo?: DebugInfo;
}

interface ProcessingStep {
  name: string;
  duration: number;
  success: boolean;
  details?: any;
}

interface PerformanceMetrics {
  totalTime: number;
  imageProcessingTime: number;
  featureExtractionTime: number;
  searchTime: number;
  memoryUsage?: number;
}
```

### Advanced Image Processing Types

```typescript
// Configurações de processamento
interface ImageProcessingConfig {
  enablePreprocessing: boolean;
  enableRegionDetection: boolean;
  enableFeatureExtraction: boolean;
  enableMultiItemDetection: boolean;
  qualityThreshold: number;
  maxRegions: number;
  minRegionSize: number;
}

// Resultado de processamento
interface ProcessingResult {
  processedImage: ProcessedImage;
  regions: DetectedRegion[];
  features: ExtractedFeatures[];
  metadata: ProcessingMetadata;
}

interface ProcessedImage {
  data: ImageData;
  width: number;
  height: number;
  format: ImageFormat;
  quality: number;
}

type ImageFormat = 'jpeg' | 'png' | 'webp' | 'canvas';

interface ProcessingMetadata {
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  compressionRatio: number;
  processingSteps: string[];
  qualityScore: number;
}
```

## Tipos de Cache e Performance

### Cache Types

```typescript
// Cache de busca
interface SearchCacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
  metadata?: CacheMetadata;
}

interface CacheMetadata {
  source: CacheSource;
  version: string;
  tags: string[];
  priority: CachePriority;
}

type CacheSource = 'api' | 'database' | 'computation' | 'external';
type CachePriority = 'low' | 'medium' | 'high' | 'critical';

// Configurações de cache
interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enablePersistence: boolean;
  compressionEnabled: boolean;
  evictionPolicy: EvictionPolicy;
}

type EvictionPolicy = 'lru' | 'lfu' | 'fifo' | 'ttl';

// Estatísticas de cache
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}
```

### Performance Types

```typescript
// Métricas de performance
interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
}

// Configurações de performance
interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number;
  maxMetricsHistory: number;
  alertThresholds: AlertThresholds;
}

interface AlertThresholds {
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}
```

## Tipos de UI e Componentes

### Component Props Types

```typescript
// Props de componentes de busca
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface ImageSelectorProps {
  onImageSelect: (file: File) => void;
  onImageUpload: (imageData: string) => void;
  acceptedFormats?: string[];
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
}

interface ItemCardProps {
  item: TarkovItem | ImageSearchResult;
  variant?: CardVariant;
  showDetails?: boolean;
  onSelect?: (item: TarkovItem) => void;
  onAddToWatchlist?: (itemId: string) => void;
  className?: string;
}

type CardVariant = 'default' | 'compact' | 'detailed' | 'grid';

// Props de layout
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

interface HeaderProps {
  user?: User;
  onSearch?: (query: string) => void;
  onAuthAction?: (action: AuthAction) => void;
}

type AuthAction = 'login' | 'logout' | 'register' | 'profile';
```

### State Management Types

```typescript
// Estados de autenticação
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// Estados de busca
interface SearchState {
  query: string;
  results: TarkovItem[];
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  pagination: PaginationState;
}

interface SearchFilters {
  categories: string[];
  rarity: ItemRarity[];
  priceRange: PriceRange;
  types: string[];
  inStock: boolean;
}

interface PriceRange {
  min: number;
  max: number;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Estados de busca por imagem
interface ImageSearchState {
  image: File | null;
  imageData: string | null;
  results: ImageSearchResult[];
  loading: boolean;
  error: string | null;
  params: ImageSearchParams;
  metadata: ImageSearchMetadata | null;
}
```

## Tipos de Hooks e Utilitários

### Hook Return Types

```typescript
// useAuth hook
interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

// useImageSearch hook
interface UseImageSearchReturn {
  searchByImage: (file: File, params?: ImageSearchParams) => Promise<ImageSearchResult[]>;
  searchByImageData: (imageData: string, params?: ImageSearchParams) => Promise<ImageSearchResult[]>;
  results: ImageSearchResult[];
  loading: boolean;
  error: string | null;
  metadata: ImageSearchMetadata | null;
  clearResults: () => void;
  clearError: () => void;
}

// useTarkov hook
interface UseTarkovReturn {
  searchItems: (query: string, filters?: SearchFilters) => Promise<TarkovItem[]>;
  getItem: (id: string) => Promise<TarkovItem | null>;
  getCategories: () => Promise<ItemCategory[]>;
  items: TarkovItem[];
  loading: boolean;
  error: string | null;
  cache: CacheStats;
}

// useSearchCache hook
interface UseSearchCacheReturn<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  stats: CacheStats;
  config: CacheConfig;
}
```

### Utility Types

```typescript
// Tipos de utilitários
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
type Nullable<T> = T | null;
type Maybe<T> = T | undefined;

// Tipos de eventos
interface CustomEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}

// Tipos de configuração
interface AppConfig {
  api: ApiConfig;
  auth: AuthConfig;
  cache: CacheConfig;
  performance: PerformanceConfig;
  features: FeatureFlags;
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: RateLimitConfig;
}

interface AuthConfig {
  sessionTimeout: number;
  refreshThreshold: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

interface RateLimitConfig {
  requests: number;
  window: number;
  skipSuccessfulRequests: boolean;
}

interface FeatureFlags {
  imageSearch: boolean;
  advancedFilters: boolean;
  realTimeUpdates: boolean;
  analytics: boolean;
  betaFeatures: boolean;
}
```

## Tipos de Erro e Validação

### Error Types

```typescript
// Tipos de erro customizados
class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: any;
  timestamp: number;

  constructor(message: string, code: ErrorCode, statusCode = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = Date.now();
  }
}

type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'PROCESSING_ERROR'
  | 'CACHE_ERROR'
  | 'UNKNOWN_ERROR';

// Tipos de validação
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Schema de validação
interface ValidationSchema {
  [field: string]: FieldValidation;
}

interface FieldValidation {
  required?: boolean;
  type?: FieldType;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
```

## Tipos de Teste

### Testing Types

```typescript
// Tipos para testes
interface TestContext {
  user?: User;
  session?: Session;
  mockData?: any;
  config?: Partial<AppConfig>;
}

interface MockApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  delay?: number;
}

interface TestScenario {
  name: string;
  setup: () => Promise<void>;
  execute: () => Promise<any>;
  verify: (result: any) => void;
  cleanup: () => Promise<void>;
}
```

## Utilitários de Sistema

### Números Romanos

```typescript
// Utilitários para conversão de números romanos
// Arquivo: src/lib/utils/roman-numerals.ts

/**
 * Converte um número (1-10) para algarismo romano
 * @param num - Número a ser convertido (1-10)
 * @returns String com o algarismo romano correspondente
 * @throws Error se o número estiver fora do intervalo suportado
 */
function toRomanNumeral(num: number): string;

/**
 * Converte um algarismo romano para número
 * @param roman - Algarismo romano a ser convertido
 * @returns Número correspondente ou null se inválido
 */
function fromRomanNumeral(roman: string): number | null;

// Mapeamento de números para romanos (1-10)
type RomanNumeralMap = {
  [key: number]: string;
};

// Mapeamento reverso de romanos para números
 type ReverseRomanNumeralMap = {
   [key: string]: number;
 };
 ```
 
 ## Tipos de Mock e Testes
 
 ```typescript
 // Tipos de mock
interface MockImageSearchResult extends Omit<ImageSearchResult, 'confidence' | 'similarity'> {
  confidence: number;
  similarity: number;
  _isMock: true;
}

interface MockTarkovItem extends TarkovItem {
  _isMock: true;
  _mockId: string;
}
```

## Conclusão

Esta documentação de tipos TypeScript fornece uma visão completa de todas as interfaces, tipos e estruturas de dados utilizadas no sistema Secret Tarkov. Estes tipos garantem:

1. **Type Safety**: Prevenção de erros em tempo de compilação
2. **IntelliSense**: Melhor experiência de desenvolvimento
3. **Documentação**: Tipos servem como documentação viva
4. **Refatoração**: Mudanças seguras e rastreáveis
5. **Manutenibilidade**: Código mais fácil de entender e manter

Para implementações específicas, consulte os arquivos de tipos correspondentes:
- `src/types/tarkov.ts`
- `src/types/api.ts`
- `src/types/database.ts`
- `src/types/user.ts`
- `src/types/image-search.ts`