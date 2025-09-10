import { AdvancedImageProcessor, ImageFeatures } from './advanced-image-processing';
import { tarkovReferenceDB, TarkovItemReference } from './tarkov-reference-database';

// Tipos para configuração e resultados
export interface MatcherConfig {
  confidenceThreshold: number;
  maxResults: number;
  enableMultiItemDetection: boolean;
  enableEdgeDetection: boolean;
  enableColorAnalysis: boolean;
  minRegionSize: number;
  maxRegionSize: number;
}

export interface DetectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: 'inventory_slot' | 'item_icon' | 'unknown';
}

export interface ProcessingStats {
  totalPixels: number;
  regionsDetected: number;
  regionsAnalyzed: number;
  matchesFound: number;
  processingTime: number;
  memoryUsage: number;
}

// Constantes de configuração
export const DEFAULT_CONFIG: MatcherConfig = {
  confidenceThreshold: 0.6,
  maxResults: 10,
  enableMultiItemDetection: true,
  enableEdgeDetection: true,
  enableColorAnalysis: true,
  minRegionSize: 1000,
  maxRegionSize: 0.3
};

// Constantes para detecção de regiões
const INVENTORY_SLOT_SIZE = 64; // Tamanho padrão de slot no Tarkov
const EDGE_THRESHOLD = 128;
const GRID_SIZE = 20;
const MIN_EDGE_DENSITY = 0.1; // 10% da região deve ter bordas

export interface MatchResult {
  item: TarkovItemReference;
  confidence: number;
  matchType: 'exact' | 'similar' | 'partial';
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  features: ImageFeatures;
}

export interface MultiItemResult {
  items: MatchResult[];
  totalConfidence: number;
  processingTime: number;
  stats: ProcessingStats;
  regions: DetectionRegion[];
  config: MatcherConfig;
}

/**
 * Sistema inteligente de matching de itens do Tarkov
 * Combina processamento de imagem avançado com base de dados de referência
 * Versão otimizada com melhor performance e precisão
 */
export class IntelligentItemMatcher {
  private imageProcessor: AdvancedImageProcessor;
  private config: MatcherConfig;
  private cache: Map<string, MatchResult[]> = new Map();
  private performanceMetrics: ProcessingStats[] = [];

  constructor(config: Partial<MatcherConfig> = {}) {
    this.imageProcessor = new AdvancedImageProcessor();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Identifica todos os itens em uma imagem com processamento otimizado
   */
  async identifyItems(imageFile: File): Promise<MultiItemResult> {
    const startTime = performance.now();
    const memoryStart = this.getMemoryUsage();
    
    try {
      // Verifica cache primeiro
      const cacheKey = await this.generateCacheKey(imageFile);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        return {
          ...cached[0] as any,
          processingTime: performance.now() - startTime,
          stats: this.createStats(0, 0, 0, cached.length, startTime, memoryStart)
        };
      }
      
      // Processa a imagem
      const canvas = await this.loadImageToCanvas(imageFile);
      const totalPixels = canvas.width * canvas.height;
      
      // Detecta regiões de interesse com algoritmo otimizado
      const regions = await this.detectItemRegionsOptimized(canvas);
      
      // Analisa cada região em paralelo (quando possível)
      const matches: MatchResult[] = [];
      let regionsAnalyzed = 0;
      
      for (const region of regions) {
        try {
          const regionCanvas = this.extractRegion(canvas, region);
          const features = await this.imageProcessor.extractFeatures(regionCanvas);
          
          // Busca correspondências na base de dados
          const candidates = tarkovReferenceDB.findSimilarItems(features, 5);
          
          if (candidates.length > 0 && candidates[0].similarity >= this.config.confidenceThreshold) {
            const bestMatch = candidates[0];
            
            matches.push({
              item: bestMatch.item,
              confidence: bestMatch.similarity,
              matchType: this.determineMatchType(bestMatch.similarity),
              boundingBox: region,
              features
            });
          }
          
          regionsAnalyzed++;
        } catch (error) {
          console.warn('Erro ao processar região:', error);
        }
      }
      
      // Remove duplicatas e ordena por confiança
      const uniqueMatches = this.removeDuplicates(matches);
      uniqueMatches.sort((a, b) => b.confidence - a.confidence);
      
      const processingTime = performance.now() - startTime;
      const finalResults = uniqueMatches.slice(0, this.config.maxResults);
      
      // Salva no cache
      this.cache.set(cacheKey, finalResults);
      
      // Cria estatísticas
      const stats = this.createStats(
        totalPixels,
        regions.length,
        regionsAnalyzed,
        finalResults.length,
        startTime,
        memoryStart
      );
      
      // Salva métricas de performance
      this.performanceMetrics.push(stats);
      
      return {
        items: finalResults,
        totalConfidence: this.calculateTotalConfidence(finalResults),
        processingTime,
        stats,
        regions: regions.map(r => ({
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          confidence: 0.8, // Placeholder
          type: 'inventory_slot' as const
        })),
        config: this.config
      };
      
    } catch (error) {
      console.error('Erro ao identificar itens:', error);
      return {
        items: [],
        totalConfidence: 0,
        processingTime: performance.now() - startTime,
        stats: this.createStats(0, 0, 0, 0, startTime, memoryStart),
        regions: [],
        config: this.config
      };
    }
  }

  /**
   * Identifica um item específico selecionado pelo usuário
   */
  async identifySelectedItem(
    imageFile: File, 
    selectionArea: { x: number; y: number; width: number; height: number }
  ): Promise<MatchResult | null> {
    try {
      const canvas = await this.loadImageToCanvas(imageFile);
      const regionCanvas = this.extractRegion(canvas, selectionArea);
      
      // Aplica pré-processamento específico para seleção manual
      const enhancedCanvas = await this.enhanceSelectedRegion(regionCanvas);
      const features = await this.imageProcessor.extractFeatures(enhancedCanvas);
      
      // Busca com maior precisão
      const candidates = tarkovReferenceDB.findSimilarItems(features, 3);
      
      if (candidates.length > 0) {
        const bestMatch = candidates[0];
        
        // Para seleção manual, usamos threshold mais baixo
        if (bestMatch.similarity >= 0.4) {
          return {
            item: bestMatch.item,
            confidence: bestMatch.similarity,
            matchType: this.determineMatchType(bestMatch.similarity),
            boundingBox: selectionArea,
            features
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao identificar item selecionado:', error);
      return null;
    }
  }

  /**
   * Busca por texto/nome do item
   */
  searchByName(query: string): TarkovItemReference[] {
    const normalizedQuery = query.toLowerCase().trim();
    const allItems = tarkovReferenceDB.getAllItems();
    
    return allItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
      const aliasMatch = item.aliases.some(alias => 
        alias.toLowerCase().includes(normalizedQuery)
      );
      const tagMatch = item.tags.some(tag => 
        tag.toLowerCase().includes(normalizedQuery)
      );
      
      return nameMatch || aliasMatch || tagMatch;
    }).slice(0, this.config.maxResults);
  }

  /**
   * Detecta regiões de interesse na imagem com algoritmo otimizado
   */
  private async detectItemRegionsOptimized(canvas: HTMLCanvasElement): Promise<Array<{
    x: number; y: number; width: number; height: number;
  }>> {
    if (!this.config.enableMultiItemDetection) {
      return [];
    }
    
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Detecta bordas se habilitado
    let edges: ImageData | null = null;
    if (this.config.enableEdgeDetection) {
      edges = await this.imageProcessor.detectEdges(canvas);
    }
    
    // Múltiplas estratégias de detecção
    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    // 1. Detecção baseada em bordas
    if (edges) {
      const edgeRegions = this.findRectangularRegions(edges, canvas.width, canvas.height);
      regions.push(...edgeRegions);
    }
    
    // 2. Detecção baseada em grid (slots de inventário)
    const gridRegions = this.detectInventoryGrid(canvas);
    regions.push(...gridRegions);
    
    // 3. Detecção baseada em cor (se habilitado)
    if (this.config.enableColorAnalysis) {
      const colorRegions = this.detectColorBasedRegions(imageData);
      regions.push(...colorRegions);
    }
    
    // Remove duplicatas e filtra por tamanho
    const uniqueRegions = this.removeDuplicateRegions(regions);
    
    return uniqueRegions.filter(region => {
      const area = region.width * region.height;
      const minArea = this.config.minRegionSize;
      const maxArea = (canvas.width * canvas.height) * this.config.maxRegionSize;
      
      return area >= minArea && area <= maxArea;
    });
  }

  /**
   * Encontra regiões retangulares na imagem de bordas
   */
  private findRectangularRegions(
    edgeData: ImageData, 
    width: number, 
    height: number
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const visited = new Set<string>();
    const threshold = 128;
    
    // Grid search para encontrar regiões retangulares
    const gridSize = 20;
    
    for (let y = 0; y < height - gridSize; y += gridSize) {
      for (let x = 0; x < width - gridSize; x += gridSize) {
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        
        // Verifica se há bordas suficientes nesta região
        const edgeCount = this.countEdgesInRegion(edgeData, x, y, gridSize, gridSize, threshold);
        
        if (edgeCount > gridSize * 2) { // Bordas suficientes para ser um item
          // Expande a região para encontrar os limites do item
          const expandedRegion = this.expandRegion(edgeData, x, y, width, height, threshold);
          
          if (expandedRegion) {
            regions.push(expandedRegion);
            
            // Marca área como visitada
            for (let vy = expandedRegion.y; vy < expandedRegion.y + expandedRegion.height; vy += gridSize) {
              for (let vx = expandedRegion.x; vx < expandedRegion.x + expandedRegion.width; vx += gridSize) {
                visited.add(`${vx},${vy}`);
              }
            }
          }
        }
      }
    }
    
    return regions;
  }

  /**
   * Conta bordas em uma região específica
   */
  private countEdgesInRegion(
    edgeData: ImageData, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    threshold: number
  ): number {
    let count = 0;
    const data = edgeData.data;
    
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const px = x + dx;
        const py = y + dy;
        
        if (px >= edgeData.width || py >= edgeData.height) continue;
        
        const index = (py * edgeData.width + px) * 4;
        const intensity = data[index]; // Canal R (escala de cinza)
        
        if (intensity > threshold) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Expande uma região para encontrar os limites completos do item
   */
  private expandRegion(
    edgeData: ImageData, 
    startX: number, 
    startY: number, 
    maxWidth: number, 
    maxHeight: number, 
    threshold: number
  ): { x: number; y: number; width: number; height: number } | null {
    // Implementação simplificada - expande em todas as direções
    let minX = startX;
    let maxX = startX + 20;
    let minY = startY;
    let maxY = startY + 20;
    
    // Expande para a esquerda
    while (minX > 0 && this.hasEdgesInColumn(edgeData, minX, minY, maxY - minY, threshold)) {
      minX -= 5;
    }
    
    // Expande para a direita
    while (maxX < maxWidth && this.hasEdgesInColumn(edgeData, maxX, minY, maxY - minY, threshold)) {
      maxX += 5;
    }
    
    // Expande para cima
    while (minY > 0 && this.hasEdgesInRow(edgeData, minY, minX, maxX - minX, threshold)) {
      minY -= 5;
    }
    
    // Expande para baixo
    while (maxY < maxHeight && this.hasEdgesInRow(edgeData, maxY, minX, maxX - minX, threshold)) {
      maxY += 5;
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Verifica se a região tem tamanho válido
    if (width > 30 && height > 30 && width < maxWidth * 0.8 && height < maxHeight * 0.8) {
      return { x: minX, y: minY, width, height };
    }
    
    return null;
  }

  /**
   * Verifica se há bordas em uma coluna
   */
  private hasEdgesInColumn(
    edgeData: ImageData, 
    x: number, 
    startY: number, 
    height: number, 
    threshold: number
  ): boolean {
    const data = edgeData.data;
    let edgeCount = 0;
    
    for (let y = startY; y < startY + height && y < edgeData.height; y++) {
      if (x >= edgeData.width) continue;
      
      const index = (y * edgeData.width + x) * 4;
      if (data[index] > threshold) {
        edgeCount++;
      }
    }
    
    return edgeCount > height * 0.1; // 10% da altura deve ter bordas
  }

  /**
   * Verifica se há bordas em uma linha
   */
  private hasEdgesInRow(
    edgeData: ImageData, 
    y: number, 
    startX: number, 
    width: number, 
    threshold: number
  ): boolean {
    const data = edgeData.data;
    let edgeCount = 0;
    
    for (let x = startX; x < startX + width && x < edgeData.width; x++) {
      if (y >= edgeData.height) continue;
      
      const index = (y * edgeData.width + x) * 4;
      if (data[index] > threshold) {
        edgeCount++;
      }
    }
    
    return edgeCount > width * 0.1; // 10% da largura deve ter bordas
  }

  /**
   * Extrai uma região específica da imagem
   */
  private extractRegion(
    canvas: HTMLCanvasElement, 
    region: { x: number; y: number; width: number; height: number }
  ): HTMLCanvasElement {
    const regionCanvas = document.createElement('canvas');
    regionCanvas.width = region.width;
    regionCanvas.height = region.height;
    
    const ctx = regionCanvas.getContext('2d')!;
    ctx.drawImage(
      canvas,
      region.x, region.y, region.width, region.height,
      0, 0, region.width, region.height
    );
    
    return regionCanvas;
  }

  /**
   * Melhora uma região selecionada manualmente
   */
  private async enhanceSelectedRegion(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Aplica filtros de melhoria específicos para seleção manual
    for (let i = 0; i < data.length; i += 4) {
      // Aumenta contraste
      const contrast = 1.2;
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
      
      // Aumenta nitidez
      const brightness = 1.1;
      data[i] = Math.min(255, data[i] * brightness);
      data[i + 1] = Math.min(255, data[i + 1] * brightness);
      data[i + 2] = Math.min(255, data[i + 2] * brightness);
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Carrega imagem para canvas
   */
  private async loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Remove resultados duplicados
   */
  private removeDuplicates(matches: MatchResult[]): MatchResult[] {
    const seen = new Set<string>();
    return matches.filter(match => {
      const key = match.item.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Determina o tipo de correspondência baseado na confiança
   */
  private determineMatchType(confidence: number): 'exact' | 'similar' | 'partial' {
    if (confidence >= 0.9) return 'exact';
    if (confidence >= 0.7) return 'similar';
    return 'partial';
  }

  /**
   * Calcula confiança total do resultado
   */
  private calculateTotalConfidence(matches: MatchResult[]): number {
    if (matches.length === 0) return 0;
    
    const sum = matches.reduce((acc, match) => acc + match.confidence, 0);
    return sum / matches.length;
  }

  /**
   * Detecta grid de inventário baseado em padrões conhecidos
   */
  private detectInventoryGrid(canvas: HTMLCanvasElement): Array<{
    x: number; y: number; width: number; height: number;
  }> {
    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const ctx = canvas.getContext('2d')!;
    
    // Procura por padrões de grid típicos do Tarkov
    const gridSpacing = INVENTORY_SLOT_SIZE;
    const margin = 10;
    
    for (let y = margin; y < canvas.height - gridSpacing; y += gridSpacing) {
      for (let x = margin; x < canvas.width - gridSpacing; x += gridSpacing) {
        // Verifica se há conteúdo neste slot
        if (this.hasContentInRegion(ctx, x, y, gridSpacing, gridSpacing)) {
          regions.push({
            x: x + 2, // Margem interna
            y: y + 2,
            width: gridSpacing - 4,
            height: gridSpacing - 4
          });
        }
      }
    }
    
    return regions;
  }
  
  /**
   * Detecta regiões baseadas em análise de cor
   */
  private detectColorBasedRegions(imageData: ImageData): Array<{
    x: number; y: number; width: number; height: number;
  }> {
    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Detecta regiões com cores saturadas (típicas de itens)
    const visited = new Set<string>();
    
    for (let y = 0; y < height - 20; y += 10) {
      for (let x = 0; x < width - 20; x += 10) {
        const key = `${Math.floor(x/20)*20},${Math.floor(y/20)*20}`;
        if (visited.has(key)) continue;
        
        if (this.isColorfulRegion(data, x, y, width, height)) {
          const region = this.expandColorRegion(data, x, y, width, height);
          if (region) {
            regions.push(region);
            visited.add(key);
          }
        }
      }
    }
    
    return regions;
  }
  
  /**
   * Verifica se uma região tem conteúdo (não é transparente/vazia)
   */
  private hasContentInRegion(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    let nonTransparentPixels = 0;
    const totalPixels = width * height;
    
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 50) { // Alpha > 50
        nonTransparentPixels++;
      }
    }
    
    return (nonTransparentPixels / totalPixels) > 0.1; // 10% de pixels não transparentes
  }
  
  /**
   * Verifica se uma região tem cores saturadas
   */
  private isColorfulRegion(
    data: Uint8ClampedArray, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean {
    let colorfulPixels = 0;
    const sampleSize = Math.min(20, Math.min(width - x, height - y));
    
    for (let dy = 0; dy < sampleSize; dy++) {
      for (let dx = 0; dx < sampleSize; dx++) {
        const px = x + dx;
        const py = y + dy;
        
        if (px >= width || py >= height) continue;
        
        const index = (py * width + px) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Calcula saturação
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max > 0 ? (max - min) / max : 0;
        
        if (saturation > 0.3) { // 30% de saturação
          colorfulPixels++;
        }
      }
    }
    
    return (colorfulPixels / (sampleSize * sampleSize)) > 0.2; // 20% de pixels coloridos
  }
  
  /**
   * Expande uma região baseada em cor
   */
  private expandColorRegion(
    data: Uint8ClampedArray, 
    startX: number, 
    startY: number, 
    width: number, 
    height: number
  ): { x: number; y: number; width: number; height: number } | null {
    // Implementação simplificada - expande em todas as direções
    let minX = startX;
    let maxX = startX + 20;
    let minY = startY;
    let maxY = startY + 20;
    
    // Expande até encontrar bordas
    while (minX > 0 && this.isColorfulRegion(data, minX - 5, minY, width, height)) {
      minX -= 5;
    }
    while (maxX < width && this.isColorfulRegion(data, maxX, minY, width, height)) {
      maxX += 5;
    }
    while (minY > 0 && this.isColorfulRegion(data, minX, minY - 5, width, height)) {
      minY -= 5;
    }
    while (maxY < height && this.isColorfulRegion(data, minX, maxY, width, height)) {
      maxY += 5;
    }
    
    const regionWidth = maxX - minX;
    const regionHeight = maxY - minY;
    
    if (regionWidth > 30 && regionHeight > 30) {
      return { x: minX, y: minY, width: regionWidth, height: regionHeight };
    }
    
    return null;
  }
  
  /**
   * Remove regiões duplicadas
   */
  private removeDuplicateRegions(
    regions: Array<{ x: number; y: number; width: number; height: number }>
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const unique: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    for (const region of regions) {
      const isDuplicate = unique.some(existing => {
        const overlap = this.calculateOverlap(region, existing);
        return overlap > 0.5; // 50% de sobreposição
      });
      
      if (!isDuplicate) {
        unique.push(region);
      }
    }
    
    return unique;
  }
  
  /**
   * Calcula sobreposição entre duas regiões
   */
  private calculateOverlap(
    region1: { x: number; y: number; width: number; height: number },
    region2: { x: number; y: number; width: number; height: number }
  ): number {
    const x1 = Math.max(region1.x, region2.x);
    const y1 = Math.max(region1.y, region2.y);
    const x2 = Math.min(region1.x + region1.width, region2.x + region2.width);
    const y2 = Math.min(region1.y + region1.height, region2.y + region2.height);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const overlapArea = (x2 - x1) * (y2 - y1);
    const region1Area = region1.width * region1.height;
    const region2Area = region2.width * region2.height;
    
    return overlapArea / Math.min(region1Area, region2Area);
  }
  
  /**
   * Gera chave de cache para uma imagem
   */
  private async generateCacheKey(imageFile: File): Promise<string> {
    const arrayBuffer = await imageFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Obtém uso de memória atual
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
  
  /**
   * Cria estatísticas de processamento
   */
  private createStats(
    totalPixels: number,
    regionsDetected: number,
    regionsAnalyzed: number,
    matchesFound: number,
    startTime: number,
    memoryStart: number
  ): ProcessingStats {
    return {
      totalPixels,
      regionsDetected,
      regionsAnalyzed,
      matchesFound,
      processingTime: performance.now() - startTime,
      memoryUsage: this.getMemoryUsage() - memoryStart
    };
  }
  
  /**
   * Configura parâmetros do matcher
   */
  setParameters(params: Partial<MatcherConfig>): void {
    this.config = { ...this.config, ...params };
    
    // Valida parâmetros
    if (this.config.confidenceThreshold !== undefined) {
      this.config.confidenceThreshold = Math.max(0, Math.min(1, this.config.confidenceThreshold));
    }
    if (this.config.maxResults !== undefined) {
      this.config.maxResults = Math.max(1, this.config.maxResults);
    }
    if (this.config.minRegionSize !== undefined) {
      this.config.minRegionSize = Math.max(100, this.config.minRegionSize);
    }
    if (this.config.maxRegionSize !== undefined) {
      this.config.maxRegionSize = Math.max(0.1, Math.min(1, this.config.maxRegionSize));
    }
  }
  
  /**
   * Obtém métricas de performance
   */
  getPerformanceMetrics(): ProcessingStats[] {
    return [...this.performanceMetrics];
  }
  
  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Obtém configuração atual
   */
  getConfig(): MatcherConfig {
    return { ...this.config };
  }
}

// Instância singleton com configuração otimizada
export const intelligentItemMatcher = new IntelligentItemMatcher({
  confidenceThreshold: 0.7,
  maxResults: 15,
  enableMultiItemDetection: true,
  enableEdgeDetection: true,
  enableColorAnalysis: true,
  minRegionSize: 800,
  maxRegionSize: 0.25
});

// Funções utilitárias para uso comum
export const createOptimizedMatcher = (config?: Partial<MatcherConfig>) => {
  return new IntelligentItemMatcher(config);
};

export const createFastMatcher = () => {
  return new IntelligentItemMatcher({
    confidenceThreshold: 0.8,
    maxResults: 5,
    enableMultiItemDetection: false,
    enableEdgeDetection: true,
    enableColorAnalysis: false,
    minRegionSize: 1000,
    maxRegionSize: 0.2
  });
};

export const createPreciseMatcher = () => {
  return new IntelligentItemMatcher({
    confidenceThreshold: 0.6,
    maxResults: 20,
    enableMultiItemDetection: true,
    enableEdgeDetection: true,
    enableColorAnalysis: true,
    minRegionSize: 500,
    maxRegionSize: 0.4
  });
};