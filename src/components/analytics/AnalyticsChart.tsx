'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: DataPoint[];
  type?: 'bar' | 'line' | 'pie';
  className?: string;
}

export function AnalyticsChart({ title, data, type = 'bar', className }: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-sm text-tarkov-muted truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-tarkov-dark rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                item.color || "bg-tarkov-accent"
              )}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm text-tarkov-light text-right">
            {item.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="h-32 flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-2 flex-1">
          <div
            className={cn(
              "w-full rounded-t transition-all duration-500",
              item.color || "bg-tarkov-accent"
            )}
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <div className="text-xs text-tarkov-muted text-center truncate w-full">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
              />
              <span className="text-sm text-tarkov-light">{item.label}</span>
              <span className="text-sm text-tarkov-muted">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-semibold text-tarkov-light mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="text-center py-8 text-tarkov-muted">
          Nenhum dado disponível
        </div>
      ) : (
        <div>
          {type === 'bar' && renderBarChart()}
          {type === 'line' && renderLineChart()}
          {type === 'pie' && renderPieChart()}
        </div>
      )}
    </Card>
  );
}