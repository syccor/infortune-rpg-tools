import {
  ArmorType,
  Grade,
  MusculatureClass,
  Race,
  ShieldType,
  SizeClass,
  WeightClass,
} from '../models/reference.model';

export interface CharacterPreviewStats {
  maxHp: number;
  currentHp: number;
  dodge: number;
  agility: number;
  armor: number;
  perception: number;
  luckpoint: number;
  luckMax: number;
  hasShoulderPads: boolean;
}

export function calculateCharacterStats(input: {
  weight: WeightClass;
  musculature: MusculatureClass;
  size: SizeClass;
  race: Race;
  grade: Grade;
  armorType: ArmorType;
  shieldType: ShieldType | null;
}): CharacterPreviewStats {
  const baseHp = 180;
  const baseDodge = 20;

  let weightDodge = input.weight.dodgeModifier;
  let sizeDodge = input.size.dodgeModifier;

  if (input.race.ignoreWeightDodgeMalus && weightDodge < 0) {
    weightDodge = 0;
  }

  if (input.race.ignoreWeightDodgeBonus && weightDodge > 0) {
    weightDodge = 0;
  }

  if (input.race.ignoreSizeDodgeBonus && sizeDodge > 0) {
    sizeDodge = 0;
  }

  const hasShoulderPads =
    input.grade.hasShoulderPads && input.armorType.id !== 'cloth';

  const armorFromArmorType =
    input.armorType.baseArmor +
    (hasShoulderPads ? input.armorType.shoulderArmorBonus : 0);

  const dodgeFromArmorType =
    input.armorType.baseDodgeModifier +
    (hasShoulderPads ? input.armorType.shoulderDodgeModifier : 0);

  const shieldArmor =
    input.armorType.shieldAllowed && input.shieldType
      ? input.shieldType.armorBonus
      : 0;

  const shieldDodge =
    input.armorType.shieldAllowed && input.shieldType
      ? input.shieldType.dodgeModifier
      : 0;

  const maxHp =
    baseHp +
    input.weight.hpModifier +
    input.musculature.hpModifier +
    input.size.hpModifier +
    input.race.hpBonus;

  const dodge =
    baseDodge +
    weightDodge +
    sizeDodge +
    input.race.dodgeBonus +
    dodgeFromArmorType +
    shieldDodge;

  const armor =
    armorFromArmorType +
    input.race.armorBonus +
    shieldArmor;

  const perception =
    input.race.perceptionBonus +
    input.armorType.perceptionBonus;

  const agility = dodge + 100;

  return {
    maxHp,
    currentHp: maxHp,
    dodge,
    agility,
    armor,
    perception,
    luckpoint: input.race.defaultLuck ?? 0,
    luckMax: input.race.maxLuck ?? 1,
    hasShoulderPads,
  };
}