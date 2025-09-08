// Tarkov API Types
export interface TarkovItem {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  weight: number;
  basePrice: number;
  avg24hPrice?: number;
  changeLast48hPercent?: number;
  traderName?: string;
  traderPrice?: number;
  traderPriceCur?: string;
  updated?: string;
  slots: number;
  diff24h?: number;
  diff7d?: number;
  icon?: string;
  image?: string;
  iconLink?: string;
  gridImageLink?: string;
  inspectImageLink?: string;
  image512pxLink?: string;
  image8xLink?: string;
  imageLink?: string;
  imageLinkFallback?: string;
  wikiLink?: string;
  link?: string;
  types: string[];
  width: number;
  height: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  fleaMarketFee?: number;
  sellFor: TraderPrice[];
  buyFor: TraderPrice[];
}

export interface TraderPrice {
  source: string;
  price: number;
  currency: string;
  requirements?: Requirement[];
}

export interface Requirement {
  type: string;
  value: number;
}

export interface TarkovQuest {
  id: string;
  tarkovDataId?: number;
  name: string;
  normalizedName: string;
  trader: Trader;
  map?: Map;
  experience: number;
  wikiLink?: string;
  taskImageLink?: string;
  minPlayerLevel?: number;
  taskRequirements: TaskRequirement[];
  traderRequirements: TraderLevelRequirement[];
  traderLevelRequirements: TraderLevelRequirement[];
  objectives: TaskObjective[];
  startRewards?: TaskReward;
  finishRewards?: TaskReward;
  failConditions: TaskObjective[];
  failureOutcome?: TaskReward;
  restartable?: boolean;
  factionName?: string;
  kappaRequired?: boolean;
  lightkeeperRequired?: boolean;
  descriptionMessageId?: string;
  startMessageId?: string;
  successMessageId?: string;
  failMessageId?: string;
  availableDelaySecondsMin?: number;
  availableDelaySecondsMax?: number;
}

export interface Trader {
  id: string;
  name: string;
  normalizedName: string;
  description?: string;
  imageLink?: string;
  image4xLink?: string;
  tarkovDataId?: number;
}

export interface Map {
  id: string;
  name: string;
  normalizedName: string;
}

export interface Skill {
  id: string;
  name: string;
  imageLink?: string;
}

export interface TaskRequirement {
  task: {
    id: string;
    name: string;
  };
  status: 'completed' | 'failed' | 'inProgress' | 'pending';
}

export interface TraderLevelRequirement {
  trader: Trader;
  level: number;
}

export interface TaskObjective {
  id?: string;
  description?: string;
  type: string;
  maps?: Map[];
  optional?: boolean;
  count?: number;
  foundInRaid?: boolean;
  level?: number;
  
  // Para objetivos de item
  item?: {
    id: string;
    name: string;
    shortName: string;
    iconLink?: string;
  };
  items?: {
    id: string;
    name: string;
    shortName: string;
    iconLink?: string;
  }[];
  
  // Para objetivos de skill
  skill?: Skill;
  
  // Para objetivos de trader
  trader?: Trader;
  
  // Para objetivos de experiência
  experience?: number;
  
  // Para objetivos de dinheiro
  money?: number;
  
  // Para objetivos de reputação
  standing?: number;
}

export interface TaskReward {
  items?: ContainedItem[];
  traderStanding?: TraderStanding[];
  offerUnlock?: OfferUnlock[];
  skillLevelReward?: SkillLevelReward[];
  traderUnlock?: Trader[];
}

export interface ContainedItem {
  item: {
    id: string;
    name: string;
    shortName?: string;
    iconLink?: string;
    gridImageLink?: string;
    imageLink?: string;
  };
  count: number;
  quantity?: number;
  foundInRaid?: boolean;
}

export interface TraderStanding {
  trader: Trader;
  standing: number;
}

export interface OfferUnlock {
  id: string;
  trader: Trader;
  level: number;
  item: TarkovItem;
}

export interface SkillLevelReward {
  skill?: Skill;
  name: string;
  level: number;
}

export interface HideoutStation {
  id: string;
  name: string;
  normalizedName: string;
  imageLink?: string;
  levels: HideoutStationLevel[];
}

export interface HideoutStationLevel {
  id: string;
  level: number;
  constructionTime: number;
  description: string;
  itemRequirements: RequirementItem[];
  stationLevelRequirements: RequirementHideoutStationLevel[];
  skillRequirements: RequirementSkill[];
  traderRequirements: RequirementTrader[];
  crafts: Craft[];
  bonuses?: HideoutStationBonus[];
}

export interface RequirementItem {
  item: {
    id: string;
    name: string;
    shortName: string;
    iconLink?: string;
  };
  count: number;
  quantity: number;
}

export interface RequirementHideoutStationLevel {
  station: {
    id: string;
    name: string;
    normalizedName: string;
  };
  level: number;
}

export interface RequirementSkill {
  name: string;
  level: number;
}

export interface RequirementTrader {
  trader: Trader;
  level: number;
}

export interface HideoutStationBonus {
  type: string;
  name: string;
  value: number;
  passive: boolean;
  production: boolean;
  slotItems?: TarkovItem[];
  skillName?: string;
}

export interface Craft {
  id: string;
  station: HideoutStation;
  level: number;
  taskUnlock?: TarkovQuest;
  duration: number;
  requiredItems: ContainedItem[];
  requiredQuestItems: QuestItem[];
  rewardItems: ContainedItem[];
}

// ContainedItem moved to earlier in file

export interface QuestItem {
  id: string;
  name: string;
  shortName: string;
  iconLink?: string;
}

export interface ItemAttribute {
  name: string;
  value: number;
}

export interface Barter {
  id: string;
  trader: Trader;
  level: number;
  taskUnlock?: TarkovQuest;
  requiredItems: ContainedItem[];
  rewardItems: ContainedItem[];
  buyLimit?: number;
}

export interface Ammo {
  item: TarkovItem;
  weight: number;
  caliber?: string;
  stackMaxSize: number;
  tracer: boolean;
  tracerColor?: string;
  ammoType: string;
  projectileCount?: number;
  damage: number;
  armorDamage: number;
  fragmentationChance: number;
  ricochetChance: number;
  penetrationChance: number;
  penetrationPower: number;
  penetrationPowerDeviation?: number;
  accuracyModifier: number;
  recoilModifier: number;
  initialSpeed?: number;
  lightBleedModifier: number;
  heavyBleedModifier: number;
  staminaBurnPerDamage?: number;
}

export interface AllowedPlate {
  id: string;
  name: string;
  shortName: string;
  properties: {
    class?: number;
    durability?: number;
  } | {};
}

export interface ArmorSlot {
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
  armorType?: string;
  speedPenalty?: number;
  turnPenalty?: number;
  ergoPenalty?: number;
  weight?: number;
  // Propriedades específicas para capacetes
  deafening?: string;
  blocksHeadset?: boolean;
  ricochetX?: number;
  ricochetY?: number;
  ricochetZ?: number;
  headZones?: string[];
  // Campos de compatibilidade
  ergonomicsPenalty?: number;
  movementPenalty?: number;
}

export interface ArmorMaterial {
  id: string;
  name: string;
  destructibility: number;
  explosionDestructibility: number;
  minRepairDegradation: number;
  maxRepairDegradation: number;
  minRepairKitDegradation: number;
  maxRepairKitDegradation: number;
}

export interface Weapon {
  item: TarkovItem;
  weight: number;
  caliber?: string;
  fireRate: number;
  fireModes: string[];
  effectiveDistance: number;
  ergonomics: number;
  recoilVertical: number;
  recoilHorizontal: number;
  accuracy: number;
  malfunctionChance: number;
  durabilityBurnModifier: number;
  heatFactor: number;
  heatFactorByShot: number;
  coolFactor: number;
  coolFactorByShot: number;
}

export interface MarketData {
  item: TarkovItem;
  avg24hPrice: number;
  avg7dPrice: number;
  changeLast48h: number;
  changeLast48hPercent: number;
  low24hPrice: number;
  high24hPrice: number;
  lastLowPrice: number;
  lastHighPrice: number;
  lastOfferCount: number;
  lastBuyCount: number;
  updated: string;
}

export interface PriceHistory {
  item: TarkovItem;
  data: PriceHistoryPoint[];
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  count: number;
}