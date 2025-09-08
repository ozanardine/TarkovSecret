# Dossiê de Intel: Blindagens de Tarkov (SOP para Análise e Cálculo)
**Versão:** 1.0
**Autor:** Tarkov Pro-Dev
**Status:** Confidencial - Para uso exclusivo do Agente de IA

## 1. 🎯 Visão Geral da Missão

[cite_start]Este documento estabelece o procedimento padrão para a coleta, análise e utilização de dados sobre todos os tipos de blindagem (coletes, plate carriers, rigs blindados e capacetes) de Escape from Tarkov, utilizando a API `tarkov.dev`. [cite_start]O objetivo final é fornecer ao agente de IA uma base de dados completa e precisa para realizar cálculos balísticos e de dano realistas, integrando-se ao sistema de comparação de munições existente[cite: 7, 18, 20].

## 2. 🛡️ O Campo de Batalha: Entendendo a Blindagem

Para simular o combate de forma eficaz, o agente deve compreender as seguintes mecânicas de blindagem do jogo:

* **Classe de Armadura (AC):** O principal fator de proteção, variando de 1 a 7. Determina a capacidade base de parar um projétil.
* **Pontos de Durabilidade:** A "saúde" da blindagem. Cada tiro que não penetra ou penetra parcialmente remove pontos de durabilidade. Uma armadura com 0 de durabilidade oferece proteção mínima.
* **Material:** Um fator crítico que influencia duas mecânicas-chave:
    * **Destrutibilidade:** A quantidade de dano que a durabilidade da armadura sofre. [cite_start]Materiais como Cerâmica são mais frágeis (alta destrutibilidade) que Aço ou UHMWPE. [cite: 8]
    * **Reparabilidade:** A eficiência com que a armadura pode ser consertada. [cite_start]Cerâmica perde mais pontos de durabilidade máxima a cada reparo do que Aramida. [cite: 8]
* [cite_start]**Zonas de Proteção:** Cada peça de equipamento protege um conjunto específico de zonas corporais (ex: `Tórax`, `Estômago`, `Braços`, `Cabeça, Orelhas`)[cite: 1, 6]. [cite_start]A IA deve mapear estas zonas para o `BodyDamageVisualization`[cite: 6, 16].
* **Sistema de Placas (Hitbox System):** A mecânica mais complexa.
    * [cite_start]**Armaduras Integradas:** Possuem blindagem embutida (`ItemArmorSlotLocked`) que não pode ser removida[cite: 1, 7].
    * [cite_start]**Plate Carriers:** Possuem "soquetes" (`ItemArmorSlotOpen`) que aceitam placas de armadura removíveis (`allowedPlates`)[cite: 7].
    * **Múltiplas Camadas:** Um tiro pode atingir uma placa rígida e, em seguida, a blindagem macia por trás dela. A IA deve calcular o dano sequencialmente.
* **Dano de Contusão (Blunt Damage):** Um tiro que é parado pela armadura ainda transfere uma parte do seu dano ao jogador. Este dano ignora a carne e vai direto para a vida da parte do corpo.

## 3. 📡 Coleta de Intel: A Camada de API

Para obter todos os dados necessários de forma unificada, utilizaremos uma única e poderosa query na API.

### 3.1 A Query "Master Key"

Esta é a query GraphQL definitiva que busca todos os dados relevantes sobre coletes, rigs blindados e capacetes.

```graphql
query GetMasterKeyGearData($lang: LanguageCode) {
  # Ampliamos a busca para incluir 'rig' e garantir que pegamos todos os plate carriers
  items(types: [armor, helmet, rig], lang: $lang) {
    id
    name
    shortName
    weight
    basePrice
    avg24hPrice
    wikiLink
    image512pxLink

    properties {
      # Fragmento para Armaduras
      ... on ItemPropertiesArmor {
        class
        durability
        material { name id }
        zones
        speedPenalty
        turnPenalty
        ergoPenalty
        armorType
        armorSlots {
          nameId
          zones
          ... on ItemArmorSlotLocked { name armorType }
          ... on ItemArmorSlotOpen {
            allowedPlates {
              id
              name
              shortName
              properties {
                ... on ItemPropertiesArmor { class durability }
              }
            }
          }
        }
      }
      
      # Fragmento para Capacetes
      ... on ItemPropertiesHelmet {
        class
        durability
        material { name }
        deafening
        blocksHeadset
        ricochetX
        ricochetY
        ricochetZ
        headZones
      }
      
      # Fragmento para Plate Carriers que são classificados como 'rig'
      ... on ItemPropertiesChestRig {
        class
        durability
        material { name id }
        zones
        speedPenalty
        turnPenalty
        ergoPenalty
        armorType
        armorSlots {
          nameId
          zones
          ... on ItemArmorSlotLocked { name armorType }
          ... on ItemArmorSlotOpen {
            allowedPlates {
              id
              name
              shortName
              properties {
                ... on ItemPropertiesArmor { class durability }
              }
            }
          }
        }
      }
    }
    conflictingSlotIds
  }
}


3.2 Implementação na API (lib/tarkov-api.ts)
O arquivo da camada de API deve ser atualizado para usar a query acima e processar os resultados, enriquecendo os dados de materiais.


Ação: Substituir/Adicionar as seguintes funções em tarkovDevApi:

// Adicionar esta função para buscar os detalhes dos materiais
async getArmorMaterials(): Promise<ArmorMaterial[]> {
  const cacheKey = `armor_materials_${currentLanguage}`;
  const cached = getCachedData<ArmorMaterial[]>(cacheKey);
  if (cached) return cached;

  const query = gql`
    query GetArmorMaterials($lang: LanguageCode) {
      armorMaterials(lang: $lang) {
        id
        name
        destructibility
        explosionDestructibility
        minRepairDegradation
        maxRepairDegradation
        minRepairKitDegradation
        maxRepairKitDegradation
      }
    }
  `;
  const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
  if (!response?.armorMaterials) throw new Error('Invalid API response for armor materials');
  
  setCachedData(cacheKey, response.armorMaterials);
  return response.armorMaterials;
},

// Substituir a função getArmor existente por esta versão completa
async getArmor(): Promise<Armor[]> {
  const cacheKey = `armor_master_${currentLanguage}`;
  const cached = getCachedData<Armor[]>(cacheKey);
  if (cached) return cached;

  const query = /* Inserir a "Master Key Query" aqui */ ;

  try {
    const response = await request(TARKOV_API_URL, query, { lang: currentLanguage });
    const materialsData = await this.getArmorMaterials();
    const materialsMap = new Map(materialsData.map(m => [m.id, m]));

    const items = response.items
      .filter((item: any) => item.properties && (item.properties.class || item.properties.armorSlots))
      .map((item: any) => {
        const props = item.properties;
        const materialInfo = props.material ? materialsMap.get(props.material.id) : null;

        return {
          // ... mapeamento completo dos campos para a interface Armor ...
          id: item.id,
          name: item.name,
          shortName: item.shortName,
          item: { ...item }, // Manter o objeto original
          class: props.class,
          durability: props.durability,
          material: materialInfo || props.material,
          zones: props.zones || props.headZones || [],
          armorSlots: props.armorSlots || [],
          // ... etc
        };
      });

    setCachedData(cacheKey, items);
    return items;
  } catch (error) {
    console.error('Error fetching master armor data:', error);
    throw new Error('Failed to fetch master armor data');
  }
},


3.3 Tipagem de Dados (types/tarkov.ts)
Para garantir a integridade e o IntelliSense, as seguintes interfaces devem ser definidas:

interface ArmorMaterial {
  id: string;
  name: string;
  destructibility: number;
  // ... outros campos de useArmorMaterials.ts [cite: 8]
}

interface AllowedPlate {
  id: string;
  name: string;
  shortName: string;
  properties: {
    class?: number;
    durability?: number;
  } | {};
}

interface ArmorSlot {
  nameId: string;
  zones: string[];
  name?: string;
  armorType?: string;
  allowedPlates?: AllowedPlate[];
}

export interface Armor {
  id: string;
  name: string;
  shortName: string;
  item: TarkovItem;
  class: number;
  durability: number;
  material: ArmorMaterial;
  zones: string[];
  armorSlots: ArmorSlot[];
  armorType: string;
  // ... penalidades e outras propriedades ...
}


4. 🧠 Análise de Combate: Lógica de Cálculo de Dano
O agente deve implementar um algoritmo de dano que simule as mecânicas do jogo. A função 

calculateZoneDamage no arquivo BodyDamageVisualization.tsx  deve ser o ponto central desta lógica.

Algoritmo Sugerido:

Identificar Zona de Impacto: Determinar a zona corporal atingida (ex: Thorax).

Identificar Camadas de Proteção: Consultar o objeto Armor do equipamento vestido. Filtrar o array armorSlots para encontrar todos os slots que contêm a zona de impacto em seu array zones.


Exemplo: Para um 6B43 Zabralo-Sh, um tiro no 

Thorax será interceptado pelos slots Front_plate e Soft_armor_front.

Ordenar Camadas: Organizar as camadas por prioridade. Placas rígidas (Front_plate) devem ser processadas antes de blindagens macias (Soft_armor_front).

Processar Dano por Camada (Loop):
a. Pegar a primeira camada (ex: a placa rígida).
b. Obter sua class e durability efetivas.
c. Calcular a chance de penetração da munição (ammo.penetrationPower) contra a classe da camada.
d. SE PENETRAR:
i. Calcular o dano à durabilidade da camada, aplicando o destructibility do material.
ii. Reduzir o damage e penetrationPower restantes da munição (simulando perda de energia).
iii. Passar para a próxima camada com os valores de dano/penetração reduzidos.
e. SE NÃO PENETRAR:
i. O projétil é parado.
ii. Calcular o dano de contusão (blunt damage) a ser aplicado ao jogador.
iii. Calcular um dano maior à durabilidade da camada.
iv. Encerrar o loop (o projétil não continua para as próximas camadas).

Calcular Dano Final: O dano final ao jogador é a soma do dano penetrante restante (se houver, após todas as camadas) e todo o dano de contusão acumulado.

5. 📦 O Arsenal Completo: Dados Adicionais sobre Placas
Nossa query otimizada (

v5.0 ou "God Tier") não busca os detalhes das placas dentro de allowedPlates para manter a performance. Para ter os dados completos das placas, o agente deve:

Executar a query mestre e coletar todos os ids únicos de todas as placas listadas em todos os campos allowedPlates.

Executar uma segunda query, mais simples, para buscar os detalhes apenas desses IDs.

Query para buscar Placas de Armadura:

query GetArmorPlates($plateIds: [ID!]) {
  items(ids: $plateIds) {
    id
    name
    shortName
    weight
    properties {
      ... on ItemPropertiesArmor {
        class
        durability
        material {
          id
          name
        }
        armorType
        zones
      }
    }
  }
}

O agente deve então armazenar esses dados em um mapa ou dicionário (Map<id, PlateData>) para consulta rápida durante os cálculos.