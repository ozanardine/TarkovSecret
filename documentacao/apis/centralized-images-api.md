# API Centralizada de Imagens - Secret Tarkov

Esta documentação descreve a API centralizada de imagens que foi criada para o projeto Secret Tarkov, permitindo obter todas as imagens disponíveis de itens, traders, quests e mapas do Tarkov.dev API de forma unificada.

## Visão Geral

A API centralizada de imagens (`/api/images`) foi desenvolvida para:
- Centralizar todas as consultas de imagens em um único endpoint
- Otimizar o cache de imagens
- Simplificar o uso no frontend através de hooks personalizados
- Suportar diferentes tipos de dados: itens, traders, quests, mapas e skills
- Filtrar por tipos específicos de imagem

## Endpoint Principal

**URL**: `/api/images`  
**Métodos**: `GET`, `POST`  
**Content-Type**: `application/json`

## Parâmetros de Requisição

### Query Parameters (GET)

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------|
| `type` | string | Sim | Tipo de dados: `items`, `traders`, `quests`, `maps`, `skills`, `all` |
| `ids` | string | Não | IDs separados por vírgula (ex: `id1,id2,id3`) |
| `names` | string | Não | Nomes separados por vírgula |
| `limit` | number | Não | Limite de resultados |
| `imageTypes` | string | Não | Tipos de imagem separados por vírgula |

### Request Body (POST)

```typescript
interface ImageRequest {
  type: 'items' | 'traders' | 'quests' | 'maps' | 'skills' | 'all';
  ids?: string[];
  names?: string[];
  limit?: number;
  imageTypes?: ImageType[];
}
```

## Tipos de Imagem Suportados

### Itens
- `icon` - Ícone pequeno do item
- `img` - Imagem padrão (geralmente igual ao icon)
- `imgBig` - Imagem grande do item
- `iconLink` - Link do ícone
- `gridImageLink` - Imagem para grid/inventário
- `inspectImageLink` - Imagem de inspeção
- `image512pxLink` - Imagem 512px
- `image8xLink` - Imagem 8x
- `imageLink` - Link da imagem principal
- `imageLinkFallback` - Imagem de fallback

### Traders
- `avatar` - Avatar do trader
- `imageLink` - Link da imagem
- `image4xLink` - Imagem 4x

### Quests
- `image` - Imagem da quest
- `mapImage` - Imagem do mapa associado

### Maps
- `mapImage` - Imagem principal do mapa
- `thumbnail` - Miniatura do mapa

### Skills
- `skillImage` - Imagem da skill

## Estrutura de Resposta

```typescript
interface ImagesResponse {
  success: boolean;
  data: ImageData[];
  metadata: {
    total: number;
    type: string;
    processingTime: number;
    cached: boolean;
  };
  error?: ```typescript
interface ImageData {
  id: string;
  name: string;
  type: 'item' | 'trader' | 'quest' | 'map' | 'skill';
  images: {
    [key in ImageType]?: string;
  };
}
```

## Exemplos de Uso

### 1. Buscar todas as imagens de itens

```bash
GET /api/images?type=items&limit=10
```

```json
{
  "success": true,
  "data": [
    {
      "id": "5449016a4bdc2d6f028b456f",
      "name": "Colt M4A1",
      "type": "item",
      "images": {
        "icon": "https://cdn.tarkov-market.app/images/items/colt_m4a1_sm.png",
        "imgBig": "https://cdn.tarkov-market.app/images/items/colt_m4a1_lg.png",
        "gridImageLink": "https://cdn.tarkov.dev/images/items/colt_m4a1_grid.png"
      }
    }
  ],
  "metadata": {
    "total": 1,
    "type": "items",
    "processingTime": 150,
    "cached": false
  }
}
```

### 2. Buscar imagens de traders específicos

```bash
GET /api/images?type=traders&names=Prapor,Therapist
```

### 3. Buscar apenas ícones de itens específicos

```bash
GET /api/images?type=items&ids=5449016a4bdc2d6f028b456f&imageTypes=icon,iconLink
```

### 4. Buscar imagens de skills

```bash
GET /api/images?type=skills&limit=10
```

### 5. Buscar todas as imagens (POST)

```javascript
fetch('/api/images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'all',
    limit: 50,
    imageTypes: ['icon', 'avatar', 'mapImage', 'skillImage']
  })
})
```

## Hooks React

A API vem com hooks personalizados para facilitar o uso no frontend:

### Hook Principal

```typescript
import { useImages } from '@/hooks/useImages';

function MyComponent() {
  const { data, loading, error, refetch, metadata } = useImages({
    type: 'items',
    limit: 10,
    imageTypes: ['icon', 'imgBig']
  });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {data.map(item => (
        <img key={item.id} src={item.images.icon} alt={item.name} />
      ))}
    </div>
  );
}
```

### Hooks Específicos

```typescript
// Para itens
const { data: items } = useItemImages({ limit: 20 });

// Para traders
const { data: traders } = useTraderImages();

// Para quests
const { data: quests } = useQuestImages({ limit: 10 });

// Para mapas
const { data: maps } = useMapImages();

// Para skills
const { data: skills } = useSkillImages();

// Para uma imagem específica
const { image } = useImageById('5449016a4bdc2d6f028b456f', 'items');

// Para múltiplas imagens por nome
const { data } = useImagesByName(['AK-74', 'M4A1'], 'items');

// Para skills específicas
const { data: skillData } = useImagesByName(['Endurance', 'Strength'], 'skills');
```

## Cache e Performance

### Estratégia de Cache
- **TTL**: 10 minutos para dados de imagem
- **Cache em memória**: Implementado no servidor
- **Cache por query**: Cada combinação de parâmetros é cacheada separadamente
- **Indicador de cache**: A resposta inclui `metadata.cached` para indicar se os dados vieram do cache

### Otimizações
- Consultas GraphQL otimizadas para buscar apenas campos de imagem necessários
- Filtros aplicados após o cache para reduzir consultas desnecessárias
- Suporte a consultas em lote para múltiplos tipos de dados

## Tratamento de Erros

### Códigos de Status
- `200` - Sucesso
- `500` - Erro interno do servidor

### Estrutura de Erro
```json
{
  "success": false,
  "data": [],
  "metadata": {
    "total": 0,
    "type": "error",
    "processingTime": 50,
    "cached": false
  },
  "error": "Mensagem de erro detalhada"
}
```

## Limitações e Considerações

### Limitações Atuais
1. **Quests**: A API Tarkov.dev não fornece imagens diretas para quests, então são geradas URLs baseadas em convenções
2. **Maps**: URLs de mapas são construídas baseadas em padrões conhecidos
3. **Skills**: Utiliza a API Tarkov.dev para obter imageLink das skills
4. **Rate Limiting**: Herda os limites da API Tarkov.dev

### Considerações de Performance
- Use `limit` para consultas grandes
- Especifique `imageTypes` quando possível para reduzir payload
- Aproveite o cache especificando `enabled: false` nos hooks quando não necessário

## Integração com Tarkov.dev API

A API centralizada utiliza o <mcurl name="Tarkov.dev GraphQL API" url="https://api.tarkov.dev/"></mcurl> como fonte de dados, seguindo as especificações do <mcfile name="tarkov_dev_image_api_guide.md" path="c:\Users\Zanardine\Documents\Projetos\Secret Tarkov\documentacao\apis\tarkov_dev_image_api_guide.md"></mcfile>.

### Queries GraphQL Utilizadas

#### Itens
```graphql
query GetItemImages($limit: Int) {
  items(limit: $limit) {
    id
    name
    icon
    iconLink
    gridImageLink
    inspectImageLink
    image512pxLink
    image8xLink
    imageLink
    imageLinkFallback
  }
}
```

#### Traders
```graphql
query GetTraderImages {
  traders {
    id
    name
    imageLink
    image4xLink
  }
}
```

#### Skills
```graphql
query GetSkillImages {
  skills(lang: en) {
    id
    name
    imageLink
  }
}
```

## Arquivos Relacionados

- **API Route**: <mcfile name="route.ts" path="c:\Users\Zanardine\Documents\Projetos\Secret Tarkov\src\app\api\images\route.ts"></mcfile>
- **Hook Principal**: <mcfile name="useImages.ts" path="c:\Users\Zanardine\Documents\Projetos\Secret Tarkov\src\hooks\useImages.ts"></mcfile>
- **Tipos TypeScript**: <mcfile name="api.ts" path="c:\Users\Zanardine\Documents\Projetos\Secret Tarkov\src\types\api.ts"></mcfile>
- **API Tarkov**: <mcfile name="tarkov-api.ts" path="c:\Users\Zanardine\Documents\Projetos\Secret Tarkov\src\lib\tarkov-api.ts"></mcfile>

## Próximos Passos

1. **Implementar fallbacks**: Adicionar imagens padrão quando URLs não estão disponíveis
2. **Otimizar cache**: Implementar cache persistente (Redis/Database)
3. **Adicionar métricas**: Implementar logging e métricas de uso
4. **Suporte a Skills**: Expandir para incluir imagens de skills quando disponíveis na API
5. **Compressão de imagens**: Implementar proxy para otimizar tamanho das imagens

Esta API centralizada fornece uma solução robusta e eficiente para gerenciar todas as imagens do ecossistema Tarkov em uma única interface, facilitando o desenvolvimento e manutenção do frontend.