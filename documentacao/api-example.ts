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
    image512pxLink
    wikiLink
    sellFor {
      source
      price
      currency
    }
    buyFor {
      source
      price
      currency
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
      const response = await request(TARKOV_API_URL, query, { limit, lang: currentLanguage });
      if (!response?.items) throw new Error('Invalid API response structure');
      
      const items = response.items.map((item: any) => ({ 
        ...item, 
        slots: item.width * item.height,
        icon: item.iconLink, 
        image: item.image512pxLink 
      }));
      setCachedData(cacheKey, items);
      return items;
    } catch (error) {
      console.error('Error fetching items from Tarkov.dev:', error);
      throw new Error('Failed to fetch items');
    }
  },

  // Get item by ID
  async getItemById(id: string): Promise<TarkovItem | null> {
    const cacheKey = `item_${id}_${currentLanguage}`;
    const cached = getCachedData<TarkovItem>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetItem($id: ID!, $lang: LanguageCode) {
        item(id: $id, lang: $lang) {
          ...ItemFields
          // Add any other specific fields not in the fragment
          changeLast48hPercent
          link
        }
      }
      ${ItemFieldsFragment}
    `;

    try {
      const response = await request(TARKOV_API_URL, query, { id, lang: currentLanguage });
      if (!response?.item) return null;

      const item = {
        ...response.item,
        slots: response.item.width * response.item.height,
        icon: response.item.iconLink,
        image: response.item.image512pxLink,
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
      const response = await request(TARKOV_API_URL, query, { name: searchTerm, limit, lang: currentLanguage });
      if (!response?.items) throw new Error('Invalid API response structure');

      const items = response.items.map((item: any) => ({ 
        ...item, 
        slots: item.width * item.height,
        icon: item.iconLink, 
        image: item.image512pxLink 
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
          trader { id name imageLink }
          map { id name }
          experience
          wikiLink
          minPlayerLevel
          kappaRequired
          lightkeeperRequired
          objectives {
            id
            description
            type
            optional
          }
          finishRewards {
            items {
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
    `;

    try {
      const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
      if (!response?.tasks) throw new Error('Invalid response structure for quests');
      setCachedData(cacheKey, response.tasks);
      return response.tasks;
    } catch (error) {
      console.error('Error fetching quests from Tarkov.dev:', error);
      throw new Error('Failed to fetch quests');
    }
  },
  
  // Get all ammunition (Validated against schema)
  async getAmmunition(): Promise<Ammo[]> {
    const cacheKey = `ammunition_${currentLanguage}`;
    const cached = getCachedData<Ammo[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetAmmunition($lang: LanguageCode) {
        ammo(lang: $lang) {
          item { ...ItemFields }
          caliber
          stackMaxSize
          tracer
          damage
          armorDamage
          fragmentationChance
          penetrationPower
          accuracyModifier
          recoilModifier
          initialSpeed
        }
      }
      ${ItemFieldsFragment}
    `;

    try {
      const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
      if (!response?.ammo) throw new Error('Invalid API response structure for ammo');
      setCachedData(cacheKey, response.ammo);
      return response.ammo;
    } catch (error) {
      console.error('Error fetching ammunition:', error);
      throw new Error('Failed to fetch ammunition');
    }
  },

  // Get Armor Materials (Helper for getArmor)
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
    const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
    if (!response?.armorMaterials) throw new Error('Invalid response for armor materials');
    setCachedData(cacheKey, response.armorMaterials);
    return response.armorMaterials;
  },

  // Get Armor (Definitive "Master Key" implementation)
  async getArmor(): Promise<Armor[]> {
    const cacheKey = `armor_master_${currentLanguage}`;
    const cached = getCachedData<Armor[]>(cacheKey);
    if (cached) return cached;

    const query = gql`
      query GetMasterKeyGearData($lang: LanguageCode) {
        items(types: [armor, helmet, rig], lang: $lang) {
          id
          name
          shortName
          weight
          image512pxLink
          wikiLink
          properties {
            ... on ItemPropertiesArmor {
              class
              durability
              material { name id }
              zones
              speedPenalty
              turnPenalty
              ergoPenalty
              armorType
              armorSlots { ...ArmorSlotFields }
            }
            ... on ItemPropertiesHelmet {
              class
              durability
              material { name id }
              deafening
              blocksHeadset
              ricochetX
              ricochetY
              ricochetZ
              headZones
            }
            ... on ItemPropertiesChestRig {
              class
              durability
              material { name id }
              zones
              speedPenalty
              turnPenalty
              ergoPenalty
              armorType
              armorSlots { ...ArmorSlotFields }
            }
          }
        }
      }
      fragment ArmorSlotFields on ItemArmorSlot {
        nameId
        zones
        ... on ItemArmorSlotLocked { name armorType }
        ... on ItemArmorSlotOpen {
          allowedPlates {
            id
            name
            shortName
            properties {
              ... on ItemPropertiesArmor { class durability }
            }
          }
        }
      }
    `;

    try {
      const [response, materialsData] = await Promise.all([
        request(TARKOV_API_URL, query, { lang: currentLanguage }),
        this.getArmorMaterials()
      ]);

      if (!response?.items) throw new Error('Invalid API response structure for armor');
      
      const materialsMap = new Map(materialsData.map(m => [m.id, m]));
      
      const armorList = response.items
        .filter((item: any) => item.properties && (item.properties.class || item.properties.armorSlots))
        .map((item: any) => {
          const props = item.properties;
          const materialInfo = props.material ? materialsMap.get(props.material.id) : null;
          return {
            ...item,
            item: { ...item },
            class: props.class,
            durability: props.durability,
            material: materialInfo || props.material,
            zones: props.zones || props.headZones || [],
            armorSlots: props.armorSlots || [],
            armorType: props.armorType,
            ergonomicsPenalty: props.ergoPenalty || 0,
            movementPenalty: props.speedPenalty || 0,
            turnPenalty: props.turnPenalty || 0,
            deafening: props.deafening || null,
            blocksHeadset: props.blocksHeadset || false,
          };
        });

      setCachedData(cacheKey, armorList);
      return armorList;
    } catch (error) {
      console.error('Error fetching master armor data:', error);
      throw new Error('Failed to fetch master armor data');
    }
  },

  // --- Outras funções do seu arquivo original, validadas ou mantidas ---
  async getHideoutStations(): Promise<HideoutStation[]> {
    // ... (Implementação existente, validada contra o schema)
    const cacheKey = `hideout_stations_${currentLanguage}`;
    const cached = getCachedData<HideoutStation[]>(cacheKey);
    if (cached) return cached;
    const query = gql`
      query GetHideoutStations($lang: LanguageCode) {
        hideoutStations(lang: $lang) {
          id
          name
          levels {
            level
            constructionTime
            itemRequirements { item { id name shortName iconLink } count }
            stationLevelRequirements { station { id name } level }
            skillRequirements { name level }
            traderRequirements { trader { id name } level }
            crafts {
              id
              duration
              requiredItems { item { id name shortName iconLink } count }
              rewardItems { item { id name shortName iconLink } count }
            }
          }
        }
      }
    `;
    try {
      const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
      if (!response?.hideoutStations) throw new Error('Invalid response for hideout stations');
      setCachedData(cacheKey, response.hideoutStations);
      return response.hideoutStations;
    } catch(e) {
      console.error(e);
      throw new Error("Failed to fetch hideout stations");
    }
  },

  async getBarters(): Promise<Barter[]> {
    // ... (Implementação existente, validada contra o schema)
    const cacheKey = `barters_${currentLanguage}`;
    const cached = getCachedData<Barter[]>(cacheKey);
    if (cached) return cached;
    const query = gql`
      query GetBarters($lang: LanguageCode) {
        barters(lang: $lang) {
          id
          trader { id name }
          level
          requiredItems { item { id name shortName iconLink } count }
          rewardItems { item { id name shortName iconLink } count }
        }
      }
    `;
    try {
      const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
      if (!response?.barters) throw new Error('Invalid response for barters');
      setCachedData(cacheKey, response.barters);
      return response.barters;
    } catch(e) {
      console.error(e);
      throw new Error("Failed to fetch barters");
    }
  },
};

// Seção do Tarkov Market API (mantida como estava)
export const tarkovMarketApi = {
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

// Exportação combinada (mantida como estava)
export const tarkovApi = {
  ...tarkovDevApi,
  ...tarkovMarketApi,
  // Adicione aqui funções combinadas se necessário
};

export default tarkovApi;