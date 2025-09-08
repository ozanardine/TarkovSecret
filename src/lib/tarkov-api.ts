import { request, gql } from 'graphql-request';
import axios from 'axios';
import { 
  TarkovItem, 
  TarkovQuest, 
  HideoutStation, 
  Barter, 
  Ammo, 
  Armor,
  ArmorMaterial,
  Weapon,
  MarketData,
  PriceHistory,
  Skill,
  Trader,
  Craft
} from '@/types/tarkov';
import {
  TarkovDevResponse,
  TarkovDevItemsQuery,
  TarkovDevQuestsQuery,
  TarkovDevHideoutQuery,
  TarkovMarketResponse,
  TarkovMarketItem,
  TarkovMarketPriceHistory,
  SearchParams,
  SearchResponse
} from '@/types/api';
import { SupportedLanguage } from '@/contexts/LanguageContext';

// GraphQL Response Types
interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

// Specific API Response Types
interface ItemsResponse {
  items: Array<{
    id: string;
    name: string;
    shortName: string;
    description?: string;
    weight: number;
    basePrice: number;
    avg24hPrice?: number;
    changeLast48hPercent?: number;
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
    link?: string;
    fleaMarketFee?: number;
    sellFor?: Array<{
      source: string;
      price: number;
      currency: string;
      requirements?: Array<{
        type: string;
        value: number;
      }>;
    }>;
    buyFor?: Array<{
      source: string;
      price: number;
      currency: string;
      requirements?: Array<{
        type: string;
        value: number;
      }>;
    }>;
  }>;
}

interface ItemResponse {
  item: {
    id: string;
    name: string;
    shortName: string;
    description?: string;
    weight: number;
    basePrice: number;
    avg24hPrice?: number;
    changeLast48hPercent?: number;
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
    link?: string;
    fleaMarketFee?: number;
    sellFor?: Array<{
      source: string;
      price: number;
      currency: string;
      requirements?: Array<{
        type: string;
        value: number;
      }>;
    }>;
    buyFor?: Array<{
      source: string;
      price: number;
      currency: string;
      requirements?: Array<{
        type: string;
        value: number;
      }>;
    }>;
  } | null;
}

interface TasksResponse {
  tasks: Array<{
    id: string;
    name: string;
    normalizedName?: string;
    trader: {
      id: string;
      name: string;
      normalizedName: string;
      imageLink?: string;
    };
    map?: {
      id: string;
      name: string;
      normalizedName: string;
    } | null;
    experience: number;
    wikiLink?: string | null;
    taskImageLink?: string | null;
    minPlayerLevel?: number | null;
    taskRequirements?: Array<{
      task: {
        id: string;
        name: string;
      };
      status: string;
    }>;
    traderRequirements?: unknown[];
    traderLevelRequirements?: unknown[];
    objectives: Array<{
      id: string;
      description: string;
      type: string;
      optional: boolean;
      maps?: Array<{
        id: string;
        name: string;
        normalizedName: string;
      }>;
    }>;
    failConditions?: unknown[];
    startRewards?: {
      skillLevelReward?: Array<{
        name: string;
        level: number;
      }>;
      traderStanding?: Array<{
        trader: {
          name: string;
        };
        standing: number;
      }>;
      items?: Array<{
        item: {
          id: string;
          name: string;
          shortName: string;
          iconLink?: string;
        };
        count: number;
      }>;
      offerUnlock?: Array<{
        trader: {
          name: string;
        };
        level: number;
        item: {
          name: string;
          shortName: string;
        };
      }>;
    } | null;
    finishRewards?: {
      skillLevelReward?: Array<{
        name: string;
        level: number;
      }>;
      traderStanding?: Array<{
        trader: {
          name: string;
        };
        standing: number;
      }>;
      items?: Array<{
        item: {
          id: string;
          name: string;
          shortName: string;
          iconLink?: string;
        };
        count: number;
      }>;
      offerUnlock?: Array<{
        trader: {
          name: string;
        };
        level: number;
        item: {
          name: string;
          shortName: string;
        };
      }>;
    } | null;
    failureOutcome?: unknown | null;
    restartable: boolean;
    kappaRequired: boolean;
    lightkeeperRequired: boolean;
    tarkovDataId?: string | null;
    availableDelaySecondsMin?: number | null;
    availableDelaySecondsMax?: number | null;
    descriptionMessageId?: string | null;
    startMessageId?: string | null;
    successMessageId?: string | null;
    failMessageId?: string | null;
    factionName?: string | null;
  }>;
}

interface HideoutStationsResponse {
  hideoutStations: Array<{
    id: string;
    name: string;
    normalizedName: string;
    levels: Array<{
      level: number;
      constructionTime: number;
      description: string;
      itemRequirements: Array<{
        item: {
          id: string;
          name: string;
          shortName: string;
          iconLink?: string;
        };
        count: number;
        quantity: number;
      }>;
      stationLevelRequirements: Array<{
        station: {
          id: string;
          name: string;
          normalizedName: string;
        };
        level: number;
      }>;
      skillRequirements: Array<{
        name: string;
        level: number;
      }>;
      traderRequirements: Array<{
        trader: {
          id: string;
          name: string;
          normalizedName: string;
        };
        level: number;
      }>;
      crafts: Array<{
        id: string;
        station: {
          id: string;
          name: string;
          normalizedName: string;
        };
        level: number;
        duration: number;
        requiredItems: Array<{
          item: {
            id: string;
            name: string;
            shortName: string;
            iconLink?: string;
          };
          count: number;
          quantity: number;
        }>;
        rewardItems: Array<{
          item: {
            id: string;
            name: string;
            shortName: string;
            iconLink?: string;
          };
          count: number;
        }>;
      }>;
    }>;
  }>;
}

interface CraftsResponse {
  crafts: Array<{
    id: string;
    station: {
      id: string;
      name: string;
      normalizedName: string;
    };
    level: number;
    duration: number;
    requiredItems: Array<{
      item: {
        id: string;
        name: string;
        shortName: string;
        iconLink?: string;
      };
      count: number;
      quantity: number;
    }>;
    rewardItems: Array<{
      item: {
        id: string;
        name: string;
        shortName: string;
        iconLink?: string;
      };
      count: number;
    }>;
  }>;
}

interface BartersResponse {
  barters: Array<{
    id: string;
    trader: {
      id: string;
      name: string;
      normalizedName: string;
    };
    level: number;
    taskUnlock?: {
      id: string;
      name: string;
    };
    requiredItems: Array<{
      item: {
        id: string;
        name: string;
        shortName: string;
        iconLink?: string;
      };
      count: number;
      quantity: number;
    }>;
    rewardItems: Array<{
      item: {
        id: string;
        name: string;
        shortName: string;
        iconLink?: string;
      };
      count: number;
    }>;
  }>;
}

const TARKOV_API_URL = 'https://api.tarkov.dev/graphql';
const TARKOV_MARKET_API_URL = 'https://tarkov-market.com/api';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Current language for API calls (will be set by hooks)
let currentLanguage: SupportedLanguage = 'pt';

// Helper function to check cache
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

// Helper function to set cache
function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Function to set current language
export function setApiLanguage(language: SupportedLanguage): void {
  currentLanguage = language;
}

// --- GraphQL Fragments for code reuse and maintainability ---
const ItemFieldsFragment = gql`
  fragment ItemFields on Item {
    id
    name
    shortName
    description
    weight
    basePrice
    avg24hPrice
    updated
    types
    width
    height
    iconLink
    gridImageLink
    inspectImageLink
    image512pxLink
    image8xLink
    imageLink
    imageLinkFallback
    wikiLink
    fleaMarketFee
    sellFor {
      source
      price
      currency
      requirements {
        type
        value
      }
    }
    buyFor {
      source
      price
      currency
      requirements {
        type
        value
      }
    }
  }
`;

// Tarkov.dev API service
export const tarkovDevApi = {
  // Get all items (Refactored to use Fragment)
  async getItems(limit?: number): Promise<TarkovItem[]> {
    const cacheKey = `items_${limit || 'all'}_${currentLanguage}`;
    const cached = getCachedData<TarkovItem[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetItems($limit: Int, $lang: LanguageCode) {
        items(limit: $limit, lang: $lang) {
          ...ItemFields
        }
      }
      ${ItemFieldsFragment}
    `;

    try {
      const response = await request<ItemsResponse>(
        TARKOV_API_URL,
        query,
        { limit, lang: currentLanguage }
      );

      if (!response?.items) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      const items = response.items.map((item) => ({
        ...item,
        slots: item.width * item.height,
        icon: item.iconLink,
        image: item.image512pxLink,
        sellFor: item.sellFor || [],
        buyFor: item.buyFor || [],
      }));

      setCachedData(cacheKey, items);
      return items;
    } catch (error) {
      console.error('Error fetching items from Tarkov.dev:', error);
      throw new Error('Failed to fetch items');
    }
  },

  // Get item by ID (Refactored to use Fragment)
  async getItemById(id: string): Promise<TarkovItem | null> {
    const cacheKey = `item_${id}_${currentLanguage}`;
    const cached = getCachedData<TarkovItem>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetItem($id: ID!, $lang: LanguageCode) {
        item(id: $id, lang: $lang) {
          ...ItemFields
          changeLast48hPercent
          link
        }
      }
      ${ItemFieldsFragment}
    `;

    try {
      const response = await request<ItemResponse>(
        TARKOV_API_URL,
        query,
        { id, lang: currentLanguage }
      );

      if (!response?.item) return null;

      const item = {
        ...response.item,
        slots: response.item.width * response.item.height,
        icon: response.item.iconLink,
        image: response.item.image512pxLink,
        sellFor: response.item.sellFor || [],
        buyFor: response.item.buyFor || [],
      };

      setCachedData(cacheKey, item);
      return item;
    } catch (error) {
      console.error('Error fetching item by ID from Tarkov.dev:', error);
      return null;
    }
  },

  // Search items (Refactored to use Fragment)
  async searchItems(searchTerm: string, limit = 50): Promise<TarkovItem[]> {
    const cacheKey = `search_${searchTerm}_${limit}_${currentLanguage}`;
    const cached = getCachedData<TarkovItem[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query SearchItems($name: String!, $limit: Int, $lang: LanguageCode) {
        items(name: $name, limit: $limit, lang: $lang) {
          ...ItemFields
        }
      }
      ${ItemFieldsFragment}
    `;

    try {
      const response = await request<ItemsResponse>(
        TARKOV_API_URL,
        query,
        { name: searchTerm, limit, lang: currentLanguage }
      );

      if (!response?.items) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      const items = response.items.map((item) => ({
        ...item,
        slots: item.width * item.height,
        icon: item.iconLink,
        image: item.image512pxLink,
        sellFor: item.sellFor || [],
        buyFor: item.buyFor || [],
      }));

      setCachedData(cacheKey, items);
      return items;
    } catch (error) {
      console.error('Error searching items from Tarkov.dev:', error);
      throw new Error('Failed to search items');
    }
  },

  // Get quests (Validated against schema)
  async getQuests(): Promise<TarkovQuest[]> {
    const cacheKey = `quests_${currentLanguage}`;
    const cached = getCachedData<TarkovQuest[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetQuests($lang: LanguageCode) {
        tasks(lang: $lang) {
          id
          name
          trader {
            id
            name
            normalizedName
            imageLink
          }
          map {
            id
            name
            normalizedName
          }
          experience
          wikiLink
          taskImageLink
          minPlayerLevel
          kappaRequired
          lightkeeperRequired
          objectives {
            id
            description
            type
            optional
            maps {
              id
              name
              normalizedName
            }
            ... on TaskObjectiveItem {
              item {
                id
                name
                shortName
                iconLink
              }
              items {
                id
                name
                shortName
                iconLink
              }
              count
              foundInRaid
            }
            ... on TaskObjectiveBuildItem {
              item {
                id
                name
                shortName
                iconLink
              }
            }
            ... on TaskObjectiveQuestItem {
              questItem {
                id
                name
                shortName
                iconLink
              }
            }
          }
          startRewards {
            skillLevelReward {
              name
              level
            }
            traderStanding {
              trader {
                name
              }
              standing
            }
            items {
              item {
                id
                name
                shortName
                iconLink
              }
              count
            }
            offerUnlock {
              trader {
                name
              }
              level
              item {
                name
                shortName
              }
            }
          }
          finishRewards {
            skillLevelReward {
              name
              level
            }
            traderStanding {
              trader {
                name
              }
              standing
            }
            items {
              item {
                id
                name
                shortName
                iconLink
              }
              count
            }
            offerUnlock {
              trader {
                name
              }
              level
              item {
                name
                shortName
              }
            }
          }
          restartable
        }
      }
    `;

    try {
      console.log('Attempting to fetch quests from Tarkov.dev API...');
      
      const response = await request<TasksResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );
      
      if (!response?.tasks) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      console.log(`Successfully fetched ${response.tasks.length} quests`);

      const quests = response.tasks.map((task) => ({
        // Basic required fields
        id: task.id,
        name: task.name,
        normalizedName: task.name.toLowerCase().replace(/\s+/g, '-'),
        trader: task.trader,
        map: task.map || undefined,
        experience: task.experience || 0,
        wikiLink: task.wikiLink || undefined,
        taskImageLink: task.taskImageLink || undefined,
        minPlayerLevel: task.minPlayerLevel || undefined,
        
        // Arrays with proper data
        taskRequirements: task.taskRequirements || [],
        traderRequirements: [],
        traderLevelRequirements: [],
        objectives: task.objectives || [],
        failConditions: [],
        
        // Rewards with actual data
        startRewards: task.startRewards || undefined,
        finishRewards: task.finishRewards || undefined,
        failureOutcome: undefined,
        
        // Boolean flags
        restartable: task.restartable || false,
        kappaRequired: task.kappaRequired || false,
        lightkeeperRequired: task.lightkeeperRequired || false,
        
        // Optional fields
        tarkovDataId: undefined,
        availableDelaySecondsMin: undefined,
        availableDelaySecondsMax: undefined,
        descriptionMessageId: undefined,
        startMessageId: undefined,
        successMessageId: undefined,
        failMessageId: undefined,
        factionName: undefined,
      }));

      setCachedData(cacheKey, quests as any);
      return quests as any;
    } catch (error) {
      console.error('Error fetching quests from Tarkov.dev:', error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      // Re-throw error - no mock data allowed per user requirements
      throw error;
    }
  },

  // Get hideout stations (Validated against schema)
  async getHideoutStations(): Promise<HideoutStation[]> {
    const cacheKey = `hideout_stations_${currentLanguage}`;
    const cached = getCachedData<HideoutStation[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetHideoutStations($lang: LanguageCode) {
        hideoutStations(lang: $lang) {
          id
          name
          normalizedName
          levels {
            level
            constructionTime
            description
            itemRequirements {
              item {
                id
                name
                shortName
                iconLink
              }
              count
              quantity
            }
            stationLevelRequirements {
              station {
                id
                name
                normalizedName
              }
              level
            }
            skillRequirements {
              name
              level
            }
            traderRequirements {
              trader {
                id
                name
                normalizedName
              }
              level
            }
            crafts {
              id
              station {
                id
                name
                normalizedName
              }
              level
              duration
              requiredItems {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
                quantity
              }
              rewardItems {
                item {
                  id
                  name
                  shortName
                  iconLink
                }
                count
              }
            }
          }
        }
      }
    `;

    try {
      const response = await request<HideoutStationsResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.hideoutStations) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      setCachedData(cacheKey, response.hideoutStations as any);
      return response.hideoutStations as any;
    } catch (error) {
      console.error('Error fetching hideout stations from Tarkov.dev:', error);
      throw new Error('Failed to fetch hideout stations');
    }
  },

  // Get crafts that use a specific item (Validated against schema)
  async getCraftsForItem(itemId: string): Promise<Craft[]> {
    const cacheKey = `crafts_for_item_${itemId}_${currentLanguage}`;
    const cached = getCachedData<Craft[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetCraftsForItem($lang: LanguageCode) {
        crafts(lang: $lang) {
          id
          station {
            id
            name
            normalizedName
          }
          level
          duration
          requiredItems {
            item {
              id
              name
              shortName
              iconLink
            }
            count
            quantity
          }
          rewardItems {
            item {
              id
              name
              shortName
              iconLink
            }
            count
          }
        }
      }
    `;

    try {
      const response = await request<CraftsResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.crafts) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      // Filter crafts that use the specific item
      const craftsForItem = response.crafts.filter((craft) =>
        craft.requiredItems.some((req) => req.item.id === itemId) ||
        craft.rewardItems.some((reward) => reward.item.id === itemId)
      );

      setCachedData(cacheKey, craftsForItem as any);
      return craftsForItem as any;
    } catch (error) {
      console.error('Error fetching crafts from Tarkov.dev:', error);
      throw new Error('Failed to fetch crafts');
    }
  },

  // Get barters (Validated against schema)
  async getBarters(): Promise<Barter[]> {
    const cacheKey = `barters_${currentLanguage}`;
    const cached = getCachedData<Barter[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetBarters($lang: LanguageCode) {
        barters(lang: $lang) {
          id
          trader {
            id
            name
            normalizedName
          }
          level
          taskUnlock {
            id
            name
          }
          requiredItems {
            item {
              id
              name
              shortName
              iconLink
            }
            count
            quantity
          }
          rewardItems {
            item {
              id
              name
              shortName
              iconLink
            }
            count
          }
        }
      }
    `;

    try {
      const response = await request<BartersResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.barters) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      setCachedData(cacheKey, response.barters as any);
      return response.barters as any;
    } catch (error) {
      console.error('Error fetching barters from Tarkov.dev:', error);
      throw new Error('Failed to fetch barters');
    }
  },

  // Get quests that use a specific item as REQUIRED and SPECIFIC (not optional or generic objectives)
  async getQuestsForItem(itemId: string): Promise<TarkovQuest[]> {
    const cacheKey = `quests_for_item_${itemId}_${currentLanguage}`;
    const cached = getCachedData<TarkovQuest[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetQuestsForItem($lang: LanguageCode) {
        tasks(lang: $lang) {
          id
          name
          trader {
            id
            name
            normalizedName
          }
          minPlayerLevel
          objectives {
            id
            description
            type
            optional
            ... on TaskObjectiveItem {
              item {
                id
                name
                shortName
              }
              items {
                id
                name
                shortName
              }
              count
              foundInRaid
            }
          }
          startRewards {
            items {
              item {
                id
                name
                shortName
              }
              count
            }
          }
          finishRewards {
            items {
              item {
                id
                name
                shortName
              }
              count
            }
          }
        }
      }
    `;

    try {
      const response = await request<TasksResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.tasks) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      // Filter quests that use the specific item as REQUIRED (not optional)
      const questsForItem = response.tasks.filter((task) => {
        // Check objectives - only include if item is REQUIRED (not optional) and SPECIFIC
        const hasRequiredSpecificObjective = task.objectives.some((obj) => {
          // Skip if objective is optional
          if (obj.optional) return false;
          
          // Skip generic objectives that don't specify the exact item
          if (obj.type === 'TaskObjectiveTraderStanding' || 
              obj.type === 'TaskObjectiveExperience' ||
              obj.type === 'TaskObjectivePlayerLevel' ||
              obj.type === 'TaskObjectiveSkill') {
            return false;
          }
          
          // Note: The actual item checking would need to be implemented based on the specific objective structure
          // This is a simplified version as the objective interface doesn't include item references
          return false;
        });

        // Check rewards - these are always considered as the item is given as reward
        const hasStartReward = task.startRewards?.items?.some((reward) => reward.item.id === itemId);
        const hasFinishReward = task.finishRewards?.items?.some((reward) => reward.item.id === itemId);

        return hasRequiredSpecificObjective || hasStartReward || hasFinishReward;
      }) as any;

      setCachedData(cacheKey, questsForItem);
      return questsForItem;
    } catch (error) {
      console.error('Error fetching quests for item from Tarkov.dev:', error);
      throw new Error('Failed to fetch quests for item');
    }
  },

  // Get hideout stations that use a specific item (Validated against schema)
  async getHideoutUsageForItem(itemId: string): Promise<unknown[]> {
    const cacheKey = `hideout_usage_${itemId}_${currentLanguage}`;
    const cached = getCachedData<unknown[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetHideoutUsageForItem($lang: LanguageCode) {
        hideoutStations(lang: $lang) {
          id
          name
          normalizedName
          levels {
            level
            constructionTime
            description
            itemRequirements {
              item {
                id
                name
                shortName
              }
              count
              quantity
            }
            crafts {
              id
              duration
              requiredItems {
                item {
                  id
                  name
                  shortName
                }
                count
                quantity
              }
              rewardItems {
                item {
                  id
                  name
                  shortName
                }
                count
              }
            }
          }
        }
      }
    `;

    try {
      const response = await request<HideoutStationsResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.hideoutStations) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      const hideoutUsage: unknown[] = [];

      response.hideoutStations.forEach((station) => {
        station.levels.forEach((level) => {
          // Check construction requirements
          const hasConstructionRequirement = level.itemRequirements?.some(
            (req) => req.item.id === itemId
          );

          if (hasConstructionRequirement) {
            hideoutUsage.push({
              type: 'construction',
              station: station,
              level: level.level,
              description: level.description,
              requirements: level.itemRequirements.filter(
                (req) => req.item.id === itemId
              )
            });
          }

          // Check crafts
          level.crafts?.forEach((craft) => {
            const hasCraftRequirement = craft.requiredItems?.some(
              (req) => req.item.id === itemId
            );
            const hasCraftReward = craft.rewardItems?.some(
              (reward) => reward.item.id === itemId
            );

            if (hasCraftRequirement || hasCraftReward) {
              hideoutUsage.push({
                type: 'craft',
                station: station,
                level: level.level,
                craft: craft,
                usageType: hasCraftRequirement ? 'ingredient' : 'product'
              });
            }
          });
        });
      });

      setCachedData(cacheKey, hideoutUsage);
      return hideoutUsage;
    } catch (error) {
      console.error('Error fetching hideout usage for item from Tarkov.dev:', error);
      throw new Error('Failed to fetch hideout usage for item');
    }
  },

  // Get barters for a specific item (Validated against schema)
  async getBartersForItem(itemId: string): Promise<Barter[]> {
    const cacheKey = `barters_${itemId}_${currentLanguage}`;
    const cached = getCachedData<Barter[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetBarters($lang: LanguageCode) {
        barters(lang: $lang) {
          id
          trader {
            id
            name
            normalizedName
          }
          level
          taskUnlock {
            id
            name
          }
          requiredItems {
            item {
              id
              name
              shortName
              iconLink
            }
            count
            quantity
          }
          rewardItems {
            item {
              id
              name
              shortName
              iconLink
            }
            count
          }
        }
      }
    `;

    try {
      const response = await request<BartersResponse>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.barters) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      // Filter barters that involve the specific item
      const bartersForItem = response.barters.filter((barter) =>
        barter.requiredItems.some((req) => req.item.id === itemId) ||
        barter.rewardItems.some((reward) => reward.item.id === itemId)
      );

      setCachedData(cacheKey, bartersForItem as any);
      return bartersForItem as any;
    } catch (error) {
      console.error('Error fetching barters from Tarkov.dev:', error);
      throw new Error('Failed to fetch barters');
    }
  },

  // Get all ammunition with detailed stats (Validated against schema)
  async getAmmunition(): Promise<Ammo[]> {
    const cacheKey = `ammunition_${currentLanguage}`;
    const cached = getCachedData<Ammo[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetAmmunition($lang: LanguageCode) {
        ammo(lang: $lang) {
          item {
            ...ItemFields
          }
          weight
          caliber
          stackMaxSize
          tracer
          tracerColor
          ammoType
          projectileCount
          damage
          armorDamage
          fragmentationChance
          ricochetChance
          penetrationChance
          penetrationPower
          penetrationPowerDeviation
          accuracyModifier
          recoilModifier
          initialSpeed
          lightBleedModifier
          heavyBleedModifier
          staminaBurnPerDamage
        }
      }
      ${ItemFieldsFragment}
    `;

    try {
      const response = await request<any>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.ammo) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      const ammunition = response.ammo.map((ammo: any) => ({
        ...ammo,
        item: {
          ...ammo.item,
          icon: ammo.item.iconLink,
          image: ammo.item.image512pxLink,
          sellFor: ammo.item.sellFor || [],
          buyFor: ammo.item.buyFor || [],
        }
      }));

      setCachedData(cacheKey, ammunition);
      return ammunition;
    } catch (error) {
      console.error('Error fetching ammunition from Tarkov.dev:', error);
      throw new Error('Failed to fetch ammunition');
    }
  },

// Get all armor with detailed stats - Master Key Query Implementation
async getArmor(): Promise<Armor[]> {
  const cacheKey = `armor_master_${currentLanguage}`;
  const cached = getCachedData<Armor[]>(cacheKey);
  if (cached) return cached;

  // Master Key Query - Unified query for all protective equipment
  const masterKeyQuery = gql`
    query GetAllProtectiveEquipment($lang: LanguageCode) {
      items(types: [armor, helmet, rig], lang: $lang) {
        id
        name
        shortName
        description
        weight
        basePrice
        avg24hPrice
        updated
        types
        iconLink
        gridImageLink
        image512pxLink
        wikiLink
        sellFor {
          source
          price
          currency
          requirements {
            type
            value
          }
        }
        buyFor {
          source
          price
          currency
          requirements {
            type
            value
          }
        }
        properties {
          __typename
          ... on ItemPropertiesArmor {
            class
            zones
            durability
            material {
              id
              name
              destructibility
              explosionDestructibility
              minRepairDegradation
              maxRepairDegradation
              minRepairKitDegradation
              maxRepairKitDegradation
            }
            ergoPenalty
            speedPenalty
            turnPenalty
            armorType
            armorSlots {
              nameId
              zones
              ... on ItemArmorSlotLocked { 
                name 
                armorType 
              }
              ... on ItemArmorSlotOpen {
                allowedPlates {
                  id
                  name
                  shortName
                  properties {
                    ... on ItemPropertiesArmor { 
                      class 
                      durability 
                    }
                  }
                }
              }
            }
          }
          ... on ItemPropertiesHelmet {
            class
            headZones
            durability
            material {
              id
              name
              destructibility
              explosionDestructibility
              minRepairDegradation
              maxRepairDegradation
              minRepairKitDegradation
              maxRepairKitDegradation
            }
            ergoPenalty
            speedPenalty
            turnPenalty
            deafening
            blocksHeadset
            ricochetX
            ricochetY
            ricochetZ
          }
        }
        conflictingSlotIds
      }
    }
  `;

  try {
    // Execute Master Key Query and get materials in parallel
    const [masterResponse, armorMaterialsData] = await Promise.all([
      request<any>(TARKOV_API_URL, masterKeyQuery, { lang: currentLanguage }),
      this.getArmorMaterials()
    ]);

    if (!masterResponse?.items) {
      console.error('Invalid response structure from Tarkov.dev API');
      throw new Error('Invalid API response structure');
    }

    // Create a materials lookup map for enhanced data
    const materialsMap = new Map(
      armorMaterialsData.map((material) => [
        material.id,
        material
      ])
    );

    // Collect all unique plate IDs from armor slots
    const plateIds = new Set<string>();
    masterResponse.items.forEach((item: any) => {
      if (item.properties?.armorSlots) {
        item.properties.armorSlots.forEach((slot: any) => {
          if (slot.allowedPlates) {
            slot.allowedPlates.forEach((plate: any) => {
              if (plate.id) {
                plateIds.add(plate.id);
              }
            });
          }
        });
      }
    });

    // Fetch detailed plate data if we have plate IDs
    const plateIdsArray = Array.from(plateIds);
    const detailedPlates = plateIdsArray.length > 0 
      ? await this.getArmorPlates(plateIdsArray)
      : [];
    
    // Create a plates lookup map
    const platesMap = new Map(
      detailedPlates.map((plate: any) => [plate.id, plate])
    );

    console.log(`🔧 Found ${plateIdsArray.length} unique plate IDs, loaded ${detailedPlates.length} detailed plates`);

    // Filter items that have armor or helmet properties
    const protectiveItems = (masterResponse as any).items.filter((item: any) => 
      item.properties && (
        item.properties.__typename === 'ItemPropertiesArmor' ||
        item.properties.__typename === 'ItemPropertiesHelmet'
      )
    );

    console.log(`🛡️ Master Key Query found ${protectiveItems.length} protective items`);
    console.log(`📊 Loaded ${armorMaterialsData.length} armor materials`);

    const armor = protectiveItems.map((item: any) => {
      const props = item.properties;
      const materialInfo = props.material ? materialsMap.get(props.material.id) : null;
      
      // Process armor slots if available with enhanced plate data
      const armorSlots = props.armorSlots ? props.armorSlots.map((slot: any) => ({
        nameId: slot.nameId,
        zones: slot.zones || [],
        name: slot.name,
        armorType: slot.armorType,
        allowedPlates: slot.allowedPlates ? slot.allowedPlates.map((plate: any) => {
          const detailedPlate = platesMap.get(plate.id) as any;
          return {
            id: plate.id,
            name: plate.name,
            shortName: plate.shortName,
            properties: detailedPlate?.properties || plate.properties || {},
            weight: detailedPlate?.weight,
            basePrice: detailedPlate?.basePrice,
            avg24hPrice: detailedPlate?.avg24hPrice,
            iconLink: detailedPlate?.iconLink,
            image512pxLink: detailedPlate?.image512pxLink
          };
        }) : undefined
      })) : [];

      return {
        id: item.id,
        name: item.name,
        shortName: item.shortName,
        item: {
          id: item.id,
          name: item.name,
          shortName: item.shortName,
          description: item.description,
          weight: item.weight,
          basePrice: item.basePrice,
          avg24hPrice: item.avg24hPrice,
          updated: item.updated,
          types: item.types,
          icon: item.iconLink,
          image: item.image512pxLink,
          iconLink: item.iconLink,
          gridImageLink: item.gridImageLink,
          image512pxLink: item.image512pxLink,
          wikiLink: item.wikiLink,
          sellFor: item.sellFor || [],
          buyFor: item.buyFor || [],
        },
        class: props.class || 0,
        durability: props.durability || 0,
        material: materialInfo || props.material || { id: '', name: 'Unknown', destructibility: 0, explosionDestructibility: 0, minRepairDegradation: 0, maxRepairDegradation: 0, minRepairKitDegradation: 0, maxRepairKitDegradation: 0 },
        zones: props.zones || props.headZones || [],
        armorSlots: armorSlots,
        armorType: props.armorType || (props.__typename === 'ItemPropertiesHelmet' ? 'helmet' : 'body_armor'),
        weight: item.weight || 0,
        // Penalties
        ergonomicsPenalty: props.ergoPenalty || 0,
        movementPenalty: props.speedPenalty || 0,
        turnPenalty: props.turnPenalty || 0,
        // Helmet-specific properties
        deafening: props.deafening,
        blocksHeadset: props.blocksHeadset,
        ricochetX: props.ricochetX,
        ricochetY: props.ricochetY,
        ricochetZ: props.ricochetZ,
        headZones: props.headZones,
        blindnessProtection: props.blindnessProtection,
      };
     });

     console.log(`🛡️ Processed ${armor.length} protective items with enhanced plate data`);
     setCachedData(cacheKey, armor);
     return armor;
  } catch (error) {
    console.error('Error fetching armor from Tarkov.dev:', error);
    throw new Error('Failed to fetch armor');
  }
},

// Get detailed armor plate data for specific plate IDs
async getArmorPlates(plateIds: string[]): Promise<unknown[]> {
  if (!plateIds || plateIds.length === 0) {
    return [];
  }

  const cacheKey = `armor_plates_${plateIds.sort().join('_')}_${currentLanguage}`;
  const cached = getCachedData<unknown[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await request(TARKOV_API_URL, gql`
      query GetArmorPlates($plateIds: [ID!], $lang: LanguageCode) {
        items(ids: $plateIds, lang: $lang) {
          id
          name
          shortName
          weight
          basePrice
          avg24hPrice
          iconLink
          image512pxLink
          properties {
            ... on ItemPropertiesArmor {
              class
              durability
              material {
                id
                name
                destructibility
                explosionDestructibility
                minRepairDegradation
                maxRepairDegradation
                minRepairKitDegradation
                maxRepairKitDegradation
              }
              armorType
              zones
              ergoPenalty
              speedPenalty
              turnPenalty
            }
          }
        }
      }
    `, { plateIds, lang: currentLanguage });

    if (!(response as any)?.items) {
      console.error('Invalid response structure for armor plates');
      return [];
    }

    const plates = (response as any).items.filter((item: any) => 
      item.properties && item.properties.__typename === 'ItemPropertiesArmor'
    );

    console.log(`🔧 Loaded ${plates.length} armor plates from ${plateIds.length} requested IDs`);
    
    setCachedData(cacheKey, plates);
    return plates;
  } catch (error) {
    console.error('Error fetching armor plates:', error);
    return [];
  }
},

  // Get armor materials (useful for armor analysis) (Validated against schema)
  async getArmorMaterials(): Promise<ArmorMaterial[]> {
    const cacheKey = `armor_materials_${currentLanguage}`;
    const cached = getCachedData<ArmorMaterial[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetArmorMaterials($lang: LanguageCode) {
        armorMaterials(lang: $lang) {
          id
          name
          destructibility
          explosionDestructibility
          minRepairDegradation
          maxRepairDegradation
          minRepairKitDegradation
          maxRepairKitDegradation
        }
      }
    `;

    try {
      const response = await request<any>(TARKOV_API_URL, query, { lang: currentLanguage });

      if (!response?.armorMaterials) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      setCachedData(cacheKey, response.armorMaterials);
      return response.armorMaterials;
    } catch (error) {
      console.error('Error fetching armor materials from Tarkov.dev:', error);
      throw new Error('Failed to fetch armor materials');
    }
  },

  // Get all skills with images (Validated against schema)
  async getSkills(): Promise<Skill[]> {
    const cacheKey = `skills_${currentLanguage}`;
    const cached = getCachedData<Skill[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetSkills($lang: LanguageCode) {
        skills(lang: $lang) {
          id
          name
          imageLink
        }
      }
    `;

    try {
      const response = await request<any>(TARKOV_API_URL, query, { lang: currentLanguage });

      if (!response?.skills) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      setCachedData(cacheKey, response.skills);
      return response.skills;
    } catch (error) {
      console.error('Error fetching skills from Tarkov.dev:', error);
      throw new Error('Failed to fetch skills');
    }
  },

  // Get all traders with images (Validated against schema)
  async getTraders(): Promise<Trader[]> {
    const cacheKey = `traders_${currentLanguage}`;
    const cached = getCachedData<Trader[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetTraders($lang: LanguageCode) {
        traders(lang: $lang) {
          id
          name
          normalizedName
          imageLink
          image4xLink
        }
      }
    `;

    try {
      const response = await request<any>(
        TARKOV_API_URL,
        query,
        { lang: currentLanguage }
      );

      if (!response?.traders) {
        console.error('Invalid response structure from Tarkov.dev API:', response);
        throw new Error('Invalid API response structure');
      }

      setCachedData(cacheKey, response.traders);
      return response.traders;
    } catch (error) {
      console.error('Error fetching traders from Tarkov.dev:', error);
      throw new Error('Failed to fetch traders');
    }
  },

};

// Tarkov Market API service
export const tarkovMarketApi = {
  // Get all items from market
  async getMarketItems(): Promise<TarkovMarketItem[]> {
    const cacheKey = 'market_items';
    const cached = getCachedData<TarkovMarketItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<TarkovMarketItem[]>(
        `${TARKOV_MARKET_API_URL}/v1/items/all`
      );

      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching market items:', error);
      throw new Error('Failed to fetch market items');
    }
  },

  // Get item price history
  async getItemPriceHistory(itemId: string): Promise<TarkovMarketPriceHistory | null> {
    const cacheKey = `price_history_${itemId}`;
    const cached = getCachedData<TarkovMarketPriceHistory>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<TarkovMarketPriceHistory>(
        `${TARKOV_MARKET_API_URL}/v1/item/${itemId}/history`
      );

      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      return null;
    }
  },
};

// Combined API service
export const tarkovApi = {
  // Advanced search with filters
  async searchItems(params: SearchParams): Promise<SearchResponse<TarkovItem>> {
    const {
      query = '',
      category,
      trader,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 25,
      filters = {}
    } = params;

    try {
      // Get items from Tarkov.dev
      let items = await tarkovDevApi.searchItems(query, 1000);

      // Apply filters
      if (category) {
        items = items.filter(item => item.types.includes(category));
      }

      if (trader) {
        items = items.filter(item => 
          item.sellFor.some(sell => sell.source.toLowerCase().includes(trader.toLowerCase())) ||
          item.buyFor.some(buy => buy.source.toLowerCase().includes(trader.toLowerCase()))
        );
      }

      if (minPrice !== undefined) {
        items = items.filter(item => (item.avg24hPrice || item.basePrice) >= minPrice);
      }

      if (maxPrice !== undefined) {
        items = items.filter(item => (item.avg24hPrice || item.basePrice) <= maxPrice);
      }

      if (filters.types && filters.types.length > 0) {
        items = items.filter(item => 
          filters.types!.some(type => item.types.includes(type))
        );
      }

      if (filters.fleaMarketOnly) {
        items = items.filter(item => item.avg24hPrice && item.avg24hPrice > 0);
      }

      if (filters.traderOnly) {
        items = items.filter(item => item.sellFor.length > 0 || item.buyFor.length > 0);
      }

      // Sort items
      items.sort((a, b) => {
        let aValue: number | string | undefined, bValue: number | string | undefined;

        switch (sortBy) {
          case 'price':
            aValue = a.avg24hPrice || a.basePrice;
            bValue = b.avg24hPrice || b.basePrice;
            break;
          case 'updated':
            aValue = new Date(a.updated || 0).getTime();
            bValue = new Date(b.updated || 0).getTime();
            break;
          case 'name':
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Pagination
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = items.slice(startIndex, endIndex);

      // Get available filters
      const allCategories = Array.from(new Set(items.flatMap(item => item.types)));
      const allTraders = Array.from(new Set([
        ...items.flatMap(item => item.sellFor.map((sell: any) => sell.source)),
        ...items.flatMap(item => item.buyFor.map((buy: any) => buy.source))
      ]));
      const prices = items.map(item => item.avg24hPrice || item.basePrice).filter(Boolean);
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };

      return {
        items: paginatedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          categories: allCategories,
          traders: allTraders,
          priceRange,
        },
      };
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error('Failed to search items');
    }
  },

  // Get popular items
  async getPopularItems(limit = 10): Promise<TarkovItem[]> {
    try {
      const items = await tarkovDevApi.getItems(100);
      
      // Sort by price and recent updates to determine popularity
      return items
        .filter(item => item.avg24hPrice && item.avg24hPrice > 0)
        .sort((a, b) => {
          const aScore = (a.avg24hPrice || 0) * (a.updated ? 1 : 0.5);
          const bScore = (b.avg24hPrice || 0) * (b.updated ? 1 : 0.5);
          return bScore - aScore;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular items:', error);
      throw new Error('Failed to fetch popular items');
    }
  },

  // Get trending items (price changes)
  async getTrendingItems(limit = 10): Promise<TarkovItem[]> {
    try {
      const items = await tarkovDevApi.getItems(200);
      
      // Calculate price change percentage using basePrice as reference
      const itemsWithTrend = items
        .filter(item => item.avg24hPrice && item.basePrice)
        .map(item => {
          const change = ((item.avg24hPrice! - item.basePrice!) / item.basePrice!) * 100;
          return { ...item, priceChange: change };
        })
        .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
        .slice(0, limit);

      return itemsWithTrend;
    } catch (error) {
      console.error('Error fetching trending items:', error);
      throw new Error('Failed to fetch trending items');
    }
  },

  // Get quests for a specific item
  async getQuestsForItem(itemId: string): Promise<TarkovQuest[]> {
    return tarkovDevApi.getQuestsForItem(itemId);
  },

  // Get hideout usage for a specific item
  async getHideoutUsageForItem(itemId: string): Promise<unknown[]> {
    return tarkovDevApi.getHideoutUsageForItem(itemId);
  },

  // Get barters for a specific item
  async getBartersForItem(itemId: string): Promise<Barter[]> {
    return tarkovDevApi.getBartersForItem(itemId);
  },

  // Get all skills with images
  async getSkills(): Promise<Skill[]> {
    return tarkovDevApi.getSkills();
  },

  // Get all traders with images
  async getTraders(): Promise<Trader[]> {
    return tarkovDevApi.getTraders();
  },

  // Get all quests
  async getQuests(): Promise<TarkovQuest[]> {
    return tarkovDevApi.getQuests();
  },
};

export default tarkovApi;