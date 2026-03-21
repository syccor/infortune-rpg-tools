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
  ressource: number;

  lvl: number;
  xp: number;

  pendingLevelChoices?: number;
  levelChoicesHistory?: CharacterLevelChoice[];

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
  xp: number;
  
  maxHp: number;
  currentHp: number;
  armor: number;
  dodge: number;
  attack: number;
  dodgeCap: number;
  armorCap: number;
  authorityPoints?: number;
  pendingLevelChoices?: number;
  levelChoicesHistory?: PetLevelChoice[];
  
  healCapState?: 'none' | 'cap50' | 'cap25';
  isDead?: boolean;
  lastDailyRegenAt?: string | null;
}

export interface CharacterListItem extends Character {
  classLabel: string;
  classProfileLabel: string | null;
  petSpeciesLabel: string | null;
  petClassLabel: string | null;
}

export interface CharacterLevelChoice {
  level: number;
  type:
    | 'armor'
    | 'hp'
    | 'dodge'
    | 'perception'
    | 'attack'
    | 'resource'
    | 'luck'
    | 'technique';
  value?: number;
  attackMode?: 'melee' | 'ranged';
  resourceAmount?: number;
  validatedAt?: unknown;
}

export interface PetLevelChoice {
  level: number;
  type: 'armor' | 'hp' | 'dodge' | 'attack' | 'special';
  value?: number;
  grantsAuthority?: boolean;
  validatedAt?: unknown;
}
