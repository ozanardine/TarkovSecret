'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useTarkov } from '@/hooks/useTarkov';
import { useAuth } from '@/hooks/useAuth';
import { useImageSearch, ImageSearchResult } from '@/hooks/useImageSearch';
import { useSearchCache, generateImageHashForFiles } from '@/hooks/useSearchCache';
import { ImageSelector } from '@/components/ImageSelector';
import { MatchResult } from '@/lib/intelligent-item-matcher';
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { TarkovItem } from '@/types/tarkov';

interface SearchFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  rarity: string;
  trader: string;
  fleaMarket: boolean;
}



export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { useItemSearch } = useTarkov;
  const { searchByImages, isSearching: isImageSearching, error: imageSearchError } = useImageSearch();
  const {
    getCachedTextSearch,
    setCachedTextSearch,
    getCachedImageSearch,
    setCachedImageSearch,
    getCacheStats
  } = useSearchCache();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageSearchResults, setImageSearchResults] = useState<ImageSearchResult[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImageForManualSelection, setSelectedImageForManualSelection] = useState<File | null>(null);
  const [manualSelectionResult, setManualSelectionResult] = useState<MatchResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: 0,
    maxPrice: 0,
    rarity: '',
    trader: '',
    fleaMarket: false
  });

  const { items: apiSearchResults, loading: isTextSearching, searchItems, clearSearch } = useItemSearch();
  
  // Check cache first for text search
  const cachedTextResults = searchQuery ? getCachedTextSearch(searchQuery) : null;
  const searchResults = cachedTextResults || apiSearchResults;
  
  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const cachedResults = getCachedTextSearch(searchQuery);
      if (!cachedResults) {
        searchItems({ query: searchQuery });
      }
    } else {
      clearSearch();
    }
  }, [searchQuery, searchItems, clearSearch, getCachedTextSearch]);
  
  // Cache API results when they arrive
  useEffect(() => {
    if (apiSearchResults && apiSearchResults.length > 0 && searchQuery && !cachedTextResults) {
      setCachedTextSearch(searchQuery, apiSearchResults);
    }
  }, [apiSearchResults, searchQuery, cachedTextResults, setCachedTextSearch]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles]);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleManualSelectionComplete = (result: MatchResult) => {
    setManualSelectionResult(result);
    setShowImageSelector(false);
    
    // Converter resultado para formato de busca
    // Converter TarkovItemReference para TarkovItem
    const tarkovItem: TarkovItem = {
      id: result.item.id,
      name: result.item.name,
      shortName: result.item.name,
      weight: 0,
      basePrice: 0,
      slots: 1,
      width: 1,
      height: 1,
      types: result.item.types || [],
      rarity: result.item.rarity || 'common',
      sellFor: [],
      buyFor: [],
      iconLink: result.item.image || result.item.iconLink,
      imageLink: result.item.image || result.item.iconLink
    };
    
    const searchResult: ImageSearchResult = {
       item: tarkovItem,
       confidence: result.confidence,
       boundingBox: result.boundingBox,
       processingTime: 0, // MatchResult não tem processingTime
       metadata: {
         hasMultipleItems: false,
         backgroundType: 'unknown',
         imageQuality: 1.0
       }
     };
    setImageSearchResults([searchResult]);
  };

  const handleManualSelectionCancel = () => {
    setShowImageSelector(false);
    setSelectedImageForManualSelection(null);
  };

  const handleImageSearch = useCallback(async () => {
    if (uploadedImages.length === 0) return;
    
    try {
      // Generate hash for uploaded images to check cache
      const imageHash = await generateImageHashForFiles(uploadedImages);
      
      // Check cache first
      const cachedResults = getCachedImageSearch(imageHash);
      if (cachedResults) {
        setImageSearchResults(cachedResults);
        return;
      }
      
      // If not in cache, perform search
      const results = await searchByImages(uploadedImages, {
        maxResults: 10,
        minConfidence: 0.3,
        detectMultipleItems: true,
        includeVariants: true
      });
      
      // Cache the results
      setCachedImageSearch(imageHash, results);
      setImageSearchResults(results);
    } catch (error) {
      console.error('Erro na busca por imagem:', error);
      // O erro já é tratado pelo hook useImageSearch
    }
  }, [uploadedImages, searchByImages, getCachedImageSearch, setCachedImageSearch]);

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setUploadedImages([]);
    setImageSearchResults([]);
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Busca Avançada de Itens
          </h1>
          <p className="text-tarkov-text-secondary">
            Encontre itens por nome ou faça upload de imagens para identificação automática
          </p>
        </div>

        {/* Search Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Text Search */}
          <Card className="bg-tarkov-dark border-tarkov-border">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5" />
                Busca por Texto
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchInput
                  placeholder="Digite o nome do item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filtros
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearAll}
                    className="flex items-center gap-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Search */}
          <Card className="bg-tarkov-dark border-tarkov-border">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <PhotoIcon className="w-5 h-5" />
                Busca por Imagem
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-tarkov-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <ArrowUpTrayIcon className="w-8 h-8 text-tarkov-text-secondary" />
                    <span className="text-tarkov-text-secondary">
                      Clique para fazer upload ou arraste imagens aqui
                    </span>
                    <span className="text-sm text-tarkov-text-muted">
                      Suporta múltiplas imagens (PNG, JPG, WEBP)
                    </span>
                  </label>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white">
                      Imagens Carregadas ({uploadedImages.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-tarkov-border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleImageSearch}
                    disabled={uploadedImages.length === 0 || isImageSearching}
                    className="flex-1"
                  >
                    {isImageSearching ? (
                      <>
                        <Loading className="w-4 h-4 mr-2" variant="dots" />
                        Analisando Imagens...
                      </>
                    ) : (
                      'Busca Automática'
                    )}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (uploadedImages.length > 0) {
                        setSelectedImageForManualSelection(uploadedImages[0]);
                        setShowImageSelector(true);
                      }
                    }}
                    disabled={uploadedImages.length === 0}
                    className="flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Seleção Manual
                  </Button>
                </div>
                
                {/* Dica sobre seleção manual */}
                {uploadedImages.length > 0 && (
                  <div className="bg-tarkov-surface p-3 rounded border border-tarkov-border">
                    <p className="text-xs text-tarkov-text-secondary">
                      💡 <strong>Dica:</strong> Use "Seleção Manual" para identificar um item específico 
                      selecionando apenas a área do item na imagem. Isso aumenta drasticamente a precisão!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-tarkov-dark border-tarkov-border mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-tarkov-darker border border-tarkov-border rounded px-3 py-2 text-white"
                  >
                    <option value="">Todas</option>
                    <option value="Weapon">Armas</option>
                    <option value="Armor">Armaduras</option>
                    <option value="Ammo">Munição</option>
                    <option value="Medical">Médicos</option>
                    <option value="Food">Comida</option>
                    <option value="Barter">Troca</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Raridade
                  </label>
                  <select
                    value={filters.rarity}
                    onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
                    className="w-full bg-tarkov-darker border border-tarkov-border rounded px-3 py-2 text-white"
                  >
                    <option value="">Todas</option>
                    <option value="Common">Comum</option>
                    <option value="Rare">Raro</option>
                    <option value="Epic">Épico</option>
                    <option value="Legendary">Lendário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Preço Mín.
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    className="w-full bg-tarkov-darker border border-tarkov-border rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Preço Máx.
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full bg-tarkov-darker border border-tarkov-border rounded px-3 py-2 text-white"
                    placeholder="Sem limite"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={filters.fleaMarket}
                      onChange={(e) => setFilters(prev => ({ ...prev, fleaMarket: e.target.checked }))}
                      className="rounded border-tarkov-border"
                    />
                    Apenas Flea Market
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        <div className="space-y-6">
          {/* Text Search Results */}
          {searchQuery && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Resultados da Busca por Texto
              </h2>
              {isTextSearching ? (
                <div className="flex justify-center py-8">
                  <Loading size="lg" variant="bars" text="Buscando..." />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((item) => (
                    <Card key={item.id} className="bg-tarkov-dark border-tarkov-border hover:border-tarkov-accent transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={item.iconLink}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-tarkov-text-secondary truncate">
                              {item.shortName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {item.types?.[0] || 'Unknown'}
                            </Badge>
                            <span className="text-tarkov-accent font-semibold">
                              ₽{item.basePrice?.toLocaleString()}
                            </span>
                          </div>
                          
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(`/item/${item.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-tarkov-text-secondary">
                  Nenhum item encontrado para "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Manual Selection Modal */}
          {showImageSelector && selectedImageForManualSelection && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-tarkov-dark border border-tarkov-border rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                <div className="p-4 border-b border-tarkov-border flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Seleção Manual de Item</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleManualSelectionCancel}
                    className="text-tarkov-text-secondary hover:text-white"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <ImageSelector
                    imageFile={selectedImageForManualSelection}
                    onSelectionComplete={handleManualSelectionComplete}
                    onCancel={handleManualSelectionCancel}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Search Results */}
          {imageSearchResults.length > 0 && (
            <Card className="bg-tarkov-dark border-tarkov-border">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5" />
                  Resultados da Busca por Imagem
                  {manualSelectionResult && (
                    <Badge variant="secondary" className="ml-2">
                      Seleção Manual
                    </Badge>
                  )}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imageSearchResults.map((result, index) => (
                    <div key={index} className="border border-tarkov-border rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-tarkov-text-secondary">
                            Confiança: {(result.confidence * 100).toFixed(1)}%
                          </span>
                          {result.metadata?.hasMultipleItems === false && (
                            <Badge variant="secondary" size="sm">
                              Área Selecionada
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-tarkov-text-muted">
                          {result.processingTime}ms
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[result.item].map((item) => (
                          <Card key={item.id} className="bg-tarkov-surface border-tarkov-border hover:border-tarkov-accent transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <img
                                  src={item.iconLink}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white truncate">
                                    {item.name}
                                  </h3>
                                  <p className="text-sm text-tarkov-text-secondary truncate">
                                    {item.shortName}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.types[0] || 'Item'}
                                  </Badge>
                                  <span className="text-tarkov-accent font-semibold">
                                    ₽{item.basePrice?.toLocaleString()}
                                  </span>
                                </div>
                                
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => router.push(`/item/${item.id}`)}
                                >
                                  Ver Detalhes
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Empty State */}
        {!searchQuery && uploadedImages.length === 0 && (
          <div className="text-center py-16">
            <PhotoIcon className="w-16 h-16 text-tarkov-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Comece sua busca
            </h3>
            <p className="text-tarkov-text-secondary max-w-md mx-auto">
              Digite o nome de um item ou faça upload de uma imagem para encontrar
              informações detalhadas sobre itens do Escape from Tarkov.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}