export type HealCapState = 'none' | 'cap50' | 'cap25';
export type CharacterStatus = 'draft' | 'active' | 'archived';

export interface Character {
  id?: string;
  name: string;
  surname?: string;

  raceId: string;
  classId: string;
  classProfiles: string | null;

  gradeId: string;

  weightClassId: string;
  musculatureClassId: string;
  sizeClassId: string;

  armorTypeId: string;
  shieldTypeId: string | null;

  hasPet: boolean;
  pet?: Pet | null;
  mystique: boolean;
  lvl: number;
  xp: number;
  ressource: number;

  maxHp: number;
  currentHp: number;

  armor: number;
  dodge: number;
  agility: number;
  perception: number;

  luckpoint: number;

  hasShoulderPads: boolean;
  isActive: boolean;

  healCapState?: HealCapState;
  
  isDead?: boolean | null;

  status: CharacterStatus;
  lastDailyRegenAt?: string | null;

  ownerUid?: string;
  ownerEmail?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Pet {
  name: string;
  speciesId: string;
  classId: string;
  level: number;

  maxHp: number;
  currentHp: number;
  armor: number;
  dodge: number;
  attack: number;
  dodgeCap: number;
  armorCap: number;

  isDead?: boolean;
  lastDailyRegenAt?: string | null;
}

export interface CharacterListItem extends Character {
  classLabel: string;
  classProfileLabel: string | null;
}
