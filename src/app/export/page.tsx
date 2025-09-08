'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSubscription } from '@/hooks/useSubscription';
import { downloadFile } from '@/lib/utils';
import { 
  Download, 
  FileText, 
  Database, 
  Search, 
  Bell, 
  BarChart3, 
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';

interface ExportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
}

interface ExportOptions {
  types: ExportType[];
  formats: ExportFormat[];
  limits: {
    maxRecords: number;
    maxFileSize: string;
    dailyExports: number;
  };
}

export default function ExportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPlus, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading' || subscriptionLoading) return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!hasPlus) {
      router.push('/subscription');
      return;
    }

    fetchExportOptions();
  }, [session, status, hasPlus, subscriptionLoading, router]);

  const fetchExportOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plus/export');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar opções de exportação');
      }

      // Add icons to export types
      const typesWithIcons = result.data.types.map((type: any) => ({
        ...type,
        icon: getIconForType(type.id)
      }));

      setExportOptions({
        ...result.data,
        types: typesWithIcons
      });
    } catch (error) {
      console.error('Erro ao carregar opções de exportação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (typeId: string) => {
    switch (typeId) {
      case 'watchlist':
        return <Star className="w-5 h-5" />;
      case 'search_history':
        return <Search className="w-5 h-5" />;
      case 'api_usage':
        return <Database className="w-5 h-5" />;
      case 'price_alerts':
        return <Bell className="w-5 h-5" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      setError('Selecione pelo menos um tipo de dados para exportar');
      return;
    }

    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      for (const exportType of selectedTypes) {
        const response = await fetch('/api/plus/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exportType,
            format: selectedFormat,
            filters: {
              period: dateRange,
              includeMetadata
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro na exportação');
        }

        const blob = await response.blob();
        const filename = response.headers.get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || `export_${exportType}_${Date.now()}.${selectedFormat}`;

        // Download the file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setSuccess(`${selectedTypes.length} arquivo(s) exportado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro na exportação:', error);
      setError(error instanceof Error ? error.message : 'Erro na exportação');
    } finally {
      setExporting(false);
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-tarkov-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tarkov-accent"></div>
      </div>
    );
  }

  if (!exportOptions) {
    return (
      <div className="min-h-screen bg-tarkov-bg flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-tarkov-light mb-2">Erro ao Carregar</h2>
          <p className="text-tarkov-muted mb-4">Não foi possível carregar as opções de exportação.</p>
          <Button onClick={fetchExportOptions}>Tentar Novamente</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tarkov-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-8 h-8 text-tarkov-accent" />
            <h1 className="text-3xl font-bold text-tarkov-light">Exportação de Dados</h1>
            <Badge className="bg-tarkov-accent/20 text-tarkov-accent border-tarkov-accent/30">
              PLUS
            </Badge>
          </div>
          <p className="text-tarkov-muted max-w-2xl">
            Exporte seus dados em múltiplos formatos. Mantenha backup de suas informações ou 
            analise seus dados em ferramentas externas.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </Card>
        )}

        {success && (
          <Card className="p-4 mb-6 border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Types */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-tarkov-light mb-4">Tipos de Dados</h2>
              <p className="text-tarkov-muted mb-6">Selecione os tipos de dados que deseja exportar:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {exportOptions.types.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'border-tarkov-accent bg-tarkov-accent/10'
                        : 'border-tarkov-border hover:border-tarkov-accent/50'
                    }`}
                    onClick={() => handleTypeToggle(type.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleTypeToggle(type.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {type.icon}
                          <h3 className="font-medium text-tarkov-light">{type.name}</h3>
                        </div>
                        <p className="text-sm text-tarkov-muted">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Export Options */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-tarkov-light mb-4">Opções de Exportação</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Formato
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportOptions.formats.map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          <div>
                            <div className="font-medium">{format.name}</div>
                            <div className="text-xs text-tarkov-muted">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Período
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="1y">Último ano</SelectItem>
                      <SelectItem value="all">Todos os dados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={includeMetadata}
                    onChange={(checked) => setIncludeMetadata(checked)}
                  />
                  <label className="text-sm text-tarkov-light">
                    Incluir metadados (timestamps, IDs, etc.)
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-tarkov-light mb-4">Resumo da Exportação</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-tarkov-muted">Tipos selecionados:</span>
                  <span className="text-tarkov-light font-medium">{selectedTypes.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-tarkov-muted">Formato:</span>
                  <span className="text-tarkov-light font-medium">
                    {exportOptions.formats.find(f => f.id === selectedFormat)?.name}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-tarkov-muted">Período:</span>
                  <span className="text-tarkov-light font-medium">
                    {dateRange === '7d' ? '7 dias' :
                     dateRange === '30d' ? '30 dias' :
                     dateRange === '90d' ? '90 dias' :
                     dateRange === '1y' ? '1 ano' : 'Todos'}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={selectedTypes.length === 0 || exporting}
                className="w-full mt-6"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </>
                )}
              </Button>
            </Card>

            {/* Limits */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-tarkov-light mb-4">Limites</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-tarkov-muted" />
                  <div>
                    <div className="text-sm text-tarkov-light">Máx. registros</div>
                    <div className="text-xs text-tarkov-muted">
                      {exportOptions.limits.maxRecords.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-tarkov-muted" />
                  <div>
                    <div className="text-sm text-tarkov-light">Tamanho máx.</div>
                    <div className="text-xs text-tarkov-muted">
                      {exportOptions.limits.maxFileSize}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-tarkov-muted" />
                  <div>
                    <div className="text-sm text-tarkov-light">Exportações/dia</div>
                    <div className="text-xs text-tarkov-muted">
                      {exportOptions.limits.dailyExports}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}