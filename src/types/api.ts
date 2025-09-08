// Language Support Types
export type SupportedLanguage = 'cs' | 'de' | 'en' | 'es' | 'fr' | 'hu' | 'it' | 'ja' | 'ko' | 'pl' | 'pt' | 'ro' | 'ru' | 'sk' | 'tr' | 'zh';

export interface LanguageConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
}

// API Configuration Types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  language?: SupportedLanguage;
}

// GraphQL Types
export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
}

export interface GraphQLError {
  message: string;
  locations?: {
    line: number;
    column: number;
  }[];
  path?: (string | number)[];
  extensions?: Record<string, any>;
}

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
  language?: SupportedLanguage;
}

// Tarkov.dev API Types
export interface TarkovDevResponse<T> {
  data: T;
}

export interface TarkovDevItemsQuery {
  items: {
    id: string;
    name: string;
    shortName: string;
    description?: string;
    weight: number;
    basePrice: number;
    avg24hPrice?: number;
    updated?: string;
    types: string[];
    width: number;
    height: number;
    iconLink?: string;
    gridImageLink?: string;
    inspectImageLink?: string;
    image512pxLink?: string;
    image8xLink?: string;
    imageLink?: string;
    imageLinkFallback?: string;
    wikiLink?: string;
    fleaMarketFee?: number;
    sellFor: {
      source: string;
      price: number;
      currency: string;
      requirements?: {
        type: string;
        value: number;
      }[];
    }[];
    buyFor: {
      source: string;
      price: number;
      currency: string;
      requirements?: {
        type: string;
        value: number;
      }[];
    }[];
  }[];
}

export interface TarkovDevQuestsQuery {
  tasks: {
    id: string;
    name: string;
    trader: {
      id: string;
      name: string;
      normalizedName: string;
    };
    map?: {
      id: string;
      name: string;
      normalizedName: string;
    };
    experience: number;
    wikiLink?: string;
    minPlayerLevel: number;
    taskRequirements: {
      task: {
        id: string;
        name: string;
      };
      status: string[];
    }[];
    traderLevelRequirements: {
      trader: {
        id: string;
        name: string;
        normalizedName: string;
      };
      level: number;
    }[];
    objectives: {
      id: string;
      description: string;
      type: string;
      maps?: {
        id: string;
        name: string;
        normalizedName: string;
      }[];
      optional: boolean;
    }[];
    startRewards?: {
      traderStanding?: {
        trader: {
          id: string;
          name: string;
          normalizedName: string;
        };
        standing: number;
      }[];
      experience?: number;
      items?: {
        item: {
          id: string;
          name: string;
          shortName: string;
        };
        count: number;
      }[];
    };
    finishRewards?: {
      traderStanding?: {
        trader: {
          id: string;
          name: string;
          normalizedName: string;
        };
        standing: number;
      }[];
      experience?: number;
      items?: {
        item: {
          id: string;
          name: string;
          shortName: string;
        };
        count: number;
      }[];
    };
  }[];
}

export interface TarkovDevHideoutQuery {
  hideoutStations: {
    id: string;
    name: string;
    normalizedName: string;
    levels: {
      level: number;
      constructionTime: number;
      description: string;
      itemRequirements: {
        item: {
          id: string;
          name: string;
          shortName: string;
        };
        count: number;
        quantity: number;
      }[];
      stationLevelRequirements: {
        station: {
          id: string;
          name: string;
          normalizedName: string;
        };
        level: number;
      }[];
      skillRequirements: {
        name: string;
        level: number;
      }[];
      traderRequirements: {
        trader: {
          id: string;
          name: string;
          normalizedName: string;
        };
        level: number;
      }[];
      crafts: {
        id: string;
        station: {
          id: string;
          name: string;
          normalizedName: string;
        };
        level: number;
        duration: number;
        requiredItems: {
          item: {
            id: string;
            name: string;
            shortName: string;
          };
          count: number;
          quantity: number;
        }[];
        rewardItems: {
          item: {
            id: string;
            name: string;
            shortName: string;
          };
          count: number;
        }[];
      }[];
    }[];
  }[];
}

// Tarkov Market API Types
export interface TarkovMarketResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface TarkovMarketItem {
  uid: string;
  name: string;
  tags: string[];
  shortName: string;
  price: number;
  basePrice: number;
  avg24hPrice: number;
  traderName: string;
  traderPrice: number;
  traderPriceCur: string;
  updated: string;
  slots: number;
  diff24h: number;
  diff7d: number;
  icon: string;
  link: string;
  wikiLink: string;
  img: string;
  imgBig: string;
  bsgId: string;
  isFunctional: boolean;
  reference: string;
}

export interface TarkovMarketPriceHistory {
  uid: string;
  prices: {
    timestamp: number;
    price: number;
  }[];
}

// Internal API Types
export interface SearchParams {
  query?: string;
  category?: string;
  trader?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'updated' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  language?: SupportedLanguage;
  filters?: {
    types?: string[];
    fleaMarketOnly?: boolean;
    traderOnly?: boolean;
    inStock?: boolean;
  };
}

export interface SearchResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: string[];
    traders: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  strategy: 'LRU' | 'FIFO' | 'TTL';
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  path?: string;
  method?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: number;
  signature: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  timestamp: number;
}

export interface AnalyticsConfig {
  trackPageViews: boolean;
  trackClicks: boolean;
  trackSearches: boolean;
  trackErrors: boolean;
  anonymizeIp: boolean;
}

// Images API Types
export interface ImageRequest {
  type: 'items' | 'traders' | 'quests' | 'maps' | 'skills' | 'all';
  ids?: string[];
  names?: string[];
  limit?: number;
  imageTypes?: ImageType[];
}

export type ImageType = 
  // Items
  | 'icon' | 'img' | 'imgBig' | 'iconLink' | 'gridImageLink' 
  | 'inspectImageLink' | 'image512pxLink' | 'image8xLink' 
  | 'imageLink' | 'imageLinkFallback'
  // Traders
  | 'avatar' | 'image4xLink' | 'traderAvatar'
  // Quests/Tasks
  | 'taskImage' | 'taskImageLink' | 'image' | 'mapImage'
  // Maps
  | 'thumbnail' | 'mapImage'
  // Skills
  | 'skillImage';

export interface ImageData {
  id: string;
  name: string;
  type: 'item' | 'trader' | 'quest' | 'map' | 'skill';
  images: {
    [key in ImageType]?: string;
  };
}

export interface ImagesResponse {
  success: boolean;
  data: ImageData[];
  metadata: {
    total: number;
    type: string;
    processingTime: number;
    cached: boolean;
  };
  error?: string;
}

export interface ItemImages {
  icon?: string;
  img?: string;
  imgBig?: string;
  iconLink?: string;
  gridImageLink?: string;
  inspectImageLink?: string;
  image512pxLink?: string;
  image8xLink?: string;
  imageLink?: string;
  imageLinkFallback?: string;
}

export interface TraderImages {
  avatar?: string;
  imageLink?: string;
  image4xLink?: string;
}

export interface QuestImages {
  image?: string;
  mapImage?: string;
}

export interface MapImages {
  mapImage?: string;
  thumbnail?: string;
}

export interface SkillImages {
  skillImage?: string;
}