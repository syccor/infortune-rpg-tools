export interface BaseRef {
  id?: string;
  label: string;
  order?: number;
}

export interface GameClass extends BaseRef {
  family?: string;
  isMystic?: boolean;
}

export interface ClassProfile extends BaseRef {
  classId: string;
  description?: string;
}

export interface Race extends BaseRef {
  hpBonus: number;
  dodgeBonus: number;
  armorBonus: number;
  perceptionBonus: number;
  defaultLuck: number;
  maxLuck: number;
  dodgeCapBonus?: number;
  ignoreWeightDodgeMalus?: boolean;
  ignoreWeightDodgeBonus?: boolean;
  ignoreSizeDodgeBonus?: boolean;
  requiredWeightIds?: string[];
  requiredMusculatureIds?: string[];
}

export interface Grade extends BaseRef {
  hasShoulderPads: boolean;
}

export interface WeightClass extends BaseRef {
  hpModifier: number;
  dodgeModifier: number;
}

export interface MusculatureClass extends BaseRef {
  hpModifier: number;
  minWeightClassOrder?: number;
}

export interface SizeClass extends BaseRef {
  hpModifier: number;
  dodgeModifier: number;
}

export interface ArmorType extends BaseRef {
  baseArmor: number;
  baseDodgeModifier: number;
  shoulderArmorBonus: number;
  shoulderDodgeModifier: number;
  perceptionBonus: number;
  shieldAllowed: boolean;
}

export interface ShieldType extends BaseRef {
  armorBonus: number;
  dodgeModifier: number;
  attackModifier: number;
}