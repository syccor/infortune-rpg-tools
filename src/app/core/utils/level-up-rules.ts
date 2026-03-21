export function getCharacterLevelChoiceType(level: number): 'standard' | 'special' {
  if ([5, 8, 10].includes(level)) {
    return 'special';
  }

  return 'standard';
}

export function getPetLevelChoiceType(level: number): 'standard' | 'special' {
  if (level === 5) {
    return 'special';
  }

  return 'standard';
}

export function petLevelGrantsAuthority(level: number): boolean {
  return level === 2 || level === 4;
}

export const CHARACTER_MAX_LEVEL = 10;
export const PET_MAX_LEVEL = 5;

export function getCharacterXpCostForNextLevel(currentLevel: number): number {
  if (currentLevel >= CHARACTER_MAX_LEVEL) {
    return Infinity;
  }

  return 100 + (currentLevel - 1) * 20;
}

export function getPetXpCostForNextLevel(currentLevel: number): number {
  switch (currentLevel) {
    case 1:
      return 100;
    case 2:
      return 140;
    case 3:
      return 160;
    case 4:
      return 180;
    default:
      return Infinity;
  }
}

export function resolveCharacterLevelProgression(
  currentLevel: number,
  currentXp: number,
): {
  newLevel: number;
  remainingXp: number;
  gainedLevels: number;
} {
  let level = currentLevel;
  let xp = currentXp;
  let gainedLevels = 0;

  while (level < CHARACTER_MAX_LEVEL) {
    const cost = getCharacterXpCostForNextLevel(level);

    if (xp < cost) {
      break;
    }

    xp -= cost;
    level += 1;
    gainedLevels += 1;
  }

  return {
    newLevel: level,
    remainingXp: xp,
    gainedLevels,
  };
}

export function resolvePetLevelProgression(
  currentLevel: number,
  currentXp: number,
): {
  newLevel: number;
  remainingXp: number;
  gainedLevels: number;
} {
  let level = currentLevel;
  let xp = currentXp;
  let gainedLevels = 0;

  while (level < PET_MAX_LEVEL) {
    const cost = getPetXpCostForNextLevel(level);

    if (xp < cost) {
      break;
    }

    xp -= cost;
    level += 1;
    gainedLevels += 1;
  }

  return {
    newLevel: level,
    remainingXp: xp,
    gainedLevels,
  };
}

export function isCharacterSpecialLevel(level: number): boolean {
  return [5, 8, 10].includes(level);
}

export function isPetSpecialLevel(level: number): boolean {
  return level === 5;
}