# Página de Munições - Secret Tarkov

## Visão Geral

A página de munições oferece uma interface completa e moderna para explorar todas as munições disponíveis no Escape from Tarkov. Os jogadores podem comparar estatísticas, preços e encontrar a munição perfeita para sua estratégia.

## ✅ Melhorias Implementadas (Revisão Completa)

### 🚀 **Performance e UX**
- **Filtragem Inteligente**: Busca melhorada com suporte a múltiplos termos (nome, calibre, tipo)
- **Indicador de Status**: Feedback visual durante filtragem ativa
- **Otimização de Dados**: Tratamento robusto de valores nulos/undefined
- **Lógica de Preços**: Correção na comparação de eficiência e melhor preço

### 📱 **Responsividade**
- **Toggle de Visualização**: Alternância entre tabela e grade
- **Tabela Responsiva**: Scroll horizontal em dispositivos menores (min-width: 800px)
- **Layout Adaptativo**: Grid responsivo para visualização em cards
- **Controles Flexíveis**: Interface que se adapta a diferentes tamanhos de tela

### ♿ **Acessibilidade**
- **ARIA Labels**: Rótulos apropriados para leitores de tela
- **Navegação por Teclado**: Suporte completo a Tab/Enter/Espaço
- **Role Attributes**: Elementos semânticos corretos (checkbox, button)
- **Focus Management**: Indicadores visuais de foco
- **Tooltips Informativos**: Descrições contextuais para ícones

### 🎨 **Interface e Interação**
- **Busca Aprimorada**: Campo com placeholder descritivo e botão de limpar
- **Filtros Organizados**: Contadores de itens disponíveis e scroll para listas longas
- **Feedback Visual**: Indicadores de carregamento e estados ativos
- **Hover States**: Transições suaves e estados de interação

## Funcionalidades Principais

### 🎯 **Visualização Completa**
- **Grid/List View**: Alternância entre visualização em grade e lista
- **Cards Modernos**: Cada munição é exibida com informações essenciais
- **Imagens de Alta Qualidade**: Integração com a API Tarkov.dev para imagens
- **Indicadores Visuais**: Tracer bullets, níveis de penetração com cores

### 🔍 **Filtros Avançados**
- **Busca por Nome**: Pesquisa instantânea por nome ou nome curto
- **Filtro por Calibre**: Todos os calibres disponíveis (9x19mm, 5.45x39mm, etc.)
- **Range de Dano**: Slider para filtrar por dano (0-200)
- **Range de Penetração**: Slider para filtrar por penetração (0-100)
- **Range de Preço**: Filtro por preço dos traders (0-50000)
- **Filtro por Trader**: Seleção de traders específicos
- **Tipo de Munição**: FMJ, HP, AP, etc.
- **Tracer**: Apenas tracer, sem tracer, ou todas
- **Ordenação**: Por nome, dano, penetração, preço, eficiência

### 📊 **Sistema de Comparação**
- **Comparação Lado a Lado**: Até 4 munições simultaneamente
- **3 Abas de Análise**:
  - **Visão Geral**: Dano, penetração, características físicas
  - **Balística**: Modificadores de precisão/recuo, propriedades balísticas
  - **Economia**: Preços, eficiência, análise custo-benefício
- **Indicadores de Melhor**: Destacar os melhores valores em cada categoria
- **Remoção Individual**: Remover munições da comparação

### 👁️ **Preview Rápido**
- **Modal Detalhado**: Informações completas sem sair da página
- **3 Abas de Conteúdo**:
  - **Estatísticas**: Dano, penetração, fragmentação, ricochete
  - **Balística**: Modificadores, velocidade inicial, características físicas
  - **Economia**: Traders, preços, análise de eficiência
- **Visualização de Penetração**: Barra de progresso e níveis coloridos

### 💰 **Análise Econômica**
- **Melhor Preço**: Identificação automática do trader com menor preço
- **Eficiência de Dano**: Cálculo de dano por rublo
- **Eficiência de Penetração**: Cálculo de penetração por rublo
- **Informações de Trader**: Requisitos de nível e loyalty

### 📱 **Interface Responsiva**
- **Design Moderno**: Tema Tarkov com cores laranja papaia
- **Animações Suaves**: Fade-in, hover effects, transições
- **Scroll Infinito**: Carregamento progressivo de munições
- **Favoritos**: Sistema de favoritos integrado
- **Compartilhamento**: Compartilhar munições específicas

## Estrutura de Arquivos

```
src/app/ammunition/
├── page.tsx                 # Página principal
└── README.md               # Esta documentação

src/components/ammunition/
├── ModernAmmoCard.tsx      # Card de munição (grid/list)
├── AdvancedAmmoFilters.tsx # Sistema de filtros avançados
├── AmmoQuickPreview.tsx    # Modal de preview rápido
└── AmmoComparison.tsx      # Sistema de comparação

src/hooks/
└── useAmmunition.ts        # Hook para dados de munições
```

## API e Dados

### Fonte de Dados
- **Tarkov.dev GraphQL API**: Dados oficiais e atualizados
- **Cache Inteligente**: 5 minutos de cache para performance
- **Multilíngua**: Suporte a português e outros idiomas

### Estrutura de Dados
```typescript
interface Ammo {
  item: TarkovItem;           // Informações básicas do item
  weight: number;             // Peso da munição
  caliber: string;            // Calibre (ex: "9x19mm")
  stackMaxSize: number;       // Máximo por stack
  tracer: boolean;            // Se é tracer
  tracerColor?: string;       // Cor do tracer
  ammoType: string;          // Tipo (FMJ, HP, AP, etc.)
  damage: number;            // Dano corporal
  armorDamage: number;       // Dano à armadura
  fragmentationChance: number; // Chance de fragmentação
  ricochetChance: number;    // Chance de ricochete
  penetrationPower: number;  // Poder de penetração
  accuracyModifier: number;  // Modificador de precisão
  recoilModifier: number;    // Modificador de recuo
  // ... outros campos
}
```

## Níveis de Penetração

O sistema classifica automaticamente as munições em níveis de penetração:

- **🔴 Muito Alta** (50+): Penetra armaduras de alto nível
- **🟠 Alta** (40-49): Boa penetração contra armaduras médias
- **🟡 Média** (30-39): Penetração moderada
- **🔵 Baixa** (20-29): Penetração limitada
- **⚫ Muito Baixa** (<20): Pouca ou nenhuma penetração

## Performance

### Otimizações Implementadas
- **Scroll Infinito**: Carrega apenas 24 munições por vez
- **Cache de API**: Evita requisições desnecessárias
- **Filtros Eficientes**: Filtragem em memória sem re-requisições
- **Lazy Loading**: Componentes carregados sob demanda
- **Debounce**: Busca com delay para evitar spam

### Métricas Esperadas
- **Tempo de Carregamento**: < 2s para primeira carga
- **Filtros**: < 100ms para aplicar filtros
- **Scroll Infinito**: < 500ms para carregar mais itens
- **Comparação**: < 200ms para abrir modal

## Navegação

A página de munições é acessível através de:
- **URL Direta**: `/ammunition`
- **Sidebar**: Link "Munições" com ícone de raio
- **Busca**: Resultados podem redirecionar para munições específicas

## Integração com Sistema Existente

### Compatibilidade
- **Tema Tarkov**: Usa as mesmas cores e componentes
- **Sistema de Auth**: Integrado com favoritos e preferências
- **Componentes UI**: Reutiliza Button, Badge, Dialog, etc.
- **Layout**: Usa PageLayout padrão com Header e Sidebar

### Extensibilidade
- **Novos Filtros**: Fácil adição de novos critérios
- **Comparação Expandida**: Pode ser estendida para mais itens
- **Análise Avançada**: Espaço para métricas adicionais
- **Integração**: Pronto para sistema de builds de armas

## Considerações Técnicas

### Dependências
- **GraphQL**: Para consultas à API Tarkov.dev
- **Heroicons**: Ícones consistentes
- **TypeScript**: Type safety completo
- **Tailwind CSS**: Estilização responsiva

### Limitações Conhecidas
- **Dados da API**: Dependente da disponibilidade da Tarkov.dev
- **Imagens**: Fallback para ícones quando imagens não disponíveis
- **Cache**: Dados podem ficar desatualizados por até 5 minutos
- **Comparação**: Limitado a 4 munições por questões de UX

## Futuras Melhorias

### Planejadas
- **Builds de Armas**: Integração com sistema de builds
- **Calculadora de DPS**: Cálculos avançados de dano
- **Histórico de Preços**: Gráficos de variação de preços
- **Recomendações**: Sugestões baseadas em meta atual

### Possíveis
- **Filtros Salvos**: Salvar combinações de filtros favoritas
- **Alertas de Preço**: Notificações quando preços mudam
- **Análise de Meta**: Estatísticas de uso da comunidade
- **Comparação com Armaduras**: Teste contra diferentes armaduras
