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
  luckMax: number;

  hasShoulderPads: boolean;
  isActive: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
}


export interface CharacterListItem extends Character {
  classLabel: string;
  classProfileLabel: string | null;
}