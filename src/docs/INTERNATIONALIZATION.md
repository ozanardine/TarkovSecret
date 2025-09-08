# Sistema de Internacionalização (i18n)

Este documento descreve como o sistema de internacionalização funciona no Secret Tarkov.

## Visão Geral

O sistema suporta 16 idiomas diferentes conforme disponibilizado pela API Tarkov.dev:

- **cs** - Čeština (Tcheco)
- **de** - Deutsch (Alemão)
- **en** - English (Inglês)
- **es** - Español (Espanhol)
- **fr** - Français (Francês)
- **hu** - Magyar (Húngaro)
- **it** - Italiano (Italiano)
- **ja** - 日本語 (Japonês)
- **ko** - 한국어 (Coreano)
- **pl** - Polski (Polonês)
- **pt** - Português (Português) - **PADRÃO**
- **ro** - Română (Romeno)
- **ru** - Русский (Russo)
- **sk** - Slovenčina (Eslovaco)
- **tr** - Türkçe (Turco)
- **zh** - 中文 (Chinês)

## Componentes Principais

### 1. LanguageContext
Contexto React que gerencia o estado global do idioma selecionado.

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, isLoading } = useLanguage();
  // ...
}
```

### 2. LanguageSelector
Componente dropdown no navbar que permite ao usuário selecionar o idioma.

**Recursos:**
- Dropdown moderno com bandeiras
- Salva preferência no localStorage
- Detecta idioma do navegador como fallback
- Acessibilidade completa (ARIA)
- Suporte a teclado (Escape para fechar)

### 3. useApiLanguage Hook
Hook que sincroniza o idioma selecionado com as chamadas da API.

```typescript
import { useApiLanguage } from '@/hooks/useApiLanguage';

function MyComponent() {
  const { currentLanguage, isLanguageLoading } = useApiLanguage();
  // Automaticamente configura a API para usar o idioma correto
}
```

## Como Usar

### Para Componentes que Fazem Chamadas API

```typescript
import { useApiLanguage } from '@/hooks/useApiLanguage';
import { useAllItems } from '@/hooks/useTarkov';

function ItemsList() {
  // Configura automaticamente a API para o idioma correto
  useApiLanguage();
  
  // Os dados retornados estarão no idioma selecionado
  const { items, loading, error } = useAllItems();
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.name} {/* Nome no idioma selecionado */}
        </div>
      ))}
    </div>
  );
}
```

### Para Componentes que Precisam Saber o Idioma Atual

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div>
      <p>Idioma atual: {language}</p>
      <button onClick={() => setLanguage('en')}>
        Mudar para Inglês
      </button>
    </div>
  );
}
```

## Implementação Técnica

### Cache Inteligente
O sistema de cache foi atualizado para incluir o idioma na chave:
```typescript
const cacheKey = `items_${limit || 'all'}_${currentLanguage}`;
```

### Hooks Reativos
Todos os hooks principais foram atualizados para reagir a mudanças de idioma:
- `useAllItems()`
- `useQuests()`
- `useQuestSearch()`
- `useItem()`
- `useItemSearch()`

### API GraphQL
Todas as queries GraphQL foram atualizadas para aceitar o parâmetro `lang`:
```graphql
query GetItems($limit: Int, $lang: LanguageCode) {
  items(limit: $limit, lang: $lang) {
    # ...
  }
}
```

## Armazenamento Local

O idioma selecionado é salvo no localStorage com a chave `tarkov-language`.

**Detecção automática:**
1. Verifica localStorage
2. Se não encontrado, detecta idioma do navegador
3. Se não suportado, usa português (pt) como padrão

## Acessibilidade

O LanguageSelector implementa:
- Labels ARIA apropriados
- Suporte completo a teclado
- Estados de foco visíveis
- Feedback de screen reader

## Performance

**Otimizações implementadas:**
- Cache separado por idioma
- Lazy loading do contexto
- Debounce em mudanças de idioma
- Reutilização de dados quando possível

## Troubleshooting

### Dados não aparecem no idioma correto
1. Verifique se o componente usa `useApiLanguage()`
2. Confirme se o hook está sendo chamado antes das chamadas da API
3. Verifique o cache - pode estar usando dados em cache do idioma anterior

### Seletor de idioma não aparece
1. Verifique se o `LanguageProvider` está no root da aplicação
2. Confirme se o Header está dentro do provider

### Performance lenta ao trocar idiomas
1. O sistema faz novas chamadas API ao trocar idiomas
2. Isso é esperado para garantir dados atualizados
3. O cache reduz chamadas subsequentes no mesmo idioma

## Próximos Passos

- [ ] Adicionar loading states durante troca de idioma
- [ ] Implementar preload de idiomas populares
- [ ] Adicionar animações de transição
- [ ] Suporte a RTL para árabe/hebraico (se adicionados no futuro)
