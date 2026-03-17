import { PetClass, PetSpecies } from '../models/reference.model';

export interface PetPreviewStats {
  maxHp: number;
  currentHp: number;
  armor: number;
  dodge: number;
  attack: number;
  dodgeCap: number;
  armorCap: number;
}

export function calculatePetStats(
  species: PetSpecies,
  petClass: PetClass,
): PetPreviewStats {
  const maxHp = species.baseHp + petClass.hpModifier;
  const armor = Math.min(
    species.baseArmor + petClass.armorModifier,
    petClass.armorCap,
  );
  const dodge = Math.min(
    species.baseDodge + petClass.dodgeModifier,
    petClass.dodgeCap,
  );
  const attack = species.baseAttack + petClass.attackModifier;

  return {
    maxHp,
    currentHp: maxHp,
    armor,
    dodge,
    attack,
    dodgeCap: petClass.dodgeCap,
    armorCap: petClass.armorCap,
  };
}