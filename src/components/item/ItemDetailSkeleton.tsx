import React from 'react';
import { Skeleton } from '@/components/ui/Loading';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export const ItemDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton width={80} height={36} /> {/* Back button */}
        <div className="flex-1" />
        <Skeleton width={40} height={36} /> {/* Share button */}
        <Skeleton width={40} height={36} /> {/* Favorite button */}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Item Image */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Skeleton width="100%" height={300} className="mb-4" />
              <div className="space-y-2">
                <Skeleton width="60%" height={20} />
                <Skeleton width="40%" height={16} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Item Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="space-y-3">
                <Skeleton width="70%" height={32} /> {/* Item name */}
                <div className="flex gap-2">
                  <Skeleton width={80} height={24} /> {/* Rarity badge */}
                  <Skeleton width={60} height={24} /> {/* Type badge */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Skeleton width="100%" height={16} />
                  <Skeleton width="80%" height={20} />
                </div>
                <div className="space-y-2">
                  <Skeleton width="100%" height={16} />
                  <Skeleton width="60%" height={20} />
                </div>
                <div className="space-y-2">
                  <Skeleton width="100%" height={16} />
                  <Skeleton width="70%" height={20} />
                </div>
                <div className="space-y-2">
                  <Skeleton width="100%" height={16} />
                  <Skeleton width="50%" height={20} />
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} width={120} height={40} />
                ))}
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                <Skeleton width="100%" height={20} />
                <Skeleton width="90%" height={20} />
                <Skeleton width="95%" height={20} />
                <Skeleton width="85%" height={20} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-3">
                    <Skeleton width="100%" height={16} />
                    <Skeleton width="80%" height={40} />
                    <Skeleton width="90%" height={40} />
                  </div>
                  <div className="space-y-3">
                    <Skeleton width="100%" height={16} />
                    <Skeleton width="70%" height={40} />
                    <Skeleton width="85%" height={40} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const ItemSpecsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton width={200} height={24} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton width="100%" height={16} />
                <Skeleton width="70%" height={20} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton width={180} height={24} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={20} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ItemTradersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {[1, 2].map((section) => (
        <Card key={section}>
          <CardHeader>
            <Skeleton width={150} height={24} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((trader) => (
                <div key={trader} className="flex items-center justify-between p-4 border border-tarkov-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} rounded />
                    <div className="space-y-2">
                      <Skeleton width={100} height={16} />
                      <Skeleton width={80} height={14} />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton width={80} height={20} />
                    <Skeleton width={60} height={14} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const PriceHistorySkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton width={180} height={24} />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width={60} height={32} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart Area */}
          <div className="mb-6">
            <Skeleton width="100%" height={300} />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton width="100%" height={16} />
                <Skeleton width="80%" height={24} className="mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};