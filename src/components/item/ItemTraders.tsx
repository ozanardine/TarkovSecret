'use client';

import { TarkovItem, TraderPrice, Trader } from '@/types/tarkov';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { tarkovApi } from '@/lib/tarkov-api';
import { toRomanNumeral } from '@/lib/utils/roman-numerals';
import { useImages } from '@/hooks/useImages';

interface ItemTradersProps {
  item: TarkovItem;
}

export function ItemTraders({ item }: ItemTradersProps) {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: traderImages } = useImages({
    type: 'traders',
    enabled: true
  });

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const tradersData = await tarkovApi.getTraders();
        setTraders(tradersData);
      } catch (error) {
        console.error('Error fetching traders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTraders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR').format(price);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'RUB': return '₽';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  const getTraderColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'Prapor': 'bg-red-500/20 border-red-500/30 text-red-400',
      'Therapist': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      'Fence': 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      'Skier': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      'Peacekeeper': 'bg-green-500/20 border-green-500/30 text-green-400',
      'Mechanic': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      'Ragman': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      'Jaeger': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      'Flea Market': 'bg-blue-600/20 border-blue-600/30 text-blue-400'
    };
    return colors[source] || 'bg-gray-500/20 border-gray-500/30 text-gray-400';
  };

  const getTraderImage = (source: string) => {
    const traderImage = traderImages.find(img => 
      img.name.toLowerCase() === source.toLowerCase() ||
      img.name.toLowerCase().includes(source.toLowerCase()) ||
      source.toLowerCase().includes(img.name.toLowerCase())
    );
    
    if (traderImage?.images?.imageLink) {
      return traderImage.images.imageLink;
    }
    
    let trader = traders.find(t => t.name === source);
    
    if (!trader) {
      trader = traders.find(t => t.name.toLowerCase() === source.toLowerCase());
    }
    
    if (!trader) {
      trader = traders.find(t => t.normalizedName === source.toLowerCase().replace(/\s+/g, '-'));
    }
    
    if (!trader) {
      trader = traders.find(t => 
        t.name.toLowerCase().includes(source.toLowerCase()) ||
        source.toLowerCase().includes(t.name.toLowerCase())
      );
    }
    
    return trader?.image4xLink || trader?.imageLink || '/images/placeholder-trader.png';
  };

  const getTraderLevel = (source: string) => {
    if (source === 'Flea Market') return null;
    
    const trader = traders.find(t => t.name === source);
    if (!trader) return null;
    
    // Aqui você pode implementar a lógica para obter o nível do trader
    // Por enquanto, retornamos null
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-800/40 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const buyFor = item.buyFor || [];
  const sellFor = item.sellFor || [];

  return (
    <div className="space-y-6">
      {/* Onde Comprar */}
      {buyFor.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ArrowDownIcon className="w-5 h-5 text-green-400" />
              Onde Comprar
            </h3>
            <p className="text-sm text-gray-400">Locais onde você pode comprar este item</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {buyFor.map((offer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={getTraderImage(offer.source)}
                        alt={offer.source}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-700"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/images/placeholder-trader.png';
                        }}
                      />
                      {getTraderLevel(offer.source) && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getTraderLevel(offer.source)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{offer.source}</span>
                        <Badge variant="outline" className={getTraderColor(offer.source)}>
                          {offer.source}
                        </Badge>
                      </div>
                      {offer.requirements && offer.requirements.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Requisitos especiais
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {getCurrencySymbol(offer.currency)}{formatPrice(offer.price)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {offer.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onde Vender */}
      {sellFor.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ArrowUpIcon className="w-5 h-5 text-red-400" />
              Onde Vender
            </h3>
            <p className="text-sm text-gray-400">Locais onde você pode vender este item</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sellFor.map((offer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={getTraderImage(offer.source)}
                        alt={offer.source}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-700"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/images/placeholder-trader.png';
                        }}
                      />
                      {getTraderLevel(offer.source) && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getTraderLevel(offer.source)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{offer.source}</span>
                        <Badge variant="outline" className={getTraderColor(offer.source)}>
                          {offer.source}
                        </Badge>
                      </div>
                      {offer.requirements && offer.requirements.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Requisitos especiais
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">
                      {getCurrencySymbol(offer.currency)}{formatPrice(offer.price)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {offer.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sem Ofertas */}
      {buyFor.length === 0 && sellFor.length === 0 && (
        <Card variant="elevated">
          <CardContent className="text-center py-8">
            <BuildingStorefrontIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              Nenhuma Oferta Disponível
            </h3>
            <p className="text-gray-500 text-sm">
              Este item não possui ofertas de compra ou venda no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}