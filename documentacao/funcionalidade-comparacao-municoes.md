# 🔬 Documentação Técnica - Funcionalidade de Comparação de Munições

## 🎯 Visão Geral

A funcionalidade de comparação de munições é o coração da página de ammunition, permitindo análise detalhada e comparativa entre diferentes tipos de munição do Escape from Tarkov. Esta feature combina visualização de dados complexos, interatividade avançada e cálculos balísticos precisos.

## 🏗️ Arquitetura do Componente

### Estrutura Principal
```
AmmoComparison.tsx
├── Estados de Controle
├── Cálculos Memoizados
├── Sistema de Abas
├── Visualização Corporal
└── Componentes Especializados
```

### Interface TypeScript
```typescript
interface AmmoComparisonProps {
  ammunition: Ammo[];           // Array de munições para comparar
  isOpen: boolean;             // Estado do modal
  onClose: () => void;         // Callback de fechamento
}

interface BodyPart {
  id: string;                  // Identificador único
  name: string;                // Nome da parte do corpo
  multiplier: number;          // Multiplicador de dano
  zones: string[];             // Zonas de impacto
}
```

## 🧮 Sistema de Cálculos

### Cálculos Memoizados
O componente utiliza `useMemo` para otimizar performance em cálculos complexos:

```typescript
const calculations = useMemo(() => {
  // Verificação de segurança
  if (!ammunition || ammunition.length === 0) {
    return defaultCalculationsObject;
  }
  
  try {
    // Cálculos de preço, dano, penetração, etc.
    return {
      bestPrice: calculateBestPrices(),
      worstPrice: calculateWorstPrices(),
      bestDamage: Math.max(...damages),
      bestPenetration: Math.max(...penetrations),
      // ... outros cálculos
    };
  } catch (error) {
    console.error('Error in calculations:', error);
    return fallbackCalculationsObject;
  }
}, [ammunition]);
```

### Algoritmos de Cálculo

#### 1. Cálculo de Melhor Preço
```typescript
const getBestPrice = (ammo: Ammo) => {
  if (!ammo.item.buyFor || ammo.item.buyFor.length === 0) {
    return null;
  }
  
  let bestPrice = null;
  for (const current of ammo.item.buyFor) {
    if (!current || typeof current.price !== 'number') continue;
    if (!bestPrice || current.price < bestPrice.price) {
      bestPrice = current;
    }
  }
  return bestPrice;
};
```

#### 2. Cálculo de Dano Efetivo
```typescript
const calculateEffectiveDamage = (ammo: Ammo, bodyPart: BodyPart) => {
  const baseDamage = ammo.damage || 0;
  const multiplier = bodyPart.multiplier || 1;
  return Math.round(baseDamage * multiplier);
};
```

#### 3. Cálculo de Eficiência
```typescript
const calculateEfficiency = (damage: number, price: number) => {
  if (!price || price === 0) return 0;
  return Number((damage / price).toFixed(4));
};
```

## 🎨 Sistema de 4 Views Especializadas

### 1. 🔥 View de DANO

#### Funcionalidades
- **Análise por Parte do Corpo**: Cabeça, tórax, estômago, braços, pernas
- **Multiplicadores Realísticos**: Baseados no jogo original
- **Visualização Corporal**: Silhueta SVG interativa
- **Comparação Visual**: Barras de progresso com gradientes

#### Implementação
```typescript
const DamageView = () => {
  const bodyParts = [
    { id: 'head', name: 'Cabeça', multiplier: 2.0, zones: ['Head'] },
    { id: 'thorax', name: 'Tórax', multiplier: 1.0, zones: ['Thorax'] },
    { id: 'stomach', name: 'Estômago', multiplier: 1.5, zones: ['Stomach'] },
    { id: 'arms', name: 'Braços', multiplier: 0.7, zones: ['LeftArm', 'RightArm'] },
    { id: 'legs', name: 'Pernas', multiplier: 0.65, zones: ['LeftLeg', 'RightLeg'] }
  ];
  
  return (
    <div className="space-y-6">
      <BodyDamageVisualization />
      <DamageComparisonTable />
    </div>
  );
};
```

### 2. 🛡️ View de PENETRAÇÃO

#### Funcionalidades
- **Classes de Armadura**: Análise por classes 1-6
- **Chance de Penetração**: Cálculos baseados em fórmulas do jogo
- **Cores Temáticas**: Sistema visual intuitivo
- **Descrições Explicativas**: Tooltips informativos

#### Mapeamento de Classes
```typescript
const armorClasses = [
  { class: 1, name: 'Classe 1', description: 'Proteção básica', color: 'bg-gray-500' },
  { class: 2, name: 'Classe 2', description: 'Proteção leve', color: 'bg-green-500' },
  { class: 3, name: 'Classe 3', description: 'Proteção média', color: 'bg-yellow-500' },
  { class: 4, name: 'Classe 4', description: 'Proteção alta', color: 'bg-orange-500' },
  { class: 5, name: 'Classe 5', description: 'Proteção muito alta', color: 'bg-red-500' },
  { class: 6, name: 'Classe 6', description: 'Proteção máxima', color: 'bg-purple-500' }
];
```

### 3. ⚗️ View de BALÍSTICA

#### Propriedades Analisadas
- **Modificadores de Precisão**: Impact na mira
- **Modificadores de Recuo**: Controle da arma
- **Velocidade Inicial**: Balística externa
- **Propriedades Especiais**: Fragmentação, ricochete
- **Peso e Dimensões**: Características físicas

#### Layout Organizado
```typescript
const BallisticsView = () => {
  const properties = [
    { key: 'accuracyModifier', label: 'Precisão', unit: '%', format: 'percentage' },
    { key: 'recoilModifier', label: 'Recuo', unit: '%', format: 'percentage' },
    { key: 'initialSpeed', label: 'Velocidade', unit: 'm/s', format: 'number' },
    { key: 'fragmentationChance', label: 'Fragmentação', unit: '%', format: 'percentage' }
  ];
  
  return <PropertyComparisonGrid properties={properties} />;
};
```

### 4. 💰 View de ECONOMIA

#### Métricas Econômicas
- **Preços por Trader**: Comparação de fontes
- **Eficiência Dano/Preço**: Custo-benefício de dano
- **Eficiência Penetração/Preço**: Custo-benefício de penetração
- **Rankings**: Classificação automática

#### Cálculos de Eficiência
```typescript
const economicMetrics = {
  damageEfficiency: damage / bestPrice,
  penetrationEfficiency: penetration / bestPrice,
  overallValue: (damage + penetration) / bestPrice
};
```

## 🎭 Visualização Corporal Interativa

### Componente BodyDamageVisualization

#### Características Técnicas
- **SVG Responsivo**: Escalável e vetorial
- **Gradientes Realísticos**: Sombras e profundidade
- **Estados Interativos**: Hover, selected, disabled
- **Acessibilidade**: ARIA labels e navegação por teclado

#### Implementação SVG
```typescript
const BodySilhouette = () => {
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      <defs>
        <radialGradient id="bodyGradient">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </radialGradient>
        <filter id="innerShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offset" />
        </filter>
      </defs>
      
      {/* Cabeça */}
      <ellipse 
        cx="100" cy="40" rx="25" ry="30"
        className={getPartClassName('head')}
        onClick={() => handlePartClick('head')}
        onMouseEnter={() => setHoveredPart('head')}
      />
      
      {/* Outras partes do corpo */}
    </svg>
  );
};
```

#### Estados Visuais
```typescript
const getPartClassName = (partId: string) => {
  const baseClasses = 'transition-all duration-300 cursor-pointer';
  
  if (selectedPart === partId) {
    return `${baseClasses} fill-orange-500 stroke-orange-400 stroke-2`;
  }
  
  if (hoveredPart === partId) {
    return `${baseClasses} fill-gray-400 stroke-gray-300 stroke-1`;
  }
  
  return `${baseClasses} fill-gray-600 stroke-gray-500 stroke-1 hover:fill-gray-500`;
};
```

## 🚀 Otimizações de Performance

### 1. Memoização Estratégica
- **Cálculos Complexos**: Memoizados com `useMemo`
- **Dependências Precisas**: Arrays de dependência otimizados
- **Fallbacks**: Valores padrão para evitar recálculos

### 2. Renderização Condicional
```typescript
// Renderização apenas quando necessário
const shouldRenderView = (viewName: string) => {
  return activeView === viewName && ammunition.length > 0;
};

// Lazy loading de componentes pesados
const BodyVisualization = lazy(() => import('./BodyDamageVisualization'));
```

### 3. Debounce de Interações
```typescript
const debouncedHover = useCallback(
  debounce((partId: string) => {
    setHoveredPart(partId);
  }, 100),
  []
);
```

## 🎨 Design System da Comparação

### Paleta de Cores Especializada
```css
:root {
  --damage-high: #ef4444;      /* Vermelho para alto dano */
  --damage-medium: #f59e0b;    /* Amarelo para dano médio */
  --damage-low: #10b981;       /* Verde para baixo dano */
  --penetration: #3b82f6;      /* Azul para penetração */
  --efficiency: #8b5cf6;       /* Roxo para eficiência */
  --accent: #ff6b35;           /* Laranja papaia */
}
```

### Componentes Visuais
- **Progress Bars**: Gradientes animados
- **Badges**: Status e rankings
- **Cards**: Elevação e sombras
- **Tooltips**: Informações contextuais

## 🔧 Tratamento de Erros

### Estratégias Implementadas

#### 1. Validação de Dados
```typescript
const validateAmmunition = (ammo: Ammo[]) => {
  return ammo.filter(item => 
    item && 
    typeof item.damage === 'number' &&
    typeof item.penetrationPower === 'number' &&
    item.item &&
    item.item.name
  );
};
```

#### 2. Fallbacks Gracioso
```typescript
const safeCalculation = (fn: () => number, fallback: number = 0) => {
  try {
    const result = fn();
    return isNaN(result) ? fallback : result;
  } catch {
    return fallback;
  }
};
```

#### 3. Error Boundaries
- **Component Level**: Cada view tem seu próprio error boundary
- **Calculation Level**: Try/catch em todos os cálculos
- **User Feedback**: Mensagens de erro amigáveis

## 📱 Responsividade da Comparação

### Adaptações por Breakpoint

#### Mobile (< 768px)
- **Layout Vertical**: Stack de cards
- **Tabs Simplificadas**: Ícones apenas
- **Visualização Corporal**: Tamanho reduzido
- **Tabelas**: Scroll horizontal

#### Tablet (768px - 1024px)
- **Layout Híbrido**: 2 colunas
- **Tabs Completas**: Texto + ícones
- **Visualização**: Tamanho médio

#### Desktop (> 1024px)
- **Layout Completo**: Até 4 colunas
- **Todas as Features**: Funcionalidade completa
- **Visualização**: Tamanho completo

## 🎯 Casos de Uso Avançados

### 1. Análise de Meta Gaming
- **Cenário**: Jogador competitivo otimizando loadout
- **Features Utilizadas**: Todas as 4 views, cálculos de eficiência
- **Resultado**: Decisão baseada em dados precisos

### 2. Educação de Novos Jogadores
- **Cenário**: Aprendizado sobre mecânicas de dano
- **Features Utilizadas**: Visualização corporal, tooltips explicativos
- **Resultado**: Compreensão intuitiva das mecânicas

### 3. Planejamento de Orçamento
- **Cenário**: Otimização de custo por raid
- **Features Utilizadas**: View econômica, rankings de eficiência
- **Resultado**: Máximo custo-benefício

## 🔮 Extensibilidade Futura

### Pontos de Extensão Identificados
- **Novas Métricas**: TTK (Time to Kill), DPS
- **Simulações**: Monte Carlo para cenários complexos
- **Integração**: Builds completas de armas
- **Social**: Compartilhamento de comparações
- **IA**: Recomendações baseadas em estilo de jogo

## 🎉 Conclusão

A funcionalidade de comparação de munições representa um marco em interfaces para gaming, combinando precisão técnica, design intuitivo e performance otimizada. É um exemplo de como transformar dados complexos em insights acionáveis através de visualização inteligente e interação bem projetada.