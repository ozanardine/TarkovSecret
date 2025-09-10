import { NextRequest, NextResponse } from 'next/server';
import { request, gql } from 'graphql-request';
import { ImageRequest, ImagesResponse, ImageData, ImageType } from '@/types/api';

const TARKOV_API_URL = 'https://api.tarkov.dev/graphql';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

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

// Helper function to generate fallback image URLs
function generateFallbackImageUrl(type: string, name: string): string {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  switch (type) {
    case 'trader':
      // Use assets.tarkov.dev for traders
      return `https://assets.tarkov.dev/traders/${normalizedName}.webp`;
    case 'map':
      // Use assets.tarkov.dev for maps
      return `https://assets.tarkov.dev/maps/${normalizedName}.webp`;
    case 'skill':
      // Use assets.tarkov.dev for skills
      return `https://assets.tarkov.dev/skills/${normalizedName}.webp`;
    case 'quest':
      // Use assets.tarkov.dev for quests
      return `https://assets.tarkov.dev/quests/${normalizedName}.webp`;
    case 'item':
      // Use assets.tarkov.dev for items
      return `https://assets.tarkov.dev/items/${normalizedName}.webp`;
    default:
      return `https://assets.tarkov.dev/images/unknown.webp`;
  }
}

// Function to get item images
async function getItemImages(ids?: string[], names?: string[], limit?: number): Promise<ImageData[]> {
  const cacheKey = `items_images_${JSON.stringify({ ids, names, limit })}`;
  const cached = getCachedData<ImageData[]>(cacheKey);
  if (cached) return cached;

  const query = gql`
    query GetItemImages($ids: [ID], $names: [String], $limit: Int) {
      items(ids: $ids, names: $names, limit: $limit) {
        id
        name
        iconLink
      }
    }
  `;

  const variables: any = {};
  if (ids && ids.length > 0) variables.ids = ids;
  if (names && names.length > 0) variables.names = names;
  if (limit) variables.limit = limit;

  try {
    const response = await request(TARKOV_API_URL, query, variables);
    
    const imageData: ImageData[] = (response as any).items.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: 'item' as const,
      images: {
        iconLink: item.iconLink || generateFallbackImageUrl('item', item.name)
      }
    }));

    setCachedData(cacheKey, imageData);
    return imageData;
  } catch (error) {
    console.error('Error fetching item images:', error);
    return [];
  }
}

// Function to get trader images
async function getTraderImages(ids?: string[], names?: string[]): Promise<ImageData[]> {
  const cacheKey = `traders_images_${JSON.stringify({ ids, names })}`;
  const cached = getCachedData<ImageData[]>(cacheKey);
  if (cached) return cached;

  const query = gql`
    query GetTraderImages {
      traders {
        id
        name
        normalizedName
        imageLink
        image4xLink
      }
    }
  `;

  try {
    const response = await request(TARKOV_API_URL, query);
    
    let traders = (response as any).traders;
    
    // Filter client-side if IDs or names are specified
    if (ids && ids.length > 0) {
      traders = traders.filter((trader: any) => ids.includes(trader.id));
    } else if (names && names.length > 0) {
      traders = traders.filter((trader: any) => 
        names.includes(trader.name) || names.includes(trader.normalizedName)
      );
    }
    
    const imageData: ImageData[] = traders.map((trader: any) => ({
      id: trader.id,
      name: trader.name,
      type: 'trader' as const,
      images: {
        avatar: trader.imageLink || generateFallbackImageUrl('trader', trader.name),
        imageLink: trader.imageLink,
        image4xLink: trader.image4xLink || trader.imageLink,
        traderAvatar: trader.imageLink || generateFallbackImageUrl('trader', trader.name)
      }
    }));

    setCachedData(cacheKey, imageData);
    return imageData;
  } catch (error) {
    console.error('Error fetching trader images:', error);
    
    // Return fallback data when API is rate limited or unavailable
    const fallbackTraders = [
      { id: 'prapor', name: 'Prapor', normalizedName: 'prapor' },
      { id: 'therapist', name: 'Therapist', normalizedName: 'therapist' },
      { id: 'fence', name: 'Fence', normalizedName: 'fence' },
      { id: 'skier', name: 'Skier', normalizedName: 'skier' },
      { id: 'peacekeeper', name: 'Peacekeeper', normalizedName: 'peacekeeper' },
      { id: 'mechanic', name: 'Mechanic', normalizedName: 'mechanic' },
      { id: 'ragman', name: 'Ragman', normalizedName: 'ragman' },
      { id: 'jaeger', name: 'Jaeger', normalizedName: 'jaeger' }
    ];
    
    let filteredTraders = fallbackTraders;
    if (ids && ids.length > 0) {
      filteredTraders = fallbackTraders.filter(trader => ids.includes(trader.id));
    } else if (names && names.length > 0) {
      filteredTraders = fallbackTraders.filter(trader => 
        names.includes(trader.name) || names.includes(trader.normalizedName)
      );
    }
    
    const fallbackData: ImageData[] = filteredTraders.map(trader => {
      const fallbackUrl = generateFallbackImageUrl('trader', trader.name);
      return {
        id: trader.id,
        name: trader.name,
        type: 'trader' as const,
        images: {
          avatar: fallbackUrl,
          imageLink: fallbackUrl,
          image4xLink: fallbackUrl,
          traderAvatar: fallbackUrl
        }
      };
    });
    
    return fallbackData;
  }
}

// Function to get quest images
async function getQuestImages(ids?: string[], names?: string[], limit?: number): Promise<ImageData[]> {
  const cacheKey = `quests_images_${JSON.stringify({ ids, names, limit })}`;
  const cached = getCachedData<ImageData[]>(cacheKey);
  if (cached) return cached;

  const query = gql`
    query GetQuestImages($limit: Int) {
      tasks(limit: $limit) {
        id
        name
        trader {
          id
          name
          normalizedName
          imageLink
          image4xLink
        }
        map {
          id
          name
          normalizedName
        }
        taskImageLink
      }
    }
  `;

  const variables: any = {};
  if (limit) variables.limit = limit;

  try {
    const response = await request(TARKOV_API_URL, query, variables);
    
    let quests = (response as any).tasks;
    
    // Filter client-side if IDs or names are specified
    if (ids && ids.length > 0) {
      quests = quests.filter((quest: any) => ids.includes(quest.id));
    } else if (names && names.length > 0) {
      quests = quests.filter((quest: any) => names.includes(quest.name));
    }
    
    const imageData: ImageData[] = quests.map((quest: any) => ({
      id: quest.id,
      name: quest.name,
      type: 'quest' as const,
      images: {
        taskImage: quest.taskImageLink || generateFallbackImageUrl('quest', quest.name),
        taskImageLink: quest.taskImageLink,
        image: quest.taskImageLink || generateFallbackImageUrl('quest', quest.name),
        traderAvatar: quest.trader?.imageLink || quest.trader?.image4xLink || generateFallbackImageUrl('trader', quest.trader?.name),
        mapImage: quest.map ? generateFallbackImageUrl('map', quest.map.name) : undefined
      }
    }));

    setCachedData(cacheKey, imageData);
    return imageData;
  } catch (error) {
    console.error('Error fetching quest images:', error);
    return [];
  }
}

// Function to get skill images
async function getSkillImages(ids?: string[], names?: string[], limit?: number): Promise<ImageData[]> {
  const cacheKey = `skills_images_${JSON.stringify({ ids, names, limit })}`;
  const cached = getCachedData<ImageData[]>(cacheKey);
  if (cached) return cached;

  const query = gql`
    query GetSkillImages($limit: Int) {
      skills(limit: $limit) {
        id
        name
        imageLink
      }
    }
  `;

  const variables: any = {};
  if (limit) variables.limit = limit;

  try {
    const response = await request(TARKOV_API_URL, query, variables);
    
    let skills = (response as any).skills;
    
    // Filter client-side if IDs or names are specified
    if (ids && ids.length > 0) {
      skills = skills.filter((skill: any) => ids.includes(skill.id));
    } else if (names && names.length > 0) {
      skills = skills.filter((skill: any) => names.includes(skill.name));
    }
    
    const imageData: ImageData[] = skills.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      type: 'skill' as const,
      images: {
        skillImage: skill.imageLink || generateFallbackImageUrl('skill', skill.name)
      }
    }));

    setCachedData(cacheKey, imageData);
    return imageData;
  } catch (error) {
    console.error('Error fetching skill images:', error);
    return [];
  }
}

// Function to get map images
async function getMapImages(ids?: string[], names?: string[]): Promise<ImageData[]> {
  const cacheKey = `maps_images_${JSON.stringify({ ids, names })}`;
  const cached = getCachedData<ImageData[]>(cacheKey);
  if (cached) return cached;

  const query = gql`
    query GetMapImages {
      maps {
        id
        name
        normalizedName
      }
    }
  `;

  try {
    const response = await request(TARKOV_API_URL, query);
    
    let maps = (response as any).maps;
    
    // Filter client-side if IDs or names are specified
    if (ids && ids.length > 0) {
      maps = maps.filter((map: any) => ids.includes(map.id));
    } else if (names && names.length > 0) {
      maps = maps.filter((map: any) => 
        names.includes(map.name) || names.includes(map.normalizedName)
      );
    }
    
    const imageData: ImageData[] = maps.map((map: any) => ({
      id: map.id,
      name: map.name,
      type: 'map' as const,
      images: {
        mapImage: generateFallbackImageUrl('map', map.name),
        thumbnail: generateFallbackImageUrl('map', map.name)
      }
    }));

    setCachedData(cacheKey, imageData);
    return imageData;
  } catch (error) {
    console.error('Error fetching map images:', error);
    return [];
  }
}



export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = request.nextUrl;
    
    const requestData: ImageRequest = {
      type: (searchParams.get('type') as any) || 'all',
      ids: searchParams.get('ids')?.split(',').filter(Boolean),
      names: searchParams.get('names')?.split(',').filter(Boolean),
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      imageTypes: searchParams.get('imageTypes')?.split(',') as ImageType[]
    };

    let allImageData: ImageData[] = [];
    const cacheKey = `all_images_${JSON.stringify(requestData)}`;
    const cached = getCachedData<ImageData[]>(cacheKey);
    
    if (cached) {
      allImageData = cached;
    } else {
      // Fetch data based on type
      if (requestData.type === 'items' || requestData.type === 'all') {
        const itemImages = await getItemImages(requestData.ids, requestData.names, requestData.limit);
        allImageData.push(...itemImages);
      }
      
      if (requestData.type === 'traders' || requestData.type === 'all') {
        const traderImages = await getTraderImages(requestData.ids, requestData.names);
        allImageData.push(...traderImages);
      }
      
      if (requestData.type === 'quests' || requestData.type === 'all') {
        const questImages = await getQuestImages(requestData.ids, requestData.names, requestData.limit);
        allImageData.push(...questImages);
      }
      
      if (requestData.type === 'maps' || requestData.type === 'all') {
        const mapImages = await getMapImages(requestData.ids, requestData.names);
        allImageData.push(...mapImages);
      }
      
      if (requestData.type === 'skills' || requestData.type === 'all') {
        const skillImages = await getSkillImages(requestData.ids, requestData.names, requestData.limit);
        allImageData.push(...skillImages);
      }
      
      setCachedData(cacheKey, allImageData);
    }

    // Filter by image types if specified
    if (requestData.imageTypes && requestData.imageTypes.length > 0) {
      allImageData = allImageData.map(item => ({
        ...item,
        images: Object.fromEntries(
          Object.entries(item.images).filter(([key]) => 
            requestData.imageTypes!.includes(key as ImageType)
          )
        )
      }));
    }

    const processingTime = Date.now() - startTime;
    
    const response: ImagesResponse = {
      success: true,
      data: allImageData,
      metadata: {
        total: allImageData.length,
        type: requestData.type,
        processingTime,
        cached: !!cached
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in images API:', error);
    
    const response: ImagesResponse = {
      success: false,
      data: [],
      metadata: {
        total: 0,
        type: 'error',
        processingTime: Date.now() - startTime,
        cached: false
      },
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const requestData: ImageRequest = await request.json();
    
    let allImageData: ImageData[] = [];
    const cacheKey = `all_images_${JSON.stringify(requestData)}`;
    const cached = getCachedData<ImageData[]>(cacheKey);
    
    if (cached) {
      allImageData = cached;
    } else {
      // Fetch data based on type
      if (requestData.type === 'items' || requestData.type === 'all') {
        const itemImages = await getItemImages(requestData.ids, requestData.names, requestData.limit);
        allImageData.push(...itemImages);
      }
      
      if (requestData.type === 'traders' || requestData.type === 'all') {
        const traderImages = await getTraderImages(requestData.ids, requestData.names);
        allImageData.push(...traderImages);
      }
      
      if (requestData.type === 'quests' || requestData.type === 'all') {
        const questImages = await getQuestImages(requestData.ids, requestData.names, requestData.limit);
        allImageData.push(...questImages);
      }
      
      if (requestData.type === 'maps' || requestData.type === 'all') {
        const mapImages = await getMapImages(requestData.ids, requestData.names);
        allImageData.push(...mapImages);
      }
      
      if (requestData.type === 'skills' || requestData.type === 'all') {
        const skillImages = await getSkillImages(requestData.ids, requestData.names, requestData.limit);
        allImageData.push(...skillImages);
      }
      
      setCachedData(cacheKey, allImageData);
    }

    // Filter by image types if specified
    if (requestData.imageTypes && requestData.imageTypes.length > 0) {
      allImageData = allImageData.map(item => ({
        ...item,
        images: Object.fromEntries(
          Object.entries(item.images).filter(([key]) => 
            requestData.imageTypes!.includes(key as ImageType)
          )
        )
      }));
    }

    const processingTime = Date.now() - startTime;
    
    const response: ImagesResponse = {
      success: true,
      data: allImageData,
      metadata: {
        total: allImageData.length,
        type: requestData.type,
        processingTime,
        cached: !!cached
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in images API (POST):', error);
    
    const response: ImagesResponse = {
      success: false,
      data: [],
      metadata: {
        total: 0,
        type: 'error',
        processingTime: Date.now() - startTime,
        cached: false
      },
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
