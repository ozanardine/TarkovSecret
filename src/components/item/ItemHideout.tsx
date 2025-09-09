'use client';

import { useState, useEffect } from 'react';
import { tarkovApi } from '@/lib/tarkov-api';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loading';
import { HomeIcon, WrenchScrewdriverIcon, CogIcon } from '@heroicons/react/24/outline';
import ClickableItemImage from '@/components/ui/ClickableItemImage';

interface ItemHideoutProps {
  itemId: string;
}

interface HideoutUsage {
  type: 'construction' | 'craft';
  station: {
    id: string;
    name: string;
    normalizedName: string;
  };
  level: number;
  description?: string;
  requirements?: any[];
  craft?: {
    id: string;
    duration: number;
    requiredItems: any[];
    rewardItems: any[];
  };
  usageType?: 'ingredient' | 'product';
}

export default function ItemHideout({ itemId }: ItemHideoutProps) {
  const [hideoutUsage, setHideoutUsage] = useState<HideoutUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHideoutUsage = async () => {
      try {
        setLoading(true);
        const usageData = await tarkovApi.getHideoutUsageForItem(itemId);
        setHideoutUsage(usageData as HideoutUsage[]);
      } catch (err) {
        setError('Erro ao carregar informações do hideout');
        console.error('Error fetching hideout usage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHideoutUsage();
  }, [itemId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-tarkov-light">Hideout</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
            <HomeIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-tarkov-light">Hideout</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (hideoutUsage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-tarkov-light">Hideout</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Este item não é usado no hideout.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HomeIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-tarkov-light">Hideout ({hideoutUsage.length})</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hideoutUsage.map((usage, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {usage.type === 'construction' ? (
                      <WrenchScrewdriverIcon className="h-4 w-4" />
                    ) : (
                      <CogIcon className="h-4 w-4" />
                    )}
                    {usage.station.name} - Nível {usage.level}
                  </h4>
                  {usage.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {usage.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">
                    {usage.type === 'construction' ? 'Construção' : 'Craft'}
                  </Badge>
                  {usage.usageType && (
                    <Badge variant={usage.usageType === 'ingredient' ? 'danger' : 'default'}>
                      {usage.usageType === 'ingredient' ? 'Ingrediente' : 'Produto'}
                    </Badge>
                  )}
                </div>
              </div>

              {usage.type === 'construction' && usage.requirements && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Materiais necessários:</p>
                  <div className="space-y-2">
                    {usage.requirements.map((req, reqIndex) => (
                      <div key={reqIndex} className="flex items-center gap-3">
                        {req.item.iconLink && (
                          <ClickableItemImage
                            src={req.item.iconLink}
                            alt={req.item.name}
                            size="sm"
                            name={req.item.name}
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{req.count || req.quantity}x</span> {req.item.name}
                          </p>
                          {req.item.shortName && (
                            <p className="text-xs text-muted-foreground">{req.item.shortName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {usage.type === 'craft' && usage.craft && (
                <div className="mt-3">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-sm font-medium">
                      Duração: {formatDuration(usage.craft.duration)}
                    </p>
                  </div>
                  
                  {usage.usageType === 'ingredient' && (
                    <div>
                      <p className="text-sm font-medium mb-2">Ingredientes necessários:</p>
                      <div className="space-y-2">
                        {usage.craft.requiredItems.map((req, reqIndex) => (
                          <div key={reqIndex} className="flex items-center gap-3">
                            {req.item.iconLink && (
                              <ClickableItemImage
                                src={req.item.iconLink}
                                alt={req.item.name}
                                size="sm"
                                name={req.item.name}
                              />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm ${req.item.id === itemId ? 'text-blue-600 font-semibold' : ''}`}>
                                <span className="font-medium">{req.count || req.quantity}x</span> {req.item.name}
                              </p>
                              {req.item.shortName && (
                                <p className="text-xs text-muted-foreground">{req.item.shortName}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {usage.usageType === 'product' && (
                    <div>
                      <p className="text-sm font-medium mb-2">Produtos resultantes:</p>
                      <div className="space-y-2">
                        {usage.craft.rewardItems.map((reward, rewardIndex) => (
                          <div key={rewardIndex} className="flex items-center gap-3">
                            {reward.item.iconLink && (
                              <ClickableItemImage
                                src={reward.item.iconLink}
                                alt={reward.item.name}
                                size="sm"
                                name={reward.item.name}
                              />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm ${reward.item.id === itemId ? 'text-green-600 font-semibold' : ''}`}>
                                <span className="font-medium">{reward.count}x</span> {reward.item.name}
                              </p>
                              {reward.item.shortName && (
                                <p className="text-xs text-muted-foreground">{reward.item.shortName}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}