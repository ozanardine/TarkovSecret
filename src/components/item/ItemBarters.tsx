'use client';

import { useState, useEffect } from 'react';
import { tarkovApi } from '@/lib/tarkov-api';
import { Barter, Trader } from '@/types/tarkov';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loading';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import { toRomanNumeral } from '@/lib/utils/roman-numerals';
import { useImages } from '@/hooks/useImages';

interface ItemBartersProps {
  itemId: string;
}

export default function ItemBarters({ itemId }: ItemBartersProps) {
  const [barters, setBarters] = useState<Barter[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get trader images
  const traderIds = traders.map(trader => trader.id).filter(Boolean);
  const { data: traderImages } = useImages({
    type: 'traders',
    ids: traderIds,
    enabled: traderIds.length > 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bartersData, tradersData] = await Promise.all([
          tarkovApi.getBartersForItem(itemId),
          tarkovApi.getTraders()
        ]);
        setBarters(bartersData);
        setTraders(tradersData);
      } catch (err) {
        setError('Erro ao carregar informações de barters');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-tarkov-light">Barters</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-tarkov-light">Barters</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (barters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-tarkov-light">Barters</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Este item não está disponível em nenhum barter.</p>
        </CardContent>
      </Card>
    );
  }

  const getBarterType = (barter: Barter, itemId: string) => {
    const isRequired = barter.requiredItems?.some(req => req.item.id === itemId);
    const isReward = barter.rewardItems?.some(reward => reward.item.id === itemId);
    
    if (isRequired && isReward) return 'ambos';
    if (isRequired) return 'necessário';
    if (isReward) return 'recompensa';
    return 'desconhecido';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowRightIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-tarkov-light">Barters ({barters.length})</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {barters.map((barter) => {
            const barterType = getBarterType(barter, itemId);
            
            return (
              <div key={barter.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const trader = traders.find(t => t.name === barter.trader?.name);
                      
                      // Get official trader image from API first
                      const apiTraderImage = traderImages?.find(img => 
                        img.id === trader?.id || 
                        img.name?.toLowerCase() === trader?.name?.toLowerCase()
                      );
                      
                      const imageUrl = apiTraderImage?.images?.imageLink || 
                                     trader?.imageLink;
                      
                      return imageUrl ? (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={barter.trader?.name || 'Trader'}
                            fill
                            className="object-contain rounded-full"
                            sizes="24px"
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-300">{barter.trader?.name?.charAt(0) || '?'}</span>
                        </div>
                      );
                    })()} 
                    <span className="font-semibold">{barter.trader?.name}</span>
                    <Badge variant="outline">Nível {toRomanNumeral(barter.level)}</Badge>
                  </div>
                  <Badge variant={barterType === 'necessário' ? 'destructive' : 'default'}>
                    {barterType === 'necessário' ? 'Você oferece' : 'Você recebe'}
                  </Badge>
                </div>

                {barter.taskUnlock && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-yellow-800">
                      <strong>Quest necessária:</strong> {barter.taskUnlock.name}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Required Items */}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Você oferece:</p>
                    <div className="space-y-2">
                      {barter.requiredItems?.map((req, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {req.item.iconLink && (
                            <ClickableItemImage
                              src={req.item.iconLink}
                              alt={req.item.name}
                              size="sm"
                              name={req.item.name}
                            />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${req.item.id === itemId ? 'font-bold text-blue-600' : ''}`}>
                              {req.count || req.quantity}x {req.item.name}
                            </p>
                            {req.item.shortName && (
                              <p className="text-xs text-muted-foreground">
                                {req.item.shortName}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowRightIcon className="h-6 w-6 text-muted-foreground" />
                  </div>

                  {/* Reward Items */}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Você recebe:</p>
                    <div className="space-y-2">
                      {barter.rewardItems?.map((reward, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {reward.item.iconLink && (
                            <ClickableItemImage
                              src={reward.item.iconLink}
                              alt={reward.item.name}
                              size="sm"
                              name={reward.item.name}
                            />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${reward.item.id === itemId ? 'font-bold text-green-600' : ''}`}>
                              {reward.count}x {reward.item.name}
                            </p>
                            {reward.item.shortName && (
                              <p className="text-xs text-muted-foreground">
                                {reward.item.shortName}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}