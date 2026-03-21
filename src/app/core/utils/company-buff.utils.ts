import { Character, Pet } from '@models/character.model';
import { CompanyBuffId } from '@models/company-buff.model';

export interface EffectiveCharacterStats {
  effectiveMaxHp: number;
  effectiveDodge: number;
  hp50: number;
  hp25: number;
  hp10: number;
}

export interface EffectivePetStats {
  effectiveMaxHp: number;
  effectiveDodge: number;
}

export function getEffectiveCharacterStats(
  character: Character,
  activeBuff: CompanyBuffId,
): EffectiveCharacterStats {
  const baseMaxHp = Number(character.maxHp ?? 0);
  const baseDodge = Number(character.dodge ?? 0);

  const effectiveMaxHp = activeBuff === 'comforting-stew' ? baseMaxHp + 15 : baseMaxHp;
  const effectiveDodge =
    activeBuff === 'combat-rations'
      ? Math.min(baseDodge + 5, getCharacterDodgeCap(character))
      : baseDodge;

  return {
    effectiveMaxHp,
    effectiveDodge,
    hp50: Math.floor(effectiveMaxHp * 0.5),
    hp25: Math.floor(effectiveMaxHp * 0.25),
    hp10: Math.floor(effectiveMaxHp * 0.1),
  };
}

export function getEffectivePetStats(
  pet: Pet,
  activeBuff: CompanyBuffId,
): EffectivePetStats {
  const baseMaxHp = Number(pet.maxHp ?? 0);
  const baseDodge = Number(pet.dodge ?? 0);
  const dodgeCap = Number(pet.dodgeCap ?? baseDodge);

  return {
    effectiveMaxHp: activeBuff === 'comforting-stew' ? baseMaxHp + 15 : baseMaxHp,
    effectiveDodge:
      activeBuff === 'combat-rations' ? Math.min(baseDodge + 5, dodgeCap) : baseDodge,
  };
}

export function getBuffedPet(
  pet: Pet | null | undefined,
  activeBuff: CompanyBuffId,
): (Pet & EffectivePetStats) | null {
  if (!pet) {
    return null;
  }

  const stats = getEffectivePetStats(pet, activeBuff);

  return {
    ...pet,
    effectiveMaxHp: stats.effectiveMaxHp,
    effectiveDodge: stats.effectiveDodge,
  };
}

function getCharacterDodgeCap(character: Character): number {
  const explicitCap = Number((character as Character & { dodgeCap?: number }).dodgeCap ?? NaN);

  if (Number.isFinite(explicitCap)) {
    return explicitCap;
  }

  return Number(character.dodge ?? 0) + 5;
}
