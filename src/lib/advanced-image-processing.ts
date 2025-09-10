// Simulação da API Jimp para desenvolvimento
interface JimpImage {
  getWidth(): number;
  getHeight(): number;
  getPixelColor(x: number, y: number): number;
  setPixelColor(color: number, x: number, y: number): this;
  clone(): JimpImage;
  crop(x: number, y: number, w: number, h: number): JimpImage;
  resize(w: number, h: number): JimpImage;
  quality(q: number): JimpImage;
  grayscale(): JimpImage;
  getBuffer(mime: string, cb: (err: Error | null, buffer: Buffer) => void): void;
  scan(x: number, y: number, w: number, h: number, cb: (x: number, y: number, idx: number) => void): this;
  bitmap: {
    data: Uint8ClampedArray;
  };
}

class MockJimp implements JimpImage {
  private width: number = 0;
  private height: number = 0;
  private pixels: Uint8ClampedArray = new Uint8ClampedArray(0);
  public bitmap: { data: Uint8ClampedArray };

  constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.bitmap = { data: this.pixels };
  }

  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
  
  getPixelColor(x: number, y: number): number {
    const idx = (y * this.width + x) * 4;
    const r = this.pixels[idx];
    const g = this.pixels[idx + 1];
    const b = this.pixels[idx + 2];
    const a = this.pixels[idx + 3];
    return (r << 24) | (g << 16) | (b << 8) | a;
  }
  
  setPixelColor(color: number, x: number, y: number): this {
    const idx = (y * this.width + x) * 4;
    this.pixels[idx] = (color >>> 24) & 0xFF;
    this.pixels[idx + 1] = (color >>> 16) & 0xFF;
    this.pixels[idx + 2] = (color >>> 8) & 0xFF;
    this.pixels[idx + 3] = color & 0xFF;
    return this;
  }
  
  clone(): JimpImage {
    const cloned = new MockJimp(this.width, this.height);
    cloned.pixels = new Uint8ClampedArray(this.pixels);
    return cloned;
  }
  
  crop(x: number, y: number, w: number, h: number): JimpImage {
    return new MockJimp(w, h);
  }
  
  resize(w: number, h: number): JimpImage {
    return new MockJimp(w, h);
  }
  
  quality(q: number): JimpImage {
    return this;
  }
  
  grayscale(): JimpImage {
    const grayImage = new MockJimp(this.width, this.height);
    grayImage.pixels = new Uint8ClampedArray(this.pixels);
    
    // Converte para escala de cinza
    for (let i = 0; i < this.pixels.length; i += 4) {
      const r = this.pixels[i];
      const g = this.pixels[i + 1];
      const b = this.pixels[i + 2];
      const a = this.pixels[i + 3];
      
      // Fórmula padrão para conversão RGB para escala de cinza
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      grayImage.pixels[i] = gray;     // R
      grayImage.pixels[i + 1] = gray; // G
      grayImage.pixels[i + 2] = gray; // B
      grayImage.pixels[i + 3] = a;    // A
    }
    
    return grayImage;
  }
  
  getBuffer(mime: string, cb: (err: Error | null, buffer: Buffer) => void): void {
    cb(null, Buffer.from([]));
  }

  scan(x: number, y: number, w: number, h: number, cb: (x: number, y: number, idx: number) => void): this {
    for (let _y = y; _y < y + h && _y < this.height; _y++) {
      for (let _x = x; _x < x + w && _x < this.width; _x++) {
        const idx = (this.width * _y + _x) << 2;
        cb(_x, _y, idx);
      }
    }
    return this;
  }
}

type Jimp = JimpImage;

// Mock da função read do Jimp
const mockJimpRead = async (input: File | Buffer | string): Promise<Jimp> => {
  if (input instanceof File) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(new MockJimp(img.width || 800, img.height || 600));
      };
      img.src = URL.createObjectURL(input);
    });
  }
  return new MockJimp(800, 600);
};

const Jimp = {
  read: mockJimpRead,
  create: async (width: number, height: number, color: number) => {
    const image = new MockJimp(width, height);
    // Preenche com a cor especificada
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      image.bitmap.data[idx] = (color >> 24) & 255;     // R
      image.bitmap.data[idx + 1] = (color >> 16) & 255; // G
      image.bitmap.data[idx + 2] = (color >> 8) & 255;  // B
      image.bitmap.data[idx + 3] = color & 255;         // A
    }
    return image;
  },
  intToRGBA: (int: number) => ({
    r: (int >> 24) & 255,
    g: (int >> 16) & 255,
    b: (int >> 8) & 255,
    a: int & 255
  }),
  rgbaToInt: (r: number, g: number, b: number, a: number) => {
    return ((r & 255) << 24) | ((g & 255) << 16) | ((b & 255) << 8) | (a & 255);
  }
};
import * as tf from '@tensorflow/tfjs';

export interface ImageProcessingResult {
  detectedItems: DetectedItem[];
  confidence: number;
  processingTime: number;
  metadata: ImageMetadata;
}

export interface DetectedItem {
  itemId: string;
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
  features: ImageFeatures;
  category: string;
  rarity: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageFeatures {
  colorHistogram: number[];
  edgeFeatures: number[];
  textureFeatures: number[];
  shapeFeatures: number[];
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  quality: number;
  hasMultipleItems: boolean;
  backgroundType: 'inventory' | 'stash' | 'ground' | 'unknown';
}

export class AdvancedImageProcessor {
  private referenceDatabase: Map<string, ImageFeatures> = new Map();
  private model: tf.LayersModel | null = null;
  
  constructor() {
    this.initializeReferenceDatabase();
  }

  /**
   * Processa uma imagem e detecta todos os itens do Tarkov presentes
   */
  async processImage(imageFile: File): Promise<ImageProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Carrega e pré-processa a imagem
      const image = await this.loadAndPreprocessImage(imageFile);
      const metadata = await this.extractImageMetadata(image);
      
      // Detecta múltiplos itens na imagem
      const detectedRegions = await this.detectItemRegions(image);
      
      // Identifica cada item detectado
      const detectedItems: DetectedItem[] = [];
      
      for (const region of detectedRegions) {
        const croppedItem = await this.cropImageRegion(image, region);
        const features = await this.extractImageFeatures(croppedItem);
        const identification = await this.identifyItem(features);
        
        if (identification.confidence > 0.3) {
          detectedItems.push({
            ...identification,
            boundingBox: region,
            features
          });
        }
      }
      
      // Calcula confiança geral baseada em múltiplos fatores
      const overallConfidence = this.calculateOverallConfidence(detectedItems, metadata);
      
      return {
        detectedItems,
        confidence: overallConfidence,
        processingTime: Date.now() - startTime,
        metadata
      };
    } catch (error) {
      console.error('Erro no processamento de imagem:', error);
      throw new Error('Falha no processamento da imagem');
    }
  }

  /**
   * Carrega e aplica pré-processamento na imagem
   */
  private async loadAndPreprocessImage(file: File): Promise<Jimp> {
    try {
      const image = await Jimp.read(file);
      
      // Aplicar filtros de melhoria
      return image
        .resize(800, 600) // Normalizar tamanho
        .quality(90); // Melhorar qualidade
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      throw new Error('Falha ao processar imagem');
    }
  }

  /**
   * Extrai metadados da imagem
   */
  private async extractImageMetadata(image: Jimp): Promise<ImageMetadata> {
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Detecta tipo de background baseado em características da imagem
    const backgroundType = await this.detectBackgroundType(image);
    
    // Detecta se há múltiplos itens
    const hasMultipleItems = await this.detectMultipleItems(image);
    
    return {
      width,
      height,
      format: 'processed',
      quality: await this.calculateImageQuality(image),
      hasMultipleItems,
      backgroundType
    };
  }

  /**
   * Detecta regiões que podem conter itens
   */
  private async detectItemRegions(image: Jimp): Promise<BoundingBox[]> {
    const regions: BoundingBox[] = [];
    
    // Converte para escala de cinza para análise de bordas
    const grayImage = image.clone().grayscale();
    
    // Detecta bordas usando filtro Sobel
    const edges = await this.detectEdgesJimp(grayImage);
    
    // Encontra contornos e regiões de interesse
    const contours = await this.findContours(edges);
    
    // Filtra contornos por tamanho e forma
    for (const contour of contours) {
      const boundingBox = this.getBoundingBox(contour);
      
      // Filtra por tamanho mínimo e máximo
      if (this.isValidItemSize(boundingBox, image)) {
        regions.push(boundingBox);
      }
    }
    
    // Se não encontrou regiões específicas, usa a imagem inteira
    if (regions.length === 0) {
      regions.push({
        x: 0,
        y: 0,
        width: image.getWidth(),
        height: image.getHeight()
      });
    }
    
    return regions;
  }

  /**
   * Detecta bordas na imagem usando filtro Sobel
   */
  private async detectEdgesJimp(image: Jimp): Promise<Jimp> {
    const width = image.getWidth();
    const height = image.getHeight();
    const edgeImage = await Jimp.create(width, height, 0x000000ff);
    
    // Kernels Sobel
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        // Aplica kernels Sobel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = Jimp.intToRGBA(image.getPixelColor(x + kx, y + ky));
            const gray = pixel.r; // Já está em escala de cinza
            
            gx += gray * sobelX[ky + 1][kx + 1];
            gy += gray * sobelY[ky + 1][kx + 1];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const edgeValue = Math.min(255, magnitude);
        
        edgeImage.setPixelColor(
          Jimp.rgbaToInt(edgeValue, edgeValue, edgeValue, 255),
          x,
          y
        );
      }
    }
    
    return edgeImage;
  }

  /**
   * Encontra contornos na imagem de bordas
   */
  private async findContours(edgeImage: Jimp): Promise<Array<Array<{x: number, y: number}>>> {
    const contours: Array<Array<{x: number, y: number}>> = [];
    const width = edgeImage.getWidth();
    const height = edgeImage.getHeight();
    const visited = new Array(height).fill(null).map(() => new Array(width).fill(false));
    
    const threshold = 100; // Limiar para detecção de borda
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y][x]) {
          const pixel = Jimp.intToRGBA(edgeImage.getPixelColor(x, y));
          
          if (pixel.r > threshold) {
            const contour = this.traceContour(edgeImage, x, y, visited, threshold);
            if (contour.length > 20) { // Filtro por tamanho mínimo
              contours.push(contour);
            }
          }
        }
      }
    }
    
    return contours;
  }

  /**
   * Traça um contorno a partir de um ponto inicial
   */
  private traceContour(
    image: Jimp,
    startX: number,
    startY: number,
    visited: boolean[][],
    threshold: number
  ): Array<{x: number, y: number}> {
    const contour: Array<{x: number, y: number}> = [];
    const stack = [{x: startX, y: startY}];
    
    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      
      if (x < 0 || x >= image.getWidth() || y < 0 || y >= image.getHeight() || visited[y][x]) {
        continue;
      }
      
      const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
      if (pixel.r <= threshold) {
        continue;
      }
      
      visited[y][x] = true;
      contour.push({x, y});
      
      // Adiciona vizinhos
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx !== 0 || dy !== 0) {
            stack.push({x: x + dx, y: y + dy});
          }
        }
      }
    }
    
    return contour;
  }

  /**
   * Calcula bounding box de um contorno
   */
  private getBoundingBox(contour: Array<{x: number, y: number}>): BoundingBox {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const point of contour) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Verifica se o tamanho da região é válido para um item
   */
  private isValidItemSize(boundingBox: BoundingBox, image: Jimp): boolean {
    const minSize = 20;
    const maxSizeRatio = 0.8;
    
    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();
    
    return (
      boundingBox.width >= minSize &&
      boundingBox.height >= minSize &&
      boundingBox.width <= imageWidth * maxSizeRatio &&
      boundingBox.height <= imageHeight * maxSizeRatio
    );
  }

  /**
   * Recorta uma região específica da imagem
   */
  private async cropImageRegion(image: Jimp, region: BoundingBox): Promise<Jimp> {
    return image.clone().crop(region.x, region.y, region.width, region.height);
  }

  /**
   * Extrai características visuais de uma imagem (método público)
   */
  async extractFeatures(canvas: HTMLCanvasElement): Promise<ImageFeatures> {
    // Converte canvas para formato mock Jimp
    const mockImage = new MockJimp(canvas.width, canvas.height);
    return this.extractImageFeatures(mockImage);
  }

  /**
   * Detecta bordas em um canvas (método público)
   */
  async detectEdges(canvas: HTMLCanvasElement): Promise<ImageData> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const edgeData = new ImageData(canvas.width, canvas.height);
    
    // Aplica filtro de detecção de bordas simples
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        
        // Calcula gradiente usando diferenças simples
        const gx = data[idx + 4] - data[idx - 4]; // direita - esquerda
        const gy = data[idx + canvas.width * 4] - data[idx - canvas.width * 4]; // baixo - cima
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const edgeValue = Math.min(255, magnitude);
        
        edgeData.data[idx] = edgeValue;
        edgeData.data[idx + 1] = edgeValue;
        edgeData.data[idx + 2] = edgeValue;
        edgeData.data[idx + 3] = 255;
      }
    }
    
    return edgeData;
  }

  /**
   * Melhora o contraste de um canvas (método público)
   */
  async enhanceContrast(canvas: HTMLCanvasElement, factor: number = 1.5): Promise<void> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Aplica fator de contraste aos canais RGB
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
      // Alpha permanece inalterado
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
 
  /**
   * Extrai características visuais de uma imagem
   */
  private async extractImageFeatures(image: Jimp): Promise<ImageFeatures> {
    const colorHistogram = await this.extractColorHistogram(image);
    const edgeFeatures = await this.extractEdgeFeatures(image);
    const textureFeatures = await this.extractTextureFeatures(image);
    const shapeFeatures = await this.extractShapeFeatures(image);
    
    return {
      colorHistogram,
      edgeFeatures,
      textureFeatures,
      shapeFeatures
    };
  }

  /**
   * Extrai histograma de cores
   */
  private async extractColorHistogram(image: Jimp): Promise<number[]> {
    const histogram = new Array(256).fill(0);
    const width = image.getWidth();
    const height = image.getHeight();
    
    image.scan(0, 0, width, height, (x, y, idx) => {
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      
      // Converte para escala de cinza
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      histogram[gray]++;
    });
    
    // Normaliza o histograma
    const total = width * height;
    return histogram.map(count => count / total);
  }

  /**
   * Extrai características de bordas
   */
  private async extractEdgeFeatures(image: Jimp): Promise<number[]> {
    const edges = await this.detectEdgesJimp(image.clone().grayscale());
    const features: number[] = [];
    
    // Conta pixels de borda por região
    const regions = 4; // Divide em 4 quadrantes
    const regionWidth = edges.getWidth() / regions;
    const regionHeight = edges.getHeight() / regions;
    
    for (let ry = 0; ry < regions; ry++) {
      for (let rx = 0; rx < regions; rx++) {
        let edgeCount = 0;
        let totalPixels = 0;
        
        const startX = Math.floor(rx * regionWidth);
        const startY = Math.floor(ry * regionHeight);
        const endX = Math.floor((rx + 1) * regionWidth);
        const endY = Math.floor((ry + 1) * regionHeight);
        
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const pixel = Jimp.intToRGBA(edges.getPixelColor(x, y));
            if (pixel.r > 100) edgeCount++;
            totalPixels++;
          }
        }
        
        features.push(totalPixels > 0 ? edgeCount / totalPixels : 0);
      }
    }
    
    return features;
  }

  /**
   * Extrai características de textura
   */
  private async extractTextureFeatures(image: Jimp): Promise<number[]> {
    const grayImage = image.clone().grayscale();
    const features: number[] = [];
    
    // Calcula variância local em diferentes regiões
    const regions = 3;
    const regionWidth = grayImage.getWidth() / regions;
    const regionHeight = grayImage.getHeight() / regions;
    
    for (let ry = 0; ry < regions; ry++) {
      for (let rx = 0; rx < regions; rx++) {
        const startX = Math.floor(rx * regionWidth);
        const startY = Math.floor(ry * regionHeight);
        const endX = Math.floor((rx + 1) * regionWidth);
        const endY = Math.floor((ry + 1) * regionHeight);
        
        const pixels: number[] = [];
        
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const pixel = Jimp.intToRGBA(grayImage.getPixelColor(x, y));
            pixels.push(pixel.r);
          }
        }
        
        // Calcula variância
        const mean = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
        const variance = pixels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixels.length;
        
        features.push(variance / 255); // Normaliza
      }
    }
    
    return features;
  }

  /**
   * Extrai características de forma
   */
  private async extractShapeFeatures(image: Jimp): Promise<number[]> {
    const features: number[] = [];
    
    // Aspect ratio
    const aspectRatio = image.getWidth() / image.getHeight();
    features.push(aspectRatio);
    
    // Área relativa (pixels não-transparentes)
    let nonTransparentPixels = 0;
    const totalPixels = image.getWidth() * image.getHeight();
    
    image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y, idx) => {
      const alpha = image.bitmap.data[idx + 3];
      if (alpha > 128) nonTransparentPixels++;
    });
    
    features.push(nonTransparentPixels / totalPixels);
    
    // Compacidade (perímetro² / área)
    const edges = await this.detectEdgesJimp(image.clone().grayscale());
    let perimeterPixels = 0;
    
    edges.scan(0, 0, edges.getWidth(), edges.getHeight(), (x, y, idx) => {
      const pixel = edges.bitmap.data[idx];
      if (pixel > 100) perimeterPixels++;
    });
    
    const compactness = perimeterPixels > 0 ? (perimeterPixels * perimeterPixels) / nonTransparentPixels : 0;
    features.push(Math.min(compactness / 1000, 1)); // Normaliza
    
    return features;
  }

  /**
   * Identifica um item baseado em suas características
   */
  private async identifyItem(features: ImageFeatures): Promise<{
    itemId: string;
    name: string;
    confidence: number;
    category: string;
    rarity: string;
  }> {
    let bestMatch = {
      itemId: 'unknown',
      name: 'Item Desconhecido',
      confidence: 0,
      category: 'unknown',
      rarity: 'common'
    };
    
    // Compara com base de dados de referência
    for (const [itemId, refFeatures] of Array.from(this.referenceDatabase.entries())) {
      const similarity = this.calculateFeatureSimilarity(features, refFeatures);
      
      if (similarity > bestMatch.confidence) {
        const itemData = this.getItemData(itemId);
        bestMatch = {
          itemId,
          name: itemData.name,
          confidence: similarity,
          category: itemData.category || 'Unknown',
          rarity: itemData.rarity
        };
      }
    }
    
    return bestMatch;
  }

  /**
   * Calcula similaridade entre características
   */
  private calculateFeatureSimilarity(features1: ImageFeatures, features2: ImageFeatures): number {
    const weights = {
      color: 0.3,
      edge: 0.25,
      texture: 0.25,
      shape: 0.2
    };
    
    const colorSim = this.calculateVectorSimilarity(features1.colorHistogram, features2.colorHistogram);
    const edgeSim = this.calculateVectorSimilarity(features1.edgeFeatures, features2.edgeFeatures);
    const textureSim = this.calculateVectorSimilarity(features1.textureFeatures, features2.textureFeatures);
    const shapeSim = this.calculateVectorSimilarity(features1.shapeFeatures, features2.shapeFeatures);
    
    return (
      colorSim * weights.color +
      edgeSim * weights.edge +
      textureSim * weights.texture +
      shapeSim * weights.shape
    );
  }

  /**
   * Calcula similaridade entre dois vetores usando distância cosseno
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
   * Detecta tipo de background da imagem
   */
  private async detectBackgroundType(image: Jimp): Promise<'inventory' | 'stash' | 'ground' | 'unknown'> {
    // Analisa cores dominantes e padrões para determinar o tipo de background
    const colorHistogram = await this.extractColorHistogram(image);
    
    // Background de inventário tende a ser mais escuro
    const darkPixelRatio = colorHistogram.slice(0, 85).reduce((sum, val) => sum + val, 0);
    
    if (darkPixelRatio > 0.6) {
      return 'inventory';
    } else if (darkPixelRatio > 0.3) {
      return 'stash';
    } else {
      return 'ground';
    }
  }

  /**
   * Detecta se há múltiplos itens na imagem
   */
  private async detectMultipleItems(image: Jimp): Promise<boolean> {
    const edges = await this.detectEdgesJimp(image.clone().grayscale());
    const contours = await this.findContours(edges);
    
    // Filtra contornos válidos
    const validContours = contours.filter(contour => {
      const boundingBox = this.getBoundingBox(contour);
      return this.isValidItemSize(boundingBox, image);
    });
    
    return validContours.length > 1;
  }

  /**
   * Calcula qualidade da imagem
   */
  private async calculateImageQuality(image: Jimp): Promise<number> {
    // Calcula qualidade baseada em nitidez e contraste
    const edges = await this.detectEdgesJimp(image.clone().grayscale());
    let edgeStrength = 0;
    let totalPixels = 0;
    
    edges.scan(0, 0, edges.getWidth(), edges.getHeight(), (x, y, idx) => {
      const pixel = edges.bitmap.data[idx];
      edgeStrength += pixel;
      totalPixels++;
    });
    
    const averageEdgeStrength = edgeStrength / totalPixels;
    return Math.min(averageEdgeStrength / 50, 1); // Normaliza para 0-1
  }

  /**
   * Calcula confiança geral do resultado
   */
  private calculateOverallConfidence(detectedItems: DetectedItem[], metadata: ImageMetadata): number {
    if (detectedItems.length === 0) return 0;
    
    // Média ponderada das confianças individuais
    const avgConfidence = detectedItems.reduce((sum, item) => sum + item.confidence, 0) / detectedItems.length;
    
    // Fatores de ajuste
    let qualityFactor = metadata.quality;
    let sizeFactor = Math.min(metadata.width * metadata.height / (512 * 512), 1);
    
    return avgConfidence * qualityFactor * sizeFactor;
  }

  /**
   * Inicializa base de dados de referência
   */
  private initializeReferenceDatabase(): void {
    // Esta seria populada com características extraídas de imagens de referência
    // Por enquanto, vamos usar dados mock
    this.referenceDatabase.set('bronze-lion', {
      colorHistogram: new Array(256).fill(0).map((_, i) => i < 100 ? 0.1 : i < 150 ? 0.3 : 0.05),
      edgeFeatures: [0.2, 0.3, 0.4, 0.1, 0.5, 0.2, 0.3, 0.4, 0.1, 0.2, 0.3, 0.4, 0.2, 0.1, 0.3, 0.2],
      textureFeatures: [0.4, 0.3, 0.2, 0.5, 0.1, 0.3, 0.4, 0.2, 0.1],
      shapeFeatures: [1.2, 0.8, 0.3]
    });
    
    // Adicionar mais itens de referência aqui...
  }

  /**
   * Obtém dados de um item
   */
  private getItemData(itemId: string): { name: string; category: string; rarity: string } {
    const itemDatabase: Record<string, { name: string; category: string; rarity: string }> = {
      'bronze-lion': {
        name: 'Bronze Lion Figurine',
        category: 'Barter Items',
        rarity: 'rare'
      },
      // Adicionar mais itens aqui...
    };
    
    return itemDatabase[itemId] || {
      name: 'Item Desconhecido',
      category: 'unknown',
      rarity: 'common'
    };
  }
}

// Instância singleton
export const imageProcessor = new AdvancedImageProcessor();