import { ImageFeatures } from './advanced-image-processing';

export interface TarkovItemReference {
  id: string;
  name: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  features: ImageFeatures;
  aliases: string[]; // Nomes alternativos
  tags: string[]; // Tags para busca
  iconUrl?: string;
  wikiUrl?: string;
}

/**
 * Base de dados de referência dos itens do Tarkov
 * Contém características visuais pré-calculadas para identificação precisa
 */
export class TarkovReferenceDatabase {
  private items: Map<string, TarkovItemReference> = new Map();
  private categoryIndex: Map<string, string[]> = new Map();
  private nameIndex: Map<string, string> = new Map();
  
  constructor() {
    this.initializeDatabase();
    this.buildIndexes();
  }

  /**
   * Busca item por ID
   */
  getItem(id: string): TarkovItemReference | undefined {
    return this.items.get(id);
  }

  /**
   * Busca itens por categoria
   */
  getItemsByCategory(category: string): TarkovItemReference[] {
    const itemIds = this.categoryIndex.get(category.toLowerCase()) || [];
    return itemIds.map(id => this.items.get(id)!).filter(Boolean);
  }

  /**
   * Busca item por nome ou alias
   */
  findItemByName(name: string): TarkovItemReference | undefined {
    const normalizedName = name.toLowerCase().trim();
    const itemId = this.nameIndex.get(normalizedName);
    return itemId ? this.items.get(itemId) : undefined;
  }

  /**
   * Obtém todos os itens
   */
  getAllItems(): TarkovItemReference[] {
    return Array.from(this.items.values());
  }

  /**
   * Busca itens similares baseado em características
   */
  findSimilarItems(features: ImageFeatures, maxResults: number = 10): Array<{
    item: TarkovItemReference;
    similarity: number;
  }> {
    // Verificação de segurança para features
    if (!features || !features.colorHistogram || !features.edgeFeatures || 
        !features.textureFeatures || !features.shapeFeatures) {
      console.warn('Features inválidas fornecidas para findSimilarItems');
      return [];
    }
    
    const results: Array<{ item: TarkovItemReference; similarity: number }> = [];
    
    for (const item of Array.from(this.items.values())) {
      // Verificação de segurança para item e suas features
      if (!item || !item.features || !item.features.colorHistogram || 
          !item.features.edgeFeatures || !item.features.textureFeatures || 
          !item.features.shapeFeatures) {
        console.warn(`Item com features inválidas encontrado: ${item?.id || 'unknown'}`);
        continue;
      }
      
      try {
        const similarity = this.calculateFeatureSimilarity(features, item.features);
        if (typeof similarity === 'number' && !isNaN(similarity)) {
          results.push({ item, similarity });
        }
      } catch (error) {
        console.warn(`Erro ao calcular similaridade para item ${item.id}:`, error);
      }
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  /**
   * Busca itens por nome ou texto
   */
  searchByName(query: string): TarkovItemReference[] {
    const normalizedQuery = query.toLowerCase().trim();
    const results: TarkovItemReference[] = [];
    
    if (!normalizedQuery) {
      return results;
    }
    
    for (const item of Array.from(this.items.values())) {
      // Busca no nome
      if (item.name.toLowerCase().includes(normalizedQuery)) {
        results.push(item);
        continue;
      }
      
      // Busca nos aliases
      if (item.aliases && item.aliases.some(alias => 
        alias.toLowerCase().includes(normalizedQuery)
      )) {
        results.push(item);
        continue;
      }
      
      // Busca nas tags
      if (item.tags && item.tags.some(tag => 
        tag.toLowerCase().includes(normalizedQuery)
      )) {
        results.push(item);
        continue;
      }
    }
    
    return results;
  }

  /**
   * Adiciona novo item à base de dados
   */
  addItem(item: TarkovItemReference): void {
    this.items.set(item.id, item);
    this.updateIndexes(item);
  }

  /**
   * Calcula similaridade entre características
   */
  private calculateFeatureSimilarity(features1: ImageFeatures, features2: ImageFeatures): number {
    // Verificações de segurança
    if (!features1 || !features2) {
      return 0;
    }
    
    const weights = {
      color: 0.3,
      edge: 0.25,
      texture: 0.25,
      shape: 0.2
    };
    
    const colorSim = this.calculateVectorSimilarity(
      features1.colorHistogram || [], 
      features2.colorHistogram || []
    );
    const edgeSim = this.calculateVectorSimilarity(
      features1.edgeFeatures || [], 
      features2.edgeFeatures || []
    );
    const textureSim = this.calculateVectorSimilarity(
      features1.textureFeatures || [], 
      features2.textureFeatures || []
    );
    const shapeSim = this.calculateVectorSimilarity(
      features1.shapeFeatures || [], 
      features2.shapeFeatures || []
    );
    
    return (
      colorSim * weights.color +
      edgeSim * weights.edge +
      textureSim * weights.texture +
      shapeSim * weights.shape
    );
  }

  /**
   * Calcula similaridade entre vetores usando distância cosseno
   */
  private calculateVectorSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Constrói índices para busca rápida
   */
  private buildIndexes(): void {
    this.categoryIndex.clear();
    this.nameIndex.clear();
    
    for (const item of Array.from(this.items.values())) {
      this.updateIndexes(item);
    }
  }

  /**
   * Atualiza índices para um item
   */
  private updateIndexes(item: TarkovItemReference): void {
    // Índice por categoria
    const category = item.category.toLowerCase();
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, []);
    }
    this.categoryIndex.get(category)!.push(item.id);
    
    // Índice por nome
    const normalizedName = item.name.toLowerCase().trim();
    this.nameIndex.set(normalizedName, item.id);
    
    // Índice por aliases
    for (const alias of item.aliases) {
      const normalizedAlias = alias.toLowerCase().trim();
      this.nameIndex.set(normalizedAlias, item.id);
    }
  }

  /**
   * Inicializa a base de dados com itens do Tarkov
   */
  private initializeDatabase(): void {
    // Barter Items - Valuables
    this.items.set('bronze-lion', {
      id: 'bronze-lion',
      name: 'Bronze Lion Figurine',
      category: 'Barter Items',
      rarity: 'rare',
      aliases: ['bronze lion', 'lion figurine', 'lion'],
      tags: ['valuable', 'collectible', 'bronze', 'figurine'],
      features: {
        colorHistogram: this.generateColorHistogram([120, 80, 40], 0.3), // Bronze colors
        edgeFeatures: [0.4, 0.5, 0.3, 0.2, 0.6, 0.4, 0.3, 0.5, 0.2, 0.4, 0.3, 0.5, 0.4, 0.2, 0.3, 0.4],
        textureFeatures: [0.6, 0.4, 0.3, 0.5, 0.2, 0.4, 0.6, 0.3, 0.2],
        shapeFeatures: [1.3, 0.85, 0.4] // Aspect ratio, fill ratio, compactness
      }
    });

    this.items.set('rooster', {
      id: 'rooster',
      name: 'Golden Rooster Figurine',
      category: 'Barter Items',
      rarity: 'rare',
      aliases: ['golden rooster', 'rooster figurine', 'gold rooster'],
      tags: ['valuable', 'collectible', 'golden', 'figurine'],
      features: {
        colorHistogram: this.generateColorHistogram([200, 180, 50], 0.4), // Golden colors
        edgeFeatures: [0.3, 0.4, 0.5, 0.3, 0.5, 0.3, 0.4, 0.6, 0.2, 0.3, 0.4, 0.5, 0.3, 0.2, 0.4, 0.3],
        textureFeatures: [0.5, 0.6, 0.4, 0.3, 0.4, 0.5, 0.3, 0.4, 0.3],
        shapeFeatures: [0.9, 0.75, 0.5]
      }
    });

    this.items.set('skull', {
      id: 'skull',
      name: 'Human Skull',
      category: 'Barter Items',
      rarity: 'uncommon',
      aliases: ['skull', 'human skull', 'bone'],
      tags: ['medical', 'bone', 'skull'],
      features: {
        colorHistogram: this.generateColorHistogram([220, 210, 190], 0.2), // Bone white colors
        edgeFeatures: [0.6, 0.7, 0.5, 0.4, 0.8, 0.6, 0.5, 0.7, 0.3, 0.6, 0.5, 0.7, 0.6, 0.4, 0.5, 0.6],
        textureFeatures: [0.3, 0.2, 0.4, 0.6, 0.3, 0.2, 0.4, 0.5, 0.4],
        shapeFeatures: [1.1, 0.6, 0.7]
      }
    });

    // Electronics
    this.items.set('flash-drive', {
      id: 'flash-drive',
      name: 'Secure Flash Drive',
      category: 'Electronics',
      rarity: 'rare',
      aliases: ['flash drive', 'usb drive', 'secure flash', 'usb'],
      tags: ['electronics', 'data', 'quest', 'usb'],
      features: {
        colorHistogram: this.generateColorHistogram([60, 60, 60], 0.1), // Dark colors
        edgeFeatures: [0.8, 0.9, 0.7, 0.6, 0.9, 0.8, 0.7, 0.8, 0.5, 0.8, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8],
        textureFeatures: [0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3, 0.2, 0.1],
        shapeFeatures: [3.5, 0.9, 0.2] // Very rectangular
      }
    });

    this.items.set('gpu', {
      id: 'gpu',
      name: 'Graphics Card',
      category: 'Electronics',
      rarity: 'epic',
      aliases: ['graphics card', 'gpu', 'video card'],
      tags: ['electronics', 'computer', 'valuable'],
      features: {
        colorHistogram: this.generateColorHistogram([40, 40, 40], 0.15), // Dark with some green
        edgeFeatures: [0.7, 0.8, 0.6, 0.5, 0.8, 0.7, 0.6, 0.7, 0.4, 0.7, 0.6, 0.8, 0.7, 0.5, 0.6, 0.7],
        textureFeatures: [0.4, 0.3, 0.5, 0.4, 0.2, 0.3, 0.5, 0.4, 0.3],
        shapeFeatures: [2.2, 0.8, 0.3]
      }
    });

    // Weapons
    this.items.set('ak74', {
      id: 'ak74',
      name: 'AK-74 5.45x39 Assault Rifle',
      category: 'Weapons',
      rarity: 'common',
      aliases: ['ak74', 'ak-74', 'kalashnikov'],
      tags: ['weapon', 'rifle', 'assault'],
      features: {
        colorHistogram: this.generateColorHistogram([80, 60, 40], 0.2), // Dark brown/black
        edgeFeatures: [0.5, 0.6, 0.4, 0.3, 0.7, 0.5, 0.4, 0.6, 0.2, 0.5, 0.4, 0.6, 0.5, 0.3, 0.4, 0.5],
        textureFeatures: [0.5, 0.4, 0.6, 0.5, 0.3, 0.4, 0.6, 0.5, 0.4],
        shapeFeatures: [4.5, 0.7, 0.15] // Very long and thin
      }
    });

    // Medical
    this.items.set('morphine', {
      id: 'morphine',
      name: 'Morphine Injector',
      category: 'Medical',
      rarity: 'uncommon',
      aliases: ['morphine', 'injector', 'syringe'],
      tags: ['medical', 'painkiller', 'injection'],
      features: {
        colorHistogram: this.generateColorHistogram([200, 200, 200], 0.1), // White/clear
        edgeFeatures: [0.6, 0.7, 0.5, 0.4, 0.8, 0.6, 0.5, 0.7, 0.3, 0.6, 0.5, 0.7, 0.6, 0.4, 0.5, 0.6],
        textureFeatures: [0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3, 0.2, 0.1],
        shapeFeatures: [6.0, 0.8, 0.1] // Very thin and long
      }
    });

    // Containers
    this.items.set('fuel-conditioner', {
      id: 'fuel-conditioner',
      name: 'Fuel Conditioner',
      category: 'Containers',
      rarity: 'common',
      aliases: ['fuel conditioner', 'fuel', 'blue canister'],
      tags: ['fuel', 'container', 'hideout'],
      features: {
        colorHistogram: this.generateColorHistogram([50, 100, 200], 0.3), // Blue colors
        edgeFeatures: [0.4, 0.5, 0.3, 0.2, 0.6, 0.4, 0.3, 0.5, 0.2, 0.4, 0.3, 0.5, 0.4, 0.2, 0.3, 0.4],
        textureFeatures: [0.3, 0.2, 0.4, 0.3, 0.2, 0.3, 0.4, 0.3, 0.2],
        shapeFeatures: [1.2, 0.9, 0.6]
      }
    });

    // Keys
    this.items.set('factory-key', {
      id: 'factory-key',
      name: 'Factory Emergency Exit Key',
      category: 'Keys',
      rarity: 'legendary',
      aliases: ['factory key', 'emergency exit key', 'exit key'],
      tags: ['key', 'factory', 'exit', 'rare'],
      features: {
        colorHistogram: this.generateColorHistogram([150, 120, 80], 0.1), // Metallic colors
        edgeFeatures: [0.9, 0.8, 0.7, 0.6, 0.9, 0.8, 0.7, 0.8, 0.5, 0.8, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8],
        textureFeatures: [0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1],
        shapeFeatures: [4.0, 0.3, 0.8] // Very thin and elongated
      }
    });

    // Ammo
    this.items.set('545-bp', {
      id: '545-bp',
      name: '5.45x39mm BP Ammo',
      category: 'Ammo',
      rarity: 'uncommon',
      aliases: ['545 bp', '5.45 bp', 'bp ammo'],
      tags: ['ammo', 'ammunition', '545', 'bp'],
      features: {
        colorHistogram: this.generateColorHistogram([120, 100, 60], 0.1), // Brass colors
        edgeFeatures: [0.8, 0.9, 0.7, 0.6, 0.9, 0.8, 0.7, 0.8, 0.5, 0.8, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8],
        textureFeatures: [0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3, 0.2, 0.1],
        shapeFeatures: [3.0, 0.9, 0.1] // Small and cylindrical
      }
    });

    // Mods
    this.items.set('red-dot', {
      id: 'red-dot',
      name: 'Red Dot Sight',
      category: 'Weapon Mods',
      rarity: 'common',
      aliases: ['red dot', 'sight', 'optic'],
      tags: ['mod', 'sight', 'optic', 'weapon'],
      features: {
        colorHistogram: this.generateColorHistogram([40, 40, 40], 0.1), // Black
        edgeFeatures: [0.6, 0.7, 0.5, 0.4, 0.8, 0.6, 0.5, 0.7, 0.3, 0.6, 0.5, 0.7, 0.6, 0.4, 0.5, 0.6],
        textureFeatures: [0.3, 0.2, 0.4, 0.3, 0.2, 0.3, 0.4, 0.3, 0.2],
        shapeFeatures: [1.8, 0.7, 0.4]
      }
    });
  }

  /**
   * Gera histograma de cores baseado em cor dominante
   */
  private generateColorHistogram(dominantRGB: [number, number, number], spread: number): number[] {
    const histogram = new Array(256).fill(0);
    const [r, g, b] = dominantRGB;
    
    // Converte RGB para escala de cinza
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    // Cria distribuição gaussiana ao redor da cor dominante
    for (let i = 0; i < 256; i++) {
      const distance = Math.abs(i - gray) / 255;
      const weight = Math.exp(-distance * distance / (2 * spread * spread));
      histogram[i] = weight;
    }
    
    // Normaliza
    const sum = histogram.reduce((a, b) => a + b, 0);
    return histogram.map(val => val / sum);
  }
}

// Instância singleton
export const tarkovReferenceDB = new TarkovReferenceDatabase();