import { Ammo, Armor, ArmorMaterial } from '@/types/tarkov';

// Tipos para cálculos de dano
export interface DamageCalculation {
  penetrationChance: number;
  damageIfPenetrates: number;
  damageIfBlocked: number;
  averageDamage: number;
  armorDamage: number;
  bluntDamage: number;
}

export interface ZoneDamageResult {
  baseDamage: number;
  effectiveDamage: number;
  penetrationChance: number;
  protectingArmor?: Armor;
  armorDamage: number;
  bluntDamage: number;
}

export interface TTKResult {
  shotsToKill: number;
  timeToKill?: number;
  damagePerShot: number;
  penetrationChance: number;
  armorDamage: number;
}

export interface BodyPartHealth {
  head: number;
  thorax: number;
  stomach: number;
  leftarm: number;
  rightarm: number;
  leftleg: number;
  rightleg: number;
}

// Constantes do jogo
const BODY_PART_HEALTH: BodyPartHealth = {
  head: 35,
  thorax: 85,
  stomach: 70,
  leftarm: 60,
  rightarm: 60,
  leftleg: 65,
  rightleg: 65
};

// Modificadores de material baseados em dados reais do Tarkov
const MATERIAL_MODIFIERS: Record<string, {
  destructibility: number;
  penetrationResistance: number;
  bluntDamageReduction: number;
}> = {
  'ceramic': { destructibility: 1.5, penetrationResistance: 1.2, bluntDamageReduction: 0.8 },
  'aramid': { destructibility: 0.8, penetrationResistance: 0.9, bluntDamageReduction: 0.7 },
  'uhmwpe': { destructibility: 0.7, penetrationResistance: 0.8, bluntDamageReduction: 0.6 },
  'steel': { destructibility: 1.0, penetrationResistance: 1.0, bluntDamageReduction: 0.9 },
  'aluminum': { destructibility: 1.2, penetrationResistance: 0.7, bluntDamageReduction: 0.5 },
  'titanium': { destructibility: 0.9, penetrationResistance: 1.1, bluntDamageReduction: 0.8 },
  'glass': { destructibility: 2.0, penetrationResistance: 0.5, bluntDamageReduction: 0.3 },
  'composite': { destructibility: 1.1, penetrationResistance: 1.0, bluntDamageReduction: 0.8 }
};

/**
 * Calcula a chance de penetração de uma munição contra uma armadura
 * Baseado nas mecânicas reais do Escape from Tarkov
 */
export function calculatePenetrationChance(
  ammoPenetration: number,
  armorClass: number,
  armorDurability: number,
  maxDurability: number,
  armorMaterial: string = 'steel'
): number {
  // Fator de durabilidade (0-1, onde 1 = durabilidade máxima)
  const durabilityFactor = Math.max(0.1, armorDurability / maxDurability);
  
  // Resistência base da armadura por classe
  const baseArmorResistance = armorClass * 12.5;
  
  // Modificador do material
  const materialMod = MATERIAL_MODIFIERS[armorMaterial.toLowerCase()]?.penetrationResistance || 1.0;
  
  // Resistência efetiva considerando durabilidade e material
  const effectiveResistance = baseArmorResistance * durabilityFactor * materialMod;
  
  // Diferença entre penetração e resistência
  const penetrationDifference = ammoPenetration - effectiveResistance;
  
  // Fórmula de chance de penetração baseada em dados reais do Tarkov
  let penetrationChance = 0;
  
  if (penetrationDifference >= 25) {
    penetrationChance = 100;
  } else if (penetrationDifference >= 10) {
    penetrationChance = 80 + (penetrationDifference - 10) * 1.33;
  } else if (penetrationDifference >= 0) {
    penetrationChance = 50 + penetrationDifference * 3;
  } else if (penetrationDifference >= -15) {
    penetrationChance = 50 + penetrationDifference * 1.5;
  } else if (penetrationDifference >= -30) {
    penetrationChance = 27.5 + (penetrationDifference + 15) * 0.5;
  } else {
    penetrationChance = Math.max(0, 20 + (penetrationDifference + 30) * 0.25);
  }
  
  return Math.min(100, Math.max(0, Math.round(penetrationChance * 100) / 100));
}

/**
 * Calcula o dano efetivo após considerar a proteção da armadura
 */
export function calculateEffectiveDamage(
  baseDamage: number,
  ammoPenetration: number,
  armorClass: number,
  armorDurability: number,
  maxDurability: number,
  armorMaterial: string = 'steel',
  armorDamage: number = 0
): DamageCalculation {
  const penetrationChance = calculatePenetrationChance(
    ammoPenetration,
    armorClass,
    armorDurability,
    maxDurability,
    armorMaterial
  );
  
  // Dano se a munição penetrar (100% do dano base)
  const damageIfPenetrates = baseDamage;
  
  // Dano contundente se a munição for bloqueada
  const materialMod = MATERIAL_MODIFIERS[armorMaterial.toLowerCase()]?.bluntDamageReduction || 1.0;
  const bluntDamageReduction = Math.min(0.95, armorClass * 0.12 * materialMod);
  const damageIfBlocked = baseDamage * (1 - bluntDamageReduction);
  
  // Dano médio considerando a chance de penetração
  const averageDamage = 
    (penetrationChance / 100) * damageIfPenetrates +
    ((100 - penetrationChance) / 100) * damageIfBlocked;
  
  // Dano à armadura
  const armorDamageDealt = calculateArmorDamage(
    ammoPenetration,
    armorClass,
    armorMaterial,
    penetrationChance > 50
  );
  
  return {
    penetrationChance: Math.round(penetrationChance * 100) / 100,
    damageIfPenetrates: Math.round(damageIfPenetrates * 100) / 100,
    damageIfBlocked: Math.round(damageIfBlocked * 100) / 100,
    averageDamage: Math.round(averageDamage * 100) / 100,
    armorDamage: Math.round(armorDamageDealt * 100) / 100,
    bluntDamage: Math.round(damageIfBlocked * 100) / 100
  };
}

/**
 * Calcula o dano em uma zona corporal específica considerando equipamentos
 */
export function calculateZoneDamage(
  ammo: Ammo,
  bodyZone: string,
  equippedItems: Armor[]
): ZoneDamageResult {
  const baseDamage = ammo.damage;
  
  // Encontra o equipamento que protege esta zona
  const protectingArmor = equippedItems.find(item => 
    item.zones.some(zone => zone.toLowerCase() === bodyZone.toLowerCase())
  );
  
  if (!protectingArmor) {
    // Sem proteção - dano total
    return {
      baseDamage,
      effectiveDamage: baseDamage,
      penetrationChance: 100,
      armorDamage: 0,
      bluntDamage: 0
    };
  }
  
  // Calcula dano considerando a armadura
  const damageCalc = calculateEffectiveDamage(
    baseDamage,
    ammo.penetrationPower,
    protectingArmor.class,
    protectingArmor.durability,
    protectingArmor.durability, // Assumindo durabilidade máxima por enquanto
    protectingArmor.material.name
  );
  
  return {
    baseDamage,
    effectiveDamage: damageCalc.averageDamage,
    penetrationChance: damageCalc.penetrationChance,
    protectingArmor,
    armorDamage: damageCalc.armorDamage,
    bluntDamage: damageCalc.bluntDamage
  };
}

/**
 * Calcula o TTK (Time to Kill) considerando equipamentos
 */
export function calculateTimeToKill(
  ammo: Ammo,
  targetBodyPart: string,
  equippedItems: Armor[],
  weaponFireRate?: number
): TTKResult {
  const targetHealth = getBodyPartHealth(targetBodyPart);
  const zoneCalc = calculateZoneDamage(ammo, targetBodyPart, equippedItems);
  
  const shotsToKill = Math.ceil(targetHealth / zoneCalc.effectiveDamage);
  
  let timeToKill: number | undefined;
  if (weaponFireRate) {
    // Converte RPM para shots por segundo
    const shotsPerSecond = weaponFireRate / 60;
    timeToKill = (shotsToKill - 1) / shotsPerSecond;
  }
  
  return {
    shotsToKill,
    timeToKill,
    damagePerShot: zoneCalc.effectiveDamage,
    penetrationChance: zoneCalc.penetrationChance,
    armorDamage: zoneCalc.armorDamage
  };
}

/**
 * Retorna a vida base de cada parte do corpo
 */
export function getBodyPartHealth(bodyPart: string): number {
  const normalizedPart = bodyPart.toLowerCase();
  return BODY_PART_HEALTH[normalizedPart as keyof BodyPartHealth] || 85;
}

/**
 * Calcula a degradação da armadura após receber um tiro
 */
export function calculateArmorDamage(
  ammoPenetration: number,
  armorClass: number,
  armorMaterial: string,
  penetrated: boolean
): number {
  // Modificador do material baseado em dados reais
  const materialMod = MATERIAL_MODIFIERS[armorMaterial.toLowerCase()]?.destructibility || 1.0;
  
  // Dano base à armadura (mais realista)
  let armorDamage = ammoPenetration * 0.08;
  
  // Se penetrou, causa mais dano à armadura
  if (penetrated) {
    armorDamage *= 1.8;
  }
  
  // Aplica modificador do material
  armorDamage *= materialMod;
  
  // Considera a classe da armadura (armaduras de classe maior são mais resistentes)
  armorDamage *= (1 - (armorClass - 1) * 0.05);
  
  return Math.round(Math.max(0.1, armorDamage) * 100) / 100;
}

/**
 * Calcula a chance de fragmentação de uma munição
 */
export function calculateFragmentationChance(
  ammo: Ammo,
  targetBodyPart: string,
  equippedItems: Armor[]
): number {
  const baseFragChance = ammo.fragmentationChance;
  
  // Encontra o equipamento que protege esta zona
  const protectingArmor = equippedItems.find(item => 
    item.zones.some(zone => zone.toLowerCase() === targetBodyPart.toLowerCase())
  );
  
  if (!protectingArmor) {
    return baseFragChance;
  }
  
  // Armaduras reduzem a chance de fragmentação
  const armorReduction = protectingArmor.class * 0.15;
  const materialMod = MATERIAL_MODIFIERS[protectingArmor.material.name.toLowerCase()]?.bluntDamageReduction || 1.0;
  
  return Math.max(0, baseFragChance - (armorReduction * materialMod));
}

/**
 * Calcula o dano total considerando fragmentação
 */
export function calculateTotalDamageWithFragmentation(
  ammo: Ammo,
  targetBodyPart: string,
  equippedItems: Armor[]
): {
  baseDamage: number;
  fragmentationDamage: number;
  totalDamage: number;
  fragmentationChance: number;
} {
  const zoneCalc = calculateZoneDamage(ammo, targetBodyPart, equippedItems);
  const fragChance = calculateFragmentationChance(ammo, targetBodyPart, equippedItems);
  
  // Dano de fragmentação é 50% do dano base
  const fragmentationDamage = zoneCalc.effectiveDamage * 0.5;
  
  // Dano total considerando chance de fragmentação
  const totalDamage = zoneCalc.effectiveDamage + (fragmentationDamage * (fragChance / 100));
  
  return {
    baseDamage: zoneCalc.effectiveDamage,
    fragmentationDamage,
    totalDamage: Math.round(totalDamage * 100) / 100,
    fragmentationChance: Math.round(fragChance * 100) / 100
  };
}

/**
 * Calcula a chance de ricochete
 */
export function calculateRicochetChance(
  ammo: Ammo,
  armorClass: number,
  armorMaterial: string,
  angle: number = 0 // Ângulo de impacto em graus
): number {
  const baseRicochetChance = ammo.ricochetChance;
  
  // Armaduras de classe maior têm mais chance de ricochete
  const armorBonus = armorClass * 0.05;
  
  // Modificador do material
  const materialMod = MATERIAL_MODIFIERS[armorMaterial.toLowerCase()]?.penetrationResistance || 1.0;
  
  // Ângulo de impacto afeta a chance de ricochete
  const angleModifier = Math.max(0.5, 1 - (angle / 90));
  
  return Math.min(100, Math.round((baseRicochetChance + armorBonus) * materialMod * angleModifier * 100) / 100);
}

/**
 * Compara duas munições contra uma armadura específica
 */
export function compareAmmunition(
  ammo1: Ammo,
  ammo2: Ammo,
  armor: Armor,
  targetBodyPart: string = 'thorax'
): {
  ammo1: {
    name: string;
    damage: DamageCalculation;
    ttk: TTKResult;
  };
  ammo2: {
    name: string;
    damage: DamageCalculation;
    ttk: TTKResult;
  };
  winner: string;
  reason: string;
} {
  const damage1 = calculateEffectiveDamage(
    ammo1.damage,
    ammo1.penetrationPower,
    armor.class,
    armor.durability,
    armor.durability,
    armor.material.name
  );
  
  const damage2 = calculateEffectiveDamage(
    ammo2.damage,
    ammo2.penetrationPower,
    armor.class,
    armor.durability,
    armor.durability,
    armor.material.name
  );
  
  const ttk1 = calculateTimeToKill(ammo1, targetBodyPart, [armor]);
  const ttk2 = calculateTimeToKill(ammo2, targetBodyPart, [armor]);
  
  // Determina o vencedor baseado em múltiplos fatores
  let winner = '';
  let reason = '';
  
  if (damage1.averageDamage > damage2.averageDamage && damage1.penetrationChance > damage2.penetrationChance) {
    winner = ammo1.item.name;
    reason = 'Maior dano e penetração';
  } else if (damage2.averageDamage > damage1.averageDamage && damage2.penetrationChance > damage1.penetrationChance) {
    winner = ammo2.item.name;
    reason = 'Maior dano e penetração';
  } else if (ttk1.shotsToKill < ttk2.shotsToKill) {
    winner = ammo1.item.name;
    reason = 'Menor TTK';
  } else if (ttk2.shotsToKill < ttk1.shotsToKill) {
    winner = ammo2.item.name;
    reason = 'Menor TTK';
  } else {
    winner = 'Empate';
    reason = 'Performance similar';
  }
  
  return {
    ammo1: {
      name: ammo1.item.name,
      damage: damage1,
      ttk: ttk1
    },
    ammo2: {
      name: ammo2.item.name,
      damage: damage2,
      ttk: ttk2
    },
    winner,
    reason
  };
}